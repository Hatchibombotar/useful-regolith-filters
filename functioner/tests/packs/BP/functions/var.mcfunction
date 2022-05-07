var @s myVariable = 0
tellraw @a { "rawtext": [ { "text": "§2Current value: "}, { "score": {"name": "@s", "objective": "myVariable" } }, { "text": " (should be 0)"} ] }

var @s myVariable ++
tellraw @a { "rawtext": [ { "text": "§2Current value: "}, { "score": {"name": "@s", "objective": "myVariable" } }, { "text": " (should be 1)"} ] }

var @s myVariable --
tellraw @a { "rawtext": [ { "text": "§2Current value: "}, { "score": {"name": "@s", "objective": "myVariable" } }, { "text": " (should be 0)"} ] }

var @s myVariable += 5
tellraw @a { "rawtext": [ { "text": "§2Current value: "}, { "score": {"name": "@s", "objective": "myVariable" } }, { "text": " (should be 5)"} ] }

var @s myVariable -= 1
tellraw @a { "rawtext": [ { "text": "§2Current value: "}, { "score": {"name": "@s", "objective": "myVariable" } }, { "text": " (should be 4)"} ] }

var @s myVariable *= 4
tellraw @a { "rawtext": [ { "text": "§2Current value: "}, { "score": {"name": "@s", "objective": "myVariable" } }, { "text": " (should be 16)"} ] }

var @s myVariable /= 2
tellraw @a { "rawtext": [ { "text": "§2Current value: "}, { "score": {"name": "@s", "objective": "myVariable" } }, { "text": " (should be 8)"} ] }

var @s myVariable += 1 # forces there to be a remainder, so this should be 9 and give a remainder of 1
var @s myVariable %= 2
tellraw @a { "rawtext": [ { "text": "§2Current value: "}, { "score": {"name": "@s", "objective": "myVariable" } }, { "text": " (should be 1)"} ] }

var @s myVariable > 10
tellraw @a { "rawtext": [ { "text": "§2Current value: "}, { "score": {"name": "@s", "objective": "myVariable" } }, { "text": " (should be 10)"} ] }

var @s myVariable < 0
tellraw @a { "rawtext": [ { "text": "§2Current value: "}, { "score": {"name": "@s", "objective": "myVariable" } }, { "text": " (should be 0)"} ] }

var @s myVariable >< 200
tellraw @a { "rawtext": [ { "text": "§2Current value: "}, { "score": {"name": "@s", "objective": "myVariable" } }, { "text": " (should be 200)"} ] }
