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

// src/FileSystem.ts
var import_fs = __toESM(require("fs"));
var import_glob = require("glob");
var import_path = __toESM(require("path"));
var JSONC = require("jsonc").safe;
var File = class {
  constructor(path) {
    this.path = path;
  }
  save(content) {
    if (!import_fs.default.existsSync(this.metadata.dir)) {
      import_fs.default.mkdirSync(this.metadata.dir, { recursive: true });
    }
    if (typeof content == "string") {
      import_fs.default.writeFileSync(this.path, content);
    } else if (typeof content == "object") {
      import_fs.default.writeFileSync(this.path, JSON.stringify(content, null, 4));
    }
  }
  buffer() {
    return import_fs.default.readFileSync(this.path);
  }
  string() {
    return String(this.buffer());
  }
  jsonc() {
    const [parseError, jsonContent] = JSONC.parse(this.string());
    if (parseError)
      throw parseError;
    return jsonContent;
  }
  get metadata() {
    const { root, dir, base, name, ext } = import_path.default.parse(this.path);
    const isDirectory = import_fs.default.existsSync(this.path) ? import_fs.default.lstatSync(this.path).isDirectory() : void 0;
    return {
      root,
      dir,
      base,
      name,
      extension: ext,
      isDirectory
    };
  }
  move(toDirectory, options) {
    const safe = (options == null ? void 0 : options.safe) ?? true;
    if (this.path == `${toDirectory}/${this.metadata.base}`) {
      return;
    }
    if (!import_fs.default.existsSync(toDirectory)) {
      import_fs.default.mkdirSync(toDirectory, { recursive: true });
    }
    let pathSuffix = 0;
    const newPath = () => `${toDirectory}/${this.metadata.name}${pathSuffix != 0 ? pathSuffix : ""}${this.metadata.extension}`;
    if (safe) {
      while (import_fs.default.existsSync(newPath())) {
        pathSuffix += 1;
      }
    }
    import_fs.default.renameSync(this.path, newPath());
  }
  delete() {
    import_fs.default.rmSync(this.path, { recursive: true });
  }
  get contents() {
    if (!this.metadata.isDirectory)
      return [];
    return import_fs.default.readdirSync(this.path).map(
      (path) => new File(path)
    );
  }
};
function read(path) {
  return new File(path);
}
function glob(pattern, options) {
  return (0, import_glob.sync)(pattern, options).map((fileName) => read(fileName));
}
function write(path, content) {
  const file = new File(path);
  file.save(content);
  return file;
}

// src/utils.ts
var settings = JSON.parse(process.argv[2] ?? "{}");
var alias = {
  ...settings.alias,
  "@vanilla": ""
};
for (const aliasKey in alias) {
  if (aliasKey[0] != "@") {
    console.error(`Alias ${aliasKey} does not start with an @ symbol.`);
    console.error(`Hint: Change ${aliasKey} to @${aliasKey}`);
  }
}
function deepMerge(objects, maxLevel = 2, currentLevel = 0) {
  const isObject = (value) => Object.prototype.toString.call(value) === "[object Object]";
  let target = {};
  function merger(obj) {
    for (let prop in obj) {
      if (isObject(obj[prop]) && currentLevel != maxLevel) {
        target[prop] = deepMerge([target[prop], obj[prop]], maxLevel, currentLevel + 1);
      } else if (Array.isArray(obj[prop])) {
        target[prop] = target[prop] ?? [];
        target[prop] = [...target[prop], ...obj[prop]];
      } else {
        target[prop] = obj[prop];
      }
    }
  }
  for (let i = 0; i < objects.length; i++) {
    merger(objects[i]);
  }
  return target;
}
function orderBySpecificity(filePaths) {
  const specifity = {};
  for (let file of filePaths) {
    specifity[file] = file.split("/").length;
  }
  return Object.entries(specifity).sort(([, a], [, b]) => a - b).map(([path]) => path);
}
function commandArgs(content) {
  const spliters = /[\s\b]/;
  const contentLength = content.length;
  let cmdArguments = [];
  let currentArgument = "";
  const SINGLE_QUOTE = "'";
  const DOUBLE_QUOTE = '"';
  const CURLY_BRACKETS = ["{", "}"];
  const ROUND_BRACKETS = ["(", ")"];
  const SQUARE_BRACKETS = ["[", "]"];
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
    get isOpen() {
      return this[SINGLE_QUOTE] || this[DOUBLE_QUOTE];
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
    currentArgument += currentCharacter;
  }
  return cmdArguments;
}
function resolvePath(...paths) {
  const currentPath = [];
  let splitPaths = [];
  for (const [pathIndex, path] of Object.entries(paths)) {
    let currentSplitPath = path.split("/");
    if (currentSplitPath[currentSplitPath.length - 1].includes(".") && Number(pathIndex) != paths.length - 1) {
      currentSplitPath.pop();
    }
    if (currentSplitPath[0] == ".." || currentSplitPath[0] == ".") {
      splitPaths = [...splitPaths, ...currentSplitPath];
    } else if (currentSplitPath[0] in alias) {
      const aliasReplacement = alias[currentSplitPath[0]].split("/");
      currentSplitPath.splice(0, 1);
      splitPaths = [...aliasReplacement, ...currentSplitPath];
    } else if (path.at(0) == "/") {
      splitPaths = [...splitPaths, ...currentSplitPath];
    } else {
      splitPaths = currentSplitPath;
    }
  }
  for (const path of splitPaths) {
    if (path == "" || path == ".")
      continue;
    if (path == "..") {
      currentPath.pop();
    } else {
      currentPath.push(path);
    }
  }
  return currentPath.join("/");
}

