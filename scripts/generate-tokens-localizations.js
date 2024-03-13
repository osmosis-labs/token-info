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
  const denom = fileName.split("_").shift(); // Extracting the first part as denomination

  const defaultValues = JSON.parse(fs.readFileSync(tokenInfo).toString());

  for (const lang of languages) {
    const translations = JSON.parse(fs.readFileSync(`localizations/${lang}.json`).toString());
    const translation = translations[`${denom}`];

    const tokenData = updateObject(defaultValues, translation);

    fs.writeFileSync(`contents/tokens/${denom}_token_info_${lang}.json`, Buffer.from(JSON.stringify(tokenData, undefined, 2)));
  }
}

function updateObject(defaultValues, translation) {
  // Helper function to recursively update object properties
  function update(obj, translation) {
    for (const key in obj) {
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        // If the property is an object, recursively update it
        if (translation && key in translation) {
          obj[key] = update(obj[key], translation[key]);
        }
      } else {
        // If the property is not an object, update it with translation if available
        if (translation && key in translation) {
          obj[key] = translation[key];
        }
      }
    }
    return obj;
  }

  // Call the helper function to update the defaultValues object
  return update(defaultValues, translation);
}