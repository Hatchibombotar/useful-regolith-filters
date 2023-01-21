const ROOT_DIR = process.env.ROOT_DIR

const settings = require("./settings")

const JSONC = require("jsonc").safe
const fs = require("fs")

function toSnakeCase(string) {
    return string.toLowerCase().replace(/ /g, "_")
}

function getWorldPath(projectJSON, type) {
    const worldTemplates = projectJSON.packs?.worldTemplate
    const worldsArray = projectJSON.worlds ?? []
    const configuredWorld = type ?? 0

    let worldPath;
    if (typeof configuredWorld == "number") {
        // index of worlds array
        if (worldsArray.length < 1) {
            console.error("Worlds array is undefined.")
            return process.exit(1)
        }
        worldPath = worldsArray[configuredWorld]
    } else if (configuredWorld == "worldTemplate") {
        // world templates
        worldPath = worldTemplates
    } else {
        // interpret as exact path
        worldPath = configuredWorld
    }
    return worldPath
}

function JSONCFindAndParse(path) {
    const fileExists = fs.existsSync(path)
    if (!fileExists) {
        console.error("File Missing:", path)
        return process.exit(1)
    }

    const rawData = String(fs.readFileSync(path))

    const [parseError, parsedJSON] = JSONC.parse(rawData)
    if (parseError) {
        console.error(`Failed to parse JSON in ${path}`)
        console.error(parseError)
        return process.exit(1)
    }

    return parsedJSON
}

module.exports = {
    toSnakeCase,
    JSONCFindAndParse,
    getWorldPath
}