setblock ~ ~-1 ~ wool 13

# tests for red wool
scoreboard objectives add F_12 dummy
scoreboard players set @s F_12 0
execute @s ~ ~ ~ detect ~ ~-1 ~ minecraft:wool 14 scoreboard players set @s F_12 1
execute @s[scores={F_12=0}] ~ ~ ~ say §2Unless Test 1/1 Passed