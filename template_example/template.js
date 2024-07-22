import { writeFileSync } from "fs"
import { randomUUID } from "crypto"

const bpUuid = randomUUID()
const rpUuid = randomUUID()

const bpManifest = {
    "format_version": 2,
    "header": {
        "name": "pack.name",
        "description": "pack.description",
        "uuid": bpUuid,
        "version": [1, 0, 0],
        "min_engine_version": [1, 21, 0]
    },
    "modules": [
        {
            "type": "data",
            "uuid": randomUUID(),
            "version": [1, 0, 0]
        }
    ],
    "dependencies": [
        {
            "uuid": rpUuid,
            "version": [ 1, 0, 0 ]
        }
    ]
}

const rpManifest = {
    "format_version": 2,
    "header": {
        "name": "pack.name",
        "description": "pack.description",
        "uuid": rpUuid,
        "version": [1, 0, 0],
        "min_engine_version": [1, 21, 0]
    },
    "modules": [
        {
            "type": "resources",
            "uuid": randomUUID(),
            "version": [1, 0, 0]
        }
    ],
    "dependencies": [
        {
            "uuid": bpUuid,
            "version": [ 1, 0, 0 ]
        }
    ]
}

writeFileSync("BP/manifest.json", JSON.stringify(bpManifest, null, 4))
writeFileSync("RP/manifest.json", JSON.stringify(rpManifest, null, 4))