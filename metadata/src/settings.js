// const settings = {
//     "authors": string | string[],
//     "license": string,
//     "url": string,
//     "product_type": string,
//     "generated_with": {
//          [tool: string]: string[]
//     }
// }

const settings = JSON.parse(process.argv[2])

module.exports = settings