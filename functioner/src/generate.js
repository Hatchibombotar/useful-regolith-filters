const fs = require("fs")
const path = require("path")

function generate(ast, filePath) {
    const newLines = []
    for (const commandAst of ast.children) {
        if (commandAst.type == "comment") continue
        let command = []
        for (const argument of commandAst.args) {
            if (typeof argument == "string") {
                command.push(argument)
            } else if (argument.type == "subfunction") {
                const {dir, name, ext} = path.parse(filePath)
                const functionName = name + "-" + commandAst.line
                const joinPaths = (...paths) => {
                    const newPaths = paths.filter((path) => path != "")
                    return newPaths.join("/")
                }
                const functionPath = joinPaths(path.relative("BP/functions", dir).replace(/\\/g, "/"), functionName)

                const newPath = path.join(dir, functionName + ext)
                generate(argument, newPath)

                command.push("function " + functionPath)
            }
        }
        newLines.push(command.join(" "))
    }
    const fileContent = newLines.join("\n")
    fs.writeFileSync(filePath, fileContent)
}

module.exports = {
    generate
}