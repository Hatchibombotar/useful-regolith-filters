const fs = require("fs")
const glob = require("glob");

const utils = require("./utils.js");

const tickJSON = fs.existsSync("BP/functions/tick.json") ? JSON.parse(fs.readFileSync("BP/functions/tick.json")) : { "values": [] }
const intervalsJSON = fs.existsSync("BP/functions/intervals.json") ? JSON.parse(fs.readFileSync("BP/functions/intervals.json")) : { "intervals": {} }

!fs.existsSync("BP/functions/") ? fs.mkdirSync("BP/functions/") : null
!fs.existsSync("BP/functions/functioner/") ? fs.mkdirSync("BP/functions/functioner/") : null

// extracted functions
!fs.existsSync("BP/functions/functioner/extracted/") ? fs.mkdirSync("BP/functions/functioner/extracted/") : null

let currentFileNum = 0

for (file of utils.getAllFunctions()) {
    const fileContent = fs.readFileSync(file).toString()
    const fileContentArray = fileContent.replace(/\r/g, "").replace(/^(\t| )*/gm, "").split("\n")
    const newFile = []
    const currentFunctionLoc = []

    function push(item) {
        eval(`newFile${currentFunctionLoc.join("")}.push(item)`)
    }

    for (const linenum in fileContentArray) {
        const path = eval(`newFile${currentFunctionLoc.join("")}`)
        const line = fileContentArray[linenum]
        if (line.substr(line.length - 1, 1) == "{") {
            push(line)
            push([])
            currentFunctionLoc.push(`[${path.length - 1}]`)
        } else if (line.substr(0, 1) == "}") {
            currentFunctionLoc.pop()
        } else if (typeof path[path.length - 1] == "object") {
            push(line)
        } else {
            push(line)
        }
    }

    const splitFileArray = [newFile]

    let editsMade = true
    while (editsMade) {
        editsMade = false
        for (const fileNum in splitFileArray) {
            const currentFile = splitFileArray[fileNum]
            for (const lineNum in currentFile) {
                line = currentFile[lineNum]
                if (typeof line == "object") {
                    currentFile[lineNum - 1] = currentFile[lineNum - 1].substring(currentFile[lineNum - 1].length - 1, 0) + `function functioner/extracted/${currentFileNum}-${splitFileArray.length - 1}`
                    currentFile.splice(lineNum, 1)
                    splitFileArray.push(line)
                    editsMade = true
                    break
                }
            }
        }
    }

    fs.writeFileSync(file, splitFileArray[0].join("\n"))
    splitFileArray.splice(0, 1)

    for (const f in splitFileArray) {
        const fcontent = splitFileArray[f]
        fs.writeFileSync(`BP/functions/functioner/extracted/${currentFileNum}-${f}.mcfunction`, fcontent.join("\n"))
    }

    currentFileNum += 1

}


!fs.existsSync("BP/functions/functioner/intervals/") ? fs.mkdirSync("BP/functions/functioner/intervals/") : null
// Tick Intervals
const usedIntervals = Object.keys(intervalsJSON.intervals)
const tickCommandData = []
for (interval of usedIntervals) {
    const intervalTime = utils.timeFormat(interval)
    const operationRunnerTag = utils.newTag()

    const tickerScore = utils.newScoreboard()
    const onEndFunctions = []
    for (const f of intervalsJSON.intervals[interval]) onEndFunctions.push("function " + f)
    onEndFunctions.push(`scoreboard players set value ${tickerScore} 0`)
    const intervalOnEnd = utils.createFunction(`functioner/intervals/${interval}`, onEndFunctions)
    tickCommandData.push(
        `scoreboard players add value ${tickerScore} 1`,
        `tag @e[c=1] add ${operationRunnerTag}`,

        `scoreboard players operation @e[tag=${operationRunnerTag}] ${tickerScore} = value ${tickerScore}`,
        `execute @e[tag=${operationRunnerTag}, scores={${tickerScore}=${intervalTime}..}] ~ ~ ~ function ${intervalOnEnd}`,
        `tag @e remove ${operationRunnerTag}`,
    )
}

if (usedIntervals.length > 0) {
    fs.writeFileSync("BP/functions/functioner/intervals.mcfunction", tickCommandData.join("\n"))
    tickJSON.values.push("functioner/intervals")
}

commands = {
    commands: [],
    registerCommand: function (name, commandData) {
        this.commands.push(
            {
                name: name,
                used: false,
                pattern: commandData.pattern ?? console.error("No pattern has been defined for command " + name),
                initialisation: commandData.initialisation ?? function () { },
                callback: commandData.callback ?? function () { },
                finalisation: commandData.finalisation ?? function () { },
                storage: {}
            }
        );
    }
}

