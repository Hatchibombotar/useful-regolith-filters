const fs = require("fs")
const glob = require("glob");

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

// global scores
fs.mkdirSync("BP/functions/functioner/gops/");

let gloFuncCount = 0
glob("BP/functions/**/*.mcfunction", null, function (err, files) {
    for (file of files) {
        const fileContent = fs.readFileSync(file).toString()
        const fileContentArray = fileContent.replace(/\r/g, "").split("\n")
        fileContentArray.splice(0, 0, "#")
        const modifications = []
        for (line in fileContentArray) {
            const lineContent = fileContentArray[line]
            
            console.log(line, fileContentArray)
            if (lineContent.match("gscores") != null) {
                lineContent.replace(/gscores={(.*)}/g, function (x, y) {
                    const boards = y.split(",")
                    const boardops = []
                    let preCommands;
                    
                    for (board of boards) {
                        const boardName = board.split("=")[0].replace(" ", "")
                        const boardData = board.split("=")[1].replace(" ", "")
                        preCommands = [
                            `scoreboard objectives add ${boardName} dummy`,
                            `scoreboard players add global ${boardName} 0`,
                            `scoreboard objectives add g_${boardName} dummy`,
                            `scoreboard players add global g_${boardName} 0`,
                            `scoreboard players operation @s g_${boardName} = global thing`
                        ]
                        boardops.push(`g_${boardName}=${boardData}`)
                    }
                    gloFuncCount += 1
                    fs.writeFileSync(`BP/functions/functioner/gops/${gloFuncCount}.mcfunction`, preCommands.join("\n"))
                    modifications.push([ line-1, gloFuncCount])
                    return `scores={${boardops}}`
                })

            }
        }
        for (mod of modifications) {
            fileContentArray.splice(mod[0], 0, `function functioner/gops/${mod[1]}.mcfunction`)
        }
        fileContentArray.splice(0,1)
        fs.writeFileSync(file, fileContentArray.join("\n"))
    }
})