setblock ~ ~-1 ~ wool 14

# tests for red wool
if block ~ ~-1 ~ minecraft:wool[14] say §2If Block Test 1/3 Passed

## currenty broken
# if block ~ ~-1 ~ minecraft:wool["color":"red"] say Block Test 2/4 Passed

# checks for any wool
if block ~ ~-1 ~ minecraft:wool[] say §2If Block Test 2/3 Passed
if block ~ ~-1 ~ minecraft:wool say §2If Block Test 3/3 Passed