const {execSync} = require("child_process")
const fs = require("fs")

function getRegolithVersion() {
    const output = String(execSync("regolith -v"))
    const version = output.split(" ").pop()
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
        if (fs.existsSync(process.env.ROOT_DIR + potential_path)) {
            path = potential_path
        }
    }
    if (path == null) return
    
    const licence = String(fs.readFileSync(path))
    const first_line = licence.split("\n").shift()
    if (first_line.match(/(.+) License/)) {
        return first_line.match(/(.+) License/)[0]
    } else {
        return first_line
    }
}

module.exports = {
    getRegolithVersion,
    getLicenseName
}