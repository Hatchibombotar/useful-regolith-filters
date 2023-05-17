
const settings = JSON.parse(process.argv[2] ?? "{}")
const alias = {
	...settings.alias,
	"@vanilla": ""
}

for (const aliasKey in alias) {
	if (aliasKey[0] != "@") {
		console.error(`Alias ${aliasKey} does not start with an @ symbol.`)
		console.error(`Hint: Change ${aliasKey} to @${aliasKey}`)
	}
}

export function deepMerge(objects, maxLevel = 2, currentLevel = 0) {
	const isObject = (value) =>  Object.prototype.toString.call(value) === "[object Object]"
    let target = {}

    // deep merge the object into the target object
    function merger(obj) {
        for (let prop in obj) {
            if (isObject(obj[prop]) && (currentLevel != maxLevel)) {
                // if the property is a nested object
                target[prop] = deepMerge([target[prop], obj[prop]], maxLevel, currentLevel + 1)
            } else if (Array.isArray(obj[prop])) {
				target[prop] = target[prop] ?? []
				target[prop]= [...target[prop], ...obj[prop]]
			} else {
                // for regular property or when the max level has been reached
                target[prop] = obj[prop]
            }
        }
    }
    // iterate through all objects and deep merge them with target
    for (let i = 0; i < objects.length; i++) {
        merger(objects[i]);
    }

    return target;
}

export function orderBySpecificity(filePaths) {
	const specifity: {
		[file: string]: number
	} = {}

	for (let file of filePaths) {
		specifity[file] = file.split("/").length
	}
	// https://stackoverflow.com/a/1069840
	// sorts by the difference between each comparison
	// object => array (with value) -> sort => array (without value)
	// TODO: tidy up
	return Object.entries(specifity).sort(([ ,a], [ ,b]) => a-b).map(([path, ]) => path)
}

// based off of code by Waveplayz
// https://gist.github.com/WavePlayz/3ede5f50658b0e30a762d59564eadf75
export function commandArgs(content) {
    const spliters = /[\s\b]/
	
	const contentLength = content.length
	
	let cmdArguments: string[] = []
	let currentArgument: string = ""
	
	const SINGLE_QUOTE = "'"
	const DOUBLE_QUOTE = '"'
	const CURLY_BRACKETS = ["{", "}"]
	const ROUND_BRACKETS = ["(", ")"]
	const SQUARE_BRACKETS = ["[", "]"]

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
		
		currentArgument += currentCharacter
	}
	
	return cmdArguments
}

export function resolvePath(...paths: string[]) {
	const currentPath: string[] = [];
	let splitPaths: string[] = [];
	for (const [pathIndex, path] of Object.entries(paths)) {
		let currentSplitPath = path.split("/");

		// if path contains file, remove file from the path
		if (currentSplitPath[currentSplitPath.length - 1].includes(".") && (Number(pathIndex) != paths.length - 1)) {
			currentSplitPath.pop();
		}

		if (currentSplitPath[0] == ".." || currentSplitPath[0] == "." || path.at(0) == "/") {
			// if file path is relative
			splitPaths = [...splitPaths, ...currentSplitPath];
		} else if (currentSplitPath[0] in alias) {
			// if file path starts with an alias
			const aliasReplacement = alias[currentSplitPath[0]].split("/");
			currentSplitPath.splice(0, 1);
			splitPaths = [...aliasReplacement, ...currentSplitPath];
		} else {
			splitPaths = currentSplitPath;
		}
	}

	for (const path of splitPaths) {
		if (path == "" || path == ".")
			continue;

		if (path == "..") {
			// get out of current directory
			currentPath.pop();
		} else {
			currentPath.push(path);
		}
	}

	return currentPath.join("/");
}