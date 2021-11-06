const fs = require("fs")
const glob = require("glob");

let scoreboardCount = 0
let tagCount = 0

function newScoreboard() {
    scoreboardCount += 1
    return (`f_${scoreboardCount}`)
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

fs.mkdirSync("BP/functions/functioner/");

// extracted functions
fs.mkdirSync("BP/functions/functioner/extracted/");

let extFuncCount = 0
glob("BP/functions/**/*.mcfunction", null, function (err, files) {
    for (file of files) {
        const fileContent = fs.readFileSync(file).toString()
        const newFileContent = fileContent.replace(/\{\r[^\}[]*}/gm, function (x) {
            extFuncCount += 1
            const newFuncContent = x.slice(1, -1).replace(/^ +/gm, "")
            fs.writeFileSync(`BP/functions/functioner/extracted/output${extFuncCount}.mcfunction`, newFuncContent)
            return `function functioner/extracted/output${extFuncCount}`;
        });
        fs.writeFileSync(file, newFileContent)
    }
})

// if/unless command
fs.mkdirSync("BP/functions/functioner/gops/");

glob("BP/functions/**/*.mcfunction", null, function (err, files) {
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
                const scoreboardResult = `scoreboard players set result ${resultScoreboardName} 1`
                let unusedArgs = ""
                let wantedResult = ""
                if (args[0] == "if") wantedResult = 1
                if (args[0] == "unless") wantedResult = 0

                modifications.push({
                    "line": line,
                    "modifications": [
                        `scoreboard objectives add ${resultScoreboardName} dummy`
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
        for (mods of modifications.reverse()) {
            console.log(fileContentArray)
            for (mod of mods.modifications.reverse()) {
                fileContentArray.splice(mods.line, 0, mod)
            }
        }
        console.log(fileContentArray)
        fs.writeFileSync(file, fileContentArray.join("\n"))
    }
})