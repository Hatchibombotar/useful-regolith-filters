const fs = require("fs")
const glob = require("glob")
const path = require("path")
const JSONC = require("jsonc").safe
const { JSONFile } = require("./file")

const utils = require("./utils.js");
const lang = require("./lang.js")

const {
    JSON_FEATURES_RP,
    JSON_FEATURES_BP,
    CUMULATIVE_JSON_FILES,
    SOUND_EXTENTIONS,
    IMAGE_EXTENTIONS,
    IGNORE_FILES,
} = require("./fileData.js");

const fileProcess = require("./fileProcess/index.js")

const allFiles = () => [...glob.sync("RP/**/*"), ...glob.sync("BP/**/*")]

const toBeMerged = {}

const languages = {
    "RP": {},
    "BP": {}
}

// resolve relative paths in commands
function processCommand(command, filePath) {
    const args = utils.commandArgs(command)

    for (const i in args) {
        if (args[i - 1] == "function") {
            args[i] = utils.resolvePath(filePath, args[i])
        }
    }

    return args.join(" ")
}

for (const filePath of glob.sync("BP/**/*")) {
    if (fs.lstatSync(filePath).isDirectory()) continue
    const parsedPath = path.parse(filePath)

    if (IGNORE_FILES.includes(parsedPath.base)) continue
    if (parsedPath.ext == ".json") {

        const file = new JSONFile(filePath)

        const specialistFiles = {
            "tick.json": fileProcess.BP.tick,
            "manifest.json": fileProcess.BP.manifest,
        }

        if (parsedPath.base in specialistFiles) {
            const newFileContent = specialistFiles[parsedPath.base](file.content, file.path)

            file.set(newFileContent).save()
        }

        // get the type of file if this is a unique json file type.
        let correctParentName;
        for (const parent in JSON_FEATURES_BP) {
            if (parent in file.content) {
                correctParentName = parent
                break
            }
        }

        // resolve function calls to relative paths in BP animations
        if (correctParentName == "animations") {
            const newFileContent = file.content

            for (const key in newFileContent[correctParentName]) {
                let anim = newFileContent[correctParentName][key]

                for (const timestamp in anim.timeline) {
                    let commands = anim.timeline[timestamp]
                    for (const command of commands) {
                        command = "/" + processCommand(command, filePath)
                    }
                }
            }
            file.set(newFileContent).save()
        }

        // resolve function calls to relative paths in an entities run_command event
        if (["minecraft:entity", "minecraft:item", "minecraft:block"].includes(correctParentName)) {
            const newFileContent = fileProcess.BP.componentObject(file.content, file.path, correctParentName)

            file.set(newFileContent).save()
        }

        // Move unique JSON files to their target directories.
        if (correctParentName != undefined) {
            const targetDirectory = JSON_FEATURES_BP[correctParentName]
            file.move(targetDirectory)

        }

        // if it is a cumulative json file, add it to the toBeMerged array
        if (parsedPath.base in CUMULATIVE_JSON_FILES) {
            const fileName = parsedPath.base
            if (toBeMerged[fileName] == undefined) {
                toBeMerged[fileName] = [filePath]
            } else {
                toBeMerged[fileName].push(filePath)
            }
        }

    } else if (parsedPath.ext == ".mcfunction") {
        // resolve function calls to relative paths in .mcfunction files
        const fileContent = String(fs.readFileSync(filePath))
        const fileLines = fileContent.split("\n")
        for (const commandIndex in fileLines) {
            fileLines[commandIndex] = processCommand(fileLines[commandIndex], filePath)
        }
        fs.writeFileSync(filePath, fileLines.join("\n"))


        utils.safeMove(filePath, `BP/functions/${path.dirname(filePath)}`)
    } else if (parsedPath.ext == ".js" || parsedPath.ext == ".ts") {
        utils.safeMove(filePath, `BP/scripts/${path.dirname(filePath)}`)
    } else if (parsedPath.ext == ".lang") {
        utils.safeMove(filePath, `BP/texts/`)
    } else if (parsedPath.ext == ".mcstructure") {
        utils.safeMove(filePath, `BP/structures/`)
    }
}

