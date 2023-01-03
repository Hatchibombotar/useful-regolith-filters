const fs = require("fs")
const JSONC = require("jsonc").safe

const path = require("path")

class File {
    constructor(path) {
        const rawData = fs.readFileSync(path)
        this.content = rawData
    }
}

class JSONFile {
    constructor(path) {
        this.path = path
        const rawData = String(fs.readFileSync(path))

        const [parseError, parsedJSON] = JSONC.parse(rawData)
        if (parseError) {
            console.error(`Failed to parse JSON in ${path}`)
            console.error(parseError)
            return
        }

        this.content = parsedJSON

        return this
    }
    set(content) {
        this.content = content
        return this
    }
    save(path) {
        fs.writeFileSync(path ?? this.path, JSON.stringify(this.content, null, 4))
        this.path = path ?? this.path
        return this
    }
    move(toDirectory) {
        this.save()

        const {name, ext, base} = path.parse(this.path)

        if (this.path == `${toDirectory}/${base}`) {
            return
        }
        if (!fs.existsSync(toDirectory)) {
            fs.mkdirSync(toDirectory, {recursive: true})
        }
    
        let pathSuffix = 0;
        const newPath = () => `${toDirectory}/${name}${pathSuffix != 0 ? pathSuffix : ""}${ext}`
        while (fs.existsSync(newPath())) {
            pathSuffix += 1
        }
        fs.renameSync(this.path, newPath())

        return this
    }
}

module.exports = {
    JSONFile
}