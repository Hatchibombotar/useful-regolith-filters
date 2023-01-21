# package
Package your files using this all-in-one filter!
This filter works with all types of minecraft package types (mcpack, mcaddon, mcworld, mctemplate).

## Installation
```
regolith install package==latest
```

## Usage
You use the settings object to customise the output of the filter.

`config.json`
```json
{
	"name": "Project name",
	"packs": {
		"behaviorPack": "./packs/BP",
		"resourcePack": "./packs/RP"
	},
	"worlds": [
		"./worlds/hello"
	],
	"regolith": {
        "profiles": {
            "default": {
				"export": {
					"readOnly": false,
					"target": "local"
				},
				"filters": [
					{
						"filter": "package",
						"settings": {
							"package": {
								"mcaddon": {}
							}
						}
					}
				]
			}
        }
	}
}
```

## mcaddon

Creates an mcaddon file containing the resource and behaviour packs.

`config.json > regolith > profiles > default > filters > 0 > settings`
```json
{
    "package": {
        "mcaddon": {}
    }
}
```

## mcpack
Creates mcpack files with seperate resource and behaviour packs.

Create a resource pack:
`config.json > regolith > profiles > default > filters > 0 > settings`
```json
{
    "package": {
        "mcpack": {
            "RP": true
        }
    }
}
```

Create a behaviour pack:
`config.json > regolith > profiles > default > filters > 0 > settings`
```json
{
    "package": {
        "mcpack": {
            "BP": true
        }
    }
}
```

Create a skin pack:
`config.json > regolith > profiles > default > filters > 0 > settings`
```json
{
    "package": {
        "mcpack": {
            "skins": true
        }
    }
}
```

## mcworld
`config.json > regolith > profiles > default > filters > 0 > settings`
```json
{
    "package": {
        "mcworld": {}
    }
}
```

## mctemplate
_Does the same thing at the mcworld property, but changes the extention to `mctemplate`. You must include the world manifest within the world file if you want minecraft to interpret it correctly._
`config.json > regolith > profiles > default > filters > 0 > settings`
```json
{
    "package": {
        "mctemplate": {}
    }
}
```

## Other Settings
### Referencing Worlds
#### 1. worlds object

`config.json`
```json
{
	"name": "Project name",
	"packs": {
		"behaviorPack": "./packs/BP",
		"resourcePack": "./packs/RP"
	},
	"worlds": [
		"./worlds/hello"
	],
	"regolith": {
        ...
	}
}
```

`config.json > regolith > profiles > default > filters > 0 > settings`
```json
{
    "package": {
        "mcworld": {},
        "world": "0"
    }
}
```

#### 2. worldTemplate

`config.json`
```json
{
	"name": "Project name",
	"packs": {
		"behaviorPack": "./packs/BP",
		"resourcePack": "./packs/RP",
        "worldTemplate": "./packs/myWorld"
	},
	"regolith": {
        ...
	}
}
```

`config.json > regolith > profiles > default > filters > 0 > settings`
```json
{
    "package": {
        "mcworld": {},
        "world": "worldTemplate"
    }
}
```

#### 3. exact path

`config.json > regolith > profiles > default > filters > 0 > settings`
```json
{
    "package": {
        "mcworld": {},
        "world": "./packs/myWorld"
    }
}
```

### Including packs in worlds

#### 1. None
Don't include packs.

#### 2. Reference
Reference the packs but don't include them within the world download.

#### 3. Include
Reference the packs and include them within the world file

### package_location
`config.json > regolith > profiles > default > filters > 0 > settings`
```json
{
    "package": {
        "package_location": "./build"
    }
}
```

### file_name
by default, it converts your project name to snake_case, but if you'd like to have a custom name, you can use the file_name settings property.
`config.json > regolith > profiles > default > filters > 0 > settings`
```json
{
    "package": {
        "file_name": "./my_pack"
    }
}
```