// src/lang.ts
function parse(texts) {
  let jsonTexts = {};
  for (const translation of texts.split("\n")) {
    if ([translation[0], translation[1]].includes("#"))
      continue;
    if (translation == "")
      continue;
    const [key, value] = translation.split("=");
    jsonTexts[key] = value;
  }
  return jsonTexts;
}
function stringify(jsonTexts) {
  let texts = [];
  for (const key in jsonTexts) {
    texts.push(`${key}=${jsonTexts[key]}`);
  }
  return texts.join("\n");
}

// src/config.ts
var settings2 = JSON.parse(process.argv[2] ?? "{}");
var JSON_FEATURES_BP = {
  "minecraft:entity": "BP/entities",
  "minecraft:block": "BP/blocks",
  "minecraft:item": "BP/items",
  "pools": "BP/loot_tables",
  "minecraft:recipe_shapeless": "BP/recipes",
  "minecraft:recipe_shaped": "BP/recipes",
  "minecraft:recipe_furnace": "BP/recipes",
  "minecraft:recipe_brewing_container": "BP/recipes",
  "minecraft:recipe_brewing_mix": "BP/recipes",
  "minecraft:spawn_rules": "BP/spawn_rules",
  "tiers": "BP/trading",
  "animation_controllers": "BP/animation_controllers",
  "animations": "BP/animations",
  ...settings2.JSON_FEATURES_BP ?? []
};
var JSON_FEATURES_RP = {
  "minecraft:attachable": "RP/attachables",
  "minecraft:client_entity": "RP/entity",
  "minecraft:fog_settings": "RP/fogs",
  "minecraft:geometry": "RP/models/entity",
  "particle_effect": "RP/particles",
  "render_controllers": "RP/render_controllers",
  "namespace": "RP/ui",
  "animation_controllers": "RP/animation_controllers",
  "animations": "RP/animations",
  ...settings2.JSON_FEATURES_RP ?? []
};
var CUMULATIVE_JSON_FILES = {
  "biomes_client.json": "RP",
  "blocks.json": "RP",
  "sounds.json": "RP",
  "_global_variables.json": "RP/ui",
  "_ui_defs.json": "RP/ui",
  "flipbook_textures.json": "RP/textures",
  "item_texture.json": "RP/textures",
  "terrain_texture.json": "RP/textures",
  "mobs.json": "RP/models",
  "music_definitions.json": "RP/sounds",
  "sound_definitions.json": "RP/sounds",
  "language_names.json": "RP/texts",
  "languages.json": "RP/texts",
  "tick.json": "BP/functions",
  ...settings2.CUMULATIVE_JSON_FILES ?? []
};
var SOUND_EXTENTIONS = [".fsb", ".ogg", ".wav", ".mp3", ...settings2.SOUND_EXTENTIONS ?? []];
var IMAGE_EXTENTIONS = [".png", ".tga", ".jpg", ".jpeg", ...settings2.IMAGE_EXTENTIONS ?? []];
var IGNORE_FILES = ["pack_icon.png", ...settings2.IGNORE_FILES ?? []];

