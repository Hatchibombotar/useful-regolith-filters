# Functioner
A filter for regolith that adds more syntax to function files.

### Install Latest
```
regolith install functioner
```

## Instructions

### Subfunctions
These are functions inside of functions. These allow for multiple commands to be ran at once.

Enter your commands between two curly brackets.

#### Example
```
say hi
execute as @s[tag=target] run {
  say bye
}
```

### Loops
Loops!
Functioner adds the `repeat` keyword that runs the current function again.

### Example 1 - Count to 10

```
scoreboard objectives add count dummy
scoreboard players set value count 0

execute run {
  scoreboard players add value count 1
  tellraw @a { "rawtext": [ { "score": {"name": "value", "objective": "count" } } ] }
  execute unless score value count matches 10 repeat
}
```

### Example 2 - Raycast

```
execute at @s anchored eyes run {
  execute unless block ^^^.25 air run {
    setblock ~~~ diamond_block
  }
  execute positioned ^^^.25 if block ~~~ air repeat
}
```

### Settings
#### Using the Blockception Development Plugin with VSCode

It is reccomended to create an .mcattributes file in the root of your project containing the following lines:
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
  "searchPattern": "BP/**/*.mcfunction" // a glob pattern for the files to be scanned. by default looks at all .mcfunction files in the BP.
}
```
