var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/main.ts
var import_fs2 = __toESM(require("fs"));
var import_glob = __toESM(require("glob"));

// src/parse.ts
var settings = JSON.parse(process.argv[2] ?? "{}");
function parse(code) {
  var _a;
  const ast = {
    children: []
  };
  let lines = code.split("\n");
  if (lines[0].trim()[0] == "@" && lines.length == 1) {
    if ((settings.flags ?? []).includes(lines[0].trim())) {
      lines = lines.slice(1);
    } else {
      return void 0;
    }
  }
  let current_scope = ast;
  for (const [line_number, line_content] of Object.entries(lines)) {
    let raw_args = commandArgs(line_content.trim());
    const new_args = [];
    if (raw_args.length == 0)
      continue;
    if (raw_args[0][0] == "@") {
      if ((settings.flags ?? []).includes(raw_args[0])) {
        raw_args = raw_args.slice(1);
      } else {
        continue;
      }
    }
    let arg_scope = new_args;
    for (const argument_index in raw_args) {
      const argument = raw_args[argument_index];
      if (argument.at(0) == "`" && argument.at(-1) == "`") {
        arg_scope.push(
          {
            "type": "rawtext",
            ...parseRawTextTemplate(argument.slice(1, -1))
          }
        );
      } else if (arg_scope.at(0) == "execute" && argument == "run" && raw_args.at(Number(argument_index) + 1) != "{") {
        arg_scope.push(argument);
        const i = arg_scope.push({
          type: "subfunction",
          children: [
            {
              type: "command",
              args: []
            }
          ]
        }) - 1;
        arg_scope = arg_scope[i].children[0].args;
      } else {
        arg_scope.push(argument);
      }
    }
    if (new_args.length == 0)
      continue;
    const is_comment = ((_a = raw_args == null ? void 0 : raw_args.at(0)) == null ? void 0 : _a.at(0)) == "#";
    if (is_comment && typeof new_args[0] == "string") {
      current_scope.children.push({
        type: "comment",
        content: new_args[0],
        line: Number(line_number)
      });
      continue;
    }
    const command_object = {
      type: "command",
      args: new_args,
      line: Number(line_number)
    };
    const command_index = current_scope.children.push(command_object) - 1;
    if (raw_args.at(raw_args.length - 1) == "{") {
      new_args[raw_args.length - 1] = {
        type: "subfunction",
        children: [],
        parent: current_scope
      };
      current_scope = current_scope.children[command_index].args[new_args.length - 1];
    } else if (raw_args[0] == "}") {
      let previous_scope = current_scope;
      if (current_scope.parent)
        current_scope = current_scope.parent;
      previous_scope.parent = void 0;
      previous_scope.children.splice(command_index, 1);
    }
  }
  return ast;
}
function commandArgs(input_content) {
  const spliters = /[\s\b]/;
  const content = input_content.trim();
  let command_arguments = [];
  let current_argument = "";
  const SINGLE_QUOTE = "'";
  const DOUBLE_QUOTE = '"';
  const BACKTICK = "`";
  const CURLY_BRACKETS = ["{", "}"];
  const ROUND_BRACKETS = ["(", ")"];
  const SQUARE_BRACKETS = ["[", "]"];
  const COMMENT = "#";
  let in_comment = false;
  let brackets = {
    brackets: {
      [String(CURLY_BRACKETS)]: 0,
      [String(ROUND_BRACKETS)]: 0,
      [String(SQUARE_BRACKETS)]: 0
    },
    get is_open() {
      return this.brackets[String(CURLY_BRACKETS)] || this.brackets[String(ROUND_BRACKETS)] || this.brackets[String(SQUARE_BRACKETS)];
    }
  };
  let quotes = {
    [SINGLE_QUOTE]: false,
    [DOUBLE_QUOTE]: false,
    [BACKTICK]: false,
    get is_open() {
      return this[SINGLE_QUOTE] || this[DOUBLE_QUOTE] || this[BACKTICK];
    }
  };
  let escape_next_character = false;
  for (let i = 0; i <= content.length; i++) {
    const current_character = content[i];
    if (current_character == "/" && i == 0) {
      continue;
    }
    if (current_character == "\\") {
      escape_next_character = true;
      continue;
    }
    if (escape_next_character) {
      current_argument += current_character;
      escape_next_character = false;
      continue;
    }
    if (in_comment) {
      if (current_character === void 0) {
        if (current_argument)
          command_arguments.push(current_argument);
        current_argument = "";
      } else {
        current_argument += current_character;
      }
      continue;
    }
    if (current_character in quotes) {
      quotes[current_character] = !quotes[current_character];
    }
    for (const key of Object.keys(brackets.brackets)) {
      const [open_bracket, close_bracket] = key.split(",");
      if (current_character == open_bracket)
        brackets.brackets[key] += 1;
      if (current_character == close_bracket)
        brackets.brackets[key] -= 1;
    }
    if (
      // quotes and brackets closed and there is a space
      !quotes.is_open && !brackets.is_open && spliters.test(current_character) || current_character === void 0
    ) {
      if (current_argument)
        command_arguments.push(current_argument);
      current_argument = "";
      continue;
    }
    if (current_character == COMMENT)
      in_comment = true;
    current_argument += current_character;
  }
  return command_arguments;
}
function parseRawTextTemplate(str) {
  const rawtext = [];
  let escape_next_character = false;
  let templates_opened = 0;
  let current_text = "";
  for (const i of str) {
    if (i == "\\") {
      escape_next_character = true;
    } else if (escape_next_character) {
      escape_next_character = false;
      current_text += i;
    } else if (i == "{" && templates_opened != 0) {
      current_text += i;
      templates_opened += 1;
    } else if (i == "{" && templates_opened == 0) {
      templates_opened += 1;
      rawtext.push(
        { "text": current_text }
      );
      current_text = "";
    } else if (i == "}" && templates_opened > 1) {
      templates_opened -= 1;
      current_text += i;
    } else if (i == "}" && templates_opened == 1) {
      templates_opened -= 1;
      const IS_SELECTOR = current_text.trim().at(0) == "@";
      const IS_RAWTEXT = current_text.trim().at(0) == "{" && current_text.trim().at(-1) == "}";
      const IS_SCORE = current_text.trim().match(/^([a-zA-Z_-]*)\[(.*)\]$/m);
      const IS_LANG = current_text.trim().match(/^[a-zA-Z0-9\.]*$/m);
      if (IS_SELECTOR) {
        rawtext.push(
          { "selector": current_text }
        );
      } else if (IS_SCORE) {
        const [, objective, name] = IS_SCORE;
        rawtext.push(
          {
            "score": {
              name,
              objective
            }
          }
        );
      } else if (IS_LANG) {
        rawtext.push(
          { "translate": current_text }
        );
      } else if (IS_RAWTEXT) {
        rawtext.push(
          JSON.parse(current_text)
        );
      } else {
        console.error("Unexpected rawtext input:", current_text);
      }
      current_text = "";
    } else {
      current_text += i;
    }
  }
  if (current_text.length > 1) {
    rawtext.push(
      { "text": current_text }
    );
    current_text = "";
  }
  return {
    rawtext
  };
}

