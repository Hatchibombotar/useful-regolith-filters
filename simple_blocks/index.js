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
const blocks = fs.existsSync("RP/blocks.json") ? JSON.parse(fs.readFileSync("RP/blocks.json")) : { "format_version": [1, 1, 0] }

for (const block of file) {
    const newBlock = {
        "format_version": "1.16.100",
        "minecraft:block": {
            "description": {
                "identifier": `${namespace}:${block.name}`
            },
            "components": {
                "minecraft:friction": block.friction ? block.friction : 0.6,
                "minecraft:block_light_absorption": 0,
                "minecraft:block_light_emission": 0,
                "minecraft:destroy_time": block.break_time ? block.break_time : 1,
            }
        }
    }

    if (block.texture_type == "default" || block.texture_type === undefined) {
        terrain_texture.texture_data[block.name] = {}
        terrain_texture.texture_data[block.name].textures = block.texture

        blocks[`${namespace}:${block.name}`] = {}
        blocks[`${namespace}:${block.name}`].textures = block.name
    } else if (block.texture_type == "seperate") {
        terrain_texture.texture_data[`${block.name}_up`] = { "textures": block.textures.up }
        terrain_texture.texture_data[`${block.name}_down`] = { "textures": block.textures.down }
        terrain_texture.texture_data[`${block.name}_north`] = { "textures": block.textures.north }
        terrain_texture.texture_data[`${block.name}_south`] = { "textures": block.textures.south }
        terrain_texture.texture_data[`${block.name}_east`] = { "textures": block.textures.east }
        terrain_texture.texture_data[`${block.name}_west`] = { "textures": block.textures.west }

        blocks[`${namespace}:${block.name}`] = {}
        blocks[`${namespace}:${block.name}`].textures = {
            "up": `${block.name}_up`,
            "down": `${block.name}_down`,
            "north": `${block.name}_north`,
            "south": `${block.name}_south`,
            "east": `${block.name}_east`,
            "west": `${block.name}_west`
        }
    }

    fs.writeFileSync(`BP/blocks/${block.name}.json`, JSON.stringify(newBlock))
}

fs.writeFileSync("RP/textures/terrain_texture.json", JSON.stringify(terrain_texture))
fs.writeFileSync("RP/blocks.json", JSON.stringify(blocks))

fs.rmSync("BP/blocks/block.json")