scoreboard players add value F_1 1
tag @e[c=1] add F_1
scoreboard players operation @e[tag=F_1] F_1 = value F_1
execute @e[tag=F_1, scores={F_1=600..}] ~ ~ ~ function functioner/intervals/0.5m
tag @e remove F_1