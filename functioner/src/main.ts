import fs from "fs"
import glob from "glob"

import { parse } from "./parse"
import { generate } from "./generate"

const settings = JSON.parse(process.argv[2] ?? "{}")
const search_pattern = settings.searchPattern ?? "BP/**/*.mcfunction"

function main() {
    // Extract Functions
    for (const file_path of glob.sync(search_pattern)) {
        const func = String(fs.readFileSync(file_path))
        const ast = parse(func)
        if (ast == undefined) {
            fs.rmSync(file_path)
            continue
        }
        generate(ast, file_path)
    }
}
main()
