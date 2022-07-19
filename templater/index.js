const fs = require("fs")
const glob = require("glob")

const MAIN_FILE_OBJECT_NAMES = [
    "minecraft:block",
    "minecraft:entity",
    "minecraft:item",
    "minecraft:recipe_shaped",
    "minecraft:recipe_shapeless",
    "minecraft:recipe_furnace",
    "minecraft:recipe_brewing_container",
    "minecraft:recipe_brewing_mix",
    "minecraft:spawn_rules",
    
    "animation_controllers",
    "animations",
    "minecraft:attachable",
    "minecraft:client_entity",
    "particle_effect",
    "render_controllers",
]

const isObject = (value) =>  Object.prototype.toString.call(value) === "[object Object]"
function deepMerge(objects, currentLevel, maxLevel = 2) {
    let target = {}

    // deep merge the object into the target object
    function merger(obj) {
        for (let prop in obj) {
            if (isObject(obj[prop]) && (currentLevel != maxLevel)) {
                // if the property is a nested object
                target[prop] = deepMerge([target[prop], obj[prop]], currentLevel + 1, maxLevel)
            } else {
                // for regular property or when the max level has been reached
                target[prop] = obj[prop]
            }
        }
    }
    // iterate through all objects and deep merge them with target
    for (let i = 0; i < objects.length; i++) {
        merger(objects[i]);
    }

    return target;
}

function insertVariablesInJSON(json, variables) {
    let result = {}
 
    for (let prop in json) {
        if (prop in json) {		
            // if the property is a nested object call function on it and continue
			// Modify the name of the property.
			// get the new value for the property name. Replace variables with their (STRING) values.
			const newPropertyName = prop.replace(/\${(.*?)}/g, function(_match, variableName) {
				const variableValue = variables[variableName]
				if (variableValue == undefined) {
					console.error(`Variable ${variableName} has not been given a value`)
					return
				}
				if (typeof variableValue != "string") {
					console.error(`Variable "${variableName}" located inside of JSON key must be a string.`)
					return
				}
				return variableValue
			})

			if (isObject(json[prop])) {
                result[newPropertyName] = insertVariablesInJSON(json[prop], variables)
                continue
            }

			if (typeof json[prop] != "string") {
				result[newPropertyName] = json[prop]
				continue
            }

			// Modify the value of the property.			
			const propValueMatches = json[prop].match(/\${.*?}/g)
			
			if (propValueMatches) {
				if (propValueMatches.length == 1 && json[prop].slice(0, 1) == "$" && json[prop].slice(-1) == "}") {
					// Replace strings with one variable with the value of the variable
					const variableName = propValueMatches[0].slice(2, -1)
					const variableValue = variables[variableName]
					if (variableValue == undefined) {
						console.error(`Variable "${variableName}" has not been given a value`)
						continue
					}
					result[newPropertyName] = variableValue
				} else {
					// Replace variable references in strings with their (STRING) value
					result[newPropertyName] = json[prop].replace(/\${(.*?)}/g, function(_match, variableName) {
		                const variableValue = variables[variableName]
		                if (variableValue == undefined) {
		                    console.error(`Variable "${variableName}" has not been given a value`)
		                    return
		                }
		                if (typeof variableValue != "string") {
		                    console.error(`Variable "${variableName}" must be a string if being concatenated.`)
		                    return
		                }
		                return variableValue
		            })
				}
			} else {
				// if the value is not modifed, just set the result value with the property name.
				result[newPropertyName] = json[prop]
			}

        }
    }

    return result
}

let templates = []
let filesUseTemplates = []
let filesModfied = []

