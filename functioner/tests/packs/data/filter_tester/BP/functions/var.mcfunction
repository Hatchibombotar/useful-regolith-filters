scoreboard objectives add F_number dummy F_number
scoreboard players set @s F_number 0
scoreboard objectives add myVariable dummy myVariable
scoreboard players operation @s myVariable = @s F_number
tellraw @a { "rawtext": [ { "text": "§2Current value: "}, { "score": {"name": "@s", "objective": "myVariable" } }, { "text": " (should be 0)"} ] }

scoreboard players add @s myVariable 1
tellraw @a { "rawtext": [ { "text": "§2Current value: "}, { "score": {"name": "@s", "objective": "myVariable" } }, { "text": " (should be 1)"} ] }

scoreboard players remove @s myVariable 1
tellraw @a { "rawtext": [ { "text": "§2Current value: "}, { "score": {"name": "@s", "objective": "myVariable" } }, { "text": " (should be 0)"} ] }

scoreboard objectives add F_number dummy F_number
scoreboard players set @s F_number 5
scoreboard players operation @s myVariable += @s F_number
tellraw @a { "rawtext": [ { "text": "§2Current value: "}, { "score": {"name": "@s", "objective": "myVariable" } }, { "text": " (should be 5)"} ] }

scoreboard objectives add F_number dummy F_number
scoreboard players set @s F_number 1
scoreboard players operation @s myVariable -= @s F_number
tellraw @a { "rawtext": [ { "text": "§2Current value: "}, { "score": {"name": "@s", "objective": "myVariable" } }, { "text": " (should be 4)"} ] }

scoreboard objectives add F_number dummy F_number
scoreboard players set @s F_number 4
scoreboard players operation @s myVariable *= @s F_number
tellraw @a { "rawtext": [ { "text": "§2Current value: "}, { "score": {"name": "@s", "objective": "myVariable" } }, { "text": " (should be 16)"} ] }

scoreboard objectives add F_number dummy F_number
scoreboard players set @s F_number 2
scoreboard players operation @s myVariable /= @s F_number
tellraw @a { "rawtext": [ { "text": "§2Current value: "}, { "score": {"name": "@s", "objective": "myVariable" } }, { "text": " (should be 8)"} ] }

scoreboard objectives add F_number dummy F_number
scoreboard players set @s F_number 1
scoreboard players operation @s myVariable += @s F_number
scoreboard objectives add F_number dummy F_number
scoreboard players set @s F_number 2
scoreboard players operation @s myVariable %= @s F_number
tellraw @a { "rawtext": [ { "text": "§2Current value: "}, { "score": {"name": "@s", "objective": "myVariable" } }, { "text": " (should be 1)"} ] }

scoreboard objectives add F_number dummy F_number
scoreboard players set @s F_number 10
scoreboard players operation @s myVariable > @s F_number
tellraw @a { "rawtext": [ { "text": "§2Current value: "}, { "score": {"name": "@s", "objective": "myVariable" } }, { "text": " (should be 10)"} ] }

scoreboard objectives add F_number dummy F_number
scoreboard players set @s F_number 0
scoreboard players operation @s myVariable < @s F_number
tellraw @a { "rawtext": [ { "text": "§2Current value: "}, { "score": {"name": "@s", "objective": "myVariable" } }, { "text": " (should be 0)"} ] }

scoreboard objectives add F_number dummy F_number
scoreboard players set @s F_number 200
scoreboard players operation @s myVariable >< @s F_number
tellraw @a { "rawtext": [ { "text": "§2Current value: "}, { "score": {"name": "@s", "objective": "myVariable" } }, { "text": " (should be 200)"} ] }
