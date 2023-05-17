export const settings = JSON.parse(process.argv[2] ?? "{}")

export const JSON_FEATURES_BP = {
    "minecraft:entity": "BP/entities",
    "minecraft:block": "BP/blocks",
    "minecraft:item": "BP/items",
    "pools": "BP/loot_tables",
    "minecraft:recipe_shapeless": "BP/recipes",
    "minecraft:recipe_shaped": "BP/recipes",
    "minecraft:recipe_furnace": "BP/recipes",
    "minecraft:recipe_brewing_container": "BP/recipes",
    "minecraft:recipe_brewing_mix": "BP/recipes",
    "minecraft:spawn_rules": "BP/spawn_rules",
    "tiers": "BP/trading",
    "animation_controllers": "BP/animation_controllers",
    "animations": "BP/animations",
    ...settings.JSON_FEATURES_BP ?? []
}

export const JSON_FEATURES_RP = {
    "minecraft:attachable": "RP/attachables",
    "minecraft:client_entity": "RP/entity",
    "minecraft:fog_settings": "RP/fogs",
    "minecraft:geometry": "RP/models/entity",
    "particle_effect": "RP/particles",
    "render_controllers": "RP/render_controllers",
    "namespace": "RP/ui",
    "animation_controllers": "RP/animation_controllers",
    "animations": "RP/animations",
    ...settings.JSON_FEATURES_RP ?? []
}

export const CUMULATIVE_JSON_FILES = {
    "biomes_client.json": "RP",
    "blocks.json": "RP",
    "sounds.json": "RP",
    "_global_variables.json": "RP/ui",
    "_ui_defs.json": "RP/ui",
    "flipbook_textures.json": "RP/textures",
    "item_texture.json": "RP/textures",
    "terrain_texture.json": "RP/textures",
    "mobs.json": "RP/models",
    "music_definitions.json": "RP/sounds",
    "sound_definitions.json": "RP/sounds",
    "language_names.json": "RP/texts",
    "languages.json": "RP/texts",

    "tick.json": "BP/functions",
    ...settings.CUMULATIVE_JSON_FILES ?? []
}

export const SOUND_EXTENTIONS = [ ".fsb", ".ogg", ".wav", ".mp3", ...settings.SOUND_EXTENTIONS ?? [] ]
export const IMAGE_EXTENTIONS = [ ".png", ".tga", ".jpg", ".jpeg", ...settings.IMAGE_EXTENTIONS ?? [] ]

export const IGNORE_FILES = [ "pack_icon.png", ...settings.IGNORE_FILES ?? []]