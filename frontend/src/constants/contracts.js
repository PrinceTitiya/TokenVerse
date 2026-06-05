// Update these after every fresh `make deploy-local` or `make deploy-sepolia`.
export const TOKEN_VERSE_1155_ADDRESS =
  "0x8A791620dd6260079BF849Dc5567aDC3F2FdC318";
export const TOKEN_VERSE_ERC20_ADDRESS =
  "0x5FbDB2315678afecb367f032d93F642f64180aa3";
export const TOKEN_VERSE_ERC721_ADDRESS =
  "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

export const TOKEN_VERSE_ERC721_ABI = [
  {
    type: "function",
    name: "mint",
    inputs: [{ name: "typeId", type: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "hasMintedType",
    inputs: [
      { name: "wallet", type: "address" },
      { name: "typeId", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "balanceOf",
    inputs: [{ name: "owner", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "tokenOfOwnerByIndex",
    inputs: [
      { name: "owner", type: "address" },
      { name: "index", type: "uint256" },
    ],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "tokenURI",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [{ name: "", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "safeTransferFrom",
    inputs: [
      { name: "from", type: "address" },
      { name: "to", type: "address" },
      { name: "tokenId", type: "uint256" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "totalSupply",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "event",
    name: "NFTMinted",
    inputs: [
      { name: "to", type: "address", indexed: true },
      { name: "tokenId", type: "uint256", indexed: true },
      { name: "typeId", type: "uint256", indexed: false },
    ],
  },
  {
    type: "error",
    name: "TokenVerseNFT__InvalidType",
    inputs: [],
  },
  {
    type: "error",
    name: "TokenVerseNFT__AlreadyMinted",
    inputs: [],
  },
  {
    type: "function",
    name: "approve",
    inputs: [
      { name: "to", type: "address" },
      { name: "tokenId", type: "uint256" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "setApprovalForAll",
    inputs: [
      { name: "operator", type: "address" },
      { name: "approved", type: "bool" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "isApprovedForAll",
    inputs: [
      { name: "owner", type: "address" },
      { name: "operator", type: "address" },
    ],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "ownerOf",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "owner",
    inputs: [],
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
  },
];

export const TOKEN_VERSE_ERC20_ABI = [
  {
    type: "function",
    name: "faucet",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "mint",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "transfer",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "approve",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "transferFrom",
    inputs: [
      { name: "from", type: "address" },
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "burn",
    inputs: [{ name: "amount", type: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "balanceOf",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "allowance",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "totalSupply",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "hasClaimed",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "owner",
    inputs: [],
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "event",
    name: "FaucetClaimed",
    inputs: [
      { name: "claimer", type: "address", indexed: true },
      { name: "amount", type: "uint256", indexed: false },
    ],
  },
  {
    type: "error",
    name: "TokenVerseGold__AlreadyClaimed",
    inputs: [],
  },
];

export const TOKEN_VERSE_ABI = [
  {
    type: "function",
    name: "balanceOf",
    inputs: [
      { name: "account", type: "address" },
      { name: "id", type: "uint256" },
    ],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "balanceOfBatch",
    inputs: [
      { name: "accounts", type: "address[]" },
      { name: "ids", type: "uint256[]" },
    ],
    outputs: [{ name: "", type: "uint256[]" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "mint",
    inputs: [
      { name: "to", type: "address" },
      { name: "id", type: "uint256" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "mintBatch",
    inputs: [
      { name: "to", type: "address" },
      { name: "ids", type: "uint256[]" },
      { name: "amounts", type: "uint256[]" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "burn",
    inputs: [
      { name: "from", type: "address" },
      { name: "id", type: "uint256" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "burnBatch",
    inputs: [
      { name: "from", type: "address" },
      { name: "ids", type: "uint256[]" },
      { name: "amounts", type: "uint256[]" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "dismantleDragonSword",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "safeTransferFrom",
    inputs: [
      { name: "from", type: "address" },
      { name: "to", type: "address" },
      { name: "id", type: "uint256" },
      { name: "value", type: "uint256" },
      { name: "data", type: "bytes" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "safeBatchTransferFrom",
    inputs: [
      { name: "from", type: "address" },
      { name: "to", type: "address" },
      { name: "ids", type: "uint256[]" },
      { name: "values", type: "uint256[]" },
      { name: "data", type: "bytes" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "setApprovalForAll",
    inputs: [
      { name: "operator", type: "address" },
      { name: "approved", type: "bool" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "isApprovedForAll",
    inputs: [
      { name: "account", type: "address" },
      { name: "operator", type: "address" },
    ],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "totalSupply",
    inputs: [{ name: "id", type: "uint256" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "uri",
    inputs: [{ name: "", type: "uint256" }],
    outputs: [{ name: "", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "owner",
    inputs: [],
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "event",
    name: "SwordDismantled",
    inputs: [
      { name: "user", type: "address", indexed: true },
      { name: "dragonGlassReceived", type: "uint256", indexed: false },
    ],
  },
  {
    type: "function",
    name: "claimStarterPack",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "hasClaimedStarterPack",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "event",
    name: "StarterPackClaimed",
    inputs: [{ name: "claimer", type: "address", indexed: true }],
  },
  {
    type: "error",
    name: "NotApproved",
    inputs: [],
  },
  {
    type: "error",
    name: "InsufficientDragonSwords",
    inputs: [],
  },
  {
    type: "error",
    name: "TokenVerse1155__AlreadyClaimed",
    inputs: [],
  },
];

export const TOKENS = [
  {
    id: 1n,
    name: "Gold",
    description: "Primary in-game currency of TokenVerse.",
    rarity: "Common",
    imageCid: "bafybeiep4rd5i2huq54lbdfx7j76a4g2o55zfgolbfprupaz5onwkpg2bu",
  },
  {
    id: 2n,
    name: "Gems",
    description: "Precious gemstones used for crafting and trading.",
    rarity: "Rare",
    imageCid: "bafkreifv37qqgq7s76ctbluwtio26ylu46cihr5afaao7yjc4rmofux7ry",
  },
  {
    id: 3n,
    name: "Dragon Sword",
    description: "A legendary weapon. Dismantle it into 100 Dragon Glass.",
    rarity: "Legendary",
    imageCid: "bafkreieve4slxmdhezg4dcdsdx64sic2b2sfqr5au65r7tvpl2xbudn7ea",
  },
  {
    id: 4n,
    name: "Event Ticket",
    description: "Limited-edition ticket granting access to exclusive events.",
    rarity: "Epic",
    imageCid: "bafybeif3rxnzkfec5gglho3xml7dh3wjuf2xaqkkcyieccqvrj37tgozc4",
  },
  {
    id: 5n,
    name: "Dragon Glass",
    description: "Raw material obtained by dismantling a Dragon Sword.",
    rarity: "Rare",
    imageCid: "bafybeife54exjcgk7p7i3xicdav44wxj6xupfv3mhifox52ore6acehpzu",
  },
];

export const RARITY_CONFIG = {
  Common: {
    badge: "bg-gray-100 text-gray-700",
    border: "border-gray-300",
    glow: "",
  },
  Rare: {
    badge: "bg-blue-100 text-blue-700",
    border: "border-blue-400",
    glow: "shadow-blue-200",
  },
  Epic: {
    badge: "bg-purple-100 text-purple-700",
    border: "border-purple-500",
    glow: "shadow-purple-200",
  },
  Legendary: {
    badge: "bg-amber-100 text-amber-700",
    border: "border-amber-500",
    glow: "shadow-amber-200",
  },
};
