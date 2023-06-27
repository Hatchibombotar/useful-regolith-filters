export function parse(texts) {
    let jsonTexts = {}
	for (const translation of texts.split("\n")) {
		if ([translation[0], translation[1]].includes("#")) continue
		if (translation == "") continue
		const [key, value] = translation.split("=")
		if (value == undefined) continue
		jsonTexts[key] = value
	}
	return jsonTexts
}

export function stringify(jsonTexts) {
	let texts: string[] = []
	for (const key in jsonTexts) {
		texts.push(`${key}=${jsonTexts[key]}`)
	}
	return texts.join("\n")
}