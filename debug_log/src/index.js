const fs = require("fs")
const glob = require("glob")
const JSONC = require("jsonc").safe

const processEntity = require("./files/entityBP")

for (const filePath of glob.sync("BP/entities/**/*.json")) {
    if (fs.lstatSync(filePath).isDirectory()) continue
    const [parseError, fileContent] = JSONC.parse(String(fs.readFileSync(filePath)))
    if (parseError) {
        console.error(`Failed to parse JSON in ${filePath}`)
        break
    }

    if (!("minecraft:entity" in fileContent)) {
        console.error(`Entity missing main object ("minecraft:entity") in ${filePath}`)
        break
    }

    const entity = processEntity(fileContent)

    fs.writeFileSync(filePath, JSON.stringify(entity, null, 4))
}
