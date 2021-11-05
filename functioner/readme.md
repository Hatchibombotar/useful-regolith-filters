# Functioner
A filter for regolith that adds more syntax to function files.

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
## if/unless command
Inspired by java's execute subfunction. Can be used anywhere.

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

Although functioner will not prevent you from doing so, you should not use any scoreboards or tags with the prefix `f_`.