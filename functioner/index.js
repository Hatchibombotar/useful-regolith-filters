const fs = require("fs")
const glob = require("glob")

// Extract Functions
fs.mkdirSync("BP/functions/functioner/extracted", {"recursive": true})
let currentFileNum = 0
for (const filePath of glob.sync("BP/**/*.mcfunction")) {
    const fileContent = fs.readFileSync(filePath).toString()
    const fileContentArray = fileContent.replace(/\r/g, "").replace(/^(\t| )*/gm, "").split("\n")
    const newFile = []
    
    // the path to the current push location. e.g. [0, 1] -> newFile[0][1]
    const currentLocPath = []

    // For each line in the function
    for (const line of fileContentArray) {

        let currentLoc = newFile
        for (let i of currentLocPath) {
            currentLoc = currentLoc[i];
        }
        
        if (line[line.length - 1] == "{") {
            // if line ends with a bracket, push the current line,
            // and a new array for items inside this bracket
            currentLoc.push(line)
            currentLoc.push([])

            currentLocPath.push(currentLoc.length - 1)
        } else if (line[0] == "}") {
            // if line closes the bracket, remove move the current location back 1 level.
            currentLocPath.pop()
        } else {
            // otherwise, push the array
            currentLoc.push(line)
        }
    }

    const splitFileArray = [newFile]

    let editsMade = true
    // until an itteration doesn't make a change
    while (editsMade) {
        editsMade = false
        for (const currentFile of splitFileArray) {
            for (const lineNum in currentFile) {
                line = currentFile[lineNum]
                // if it finds a line with an object
                if (typeof line == "object") {
                    // set the change the last line to call a function
                    currentFile[lineNum - 1] = currentFile[lineNum - 1].substring(currentFile[lineNum - 1].length - 1, 0) + `function functioner/extracted/${currentFileNum}-${splitFileArray.length - 1}`
                    // remove current line from the array
                    currentFile.splice(lineNum, 1)
                    // and add it to the array seperately
                    splitFileArray.push(line)
                    editsMade = true
                    break
                }
            }
        }
    }

    fs.writeFileSync(filePath, splitFileArray[0].join("\n"))
    splitFileArray.splice(0, 1)

    for (const funcIndex in splitFileArray) {
        const funcContent = splitFileArray[funcIndex]
        fs.writeFileSync(`BP/functions/functioner/extracted/${currentFileNum}-${funcIndex}.mcfunction`, funcContent.join("\n"))
    }

    currentFileNum += 1
}