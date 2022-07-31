const fs = require("fs")
const prompt = require('readline-sync');
const { v4: uuidv4 } = require('uuid');


const { latestVersion, gametestModules } = require('./version_data.js');

console.log("")
console.log("Create Manifest File")
console.log("--------------------")
console.log("")

const projectName = prompt.question("Project Name: ")
const author = prompt.question("Author: ")
const description = prompt.question(`Description: (By ${author}) `, {defaultInput: `By ${author}`})

let useGametestInput = "";
while (!(useGametestInput.match(/y|n/) && useGametestInput.length == 1)) {
    useGametestInput = prompt.question(`Use gametest scripts? (y/n): `, {defaultInput: "n"})
}
const useGametest = useGametestInput == "y"

const enabledGametestModules = {
	"mojang-minecraft": false,
	"mojang-gametest": false,
	"mojang-minecraft-server-admin": false,
	"mojang-minecraft-ui": false,
	"mojang-net": false,
}

if (useGametest) {
	for (const currentModule in enabledGametestModules) {
		let useModule = "";
		while (!(useModule.match(/y|n/) && useModule.length == 1)) {
			useModule = prompt.question(`use ${currentModule} module? (y/n): `, {defaultInput: "n"})
		}
		enabledGametestModules[currentModule] = useModule == "y"
	}
}
// change to use readline sync todo before release
const manifestRP = {
	"format_version": 2,
	"header": {
		"name": `${projectName} RP`,
		"description": description,
		"uuid": uuidv4(),
		"version": [1, 0, 0],
		"min_engine_version": latestVersion
	},
	"modules": [
		{
			"type": "resources",
			"uuid": uuidv4(),
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
		"uuid": uuidv4(),
		"version": [1, 0, 0],
		"min_engine_version": latestVersion
	},
	"modules": [
		{
			"type": "data",
			"uuid": uuidv4(),
			"version": [1, 0, 0]
		}
	],
	"dependencies": []
}


if (useGametest) {
	for (const currentModule in enabledGametestModules) {
		if (enabledGametestModules[currentModule]) {
			manifestBP.dependencies.push(gametestModules[currentModule])
		}
	}
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
fs.writeFileSync("../../packs/RP/manifest.json", JSON.stringify(manifestRP, null, "	"))
fs.writeFileSync("../../packs/BP/manifest.json", JSON.stringify(manifestBP, null, "	"))