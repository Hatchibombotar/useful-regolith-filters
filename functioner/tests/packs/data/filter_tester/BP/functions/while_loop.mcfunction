scoreboard objectives add F_number dummy F_number
scoreboard players set @s F_number 0
scoreboard objectives add LoopScore dummy LoopScore
scoreboard players operation x LoopScore = @s F_number
function functioner/while/output