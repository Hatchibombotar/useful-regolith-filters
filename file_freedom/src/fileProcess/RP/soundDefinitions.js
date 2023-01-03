const utils = require("../../utils.js");

function soundDefinitions(fileContent, filePath) {
    const newFileContent = fileContent

    for (const soundSet in newFileContent.sound_definitions) {
        for (const sound in newFileContent.sound_definitions[soundSet].sounds) {
            if (typeof newFileContent.sound_definitions[soundSet].sounds[sound] == "object") {
                newFileContent.sound_definitions[soundSet].sounds[sound].name = "sounds/" + utils.resolvePath(filePath, fileContent.sound_definitions[soundSet].sounds[sound].name)
            } else {
                newFileContent.sound_definitions[soundSet].sounds[sound] = "sounds/" + utils.resolvePath(filePath, fileContent.sound_definitions[soundSet].sounds[sound])
            }
        }
    }

    return newFileContent
}

module.exports = soundDefinitions