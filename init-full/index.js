const fs = require("fs")
const prompt = require("prompt-sync")({ sigint: true });
const { v4: uuid } = require("uuid");
const path = require("path")

const ROOT_DIR = "../../../../"

const { latestVersion, scriptModules, entryModule } = require("./version_data.js");

console.log("")
console.log("Create Manifest File")
console.log("--------------------")
console.log("")

console.log(path.resolve("./test.js"))
console.log(path.resolve(ROOT_DIR))

const projectName = prompt("Project Name: ")
const author = prompt("Author: ")
const description = prompt(`Description: (By ${author}) `, `By ${author}`)

let useScriptInput = "";
while (!(useScriptInput.match(/y|n/) && useScriptInput.length == 1)) {
	useScriptInput = prompt(`Use Script API? (y/n): `, "n")
}
const useScripts = useScriptInput == "y"

const enabledModules = []

if (useScripts) {
	for (const currentModule in scriptModules) {
		let useModule = "";
		while (!(useModule.match(/y|n/) && useModule.length == 1)) {
			useModule = prompt(`use ${currentModule} module? (y/n): `, "n")
		}
		if (useModule == "y") enabledModules.push(currentModule)
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


if (useScripts) {
	for (const currentModule of enabledModules) {
		if (enabledModules[currentModule]) {
			manifestBP.dependencies.push({
				module_name: currentModule,
				version: scriptModules[currentModule]
			})
		}
	}

	if (enabledModules.includes(entryModule)) {
		manifestBP.modules.push({
			"type": "script",
			"language": "javascript",
			"uuid": uuid(),
			"version": [1, 0, 0],
			"entry": "scripts/main.js"
		})
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

const configJSON = JSON.parse(fs.readFileSync(`${ROOT_DIR}config.json`))
const { resourcePack, behaviorPack } = configJSON.packs

console.log(path.resolve(`${ROOT_DIR}${resourcePack}/manifest.json`))

fs.writeFileSync(`${ROOT_DIR}${resourcePack}/manifest.json`, JSON.stringify(manifestRP, null, 4))
fs.writeFileSync(`${ROOT_DIR}${behaviorPack}/manifest.json`, JSON.stringify(manifestBP, null, 4))

configJSON.author = author
configJSON.name = projectName
delete configJSON.regolith.filterDefinitions["init-full"]

fs.writeFileSync(`${ROOT_DIR}config.json`, JSON.stringify(configJSON, null, 2))

prompt("Press enter to continue.")