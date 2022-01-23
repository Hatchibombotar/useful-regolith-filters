#checks if a red wool block is beneath the player
if block ~ ~-1 ~ minecraft:wool[14] say block

# checks if the executors score is not smaller or equal to 1
unless score @s myScore ..1 say score

# says entity if an entity called bob exists
if entity @e[name=bob] say entity