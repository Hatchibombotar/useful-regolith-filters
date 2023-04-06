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

<!-- ### Loops
Loops! Run a command until a condition is true or false

#### Example
```
say hi
execute as @s[tag=target] run {
  say bye
}
``` -->

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
