import { ComponentList } from "./components"
import { writeFileSync } from "node:fs"
import { deepMerge } from "./utils"
import * as path from "node:path"

type SupportedFormatVersion = "1.20.20"

type BaseEntity = {
    "format_version": SupportedFormatVersion,
    "minecraft:entity": {
        "description": {
            "identifier": string,
            "is_spawnable": boolean,
            "is_summonable": boolean,
            "is_experimental": boolean
        },
        "component_groups"?: {
            [group_name: string]: ComponentList
        }
        "components": ComponentList
        "events"?: {}
    }
}

export default class Entity {
    data: BaseEntity
    Event: any

    constructor() {
        // make base entity
        this.data = {
            "format_version": "1.20.20",
            "minecraft:entity": {
                description: {
                    identifier: "error: no identifier provided.",
                    is_experimental: false,
                    is_spawnable: true,
                    is_summonable: true
                },
                components: {},
                events: {},
                component_groups: {}
            }
        }
    }

    public create(data: BaseEntity) {
        // deep merge data into data
        // this.data = data
        this.data = deepMerge([this.data, data], 2) as BaseEntity
    }

    public addComponent<T extends keyof ComponentList>(name: T, value: ComponentList[T]) {
        this.data["minecraft:entity"].components[name] = value
    }

    public createEvent(name: string, value) {
        // if (this.data["minecraft:entity"]?.events == undefined) {
        //     this.data["minecraft:entity"].events = {}
        // }

        // this.data["minecraft:entity"].events[name] = value

        this.data["minecraft:entity"].events[name] = value

        return name
    }

    private checkForErrors() {
        // check to see if entity-specific components are used
    }

    public save(): string {
        this.checkForErrors()
        const entity_name = this.data["minecraft:entity"].description.identifier.split(":")[1]
        writeFileSync(
            path.join(process.env.TMP_DIR, `BP/entities/${entity_name}.json`),
            JSON.stringify(this.data, null, 4)
        )

        return "path/to/file"
    }

    runEvent(arg0: string): string {
        throw new Error("Method not implemented.")
    }

    cancelEvent(arg0: string): string {
        throw new Error("Method not implemented.")
    }
}
