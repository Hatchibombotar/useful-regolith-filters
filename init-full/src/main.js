import { randomUUID } from "crypto";
import inquirer from "inquirer";
import checkbox from '@inquirer/checkbox';
import { getMinecraftVersion, getVersions, npmVersionToGameVersion } from "./fetchVersions.js";
import { log, error } from "console";
import { mkdir, readFile, rm, rmdir, writeFile } from "fs/promises";
import { asyncCatch, syncCatch } from "./utils.js";
import { execSync } from 'child_process'
import { existsSync } from "fs";
import { resolve } from "path"

const modules = [
    "@minecraft/server",
    "@minecraft/server-ui",
    "@minecraft/server-gametest",
    "@minecraft/server-admin",
    "@minecraft/server-net",
    "@minecraft/server-editor",
]

async function main() {
    log("Create Regolith Project")
    log("---")
    const root = resolve(process.cwd(), "../../../../")
    const config_path = root + "/config.json"
    let config;

    async function reloadConfig() {
        const [config_file, read_config_error] = await asyncCatch(readFile(config_path))
        if (read_config_error) {
            throw Error("Could not read config file at path:\n" + root + config_path)
        }

        const [parsed_config, parse_config_error] = syncCatch(() => JSON.parse(config_file))
        if (parse_config_error) {
            throw Error("Could not parse config file at path:\n" + parse_config_error)
        }

        config = parsed_config
    }

    async function saveConfig() {
        await writeFile(config_path, JSON.stringify(config, null, 4))
    }

    await reloadConfig()

    const minecraft_version = await getMinecraftVersion()

    let { project_name, author } = await inquirer.prompt([
        {
            type: 'input',
            name: 'project_name',
            message: "project name: ",
        },
        {
            type: 'input',
            name: 'author',
            message: "author: ",
        }
    ])

    let { description } = await inquirer.prompt([
        {
            type: 'input',
            name: 'description',
            message: "description: ",
            default: author != "" ? "By " + author : null
        },
    ])

    config.author = author
    config.name = project_name

    await saveConfig()

    log("---")

    let { version } = await inquirer.prompt([
        {
            type: "list",
            name: "version",
            choices: [
                {
                    name: `Latest: ${minecraft_version.latestRelease}`,
                    value: minecraft_version.latestRelease
                },
                {
                    name: `Preview: ${minecraft_version.latestPreview}`,
                    value: minecraft_version.latestPreview
                },
                {
                    name: "Custom",
                    value: null
                }
            ]
        }
    ])

    if (version == null) {
        const { custom_version } = await inquirer.prompt([
            {
                type: 'input',
                name: 'custom_version',
                message: "version:",
            }
        ])
        const parsed_version = custom_version.split(".")
        if (parsed_version.length < 3) {
            throw Error("Could not parse version string.")
        }

        version = parsed_version.join(".")
    }

    const min_engine_version = version.split(".").slice(0, 3).map(x => Number(x))

    const manifest_RP = {
        "format_version": 2,
        "header": {
            "name": `${project_name} RP`,
            "description": description,
            "uuid": randomUUID(),
            "version": [1, 0, 0],
            min_engine_version
        },
        "modules": [
            {
                "type": "resources",
                "uuid": randomUUID(),
                "version": [1, 0, 0]
            }
        ],
        "dependencies": []
    }

    const manifest_BP = {
        "format_version": 2,
        "header": {
            "name": `${project_name} BP`,
            "description": description,
            "uuid": randomUUID(),
            "version": [1, 0, 0],
            min_engine_version
        },
        "modules": [
            {
                "type": "data",
                "uuid": randomUUID(),
                "version": [1, 0, 0]
            }
        ],
        "dependencies": []
    }

    manifest_RP.dependencies.push({
        uuid: manifest_BP.header.uuid,
        version: manifest_BP.header.version
    })
    manifest_BP.dependencies.push({
        uuid: manifest_RP.header.uuid,
        version: manifest_RP.header.version
    })

    log("---")

    const { script_api_enabled } = await inquirer.prompt([
        {
            type: 'confirm',
            name: 'script_api_enabled',
            message: 'use script api?'
        }
    ])

    if (script_api_enabled) {
        const { script_api_version } = await inquirer.prompt([
            {
                type: 'list',
                name: 'script_api_version',
                message: 'script api version',
                choices: [
                    {
                        value: "release-stable",
                        name: 'Release (Stable)'
                    },
                    {
                        value: "release-beta",
                        name: 'Release (Beta APIs)'
                    },
                    {
                        value: "preview-stable",
                        name: 'Preview (Stable)'
                    },
                    {
                        value: "preview-beta",
                        name: 'Preview (Beta APIs)'
                    }
                ],
            }
        ])

        log("fetching module versions...")
        let versions = {}

        const version_is_release = ["release-stable", "release-beta"].includes(script_api_version)
        const version_is_stable = ["release-stable", "preview-stable"].includes(script_api_version)
        for (const module of modules) {
            let module_versions = []
            if (version_is_release) {
                module_versions = await getVersions(minecraft_version.latestRelease, module)
            } else {
                module_versions = await getVersions(minecraft_version.latestPreview, module)
            }
            versions[module] = {
                versions: module_versions,
                has_stable: module_versions.length > 1,
                has_beta: module_versions[0] != null,
                latest_stable: module_versions[1],
                latest_beta: module_versions[0],
            }
        }
        const supported_modules = Object.fromEntries(Object.entries(versions).filter(
            ([_, v]) => (version_is_stable ? v.has_stable : v.has_beta)
        ))
        const selected_modules = await checkbox(
            {
                message: 'select modules:',
                choices: Object.entries(supported_modules).map(
                    ([name, v]) => {
                        const version = version_is_stable ? v.latest_stable : v.latest_beta
                        const gameVersion = npmVersionToGameVersion(version)
                        const label = name + (gameVersion.type == "" ? "" : ` (${gameVersion.type})`) + ` (${gameVersion.version})`
                        return {
                            name: label,
                            value: {
                                name,
                                version: gameVersion.version,
                                npm_package: name + "@" + version
                            }
                        }
                    }
                ),
                loop: false,
                required: true,
            }
        )

        const { include_modules_type } = await inquirer.prompt([
            {
                type: "list",
                name: "include_modules_type",
                message: "script setup mode:",
                choices: [
                    {
                        name: "Regolith filter (JS/TS & external dependencies)",
                        value: "gametests-filter"
                    },
                    {
                        name: "Include in manifests (JS & built-in dependencies only)",
                        value: "manifest"
                    }
                ]
            }
        ])

        let node_modules_path = root

        if (include_modules_type == "gametests-filter") {
            const { use_typescript } = await inquirer.prompt([
                {
                    type: 'confirm',
                    name: 'use_typescript',
                    message: 'use typescript?'
                }
            ])
            const source_file_name = use_typescript ? "main.ts" : "main.js"
            const { source_location } = await inquirer.prompt([{
                type: 'list',
                name: 'source_location',
                message: `where should ${source_file_name} be stored?`,
                choices: [
                    {
                        name: `packs/BP/scripts/${source_file_name}`,
                        value: "bp"
                    },
                    {
                        name: `packs/data/src/${source_file_name}`,
                        value: "data"
                    }
                ]
            }])
            if ("gametests" in config.regolith.filterDefinitions) {
                error("Already found gametests filter in config.json, skipping install step")
            } else {
                log("running 'regolith install gametests'...")
                const [_, err] = syncCatch(() => execSync("regolith install gametests"))

                if (err) {
                    error("Failed to install gametests filter:")
                    error(err.stdout.toString())
                    return
                }

                await reloadConfig()

                log("Creating default profile...")
                config.regolith.profiles.default.filters = [
                    {
                        "filter": "gametests",
                        "settings": {
                            "buildOptions": {
                                "bundle": true,
                                "entryPoints": [
                                    source_location == "bp" ? `BP/scripts/${source_file_name}` : `data/gametests/src/${source_file_name}`
                                ],
                                "format": "esm",
                                "minify": false,
                                "target": "es2020"
                            },
                            "moduleUUID": randomUUID(),
                            "modules": selected_modules.map(
                                ({ name, version }) => `${name}@${version}`
                            )
                        }
                    }
                ]

                await saveConfig()

                const GAMETESTS_DATA_DIR = root + "/packs/data/gametests/"
                if (source_location == "data") {
                    node_modules_path = GAMETESTS_DATA_DIR
                } else {
                    if (existsSync(GAMETESTS_DATA_DIR)) {
                        await rm(GAMETESTS_DATA_DIR, { recursive: true, force: true })
                    }

                    await mkdir(GAMETESTS_DATA_DIR)
                    await writeFile(GAMETESTS_DATA_DIR + ".gitignore", "")

                    log(`creating ${source_file_name} file...`)

                    if (!existsSync(root + "/packs/BP/scripts")) {
                        await mkdir(root + "/packs/BP/scripts")
                    }

                    const source_file_path = root + "/packs/BP/scripts/" + source_file_name
                    if (!existsSync(source_file_path)) {
                        const [_, err] = await asyncCatch(writeFile(source_file_path, `console.error("Hello, World.")`))
                        if (err) {
                            error(`Failed to create ${source_file_name}:`)
                            error(err)
                        }
                    } else {
                        error(`${source_file_name} already exists, skipping creation`)
                    }
                }
            }
        } else {
            log("Inserting script modules into manifest...")

            manifest_BP.modules.push({
                type: "script",
                language: "javascript",
                uuid: randomUUID(),
                version: [1, 0, 0],
                entry: "scripts/main.js"
            })

            for (const script_module of selected_modules) {
                manifest_BP.dependencies.push({
                    "module_name": script_module.name,
                    "version": script_module.version
                })
            }

            log("creating main.js file...")
            if (!existsSync(root + "/packs/BP/scripts")) {
                await mkdir(root + "/packs/BP/scripts")
            }

            const source_file_path = root + "/packs/BP/scripts/main.js"
            if (!existsSync(source_file_path)) {
                await writeFile(source_file_path, `console.error("Hello, World.")`)
            } else {
                error("main.js already exists, skipping creation")
            }
        }

        const { install_npm_packages } = await inquirer.prompt([
            {
                type: "confirm",
                name: "install_npm_packages",
                message: "install npm packages?"
            }
        ])

        if (install_npm_packages) {
            log("running 'npm init -y'...")
            execSync(`npm init -y`, {
                cwd: node_modules_path
            })

            log("installing npm packages...")
            const npm_packages = selected_modules.map(x => x.npm_package)
            execSync(`npm install ${npm_packages.join(" ")}`, {
                cwd: node_modules_path
            })
        }
    }

    log("saving manifest files...")
    await writeFile(root + "/packs/RP/manifest.json", JSON.stringify(manifest_RP, null, 4))
    await writeFile(root + "/packs/BP/manifest.json", JSON.stringify(manifest_BP, null, 4))

    log("removing init-full from config...")
    config.regolith.filterDefinitions["init-full"] = undefined
    await saveConfig()
    execSync("echo regolith uninstall init-full")

}

main().then(async () => {
    await inquirer.prompt([
        {
            type: 'input',
            name: 'description',
            message: "press enter to close window."
        }
    ])
}).catch(async (e) => {
    log(e)
    await inquirer.prompt([
        {
            type: 'input',
            name: 'description',
            message: "press enter to close window."
        }
    ])
})

