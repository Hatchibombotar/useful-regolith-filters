var x LoopScore = 0
while x LoopScore ..10 {
    tellraw @a { "rawtext": [ { "text": "§2While Loop Loop Number: "}, { "score": {"name": "x", "objective": "LoopScore" } }, { "text": "/10"} ] }
    var x LoopScore ++
}