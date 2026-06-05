// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Script, console} from "forge-std/Script.sol";
import {TokenVerseGold} from "../../src/ERC20/TokenVerseGold.sol";

contract DeployTokenVerseGold is Script {
    function run() external returns (TokenVerseGold) {
        vm.startBroadcast();

        TokenVerseGold token = new TokenVerseGold();

        console.log("TokenVerseGold deployed at:", address(token));
        console.log("Owner:", token.owner());
        console.log("Faucet amount:", token.FAUCET_AMOUNT());

        vm.stopBroadcast();

        return token;
    }
}
