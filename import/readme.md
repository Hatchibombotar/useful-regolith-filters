# Import
Import files into your packs from other locations.

### Install Latest
```
regolith install import==latest
```
Or
```
regolith install github.com/Hatchibombotar/useful-regolith-filters/import==latest
```

## Import Single Files
the `from` key is the file source, and the to key is its destination.
```json
{
    "filter": "import",
    "settings": {
        "imports": [
            {
                "from": "assets/pack_icon.png",
                "to": "BP/pack_icon.png"
            },
            {
                "from": "assets/pack_icon.png",
                "to": "RP/pack_icon.png"
            }
        ]
    }
}
```