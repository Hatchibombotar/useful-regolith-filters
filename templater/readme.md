# Templater
A regolith filter that allows templates to be used in your files

### Install Latest
```
regolith install templater==latest
```

[Using templates](#using-templates)

[Creating templates](#creating-templates)

[Built-in Templates](#built-in-templates)

## Using templates
To use a template add the `use_templates` property to your file. 
```jsonc
{
    "format_version": "1.19.50",
    "use_templates": {
        "example:big_template": {}
    },
    "minecraft:entity": {
        "description": {
            "identifier": "example:entity"
        },
        "component_groups": {},
        "components": {},
        "events": {}
    }
}
```

The entity above with have the `example:big_template` template applied to it.

## Creating templates
Templates are stored in `data/templater/templates`

Example Template -  _data/templater/templater/big.js_
```js
// makes your entity big!
module.exports = {
    description: {
        identifier: "example:big_template",
        use_on: "BP/entities/",
        write_level: 2
    },
    template() {
        return {
            "minecraft:entity": {
                "components": {
                    "minecraft:scale": {
                        "value": 5
                    }
                }
            }
        }
    }
}
```
`identifier` is what you use to apply the template to a file.

`use_on` is the directory that the filter can apply to.

`write_level` is how deep the template enforces. Set to 2 by default.

> **TIP**
> - A write level of 1 will only write components if the components object does not exist
> - A level of 2 will only write a component if the component does not exist on the target file
> - A level of 3 will only write a component property if it does not exist on the target file
>
### Passing in data
If you'd like to get the passed in data from the use_templates property, you can use the parameters property in your template definition:

```js
    template(parameters) {
        console.log(parameters)
        return {
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

## Built-in Templates
Templater contains some small templates that you can use by default. These should appear on first installation of the filter.

> **TIP**
> 
> Already installed templater? You may need to get new templates from [here](./data/templater/templates/)

### Block Templates

---

#### templater:rotate_y
*Sets a block to rotate around the Y axis (like a crafting table, furnace, or chest)*

*last updated: version (2.0.0)*

```jsonc
"templater:rotate_y": {}
```
**Or**
```jsonc
"templater:rotate_y": {
    "property": "example:rotation"
}
```
| Property | Description                                                                                                      |
| -------- | ---------------------------------------------------------------------------------------------------------------- |
| property | Set the direction value to a a specific block property (North=2.0, South=3.0, West=4.0, East=5.0, Undefined=6.0) |

---

#### templater:rotate_all
*Sets a block to rotate facing the place direction (like a dispenser)*

*last updated: version (2.0.0)*

```jsonc
"templater:rotate_all": {}
```
**Or**
```jsonc
"templater:rotate_all": {
    "property": "example:rotation"
}
```
| Property | Description                                                                                                      |
| -------- | ---------------------------------------------------------------------------------------------------------------- |
| property | Set the direction value to a a specific block property (Down=0.0, Up=1.0, North=2.0, South=3.0, West=4.0, East=5.0, Undefined=6.0) |