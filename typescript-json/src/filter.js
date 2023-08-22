const { spawn } = require('child_process')
const glob = require("glob").sync
const fs = require("fs")
const path = require("path")

const files = glob(
    "BP/entities/**/*.json.ts"
)

for (const file_path of files) {
    const script_process = spawn('node', ['./node_modules/ts-node/dist/bin.js', path.resolve(file_path), "-T"], {
        cwd: process.env.FILTER_DIR,
        env: {
            TMP_DIR: process.cwd()
        }
    })

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