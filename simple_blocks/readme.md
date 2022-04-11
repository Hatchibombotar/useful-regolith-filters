# Simple blocks
A filter that creates blocks from one file.

### Install Latest
```
regolith install github.com/Hatchibombotar/useful-regolith-filters/simple_blocks==latest
```

## Examples

`BP/blocks/block.json`
```json
[
    {
        "name": "example",
        "texture_type": "default",
        "texture": "textures/blocks/example",
    }
]
```
The default texture type, places the texture on every side of the block, ommitable
`BP/blocks/block.json`
```json
[
    {
        "name": "example",
        "texture_type": "seperate",
        "textures": {
            "up": "textures/blocks/example_up",
            "down": "textures/blocks/example_down",
            "north": "textures/blocks/example_north",
            "south": "textures/blocks/example_south",
            "east": "textures/blocks/example_east",
            "west": "textures/blocks/example_west"
        }
    }
]
```
The default texture type, places seperate textures on each side of the block

`BP/blocks/block.json`
```json
[
    {
        "name": "example",
        "texture": "textures/blocks/example",
        "break_time": 0.6,
        "friction": 1
    }
]
```

Other block properties
- `break_time` - How quick it is to break a block.
- `friction` - How slippery the block is, default value is 0.6.