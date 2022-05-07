scoreboard players remove time_left W_F_2 1
scoreboard players operation @e[tag=F_2] W_F_2 = time_left W_F_2
execute @e[tag=F_2, scores={W_F_2=0}] ~ ~ ~ say §2Unsafe Execution Test Sucessful
scoreboard players remove time_left W_test1 1
scoreboard players operation @e[tag=F_3] W_test1 = time_left W_test1
execute @e[tag=F_3, scores={W_test1=0}] ~ ~ ~ say §2 10 seconds is up! (Test 1/2)
scoreboard players remove time_left W_test2 1
scoreboard players operation @e[tag=F_4] W_test2 = time_left W_test2
execute @e[tag=F_4, scores={W_test2=0}] ~ ~ ~ say §2 0.2 minutes is up! (Test 2/2)