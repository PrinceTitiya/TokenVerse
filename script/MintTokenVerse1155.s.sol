// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Script, console} from "forge-std/Script.sol";
import {TokenVerse1155} from "../src/ERC1155/TokenVerse1155.sol";

contract MintTokenVerse1155 is Script {
    function run() external {
        uint256 ownerPrivateKey = vm.envUint("LOCAL_PRIVATE_KEY");
        address owner = vm.addr(ownerPrivateKey);

        TokenVerse1155 tokenVerse = TokenVerse1155(vm.envAddress("CONTRACT_ADDRESS"));

        uint256[] memory ids = new uint256[](2);
        ids[0] = tokenVerse.GOLD();
        ids[1] = tokenVerse.GEMS();

        uint256[] memory amounts = new uint256[](2);
        amounts[0] = 100;
        amounts[1] = 10;

        vm.startBroadcast(ownerPrivateKey);
        tokenVerse.mintBatch(owner, ids, amounts);
        vm.stopBroadcast();

        console.log("Owner / recipient:", owner);
        console.log("  GOLD  (id=1):", amounts[0]);
        console.log("  GEMS  (id=2):", amounts[1]);
    }
}
