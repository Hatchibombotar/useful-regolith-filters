tellraw @a { "text": "hello" }
tellraw @a { "score": {"name": "@a", "objective": "thing" } }
tellraw @a { "selector": "@a" }
tellraw @a { "translate": "" }

tellraw @a `hello`
tellraw @a `{{ "text": "hello" }}`
tellraw @a `{thing[@a]}`
tellraw @a `{thi_ng[@a]}`
tellraw @a `{thiNg[@a]}`
tellraw @a `{@a}`
tellraw @a `{example.key}`