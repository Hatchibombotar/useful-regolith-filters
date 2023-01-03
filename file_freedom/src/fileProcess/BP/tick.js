const utils = require("../../utils.js");

function tick(fileContent, filePath) {
    const newFileContent = fileContent

    for (const path of newFileContent.values) {
        path = utils.resolvePath(filePath, path)
    }

    return newFileContent
}


module.exports = tick