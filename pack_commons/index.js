const fs = require("fs")
const glob = require("glob")

const config = JSON.parse(fs.readFileSync(`data/pack_commons/commons.json`))

glob("data/pack_commons/**/!(commons.json)", null, function (err, files) {
    for (file of files) {
        config.common_files.push(file)
    }
})

for (file of config.common_files) {
    const path = `../../${file}`
    const name = path.split("/").pop()
    fs.copyFileSync(path, `BP/${name}`)
    fs.copyFileSync(path, `RP/${name}`)
}