# TokenVerse

An interactive educational platform that answers one question: **"Why do different token standards exist on Ethereum?"**

TokenVerse deploys all three major Ethereum token standards as live smart contracts — ERC-20, ERC-721, and ERC-1155 — and wraps them in an interactive frontend where you can mint, burn, transfer, and compare them side by side. Every architectural decision is intentional and explainable.

---

## How It Works

```
User (browser)
    │
    ▼
React + Wagmi + RainbowKit          ← frontend/ (localhost:5173 or Vercel)
    │
    │  eth_call / eth_sendTransaction
    ▼
Ethereum Node (Anvil local / Sepolia)
    │
    ├── TokenVerseGold (ERC-20)     ← TVG fungible token with per-address faucet
    ├── TokenVerse1155 (ERC-1155)   ← Gaming inventory: GOLD, GEMS, DRAGON_SWORD, EVENT_TICKET, DRAGON_GLASS
    └── TokenVerseNFT (ERC-721)     ← Character NFTs: Dragon Knight, Ember Witch, Void Stalker
```

The frontend is the single surface where all three standards converge. `frontend/src/constants/contracts.js` is the source of truth for ABIs and deployed addresses. After every fresh local deploy, update that file's address constants.

---

## What's Built

| Phase | Scope | Status |
|-------|-------|--------|
| 1 | ERC-1155 — Contract + Frontend | Done |
| 2 | ERC-20 — Contract + Frontend | Done |
| 3 | ERC-721 — Contract + Frontend | Done |
| 4 | Comparison Dashboard | Done |
| 5 | Deploy to Sepolia + Vercel | Pending |

---

## Smart Contracts

### ERC-1155 — `TokenVerse1155`

**File:** `src/ERC1155/TokenVerse1155.sol`  
**Inherits:** `ERC1155`, `ERC1155Supply`, `Ownable`  
**Metadata:** `ipfs://bafybeiddzghzwimp3nbwch6mqd4h3apqfah24hb2tbwwhdepukby6io5ni/{id}.json`

A multi-token gaming inventory. Five token IDs live in a single contract, demonstrating why ERC-1155 exists: one address manages both fungible currencies and semi-fungible items without deploying separate contracts.

**Token IDs**

| Constant | ID | Type | Description |
|----------|----|------|-------------|
| `GOLD` | 1 | Fungible | Primary in-game currency |
| `GEMS` | 2 | Fungible | Secondary currency |
| `DRAGON_SWORD` | 3 | Semi-fungible | Craftable weapon |
| `EVENT_TICKET` | 4 | Semi-fungible | Limited access pass |
| `DRAGON_GLASS` | 5 | Fungible | Crafting output |

**Key Functions**

| Function | Access | Description |
|----------|--------|-------------|
| `mint(to, id, amount)` | `onlyOwner` | Mint a single token type |
| `mintBatch(to, ids[], amounts[])` | `onlyOwner` | Batch mint multiple types in one tx |
| `claimStarterPack()` | public | One-time claim: 10 GOLD + 5 GEMS + 1 DRAGON_SWORD per address |
| `burn(from, id, amount)` | holder or approved | Burn a single token type |
| `burnBatch(from, ids[], amounts[])` | holder or approved | Batch burn |
| `dismantleDragonSword()` | holder | Crafting: burns 1 DRAGON_SWORD → mints 100 DRAGON_GLASS |

**Errors:** `TokenVerse1155__AlreadyClaimed`, `InsufficientDragonSwords`, `NotApproved`  
**Events:** `StarterPackClaimed(address)`, `SwordDismantled(address, uint256)`

> The `_update` override resolves the diamond-inheritance conflict between `ERC1155` and `ERC1155Supply`.

---

### ERC-20 — `TokenVerseGold`

**File:** `src/ERC20/TokenVerseGold.sol`  
**Inherits:** `ERC20`, `ERC20Burnable`, `Ownable`  
**Symbol:** `TVG` · **Decimals:** 18

