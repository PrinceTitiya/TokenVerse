// SPDX-License-Identifier: MIT

pragma solidity ^0.8.26;

import {ERC1155} from "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import {ERC1155Supply} from "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract TokenVerse1155 is ERC1155, ERC1155Supply, Ownable {
    // TOKEN IDS

    uint256 public constant GOLD = 1;
    uint256 public constant GEMS = 2;
    // Dragon Swords occupy IDs 1000+ — each holder gets a unique token ID (NFT-like within ERC-1155)
    uint256 public constant DRAGON_SWORD_BASE = 1000;
    uint256 public constant EVENT_TICKET = 4;
    uint256 public constant DRAGON_GLASS = 5;

    // FAUCET CONFIG

    uint256 public constant STARTER_GOLD = 100;
    uint256 public constant STARTER_GEMS = 10;

    // STATE

    mapping(address => bool) public hasClaimedStarterPack;
    uint256 public nextSwordId = DRAGON_SWORD_BASE;
    mapping(address => uint256) public swordIdOf; // 0 = no sword assigned

    // ERRORS

    error NotApproved();
    error NotASword();
    error AlreadyHasSword();
    error InsufficientDragonSwords();
    error TokenVerse1155__AlreadyClaimed();

    // EVENTS

    event TokenVerse1155__SwordDismantled(address indexed user, uint256 dragonGlassReceived);
    event TokenVerse1155__StarterPackClaimed(address indexed claimer);

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

    // PUBLIC FAUCET — one starter pack per address: 10 GOLD, 5 GEMS, 1 unique DRAGON_SWORD
    function claimStarterPack() external {
        if (hasClaimedStarterPack[msg.sender]) {
            revert TokenVerse1155__AlreadyClaimed();
        }
        hasClaimedStarterPack[msg.sender] = true;

        uint256[] memory ids = new uint256[](2);
        ids[0] = GOLD;
        ids[1] = GEMS;

        uint256[] memory amounts = new uint256[](2);
        amounts[0] = STARTER_GOLD;
        amounts[1] = STARTER_GEMS;

        _mintBatch(msg.sender, ids, amounts, "");

        uint256 swordId = nextSwordId++;
        swordIdOf[msg.sender] = swordId;
        _mint(msg.sender, swordId, 1, "");

        emit StarterPackClaimed(msg.sender);
    }

    // OWNER SWORD GIFT — mint a unique sword for a wallet that hasn't claimed or currently holds one
    function mintSwordFor(address to) external onlyOwner {
        if (hasClaimedStarterPack[to]) revert TokenVerse1155__AlreadyClaimed();
        if (swordIdOf[to] != 0 && balanceOf(to, swordIdOf[to]) > 0) {
            revert AlreadyHasSword();
        }
        uint256 swordId = nextSwordId++;
        swordIdOf[to] = swordId;
        _mint(to, swordId, 1, "");
    }

    // BURN SINGLE
    function burn(address from, uint256 id, uint256 amount) external {
        if (from != msg.sender && !isApprovedForAll(from, msg.sender)) {
            revert NotApproved();
        }
        _burn(from, id, amount);
    }

    // BURN BATCH
    function burnBatch(address from, uint256[] calldata ids, uint256[] calldata amounts) external {
        if (from != msg.sender && !isApprovedForAll(from, msg.sender)) {
            revert NotApproved();
        }
        _burnBatch(from, ids, amounts);
    }

    // DRAGON SWORD DISMANTLE MECHANISM
    // Burn 1 unique sword (identified by its token ID) → Receive 100 dragon glass
    function dismantleDragonSword(uint256 swordId) external {
        if (!isSword(swordId)) revert NotASword();
        if (balanceOf(msg.sender, swordId) < 1) {
            revert InsufficientDragonSwords();
        }
        _burn(msg.sender, swordId, 1);
        _mint(msg.sender, DRAGON_GLASS, 100, "");
        emit SwordDismantled(msg.sender, 100);
    }

    // Returns true if `id` is in the Dragon Sword ID range
    function isSword(uint256 id) public pure returns (bool) {
        return id >= DRAGON_SWORD_BASE;
    }

    // _update override to resolve diamond inheritance between ERC1155 and ERC1155Supply
    function _update(address from, address to, uint256[] memory ids, uint256[] memory values)
        internal
        override(ERC1155, ERC1155Supply)
    {
        super._update(from, to, ids, values);
    }
}
