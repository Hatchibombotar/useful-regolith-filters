const utils = require("../../utils.js");

function terrainTextures(fileContent, filePath) {
    const newFileContent = fileContent

    for (const blockName in newFileContent.texture_data) {
        let block = newFileContent.texture_data[blockName]
        if (block.textures instanceof Array) {
            for (let texture of block.textures) {
                if (texture instanceof Object) {
                    texture.path = "textures/" + utils.resolvePath(filePath, texture.path)
                } else {
                    texture = "textures/" + utils.resolvePath(filePath, texture)
                }
            }
        } else if (block.textures instanceof Object) {
            block.textures.path = "textures/" + utils.resolvePath(filePath, block.textures.path)

        } else {
            block.textures = "textures/" + utils.resolvePath(filePath, block.textures)
        }   
    }
    return newFileContent
}

module.exports = terrainTextures