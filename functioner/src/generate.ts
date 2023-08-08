import fs from "fs"
import path from "path"

export function generate(ast, filePath) {
    const newLines: string[] = []
    for (const commandAst of ast.children) {
        if (commandAst.type == "comment") continue
        let command: string[] = []

        const loopTriggered = commandAst.args.at(0) == "execute" && commandAst.args.at(-1) == "repeat"
        const functionCalled = commandAst.args.at(0) == "function"
        const is_execute = commandAst.args.at(0) == "execute"

        if (functionCalled) {
            const resolvedPath = resolvePath(filePathToFunctionPath(path.parse(filePath).dir,), commandAst.args.at(1))

            const with_subcommand = commandAst.args.at(2)
            command.push(
                `function ${resolvedPath}`
            )
            // 2    3       4     5      6
            // with <PARAM> <VALUE>
            // with <PARAM> score <TARGET> <OBJECTIVE>
            let value_type: "literal" | "score";
            if (commandAst.args.at(4) == "score") {
                value_type = "score"
            } else {
                value_type = "literal"
            }
            let param_name = commandAst.args.at(3)
            
            newLines.push("scoreboard objectives add arguments dummy")
            if (value_type == "literal") {
                let value = commandAst.args[4]
                newLines.push(`scoreboard players set ${param_name} arguments ${value}`)
            } else {
                let target = commandAst.args.at(5)
                let objective = commandAst.args.at(6)
                newLines.push(`scoreboard players operation ${param_name} argument = ${target} ${objective}`)
            }
        } else {
            for (let index = 0; index < commandAst.args.length; index++) {
                const argument = commandAst.args[index]
                if (loopTriggered && argument == "repeat") {
                    command.push(`run function ${filePathToFunctionPath(filePath)}`)
                } else if (argument == "with") {                    
                    continue
                } else if (typeof argument == "string") {
                    command.push(argument)
                } else if (argument.type == "subfunction") {
                    const { dir, name, ext } = path.parse(filePath)
                    const functionName = name + "-" + commandAst.line
                    const newPath = path.join(dir, functionName + ext)
                    const functionPath = filePathToFunctionPath(newPath)
    
                    generate(argument, newPath)
    
                    command.push("function " + functionPath)
                } else if (argument.type == "rawtext") {
                    command.push(JSON.stringify({
                        "rawtext": argument.rawtext
                    }))
                }
            }
        }

        newLines.push(command.join(" "))
    }
    const fileContent = newLines.join("\n")
    fs.writeFileSync(filePath, fileContent)
}

function resolvePath(...paths: string[]) {
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

const joinPaths = (...paths) => {
    const newPaths = paths.filter((path) => path != "")
    return newPaths.join("/")
}

export function filePathToFunctionPath(filePath) {
    const { dir, name, ext } = path.parse(filePath)

    return joinPaths(path.relative("BP/functions", dir).replace(/\\/g, "/"), name)
}