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
function parse(code) {
  var _a;
  const ast = {
    children: []
  };
  const lines = code.split("\n");
  let currentScope = ast;
  for (const [lineNumber, line] of Object.entries(lines)) {
    const rawArgs = commandArgs(line.trim());
    const newArgs = [];
    let argScope = newArgs;
    for (const argumentIndex in rawArgs) {
      const argument = rawArgs[argumentIndex];
      if (argument.at(0) == "`" && argument.at(-1) == "`") {
        argScope.push(
          {
            "type": "rawtext",
            ...parseRawTextTemplate(argument.slice(1, -1))
          }
        );
      } else if (argScope.at(0) == "execute" && argument == "run" && rawArgs.at(Number(argumentIndex) + 1) != "{") {
        argScope.push(argument);
        const i = argScope.push({
          type: "subfunction",
          children: [
            {
              type: "command",
              args: []
            }
          ]
        }) - 1;
        argScope = argScope[i].children[0].args;
      } else {
        argScope.push(argument);
      }
    }
    if (newArgs.length == 0)
      continue;
    const isComment = ((_a = rawArgs == null ? void 0 : rawArgs.at(0)) == null ? void 0 : _a.at(0)) == "#";
    if (isComment && typeof newArgs[0] == "string") {
      currentScope.children.push({
        type: "comment",
        content: newArgs[0],
        line: Number(lineNumber)
      });
      continue;
    }
    const commandObject = {
      type: "command",
      args: newArgs,
      line: Number(lineNumber)
    };
    const commandIndex = currentScope.children.push(commandObject) - 1;
    if (rawArgs.at(rawArgs.length - 1) == "{") {
      newArgs[rawArgs.length - 1] = {
        type: "subfunction",
        children: [],
        parent: currentScope
      };
      currentScope = currentScope.children[commandIndex].args[newArgs.length - 1];
    } else if (rawArgs[0] == "}") {
      let previousScope = currentScope;
      if (currentScope.parent)
        currentScope = currentScope.parent;
      previousScope.parent = void 0;
      previousScope.children.splice(commandIndex, 1);
    }
  }
  return ast;
}
function commandArgs(inputContent) {
  const spliters = /[\s\b]/;
  const content = inputContent.trim();
  const contentLength = content.length;
  let cmdArguments = [];
  let currentArgument = "";
  const SINGLE_QUOTE = "'";
  const DOUBLE_QUOTE = '"';
  const BACKTICK = "`";
  const CURLY_BRACKETS = ["{", "}"];
  const ROUND_BRACKETS = ["(", ")"];
  const SQUARE_BRACKETS = ["[", "]"];
  const COMMENT = "#";
  let inComment = false;
  let brackets = {
    brackets: {
      [String(CURLY_BRACKETS)]: 0,
      [String(ROUND_BRACKETS)]: 0,
      [String(SQUARE_BRACKETS)]: 0
    },
    get isOpen() {
      return this.brackets[String(CURLY_BRACKETS)] || this.brackets[String(ROUND_BRACKETS)] || this.brackets[String(SQUARE_BRACKETS)];
    }
  };
  let quotes = {
    [SINGLE_QUOTE]: false,
    [DOUBLE_QUOTE]: false,
    [BACKTICK]: false,
    get isOpen() {
      return this[SINGLE_QUOTE] || this[DOUBLE_QUOTE] || this[BACKTICK];
    }
  };
  let escapeNextCharacter = false;
  for (let i = 0; i <= contentLength; i++) {
    const currentCharacter = content[i];
    if (currentCharacter == "/" && i == 0) {
      continue;
    }
    if (currentCharacter == "\\") {
      escapeNextCharacter = true;
      continue;
    }
    if (escapeNextCharacter) {
      currentArgument += currentCharacter;
      escapeNextCharacter = false;
      continue;
    }
    if (inComment) {
      if (currentCharacter === void 0) {
        if (currentArgument)
          cmdArguments.push(currentArgument);
        currentArgument = "";
      } else {
        currentArgument += currentCharacter;
      }
      continue;
    }
    if (currentCharacter in quotes) {
      quotes[currentCharacter] = !quotes[currentCharacter];
    }
    for (const key of Object.keys(brackets.brackets)) {
      const bracketElements = key.split(",");
      if (currentCharacter == bracketElements[0])
        brackets.brackets[key] += 1;
      if (currentCharacter == bracketElements[1])
        brackets.brackets[key] -= 1;
    }
    if (
      // quotes and brackets closed and there is a space
      !quotes.isOpen && !brackets.isOpen && spliters.test(currentCharacter) || currentCharacter === void 0
    ) {
      if (currentArgument)
        cmdArguments.push(currentArgument);
      currentArgument = "";
      continue;
    }
    if (currentCharacter == COMMENT)
      inComment = true;
    currentArgument += currentCharacter;
  }
  return cmdArguments;
}
function parseRawTextTemplate(str) {
  const rawtext = [];
  let escapeNextCharacter = false;
  let templatesOpened = 0;
  let currentText = "";
  for (const i of str) {
    if (i == "\\") {
      escapeNextCharacter = true;
    } else if (escapeNextCharacter) {
      escapeNextCharacter = false;
      currentText += i;
    } else if (i == "{" && templatesOpened != 0) {
      currentText += i;
      templatesOpened += 1;
    } else if (i == "{" && templatesOpened == 0) {
      templatesOpened += 1;
      rawtext.push(
        { "text": currentText }
      );
      currentText = "";
    } else if (i == "}" && templatesOpened > 1) {
      templatesOpened -= 1;
      currentText += i;
    } else if (i == "}" && templatesOpened == 1) {
      templatesOpened -= 1;
      const IS_SELECTOR = currentText.trim().at(0) == "@";
      const IS_RAWTEXT = currentText.trim().at(0) == "{" && currentText.trim().at(-1) == "}";
      const IS_SCORE = currentText.trim().match(/^([a-z]*)\[(.*)\]$/m);
      const IS_LANG = currentText.trim().match(/^[a-zA-Z0-9\.]*$/m);
      if (IS_SELECTOR) {
        rawtext.push(
          { "selector": currentText }
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
          { "translate": currentText }
        );
      } else if (IS_RAWTEXT) {
        rawtext.push(
          JSON.parse(currentText)
        );
      } else {
        console.error("Unexpected rawtext input:", currentText);
      }
      currentText = "";
    } else {
      currentText += i;
    }
  }
  if (currentText.length > 1) {
    rawtext.push(
      { "text": currentText }
    );
    currentText = "";
  }
  return {
    rawtext
  };
}

