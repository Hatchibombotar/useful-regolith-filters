// "templater:rotate_y": {
//     "property": "templater:rotation"
// }

const rotationValues = [
    [ 0, 0, 0 ],
    [ 0, 0, 0 ],
    
    //  north, south, west, east
    [ 0, 0, 0 ],
    [ 0, 180, 0 ],
    [ 0, 90, 0 ],
    [ 0, -90, 0 ],

    [ 0, 0, 0 ]
]

module.exports = {
    description: {
        identifier: "templater:rotate_y",
        use_on: "BP/blocks/",
        write_level: 2
    },
    template(parameters) {
        const rotationProperty = parameters.property ?? "templater:block_rotation"

        const description = {
            "properties": {
                [rotationProperty]: [0, 1, 2, 3, 4, 5, 6]
            }
        }
        const components = {
            "minecraft:on_player_placing": {
                "event": "templater:set_rotation",
                "target": "self"
            }
        }
        const events = {
            "templater:set_rotation": {
                "set_block_property": {
                    [rotationProperty]: "query.cardinal_facing_2d"
                }
            }
        }
        const permutations = []

        for (const rotation in rotationValues) {
            permutations.push({
                "condition": `q.block_property('${rotationProperty}') == ${rotation}`,
                "components": {
                    "minecraft:rotation": rotationValues[rotation]
                }
            })
            
        }

        return {
            "minecraft:block": {
                description,
                components,
                events,
                permutations
            }
        }
    }
}