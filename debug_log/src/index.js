const fs = require("fs")
const glob = require("glob")
const JSONC = require("jsonc").safe

const {colours, entities: {include, exclude}} = require("./settings")
const {event: eventColour} = colours

for (const filePath of glob.sync("BP/entities/**/*.json")) {
    if (fs.lstatSync(filePath).isDirectory()) continue
    const [parseError, fileContent] = JSONC.parse(String(fs.readFileSync(filePath)))
    if (parseError) {
        console.error(`Failed to parse JSON in ${filePath}`)
        break
    }

    if (!("minecraft:entity" in fileContent)) {
        console.error(`Entity missing main object ("minecraft:entity") in ${filePath}`)
        break
    }

    if (include && !include.includes(fileContent["minecraft:entity"].description.identifier)) continue
    else if (exclude && exclude.includes(fileContent["minecraft:entity"].description.identifier)) continue
    

    fs.writeFileSync(filePath, JSON.stringify(entity(fileContent), null, 4))
    
}

function entity(input) {
    const file = input["minecraft:entity"]
    
    if (!file.events) return file

    for (const event in file.events) {
        let eventContent = file.events[event]
        eventContent.run_command = eventContent.run_command ?? { "command": [] }

        let rawtext = []
        const [namespace, name] = file.description.identifier.split(":")
        
        const langName = `entity.${namespace == "minecraft" ? name : file.description.identifier }.name`

        // e.g.  [entity.minecraft:pig.name] Event: minecraft:on_saddled
        rawtext = [...rawtext,
            { "text": '[' },
            { "translate": langName },
            { "text": '] ' },
            { "text": `§l§${eventColour}Event:§r ` },
            { "text": event },
        ]

        eventContent["run_command"]["command"].push(
            `tellraw @a { "rawtext": ${JSON.stringify(rawtext)} }`
        )

        file.events[event] = eventContent
    }

    return input
}