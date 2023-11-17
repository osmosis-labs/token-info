const fs = require("fs");
const { globSync } = require("glob");

const projectInlangFile = fs.readFileSync("project.inlang.json");
const projectInlang = JSON.parse(projectInlangFile);

const language = projectInlang.sourceLanguageTag;
const languages = projectInlang.languageTags.filter(
  (lang) => lang !== language
);

const tokensInfo = globSync(`contents/tokens/*_token_info_${language}.json`);
const attributesToTranslate = {};

for (const tokenInfo of tokensInfo) {
  const fileName = tokenInfo.split("/").pop().replace(".json", "");
  const fileNameChuncks = fileName.split("_");
  const denom = fileNameChuncks.shift();

  const translation = JSON.parse(fs.readFileSync(tokenInfo).toString());

  if (denom) {
    attributesToTranslate[`${denom}`] = translation;
  }
}

fs.writeFileSync(
  `localizations/en.json`,
  Buffer.from(JSON.stringify(attributesToTranslate, undefined, 2))
);

for (const lang of languages) {
  fs.rmSync(`localizations/${lang}.json`);
}
