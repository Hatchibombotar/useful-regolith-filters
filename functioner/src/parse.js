function parse(code) {
    const ast = {
        children: []
    }
    const lines = code.split("\n")

    let currentScope = ast
    for (const [lineNumber, line] of Object.entries(lines)) {
        const rawArgs = commandArgs(line.trim())
        const newArgs = []

        for (const argument of rawArgs) {
            // include the following line if you want rawtext to be parsed.
            // const isObject = argument.at(0) == "{" && argument.at(argument.length - 1) == "}"
            const isObject = false

            newArgs.push(isObject ? JSON.parse(argument) : argument)
        }

        if (newArgs.length == 0) continue

        const isComment = rawArgs.at(0).at(0) == "#"

        if (isComment) {
            currentScope.children.push({
                type: "comment",
                content: newArgs[0],
                line: lineNumber
            })
            continue
        }

        const commandObject = {
            type: "command",
            args: newArgs,
            line: lineNumber
        }

        const commandIndex = currentScope.children.push(commandObject) - 1

        if (rawArgs.at(rawArgs.length - 1) == "{") {
            newArgs[rawArgs.length - 1] = {
                type: "subfunction",
                children: [],
                parent: currentScope
            }

            currentScope = currentScope.children[commandIndex].args[newArgs.length - 1]
        } else if (rawArgs[0] == "}") {
            let previousScope = currentScope

            if (currentScope.parent) currentScope = currentScope.parent
            previousScope.parent = undefined
            previousScope.children.splice(commandIndex, 1)
        }
    }
    return ast
}

function commandArgs(inputContent) {
	const spliters = /[\s\b]/
	const content = inputContent.trim()

	const contentLength = content.length

	let cmdArguments = []
	let currentArgument = ""

	const SINGLE_QUOTE = "'"
	const DOUBLE_QUOTE = '"'
	const CURLY_BRACKETS = ["{", "}"]
	const ROUND_BRACKETS = ["(", ")"]
	const SQUARE_BRACKETS = ["[", "]"]
	const COMMENT = "#"

	let inComment = false

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

		if (currentCharacter == "/" && i == 0) {
			continue
		}

		if (currentCharacter == "\\") {
			escapeNextCharacter = true
			continue
		}

		if (escapeNextCharacter) {
			currentArgument += currentCharacter
			escapeNextCharacter = false
			continue
		}

		if (inComment) {
			if (currentCharacter === undefined) {
				if (currentArgument) cmdArguments.push(currentArgument)
				currentArgument = ""
			} else {
				currentArgument += currentCharacter
			}
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
			if (currentArgument) cmdArguments.push(currentArgument)
			currentArgument = ""
			continue
		}

		// if character is a comment
		if (currentCharacter == COMMENT) inComment = true

		currentArgument += currentCharacter
	}

	// if (currentArgument) {
	// 	cmdArguments.push(currentArgument)
	// }

	return cmdArguments
}

module.exports = {
    parse
}