# Functioner
A filter for regolith that adds more syntax to function files.

### Install Latest
```
regolith install github.com/Hatchibombotar/useful-regolith-filters/functioner==latest
```


Below are the instructions for how to use functioner, alternatively you can have a look at the tests folder to see an example of everything in functioner.
[Tests Folder](./tests/packs/BP/)

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
# Commands

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

## While command

Allows you to use itteration within your functions
### Format

`while <var> <condition> [...]`


There is no break command, the only way to break a loop is by completing the condition in the loop

## Wait Command

Akin to the java edition's `/schedule` command. This runs a command after the time has finished.

`wait start <time> <userprovidedid> [...]`

`wait end <userprovidedid>`

_The user provided ID must be smaller than 14 characters._

You can access the current time (in ticks) in a scoreboard with the name `W_<userprovidedid>`

[UNITS OF TIME](#units-of-time)

The timer only works for entities, execution from other sources are not guarenteed to work.

## Variable Command

This is a shorthand scoreboard syntax that looks nicer. When re-assigning variables you still have to use the variable key word. E.G:
```
var myVariable @s = 0
if entity @e[type=chicken] var myVariable @s = 2
```

Max 16 characters. Can be accessed on a scoreboard as a normal

### Format
`var <scoreboard> <target> <operator>`
`var <scoreboard> <target> <operator> <value>`
`var <scoreboard> <target> <operator> <scoreboard> <source>`

You can either set modify scores using regular interger values or by referencing another score. Value is not required with Increment, Decrement, and Remove types.

Examples:

```
var myVariable @s = 0
var myVariable @s = otherVariable @s
```

#### Operators
You can not only assign values using this command, but also are able to use a whole variety of other operators:

|Operator| Name | Description |
|--|--|--|
| = | Assign | Set target's score to source's score |
| += | Add | Add source's score to target's score |
| -= | Subtract | Subtract source's score to target's score |
| *= | Multiply | Multiply source's score by target's score |
| /= | Divide (floored) | Multiply source's score by target's score, ignoring remainders |
| %= | Modulus (Remainer) | Gets the remainder from the target and sources scores multiplied together |
| ++ | Increment | Add 1 to target's score |
| -- | Decrement | Remove 1 from target's score |
| < | Min | Set target's score to source's score if source's score is less |
| > | Max | Set target's score to source's score if source's score is more |
| >< | Swap | Swaps target's score and source's score |


## Bypass Command run limit

The command `/ucall` will run commands, even if the command run limit has been reached. This is useful for longer functions.
### Example
```
ucall say Unsafe Execution Sucessful!
```

Please note that the `ucall` command will require two extra lines, along with it's own, as well as other custom commands that may take up more space after compilation,

---
## tick.json intervals TODO
You can use the intervals key inside of the `intervals.json` file to activate functions at intervals.
```json
{
  "intervals": {
    "1.0s": [
      "function",
      "path/to/function",
    ]
}
```
The above file would run both `function` and `path/to/function` every 1 second.

This also uses the [UNITS OF TIME](#units-of-time)

## Block data format
In certain areas an alternate block data format will be used.

`block_id[block_states|data_value]`

### Examples
_both examples are of a red wool block._
#### block_states

`minecraft:wool["color":"red"]` - This currently does not work 

#### data_value

`minecraft:wool[14]`

## Range conditions
Built into bedrock by default. There are four different conditions that can be represented in this system.

- is equal to - done by writing the number by itelf e.g. `3`
- is greater than - writing `..` after the number e.g. `2..`
- is less than - writing `..` before the number e.g. `..5`
- is between - writing `..` between the numbers e.g. `2..6`

## Units of Time

- d - an in-game day, 24000 ticks
- m - a minute, 1200 ticks
- s - a second, 20 ticks
- t - the default unit, a single tick. This is default and omitable.

_The time is set to the closest integer tick after unit conversion. For example. `0.5d` is same as 12000 ticks._

## Optimal formatting
Although functioner tries it's hardest to read your commands it may not always be perfect.
If you have any issues with functioner make sure:
- Coordinates have spaces between them
- spaces are only used to seperate arguments

## Reserved names

Although functioner will not prevent you from doing so, you should not use any scoreboards or tags with the following prefixes:
- `F_`
- `W_`

## Using the Blockception Development Plugin with VSCode

It is reccomended to create an .mcattributes file in the root of your project containing the following lines:
```
diagnose.behaviorpack.mcfunction.missing=false
diagnostic.disable.behaviorpack.mcfunction.syntax.unknown=true
```