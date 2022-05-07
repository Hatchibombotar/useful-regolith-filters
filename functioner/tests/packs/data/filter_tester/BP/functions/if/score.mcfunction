scoreboard objectives add if_score dummy
scoreboard players set @s if_score 0
scoreboard players set @s if_score 2

# checks if the executors score is equal to 2
scoreboard objectives add F_10 dummy
scoreboard players set @s F_10 0
scoreboard objectives add F_11 dummy
scoreboard objectives add if_score dummy
scoreboard players operation @s F_11 = @s if_score
execute @s[scores={F_11=2}] ~ ~ ~ scoreboard players set @s F_10 1
execute @s[scores={F_10=1}] ~ ~ ~ say §2If Score Test 1/1 Passed