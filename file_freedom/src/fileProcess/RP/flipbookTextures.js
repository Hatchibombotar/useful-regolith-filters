const utils = require("../../utils.js");

function flipbookTextures(fileContent, filePath) {
    const newFileContent = fileContent

    for (let flipbook of newFileContent) {
        flipbook.flipbook_texture = "textures/" + utils.resolvePath(filePath, flipbook.flipbook_texture)
    }

    return newFileContent
}

module.exports = flipbookTextures