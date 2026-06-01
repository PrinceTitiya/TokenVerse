// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import {ERC721Enumerable} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

contract TokenVerseNFT is ERC721, ERC721URIStorage, ERC721Enumerable, Ownable {
    // TOKEN TYPES

    uint256 public constant DRAGON_KNIGHT = 0;
    uint256 public constant EMBER_WITCH = 1;
    uint256 public constant VOID_STALKER = 2;
    uint256 public constant NFT_TYPES = 3;
    uint256 public constant MAX_SUPPLY = 50;

    // STATE

    uint256 private _nextTokenId;
    string private _baseTokenUri;

    // tracks whether a wallet has already minted a specific type
    mapping(address => mapping(uint256 => bool)) private _hasMintedType;

    // ERRORS

    error TokenVerseNFT__InvalidType();
    error TokenVerseNFT__AlreadyMinted();
    error TokenVerseNFT__MaxSupplyReached();

    // EVENTS

    event NFTMinted(address indexed to, uint256 indexed tokenId, uint256 typeId);

    // CONSTRUCTOR

    constructor() ERC721("TokenVerse NFT", "TVNFT") Ownable(msg.sender) {
        _baseTokenUri = "ipfs://bafybeihrz5ifacb77eu7dvhesuhdougxkecasoijmvk3vw7gm425vd4kve/";
    }

    // PUBLIC MINT FAUCET — one per wallet per type, mints to caller

    function mint(uint256 typeId) external {
        if (typeId >= NFT_TYPES) revert TokenVerseNFT__InvalidType();
        if (_hasMintedType[msg.sender][typeId]) revert TokenVerseNFT__AlreadyMinted();
        if (_nextTokenId >= MAX_SUPPLY) revert TokenVerseNFT__MaxSupplyReached();

        uint256 tokenId = _nextTokenId++;
        _hasMintedType[msg.sender][typeId] = true;

        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, string.concat(_baseTokenUri, Strings.toString(typeId), ".json"));

        emit NFTMinted(msg.sender, tokenId, typeId);
    }

    // VIEW — check if a wallet has already minted a specific type

    function hasMintedType(address wallet, uint256 typeId) external view returns (bool) {
        return _hasMintedType[wallet][typeId];
    }

    // REQUIRED OVERRIDES — resolve diamond inheritance between ERC721, ERC721URIStorage, ERC721Enumerable

    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function _update(address to, uint256 tokenId, address auth)
        internal
        override(ERC721, ERC721Enumerable)
        returns (address)
    {
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(address account, uint128 value) internal override(ERC721, ERC721Enumerable) {
        super._increaseBalance(account, value);
    }
}
