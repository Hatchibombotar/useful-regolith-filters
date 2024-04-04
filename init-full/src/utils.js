/**
 * 
 * @param {Promise<T>} promise 
 * @returns {Promise<Result<T>>}
 */
export async function asyncCatch(promise) {
    try {
        const result = await promise
        return [result, null]
    } catch (err) {
        return [null, err]
    }
}

/**
 * 
 * @param {() => T} func 
 * @returns {Result<T>}
 */
export function syncCatch(func) {
    try {
        const result = func()
        return [result, null]
    } catch (err) {
        return [null, err]
    }
}