for (const filePath of glob.sync("RP/**/*")) {
    if (fs.lstatSync(filePath).isDirectory()) continue
    const parsedPath = path.parse(filePath)

    if (IGNORE_FILES.includes(parsedPath.base)) continue
    if (parsedPath.ext == ".json") {
        const file = new JSONFile(filePath)
        const fileContent = file.content

        const specialistFiles = {
            "flipbook_textures.json": fileProcess.RP.flipbookTextures,
            "terrain_texture.json": fileProcess.RP.terrainTextures,
            "item_texture.json": fileProcess.RP.terrainTextures,
            "sound_definitions.json": fileProcess.RP.soundDefinitions,
            "_ui_defs.json": fileProcess.RP.uiDefs,
        }

        if (parsedPath.base in specialistFiles) {
            const newFileContent = specialistFiles[parsedPath.base](file.content, file.path)
            fs.writeFileSync(filePath, JSON.stringify(newFileContent))
        }

        // get the type of file if this is a unique json file type.
        let correctParentName;
        for (const parent in JSON_FEATURES_RP) {
            if (parent in fileContent) {
                correctParentName = parent
                break
            }
        }

        // Resolve relative paths to textures in client_entity
        if (["minecraft:client_entity", "minecraft:attachable"].includes(correctParentName)) {
            const textures = fileContent[correctParentName].description.textures

            for (const texture in textures) {
                let vanillaPath = false;
                if (textures[texture].split("/")[0] == "@vanilla") vanillaPath = true

                textures[texture] = utils.resolvePath(filePath, textures[texture])

                if (!vanillaPath) {
                    textures[texture] = "textures/" + textures[texture]
                }

            }
            fileContent[correctParentName].description.textures = textures
            fs.writeFileSync(filePath, JSON.stringify(fileContent, null, 4))
        }

        // move UI files to their corresponding file inside of the UI folder
        if (correctParentName == "namespace") {
            file.move(`RP/ui/${path.dirname(filePath)}`)

            correctParentName = undefined
        }

        // Move unique JSON files to their target directories.
        if (correctParentName != undefined) {
            let targetDirectory = JSON_FEATURES_RP[correctParentName]
            utils.safeMove(filePath, targetDirectory)
        }

        // if it is a cumulative json file, add it to the toBeMerged array
        if (parsedPath.base in CUMULATIVE_JSON_FILES) {
            const fileName = parsedPath.base
            if (toBeMerged[fileName] == undefined) {
                toBeMerged[fileName] = [filePath]
            } else {
                toBeMerged[fileName].push(filePath)
            }
        }
    } else if (IMAGE_EXTENTIONS.includes(parsedPath.ext)) {
        utils.safeMove(filePath, `RP/textures/${path.dirname(filePath)}`)
    } else if (SOUND_EXTENTIONS.includes(parsedPath.ext)) {
        utils.safeMove(filePath, `RP/sounds/${path.dirname(filePath)}`)
    } else if (parsedPath.ext == ".lang") {
        let currentLanuage = languages.RP[parsedPath.name]
        if (currentLanuage == undefined) {
            currentLanuage = [filePath]
        } else {
            currentLanuage = [...currentLanuage, filePath]
        }
        languages.RP[parsedPath.name] = currentLanuage
    } else if (parsedPath.ext == ".material") {
        utils.safeMove(filePath, `RP/materials/`)
    }
}

// Merge cumulative JSON files and put them in the right location.
for (const fileType in toBeMerged) {
    if (!fs.existsSync(CUMULATIVE_JSON_FILES[fileType])) {
        fs.mkdirSync(CUMULATIVE_JSON_FILES[fileType])
    }

    fs.writeFileSync(`${CUMULATIVE_JSON_FILES[fileType]}/${fileType}`, JSON.stringify(utils.deepMerge(
        utils.orderBySpecificity(toBeMerged[fileType]).map((path) => {
            const [parseError, fileContent] = JSONC.parse(String(fs.readFileSync(path)))
            if (parseError) {
                console.error(`Failed to parse JSON in ${filePath}`)
                return
            }
            fs.rmSync(path)
            return fileContent
        })
    ), null, 4))
}


// Merge language files
for (const packType of ["RP", "BP"]) {
    fs.mkdirSync(`${packType}/texts/`, { recursive: true })
    for (const language in languages[packType]) {
        // It is fine if the files already in the texts folder are overwritten, as the merged file should contain it.
        fs.writeFileSync(`${packType}/texts/${language}.lang`,
            lang.stringify(
                utils.deepMerge(
                    languages[packType][language].map((path) => {
                        const fileContent = lang.parse(String(fs.readFileSync(path)))
                        fs.rmSync(path)
                        return fileContent
                    })
                )
            )
        )
    }
}

// Remove Empty Folders
for (const filePath of utils.orderBySpecificity(allFiles()).reverse()) {
    if (fs.lstatSync(filePath).isDirectory()) {
        if (fs.readdirSync(filePath).length == 0) fs.rmSync(filePath, { "recursive": true })
    }
}