const settings = JSON.parse(process.argv[2] ?? "{}")

export function parse(code) {
	const ast: any = {
		children: []
	}
	let lines = code.split("\n")
	if (lines[0].trim()[0] == "@" && lines.length == 1) {
		if ((settings.flags ?? []).includes(lines[0].trim())) {
			lines = lines.slice(1)
		}  else {
			return undefined
		}
	}

	let current_scope = ast
	for (const [line_number, line_content] of Object.entries<string>(lines)) {
		let raw_args: string[] = commandArgs(line_content.trim())
		const new_args: any[] = []

		if (raw_args.length == 0) continue

		if (raw_args[0][0] == "@") {
			if ((settings.flags ?? []).includes(raw_args[0])) {
				raw_args = raw_args.slice(1)
			} else {
				continue
			}
		}

		let arg_scope = new_args
		for (const argument_index in raw_args) {
			const argument = raw_args[argument_index]

			// include the following line if you want default rawtext objects to be parsed.
			// const isObject = argument.at(0) == "{" && argument.at(argument.length - 1) == "}"
			// const isObject = false
			// argScope.push(isObject ? { type: "rawtext", ...JSON.parse(argument)} : argument)

			if (argument.at(0) == "`" && argument.at(-1) == "`") {
				arg_scope.push(
					{
						"type": "rawtext",
						...parseRawTextTemplate(argument.slice(1, -1))
					}
				)
			} else if (arg_scope.at(0) == "execute" && argument == "run" && raw_args.at(Number(argument_index) + 1) != "{") {
				arg_scope.push(argument)

				const i = arg_scope.push({
					type: "subfunction",
					children: [
						{
							type: "command",
							args: []
						}
					]
				}) - 1
		
				arg_scope = arg_scope[i].children[0].args
			} else {
				arg_scope.push(argument)
			}
		}
		if (new_args.length == 0) continue


		const is_comment = raw_args?.at(0)?.at(0) == "#"

		if (is_comment && typeof new_args[0] == "string") {
			current_scope.children.push({
				type: "comment",
				content: new_args[0],
				line: Number(line_number)
			})
			continue
		}

		const command_object = {
			type: "command",
			args: new_args,
			line: Number(line_number)
		}

		const command_index = current_scope.children.push(command_object) - 1


		if (raw_args.at(raw_args.length - 1) == "{") {
			new_args[raw_args.length - 1] = {
				type: "subfunction",
				children: [],
				parent: current_scope
			}

			current_scope = current_scope.children[command_index].args[new_args.length - 1]
		} else if (raw_args[0] == "}") {
			let previous_scope = current_scope

			if (current_scope.parent) current_scope = current_scope.parent
			previous_scope.parent = undefined
			previous_scope.children.splice(command_index, 1)
		}
	}
	return ast
}

function commandArgs(input_content: string) {
	const spliters = /[\s\b]/
	const content = input_content.trim()

	let command_arguments: string[] = []
	let current_argument = ""

	const SINGLE_QUOTE = "'"
	const DOUBLE_QUOTE = '"'
	const BACKTICK = '`'
	const CURLY_BRACKETS = ["{", "}"]
	const ROUND_BRACKETS = ["(", ")"]
	const SQUARE_BRACKETS = ["[", "]"]
	const COMMENT = "#"

	let in_comment = false

	let brackets = {
		brackets: {
			[String(CURLY_BRACKETS)]: 0,
			[String(ROUND_BRACKETS)]: 0,
			[String(SQUARE_BRACKETS)]: 0,
		},
		get is_open() {
			return this.brackets[String(CURLY_BRACKETS)] || this.brackets[String(ROUND_BRACKETS)] || this.brackets[String(SQUARE_BRACKETS)]
		}
	}

	let quotes = {
		[SINGLE_QUOTE]: false,
		[DOUBLE_QUOTE]: false,
		[BACKTICK]: false,
		get is_open() {
			return this[SINGLE_QUOTE] || this[DOUBLE_QUOTE] || this[BACKTICK]
		}
	}

	let escape_next_character = false
	for (let i = 0; i <= content.length; i++) {
		const current_character = content[i]

		if (current_character == "/" && i == 0) {
			continue
		}

		if (current_character == "\\") {
			escape_next_character = true
			continue
		}

		if (escape_next_character) {
			current_argument += current_character
			escape_next_character = false
			continue
		}

		if (in_comment) {
			if (current_character === undefined) {
				if (current_argument) command_arguments.push(current_argument)
				current_argument = ""
			} else {
				current_argument += current_character
			}
			continue
		}

		// if character is a quote
		if (current_character in quotes) {
			quotes[current_character] = !quotes[current_character]
		}

		// if character is a bracket
		for (const key of Object.keys(brackets.brackets)) {
			const [open_bracket, close_bracket] = key.split(",")
			if (current_character == open_bracket) brackets.brackets[key] += 1
			if (current_character == close_bracket) brackets.brackets[key] -= 1
		}

		if ( // quotes and brackets closed and there is a space
			!quotes.is_open && !brackets.is_open
			&& spliters.test(current_character)
			|| current_character === undefined
		) {
			if (current_argument) command_arguments.push(current_argument)
			current_argument = ""
			continue
		}

		// if character is a comment
		if (current_character == COMMENT) in_comment = true

		current_argument += current_character
	}

	// if (currentArgument) {
	// 	cmdArguments.push(currentArgument)
	// }

	return command_arguments
}

function parseRawTextTemplate(str: string) {
	const rawtext: any[] = []
	let escape_next_character = false
	let templates_opened = 0
	let current_text = ""

	for (const i of str) {
		if (i == "\\") {
			escape_next_character = true
		} else if (escape_next_character) {
			escape_next_character = false
			current_text += i
		} else if (i == "{" && templates_opened != 0) {
			current_text += i
			templates_opened += 1
		} else if (i == "{" && templates_opened == 0) {
			templates_opened += 1
			rawtext.push(
				{ "text": current_text }
			)
			current_text = ""
		} else if (i == "}" && templates_opened > 1) {
			templates_opened -= 1
			current_text += i
		} else if (i == "}" && templates_opened == 1) {
			templates_opened -= 1
			const IS_SELECTOR = current_text.trim().at(0) == "@"
			const IS_RAWTEXT = current_text.trim().at(0) == "{" && current_text.trim().at(-1) == "}"
			const IS_SCORE = current_text.trim().match(/^([a-zA-Z0-9_-]*)\[(.*)\]$/m)
			const IS_LANG = current_text.trim().match(/^[a-zA-Z0-9\.]*$/m)
			if (IS_SELECTOR) {
				rawtext.push(
					{ "selector": current_text }
				)
			} else if (IS_SCORE) {
				const [, objective, name ] = IS_SCORE
				rawtext.push(
					{ 
						"score": {
							name, objective
						} 
					}
				)
			} else if (IS_LANG) {
				rawtext.push(
					{ "translate": current_text }
				)
			} else if (IS_RAWTEXT) {
				rawtext.push(
					JSON.parse(current_text)
				)
			} else {
				console.error("Unexpected rawtext input:", current_text)
			}
			current_text = ""
		} else {
			current_text += i
		}
	}
	if (current_text.length > 1) {
		rawtext.push(
			{ "text": current_text }
		)
		current_text = ""
	}
	return {
		rawtext
	}
}