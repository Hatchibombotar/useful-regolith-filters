const fs = require("fs")
const path = require("path")

function generate(ast, filePath) {
    const newLines = []
    for (const commandAst of ast.children) {
        if (commandAst.type == "comment") continue
        let command = []

        const loopTriggered = commandAst.args.at(0) == "execute" && commandAst.args.at(-1) == "repeat"
        
        for (const argument of commandAst.args) {
            if (loopTriggered && argument == "repeat") {
                command.push(`run function ${filePathToFunctionPath(filePath)}`)
            } else if (typeof argument == "string") {
                command.push(argument)
            } else if (argument.type == "subfunction") {
                const { dir, name, ext } = path.parse(filePath)
                const functionName = name + "-" + commandAst.line
                const newPath = path.join(dir, functionName + ext)
                const functionPath = filePathToFunctionPath(newPath)

                generate(argument, newPath)

                command.push("function " + functionPath)
            }
        }
        newLines.push(command.join(" "))
    }
    const fileContent = newLines.join("\n")
    fs.writeFileSync(filePath, fileContent)
}

const joinPaths = (...paths) => {
    const newPaths = paths.filter((path) => path != "")
    return newPaths.join("/")
}

function filePathToFunctionPath(filePath) {
    const { dir, name, ext } = path.parse(filePath)

    return joinPaths(path.relative("BP/functions", dir).replace(/\\/g, "/"), name)
}

module.exports = {
    generate,
    filePathToFunctionPath
}