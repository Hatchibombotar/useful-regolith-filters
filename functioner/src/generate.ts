import fs from "fs"
import path from "path"

export function generate(ast, filePath) {
    const new_lines: string[] = []
    for (const command_ast of ast.children) {
        if (command_ast.type == "comment") continue
        let command: string[] = []

        const loop_triggered = command_ast.args.at(0) == "execute" && command_ast.args.at(-1) == "repeat"
        const function_called = command_ast.args.at(0) == "function"
        const is_execute = command_ast.args.at(0) == "execute"

        if (function_called) {
            const resolvedPath = resolvePath(filePathToFunctionPath(path.parse(filePath).dir,), command_ast.args.at(1))

            command.push(
                `function ${resolvedPath}`
            )
            
            for (let index = 2; index < command_ast.args.length; index++) {
                const with_subcommand = command_ast.args.at(index)
                if (with_subcommand == undefined) break
                // 0    1       2     3      4
                // with <PARAM> <VALUE>
                // with <PARAM> score <TARGET> <OBJECTIVE>
                let value_type: "literal" | "score";
                if (command_ast.args.at(index + 2) == "score") {
                    value_type = "score"
                } else {
                    value_type = "literal"
                }
                let param_name = command_ast.args.at(index + 1)

                new_lines.push("scoreboard objectives add arguments dummy")
                if (value_type == "literal") {
                    let value = command_ast.args.at(index + 2)
                    new_lines.push(`scoreboard players set ${param_name} arguments ${value}`)
                    index += 2
                } else {
                    let target = command_ast.args.at(index + 3)
                    let objective = command_ast.args.at(index + 4)
                    console.log(target, objective, command_ast.args, index + 3)
                    new_lines.push(`scoreboard players operation ${param_name} argument = ${target} ${objective}`)
                    index += 4
                }

            }
        } else {
            for (let index = 0; index < command_ast.args.length; index++) {
                const argument = command_ast.args[index]
                if (loop_triggered && argument == "repeat") {
                    command.push(`run function ${filePathToFunctionPath(filePath)}`)
                } else if (typeof argument == "string") {
                    command.push(argument)
                } else if (argument.type == "subfunction") {
                    const { dir, name, ext } = path.parse(filePath)
                    const functionName = name + "-" + command_ast.line
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

        new_lines.push(command.join(" "))
    }
    const file_content = new_lines.join("\n")
    fs.writeFileSync(filePath, file_content)
}

function resolvePath(...paths: string[]) {
    const current_path: string[] = [];
    let split_paths: string[] = [];
    for (const [path_index, path] of Object.entries(paths)) {
        let current_split_path = path.split("/");

        // if path contains file, remove file from the path
        if (current_split_path[current_split_path.length - 1].includes(".") && (Number(path_index) != paths.length - 1)) {
            current_split_path.pop();
        }

        if (current_split_path[0] == ".." || current_split_path[0] == "." || path.at(0) == "/") {
            // if file path is relative
            split_paths = [...split_paths, ...current_split_path];
        } else {
            split_paths = current_split_path;
        }
    }

    for (const path of split_paths) {
        if (path == "" || path == ".")
            continue;

        if (path == "..") {
            // get out of current directory
            current_path.pop();
        } else {
            current_path.push(path);
        }
    }

    return current_path.join("/");
}

const joinPaths = (...paths) => {
    const new_paths = paths.filter((path) => path != "")
    return new_paths.join("/")
}

export function filePathToFunctionPath(filePath: string) {
    const { dir, name, ext } = path.parse(filePath)

    return joinPaths(path.relative("BP/functions", dir).replace(/\\/g, "/"), name)
}