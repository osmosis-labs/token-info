const fs = require("fs");
const { globSync } = require("glob");

const projectInlangFile = fs.readFileSync("project.inlang.json");
const projectInlang = JSON.parse(projectInlangFile);

const language = projectInlang.sourceLanguageTag;
const languages = projectInlang.languageTags.filter(
  (lang) => lang !== language
);

const tokensInfo = globSync(`contents/tokens/*_token_info_${language}.json`);

for (const tokenInfo of tokensInfo) {
  const fileName = tokenInfo.split("/").pop().replace(".json", "");
  const fileNameChuncks = fileName.split("_");
  const denom = fileNameChuncks.shift();

  const defaultValues = JSON.parse(fs.readFileSync(tokenInfo).toString());

  for (const lang of languages) {
    const translations = JSON.parse(fs.readFileSync(`localizations/${lang}.json`).toString());
    const translation = translations[`${denom}`];

    const tokenData = {
        ...defaultValues,
        description: translation?.description,
        localization: translation?.localization,
    }

    fs.writeFileSync(`contents/tokens/${denom}_token_info_${lang}.json`, Buffer.from(JSON.stringify(tokenData, undefined, 2)))
  }
}

