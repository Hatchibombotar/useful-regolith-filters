const glob = require("glob").sync
const JSONC = require("jsonc").safe
const path = require("path")
const {readFileSync, writeFileSync} = require("fs")

const {deepMerge} = require("./utils")

const seenFiles = {}
const templateIdentifiers = {}

// for each template file
for (const templatePath of glob("data/templater/**/*.js")) {

    // get the template data
    const template = require(path.resolve(templatePath))
    const { identifier, use_on, write_level } = template.description

    templateIdentifiers[identifier] = null

    // look through all files template can be used on
    for (const filePath of glob(`${use_on}**/*.json`)) {
        seenFiles[filePath] = null

        const [parseError, file] = JSONC.parse(String(readFileSync(filePath)))
        if (parseError) {
            console.error(`Failed to parse JSON in ${filePath}`)
            break
        }
        
        // return if file does not call this template.
        if (file.use_templates == undefined || !(identifier in file.use_templates)) continue

        const parameters = file.use_templates[identifier]

        // get the object representation of the template using the provided parameters
        const rawTemplate = template.template(parameters)

        const newFileData = deepMerge([file, rawTemplate], 0, write_level)

        writeFileSync(filePath, JSON.stringify(newFileData, null, 4))
    }
}

// remove use_templates property from all files and check if any undefined templates are referenced
for (const filePath in seenFiles) {
    const [parseError, file] = JSONC.parse(String(readFileSync(filePath)))
    if (parseError) {
        console.error(`Failed to parse JSON in ${filePath}`)
        break
    }

    for (const template in file.use_templates) {
        if (!(template in templateIdentifiers)) {
            console.error("Invalid Template: " + template)
        }
    }

    file.use_templates = undefined

    
    writeFileSync(filePath, JSON.stringify(file, null, 4))
}