glob("data/templater/**/*.json", null, function (err, files) {
    // add all templates to the templates array
    for (const file of files) {
        const template = JSON.parse(fs.readFileSync(file))
        templates.push(template)
    }

    // if templates require other templates, merge them
    let reachedEndOfTree = false
    while (!reachedEndOfTree) {
        reachedEndOfTree = true
        for (const templateIndex in templates) {
            let template = templates[templateIndex]

            if (template.use_templates == undefined) continue
            const referencedTemplates = Object.keys(template.use_templates)
            if (!isObject(template.use_templates)) {
                console.error(`[${template.description.identifier}] use_templates must be an object.`)
                break
            }

            for (templateUsed of referencedTemplates) {
                const referencedTemplateIndex = templates.findIndex(x => x.description.identifier == templateUsed)
                if (referencedTemplateIndex == -1) {
                    console.error(`[Template Definition - ${template.description.identifier}] Template ${templateUsed} could not be found.`)
                    continue
                }
                const referencedTemplate = templates[referencedTemplateIndex]
                if (template.description.use_on != referencedTemplate.description.use_on) {
                    console.error(`[Template Definition] The use_on property of ${template.description.identifier} is not the same as ${referencedTemplate.description.identifier}.`)
                    console.error(`"${template.description.use_on}" != "${referencedTemplate.description.use_on}"`)
                    continue
                }

                template.template = deepMerge([template.template, referencedTemplate.template], 0, template.description.write_level)

                if (referencedTemplate.use_templates != undefined) {
                    template.use_templates = referencedTemplate.use_templates
                } else {
                    delete template.use_templates
                }
            }
            reachedEndOfTree = false
        }
    }

    for (const template of templates) {
        const templateDescription = template.description
        const templateParameters = templateDescription.parameters ?? {}
        // Look through all of the files that the template could be used for
        glob(`${templateDescription.use_on}**/*.json`, null, function (er, files) {
            for (const file of files) {
                const fileContent = JSON.parse(fs.readFileSync(file))
                const templatesUsed = fileContent.use_templates ?? undefined
                if (typeof templatesUsed != "object") {
                    console.error(`[${fileContent["minecraft:entity"].description.identifier}] use_templates must be an object.`)
                }
                
                const fileParameters = fileContent["use_templates"][templateDescription.identifier] ?? {}

                // if file does not ask for any template, skip. 
                if (templatesUsed == undefined) continue
                else filesUseTemplates.push(file)

                // if file does not ask for this template, skip.
                const templateIndex = Object.keys(templatesUsed).findIndex(x => x == templateDescription.identifier)
                if (templateIndex == -1) continue
                else filesModfied.push(file)

                // attempt to find the identifier variable in the target file
                let identifier;
                for (parent of MAIN_FILE_OBJECT_NAMES) {
                    if (parent in fileContent) {
                        identifier = fileContent[parent].description.identifier
                        break
                    }
                }

                // make sure that all parameters defined in the template are defined in the file.
                for (const parameter of Object.keys(templateParameters)) {
                    if (!(parameter in fileParameters)) {
                        console.error(`Parameter ${parameter} is not defined inside of file ${fileContent.description.identifier}`)
                        continue
                    }
                    if (typeof templateParameters[parameter] != typeof fileParameters[parameter]) {
                        console.error(`Parameter ${parameter} should be type ${templateParameters[parameter]} inside of file ${fileContent.description.identifier}.`)
                        continue
                    }

                }
                // get the value of the variables
                const variableValues = {
                    ...templateParameters,
                    ...fileParameters,
                    "identifier": identifier,
                    "namespace": identifier.split(":")[0],
                    "name": identifier.split(":")[1]
                }

                // merge the files with the referenced template, insert variables and save the file
                const newFile = insertVariablesInJSON(
                    deepMerge([template.template, fileContent], 0, templateDescription.write_level),
                    variableValues
                )
                fs.writeFileSync(file, JSON.stringify(newFile, null, "  "))
            }
        })
    }

    // check if all file's templates exist and are made for the same directory as it
    for (const file of filesModfied) {
        const fileData = JSON.parse(fs.readFileSync(file))

        if (fileData.use_templates == undefined) continue
        for (const templateRequired of fileData.use_templates) {
            const templateIndex = templates.findIndex(x => x == templateRequired)
            if (templateIndex == -1) {
                console.error(`[Template Missing] ${file}`)
                console.error(`Template ${templateRequired} could not be found.`)
            }
        }
    }

    // check if all templates's used templates exist and are made for the same directory as it
    for (const template of templates) {
        const fileData = template

        if (fileData.use_templates == undefined) continue
        for (const templateRequired of fileData.use_templates) {
            const templateIndex = templates.findIndex(x => x == templateRequired)
            if (templateIndex == -1) {
                console.error(`[Template Missing] ${templateRequired}`)
                console.error(`Template ${templateRequired} could not be found.`)
            }
        }
    }

    // Deletes use_templates key from all processed files.
    //
    // filesModified can contain the same file multiple times,
    // but it is easier to just skip if it has already been deleted
    // rather than removing duplicate elements.
    for (const file of filesModfied) {
        const fileData = JSON.parse(fs.readFileSync(file))

        if ("use_templates" in fileData) continue
        delete fileData.use_templates

        fs.writeFileSync(file, JSON.stringify(fileData))
    }

})