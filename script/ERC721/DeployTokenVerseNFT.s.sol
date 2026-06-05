// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Script, console} from "forge-std/Script.sol";
import {TokenVerseNFT} from "../../src/ERC721/TokenVerseNFT.sol";

contract DeployTokenVerseNFT is Script {
    function run() external returns (TokenVerseNFT) {
        vm.startBroadcast();

        TokenVerseNFT nft = new TokenVerseNFT();

        console.log("TokenVerseNFT deployed at:", address(nft));
        console.log("Owner               :", nft.owner());
        console.log("Name                :", nft.name());
        console.log("Symbol              :", nft.symbol());
        console.log("NFT types           :", nft.NFT_TYPES());

        vm.stopBroadcast();

        return nft;
    }
}
