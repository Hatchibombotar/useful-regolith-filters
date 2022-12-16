const isObject = (value) =>  Object.prototype.toString.call(value) === "[object Object]"

// deep merge two objects.
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

module.exports = {
    deepMerge
}