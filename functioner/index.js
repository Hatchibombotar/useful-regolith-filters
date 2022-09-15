const fs = require("fs")
const glob = require("glob")
const path = require("path")

const settings = JSON.parse(process.argv[2] ?? "{}")
const searchPattern = settings.searchPattern ?? "BP/**/*.mcfunction"

// Extract Functions
for (const filePath of glob.sync(searchPattern)) {
    const childFunctionPath = `functioner/${path.dirname(filePath)}`
    const fileContent = fs.readFileSync(filePath).toString().replace(/\r/g, "").split("\n")
    const newFile = []
    
    // the path to the current push location. e.g. [0, 1] -> newFile[0][1]
    const currentPushLoc = []

    // For each line in the function
    for (const line of fileContent) {
        // skip if function includes a comment
        if (line.trim()[0] == "#") continue
        
        let currentLoc = newFile
        for (const i of currentPushLoc) {
            currentLoc = currentLoc[i]
        }
        
        if (line.trim()[line.trim().length - 1] == "{") {
            // if line ends with a bracket, push the current line,
            // and a new array for items inside this bracket
            currentLoc.push(line.trim().substring(0, line.trim().length - 1))
            currentLoc.push([])

            currentPushLoc.push(currentLoc.length - 1)
        } else if (line.trim()[0] == "}") {
            // if line closes the bracket, remove move the current location back 1 level.
            currentPushLoc.pop()
        } else {
            // otherwise, push the array
            currentLoc.push(line.trim())
        }
    }

    const functionFamily = [newFile]

    // split the parsed function into seperate files
    let editsMade = true
    while (editsMade) {
        editsMade = false
        for (const childFunction of functionFamily) {
            for (const [lineNum, line] of childFunction.entries()) {
                // if it finds children not seperated
                if (typeof line == "object") {
                    // change the previous line to call a function
                    childFunction[lineNum - 1] = childFunction[lineNum - 1] + `function ${childFunctionPath}/${path.basename(filePath, ".mcfunction")}-${functionFamily.length - 1}`
                    // remove current line from the childFunction and add it back seperately as a seperate child
                    functionFamily.push(childFunction.splice(lineNum, 1)[0])
                    editsMade = true
                    break
                }
            }
        }
    }

    // save and remove the parent function from the array
    fs.writeFileSync(filePath, functionFamily.splice(0, 1)[0].join("\n"))

    // create the directory for function's children if there are any
    if (functionFamily.length) {
        fs.mkdirSync(`BP/functions/${childFunctionPath}`, {recursive: true})
    }

    for (const [funcIndex, funcContent] of functionFamily.entries()) {
        fs.writeFileSync(`BP/functions/${childFunctionPath}/${path.basename(filePath, ".mcfunction")}-${funcIndex}.mcfunction`, funcContent.join("\n"))
    }
}