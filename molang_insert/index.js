const fs = require("fs")
const glob = require("glob");

glob("?(BP|RP)/**/*.json", null, function (err, files) {
    for (file of files) {
        const fileContent = fs.readFileSync(file).toString()
        const newFileContent = fileContent.replace(/molang\.insert\((.*?)\)/gm, function (x, y) {
            if (!fs.existsSync(`data/molang_insert/molang/${y}.molang`)) {
                console.error(`File data/molang_insert/molang/${y}.molang does not exist`)
            } else {
                return fs.readFileSync(`data/molang_insert/molang/${y}.molang`).toString().replace(/[\n\r]+/g, " ").replace("&#9;", "")
            }
        });
        fs.writeFileSync(file, newFileContent)
    }
})
