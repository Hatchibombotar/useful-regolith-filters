import { writeFileSync, mkdirSync } from "node:fs"
import * as path from "node:path"
import { randomUUID } from "crypto"

type BaseLootTable = {
    pools: {
        rolls: number | {
            min: number,
            max: number
        },

        entries: {
            type: string,
            name: string,
            weight?: number,
            functions?: any
        }[]

    }[]
}


export default class LootTable {
    data: BaseLootTable
    Event: any

    constructor(data: BaseLootTable) {
        this.data = data
    }

    public save(table_path?: string): string {
        if (table_path == undefined) {
            table_path = `loot_tables/generated/${randomUUID()}.json`
        }
        const file_path = path.join(process.env.TMP_DIR, "BP/", table_path)
        mkdirSync(path.parse(file_path).dir, { recursive: true })
        writeFileSync(
            file_path,
            JSON.stringify(this.data, null, 4)
        )
        return "path/to/file"
    }
}