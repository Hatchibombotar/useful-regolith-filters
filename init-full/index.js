const fs = require("fs")
// const prompt = require("prompt-sync")({ sigint: true });
const terminal = require("terminal-kit").terminal
const { v4: uuid } = require("uuid");
const path = require("path")

terminal.on("key", function (name) {
	if (name === "CTRL_C") terminal.processExit(0)
})

const menu = (...args) => {
	return new Promise((resolve, reject) => {
		terminal.singleColumnMenu(...args, (err, data) => {
			if (err) return reject(err)
			resolve(data)
		})
	})
}

const input = (prompt, ...args) => {
    return new Promise((resolve, reject) => {
        terminal.magenta( prompt ) ;
        terminal.inputField(...args, (err, data) => {
            if (err) return reject(err)
            resolve(data)
			newLine()
        })
    })
}

const booleanInput = (prompt, ...args) => {
    return new Promise((resolve, reject) => {
        terminal.magenta( prompt ) ;
        terminal.yesOrNo(...args, (err, data) => {
            if (err) return reject(err)
            resolve(data)
			newLine()
        })
    })
}

const newLine = () => {
	terminal.defaultColor("\n")
}

const isTest = process.argv[2] == "test"

const ROOT_DIR = "../../../../"

const { latestVersion, scriptModules, entryModule } = require("./version_data.js");


async function main() {
	terminal.red("Create Manifest File")
	newLine()
	terminal.defaultColor("--------------------")
	newLine()
	newLine()

	const projectName = await input("Project Name: ")
	const author = await input("Author: ")
	const description = await input(`Description: `, {
		autoComplete: (str) => {
			if (str == "")
			return `By ${author}`
		},
		default : `By ${author}`
	})

	const useScripts = await booleanInput(`Use Script API? (y/n): `, "n")

	const enabledModules = []

	if (useScripts) {
		newLine()
        terminal.magenta( "Select Script API Version: " ) ;
		const version = await menu([
			// "Release Stable",
			"Release Beta",
			// "Preview Stable",
			"Preview Beta",
		])

		for (const currentModule in scriptModules) {
			const useModule = await booleanInput(`use ${currentModule} module? (y/n): `, "n")
			if (useModule) enabledModules.push(currentModule)
		}
	}
	// change to use 2 sync todo before release
	const manifestRP = {
		"format_version": 2,
		"header": {
			"name": `${projectName} RP`,
			"description": description,
			"uuid": uuid(),
			"version": [1, 0, 0],
			"min_engine_version": latestVersion
		},
		"modules": [
			{
				"type": "resources",
				"uuid": uuid(),
				"version": [1, 0, 0]
			}
		],
		"dependencies": []
	}

	const manifestBP = {
		"format_version": 2,
		"header": {
			"name": `${projectName} BP`,
			"description": description,
			"uuid": uuid(),
			"version": [1, 0, 0],
			"min_engine_version": latestVersion
		},
		"modules": [
			{
				"type": "data",
				"uuid": uuid(),
				"version": [1, 0, 0]
			}
		],
		"dependencies": []
	}
	const sampleConfig = {
		"name": "Test Project",
		"author": "Hatchi",
		"packs": {
			"packs": {
				"behaviorPack": "./packs/BP",
				"resourcePack": "./packs/RP"
			},
		},
		"regolith": {
			"filterDefinitions": {
				"init-full": {}
			}
		}
	}
	const configJSON = isTest ? sampleConfig : JSON.parse(fs.readFileSync(`${ROOT_DIR}config.json`))
	const { resourcePack, behaviorPack } = configJSON.packs

	if (useScripts) {
		for (const currentModule of enabledModules) {
			manifestBP.dependencies.push({
				"module_name": currentModule,
				"version": scriptModules[currentModule].version
			})

		}

		if (enabledModules.includes(entryModule)) {
			manifestBP.modules.push({
				"type": "script",
				"language": "javascript",
				"uuid": uuid(),
				"version": [1, 0, 0],
				"entry": "scripts/main.js"
			})
			fs.mkdirSync(`${ROOT_DIR}${behaviorPack}/scripts/`, { recursive: true })
			fs.writeFileSync(`${ROOT_DIR}${behaviorPack}/scripts/main.js`, "")
		}
		// other dependencies do not work if script API is used.
	} else {
		manifestRP.dependencies.push({
			uuid: manifestBP.header.uuid,
			version: manifestBP.header.version
		})
		manifestBP.dependencies.push({
			uuid: manifestRP.header.uuid,
			version: manifestRP.header.version
		})
	}


	configJSON.author = author
	configJSON.name = projectName
	delete configJSON.regolith.filterDefinitions["init-full"]

	if (isTest) {
		fs.writeFileSync(`${ROOT_DIR}${resourcePack}/manifest.json`, JSON.stringify(manifestRP, null, 4))
		fs.writeFileSync(`${ROOT_DIR}${behaviorPack}/manifest.json`, JSON.stringify(manifestBP, null, 4))
		fs.writeFileSync(`${ROOT_DIR}config.json`, JSON.stringify(configJSON, null, 2))
	}
}

main()