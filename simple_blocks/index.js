const fs = require("fs")

const file = fs.existsSync("BP/blocks/block.json") ? JSON.parse(fs.readFileSync("BP/blocks/block.json")) : []

const config = fs.existsSync("data/simple_blocks/config.json") ? JSON.parse(fs.readFileSync("data/simple_blocks/config.json")) : undefined
const namespace = config.namespace
if (namespace == "" || config == undefined) {
    console.error("A namespace has not been defined in BP/blocks/blocks.json or the file has not been provided")
    process.exit()
}
const terrain_texture = fs.existsSync("RP/textures/terrain_texture.json") ? JSON.parse(fs.readFileSync("RP/textures/terrain_texture.json")) : {
    "resource_pack_name": namespace,
    "texture_name": "atlas.terrain",
    "padding": 8,
    "num_mip_levels": 4,
    "texture_data": {}
}
const blocks = fs.existsSync("RP/blocks.json") ? JSON.parse(fs.readFileSync("RP/blocks.json")) : { "format_version": [ 1, 1, 0 ] }

for (const block of file) {
    const newBlock = {
        "format_version": "1.16.100",
        "minecraft:block": {
            "description": {
                "identifier": `${namespace}:${block.name}`
            },
            "components": {
                "minecraft:friction": block.friction ? block.friction : 0.6
            }
        }
    }
    console.log(JSON.stringify(newBlock))
    
    terrain_texture.texture_data[block.name] = {}
    terrain_texture.texture_data[block.name].textures = `textures/blocks/auto/${block.name}`
    console.log(JSON.stringify(terrain_texture))

    blocks[`${namespace}:${block.name}`] = {}
    blocks[`${namespace}:${block.name}`].textures = block.name
    console.log(JSON.stringify(blocks))
}

fs.writeFileSync("RP/textures/terrain_texture.json", JSON.stringify(terrain_texture))
fs.writeFileSync("RP/blocks.json", JSON.stringify(terrain_texture))

fs.rmSync("BP/blocks/block.json")