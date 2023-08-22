const fs = require("fs")
const ts_config_path = "./tsconfig.json"
const ts_config_exists = fs.existsSync(ts_config_path)

const filter_tsconfig = {
    "compilerOptions": {
        "baseUrl": "./",
        "paths": {
            "typescript-json": ["./typescript-json/library.ts"]
        },
    },
    "ts-node": {
        "require": ["tsconfig-paths/register"]
    }
}


if (ts_config_exists) {
    const existing_content = JSON.parse(String(fs.readFileSync(ts_config_path)))
    const new_content = deepMerge([existing_content, filter_tsconfig])

    fs.writeFileSync(ts_config_path, JSON.stringify(new_content, null, 4))
} else {
    fs.writeFileSync(ts_config_path, JSON.stringify(filter_tsconfig, null, 4))
}

function deepMerge(objects, maxLevel = -1, currentLevel = 0) {
    const isObject = (value) => Object.prototype.toString.call(value) === "[object Object]"
    let target = {}

    // deep merge the object into the target object
    function merger(obj) {
        for (let prop in obj) {
            if (isObject(obj[prop]) && (currentLevel != maxLevel)) {
                // if the property is a nested object
                target[prop] = deepMerge([target[prop], obj[prop]], maxLevel, currentLevel + 1)
            } else if (Array.isArray(obj[prop])) {
                target[prop] = target[prop] ?? []
                target[prop] = [...target[prop], ...obj[prop]]
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