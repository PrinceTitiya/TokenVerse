// SPDX-License-Identifier: MIT

pragma solidity ^0.8.26;

import {Test, console} from "forge-std/Test.sol";
import {TokenVerse1155} from "src/ERC1155/TokenVerse1155.sol";

contract TokenVerse1155Test is Test {
    TokenVerse1155 internal token;

    address internal owner = address(this);
    address internal user1 = makeAddr("user1");
    address internal user2 = makeAddr("user2");

    // ========================================
    // SETUP
    // ========================================

    function setUp() public {
        token = new TokenVerse1155();
    }

    // TEST: SINGLE MINT
    function testMintGold() public {
        token.mint(user1, token.GOLD(), 1000);

        uint256 balance = token.balanceOf(user1, token.GOLD());
        assertEq(balance, 1000);
    }

    // TEST: BATCH MINT
    function testBatchMint() public {
        uint256[] memory ids = new uint256[](3);
        uint256[] memory amounts = new uint256[](3);

        ids[0] = token.GOLD();
        ids[1] = token.GEMS();
        ids[2] = token.EVENT_TICKET();

        amounts[0] = 1000;
        amounts[1] = 500;
        amounts[2] = 10;

        token.mintBatch(user1, ids, amounts);

        uint256 goldBalance = token.balanceOf(user1, token.GOLD());
        uint256 gemBalance = token.balanceOf(user1, token.GEMS());
        uint256 ticketBalance = token.balanceOf(user1, token.EVENT_TICKET());

        assertEq(goldBalance, amounts[0]);
        assertEq(gemBalance, amounts[1]);
        assertEq(ticketBalance, amounts[2]);
    }

    // TEST: BURN SINGLE

    function testBurnGold() public {
        uint256 gold = token.GOLD();

        token.mint(user1, gold, 1000);
        console.log("Before burn:", token.balanceOf(user1, gold));

        vm.prank(user1);
        token.burn(user1, gold, 300);

        console.log("After burn:", token.balanceOf(user1, gold));

        assertEq(token.balanceOf(user1, gold), 700);
    }

    // TEST: DRAGON SWORD DISMANTLE

    function testDismantleDragonSword() public {
        // Mint sword
        token.mint(user1, token.DRAGON_SWORD(), 1);
        console.log(
            "Minted sword:",
            token.balanceOf(user1, token.DRAGON_SWORD())
        );

        uint256 dragon_sword = token.DRAGON_SWORD();
        uint256 dragon_glass = token.DRAGON_GLASS();

        vm.prank(user1);
        token.dismantleDragonSword();

        uint256 swordBalance = token.balanceOf(user1, dragon_sword);
        uint256 glassBalance = token.balanceOf(user1, dragon_glass);

        console.log("Sword balance:", swordBalance);
        console.log("Glass balance:", glassBalance);

        assertEq(swordBalance, 0);
        assertEq(glassBalance, 100);
    }

    function testCannotDismantleWithoutSword() public {
        vm.prank(user1);
        vm.expectRevert(TokenVerse1155.InsufficientDragonSwords.selector);
        token.dismantleDragonSword();
    }

    // TEST: TRANSFER
    function testTransferGold() public {
        uint256 tokenGold = token.GOLD();

        token.mint(user1, tokenGold, 1000);

        vm.prank(user1);
        token.safeTransferFrom(user1, user2, tokenGold, 250, "");

        assertEq(token.balanceOf(user1, tokenGold), 750);
        assertEq(token.balanceOf(user2, tokenGold), 250);
    }

    // TEST: TOTAL SUPPLY
    function testTotalSupply() public {
        token.mint(user1, token.GEMS(), 50);

        uint256 totalSupply = token.totalSupply(token.GEMS());
        assertEq(totalSupply, 50);
    }

    // TEST: URI template contains {id} placeholder and correct IPFS CID
    function testUriContainsIdPlaceholder() public view {
        string
            memory expected = "ipfs://bafybeiddzghzwimp3nbwch6mqd4h3apqfah24hb2tbwwhdepukby6io5ni/{id}.json";

        // uri() returns the same template for every id — {id} substitution is done client-side per ERC1155 spec
        assertEq(token.uri(token.GOLD()), expected);
        assertEq(token.uri(token.GEMS()), expected);
        assertEq(token.uri(token.DRAGON_SWORD()), expected);
        assertEq(token.uri(token.EVENT_TICKET()), expected);
        assertEq(token.uri(token.DRAGON_GLASS()), expected);
    }
}
