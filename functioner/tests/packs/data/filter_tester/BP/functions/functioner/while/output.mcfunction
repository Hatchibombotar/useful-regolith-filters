function functioner/extracted/9-0
scoreboard objectives add F_3 dummy
scoreboard players set @s F_3 0
scoreboard objectives add F_4 dummy
scoreboard objectives add LoopScore dummy
scoreboard players operation @s F_4 = x LoopScore
execute @s[scores={F_4=..10}] ~ ~ ~ scoreboard players set @s F_3 1
execute @s[scores={F_3=1}] ~ ~ ~ function functioner/while/output