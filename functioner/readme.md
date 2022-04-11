# Functioner
A filter for regolith that adds more syntax to function files.

### Install Latest
```
regolith install github.com/Hatchibombotar/useful-regolith-filters/functioner==latest
```

---
## "Sub-functions"
These are functions inside of functions. These allow for multiple commands to be ran at once.

Enter your commands between two curly brackets.

### Example
```
say hi
execute @s[tag=target] ~ ~ ~ {
  say bye
}
```

---
## if|unless command
Inspired by java's if/unless execute subfunction. Can be used anywhere.

### Format

There are three different types of conditions:

- [if|unless block](#block) – Tests if a block exists
- [if|unless entity](#entity) – Tests whether any entity exists
- [if|unless score](#score) - Tests an target's score

#### Block
`if|unless block <pos> <block> [...]`

_Please note this uses the block data format talked about [here](#block-data-format)_

#### Entity
`if|unless entity <targets>  [...]`

#### Score
##### comparing against number/range
`if|unless score <target> <scoreboard> <condition> [...]`

_Uses [range conditions](#range-conditions)_

---
## While command

Allows you to use itteration within your functions
### Format

`while <var> <condition> [...]`


There is no break command, the only way to break a loop is by completing the condition in the loop

---
## Wait Command

Akin to the java edition's `/schedule` command. This runs a command after the time has finished.

`wait start <time> <userprovidedid> [...]`

`wait end <userprovidedid>`

_The user provided ID must be smaller than 14 characters._

You can access the current time (in ticks) in a scoreboard with the name `W_<userprovidedid>`


### Units of Time

- d - an in-game day, 24000 ticks
- s - a second, 20 ticks
- t - the default unit, a single tick. This is default and omitable.

_The time is set to the closest integer tick after unit conversion. For example. `0.5d` is same as 12000 ticks._

The timer only works for entities, execution from other sources are not guarenteed to work.

---

## Variables

Unlike other languages variables are global, similar to scoreboards. Additionally, when re-assigning variables you still have to use the variable key word. E.G:
```
var myVariable = 0
if entity @e[type=chicken] var myVariable = 2
```

Max 16 characters. Can be accessed on a scoreboard with the same name and the player "value"

### Format
`var <var> <operator> <value>`

#### Operators

|Operator| Description | Example |
|--|--|--|
| = | Assign |  |
| ++ | Increment |  |
| -- | Decrement |  |
| += | Add |  |
| -= | Subtract |  |
| *= | Multiply |  |
| /= | Divide (floored) |  |
| %= | Modulus (Remainer) |  |
| DEL | Delete |  |

---
## Block data format
In certain areas an alternate block data format will be used.

`block_id[block_states|data_value]`

### Examples
_both examples are of a red wool block._
#### block_states

`minecraft:wool["color":"red"]`

#### data_value

`minecraft:wool[14]`

---
## Range conditions
Built into bedrock by default. There are four different conditions that can be represented in this system.

- is equal to - done by writing the number by itelf e.g. `3`
- is greater than - writing `..` after the number e.g. `2..`
- is less than - writing `..` before the number e.g. `..5`
- is between - writing `..` between the numbers e.g. `2..6`

---
## Optimal formatting
Although functioner tries it's hardest to read your commands it may not always be perfect.
If you have any issues with functioner make sure:
- Coordinates have spaces between them
- spaces are only used to seperate arguments
---
## Reserved names

Although functioner will not prevent you from doing so, you should not use any scoreboards or tags with the following prefixes:
- `F_`
- `W_`

## Using the Blockception Development Plugin in VSCode

It is reccomended to create an .mcattributes file in the root of your project containing the following lines:
```
diagnose.behaviorpack.mcfunction.missing=false
```