A fungible token demonstrating the approval/transfer flow. The public faucet gives anyone 1,000 TVG — one claim per address, unlimited wallets — so the full ERC-20 flow (faucet → approve → transferFrom) can be exercised in the frontend without owning real ETH.

**Key Functions**

| Function | Access | Description |
|----------|--------|-------------|
| `mint(address, uint256)` | `onlyOwner` | Mint TVG to any address |
| `faucet()` | public | Mints 1,000 TVG to caller; one claim per address |
| `burn(uint256)` | holder | Burn caller's own TVG |
| `burnFrom(address, uint256)` | approved spender | Burn from another address via allowance |

**Errors:** `TokenVerseGold__AlreadyClaimed`  
**Events:** `FaucetClaimed(address indexed claimer, uint256 amount)`

---

### ERC-721 — `TokenVerseNFT`

**File:** `src/ERC721/TokenVerseNFT.sol`  
**Inherits:** `ERC721`, `ERC721URIStorage`, `ERC721Enumerable`, `Ownable`  
**Symbol:** `TVNFT`  
**Metadata:** `ipfs://bafybeihrz5ifacb77eu7dvhesuhdougxkecasoijmvk3vw7gm425vd4kve/{typeId}.json`

A character NFT collection demonstrating unique on-chain ownership and IPFS metadata. Each wallet can mint one of each character type; the per-type limit enforces scarcity without a global whitelist.

**Character Types**

| Constant | Type ID | Character |
|----------|---------|-----------|
| `DRAGON_KNIGHT` | 0 | Dragon Knight |
| `EMBER_WITCH` | 1 | Ember Witch |
| `VOID_STALKER` | 2 | Void Stalker |

**Key Functions**

| Function | Access | Description |
|----------|--------|-------------|
| `mint(typeId)` | public | Mints one character NFT; one per wallet per type |
| `hasMintedType(wallet, typeId)` | view | Returns whether a wallet has minted a specific type |

**Errors:** `TokenVerseNFT__InvalidType`, `TokenVerseNFT__AlreadyMinted`  
**Events:** `NFTMinted(address indexed to, uint256 indexed tokenId, uint256 typeId)`

> Four overrides required to resolve diamond inheritance between `ERC721`, `ERC721URIStorage`, and `ERC721Enumerable`: `tokenURI`, `supportsInterface`, `_update`, `_increaseBalance`.

---

## Frontend

**Stack:** React + Vite · Wagmi v2 · RainbowKit v2 · viem · TanStack Query · Tailwind CSS v3

**Entry:** `frontend/src/main.jsx` — provider order: `WagmiProvider` → `QueryClientProvider` → `RainbowKitProvider` → `BrowserRouter`

**Routes**

| Route | Page | Description |
|-------|------|-------------|
| `/` | — | Redirects to `/compare` |
| `/compare` | Compare | **Default.** Standards comparison: decision tree, gas chart, architecture visualizer, tradeoff table |
| `/erc20` | ERC20 | TVG faucet claim, balance display, approve/transfer flow |
| `/erc721` | ERC721 | Character gallery, mint by type, wallet holdings |
| `/erc1155` | ERC1155 | Token showcase grid with supply info |
| `/inventory` | Inventory | Per-wallet ERC-1155 holdings |
| `/mint-lab` | MintLab | Owner mint (single/batch), dismantle Dragon Sword |

**`frontend/src/constants/contracts.js`** — single source of truth. Exports contract addresses, ABIs, and the `TOKENS` metadata array for all five ERC-1155 tokens. Update addresses here after every deploy.

**`frontend/src/wagmi.config.js`** — configures transports for both Anvil (chain ID 31337) and Sepolia explicitly. Without explicit transports, wagmi silently omits them, causing `to: None` errors on local `eth_call`.

---

## Standards Comparison

