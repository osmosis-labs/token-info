const fs = require("fs")
const {
    globSync,
  } = require('glob')

const projectInlangFile = fs.readFileSync('project.inlang.json')
const projectInlang = JSON.parse(projectInlangFile)

const language = projectInlang.sourceLanguageTag;

const tokensInfo = globSync(`contents/tokens/*_token_info_${language}.json`)
const pathPattern = {}

for (const tokenInfo of tokensInfo) {
    const fileName = tokenInfo.split("/").pop().replace(".json", "")
    const fileNameChuncks = fileName.split("_")
    const denom = fileNameChuncks.shift()

    if (denom) {
        pathPattern[denom] = `contents/tokens/${denom}_token_info_{languageTag}.json`
    }
}

projectInlang["plugin.inlang.json"].pathPattern = pathPattern

fs.writeFileSync('project.inlang.json', Buffer.from(JSON.stringify(projectInlang, undefined, 2)))