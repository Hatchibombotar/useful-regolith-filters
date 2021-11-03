# Regolith Functioner
A filter for regolith that adds more syntax to function files.

## "Sub-functions"
These are functions inside of functions. These allow for multiple commands to be ran at once.

### Example
```
say hi
execute @s[tag=target] ~ ~ ~ {
  say bye
}
```

## Global Score Testing
Allows for you to test for global scores from a "global" player. 

### Example
```
execute @s[gscores={test=0, test1=0}] ~ ~ ~ /say hi
```