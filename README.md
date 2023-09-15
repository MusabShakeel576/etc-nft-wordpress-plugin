<h1 align="center"><img align="center" height="30" src="assets/nftgate.png"> NFTGate</h1>

WordPress plugin to onboard web2 users through email login and credit card payment checkout for ETC (lingouni) NFT.

## Getting Started

[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/MusabShakeel576/etc-nft-wordpress-plugin?quickstart=1)

1. Update variables:
    - `ALCHEMY_API_KEY` in nftgate.php file.
    - `contracts` with smart contract addresses in nftgate.php file.
    - `environment` with either staging or production depending on testnet or mainnet respectively in public/js/nftgate-public.js file.
    - `collectionId`, `projectId`, and `totalPrice` from [Crossmint](https://crossmint.com) and smart contract in public/js/nftgate-public.js file.
1. Create a `.zip` file of NFTGate WordPress plugin.
    ```shell
    zip -r nftgate.zip . -x '*.git*'
    ```
1. Intall .zip file in your WordPress website.
1. Add `class="nftgate-open-modal"` and `data-nftgate-id="0"`[^1] to each button on your website.
1. Optional, if you want to open modal through redirect, add `nftgate-id=0`[^1] parameter to the URL.

[^1]: data-nftgate-id or nftgate-id can be 0, 1, or 2 depending on NFT type you want to mint which are Value, Gold, and Platinum.