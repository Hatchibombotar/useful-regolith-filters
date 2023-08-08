# Functioner
A filter for regolith that extends the .mcfunction syntax.

---

## Features

### Subfunctions
These are functions inside of functions. These allow for multiple commands to be ran at once.

Enter your commands between two curly brackets.

#### Example
```
say hello!
execute as @s[tag=target] run {
  say bye
}
```

### Loops
Loops!
Functioner adds the `repeat` keyword that runs the current function again.

#### Example 1 - Count to 10
Logs the numbers 1 to 10 into chat

```
scoreboard objectives add count dummy
scoreboard players set value count 0

execute run {
  scoreboard players add value count 1
  tellraw @a `count[value]`
  execute unless score value count matches 10 repeat
}
```

#### Example 2 - Raycast

```
execute at @s anchored eyes run {
  execute unless block ^^^.25 air run {
    setblock ~~~ diamond_block
  }
  execute positioned ^^^.25 if block ~~~ air repeat
}
```

### Relative Paths
Reference files using relative paths.

**BP/functions/path/to/file.mcfunction**
```
function ./nested
```
In the above example, `./nested` with be evaluated to be `path/to/nested`


### Template Strings
Write rawtext using a more consise syntax between backticks ( \` ). Include data between curly brackets (\{ \})

**text**
```
tellraw @a `hello`
```
**selector**
```
tellraw @a `hello {@p}`
```
**score**
```
tellraw @s `my score is {scoreboard[@s]}`
```
**translations**
```
tellraw @s `{example.langcode.1}`
```

### Function Arguments
Functioner adds a new `with` subcommand to the function command, that allows you to pass values into functions.

Example:
```mcfunction
# example.mcfunction:
function ./other_function with x 2

# other_function.mcfunction:
tellraw @a `Argument x = {arguments[x]}`
```
You can then access arguments through the `arguments` scoreboard.

You can also set them to be the value of a player from a scoreboard.
```mcfunction
function ./other_function with x score @s y
```

### Feature Flags
Allows you to add/remove functions or commands from files based off of what flags are enabled.

This function will say dev if the `@development` feature flag is present, and `@production` if the production flag is present.
```
@development say dev!
@production say prod!
```

This function will only be compiled if the `@development` feature flag is present.
```
@development
say Hello
```

Enable feature flags using the flags property in settings
```json
    "profiles": {
      "default": {
        "filters": [
          {
            "filter": "functioner",
            "settings": {
              "flags": [ "@development", "@example" ]
            }
          }
        ],
        "export": {
          "target": "local",
          "readOnly": false
        }
      },
    }
```

---

## Installation
```
regolith install functioner==latest
```

## Settings
#### Using the Blockception Development Plugin with VSCode

It is recomended to create an .mcattributes file in the root of your project containing the following lines:
```
diagnose.behaviorpack.mcfunction.missing=false
diagnostic.disable.behaviorpack.mcfunction.syntax.unknown=true
```

#### Configuring Functioner
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
                "filter": "functioner",
                "settings": { }
            }
        ]
    }
}
```

These are the settings that can be modified:
```jsonc
"settings": {
  "searchPattern": "BP/**/*.mcfunction", // a glob pattern for the files to be scanned. by default looks at all .mcfunction files in the BP.
  "flags": [] // a list of feature flags that causes some functions to be optionally compiled.
}
```


