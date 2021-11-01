const fs = require("fs")

const bp = JSON.parse(fs.readFileSync("BP/manifest.json"))
const rp = JSON.parse(fs.readFileSync("RP/manifest.json"))

bp.dependencies = [ { "uuid": rp.header.uuid, "version": rp.header.version } ]
rp.dependencies = [ { "uuid": bp.header.uuid, "version": bp.header.version } ]

fs.writeFileSync("RP/manifest.json", JSON.stringify(rp))
fs.writeFileSync("BP/manifest.json", JSON.stringify(bp))
