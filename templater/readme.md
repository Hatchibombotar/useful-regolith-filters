# Regolith Templater
A templater filter for regolith.

## Template format
Templates are stored in `BP/templates/`

Example Template
```jsonc
{
    "description": {
        "identifier": "example:scale",
        "use_on": "BP/entities/",
        "write_level": 2
    },
    "template": {
        "minecraft:entity": {
            "components": {
                "minecraft:scale": {
                    "value": 5
                }
            }
        }
    }
}
```
`identifier` is what you use to apply the template to a file.

`use_on` is the directory that the filter can apply to.

`write_level` is how deep the templater enforces. Does not currently do anything, by default is set to `2`, should not be an issue in most cases.

## Using a template
To use a template add the `use_template` property to your file.
```jsonc
{
  "format_version": "1.17.0",
  "use_template": "example:scale",
  "minecraft:entity": {
    "description": {
      "identifier": "example:entity",
      "is_spawnable": true,
      "is_summonable": true,
      "is_experimental": false
    },
    "component_groups": {},
    "components": {},
    "events": {}
  }
}
```