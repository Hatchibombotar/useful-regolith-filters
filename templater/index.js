const glob = require("glob");
const fs = require("fs");

function merge(arguments, level, maxLevel) {

    let target = {};

    // deep merge the object into the target object
    function merger(obj) {
        for (let prop in obj) {
            if (obj.hasOwnProperty(prop)) {
                if ((Object.prototype.toString.call(obj[prop]) === "[object Object]") && (level != maxLevel)) {
                    // if the property is a nested object
                    target[prop] = merge([target[prop], obj[prop]], level + 1, maxLevel)
                } else {
                    // for regular property or when the max level has been reached
                    target[prop] = obj[prop]
                }
            }
        }
    }
    // iterate through all objects and deep merge them with target
    for (let i = 0; i < arguments.length; i++) {
        merger(arguments[i]);
    }

    return target;
};

let currentTemplates = []
glob("BP/templates/**/*.json", null, function (err, files) {
    for (file of files) {
        const template = JSON.parse(fs.readFileSync(file))
        currentTemplates.push(template)
    };
    for (template of currentTemplates) {
        glob(`${template.description.use_on}**/*.json`, null, function (er, files) {
            for (file of files) {
                const fileContent = JSON.parse(fs.readFileSync(file))
                const templateUsed = fileContent.use_template
                const templateIndex = currentTemplates.findIndex(x => x.description.identifier == templateUsed)
                if (templateUsed == undefined) continue
                if (templateIndex == -1) { console.log(`Template ${templateUsed} could not be found.`); continue; }
                const newFile = merge([currentTemplates[templateIndex].template, fileContent], 0, currentTemplates[templateIndex].description.write_level)
                delete newFile.use_template
                fs.writeFileSync(file, JSON.stringify(newFile, null, "  "))
            }
        })
    }
    fs.rm("BP/templates/", { recursive: true }, function() {});
})