| Property | ERC-20 | ERC-721 | ERC-1155 |
|----------|--------|---------|----------|
| Token model | Balance per address | Owner per token ID | Balance per (address, ID) |
| Fungibility | Fully fungible | Non-fungible | Per-ID (either) |
| Batch transfers | No | No | Yes — `safeBatchTransferFrom` |
| Gas at scale | Linear | Most expensive | Cheapest (batching) |
| DeFi composability | Native | Limited | Needs adapter |
| Asset provenance | None | Per-token history | Per-type only |
| Deploy gas (approx.) | ~1.3M | ~2.9M | ~2.6M |

---

## Getting Started

### Prerequisites

```shell
# Install Foundry
curl -L https://foundry.paradigm.xyz | bash
foundryup

# Node.js 18+ required for the frontend
node --version
```

### Clone and Install

```shell
git clone <repo-url>
cd TokenVerse

# Install Solidity dependencies (git submodules)
forge install

# Install frontend dependencies
make frontend-install
```

### Environment Setup

Copy the template and fill in values:

```shell
cp .env.example .env
```

`.env` is auto-loaded by `make` via `-include .env`.

| Variable | Required by | Notes |
|----------|-------------|-------|
| `LOCAL_PRIVATE_KEY` | All `*-local` targets | Anvil default key: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80` |
| `PRIVATE_KEY` | All Sepolia targets | Real wallet private key |
| `SEPOLIA_RPC_URL` | Sepolia deploy | e.g. Alchemy or Infura endpoint |
| `ETHERSCAN_API_KEY` | Sepolia verify | For contract verification |
| `VITE_ERC1155_CONTRACT_ADDRESS` | Frontend | Deployed `TokenVerse1155` address |
| `VITE_ERC20_CONTRACT_ADDRESS` | Frontend | Deployed `TokenVerseGold` address |
| `VITE_ERC721_CONTRACT_ADDRESS` | Frontend | Deployed `TokenVerseNFT` address |
| `VITE_WALLETCONNECT_PROJECT_ID` | Frontend | From [cloud.walletconnect.com](https://cloud.walletconnect.com) |
| `VITE_SEPOLIA_RPC_URL` | Frontend | Same endpoint as `SEPOLIA_RPC_URL` |

> After every fresh local deploy the contract address changes. Update the corresponding `VITE_*_CONTRACT_ADDRESS` in `frontend/.env.local`.

---

## Build & Test

```shell
# Compile all contracts
make build

# Run full test suite (verbose)
make test

# Run a single test by name
make test-match T=testMintGold

# Format Solidity (writes in place)
make fmt

# Gas snapshot
make snapshot
```

Raw Forge commands when you need extra flags:

```shell
forge test --match-path test/ERC1155/TokenVerse1155.t.sol -vvv
forge test --match-path test/ERC20/TokenVerseGold.t.sol -vvv
forge test --match-path test/ERC721/TokenVerseNFT.t.sol -vvv
```

---

## Local Development

**1. Start Anvil (local Ethereum node)**

```shell
make anvil
```

**2. Deploy contracts to Anvil**

```shell
make deploy-1155-local    # deploys TokenVerse1155
make deploy-erc20-local   # deploys TokenVerseGold
make deploy-erc721-local  # deploys TokenVerseNFT
```

Each deploy prints the contract address. Copy each address into `frontend/.env.local`:

```env
VITE_ERC1155_CONTRACT_ADDRESS=0x...
VITE_ERC20_CONTRACT_ADDRESS=0x...
VITE_ERC721_CONTRACT_ADDRESS=0x...
```

**3. Start the frontend**

```shell
make frontend
# → http://localhost:5173
```

Connect MetaMask or any WalletConnect-compatible wallet to the local Anvil network (`http://localhost:8545`, chain ID `31337`).

**Optional: dry-run a deploy without broadcasting**

```shell
make simulate-deploy-1155-local
make simulate-deploy-erc20-local
make simulate-deploy-erc721-local
```

