# Regolith Templater
A templater filter for regolith.

### Install Latest
```
regolith install github.com/Hatchibombotar/useful-regolith-filters/functioner==latest
```

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

`write_level` is how deep the templater enforces. Set to 2 by default.

A level of 1 will only write components if the components object does not exist
A level of 2 will only write a component if the component does not exist on the target file

## Using a template
To use a template add the `use_templates` property to your file.
```jsonc
{
  "format_version": "1.17.0",
  "use_templates": ["example:scale"],
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

If you installed a previous version, you may need to change `use_template`, string to `use_templates`, array

BEFORE: `"use_template": "example:scale",`

AFTER: `"use_templates": ["example:scale"],`

This change allows for multiple templates to be used:

`"use_templates": ["example:scale", "example:template"],`