// src/generate.ts
var import_fs = __toESM(require("fs"));
var import_path = __toESM(require("path"));
function generate(ast, filePath) {
  const newLines = [];
  for (const commandAst of ast.children) {
    if (commandAst.type == "comment")
      continue;
    let command = [];
    const loopTriggered = commandAst.args.at(0) == "execute" && commandAst.args.at(-1) == "repeat";
    const functionCalled = commandAst.args.at(0) == "function";
    if (functionCalled) {
      const resolvedPath = resolvePath(filePathToFunctionPath(import_path.default.parse(filePath).dir), commandAst.args.at(1));
      command.push(
        `function ${resolvedPath}`
      );
    } else {
      for (const argument of commandAst.args) {
        if (loopTriggered && argument == "repeat") {
          command.push(`run function ${filePathToFunctionPath(filePath)}`);
        } else if (typeof argument == "string") {
          command.push(argument);
        } else if (argument.type == "subfunction") {
          const { dir, name, ext } = import_path.default.parse(filePath);
          const functionName = name + "-" + commandAst.line;
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
    newLines.push(command.join(" "));
  }
  const fileContent = newLines.join("\n");
  import_fs.default.writeFileSync(filePath, fileContent);
}
function resolvePath(...paths) {
  const currentPath = [];
  let splitPaths = [];
  for (const [pathIndex, path2] of Object.entries(paths)) {
    let currentSplitPath = path2.split("/");
    if (currentSplitPath[currentSplitPath.length - 1].includes(".") && Number(pathIndex) != paths.length - 1) {
      currentSplitPath.pop();
    }
    if (currentSplitPath[0] == ".." || currentSplitPath[0] == "." || path2.at(0) == "/") {
      splitPaths = [...splitPaths, ...currentSplitPath];
    } else {
      splitPaths = currentSplitPath;
    }
  }
  for (const path2 of splitPaths) {
    if (path2 == "" || path2 == ".")
      continue;
    if (path2 == "..") {
      currentPath.pop();
    } else {
      currentPath.push(path2);
    }
  }
  return currentPath.join("/");
}
var joinPaths = (...paths) => {
  const newPaths = paths.filter((path2) => path2 != "");
  return newPaths.join("/");
};
function filePathToFunctionPath(filePath) {
  const { dir, name, ext } = import_path.default.parse(filePath);
  return joinPaths(import_path.default.relative("BP/functions", dir).replace(/\\/g, "/"), name);
}

// src/main.ts
var settings = JSON.parse(process.argv[2] ?? "{}");
var searchPattern = settings.searchPattern ?? "BP/**/*.mcfunction";
function main() {
  for (const filePath of import_glob.default.sync(searchPattern)) {
    const func = String(import_fs2.default.readFileSync(filePath));
    const ast = parse(func);
    generate(ast, filePath);
  }
}
main();
