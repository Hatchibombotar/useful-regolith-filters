scoreboard objectives add count dummy
scoreboard players set value count 0

execute run {
    scoreboard players add value count 1
    tellraw @a { "rawtext": [ { "score": {"name": "value", "objective": "count" } } ] }
    execute unless score value count matches 10 repeat
}