scoreboard objectives add count dummy
scoreboard players set @s count 0
execute while score @s count matches ..10 @s run {
    scoreboard players add @s count 1
    say this should run 10 times
}