// Source: VITE_CONTRACT_ADDRESS in frontend/.env.local
// Update this value after every fresh `make deploy-local` or `make deploy-sepolia`.
export const TOKEN_VERSE_1155_ADDRESS = import.meta.env
  .VITE_ERC1155_CONTRACT_ADDRESS;

// ERC-20: TokenVerseGold — update after `make deploy-erc20-local` or `make deploy-erc20-sepolia`
export const TOKEN_VERSE_ERC20_ADDRESS = import.meta.env
  .VITE_ERC20_CONTRACT_ADDRESS;

export const TOKEN_VERSE_GOLD_ABI = [
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
    name: "totalFaucetClaims",
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
  {
    type: "error",
    name: "TokenVerseGold__FaucetDepleted",
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
    type: "error",
    name: "NotApproved",
    inputs: [],
  },
  {
    type: "error",
    name: "InsufficientDragonSwords",
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
