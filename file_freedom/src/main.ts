import * as FileSystem from "./FileSystem"
import { File } from "./FileSystem"
import { resolvePath, commandArgs, deepMerge, orderBySpecificity } from "./utils"
import { Manifest, Tick } from "./MinecraftTypes"
import * as lang from "./lang"

import { IMAGE_EXTENTIONS, SOUND_EXTENTIONS, JSON_FEATURES_BP, JSON_FEATURES_RP, CUMULATIVE_JSON_FILES, IGNORE_FILES, IGNORE_FOLDERS } from "./config"

async function main() {
    const toBeMerged = {}
    const materialFiles = {}
    const languageFiles = {
        "BP": {},
        "RP": {},
    }

    const BP = FileSystem.glob("BP/**/*", {ignore: IGNORE_FOLDERS})
    const RP = FileSystem.glob("RP/**/*", {ignore: IGNORE_FOLDERS})

    for (const file of BP) {
        if (IGNORE_FILES.includes(file.metadata.base)) continue

        if (file.metadata.extension === ".json") {
            if (file.metadata.base === "tick.json") {
                const content: Tick = file.jsonc()

                content.values = content.values.map(
                    (path: string) => resolvePath(file.path, path)
                )

                file.save(content)

            } else if (file.metadata.base === "manifest.json") {
                const content: Manifest = file.jsonc()

                content.modules = content.modules.map(
                    (module: any) => {
                        if (module.entry) {
                            module.entry = resolvePath("scripts", file.path, module.entry)
                        }
                        return module
                    }
                )

                file.save(content)
            } else {
                const foundParentName = Object.keys(JSON_FEATURES_BP).find(
                    parent => parent in file.jsonc()
                )

                if (foundParentName) {
                    const isComponentBased = ["minecraft:entity", "minecraft:item", "minecraft:block"].includes(foundParentName)
                    if (isComponentBased) {
                        const content = file.jsonc()

                        for (const eventName in content[foundParentName].events) {
                            const event = content[foundParentName].events[eventName]
                            for (const eventType in event) {
                                if (eventType === "run_command") {
                                    const commandObj = event[eventType].command
                                    for (let command in commandObj) {
                                        commandObj[command] = processCommand(commandObj[command], file.path)
                                    }
                                }
                            }
                        }

                        file.save(content)

                    } else if (foundParentName == "animations") {
                        const content = file.jsonc()

                        for (const key in content.animations) {
                            const anim = content.animations[key]

                            for (const timestamp in anim.timeline) {
                                let actions: string[] = anim.timeline[timestamp]

                                content.animations[key].timeline[timestamp] = actions.map(
                                    action => action.at(0) == "/" ? "/" + processCommand(action, file.path) : action
                                )
                            }
                        }

                        file.save(content)
                    }

                    file.move(JSON_FEATURES_BP[foundParentName], { safe: true })
                }
            }

            if (file.metadata.base in CUMULATIVE_JSON_FILES) {
                if (toBeMerged[file.metadata.base] == undefined) {
                    toBeMerged[file.metadata.base] = [file.path]
                } else {
                    toBeMerged[file.metadata.base].push(file.path)
                }
            }
        } else if (file.metadata.extension == ".mcfunction") {
            // resolve function calls to relative paths in .mcfunction files
            const content = file.string()
            const fileLines = content.split("\n")
            for (const commandIndex in fileLines) {
                fileLines[commandIndex] = processCommand(fileLines[commandIndex], file.path)
            }

            file.save(fileLines.join("\n"))
            file.move(`BP/functions/${file.metadata.dir}`)
        } else if (file.metadata.extension == ".js" || file.metadata.extension == ".ts") {
            file.move(`BP/scripts/${file.metadata.dir}`)
        } else if (file.metadata.extension == ".lang") {
            file.move(`BP/texts/`)
        } else if (file.metadata.extension == ".mcstructure") {
            file.move(`BP/structures/`)
        }
    }

    for (const file of RP) {
        if (IGNORE_FILES.includes(file.metadata.base)) continue

        if (file.metadata.extension == ".json") {
            if (file.metadata.base == "flipbook_textures.json") {
                const content = file.jsonc().map(
                    flipbook => {
                        flipbook.flipbook_texture = resolvePath("textures", "/" + file.path, flipbook.flipbook_texture)
                        return flipbook
                    }
                )
                file.save(content)
            } else if (["terrain_texture.json", "item_texture.json"].includes(file.metadata.base)) {
                const content = file.jsonc()

                for (const blockName in content.texture_data) {
                    let block = content.texture_data[blockName]
                    if (block.textures instanceof Array) {
                        for (let textureI in block.textures) {
                            const texture = block.textures[textureI]
                            if (texture instanceof Object) {
                                block.textures[textureI].path = resolvePath("textures", "/" + file.path, texture.path)
                            } else {
                                block.textures[textureI] = resolvePath("textures", "/" + file.path, texture)
                            }
                        }
                    } else if (block.textures instanceof Object) {
                        block.textures.path = resolvePath("textures", "/" + file.path, block.textures.path)

                    } else {
                        block.textures = resolvePath("textures", "/" + file.path, block.textures)
                    }
                }

                file.save(content)
            } else if (file.metadata.base == "sound_definitions.json") {
                const content = file.jsonc()

                for (const soundSet in content.sound_definitions) {
                    for (const sound in content.sound_definitions[soundSet].sounds) {
                        if (typeof content.sound_definitions[soundSet].sounds[sound] == "object") {
                            content.sound_definitions[soundSet].sounds[sound].name = resolvePath("sounds", "/" + file.path, content.sound_definitions[soundSet].sounds[sound].name)
                        } else {
                            content.sound_definitions[soundSet].sounds[sound] = resolvePath("sounds", "/" + file.path, content.sound_definitions[soundSet].sounds[sound])
                        }
                    }
                }

                file.save(content)
            } else if (file.metadata.base == "_ui_defs.json") {
                const content = file.jsonc()

                content.ui_defs = content.ui_defs.map(
                    ui => resolvePath("ui", "/" + file.path, ui)
                )
                file.save(content)
            } else {
                const foundParentName = Object.keys(JSON_FEATURES_RP).find(
                    parent => parent in file.jsonc()
                )

                if (foundParentName) {
                    const isEntityLike = ["minecraft:client_entity", "minecraft:attachable"].includes(foundParentName)
                    if (isEntityLike) {
                        const content = file.jsonc()

                        const textures = content[foundParentName].description.textures

                        for (const texture in textures) {
                            textures[texture] = resolvePath("textures", "/" + file.path, textures[texture])
                        }
                        content[foundParentName].description.textures = textures

                        file.save(content)

                    } else if (foundParentName == "namespace") {
                        file.move(`RP/ui/${file.metadata.dir}`)

                        continue
                    }

                    file.move(JSON_FEATURES_RP[foundParentName], { safe: true })
                }
            }

            if (file.metadata.base in CUMULATIVE_JSON_FILES) {
                if (toBeMerged[file.metadata.base] == undefined) {
                    toBeMerged[file.metadata.base] = [file.path]
                } else {
                    toBeMerged[file.metadata.base].push(file.path)
                }
            }
        } else if (IMAGE_EXTENTIONS.includes(file.metadata.extension)) {
            file.move(`RP/textures/${file.metadata.dir}`)
        } else if (SOUND_EXTENTIONS.includes(file.metadata.extension)) {
            file.move(`RP/sounds/${file.metadata.dir}`)
        } else if (file.metadata.extension == ".lang") {
            let currentLanuage = languageFiles.RP[file.metadata.name]
            if (currentLanuage == undefined) {
                currentLanuage = [file]
            } else {
                currentLanuage = [...currentLanuage, file]
            }
            languageFiles.RP[file.metadata.name] = currentLanuage
        } else if (file.metadata.extension == ".material") {
            if (materialFiles[file.metadata.base] == undefined) {
                materialFiles[file.metadata.base] = [file.path]
            } else {
                materialFiles[file.metadata.base].push(file.path)
            }
        }
    }

    for (const fileType in toBeMerged) {
        FileSystem.write(
            `${CUMULATIVE_JSON_FILES[fileType]}/${fileType}`,
            deepMerge(
                orderBySpecificity(toBeMerged[fileType]).map((path) => {
                    const file = FileSystem.read(path)
                    const content = file.jsonc()
                    file.delete()
                    return content
                })
            )
        )
    }

    for (const fileType in materialFiles) {
        FileSystem.write(
            `RP/materials/${fileType}`,
            deepMerge(
                orderBySpecificity(materialFiles[fileType]).map((path) => {
                    const file = FileSystem.read(path)
                    const content = file.jsonc()
                    file.delete()
                    return content
                })
            )
        )
    }

    for (const packType of ["RP", "BP"]) {
        for (const language in languageFiles[packType]) {
            // It is fine if the files already in the texts folder are overwritten, as the merged file should contain it.
            FileSystem.write(
                `${packType}/texts/${language}.lang`,
                lang.stringify(
                    deepMerge(
                        languageFiles[packType][language].map((file: File) => {
                            const content = lang.parse(file.string())
                            file.delete()
                            return content
                        })
                    )
                )
            )
        }
    }

    const allFiles = [...FileSystem.glob("RP/**/*"), ...FileSystem.glob("BP/**/*")]
    for (const file of allFiles) {
        if (file.metadata.isDirectory) {
            if (file.contents.length == 0) file.delete()
        }
    }
}

function processCommand(command: string, filePath: string): string {
    let args: string[] = commandArgs(command)

    args = args.map(
        (arg, i) => {
            if (i > 0 && args[i - 1] === "function") {
                return resolvePath(filePath, arg);
            }
            return arg;
        }
    )

    return args.join(" ")
}

main()