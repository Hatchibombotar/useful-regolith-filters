const fs = require("fs")
const settings = require("./settings")
const { getRegolithVersion, getLicenseName } = require("./utils")

function main() {
    const config_path = process.env.ROOT_DIR + "/config.json"
    const config_raw = fs.readFileSync(config_path)
    const config = JSON.parse(config_raw)

    const metadata = {}
    metadata.authors = []
    if (settings.authors != null) {
        if (typeof settings.authors == "string") {
            metadata.authors.push(settings.authors)
        } else {
            metadata.authors.push(...settings.authors)
        }
    }
    if (typeof config.author == "string") {
        metadata.authors.push(config.author)
    } else {
        metadata.authors.push(...config.author)
    }

    if (settings.generated_with) {
        metadata.generated_with = {
            "regolith": [getRegolithVersion()]
        }

        if (typeof settings.generated_with != "boolean") {
            metadata.generated_with = {
                ...settings.generated_with,
                ...metadata.generated_with,
            }
        }

        for (const [filter, { version }] of Object.entries(config.regolith.filterDefinitions)) {
            metadata.generated_with[filter] = [version]
        }

    }


    metadata.license = settings.license ?? getLicenseName()

    metadata.url = settings.url

    if (settings.product_type != "") {
        metadata.product_type = settings.product_type ?? "addon"
    }


    if (fs.existsSync("RP/manifest.json")) {
        const manifest_RP = JSON.parse(fs.readFileSync("RP/manifest.json"))
        manifest_RP.metadata = metadata
        fs.writeFileSync("RP/manifest.json", JSON.stringify(manifest_RP, null, 4))
    }
    if (fs.existsSync("BP/manifest.json")) {
        const manifest_BP = JSON.parse(fs.readFileSync("BP/manifest.json"))
        manifest_BP.metadata = metadata
        fs.writeFileSync("BP/manifest.json", JSON.stringify(manifest_BP, null, 4))
    }
}

main()