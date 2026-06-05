// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC20Burnable} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract TokenVerseGold is ERC20, ERC20Burnable, Ownable {
    // FAUCET CONFIG

    uint256 public constant FAUCET_AMOUNT = 1000 * 10 ** 18;

    // STATE

    mapping(address => bool) public hasClaimed;

    // ERRORS

    error TokenVerseGold__AlreadyClaimed();

    // EVENTS
    event FaucetClaimed(address indexed claimer, uint256 amount);

    // CONSTRUCTOR

    constructor() ERC20("TokenVerse Gold", "TVG") Ownable(msg.sender) {}

    // OWNER MINT

    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    // PUBLIC FAUCET — one claim per address, unlimited wallets

    function faucet() external {
        if (hasClaimed[msg.sender]) revert TokenVerseGold__AlreadyClaimed();

        hasClaimed[msg.sender] = true;

        _mint(msg.sender, FAUCET_AMOUNT);

        emit FaucetClaimed(msg.sender, FAUCET_AMOUNT);
    }
}
