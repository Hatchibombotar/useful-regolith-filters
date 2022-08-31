# File Freedom
This filter allows you to place bedrock addon file *anywhere* within the addon directories. 

## Installation
```
regolith install github.com/Hatchibombotar/useful-regolith-filters/file_freedom==latest
```

## Cumulative JSON files
These files can be repeated multiple times inside your addon packs, and file freedom will combine them.
[File List](#cumulative-json-files)

.lang files also combine themselves.

## Relative paths
This allows you to reference other files using relative paths. This allows you to do things like

` function ./otherFunction`
#### Supported in:
- _BP_
- Functions
- BP Animation Controllers
- Entity Run Command Event
- tick.json
- _RP_
- terrain_texture.json
- item_texture.json
- flipbook_textures.json
- sound_definitions.json


## Configuring the filter
With this filter, you can configure how it works using the settings object:

```json
"profiles": {
    "default": {
        "export": {
            "readOnly": false,
            "target": "local"
        },
        "filters": [
            {
                "filter": "file_freedom",
                "settings": {
                    
                }
            }
        ]
    }
}
```

These are the settings that can be modified:
```json
"settings": {
    "IGNORE_FILES": [], // a list of file *names* to ignore e.g. pack_icon.png
    "SOUND_EXTENTIONS": [], // sound file extentions e.g. .ogg, .fsb
    "IMAGE_EXTENTIONS": [], // image file extentions e.g. .png

    "CUMULATIVE_JSON_FILES": {}, // json files distinguished by their name and their correct path. e.g. "tick.json": "BP/functions"
    "JSON_FEATURES_BP": {}, // main objects of BP json files. e.g. "minecraft:entity": "BP/entities"
    "JSON_FEATURES_RP": {} // main objects of RP json files. e.g. "minecraft:client_entity": "RP/entity"
}
```
### Defaults
#### **Ignored Files**
pack_icon.png
#### **Sound File Extentions**
.fsb .ogg .wav .mp3
#### **Image File Extentions**
.png .tga .jpg .jpeg

#### **Cumulative JSON Files**

_RP_
- `biomes_client.json` -> `RP`
- `blocks.json` -> `RP`
- `sounds.json` -> `RP`
- `_global_variables.json` -> `RP/ui`
- `_ui_defs.json` -> `RP/ui`
- `flipbook_textures.json` -> `RP/textures`
- `item_texture.json` -> `RP/textures`
- `terrain_texture.json` -> `RP/textures`
- `mobs.json` -> `RP/models`
- `music_definitions.json` -> `RP/sounds`
- `sound_definitions.json` -> `RP/sounds`
- `language_names.json` -> `RP/texts`
- `languages.json` -> `RP/texts`
_BP_
- `tick.json` -> `BP/functions/`

#### **BP JSON FEATURES**
- `minecraft:entity` -> `BP/entities`
- `minecraft:block` -> `BP/blocks`
- `minecraft:item` -> `BP/items`
- `pools` -> `BP/loot_tables`
- `minecraft:recipe_shapeless` -> `BP/recipes`
- `minecraft:recipe_shaped` -> `BP/recipes`
- `minecraft:recipe_furnace` -> `BP/recipes`
- `minecraft:recipe_brewing_container` -> `BP/recipes`
- `minecraft:recipe_brewing_mix` -> `BP/recipes`
- `minecraft:spawn_rules` -> `BP/spawn_rules`
- `tiers` -> `BP/trading`

#### **RP JSON FEATURES**
- `animation_controllers` -> `RP/animation_controllers`
- `animations` -> `RP/animations`
- `minecraft:attachable` -> `RP/attachables`
- `minecraft:client_entity` -> `RP/entity`
- `minecraft:fog_settings` -> `RP/fogs`
- `minecraft:geometry` -> `RP/models`
- `particle_effect` -> `RP/particles`
- `render_controllers` -> `RP/render_controllers`
