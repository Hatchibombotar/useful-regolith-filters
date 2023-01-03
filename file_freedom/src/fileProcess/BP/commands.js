const utils = require("../../utils.js");

function processCommand(command, filePath) {
    const args = utils.commandArgs(command)

    for (const i in args) {
        if (args[i - 1] == "function") {
            args[i] = utils.resolvePath(filePath, args[i])
        }
    }

    return args.join(" ")
}

module.exports = processCommand