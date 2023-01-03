module.exports = {
    BP: {
        manifest: require("./BP/manifest.js"),
        tick: require("./BP/tick.js"),
        componentObject: require("./BP/componentObject.js")
    },
    RP: {
        flipbookTextures: require("./RP/flipbookTextures.js"),
        soundDefinitions: require("./RP/soundDefinitions.js"),
        terrainTextures: require("./RP/terrainTextures.js"),
        uiDefs: require("./RP/uiDefs.js"),
    },
}