function runCommand(commandData) {
    commandData.initialisation()

    for (file of utils.getAllFunctions()) {
        const fileContent = fs.readFileSync(file).toString().replace(/ +/gm, " ").replace(/~~~/gm, "~ ~ ~")
        const fileContentArray = fileContent.replace(/\r/g, "").split("\n")
        const modifications = []

        for (const line in fileContentArray) {
            const lineContent = fileContentArray[line]
            if (lineContent[0] == "#") continue // Skip comments
            fileContentArray[line] = lineContent.replace(commandData.pattern, function (x, y) {
                commandData.used = true

                const args = utils.getCommandArgs(x)
                const result = commandData.callback(
                    args,
                    modifications,
                    line,
                    function (error) {
                        console.error(`Error in command type: ${commandData.name}, File: ${file}, Line: ${line} \n${error}\n`)
                    }
                )
                return result
            })
        }
        utils.makeModifications(modifications, fileContentArray)
        fs.writeFileSync(file, fileContentArray.join("\n"))
    }

    if (commandData.used) commandData.finalisation()
}

commands.registerCommand('ucall', {
    pattern: /ucall (.*)/g,
    callback: function (args, modifications, line, error) {
        return `execute @s ~ ~ ~ wait start 1t ${utils.newScoreboard()} ${utils.combineUnusedArgs(1, args)}`
    }
})

commands.registerCommand('wait', {
    pattern: /wait .*/g,
    initialisation: function () {
        this.storage.timers = []
        this.storage.timerIDs = []
    },
    callback: function (args, modifications, line) {
        if (args[1] == "start") {
            const executorTag = utils.newTag()
            const time = utils.timeFormat(args[2])
            modifications.push({
                "line": line,
                "modifications": [
                    `scoreboard objectives add W_${args[3]} dummy`,
                    `scoreboard players set time_left W_${args[3]} ${time}`
                ]
            })
            this.storage.timers.push([`W_${args[3]}`, executorTag, utils.combineUnusedArgs(4, args)])
            this.storage.timerIDs.push(args[3])
            return `tag @s add ${executorTag}`

        } else if (args[1] == "end") {
            return `scoreboard objectives remove W_${args[2]}`
        }
    },
    finalisation: function () {
        const timerFunctionArray = []
        for (timer of this.storage.timers) {
            timerFunctionArray.push(`scoreboard players remove time_left ${timer[0]} 1`)
            timerFunctionArray.push(`scoreboard players operation @e[tag=${timer[1]}] ${timer[0]} = time_left ${timer[0]}`)
            timerFunctionArray.push(`execute @e[tag=${timer[1]}, scores={${timer[0]}=0}] ~ ~ ~ ${timer[2]}`)
        }
        fs.writeFileSync("BP/functions/functioner/timers.mcfunction", timerFunctionArray.join("\n"))
        tickJSON.values.push("functioner/timers")

        if (utils.findDuplicates(this.storage.timerIDs).length > 0) {
            console.warn("Duplicate timer IDs found: " + utils.findDuplicates(this.storage.timerIDs))
        }
    }
})

commands.registerCommand('while', {
    pattern: /while .*/g,
    initialisation: function () {
        this.storage.count = []
        fs.mkdirSync("BP/functions/functioner/while/");
    },
    callback: function (args, modifications) {
        const whileFuncCount = this.storage.count // work out what this does and fix it
        const newFuncContent = [
            utils.combineUnusedArgs(4, args),
            `if score ${args[1]} ${args[2]} ${args[3]} function functioner/while/output${whileFuncCount}`
        ]

        fs.writeFileSync(`BP/functions/functioner/while/output${whileFuncCount}.mcfunction`, newFuncContent.join("\n"))
        return `function functioner/while/output${whileFuncCount}`;
    }
})