// src/generate.ts
var import_fs = __toESM(require("fs"));
var import_path = __toESM(require("path"));
function generate(ast, filePath) {
  const new_lines = [];
  for (const command_ast of ast.children) {
    if (command_ast.type == "comment")
      continue;
    let command = [];
    const loop_triggered = command_ast.args.at(0) == "execute" && command_ast.args.at(-1) == "repeat";
    const function_called = command_ast.args.at(0) == "function";
    const is_execute = command_ast.args.at(0) == "execute";
    if (function_called) {
      const resolvedPath = resolvePath(filePathToFunctionPath(import_path.default.parse(filePath).dir), command_ast.args.at(1));
      command.push(
        `function ${resolvedPath}`
      );
      for (let index = 2; index < command_ast.args.length; index++) {
        const with_subcommand = command_ast.args.at(index);
        if (with_subcommand == void 0)
          break;
        let value_type;
        if (command_ast.args.at(index + 2) == "score") {
          value_type = "score";
        } else {
          value_type = "literal";
        }
        let param_name = command_ast.args.at(index + 1);
        new_lines.push("scoreboard objectives add arguments dummy");
        if (value_type == "literal") {
          let value = command_ast.args.at(index + 2);
          new_lines.push(`scoreboard players set ${param_name} arguments ${value}`);
          index += 2;
        } else {
          let target = command_ast.args.at(index + 3);
          let objective = command_ast.args.at(index + 4);
          console.log(target, objective, command_ast.args, index + 3);
          new_lines.push(`scoreboard players operation ${param_name} argument = ${target} ${objective}`);
          index += 4;
        }
      }
    } else {
      for (let index = 0; index < command_ast.args.length; index++) {
        const argument = command_ast.args[index];
        if (loop_triggered && argument == "repeat") {
          command.push(`run function ${filePathToFunctionPath(filePath)}`);
        } else if (typeof argument == "string") {
          command.push(argument);
        } else if (argument.type == "subfunction") {
          const { dir, name, ext } = import_path.default.parse(filePath);
          const functionName = name + "-" + command_ast.line;
          const newPath = import_path.default.join(dir, functionName + ext);
          const functionPath = filePathToFunctionPath(newPath);
          generate(argument, newPath);
          command.push("function " + functionPath);
        } else if (argument.type == "rawtext") {
          command.push(JSON.stringify({
            "rawtext": argument.rawtext
          }));
        }
      }
    }
    new_lines.push(command.join(" "));
  }
  const file_content = new_lines.join("\n");
  import_fs.default.writeFileSync(filePath, file_content);
}
function resolvePath(...paths) {
  const current_path = [];
  let split_paths = [];
  for (const [path_index, path2] of Object.entries(paths)) {
    let current_split_path = path2.split("/");
    if (current_split_path[current_split_path.length - 1].includes(".") && Number(path_index) != paths.length - 1) {
      current_split_path.pop();
    }
    if (current_split_path[0] == ".." || current_split_path[0] == "." || path2.at(0) == "/") {
      split_paths = [...split_paths, ...current_split_path];
    } else {
      split_paths = current_split_path;
    }
  }
  for (const path2 of split_paths) {
    if (path2 == "" || path2 == ".")
      continue;
    if (path2 == "..") {
      current_path.pop();
    } else {
      current_path.push(path2);
    }
  }
  return current_path.join("/");
}
var joinPaths = (...paths) => {
  const new_paths = paths.filter((path2) => path2 != "");
  return new_paths.join("/");
};
function filePathToFunctionPath(filePath) {
  const { dir, name, ext } = import_path.default.parse(filePath);
  return joinPaths(import_path.default.relative("BP/functions", dir).replace(/\\/g, "/"), name);
}

// src/main.ts
var settings2 = JSON.parse(process.argv[2] ?? "{}");
var search_pattern = settings2.searchPattern ?? "BP/**/*.mcfunction";
function main() {
  for (const file_path of import_glob.default.sync(search_pattern)) {
    const func = String(import_fs2.default.readFileSync(file_path));
    const ast = parse(func);
    if (ast == void 0) {
      import_fs2.default.rmSync(file_path);
      continue;
    }
    generate(ast, file_path);
  }
}
main();
