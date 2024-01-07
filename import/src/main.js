const fs = require("fs")
const settings = require("./settings")

const TEMP_DIR = ""
const ROOT_DIR = process.env.ROOT_DIR + "/"


function main() {
    if (!("imports" in settings)) {
        console.error("key 'imports' missing in settings object.")
        return
    }

    for (const {from, to} of settings.imports) {
        if (!from || !to) {
            console.error("missing correct 'from' and 'to' keys in import object.")
            continue
        }

        fs.copyFileSync(ROOT_DIR + from, TEMP_DIR + to)
    }
}

main()