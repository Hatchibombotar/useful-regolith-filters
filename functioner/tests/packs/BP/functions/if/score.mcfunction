scoreboard objectives add if_score dummy
scoreboard players set @s if_score 0
scoreboard players set @s if_score 2

# checks if the executors score is equal to 2
if score @s if_score 2 say §2If Score Test 1/1 Passed