**Optional: mint ERC-1155 tokens via script**

```shell
make mint-1155-local
```

---

## Sepolia Deployment

```shell
# Dry-run first
make simulate-deploy-1155-sepolia
make simulate-deploy-erc20-sepolia
make simulate-deploy-erc721-sepolia

# Broadcast + verify on Etherscan
make deploy-1155-sepolia
make deploy-erc20-sepolia
make deploy-erc721-sepolia
```

Verification is automatic (`--verify --etherscan-api-key`). Update the `VITE_*` addresses in your hosting environment after deploy.

---

## Test Suites

Tests are in Foundry. Each file deploys its own contract in `setUp()` with `address(this)` as owner. `vm.prank` and `makeAddr` are used for non-owner scenarios.

### ERC-1155 — `test/ERC1155/TokenVerse1155.t.sol`

| Test | What it verifies |
|------|-----------------|
| `testMintGold` | Single mint and balance |
| `testBatchMint` | Batch mint of GOLD, GEMS, EVENT_TICKET |
| `testBurnGold` | Partial burn, remainder check |
| `testDismantleDragonSword` | Sword burns → 100 Dragon Glass minted |
| `testCannotDismantleWithoutSword` | Revert guard for zero-sword dismantle |
| `testTransferGold` | `safeTransferFrom` between addresses |
| `testTotalSupply` | Supply tracking via `ERC1155Supply` |
| `testClaimStarterPack` | Faucet mints 10 GOLD + 5 GEMS + 1 DRAGON_SWORD |
| `testCannotClaimStarterPackTwice` | Double-claim reverts |

### ERC-20 — `test/ERC20/TokenVerseGold.t.sol`

| Test | What it verifies |
|------|-----------------|
| `testOwnerMint` | Owner can mint arbitrary amount |
| `testNonOwnerCannotMint` | Non-owner mint reverts |
| `testFaucetClaim` | Faucet mints 1,000 TVG and sets `hasClaimed` |
| `testFaucetEmitsEvent` | `FaucetClaimed` event emitted |
| `testFaucetDoubleClaim` | Second claim from same address reverts |
| `testTransfer` | Direct token transfer between wallets |
| `testApproveAndTransferFrom` | Approve a spender and pull tokens |
| `testTransferFromExceedingAllowanceReverts` | Over-allowance pull reverts |
| `testBurn` | Holder burns own tokens |
| `testBurnFrom` | Approved spender burns via `burnFrom` |
| `testNameAndSymbol` | Name, symbol, decimals metadata |

### ERC-721 — `test/ERC721/TokenVerseNFT.t.sol`

| Test | What it verifies |
|------|-----------------|
| `testNameAndSymbol` | Name and symbol |
| `testMintDragonKnight` / `testMintEmberWitch` / `testMintVoidStalker` | Each character type mints |
| `testMintAllThreeTypesOneWallet` | One wallet mints all three types |
| `testTokenIdsIncrementSequentially` | Sequential token IDs across wallets |
| `testTokenURI*` | Correct IPFS URI per character type |
| `testMintEmitsNFTMinted` | `NFTMinted` event emitted |
| `testMintInvalidTypeReverts` | Out-of-range `typeId` reverts |
| `testMintSameTypeTwiceReverts` | Same wallet, same type → revert |
| `testHasMintedType*` | Per-wallet per-type tracking |
| `testTokenOfOwnerByIndex` | `ERC721Enumerable` index lookup |
| `testSafeTransferFrom` | Transfer NFT to another wallet |
| `testApproveAndTransferFrom` | Token-level approve + transfer |
| `testSetApprovalForAll` | Operator-level approval |
| `testSupportsInterface` | ERC721, Enumerable, Metadata interfaces |

---

## CI/CD

GitHub Actions (`.github/workflows/test.yml`) runs on every push and pull request:

1. `forge fmt --check` — formatting must be clean
2. `forge build --sizes` — must compile with sizes report
3. `forge test -vvv` — all tests must pass

