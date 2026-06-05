// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Test, console} from "forge-std/Test.sol";
import {TokenVerseNFT} from "src/ERC721/TokenVerseNFT.sol";
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {IERC721Enumerable} from "@openzeppelin/contracts/token/ERC721/extensions/IERC721Enumerable.sol";
import {IERC721Metadata} from "@openzeppelin/contracts/token/ERC721/extensions/IERC721Metadata.sol";

contract TokenVerseNFTTest is Test {
    TokenVerseNFT internal nft;

    address internal owner = address(this);
    address internal user1 = makeAddr("user1");
    address internal user2 = makeAddr("user2");
    address internal user3 = makeAddr("user3");

    uint256 internal constant DRAGON_KNIGHT = 0;
    uint256 internal constant EMBER_WITCH = 1;
    uint256 internal constant VOID_STALKER = 2;

    // ========================================
    // SETUP
    // ========================================

    function setUp() public {
        // On a fork, makeAddr() addresses may already have code deployed on the
        // target network. ERC-721 safeMint calls onERC721Received on any recipient
        // that has code, so we wipe those slots to force EOA behaviour.
        vm.etch(user1, "");
        vm.etch(user2, "");
        vm.etch(user3, "");
        nft = new TokenVerseNFT();
    }

    // ========================================
    // METADATA
    // ========================================

    function testNameAndSymbol() public view {
        assertEq(nft.name(), "TokenVerse NFT");
        assertEq(nft.symbol(), "TVNFT");
    }

    function testConstants() public view {
        assertEq(nft.DRAGON_KNIGHT(), 0);
        assertEq(nft.EMBER_WITCH(), 1);
        assertEq(nft.VOID_STALKER(), 2);
        assertEq(nft.NFT_TYPES(), 3);
    }

    // ========================================
    // MINT — happy path
    // ========================================

    function testMintDragonKnight() public {
        vm.prank(user1);
        nft.mint(DRAGON_KNIGHT);

        assertEq(nft.balanceOf(user1), 1);
        assertEq(nft.ownerOf(0), user1);
        assertEq(nft.totalSupply(), 1);
        assertEq(nft.hasMintedType(user1, DRAGON_KNIGHT), true);
    }

    function testMintEmberWitch() public {
        vm.prank(user1);
        nft.mint(EMBER_WITCH);

        assertEq(nft.balanceOf(user1), 1);
        assertEq(nft.ownerOf(0), user1);
        assertEq(nft.hasMintedType(user1, EMBER_WITCH), true);
    }

    function testMintVoidStalker() public {
        vm.prank(user1);
        nft.mint(VOID_STALKER);

        assertEq(nft.balanceOf(user1), 1);
        assertEq(nft.hasMintedType(user1, VOID_STALKER), true);
    }

    function testMintAllThreeTypesOneWallet() public {
        vm.startPrank(user1);
        nft.mint(DRAGON_KNIGHT);
        nft.mint(EMBER_WITCH);
        nft.mint(VOID_STALKER);
        vm.stopPrank();

        assertEq(nft.balanceOf(user1), 3);
        assertEq(nft.totalSupply(), 3);
        assertEq(nft.hasMintedType(user1, DRAGON_KNIGHT), true);
        assertEq(nft.hasMintedType(user1, EMBER_WITCH), true);
        assertEq(nft.hasMintedType(user1, VOID_STALKER), true);
    }

    function testTokenIdsIncrementSequentially() public {
        vm.prank(user1);
        nft.mint(DRAGON_KNIGHT);

        vm.prank(user2);
        nft.mint(DRAGON_KNIGHT);

        vm.prank(user3);
        nft.mint(DRAGON_KNIGHT);

        assertEq(nft.ownerOf(0), user1);
        assertEq(nft.ownerOf(1), user2);
        assertEq(nft.ownerOf(2), user3);
    }

    // ========================================
    // MINT — token URI
    // ========================================

    function testTokenURIDragonKnight() public {
        vm.prank(user1);
        nft.mint(DRAGON_KNIGHT);

        string memory uri = nft.tokenURI(0);
        assertEq(uri, "ipfs://bafybeihrz5ifacb77eu7dvhesuhdougxkecasoijmvk3vw7gm425vd4kve/0.json");
    }

    function testTokenURIEmberWitch() public {
        vm.prank(user1);
        nft.mint(EMBER_WITCH);

        string memory uri = nft.tokenURI(0);
        assertEq(uri, "ipfs://bafybeihrz5ifacb77eu7dvhesuhdougxkecasoijmvk3vw7gm425vd4kve/1.json");
    }

    function testTokenURIVoidStalker() public {
        vm.prank(user1);
        nft.mint(VOID_STALKER);

        string memory uri = nft.tokenURI(0);
        assertEq(uri, "ipfs://bafybeihrz5ifacb77eu7dvhesuhdougxkecasoijmvk3vw7gm425vd4kve/2.json");
    }

    // ========================================
    // MINT — event
    // ========================================

    function testMintEmitsNFTMinted() public {
        vm.expectEmit(true, true, false, true);
        emit TokenVerseNFT.NFTMinted(user1, 0, DRAGON_KNIGHT);

        vm.prank(user1);
        nft.mint(DRAGON_KNIGHT);
    }

    // ========================================
    // MINT — revert cases
    // ========================================

    function testMintInvalidTypeReverts() public {
        vm.prank(user1);
        vm.expectRevert(TokenVerseNFT.TokenVerseNFT__InvalidType.selector);
        nft.mint(3); // out of range
    }

    function testMintInvalidTypeLargeNumberReverts() public {
        vm.prank(user1);
        vm.expectRevert(TokenVerseNFT.TokenVerseNFT__InvalidType.selector);
        nft.mint(999);
    }

    function testMintSameTypeTwiceReverts() public {
        vm.startPrank(user1);
        nft.mint(DRAGON_KNIGHT);

        vm.expectRevert(TokenVerseNFT.TokenVerseNFT__AlreadyMinted.selector);
        nft.mint(DRAGON_KNIGHT);
        vm.stopPrank();
    }

    function testDifferentWalletsSameMintTypeAllowed() public {
        vm.prank(user1);
        nft.mint(DRAGON_KNIGHT);

        vm.prank(user2);
        nft.mint(DRAGON_KNIGHT); // different wallet — should succeed

        assertEq(nft.hasMintedType(user1, DRAGON_KNIGHT), true);
        assertEq(nft.hasMintedType(user2, DRAGON_KNIGHT), true);
        assertEq(nft.totalSupply(), 2);
    }

    // ========================================
    // hasMintedType
    // ========================================

    function testHasMintedTypeReturnsFalseBeforeMint() public view {
        assertEq(nft.hasMintedType(user1, DRAGON_KNIGHT), false);
        assertEq(nft.hasMintedType(user1, EMBER_WITCH), false);
        assertEq(nft.hasMintedType(user1, VOID_STALKER), false);
    }

    function testHasMintedTypeIsolatedPerType() public {
        vm.prank(user1);
        nft.mint(EMBER_WITCH);

        assertEq(nft.hasMintedType(user1, DRAGON_KNIGHT), false);
        assertEq(nft.hasMintedType(user1, EMBER_WITCH), true);
        assertEq(nft.hasMintedType(user1, VOID_STALKER), false);
    }

    function testHasMintedTypeIsolatedPerWallet() public {
        vm.prank(user1);
        nft.mint(DRAGON_KNIGHT);

        assertEq(nft.hasMintedType(user2, DRAGON_KNIGHT), false);
    }

    // ========================================
    // ERC721Enumerable
    // ========================================

    function testTokenOfOwnerByIndex() public {
        vm.startPrank(user1);
        nft.mint(DRAGON_KNIGHT); // tokenId 0
        nft.mint(EMBER_WITCH); // tokenId 1
        vm.stopPrank();

        assertEq(nft.tokenOfOwnerByIndex(user1, 0), 0);
        assertEq(nft.tokenOfOwnerByIndex(user1, 1), 1);
    }

    function testTokenOfOwnerByIndexOutOfBoundsReverts() public {
        vm.prank(user1);
        nft.mint(DRAGON_KNIGHT);

        vm.expectRevert();
        nft.tokenOfOwnerByIndex(user1, 1); // only index 0 exists
    }

    function testTotalSupplyTracksAllMints() public {
        assertEq(nft.totalSupply(), 0);

        vm.prank(user1);
        nft.mint(DRAGON_KNIGHT);
        assertEq(nft.totalSupply(), 1);

        vm.prank(user2);
        nft.mint(EMBER_WITCH);
        assertEq(nft.totalSupply(), 2);

        vm.prank(user3);
        nft.mint(VOID_STALKER);
        assertEq(nft.totalSupply(), 3);
    }

    // ========================================
    // TRANSFER
    // ========================================

    function testSafeTransferFrom() public {
        vm.prank(user1);
        nft.mint(DRAGON_KNIGHT); // tokenId 0

        vm.prank(user1);
        nft.safeTransferFrom(user1, user2, 0);

        assertEq(nft.ownerOf(0), user2);
        assertEq(nft.balanceOf(user1), 0);
        assertEq(nft.balanceOf(user2), 1);
    }

    function testTransferByNonOwnerReverts() public {
        vm.prank(user1);
        nft.mint(DRAGON_KNIGHT); // tokenId 0

        vm.prank(user2);
        vm.expectRevert();
        nft.safeTransferFrom(user1, user2, 0);
    }

    function testApproveAndTransferFrom() public {
        vm.prank(user1);
        nft.mint(DRAGON_KNIGHT); // tokenId 0

        vm.prank(user1);
        nft.approve(user2, 0);

        vm.prank(user2);
        nft.safeTransferFrom(user1, user2, 0);

        assertEq(nft.ownerOf(0), user2);
    }

    function testSetApprovalForAll() public {
        vm.prank(user1);
        nft.mint(DRAGON_KNIGHT); // tokenId 0

        vm.prank(user1);
        nft.setApprovalForAll(user2, true);

        assertEq(nft.isApprovedForAll(user1, user2), true);

        vm.prank(user2);
        nft.safeTransferFrom(user1, user3, 0);

        assertEq(nft.ownerOf(0), user3);
    }

    // ========================================
    // supportsInterface
    // ========================================

    function testSupportsERC721Interface() public view {
        assertTrue(nft.supportsInterface(type(IERC721).interfaceId));
    }

    function testSupportsERC721EnumerableInterface() public view {
        assertTrue(nft.supportsInterface(type(IERC721Enumerable).interfaceId));
    }

    function testSupportsERC721MetadataInterface() public view {
        assertTrue(nft.supportsInterface(type(IERC721Metadata).interfaceId));
    }
}
