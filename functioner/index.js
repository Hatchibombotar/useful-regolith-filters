const fs = require("fs")
const glob = require("glob");

if (!fs.existsSync("./ext/")) {
    fs.mkdirSync("./ext/");
}

let funcCount = 0
glob("BP/functions/**/*.mcfunction", null, function (err, files) {
    for (file of files) {
        const fileContent = fs.readFileSync(file).toString()
        const newFileContent = fileContent.replace(/\{[^\][]*}/gm, function (x) {
            funcCount += 1
            const newFuncContent = x.slice(1, -1).replace(/^ +/gm, "")
            console.log(newFuncContent)
            fs.writeFileSync(`BP/functions/functioner/extracted/output${funcCount}.mcfunction`, newFuncContent)
            return `function functioner/extracted/output${funcCount}`;
        });
        fs.writeFileSync(file, newFileContent)
    }
})