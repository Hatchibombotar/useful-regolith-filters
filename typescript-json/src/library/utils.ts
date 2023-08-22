export function deepMerge(objects, maxLevel = 2, currentLevel = 0) {
	const isObject = (value) =>  Object.prototype.toString.call(value) === "[object Object]"
    let target = {}

    // deep merge the object into the target object
    function merger(obj) {
        for (let prop in obj) {
            if (isObject(obj[prop]) && (currentLevel != maxLevel)) {
                // if the property is a nested object
                target[prop] = deepMerge([target[prop], obj[prop]], maxLevel, currentLevel + 1)
            } else if (Array.isArray(obj[prop])) {
				target[prop] = target[prop] ?? []
				target[prop]= [...target[prop], ...obj[prop]]
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