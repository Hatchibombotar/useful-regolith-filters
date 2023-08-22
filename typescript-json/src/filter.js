const { spawn } = require('child_process')
const glob = require("glob").sync
const fs = require("fs")

const files = glob(
    "BP/entities/**/*.json.ts"
)

const compilerOptions = {
    "compilerOptions": {
        "baseUrl": process.env.ROOT_DIR,
        "paths": {
            "typescript-json": ["./typescript-json/library.ts"]
        },
    },
    "ts-node": {
        "require": ["tsconfig-paths/register"]
    }
}

for (const file_path of files) {
    const script_process = spawn('node', [process.env.ROOT_DIR + '/node_modules/ts-node/dist/bin.js', file_path, "-T", "-O", compilerOptions])

    script_process.stdout.on('data', (data) => {
        console.log(String(data))
    })

    script_process.stderr.on('data', (data) => {
        console.error(`${file_path}: ${data}`)
    })

    script_process.on('close', (code) => {
        fs.rmSync(file_path)
        if (code !== 0) {
            console.error(`Error running TypeScript file ${file_path}`)
        }
    })

}