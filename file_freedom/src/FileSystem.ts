import fsBuiltin from 'fs'
const JSONC = require("jsonc").safe
import { sync as globExt } from "glob"
import pathBuiltin from "path"

// TODO: Add buffer
type SaveType = string | object
type MoveOptions = {
    safe?: boolean
}

export class File {
    constructor(path: string) {
        this.path = path
    }
    path: string

    save(content: SaveType) {
        if (!fsBuiltin.existsSync(this.metadata.dir)) {
            fsBuiltin.mkdirSync(this.metadata.dir, { recursive: true })
        }
        if (typeof content == "string") {
            fsBuiltin.writeFileSync(this.path, content)
        } else if (typeof content == "object") {
            fsBuiltin.writeFileSync(this.path, JSON.stringify(content, null, 4))
        }
    }

    buffer() {
        return fsBuiltin.readFileSync(this.path)
    }

    string() {
        return String(this.buffer())
    }

    jsonc() {
        const [parseError, jsonContent] = JSONC.parse(this.string())
        if (parseError) throw parseError

        return jsonContent
    }

    get metadata() {
        const { root, dir, base, name, ext } = pathBuiltin.parse(this.path)
        const isDirectory = fsBuiltin.existsSync(this.path) ? fsBuiltin.lstatSync(this.path).isDirectory() : undefined

        return {
            root, dir, base, name,
            extension: ext,
            isDirectory
        }
    }

    move(toDirectory: string, options?: MoveOptions) {
        const safe = options?.safe ?? true

        if (this.path == `${toDirectory}/${this.metadata.base}`) {
            return
        }
        if (!fsBuiltin.existsSync(toDirectory)) {
            fsBuiltin.mkdirSync(toDirectory, { recursive: true })
        }

        let pathSuffix = 0;
        const newPath = () => `${toDirectory}/${this.metadata.name}${pathSuffix != 0 ? pathSuffix : ""}${this.metadata.extension}`

        if (safe) {
            while (fsBuiltin.existsSync(newPath())) {
                pathSuffix += 1
            }
        }

        fsBuiltin.renameSync(this.path, newPath())
    }

    delete() {
        fsBuiltin.rmSync(this.path, { recursive: true })
    }

    get contents(): File[] {
        if (!this.metadata.isDirectory) return []
        return fsBuiltin.readdirSync(this.path).map(
            path => new File(path)
        )
    }
}


export function read(path: string): File {
    return new File(path)
}

export function glob(pattern: string, options?: object): File[] {
    return globExt(pattern, options).map((fileName: string) => read(fileName))
}

export function write(path: string, content: SaveType) {
    const file = new File(path)
    file.save(content)

    return file

}