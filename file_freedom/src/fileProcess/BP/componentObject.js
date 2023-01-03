const processCommand = require("./commands.js")

function componentObject(fileContent, filePath, parentName) {
    const newFileContent = fileContent

    for (const eventName in newFileContent[parentName].events) {
        let event = newFileContent[parentName].events[eventName]
        for (const eventType in event) {
            if (eventType == "run_command") {
                for (let command in event[eventType].command) {
                    command = processCommand(command, filePath)
                }
            }
        }
    }

    return newFileContent
}

module.exports = componentObject