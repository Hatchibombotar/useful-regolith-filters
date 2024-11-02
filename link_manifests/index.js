const fs = require("fs")

const bp = JSON.parse(fs.readFileSync("BP/manifest.json"))
const rp = JSON.parse(fs.readFileSync("RP/manifest.json"))

bp.dependencies = bp.dependencies?.filter( d => !d.uuid ) ?? []
rp.dependencies = rp.dependencies?.filter( d => !d.uuid ) ?? []
bp.dependencies.push( { "uuid": rp.header.uuid, "version": rp.header.version } )
rp.dependencies.push( { "uuid": bp.header.uuid, "version": bp.header.version } )

fs.writeFileSync("RP/manifest.json", JSON.stringify(rp))
fs.writeFileSync("BP/manifest.json", JSON.stringify(bp))
