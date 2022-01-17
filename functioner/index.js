const fs = require("fs")
const glob = require("glob");

let scoreboardCount = 0
let tagCount = 0

const tickJson = fs.existsSync("BP/functions/tick.json") ? JSON.parse(fs.readFileSync("BP/functions/tick.json")) : { "values": [] }

function newScoreboard() {
    scoreboardCount += 1
    return (`F_${scoreboardCount}`)
}

function newTag() {
    tagCount += 1
    return (`F_${tagCount}`)
}

function blockFormat(input) {
    if (input.match(/\[(.*)\]/g)) {
        const plainBlock = input.replace(/\[(.*)\]/g, "")
        if (input.match(/\[[0-9]+\]/g)) {
            return [plainBlock, input.match(/\[[0-9]+\]/g)[0].replace(/\[|\]/g, "")]
        } else {
            return [input.match(/\[(.*)\]/g)[0]]
        }
    } else {
        return [input, -1]
    }
}

function combineUnusedArgs(topArgNum, input) {
    const newArgs = []
    for (let step = topArgNum; step < input.length; step++) {
        newArgs.push(input[step])
    }
    return newArgs.join(" ")
}

function makeModifications(modifications, fileContentArray) {
    for (mods of modifications.reverse()) {
        for (mod of mods.modifications.reverse()) {
            fileContentArray.splice(mods.line, 0, mod)
        }
    }
}

fs.mkdirSync("BP/functions/functioner/");

let files = glob.sync("BP/functions/**/*.mcfunction")
function refresh() { files = glob.sync("BP/functions/**/*.mcfunction") }

// extracted functions
fs.mkdirSync("BP/functions/functioner/extracted/");

let currentFileNum = 0

for (file of files) {
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
            push(line)
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
                    currentFile[lineNum - 1] = currentFile[lineNum - 1].substring(currentFile[lineNum - 1].length - 1, 0) + `function functioner/extracted/${currentFileNum}-${fileNum}`
                    currentFile.splice(lineNum, 1)
                    splitFileArray.push(line)
                    editsMade = true
                    break
                }
                if (line == "}") {
                    currentFile.splice(lineNum, 1)
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

refresh()

// wait command
const timers = []
let timersUsed = false
for (file of files) {
    const fileContent = fs.readFileSync(file).toString().replace(/ +/gm, " ")
    const fileContentArray = fileContent.replace(/\r/g, "").split("\n")
    const modifications = []
    for (line in fileContentArray) {
        const lineContent = fileContentArray[line]
        if (lineContent[0] == "#") continue
        fileContentArray[line] = lineContent.replace(/\b((wait) (start|end)).*\b/g, function (x, y) {
            timersUsed = true
            const args = fileContentArray[line].split(" ")
            if (args[1] == "start") {
                const snippedTime = args[2].substring(0, args[2].length - 1)
                const givenTime = args[2][args[2].length - 1]
                const executorTag = newTag()
                time = 0
                if (givenTime == "d") {
                    time = 24000 * snippedTime
                } else if (givenTime == "s") {
                    time = 20 * snippedTime
                } else if (givenTime == "t") {
                    time = snippedTime
                } else if (givenTime.match(/[0-9]/)) {
                    time = args[2]
                }
                modifications.push({
                    "line": line,
                    "modifications": [
                        `scoreboard objectives add W_${args[3]} dummy`,
                        `scoreboard players set time_left W_${args[3]} ${time}`
                    ]
                })
                timers.push([`W_${args[3]}`, executorTag, combineUnusedArgs(4, args)])
                return `tag @s add ${executorTag}`
            } else if (args[1] == "end") {
                return `scoreboard objectives remove W_${args[2]}`
            }
        })
    }
    makeModifications(modifications, fileContentArray)
    fs.writeFileSync(file, fileContentArray.join("\n"))
}
if (timersUsed) {
    const timerFunctionArray = []
    for (timer of timers) {
        timerFunctionArray.push(`scoreboard players remove time_left ${timer[0]} 1`)
        timerFunctionArray.push(`scoreboard players operation @e[tag=${timer[1]}] ${timer[0]} = time_left ${timer[0]}`)
        timerFunctionArray.push(`execute @e[tag=${timer[1]}, scores={${timer[0]}=0}] ~ ~ ~ ${timer[2]}`)
    }
    fs.writeFileSync("BP/functions/functioner/timers.mcfunction", timerFunctionArray.join("\n"))
    tickJson.values.push("functioner/timers")
}

fs.writeFileSync("BP/functions/tick.json", JSON.stringify(tickJson))

refresh()

let whileFuncCount = 0

fs.mkdirSync("BP/functions/functioner/while/");
// while command
for (file of files) {
    const fileContent = fs.readFileSync(file).toString().replace(/ +/gm, " ")
    const fileContentArray = fileContent.replace(/\r/g, "").split("\n")
    for (line in fileContentArray) {
        const lineContent = fileContentArray[line]
        const args = fileContentArray[line].split(" ")
        if (lineContent[0] == "#") continue
        fileContentArray[line] = lineContent.replace(/while (.*) (.*) .*/g, function (x, y) {
            const newFuncContent = [
                combineUnusedArgs(3, args),
                `if score value ${args[1]} ${args[2]} function functioner/while/output${whileFuncCount}`
            ]
            fs.writeFileSync(`BP/functions/functioner/while/output${whileFuncCount}.mcfunction`, newFuncContent.join("\n"))
            return `function functioner/while/output${whileFuncCount}`;
        })
    }
    fs.writeFileSync(file, fileContentArray.join("\n"))
}

refresh()

// if/unless command
for (file of files) {
    const fileContent = fs.readFileSync(file).toString().replace(/ +/gm, " ").replace(/~~~/gm, "~ ~ ~")
    const fileContentArray = fileContent.replace(/\r/g, "").split("\n")
    const modifications = []
    for (line in fileContentArray) {
        const lineContent = fileContentArray[line]
        if (lineContent[0] == "#") continue
        fileContentArray[line] = lineContent.replace(/\b((if|unless) (block|entity|score)).*\b/g, function (x, y) {
            const args = x.split(" ")
            const resultScoreboardName = newScoreboard()
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
                unusedArgs = combineUnusedArgs(6, args)
                modifications.push({
                    "line": line,
                    "modifications": [
                        `execute @s ~ ~ ~ detect ${blockFormat(args[5])[0]} ${blockFormat(args[5])[1]} ${scoreboardResult}`
                    ]
                })
            } else if (args[1] == "score") {
                unusedArgs = combineUnusedArgs(5, args)
                const scoreboardName = newScoreboard()
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
                unusedArgs = combineUnusedArgs(3, args)
                const scoreboardName = newScoreboard()
                modifications.push({
                    "line": line,
                    "modifications": [
                        `scoreboard objectives add ${scoreboardName} dummy`,
                        `scoreboard players set count ${scoreboardName} 0`,
                        `execute ${args[2]} ~ ~ ~ scoreboard players add count ${scoreboardName} 1`,
                        `scoreboard players operation @s ${scoreboardName} = count ${scoreboardName}`,
                        `execute @s[scores={${scoreboardName}=1..}}] ~ ~ ~ ${scoreboardResult}`
                    ]
                })
            }
            return `execute @s[scores={${resultScoreboardName}=${wantedResult}}] ~ ~ ~ ${unusedArgs}`
        })
    }
    makeModifications(modifications, fileContentArray)
    fs.writeFileSync(file, fileContentArray.join("\n"))
}