commands.registerCommand('if/unless', {
    pattern: /(if|unless) .*/g,
    callback: function (args, modifications, line) {
        const resultScoreboardName = utils.newScoreboard()
        const scoreboardResult = `scoreboard players set @s ${resultScoreboardName} 1`
        let unusedArgs = ""
        let wantedResult = ""
        if (args[0] == "if") wantedResult = 1
        if (args[0] == "unless") wantedResult = 0

        modifications.push({
            "line": line,
            "modifications": [
                `scoreboard objectives add ${resultScoreboardName} dummy`,
                `scoreboard players set @s ${resultScoreboardName} 0`
            ]
        })

        if (args[1] == "block") {
            unusedArgs = utils.combineUnusedArgs(6, args)
            modifications.push({
                "line": line,
                "modifications": [
                    `execute @s ~ ~ ~ detect ${args[2]} ${args[3]} ${args[4]} ${utils.blockFormat(args[5])[0]} ${utils.blockFormat(args[5])[1]} ${scoreboardResult}`
                ]
            })
        } else if (args[1] == "score") {
            unusedArgs = utils.combineUnusedArgs(5, args)
            const scoreboardName = utils.newScoreboard()
            modifications.push({
                "line": line,
                "modifications": [
                    `scoreboard objectives add ${scoreboardName} dummy`,
                    `scoreboard objectives add ${args[3]} dummy`,
                    `scoreboard players operation @s ${scoreboardName} = ${args[2]} ${args[3]}`,
                    `execute @s[scores={${scoreboardName}=${args[4]}}] ~ ~ ~ ${scoreboardResult}`
                ]
            })
        } else if (args[1] == "entity") {
            unusedArgs = utils.combineUnusedArgs(3, args)
            const scoreboardName = utils.newScoreboard()
            modifications.push({
                "line": line,
                "modifications": [
                    `scoreboard objectives add ${scoreboardName} dummy`,
                    `scoreboard players set count ${scoreboardName} 0`,
                    `execute ${args[2]} ~ ~ ~ scoreboard players add count ${scoreboardName} 1`,
                    `scoreboard players operation @s ${scoreboardName} = count ${scoreboardName}`,
                    `execute @s[scores={${scoreboardName}=1..}] ~ ~ ~ ${scoreboardResult}`
                ]
            })
        }
        return `execute @s[scores={${resultScoreboardName}=${wantedResult}}] ~ ~ ~ ${unusedArgs}`
    }
})

commands.registerCommand('var', {
    pattern: /var (.*)/g,
    callback: function (args, modifications, line, error) {

        let targetPlayer = args[1]
        let targetScoreboard = args[2]

        const operator = args[3]
        const value = args[4] ?? ""

        let sourcePlayer = args[4]
        let sourceScoreboard = args[5]
        if (value && value.match(/[0-9]+/)[0].length == value.length) { // If the value is a number
            modifications.push({
                "line": line,
                "modifications": [
                    `scoreboard objectives add F_number dummy F_number`,
                    `scoreboard players set @s F_number ${args[4]}`
                ]
            })
            sourceScoreboard = "F_number"
            sourcePlayer = "@s"
        }


        switch (operator) { // change to use objects?
            case "=":
                modifications.push({
                    "line": line,
                    "modifications": [
                        `scoreboard objectives add ${targetScoreboard} dummy ${targetScoreboard}`
                    ]
                })

                return `scoreboard players operation ${targetPlayer} ${targetScoreboard} = ${sourcePlayer} ${sourceScoreboard}`
            case "+=":
                return `scoreboard players operation ${targetPlayer} ${targetScoreboard} += ${sourcePlayer} ${sourceScoreboard}`
            case "-=":
                return `scoreboard players operation ${targetPlayer} ${targetScoreboard} -= ${sourcePlayer} ${sourceScoreboard}`
            case "*=":
                return `scoreboard players operation ${targetPlayer} ${targetScoreboard} *= ${sourcePlayer} ${sourceScoreboard}`
            case "/=":
                return `scoreboard players operation ${targetPlayer} ${targetScoreboard} /= ${sourcePlayer} ${sourceScoreboard}`
            case "%=":
                return `scoreboard players operation ${targetPlayer} ${targetScoreboard} %= ${sourcePlayer} ${sourceScoreboard}`
            case "<":
                return `scoreboard players operation ${targetPlayer} ${targetScoreboard} < ${sourcePlayer} ${sourceScoreboard}`
            case ">":
                return `scoreboard players operation ${targetPlayer} ${targetScoreboard} > ${sourcePlayer} ${sourceScoreboard}`
            case "><":
                return `scoreboard players operation ${targetPlayer} ${targetScoreboard} >< ${sourcePlayer} ${sourceScoreboard}`
            case "++":
                return `scoreboard players add ${targetPlayer} ${targetScoreboard} 1`
            case "--":
                return `scoreboard players remove ${targetPlayer} ${targetScoreboard} 1`
            default:
                error("Invalid operator used: " + args[3])
        }
    }
})

for (const command of commands.commands) {
    runCommand(command)
}

fs.writeFileSync("BP/functions/tick.json", JSON.stringify(tickJSON, null, 2))