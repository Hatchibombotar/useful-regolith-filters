const fs = require("fs")
const glob = require("glob")
const path = require("path")
const JSONC = require("jsonc").safe

const utils = require("./utils.js");

const {
    JSON_FEATURES_RP,
    JSON_FEATURES_BP,
    CUMULATIVE_JSON_FILES,
    SOUND_EXTENTIONS,
    IMAGE_EXTENTIONS,
    IGNORE_FILES,
} = require("./fileMap.js");

const allFiles = () => [...glob.sync("RP/**/*"), ...glob.sync("BP/**/*")]

const toBeMerged = {}

const languages = {
    "RP": {},
    "BP": {}
}

// resolve relative paths in commands
function processCommand(command, filePath) {
    const args = utils.getCommandArgs(command)

    for (const i in args) {
        if (args[i-1] == "function") {
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
        const [parseError, fileContent] = JSONC.parse(String(fs.readFileSync(filePath)))
        if (parseError) {
            console.error(`Failed to parse JSON in ${filePath}`)
            break
        }

        if (parsedPath.base == "tick.json") {
            for (const i in fileContent.values) {
                fileContent.values[i] = utils.resolvePath(filePath, fileContent.values[i])
            }
            fs.writeFileSync(filePath, JSON.stringify(fileContent))
        }

        // get the type of file if this is a unique json file type.
        let correctParentName;
        for (const parent in JSON_FEATURES_BP) {
            if (parent in fileContent) {
                correctParentName = parent
                break
            }
        }

        // resolve function calls to relative paths in BP animations
        if (correctParentName == "animations") {
            for (const key in fileContent[correctParentName]) {
                for (const timestamp in fileContent[correctParentName][key].timeline) {
                    const commands = fileContent[correctParentName][key].timeline[timestamp]
                    for (const commandIndex in commands) {
                        fileContent[correctParentName][key].timeline[timestamp][commandIndex] = "/" + processCommand(commands[commandIndex], filePath)
                    }
                }
            }
            fs.writeFileSync(filePath, JSON.stringify(fileContent, null, 4))
        }

        // resolve function calls to relative paths in an entities run_command event
        if (["minecraft:entity", "minecraft:item", "minecraft:block"].includes(correctParentName)) {
            for (const event in fileContent[correctParentName].events) {
                const eventContent = fileContent[correctParentName].events[event]
                for (const eventResult in eventContent) {
                    if (eventResult == "run_command") {
                        for (const commandIndex in eventContent[eventResult].command) {
                            fileContent[correctParentName].events[event][eventResult].command[commandIndex] = processCommand(eventContent[eventResult].command[commandIndex], filePath)
                        }
                    }
                }
            }
            fs.writeFileSync(filePath, JSON.stringify(fileContent, null, 4))
        }

        // Move unique JSON files to their target directories.
        if (correctParentName != undefined) {
            targetDirectory = JSON_FEATURES_BP[correctParentName]
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

    } else if (parsedPath.ext == ".mcfunction") {
        // resolve function calls to relative paths in .mcfunction files
        const fileContent = String(fs.readFileSync(filePath))
        const fileLines = fileContent.split("\n")
        for (const commandIndex in fileLines) {
            fileLines[commandIndex] = processCommand(fileLines[commandIndex], filePath)
        }
        fs.writeFileSync(filePath, fileLines.join("\n"))

        
        utils.safeMove(filePath, `BP/functions/${path.dirname(filePath)}`)
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
        const [parseError, fileContent] = JSONC.parse(String(fs.readFileSync(filePath)))
        if (parseError) {
            console.error(`Failed to parse JSON in ${filePath}`)
            break
        }

        // resolve relative paths in "flipbook_textures.json"
        if (parsedPath.base == "flipbook_textures.json") {
            for (let flipbook of fileContent) {
                flipbook.flipbook_texture = "textures/" + utils.resolvePath(filePath, flipbook.flipbook_texture)
            }
            fs.writeFileSync(filePath, JSON.stringify(fileContent))
        }

        // resolve relative paths in "terrain_texture.json" and "item_texture.json"
        if (parsedPath.base == "terrain_texture.json" || parsedPath.base == "item_texture.json") {
            for (const block in fileContent.texture_data) {
                if (typeof fileContent.texture_data[block].textures == "object") {
                    for (const texture in (fileContent.texture_data[block].textures)) {
                        fileContent.texture_data[block].textures[texture] = "textures/" + utils.resolvePath(filePath, fileContent.texture_data[block].textures[texture])
                    }
                } else {
                    fileContent.texture_data[block].textures = "textures/" + utils.resolvePath(filePath, fileContent.texture_data[block].textures)
                }
                
            }
            fs.writeFileSync(filePath, JSON.stringify(fileContent))
        }

        // resolve relative paths in "sound_definitions.json"
        if (parsedPath.base == "sound_definitions.json") {
            for (const soundSet in fileContent.sound_definitions) {
                for (const sound in fileContent.sound_definitions[soundSet].sounds)
                fileContent.sound_definitions[soundSet].sounds[sound].name = "sounds/" + utils.resolvePath(filePath, fileContent.sound_definitions[soundSet].sounds[sound].name)
            }
            fs.writeFileSync(filePath, JSON.stringify(fileContent))
        }

        // resolve relative paths in "_ui_defs.json"
        if (parsedPath.base == "_ui_defs.json") {
            for (const i in fileContent.ui_defs) {
                fileContent.ui_defs[i] = "ui/" + utils.resolvePath(filePath, fileContent.ui_defs[i])
            }
            fs.writeFileSync(filePath, JSON.stringify(fileContent))
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
        if (correctParentName == "minecraft:client_entity") {
            const textures = fileContent["minecraft:client_entity"].description.textures
            
            for (const texture in textures) {
                if (textures[texture].split("/")[0] == "textures") continue
                textures[texture] = "textures/" + utils.resolvePath(filePath, textures[texture]) 
                
            }
            fileContent["minecraft:client_entity"].description.textures = textures
            fs.writeFileSync(filePath, JSON.stringify(fileContent, null, 4))
        }

        // move UI files to their corresponding file inside of the UI folder
        if (correctParentName == "namespace") {
            utils.safeMove(filePath, `RP/ui/${path.dirname(filePath)}`)
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
        utils.orderBySpecificity(toBeMerged[fileType]).map((path) => JSONC.parse(String(fs.readFileSync(path)))[1])
    ), null, 4))
    toBeMerged[fileType].forEach((path) => fs.rmSync(path))
}


// Merge language files
for (const packType of ["RP", "BP"]) {
    fs.mkdirSync(`${packType}/texts/`, {recursive: true})
    for (const language in languages[packType]) {
        // It is fine if the files already in the texts folder are overwritten, as the merged file should contain it.
        fs.writeFileSync(`${packType}/texts/${language}.lang`, 
            utils.JSONtoTexts(
                utils.deepMerge(
                    languages[packType][language].map((path) => {
                        const fileContent = utils.textsToJSON(String(fs.readFileSync(path)))
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
        if (fs.readdirSync(filePath).length == 0)  fs.rmSync(filePath, {"recursive": true}) 
    }
}