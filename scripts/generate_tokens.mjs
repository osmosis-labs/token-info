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

// -- THE PLAN --
//
//  iterate through the list of assets in assetlist (read directory should be a global var)
//  for each asset,
//    create an object, with properties for the file name and for the expected properties,
//    compose the output file name ({ toLower(asset.symbol) }_token_info_en.json)
//    see if the output file already exists, if so, pull the current property values into the object
//    for each property,
//      try to pull the value from the assetlist asset object and overwrite the current values
//  serialize the object into JSON
//  write JSON to file (file name is known, output directory should be a global var)
//


import * as fs from 'fs';
import * as path from 'path';


const tokenFileDir = "../contents/tokens/";
const assetlistDir = "../../assetlists/osmosis-1/";
const assetlistAssetFile = "osmosis-1.assetlist.json";
const assetlistChainFile = "osmosis-1.chainlist.json";

let assetlist = [];
let chainlist = [];
const chainlistMap = new Map();


function readTokenFile(symbol){
  let tokenFileName = symbol.toLowerCase() + "_token_info_en.json";
  let tokenFileObject = {};
  try {
    tokenFileObject = JSON.parse(fs.readFileSync(path.join(tokenFileDir, tokenFileName), 'utf8'));
  } catch (err) {
    //console.error('Error reading the file:', err);
  }
  return tokenFileObject;
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

function readAssetlist(){
  try {
    assetlist = JSON.parse(fs.readFileSync(path.join(assetlistDir, assetlistAssetFile), 'utf8')).assets;
  } catch (err) {
    console.error('Error reading the file:', err);
  }
  try {
    chainlist = JSON.parse(fs.readFileSync(path.join(assetlistDir, assetlistChainFile), 'utf8')).chains;
  } catch (err) {
    console.error('Error reading the file:', err);
  }
  indexChainlist(chainlist);
}

function indexChainlist(chainlistArray){
  chainlistArray.forEach((chain) => {
    chainlistMap.set(chain.chain_name,chain)
  });
}

function createTokenObjects(){
  assetlist.forEach((asset) => {
    let tokenObject = {};
    tokenObject = readTokenFile(asset.symbol);
    tokenObject.localization = "en";
    tokenObject.name = asset.name;
    tokenObject.symbol = asset.symbol;
    let description = asset.description;
    //now to find out if it's a staking asset
    //need to find out if it's an osmosis object
    let base_denom;
    let chain_name;
    if(asset.traces?.length > 0){
      //then it's not an osmosis asset
      //need to look at latest trace's counterparty
      chain_name = asset.traces[asset.traces.length - 1].counterparty.chain_name;
      base_denom = asset.traces[asset.traces.length - 1].counterparty.base_denom;
    } else {
      chain_name = "osmosis";
      base_denom = asset.base;
    }
    //then need to see if it's first staking token
    let staking_denom = chainlistMap.get(chain_name).staking?.staking_tokens[0]?.denom;
    if(staking_denom == base_denom) {
      //it is a staking token, so we pull the chain_description
      if(chainlistMap.get(chain_name).description) {
        description = description + "\n\n" + chainlistMap.get(chain_name).description;
      }
    }
    tokenObject.description = description;
    tokenObject.websiteURL = chainlistMap.get(chain_name).website;
    tokenObject.coingeckoID = asset.coingecko_id;

    writeTokenFile(tokenObject);
  });
}


function main(){
  readAssetlist();
  createTokenObjects();
}

main()