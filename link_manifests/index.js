const fs = require("fs")

const bp = JSON.parse(fs.readFileSync("BP/manifest.json"))
const rp = JSON.parse(fs.readFileSync("RP/manifest.json"))

bp[dependencies] = { "uuid": rp[header].uuid, "version": rp[header].version}
rp[dependencies] = { "uuid": bp[header].uuid, "version": bp[header].version}

JSON.stringify(fs.writeFileSync("BP/manifest.json"), bp)
JSON.stringify(fs.writeFileSync("RP/manifest.json"), rp)