setblock ~ ~-1 ~ wool 14

# tests for red wool
scoreboard objectives add F_5 dummy
scoreboard players set @s F_5 0
execute @s ~ ~ ~ detect ~ ~-1 ~ minecraft:wool 14 scoreboard players set @s F_5 1
execute @s[scores={F_5=1}] ~ ~ ~ say §2If Block Test 1/3 Passed

## currenty broken
# if block ~ ~-1 ~ minecraft:wool["color":"red"] say Block Test 2/4 Passed

# checks for any wool
scoreboard objectives add F_6 dummy
scoreboard players set @s F_6 0
execute @s ~ ~ ~ detect ~ ~-1 ~ minecraft:wool -1 scoreboard players set @s F_6 1
execute @s[scores={F_6=1}] ~ ~ ~ say §2If Block Test 2/3 Passed
scoreboard objectives add F_7 dummy
scoreboard players set @s F_7 0
execute @s ~ ~ ~ detect ~ ~-1 ~ minecraft:wool -1 scoreboard players set @s F_7 1
execute @s[scores={F_7=1}] ~ ~ ~ say §2If Block Test 3/3 Passed