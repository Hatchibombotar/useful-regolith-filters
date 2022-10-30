function parse(texts) {
    let jsonTexts = {}
	for (const translation of texts.split("\n")) {
		if ([translation[0], translation[1]].includes("#")) continue
		if (translation == "") continue
		const [key, value] = translation.split("=")
		jsonTexts[key] = value
	}
	return jsonTexts
}

function stringify(jsonTexts) {
	let texts = []
	for (const key in jsonTexts) {
		texts.push(`${key}=${jsonTexts[key]}`)
	}
	return texts.join("\n")
}

module.exports = {
    parse,
    stringify
}