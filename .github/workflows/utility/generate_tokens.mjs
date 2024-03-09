// Purpose:
//   to generate the files for each token is assetlists.

// Requirements:
//   we need to name the file: { toLower(asset.symbol) }_token_info_en.json
//   we need to pull: asset.name, asset.symbol, asset.description, asset.coingecko_id
//   but if the asset is a Chain's staking asset,
//     we also pull: chain.website, chain.description
//       then we combine asset.description and chain.description into a single description
//     twitterURL will be scraped from coingecko, but if it's already here, we shall not remove it.

// example output file:
// {
//   "localization": "en",
//   "name": "Akash",
//   "symbol": "AKT",
//   "description": "Akash is open-source Supercloud that lets users buy and sell computing resources securely and efficiently. Purpose-built for public utility.",
//   "websiteURL": "https://akash.network/",
//   "twitterURL": "https://twitter.com/akashnet_",
//   "coingeckoID": "akash-network"
// }



import * as fs from 'fs';
import * as path from 'path';
import * as chain_reg from './chain_registry.mjs';


const tokenFileDir = "../../../contents/tokens/";
const assetlistDir = "../../../../assetlists/osmosis-1/";
const zoneAssetsFile = "osmosis.zone_assets.json";



function readTokenFile(symbol){
  let tokenFileName = symbol.toLowerCase() + "_token_info_en.json";
  return readFile(
    tokenFileDir,
    tokenFileName
  );
}

function readFile(dir, file){
  let fileContent = {};
  try {
    fileContent = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
  } catch (err) {
    console.error('Error reading the file:', err);
  }
  return fileContent;
}

function writeTokenFile(asset){
  let assetJson = JSON.stringify(asset, null, 2);
  let tokenFileName = asset.symbol.toLowerCase() + "_token_info_en.json";
  fs.writeFile(path.join(tokenFileDir, tokenFileName), assetJson, 'utf8', (err) => {
    if (err) {
      console.error('Error writing to the file:', err);
    } else {
      console.log('File has been written successfully.');
    }
  });
}

function getTokenSymbol(asset) {

  if (asset.override_properties?.symbol) {
    return asset.override_properties.symbol;
  }

  let referencedAsset = asset.canonical || asset;

  return chain_reg.getAssetProperty(
    referencedAsset.chain_name,
    referencedAsset.base_denom,
    "symbol"
  );

}

function getTokenName(asset) {

  if (asset.override_properties?.name) {
    return asset.override_properties.name;
  }

  let referencedAsset = asset.canonical || asset;

  let isStakingToken = checkIsStakingToken(
    referencedAsset.chain_name,
    referencedAsset.base_denom
  );

  if (isStakingToken) {
    let chain_name = chain_reg.getFileProperty(
      referencedAsset.chain_name,
      "chain",
      "pretty_name"
    );
    if (chain_name) {
      return chain_name;
    }
  }

  return chain_reg.getAssetProperty(
    referencedAsset.chain_name,
    referencedAsset.base_denom,
    "name"
  );

}

function checkIsStakingToken(chain_name, base_denom) {

  const staking_denom = chain_reg.getFileProperty(
    chain_name, 
    "chain",
    "staking"
  )?.staking_tokens[0]?.denom;
  return base_denom === staking_denom;

}

function getReferencedTokenDescription(chain_name, base_denom) {

  let description = chain_reg.getAssetProperty(
    chain_name,
    base_denom,
    "description"
  );
  let extended_description = chain_reg.getAssetProperty(
    chain_name,
    base_denom,
    "extended_description"
  );
  
  if (extended_description) {
    return description + "\n\n" + extended_description;
  }

  let isStakingToken = checkIsStakingToken(
    chain_name,
    base_denom
  );

  if (isStakingToken) {
    let chain_description = chain_reg.getFileProperty(
      chain_name,
      "chain",
      "description"
    );
    if (chain_description) {
      return description + "\n\n" + chain_description;
    }
  }

  return description;

}

function getTokenDescription(asset) {

  if (asset.override_properties?.description) {
    return asset.override_properties.description;
  }

  let referencedAsset = asset.canonical || asset;

  return getReferencedTokenDescription(
    referencedAsset.chain_name,
    referencedAsset.base_denom
  );
}

function getReferencedTokenWebsite(chain_name, base_denom) {

  let tokenWebsite = chain_reg.getAssetProperty(
    chain_name,
    base_denom,
    "socials"
  )?.website;

  if (tokenWebsite) {
    return tokenWebsite;
  }

  return chain_reg.getFileProperty(
    chain_name,
    "chain",
    "website"
  );

}

function getTokenWebsite(asset) {
  if (asset.override_properties?.website) {
    return asset.override_properties.website;
  }

  let referencedAsset = asset.canonical || asset;

  return getReferencedTokenWebsite(
    referencedAsset.chain_name,
    referencedAsset.base_denom
  );

}

function getTokenTwitterURL(asset) {
  if (asset.override_properties?.twitter) {
    return asset.override_properties.twitter;
  }

  let referencedAsset = asset.canonical || asset;

  return chain_reg.getAssetProperty(
    referencedAsset.chain_name,
    referencedAsset.base_denom,
    "socials"
  )?.twitter;

}

function getTokenCoingeckoID(asset) {

  if (asset.override_properties?.coingeckoID) {
    return asset.override_properties.coingeckoID;
  }

  let referencedAsset = asset.canonical || asset;

  return chain_reg.getAssetProperty(
    referencedAsset.chain_name,
    referencedAsset.base_denom,
    "coingecko_id"
  );

}

function getTokenInfo(zone_assets) {

  zone_assets.assets.forEach((asset) => {

    let registeredTokenInfo = {};
    registeredTokenInfo.name        = getTokenName(asset);
    registeredTokenInfo.symbol      = getTokenSymbol(asset);
    registeredTokenInfo.description = getTokenDescription(asset);
    registeredTokenInfo.coingeckoID = getTokenCoingeckoID(asset);
    registeredTokenInfo.websiteURL  = getTokenWebsite(asset);
    registeredTokenInfo.twitterURL  = getTokenTwitterURL(asset);

    let recordedTokenInfo = readTokenFile(
      registeredTokenInfo.symbol
    );

    let tokenInfo = {
      localization: "en"
    };
    for (let prop in registeredTokenInfo) {
      tokenInfo[prop] = registeredTokenInfo[prop] || recordedTokenInfo[prop];
    }

    writeTokenFile(
      tokenInfo
    );

  });

}


function main(){

  const zone_assets = readFile(assetlistDir, zoneAssetsFile);
  getTokenInfo(zone_assets);

}

main()