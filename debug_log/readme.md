# Debug Log
This filter logs all entity event calls to chat, making debugging easier!

**Requires Experimental Toggle: Holiday Creator Features**

## Installation
```
regolith install github.com/Hatchibombotar/useful-regolith-filters/debug_log==latest
```
## Example
If you have an entity that calls the `minecraft:entity_spawned`, the debug log will attach a print to the end of the event.
```json
"minecraft:entity_spawned": {
        "add": {
            "component_groups": [
                "minecraft:baby"
            ]
        }
    ]
},
```

## Configuring
Using the regolith settings object, you can modify the behaviour of this filter.

Example:
```jsonc
"profiles": {
    "default": {
        "export": {
            "readOnly": false,
            "target": "development"
        },
        "filters": [
            {
                "filter": "debug_log",
                "settings": {
                    // PUT SETTINGS HERE!
                }
            }
        ]
    }
}
```

### Include
```json
"settings": {
    "entities": {
        "include": ["minecraft:pig"]
    }
}
```
In the example above, logs will only output for the pig entity.

### Exclude
```json
"settings": {
    "entities": {
        "exclude": ["minecraft:pig"]
    }
}
```
In the example above, logs will only output for all entities but not the pig.