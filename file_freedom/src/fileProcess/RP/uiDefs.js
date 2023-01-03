const utils = require("../../utils.js");

function uiDefs(fileContent, filePath) {
    const newFileContent = fileContent

    for (let ui of fileContent.ui_defs) {
        ui = "ui/" + utils.resolvePath(filePath, ui)
    }
    return newFileContent

}

module.exports = uiDefs