// variable command
for (file of files) {
    const fileContent = fs.readFileSync(file).toString().replace(/ +/gm, " ").replace(/~~~/gm, "~ ~ ~")
    const fileContentArray = fileContent.replace(/\r/g, "").split("\n")
    const modifications = []
    for (line in fileContentArray) {
        const lineContent = fileContentArray[line]
        if (lineContent[0] == "#") continue
        fileContentArray[line] = lineContent.replace(/(var (.*) (.*) (.*))|var (.*) (.*)/g, function (x, y) {
            const args = x.split(" ")
            modifications.push({
                "line": line,
                "modifications": [
                    `scoreboard objectives add ${args[1]} dummy ${args[1]}`
                ]
            })
            if (args[2] == "=") {
                return `scoreboard players set value ${args[1]} ${args[3]}`
            } else if (args[2] == "++") {
                return `scoreboard players add value ${args[1]} 1`
            } else if (args[2] == "--") {
                return `scoreboard players remove value ${args[1]} 1`
            } else if (args[2] == "+=") {
                return `scoreboard players add value ${args[1]} ${args[3]}`
            } else if (args[2] == "-=") {
                return `scoreboard players remove value ${args[1]} ${args[3]}`
            } else if (args[2] == "*=") {
                modifications.push({
                    "line": line - 1,
                    "modifications": [
                        `scoreboard objectives add F_number dummy F_number`,
                        `scoreboard players set value F_number ${args[3]}`
                    ]
                })
                return `scoreboard players operation value ${args[1]} *= value F_number`
            } else if (args[2] == "/=") {
                modifications.push({
                    "line": line - 1,
                    "modifications": [
                        `scoreboard objectives add F_number dummy F_number`,
                        `scoreboard players set value F_number ${args[3]}`
                    ]
                })
                return `scoreboard players operation value ${args[1]} /= value F_number`
            } else if (args[2] == "%=") {
                modifications.push({
                    "line": line - 1,
                    "modifications": [
                        `scoreboard objectives add F_number dummy F_number`,
                        `scoreboard players set value F_number ${args[3]}`
                    ]
                })
                return `scoreboard players operation value ${args[1]} %= value F_number`
            } else if (args[2] == "DEL") {
                return `scoreboard objectives remove ${args[1]}`
            }
            return `say [Functioner] an error has occured (#1)`
        })
    }
    makeModifications(modifications, fileContentArray)
    fs.writeFileSync(file, fileContentArray.join("\n"))
}