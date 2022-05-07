summon cod ~ ~5 ~ minecraft:entity_spawned bob
## Check if bob exists
scoreboard objectives add F_8 dummy
scoreboard players set @s F_8 0
scoreboard objectives add F_9 dummy
scoreboard players set count F_9 0
execute @e[name=bob] ~ ~ ~ scoreboard players add count F_9 1
scoreboard players operation @s F_9 = count F_9
execute @s[scores={F_9=1..}] ~ ~ ~ scoreboard players set @s F_8 1
execute @s[scores={F_8=1}] ~ ~ ~ say §2If Entity Test 1/1 Passed