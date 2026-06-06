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
        // On a fork, makeAddr() addresses may already have code deployed on the
        // target network. ERC-1155 safe-transfer hooks call onERC1155Received on
        // any recipient that has code, so we wipe those slots to force EOA behaviour.
        vm.etch(user1, "");
        vm.etch(user2, "");
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
        // user1 claims starter pack — receives a unique sword at ID 1000
        vm.prank(user1);
        token.claimStarterPack();

        uint256 swordId = token.swordIdOf(user1);
        assertEq(swordId, token.DRAGON_SWORD_BASE());
        console.log("Sword ID:", swordId);
        console.log("Sword balance:", token.balanceOf(user1, swordId));

        uint256 dragon_glass = token.DRAGON_GLASS();

        vm.prank(user1);
        token.dismantleDragonSword(swordId);

        console.log("Sword balance after:", token.balanceOf(user1, swordId));
        console.log("Glass balance:", token.balanceOf(user1, dragon_glass));

        assertEq(token.balanceOf(user1, swordId), 0);
        assertEq(token.balanceOf(user1, dragon_glass), 100);
    }

    function testCannotDismantleWithoutSword() public {
        // user1 has no sword — balance at any sword ID is 0
        uint256 swordBase = token.DRAGON_SWORD_BASE();
        vm.prank(user1);
        vm.expectRevert(TokenVerse1155.InsufficientDragonSwords.selector);
        token.dismantleDragonSword(swordBase);
    }

    function testCannotDismantleNonSwordId() public {
        // IDs below DRAGON_SWORD_BASE are not swords
        uint256 goldId = token.GOLD();
        vm.prank(user1);
        vm.expectRevert(TokenVerse1155.NotASword.selector);
        token.dismantleDragonSword(goldId);
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

    // TEST: STARTER PACK CLAIM

    function testClaimStarterPack() public {
        vm.prank(user1);
        token.claimStarterPack();

        assertEq(token.balanceOf(user1, token.GOLD()), token.STARTER_GOLD());
        assertEq(token.balanceOf(user1, token.GEMS()), token.STARTER_GEMS());

        // Dragon Sword gets the first unique ID (DRAGON_SWORD_BASE)
        uint256 swordId = token.swordIdOf(user1);
        assertEq(swordId, token.DRAGON_SWORD_BASE());
        assertEq(token.balanceOf(user1, swordId), 1);
        assertTrue(token.hasClaimedStarterPack(user1));
    }

    function testCannotClaimStarterPackTwice() public {
        vm.prank(user1);
        token.claimStarterPack();

        vm.prank(user1);
        vm.expectRevert(TokenVerse1155.TokenVerse1155__AlreadyClaimed.selector);
        token.claimStarterPack();
    }

    function testStarterPackEnablesDismantleDragonSword() public {
        vm.startPrank(user1);
        token.claimStarterPack();
        uint256 swordId = token.swordIdOf(user1);
        token.dismantleDragonSword(swordId);
        vm.stopPrank();

        assertEq(token.balanceOf(user1, swordId), 0);
        assertEq(token.balanceOf(user1, token.DRAGON_GLASS()), 100);
    }

    function testDifferentUsersGetUniqueSwrodIds() public {
        vm.prank(user1);
        token.claimStarterPack();

        vm.prank(user2);
        token.claimStarterPack();

        assertEq(token.balanceOf(user1, token.GOLD()), token.STARTER_GOLD());
        assertEq(token.balanceOf(user2, token.GOLD()), token.STARTER_GOLD());

        uint256 sword1 = token.swordIdOf(user1);
        uint256 sword2 = token.swordIdOf(user2);
        assertTrue(sword1 != sword2);
        assertEq(token.balanceOf(user1, sword1), 1);
        assertEq(token.balanceOf(user2, sword2), 1);
    }

    // TEST: OWNER SWORD GIFT (mintSwordFor)

    function testOwnerCanGiftSwordToUnclaimed() public {
        token.mintSwordFor(user1);

        uint256 swordId = token.swordIdOf(user1);
        assertEq(swordId, token.DRAGON_SWORD_BASE());
        assertEq(token.balanceOf(user1, swordId), 1);
    }

    function testGiftedSwordIsDismantleable() public {
        token.mintSwordFor(user1);
        uint256 swordId = token.swordIdOf(user1);

        vm.prank(user1);
        token.dismantleDragonSword(swordId);

        assertEq(token.balanceOf(user1, swordId), 0);
        assertEq(token.balanceOf(user1, token.DRAGON_GLASS()), 100);
    }

    function testCannotGiftSwordToStarterPackHolder() public {
        vm.prank(user1);
        token.claimStarterPack();

        vm.expectRevert(TokenVerse1155.TokenVerse1155__AlreadyClaimed.selector);
        token.mintSwordFor(user1);
    }

    function testCannotGiftSwordIfAlreadyHoldsOne() public {
        token.mintSwordFor(user1);

        vm.expectRevert(TokenVerse1155.AlreadyHasSword.selector);
        token.mintSwordFor(user1);
    }

    function testOnlyOwnerCanCallMintSwordFor() public {
        vm.prank(user1);
        vm.expectRevert();
        token.mintSwordFor(user2);
    }

    // TEST: URI template contains {id} placeholder and correct IPFS CID
    function testUriContainsIdPlaceholder() public view {
        string memory expected = "ipfs://bafybeiddzghzwimp3nbwch6mqd4h3apqfah24hb2tbwwhdepukby6io5ni/{id}.json";

        // uri() returns the same template for every id — {id} substitution is done client-side per ERC1155 spec
        assertEq(token.uri(token.GOLD()), expected);
        assertEq(token.uri(token.GEMS()), expected);
        assertEq(token.uri(token.DRAGON_SWORD_BASE()), expected);
        assertEq(token.uri(token.EVENT_TICKET()), expected);
        assertEq(token.uri(token.DRAGON_GLASS()), expected);
    }
}
