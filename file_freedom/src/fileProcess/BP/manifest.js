const utils = require("../../utils.js");

function manifestBP(fileContent, filePath) {
    const newFileContent = fileContent

    for (const i in newFileContent.modules) {
        if (!newFileContent.modules[i].entry) continue

        newFileContent.modules[i].entry = utils.resolvePath(filePath, newFileContent.modules[i].entry)
    }

    return newFileContent

}

module.exports = manifestBP