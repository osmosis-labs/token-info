# Token Info Pages

This repo is used to manage the content that is displayed within the token pages on [Osmosis](https://github.com/osmosis-labs/osmosis-frontend)

## Token Data

The data for Token Info Pages are managed and translated in this repository are:
- Name
- Symbol
- Description
- CoinGecko ID
- Website URL
- Twitter URL
- (Coming soon!) Liquidity Staking Token/Derivative (LST/LSD) Redemption Rate API

It is recommended to have all applicable data registered, but it is OK if some properties are not applicable.

To register or modify token data, it is recommended to create a Pull Request with the updates at the [Cosmos Chain Registry](https://github.com/cosmos/chain-registry):
- Name          -> update /{chain directory}/assetlist.json: assets[{asset}].name
- Symbol        -> update /{chain directory}/assetlist.json: assets[{asset}].symbol
- Description   -> update /{chain directory}/assetlist.json: assets[{asset}].description, and
                -> update /{chain directory}/assetlist.json: assets[{asset}].extended_description
- CoinGecko ID  -> update /{chain directory}/assetlist.json: assets[{asset}].coingecko_id
- Website URL   -> update /{chain directory}/assetlist.json: assets[{asset}].socials.website
- Twitter URL   -> update /{chain directory}/assetlist.json: assets[{asset}].socials.twitter


## Data Automation

The automation used in this repository means there is little to no manual data entry required in this repository.

- Generate English Token Files
  - To prepare for updating token info pages to the latest registered data, be sure to first pull/update the chain-registry submodule (at the root of this repo).
  - To pull [English] token data, run `node generate_tokens.mjs` from the `./.github/workflows/utility/` directory.
    - Some paths are relative, so it is important to navigate to the specified directory before running the script.
    - The .mjs script requires that Node JS be installed.
    - The list of assets is queried from the Osmosis Labs' assetlists reporitory (on GitHub).
  - The data for each asset are pulled from the Cosmos Chain Registry.
    - More specifically, in this case, from the chain_registry submodule.
- Generate Localized/Translated Token Files
  - See the 'Translations' section of the README for instruction on how to run inlang to generate translated token files.


## Translations 🌎🗺

[![translation badge](https://inlang.com/badge?url=github.com/osmosis-labs/token-info)](https://inlang.com/editor/github.com/osmosis-labs/token-info?ref=badge)

To add translations, you can manually edit the JSON translation files in `contents`, use the [inlang](https://inlang.com/) online editor, or run `pnpm machine-translate` to add missing translations using AI from Inlang.