const {execSync} = require("child_process")
const fs = require("fs")

function getRegolithVersion() {
    const output = String(execSync("regolith -v"))
    const version = output.split(" ").pop().trim()
    return version
}

function getLicenseName() {
    const potential_paths = [
        "LICENCE",
        "licence",
        "LICENCE.txt",
        "licence.txt",
        "LICENCE.md",
        "licence.md",

    ]
    let path;
    for (const potential_path of potential_paths) {
        const full_path = process.env.ROOT_DIR + "/" + potential_path
        if (fs.existsSync(full_path)) {
            path = full_path
        }
    }
    if (path == null) return
    
    const licence = String(fs.readFileSync(path))
    const first_line = licence.split("\n").shift()
    if (first_line.match(/(.+) License/)) {
        const licence = first_line.matchAll(/(.+) License/g)?.next()?.value[1]
        return licence ?? first_line.trim()
    } else {
        return first_line
    }
}

module.exports = {
    getRegolithVersion,
    getLicenseName
}