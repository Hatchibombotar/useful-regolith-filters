const fs = require("fs")
const glob = require("glob");

let scoreboardCount = 0
function newScoreboard() {
    scoreboardCount += 1
    return (`F_${scoreboardCount}`)
}

let tagCount = 0
function newTag() {
    tagCount += 1
    return (`F_${tagCount}`)
}

// extracts the block and data from a block in the format of block[data] where data can either be a numeric ID or block properties.
function blockFormat(input) {
    if (input.match(/\[(.*)\]/g)) {
        const block = input.replace(/\[(.*)\]/g, "")
        const data = input.match(/\[(.*)\]/g)[0].replace(/\[|\]/g, "")
        if (input.match(/\[[0-9]+\]/g)) { // numbers inside brackets
            return [block, `${data}`]
        } else if (data == "") { // nothing inside brackets
            return [block, "-1"]
        } else {
            return [block, `[${data}]`]
        }
    } else {
        return [input, "-1"]
    }
}

function combineUnusedArgs(topArgNum, input) {
    const newArgs = []
    for (let step = topArgNum; step < input.length; step++) {
        newArgs.push(input[step])
    }
    return newArgs.join(" ")
}

function makeModifications(modifications, fileContentArray) {
    for (mods of modifications.reverse()) {
        for (mod of mods.modifications.reverse()) {
            fileContentArray.splice(mods.line, 0, mod)
        }
    }
}

function timeFormat(input) {
    const snippedTime = input.substring(0, input.length - 1) // the time with last character removed
    const unit = input[input.length - 1] // the unit of time, or a number if none is given.
    if (unit == "d") {
        return 24000 * snippedTime
    } else if (unit == "m") {
        return 20 * 60 * snippedTime
    } else if (unit == "s") {
        return 20 * snippedTime
    } else if (unit == "t") {
        return snippedTime
    } else if (unit.match(/[0-9]/)) {
        return input
    } else {
        console.error("Invalid time format has been used.")
    }
}

// based off of code by Waveplayz
// https://gist.github.com/WavePlayz/3ede5f50658b0e30a762d59564eadf75
function getCommandArgs(content) {
	const spliters = /[\s\b]/
	
	const contentLength = content.length
	
	let arguments = []
	let currentArgument = ""
	
	const SINGLE_QUOTE = "'"
	const DOUBLE_QUOTE = '"'
	const CURLY_BRACKETS = ["{", "}"]
	const ROUND_BRACKETS = ["(", ")"]
	const SQUARE_BRACKETS = ["[", "]"]

	let brackets = {
		brackets: {
			[CURLY_BRACKETS]: 0,
			[ROUND_BRACKETS]: 0,
			[SQUARE_BRACKETS]: 0,
		},
		get isOpen() {
			return this.brackets[CURLY_BRACKETS] || this.brackets[ROUND_BRACKETS] || this.brackets[SQUARE_BRACKETS] 
		}
	}
	
	let quotes = {
		[SINGLE_QUOTE]: false,
		[DOUBLE_QUOTE]: false,
		get isOpen() {
			return this[SINGLE_QUOTE] || this[DOUBLE_QUOTE]
		}
	}
	
	let escapeNextCharacter = false
	for (let i = 0; i <= contentLength; i++) {
		const currentCharacter = content[i]

		if ( currentCharacter == "\\" ) {
			escapeNextCharacter = true
			continue
		}
		
		if (escapeNextCharacter) {
			currentArgument += currentCharacter
			escapeNextCharacter = false
			continue
		}

		// if character is a quote
		if (currentCharacter in quotes) {
			quotes[currentCharacter] = !quotes[currentCharacter]
		}

		// if character is a bracket
		for (key of Object.keys(brackets.brackets)) {
			bracketElements = key.split(",")
			if (currentCharacter == bracketElements[0]) brackets.brackets[key] += 1
			if (currentCharacter == bracketElements[1]) brackets.brackets[key] -= 1
		}
		
		if ( // quotes and brackets closed and there is a space
			!quotes.isOpen && !brackets.isOpen 
			&& spliters.test(currentCharacter)
			|| currentCharacter === undefined
		) {
			if (currentArgument) arguments.push(currentArgument)
			currentArgument = ""
			continue
		}
		
		currentArgument += currentCharacter
	}
	
	return arguments
}

function findDuplicates(input) {
	const duplicates = []
	const unique = []
	for (let i = 0; i < input.length; i++) {
		if (unique.includes(input[i])) {
			duplicates.push(input[i])
		} else {
			unique.push(input[i])
		}
	}
	return duplicates
}

function createFunction(name, commands) {
	this.name = name
	fs.writeFileSync(`BP/functions/${name}.mcfunction`, commands.join("\n"))
	return(name)
}

createFunction.prototype.push = function(commands) {
	const contents = fs.readFileSync(`BP/functions/${this.name}.mcfunction`).toString().split("\n")
	if (typeof commands == "string") {
		commands.push(contents)
	} else {
		for (i of commands) {
			commands.push(i)
		}
	}
	fs.writeFileSync(`BP/functions/${this.name}.mcfunction`, contents.join("\n"))
}

function getAllFunctions() {
	const settings = JSON.parse(process.argv[2] ?? "{}")
	const searchPattern = settings.searchPattern ?? "BP/**/*.mcfunction"
	// if (process.argv[2])  return glob.sync(JSON.parse(process.argv[2]).searchPattern) ?? glob.sync("BP/**/*.mcfunction")
	// else return glob.sync("BP/**/*.mcfunction")
	return glob.sync(searchPattern)
}

module.exports = { 
    newScoreboard, 
    newTag, 
    blockFormat, 
    combineUnusedArgs, 
    makeModifications,
    getCommandArgs,
	timeFormat,
	findDuplicates,
	createFunction,
	getAllFunctions,
}