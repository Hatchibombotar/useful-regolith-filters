# Metadata
Inserts auto-generated metadata into the `manifest.json` files.

### Install Latest
```
regolith install metadata==latest
```
Or
```
regolith install github.com/Hatchibombotar/useful-regolith-filters/metadata==latest
```

## Example Output
```json
    "metadata": {
        "authors": [],
        "generated_with": {
            "regolith": [ "1.0.5" ],
            "functioner": [ "latest" ],
            "package": [ "latest" ],
            "import": [ "latest" ]
        },
        "license": "MIT",
        "url": "https://github.com/Hatchibombotar/graves-addon",
        "product_type": "addon"
    }
```

The following fields are auto generated:
- `authors` - Taken from the `config.json` author field
- `generated_with` - Taken from the `config.json` filters (off by default!) set to true or {} in settings to generate!
- `license` - Taken files called licence.md or similar where the first line is `<Name of Licence> License` e.g. `MIT License`
- `product_type` - Set to `"addon"` by default, to change this, set it to something else in the settings object or leave it as "" to remove it.

## Usage
```json
    {
        "filter": "metadata",
        "settings": {
            "url": "https://github.com/Hatchibombotar/graves-addon"
        }
    }
```

## Settings
The settings are merged into or override the metadata field inside of the manifests.

Supported Fields:
- authors
- generated_with
- license
- url
- product_type