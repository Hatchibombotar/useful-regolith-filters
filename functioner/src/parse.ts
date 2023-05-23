export function parse(code) {
	const ast: any = {
		children: []
	}
	const lines = code.split("\n")

	let currentScope = ast
	for (const [lineNumber, line] of Object.entries<string>(lines)) {
		const rawArgs: string[] = commandArgs(line.trim())
		const newArgs: any[] = []

		let argScope = newArgs
		for (const argument of rawArgs) {
			// include the following line if you want default rawtext objects to be parsed.
			// const isObject = argument.at(0) == "{" && argument.at(argument.length - 1) == "}"
			// const isObject = false
			// argScope.push(isObject ? { type: "rawtext", ...JSON.parse(argument)} : argument)

			if (argument.at(0) == "`" && argument.at(-1) == "`") {
				argScope.push(
					{
						"type": "rawtext",
						...parseRawTextTemplate(argument.slice(1, -1))
					}
					)
				console.log(argScope.at(-1))
			} else if (argScope.at(0) == "execute" && argument == "run") {
				const i = argScope.push({
					type: "subfunction",
					children: [
						{
							type: "command",
							args: []
						}
					]
				}) - 1
		
				argScope = argScope[i].children[0].args
			} else {
				argScope.push(argument)
			}
		}

		if (newArgs.length == 0) continue

		const isComment = rawArgs?.at(0)?.at(0) == "#"

		if (isComment && typeof newArgs[0] == "string") {
			currentScope.children.push({
				type: "comment",
				content: newArgs[0],
				line: Number(lineNumber)
			})
			continue
		}

		const commandObject = {
			type: "command",
			args: newArgs,
			line: Number(lineNumber)
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

	let cmdArguments: string[] = []
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
			[String(CURLY_BRACKETS)]: 0,
			[String(ROUND_BRACKETS)]: 0,
			[String(SQUARE_BRACKETS)]: 0,
		},
		get isOpen() {
			return this.brackets[String(CURLY_BRACKETS)] || this.brackets[String(ROUND_BRACKETS)] || this.brackets[String(SQUARE_BRACKETS)]
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
		for (const key of Object.keys(brackets.brackets)) {
			const bracketElements = key.split(",")
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

function parseRawTextTemplate(str) {
	const rawtext: any[] = []
	let escapeNextCharacter = false
	let templatesOpened = 0
	let currentText = ""

	for (const i of str) {
		if (i == "\\") {
			escapeNextCharacter = true
		} else if (escapeNextCharacter) {
			escapeNextCharacter = false
			currentText += i
		} else if (i == "{" && templatesOpened != 0) {
			currentText += i
			templatesOpened += 1
		} else if (i == "{" && templatesOpened == 0) {
			templatesOpened += 1
			rawtext.push(
				{ "text": currentText }
			)
			currentText = ""
		} else if (i == "}" && templatesOpened > 1) {
			templatesOpened -= 1
			currentText += i
		} else if (i == "}" && templatesOpened == 1) {
			templatesOpened -= 1
			const IS_SELECTOR = currentText.trim().at(0) == "@"
			const IS_RAWTEXT = currentText.trim().at(0) == "{" && currentText.trim().at(-1) == "}"
			const IS_SCORE = currentText.trim().match(/^([a-z]*)\[(.*)\]$/m)
			const IS_LANG = currentText.trim().match(/^[a-zA-Z0-9\.]*$/m)
			if (IS_SELECTOR) {
				rawtext.push(
					{ "selector": currentText }
				)
			} else if (IS_SCORE) {
				const [,objective, name ] = IS_SCORE
				rawtext.push(
					{ 
						"score": {
							name, objective
						} 
					}
				)
			} else if (IS_LANG) {
				rawtext.push(
					{ "translate": currentText }
				)
			} else if (IS_RAWTEXT) {
				rawtext.push(
					JSON.parse(currentText)
				)
			} else {
				console.error("Unexpected rawtext input:", currentText)
			}
			currentText = ""
		} else {
			currentText += i
		}
	}
	if (currentText.length > 1) {
		rawtext.push(
			{ "text": currentText }
		)
		currentText = ""
	}
	return {
		rawtext
	}
}