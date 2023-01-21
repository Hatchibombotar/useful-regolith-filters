const ROOT_DIR = process.env.ROOT_DIR + "/"

const fs = require("fs")
const AdmZip = require("adm-zip")

const { toSnakeCase, JSONCFindAndParse, getWorldPath } = require("./util")
const settings = require("./settings")

const projectConfig = JSONCFindAndParse(ROOT_DIR + "/config.json")

const packageLocation = ROOT_DIR + (settings.package["package_location"] ?? "")
const packName = settings.package["file_name"] ?? toSnakeCase(projectConfig.name)

for (const packageMode in settings.package) {
    if (!["mcpack", "mcaddon", "mcworld", "mctemplate"].includes(packageMode)) continue
    const settingConfig = settings.package[packageMode]

    const RP = settingConfig["RP"] ?? true
    const BP = settingConfig["BP"] ?? true
    const skins = settingConfig["skins"] ?? false
    const worldPackMode = settingConfig["packs"] ?? "include"
    const worldType = settingConfig["world"]

    const skinPackLocation = projectConfig["packs"].skinPack

    const manifestRP = JSONCFindAndParse("RP/manifest.json")
    const manifestBP = JSONCFindAndParse("BP/manifest.json")

    switch (packageMode) {
        case "mctemplate":
        case "mcworld":
            {
                const worldPath = ROOT_DIR + getWorldPath(projectConfig, worldType)
                const filePath = `${packageLocation}/${packName}.${packageMode}`

                const archive = new AdmZip()
                if (!fs.existsSync(worldPath)) {
                    console.error("Selected world missing!")
                    console.error(worldPath)
                    process.exit(1)
                }
                archive.addLocalFolder(worldPath)

                if (worldPackMode == "reference" || worldPackMode == "include") {
                    if (BP) {
                        const worldBehaviourPacksPath = `${worldPath}/world_behavior_packs.json`
                        const worldBehaviourPacks = fs.existsSync(worldBehaviourPacksPath) ? JSON.parse(fs.readFileSync(worldBehaviourPacksPath)) : []

                        const worldPackIncludesBP = worldBehaviourPacks.map(x => x.pack_id.toUpperCase()).includes(manifestBP.header.uuid.toUpperCase())
                        if (!worldPackIncludesBP) {
                            worldBehaviourPacks.push({
                                "pack_id": manifestBP.header.uuid,
                                "version": manifestBP.header.version
                            })
                        }
                        archive.addFile("world_behavior_packs.json", JSON.stringify(worldBehaviourPacks))
                    }

                    if (RP) {
                        const worldResourcePacksPath = `${worldPath}/world_resource_packs.json`
                        const worldResourcePacks = fs.existsSync(worldResourcePacksPath) ? JSON.parse(fs.readFileSync(worldResourcePacksPath)) : []

                        const worldPackIncludedRP = worldResourcePacks.map(x => x.pack_id.toUpperCase()).includes(manifestRP.header.uuid.toUpperCase())
                        if (!worldPackIncludedRP) {
                            worldResourcePacks.push({
                                "pack_id": manifestRP.header.uuid,
                                "version": manifestRP.header.version
                            })
                        }
                        archive.addFile("world_resource_packs.json", JSON.stringify(worldResourcePacks))
                    }

                }
                if (worldPackMode == "include") {
                    if (BP) archive.addLocalFolder("BP", "behavior_packs/" + packName)
                    if (RP) archive.addLocalFolder("RP", "resource_packs/" + packName)
                }

                archive.writeZip(filePath)
            }
            break
        case "mcpack":
            {
                if (skins) {
                    const filePath = `${packageLocation}/${packName}_skins.mcpack`
                    const archive = new AdmZip()

                    archive.addLocalFolder(ROOT_DIR + skinPackLocation + "/")

                    archive.writeZip(filePath)
                    continue
                }

                for (const packType of ["RP", "BP"]) {
                    if (settingConfig[packType] ?? true) {
                        // if both pack types (RP & BP) are selected, add _RP | _BP to the pack name.
                        const filePath = `${packageLocation}/${packName}_${packType}.mcpack`

                        const archive = new AdmZip()

                        archive.addLocalFolder(packType + "/")
                        archive.writeZip(filePath)
                    }
                }
            }
            break
        case "mcaddon":
        default:
            {
                const filePath = `${packageLocation}/${packName}.mcaddon`

                const archive = new AdmZip()
                if (RP) archive.addLocalFolder('RP/', "RP")
                if (BP) archive.addLocalFolder('BP/', "BP")

                archive.writeZip(filePath)
            }
    }
}