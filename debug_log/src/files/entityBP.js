const {colours, entities: {include, exclude}} = require("../settings")
const {event: eventColour} = colours

function entity(entityFile) {
    const entityData = entityFile["minecraft:entity"]
    
    function entityEvent(eventInput) {
        let event = {...eventInput}

        event.run_command = event.run_command ?? { "command": [] }

        const [namespace, name] = entityData.description.identifier.split(":")
        
        const langName = `entity.${namespace == "minecraft" ? name : entityData.description.identifier }.name`

        // e.g.  [entity.minecraft:pig.name] Event: minecraft:on_saddled
        const rawtext = [
            { "text": '[' },
            { "translate": langName },
            { "text": '] ' },
            { "text": `§l§${eventColour}Event:§r ` },
            { "text": event },
        ]

        event["run_command"]["command"].push(
            `tellraw @a { "rawtext": ${JSON.stringify(rawtext)} }`
        )

        return event
    }

    if (include && !include.includes(entityData.description.identifier)) return entityFile
    else if (exclude && exclude.includes(entityData.description.identifier)) return entityFile
    
    if (!entityData.events) return entityFile

    for (let [,event] of Object.entries(entityData.events)) {
        event = entityEvent(event)
    }

    return entityFile
}


module.exports = entity