// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {TokenVerse1155} from "../src/ERC1155/TokenVerse1155.sol";

contract DeployTokenVerse1155 is Script {
    function run() external returns (TokenVerse1155) {
        vm.startBroadcast();

        TokenVerse1155 tokenVerse = new TokenVerse1155();

        console.log("TokenVerse1155 deployed at:", address(tokenVerse));
        console.log("Owner:", tokenVerse.owner());

        vm.stopBroadcast();

        return tokenVerse;
    }
}
