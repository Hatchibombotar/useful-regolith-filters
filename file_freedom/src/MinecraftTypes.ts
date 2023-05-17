type Version = [number, number, number] | string

export type Manifest = {
    format_version: 2,
    header: {
        name: string,
        description: string,
        uuid: string,
        version: Version,
        min_engine_version: Version
    },
    modules: {
        uuid: string,
        version: Version,
        type: string,
        language?: string,
        entry?: string
    }[]
}

export type Tick = {
    values: string[]
}