// src/main.ts
async function main() {
  const toBeMerged = {};
  const materialFiles = {};
  const languageFiles = {
    "BP": {},
    "RP": {}
  };
  const BP = glob("BP/**/*");
  const RP = glob("RP/**/*");
  for (const file of BP) {
    if (IGNORE_FILES.includes(file.metadata.base))
      continue;
    if (file.metadata.extension === ".json") {
      if (file.metadata.base === "tick.json") {
        const content = file.jsonc();
        content.values = content.values.map(
          (path) => resolvePath(file.path, path)
        );
        file.save(content);
      } else if (file.metadata.base === "manifest.json") {
        const content = file.jsonc();
        content.modules = content.modules.map(
          (module2) => {
            if (module2.entry) {
              module2.entry = resolvePath("scripts", file.path, module2.entry);
            }
            return module2;
          }
        );
        file.save(content);
      } else {
        const foundParentName = Object.keys(JSON_FEATURES_BP).find(
          (parent) => parent in file.jsonc()
        );
        if (foundParentName) {
          const isComponentBased = ["minecraft:entity", "minecraft:item", "minecraft:block"].includes(foundParentName);
          if (isComponentBased) {
            const content = file.jsonc();
            for (const eventName in content[foundParentName].events) {
              const event = content[foundParentName].events[eventName];
              for (const eventType in event) {
                if (eventType === "run_command") {
                  const commandObj = event[eventType].command;
                  for (let command in commandObj) {
                    commandObj[command] = processCommand(commandObj[command], file.path);
                  }
                }
              }
            }
            file.save(content);
          } else if (foundParentName == "animations") {
            const content = file.jsonc();
            for (const key in content.animations) {
              const anim = content.animations[key];
              for (const timestamp in anim.timeline) {
                let actions = anim.timeline[timestamp];
                content.animations[key].timeline[timestamp] = actions.map(
                  (action) => action.at(0) == "/" ? "/" + processCommand(action, file.path) : action
                );
              }
            }
            file.save(content);
          }
          file.move(JSON_FEATURES_BP[foundParentName], { safe: true });
        }
      }
      if (file.metadata.base in CUMULATIVE_JSON_FILES) {
        if (toBeMerged[file.metadata.base] == void 0) {
          toBeMerged[file.metadata.base] = [file.path];
        } else {
          toBeMerged[file.metadata.base].push(file.path);
        }
      }
    } else if (file.metadata.extension == ".mcfunction") {
      const content = file.string();
      const fileLines = content.split("\n");
      for (const commandIndex in fileLines) {
        fileLines[commandIndex] = processCommand(fileLines[commandIndex], file.path);
      }
      file.save(fileLines.join("\n"));
      file.move(`BP/functions/${file.metadata.dir}`);
    } else if (file.metadata.extension == ".js" || file.metadata.extension == ".ts") {
      file.move(`BP/scripts/${file.metadata.dir}`);
    } else if (file.metadata.extension == ".lang") {
      file.move(`BP/texts/`);
    } else if (file.metadata.extension == ".mcstructure") {
      file.move(`BP/structures/`);
    }
  }
  for (const file of RP) {
    if (IGNORE_FILES.includes(file.metadata.base))
      continue;
    if (file.metadata.extension == ".json") {
      if (file.metadata.base == "flipbook_textures.json") {
        const content = file.jsonc().map(
          (flipbook) => {
            flipbook.flipbook_texture = resolvePath("textures", file.path, flipbook.flipbook_texture);
            return flipbook;
          }
        );
        file.save(content);
      } else if (["terrain_texture.json", "item_texture.json"].includes(file.metadata.base)) {
        const content = file.jsonc();
        for (const blockName in content.texture_data) {
          let block = content.texture_data[blockName];
          if (block.textures instanceof Array) {
            for (let texture of block.textures) {
              if (texture instanceof Object) {
                texture.path = resolvePath("textures", file.path, texture.path);
              } else {
                texture = resolvePath("textures", file.path, texture);
              }
            }
          } else if (block.textures instanceof Object) {
            block.textures.path = resolvePath("textures", file.path, block.textures.path);
          } else {
            block.textures = resolvePath("textures", file.path, block.textures);
          }
        }
        file.save(content);
      } else if (file.metadata.base == "sound_definitions.json") {
        const content = file.jsonc();
        for (const soundSet in content.sound_definitions) {
          for (const sound in content.sound_definitions[soundSet].sounds) {
            if (typeof content.sound_definitions[soundSet].sounds[sound] == "object") {
              content.sound_definitions[soundSet].sounds[sound].name = resolvePath("sounds", file.path, content.sound_definitions[soundSet].sounds[sound].name);
            } else {
              content.sound_definitions[soundSet].sounds[sound] = resolvePath("sounds", file.path, content.sound_definitions[soundSet].sounds[sound]);
            }
          }
        }
        file.save(content);
      } else if (file.metadata.base == "_ui_defs.json") {
        const content = file.jsonc();
        content.ui_defs = content.ui_defs.map(
          (ui) => resolvePath("ui", file.path, ui)
        );
        file.save(content);
      } else {
        const foundParentName = Object.keys(JSON_FEATURES_RP).find(
          (parent) => parent in file.jsonc()
        );
        if (foundParentName) {
          const isEntityLike = ["minecraft:client_entity", "minecraft:attachable"].includes(foundParentName);
          if (isEntityLike) {
            const content = file.jsonc();
            const textures = content[foundParentName].description.textures;
            for (const texture in textures) {
              textures[texture] = resolvePath("textures", file.path, textures[texture]);
            }
            content[foundParentName].description.textures = textures;
            file.save(content);
          } else if (foundParentName == "namespace") {
            file.move(`RP/ui/${file.metadata.dir}`);
            continue;
          }
          file.move(JSON_FEATURES_RP[foundParentName], { safe: true });
        }
      }
      if (file.metadata.base in CUMULATIVE_JSON_FILES) {
        if (toBeMerged[file.metadata.base] == void 0) {
          toBeMerged[file.metadata.base] = [file.path];
        } else {
          toBeMerged[file.metadata.base].push(file.path);
        }
      }
    } else if (IMAGE_EXTENTIONS.includes(file.metadata.extension)) {
      file.move(`RP/textures/${file.metadata.dir}`);
    } else if (SOUND_EXTENTIONS.includes(file.metadata.extension)) {
      file.move(`RP/sounds/${file.metadata.dir}`);
    } else if (file.metadata.extension == ".lang") {
      let currentLanuage = languageFiles.RP[file.metadata.name];
      if (currentLanuage == void 0) {
        currentLanuage = [file];
      } else {
        currentLanuage = [...currentLanuage, file];
      }
      languageFiles.RP[file.metadata.name] = currentLanuage;
    } else if (file.metadata.extension == ".material") {
      if (materialFiles[file.metadata.base] == void 0) {
        materialFiles[file.metadata.base] = [file.path];
      } else {
        materialFiles[file.metadata.base].push(file.path);
      }
    }
  }
  for (const fileType in toBeMerged) {
    write(
      `${CUMULATIVE_JSON_FILES[fileType]}/${fileType}`,
      deepMerge(
        orderBySpecificity(toBeMerged[fileType]).map((path) => {
          const file = read(path);
          const content = file.jsonc();
          file.delete();
          return content;
        })
      )
    );
  }
  for (const fileType in materialFiles) {
    write(
      `RP/materials/${fileType}`,
      deepMerge(
        orderBySpecificity(materialFiles[fileType]).map((path) => {
          const file = read(path);
          const content = file.jsonc();
          file.delete();
          return content;
        })
      )
    );
  }
  for (const packType of ["RP", "BP"]) {
    for (const language in languageFiles[packType]) {
      write(
        `${packType}/texts/${language}.lang`,
        stringify(
          deepMerge(
            languageFiles[packType][language].map((file) => {
              const content = parse(file.string());
              file.delete();
              return content;
            })
          )
        )
      );
    }
  }
  const allFiles = [...glob("RP/**/*"), ...glob("BP/**/*")];
  for (const file of allFiles) {
    if (file.metadata.isDirectory) {
      if (file.contents.length == 0)
        file.delete();
    }
  }
}
function processCommand(command, filePath) {
  let args = commandArgs(command);
  args = args.map(
    (arg, i) => {
      if (i > 0 && args[i - 1] === "function") {
        return resolvePath(filePath, arg);
      }
      return arg;
    }
  );
  return args.join(" ");
}
main();