No secrets required for CI — tests run against Foundry's built-in EVM.

---

## Project Structure

```
TokenVerse/
├── src/
│   ├── ERC1155/
│   │   └── TokenVerse1155.sol         # Multi-token gaming inventory
│   ├── ERC20/
│   │   └── TokenVerseGold.sol         # Fungible token with per-address faucet
│   └── ERC721/
│       └── TokenVerseNFT.sol          # Character NFT collection
├── test/
│   ├── ERC1155/TokenVerse1155.t.sol
│   ├── ERC20/TokenVerseGold.t.sol
│   └── ERC721/TokenVerseNFT.t.sol
├── script/
│   ├── ERC1155/
│   │   ├── DeployTokenVerse1155.s.sol
│   │   └── MintTokenVerse1155.s.sol
│   ├── ERC20/DeployTokenVerseGold.s.sol
│   └── ERC721/DeployTokenVerseNFT.s.sol
├── frontend/
│   └── src/
│       ├── pages/                     # Compare, ERC20, ERC721, ERC1155, Inventory, MintLab
│       ├── components/                # Navbar, StandardsComparisonTable, GasComparisonChart,
│       │                              #   ArchitectureVisualizer, UseCaseCards, InventoryCTA
│       ├── constants/contracts.js     # ABIs + addresses (single source of truth)
│       ├── wagmi.config.js            # Chain + transport configuration
│       ├── App.jsx                    # Route definitions
│       └── main.jsx                   # Provider tree
├── metadata/
│   ├── 1.json – 5.json               # ERC-1155 token metadata
│   └── ERC721/0.json – 2.json        # ERC-721 character metadata
├── lib/
│   ├── openzeppelin-contracts/
│   └── forge-std/
├── .github/workflows/test.yml
├── Makefile
└── foundry.toml
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Solidity | `^0.8.26` |
| Contract framework | [Foundry](https://book.getfoundry.sh/) — Forge, Cast, Anvil, Chisel |
| Contract libraries | [OpenZeppelin Contracts](https://github.com/OpenZeppelin/openzeppelin-contracts) |
| Frontend build | React + [Vite](https://vitejs.dev/) |
| Wallet integration | [Wagmi v2](https://wagmi.sh/) + [RainbowKit v2](https://www.rainbowkit.com/) |
| Chain interaction | [viem](https://viem.sh/) |
| Data fetching | [TanStack Query](https://tanstack.com/query) |
| Styling | [Tailwind CSS v3](https://tailwindcss.com/) |

---

## Roadmap

- [x] ERC-1155 — multi-token gaming contract + full test suite
- [x] ERC-1155 — frontend (ERC1155, MintLab, Inventory pages)
- [x] ERC-20 — fungible token with per-address faucet + full test suite
- [x] ERC-20 — frontend (faucet claim, balance display)
- [x] ERC-721 — character NFT contract with IPFS metadata + full test suite
- [x] ERC-721 — frontend (gallery, mint, wallet holdings)
- [x] Comparison Dashboard — decision tree, gas chart, architecture visualizer
- [ ] ERC-20 — approve + transferFrom demo section in frontend
- [ ] Unified ownership view (TVG + ERC-721 + ERC-1155 in one page)
- [ ] Deploy all 3 contracts to Sepolia + verify on Etherscan
- [ ] Deploy frontend to Vercel

---

## Resources

- [Foundry Book](https://book.getfoundry.sh/)
- [OpenZeppelin Docs](https://docs.openzeppelin.com/contracts)
- [EIP-20 — ERC-20 Standard](https://eips.ethereum.org/EIPS/eip-20)
- [EIP-721 — ERC-721 Standard](https://eips.ethereum.org/EIPS/eip-721)
- [EIP-1155 — ERC-1155 Standard](https://eips.ethereum.org/EIPS/eip-1155)
- [WalletConnect Cloud](https://cloud.walletconnect.com)
