// SPDX-License-Identifier: MIT

pragma solidity ^0.8.26;

import {ERC1155} from "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import {ERC1155Supply} from "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract TokenVerse1155 is ERC1155, ERC1155Supply, Ownable {
    // TOKEN IDS

    uint256 public constant GOLD = 1;
    uint256 public constant GEMS = 2;
    uint256 public constant DRAGON_SWORD = 3;
    uint256 public constant EVENT_TICKET = 4;
    uint256 public constant DRAGON_GLASS = 5;

    // FAUCET CONFIG

    uint256 public constant STARTER_GOLD = 10;
    uint256 public constant STARTER_GEMS = 5;
    uint256 public constant STARTER_SWORDS = 1;

    // STATE

    mapping(address => bool) public hasClaimedStarterPack;

    // ERRORS

    error NotApproved();
    error InsufficientDragonSwords();
    error TokenVerse1155__AlreadyClaimed();

    // EVENTS

    event SwordDismantled(address indexed user, uint256 dragonGlassReceived);
    event StarterPackClaimed(address indexed claimer);

    // CONSTRUCTOR
    constructor()
        ERC1155("ipfs://bafybeiddzghzwimp3nbwch6mqd4h3apqfah24hb2tbwwhdepukby6io5ni/{id}.json")
        Ownable(msg.sender)
    {}

    // MINT SINGLE
    function mint(address to, uint256 id, uint256 amount) external onlyOwner {
        _mint(to, id, amount, "");
    }

    // MINT BATCH
    function mintBatch(address to, uint256[] calldata ids, uint256[] calldata amounts) external onlyOwner {
        _mintBatch(to, ids, amounts, "");
    }

    // PUBLIC FAUCET — one starter pack per address: 10 GOLD, 5 GEMS, 1 DRAGON_SWORD
    function claimStarterPack() external {
        if (hasClaimedStarterPack[msg.sender]) revert TokenVerse1155__AlreadyClaimed();
        hasClaimedStarterPack[msg.sender] = true;

        uint256[] memory ids = new uint256[](3);
        ids[0] = GOLD;
        ids[1] = GEMS;
        ids[2] = DRAGON_SWORD;

        uint256[] memory amounts = new uint256[](3);
        amounts[0] = STARTER_GOLD;
        amounts[1] = STARTER_GEMS;
        amounts[2] = STARTER_SWORDS;

        _mintBatch(msg.sender, ids, amounts, "");

        emit StarterPackClaimed(msg.sender);
    }

    // BURN SINGLE
    function burn(address from, uint256 id, uint256 amount) external {
        if (from != msg.sender && !isApprovedForAll(from, msg.sender)) revert NotApproved();
        _burn(from, id, amount);
    }

    // BURN BATCH
    function burnBatch(address from, uint256[] calldata ids, uint256[] calldata amounts) external {
        if (from != msg.sender && !isApprovedForAll(from, msg.sender)) revert NotApproved();
        _burnBatch(from, ids, amounts);
    }

    // DRAGON SWORD DISMANTLE MECHANISM
    // Burn 1 sword -> Receive 100 dragon glass

    function dismantleDragonSword() external {
        if (balanceOf(msg.sender, DRAGON_SWORD) < 1) revert InsufficientDragonSwords();

        // burn 1 sword
        _burn(msg.sender, DRAGON_SWORD, 1);

        // Mint 100 dragon glass
        _mint(msg.sender, DRAGON_GLASS, 100, "");

        emit SwordDismantled(msg.sender, 100);
    }

    // update function
    function _update(address from, address to, uint256[] memory ids, uint256[] memory values)
        internal
        override(ERC1155, ERC1155Supply)
    {
        super._update(from, to, ids, values);
    }
}
