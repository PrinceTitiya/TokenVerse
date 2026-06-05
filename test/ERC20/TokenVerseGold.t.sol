// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Test, console} from "forge-std/Test.sol";
import {TokenVerseGold} from "src/ERC20/TokenVerseGold.sol";

contract TokenVerseGoldTest is Test {
    TokenVerseGold internal token;

    address internal owner = address(this);
    address internal user1 = makeAddr("user1");
    address internal user2 = makeAddr("user2");
    address internal spender = makeAddr("spender");

    uint256 internal constant FAUCET_AMOUNT = 1000 * 10 ** 18;

    // ========================================
    // SETUP
    // ========================================

    function setUp() public {
        token = new TokenVerseGold();
    }

    // ========================================
    // MINT (onlyOwner)
    // ========================================

    function testOwnerMint() public {
        token.mint(user1, 5000 * 10 ** 18);
        assertEq(token.balanceOf(user1), 5000 * 10 ** 18);
    }

    function testNonOwnerCannotMint() public {
        vm.prank(user1);
        vm.expectRevert();
        token.mint(user1, 1000 * 10 ** 18);
    }

    // ========================================
    // FAUCET
    // ========================================

    function testFaucetClaim() public {
        vm.prank(user1);
        token.faucet();

        assertEq(token.balanceOf(user1), FAUCET_AMOUNT);
        assertEq(token.hasClaimed(user1), true);
    }

    function testFaucetEmitsEvent() public {
        vm.expectEmit(true, false, false, true);
        emit TokenVerseGold.FaucetClaimed(user1, FAUCET_AMOUNT);

        vm.prank(user1);
        token.faucet();
    }

    function testFaucetDoubleClaim() public {
        vm.startPrank(user1);
        token.faucet();

        vm.expectRevert(TokenVerseGold.TokenVerseGold__AlreadyClaimed.selector);
        token.faucet();
        vm.stopPrank();
    }

    // ========================================
    // TRANSFER
    // ========================================

    function testTransfer() public {
        token.mint(user1, 2000 * 10 ** 18);

        vm.prank(user1);
        token.transfer(user2, 500 * 10 ** 18);

        assertEq(token.balanceOf(user1), 1500 * 10 ** 18);
        assertEq(token.balanceOf(user2), 500 * 10 ** 18);
    }

    // ========================================
    // APPROVE + TRANSFER FROM
    // ========================================

    function testApproveAndTransferFrom() public {
        token.mint(user1, 2000 * 10 ** 18);

        // user1 approves spender for 800 TVG
        vm.prank(user1);
        token.approve(spender, 800 * 10 ** 18);

        assertEq(token.allowance(user1, spender), 800 * 10 ** 18);

        // spender pulls 500 TVG from user1 to user2
        vm.prank(spender);
        token.transferFrom(user1, user2, 500 * 10 ** 18);

        assertEq(token.balanceOf(user1), 1500 * 10 ** 18);
        assertEq(token.balanceOf(user2), 500 * 10 ** 18);
        assertEq(token.allowance(user1, spender), 300 * 10 ** 18);
    }

    function testTransferFromExceedingAllowanceReverts() public {
        token.mint(user1, 2000 * 10 ** 18);

        vm.prank(user1);
        token.approve(spender, 200 * 10 ** 18);

        vm.prank(spender);
        vm.expectRevert();
        token.transferFrom(user1, user2, 500 * 10 ** 18);
    }

    // ========================================
    // BURN
    // ========================================

    function testBurn() public {
        token.mint(user1, 1000 * 10 ** 18);

        vm.prank(user1);
        token.burn(400 * 10 ** 18);

        assertEq(token.balanceOf(user1), 600 * 10 ** 18);
        assertEq(token.totalSupply(), 600 * 10 ** 18);
    }

    function testBurnFrom() public {
        token.mint(user1, 1000 * 10 ** 18);

        vm.prank(user1);
        token.approve(spender, 300 * 10 ** 18);

        vm.prank(spender);
        token.burnFrom(user1, 300 * 10 ** 18);

        assertEq(token.balanceOf(user1), 700 * 10 ** 18);
        assertEq(token.allowance(user1, spender), 0);
    }

    // ========================================
    // METADATA
    // ========================================

    function testNameAndSymbol() public view {
        assertEq(token.name(), "TokenVerse Gold");
        assertEq(token.symbol(), "TVG");
        assertEq(token.decimals(), 18);
    }
}
