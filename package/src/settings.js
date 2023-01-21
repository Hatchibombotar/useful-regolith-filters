// const settings = {
//     "package": {
//         "mctemplate": {
//             "BP": true,
//             "RP": true,
//             "packs": "include" || "reference" || "none",
//             "world": "worldTemplate" || <filepath> || <number>
//         },
//         "mcworld": {
//             "BP": true,
//             "RP": true,
//             "packs": "include" || "reference" || "none",
//             "world": "worldTemplate" || <filepath> || <number>
//         },
//         "mcaddon": {
//             "BP": true,
//             "RP": true
//         },
//         "mcpack": {
//             "BP": true,
//             "RP": true,
//             "skins": false
//         }
//     },
//     "package_location": "",
// }

const settings = JSON.parse(process.argv[2])

module.exports = settings