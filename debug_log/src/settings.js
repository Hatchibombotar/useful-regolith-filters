const settings = JSON.parse(process.argv[2] ?? "{}")

module.exports = {
    entities: {
        // "include": [],
        // "exclude": [],
        ...settings.entities,
    },
    colours: {
        "event": "a",
        ...settings.colours,
        ...settings.colors,
    },
}