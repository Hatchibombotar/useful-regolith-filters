const fs = require("fs")
const glob = require("glob")

const {parse} = require("./parse")
const {generate} = require("./generate")

const settings = JSON.parse(process.argv[2] ?? "{}")
const searchPattern = settings.searchPattern ?? "BP/**/*.mcfunction"

function main() {
    // Extract Functions
    for (const filePath of glob.sync(searchPattern)) {
        const func = String(fs.readFileSync(filePath))
        const ast = parse(func)
        generate(ast, filePath)
    }
}
main()


