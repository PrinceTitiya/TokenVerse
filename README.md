# TokenVerse

**An interactive educational platform that answers one question: why do different token standards exist on Ethereum?**

TokenVerse deploys all three major Ethereum token standards as live smart contracts — ERC-20, ERC-721, and ERC-1155 — and wraps them in an interactive frontend where you can mint, burn, transfer, and compare them side by side. Every architectural decision is intentional and explainable.

**Live Demo:** [https://token-verse-chi.vercel.app/](https://token-verse-chi.vercel.app/)

---

## Overview

Most developers learn token standards by reading specs. TokenVerse lets you interact with them directly on Sepolia testnet — claim a faucet, mint NFTs, dismantle weapons into crafting material, and watch the comparison dashboard explain why each standard was invented.

The comparison dashboard is the core: a standards comparison table, gas chart, architecture visualizer, decision tree, and tradeoff matrix that walk through the engineering reasoning behind ERC-20, ERC-721, and ERC-1155.

```
Browser
    │
    ▼
React + Wagmi + RainbowKit          ← frontend/ (Vercel · localhost:5173)
    │
    │  eth_call / eth_sendTransaction
    ▼
Ethereum Node (Sepolia / Anvil local)
    │
    ├── TokenVerseGold (ERC-20)      ← TVG fungible token with per-address faucet
    ├── TokenVerse1155 (ERC-1155)    ← Gaming inventory: GOLD, GEMS, DRAGON_SWORD, EVENT_TICKET, DRAGON_GLASS
    └── TokenVerseNFT (ERC-721)      ← Character NFTs: Dragon Knight, Ember Witch, Void Stalker
```

---

## Live Contracts (Sepolia)

| Contract         | Standard | Address                                      |
| ---------------- | -------- | -------------------------------------------- |
| `TokenVerseGold` | ERC-20   | `0x21db8545F707deEAd63b094Ba94f9F1B9fD91c6D` |
| `TokenVerseNFT`  | ERC-721  | `0x8C6f6B1a9Cda80CCc15d77F5ae12f5bA8a293F06` |
| `TokenVerse1155` | ERC-1155 | `0xB5C3627eaF8ea13281a29aE228d0b9a17893ee00` |

---

## Project Scope

| Phase | Scope                          | Status |
| ----- | ------------------------------ | ------ |
| 1     | ERC-1155 — Contract + Frontend | Done   |
| 2     | ERC-20 — Contract + Frontend   | Done   |
| 3     | ERC-721 — Contract + Frontend  | Done   |
| 4     | Comparison Dashboard           | Done   |
| 5     | Deploy to Sepolia + Vercel     | Done   |

---

## Smart Contracts

All contracts use Solidity `^0.8.26` and inherit from OpenZeppelin.

### ERC-1155 — `TokenVerse1155`

**File:** `src/ERC1155/TokenVerse1155.sol`
**Inherits:** `ERC1155`, `ERC1155Supply`, `Ownable`
**Metadata base URI:** `ipfs://bafybeiddzghzwimp3nbwch6mqd4h3apqfah24hb2tbwwhdepukby6io5ni/{id}.json`

A multi-token gaming inventory. Five token types live in a single contract, demonstrating why ERC-1155 exists: one address manages both fungible currencies and semi-fungible items without deploying separate contracts.

**Token IDs**

| Constant       | ID    | Type          | Description                                                                        |
| -------------- | ----- | ------------- | ---------------------------------------------------------------------------------- |
| `GOLD`         | 1     | Fungible      | Primary in-game currency                                                           |
| `GEMS`         | 2     | Fungible      | Secondary currency / crafting material                                             |
| Dragon Sword   | 1000+ | NFT-like      | Each sword gets a unique ID. `swordIdOf[address]` maps each wallet to its sword ID |
| `EVENT_TICKET` | 4     | Semi-fungible | Limited access pass                                                                |
| `DRAGON_GLASS` | 5     | Fungible      | Crafting output from dismantling a Dragon Sword                                    |

> Dragon Swords are **NFT-like within ERC-1155**: every sword occupies a unique ID starting at `DRAGON_SWORD_BASE = 1000`. There is no fungible token at ID 3. `isSword(id)` returns `true` for `id >= 1000`.

**Key Functions**

| Function                            | Access             | Description                                                                        |
| ----------------------------------- | ------------------ | ---------------------------------------------------------------------------------- |
| `mint(to, id, amount)`              | `onlyOwner`        | Mint a single fungible token type (Dragon Sword IDs excluded — use `mintSwordFor`) |
| `mintBatch(to, ids[], amounts[])`   | `onlyOwner`        | Batch mint multiple types in one tx                                                |
| `mintSwordFor(address)`             | `onlyOwner`        | Gift a unique Dragon Sword to a wallet that hasn't claimed one                     |
| `claimStarterPack()`                | public             | One-time claim: 100 GOLD + 10 GEMS + 1 unique Dragon Sword per address             |
| `burn(from, id, amount)`            | holder or approved | Burn a single token type                                                           |
| `burnBatch(from, ids[], amounts[])` | holder or approved | Batch burn                                                                         |
| `dismantleDragonSword(swordId)`     | holder             | Crafting: burns 1 specific Dragon Sword → mints 100 DRAGON_GLASS                   |
| `isSword(id)`                       | pure view          | Returns `true` if `id >= DRAGON_SWORD_BASE`                                        |

**Custom Errors:** `TokenVerse1155__AlreadyClaimed`, `InsufficientDragonSwords`, `NotApproved`, `NotASword`, `AlreadyHasSword`

**Events:** `TokenVerse1155__StarterPackClaimed(address)`, `TokenVerse1155__SwordDismantled(address, uint256)`

> The `_update` override resolves the diamond-inheritance conflict between `ERC1155` and `ERC1155Supply`.

---

### ERC-20 — `TokenVerseGold`

**File:** `src/ERC20/TokenVerseGold.sol`
**Inherits:** `ERC20`, `ERC20Burnable`, `Ownable`
**Symbol:** `TVG` · **Decimals:** 18

A fungible token demonstrating the approval/transfer flow. The public faucet gives anyone 1,000 TVG — one claim per address — so the full ERC-20 flow (faucet → approve → transferFrom) can be exercised without owning real ETH.

**Key Functions**

| Function                     | Access           | Description                                      |
| ---------------------------- | ---------------- | ------------------------------------------------ |
| `mint(address, uint256)`     | `onlyOwner`      | Mint TVG to any address                          |
| `faucet()`                   | public           | Mints 1,000 TVG to caller; one claim per address |
| `burn(uint256)`              | holder           | Burn caller's own TVG                            |
| `burnFrom(address, uint256)` | approved spender | Burn from another address via allowance          |

**Custom Errors:** `TokenVerseGold__AlreadyClaimed`

**Events:** `FaucetClaimed(address indexed claimer, uint256 amount)`

---

### ERC-721 — `TokenVerseNFT`

**File:** `src/ERC721/TokenVerseNFT.sol`
**Inherits:** `ERC721`, `ERC721URIStorage`, `ERC721Enumerable`, `Ownable`
**Symbol:** `TVNFT`
**Metadata base URI:** `ipfs://bafybeihrz5ifacb77eu7dvhesuhdougxkecasoijmvk3vw7gm425vd4kve/`

A character NFT collection demonstrating unique on-chain ownership and IPFS metadata. Each wallet can mint one of each character type; per-type limits enforce scarcity without a global whitelist.

**Character Types**

| Constant        | Type ID | Character     | Metadata          |
| --------------- | ------- | ------------- | ----------------- |
| `DRAGON_KNIGHT` | 0       | Dragon Knight | `{baseURI}0.json` |
| `EMBER_WITCH`   | 1       | Ember Witch   | `{baseURI}1.json` |
| `VOID_STALKER`  | 2       | Void Stalker  | `{baseURI}2.json` |

**Key Functions**

| Function                        | Access | Description                                                                  |
| ------------------------------- | ------ | ---------------------------------------------------------------------------- |
| `mint(typeId)`                  | public | Mints one character NFT; one per wallet per type; token URI set at mint time |
| `hasMintedType(wallet, typeId)` | view   | Returns whether a wallet has minted a specific character type                |

**Custom Errors:** `TokenVerseNFT__InvalidType`, `TokenVerseNFT__AlreadyMinted`

**Events:** `NFTMinted(address indexed to, uint256 indexed tokenId, uint256 typeId)`

> Four overrides resolve diamond inheritance between `ERC721`, `ERC721URIStorage`, and `ERC721Enumerable`: `tokenURI`, `supportsInterface`, `_update`, `_increaseBalance`.

---

## Frontend

**Live:** [https://token-verse-chi.vercel.app/](https://token-verse-chi.vercel.app/)

**Stack:**  
React 19 + Vite 8 · Wagmi v2 · RainbowKit v2 · viem · TanStack Query v5 · Recharts · Tailwind CSS v3

**Provider tree** (`frontend/src/main.jsx`):  
 `WagmiProvider` → `QueryClientProvider` → `RainbowKitProvider` → `BrowserRouter`

**Routes**

| Route        | Page      | Description                                                                             |
| ------------ | --------- | --------------------------------------------------------------------------------------- |
| `/`          | Compare   | **Default.** Token standards comparison dashboard                                       |
| `/compare`   | Compare   | Standards comparison: decision tree, gas chart, architecture visualizer, tradeoff table |
| `/erc20`     | ERC20     | TVG faucet claim, balance display                                                       |
| `/erc721`    | ERC721    | Character gallery, mint by type, wallet holdings                                        |
| `/erc1155`   | ERC1155   | Token showcase grid with supply info                                                    |
| `/inventory` | Inventory | Per-wallet ERC-1155 holdings                                                            |
| `/mint-lab`  | MintLab   | Owner mint (single/batch), gift Dragon Sword                                            |

**Key files**

- `frontend/src/constants/contracts.js` — single source of truth. Exports contract addresses, ABIs, and the `TOKENS` metadata array for all five ERC-1155 token types. Update addresses here after every deploy.
- `frontend/src/wagmi.config.js` — explicit transports for Sepolia. Without explicit transports, wagmi silently omits them, causing `to: None` errors on `eth_call`.

---

## Standards Comparison

The `/compare` dashboard answers: _which standard should you use and why?_

| Property                    | ERC-20              | ERC-721                        | ERC-1155                             |
| --------------------------- | ------------------- | ------------------------------ | ------------------------------------ |
| Token model                 | Balance per address | Owner per token ID             | Balance per (address, ID)            |
| Fungibility                 | Fully fungible      | Non-fungible                   | Per-ID (either)                      |
| Batch transfers             | No                  | No                             | Yes — `safeBatchTransferFrom`        |
| Gas at scale                | Linear              | Most expensive (~3.85× ERC-20) | Cheapest (~86% less than 5× ERC-721) |
| DeFi composability          | Native              | Limited (NFT markets only)     | Needs adapter                        |
| Asset provenance            | None                | Per-token transfer history     | Per-type only                        |
| Deploy gas (approx.)        | ~1.3M               | ~2.9M                          | ~2.6M                                |
| Multi-asset in one contract | One type only       | One type only                  | Any number of token IDs              |

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
git clone https://github.com/PrinceTitiya/TokenVerse
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

| Variable                        | Required by           | Notes                                                                               |
| ------------------------------- | --------------------- | ----------------------------------------------------------------------------------- |
| `LOCAL_PRIVATE_KEY`             | All `*-local` targets | Anvil default: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80` |
| `PRIVATE_KEY`                   | All Sepolia targets   | Real wallet private key                                                             |
| `SEPOLIA_RPC_URL`               | Sepolia deploy        | e.g. Alchemy or Infura endpoint                                                     |
| `ETHERSCAN_API_KEY`             | Sepolia verify        | For contract verification                                                           |
| `VITE_ERC1155_CONTRACT_ADDRESS` | Frontend              | Deployed `TokenVerse1155` address                                                   |
| `VITE_ERC20_CONTRACT_ADDRESS`   | Frontend              | Deployed `TokenVerseGold` address                                                   |
| `VITE_ERC721_CONTRACT_ADDRESS`  | Frontend              | Deployed `TokenVerseNFT` address                                                    |
| `VITE_WALLETCONNECT_PROJECT_ID` | Frontend              | From [cloud.walletconnect.com](https://cloud.walletconnect.com)                     |
| `VITE_SEPOLIA_RPC_URL`          | Frontend              | Same endpoint as `SEPOLIA_RPC_URL`                                                  |

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

Raw Forge commands for extra flags:

```shell
forge test --match-path test/ERC1155/TokenVerse1155.t.sol -vvv
forge test --match-path test/ERC20/TokenVerseGold.t.sol -vvv
forge test --match-path test/ERC721/TokenVerseNFT.t.sol -vvv
```

---

## Local Development

The production frontend targets Sepolia. To test locally against Anvil you need to make two temporary code changes — the wagmi config and the contract addresses — then revert them before committing.

### Step 1 — Start Anvil

```shell
make anvil
```

Anvil starts at `http://localhost:8545` (chain ID `31337`) and prints 10 funded test accounts with their private keys. Copy any private key from that list into `LOCAL_PRIVATE_KEY` in your `.env`.

### Step 2 — Deploy contracts to Anvil

```shell
make deploy-1155-local    # deploys TokenVerse1155
make deploy-erc20-local   # deploys TokenVerseGold
make deploy-erc721-local  # deploys TokenVerseNFT
```

Each command prints a `Deployed to:` address. Note all three.

### Step 3 — Update contract addresses

Open `frontend/src/constants/contracts.js` and replace the three address constants with the addresses from Step 2:

```js
// frontend/src/constants/contracts.js
export const TOKEN_VERSE_ERC20_ADDRESS = "0x<your-local-erc20-address>";
export const TOKEN_VERSE_ERC721_ADDRESS = "0x<your-local-erc721-address>";
export const TOKEN_VERSE_1155_ADDRESS = "0x<your-local-erc1155-address>";
```

### Step 4 — Switch wagmi config to the local chain

The production config (`frontend/src/wagmi.config.js`) only includes Sepolia. For Anvil, swap it to the `foundry` chain — wagmi's built-in preset for chain ID 31337:

```js
// frontend/src/wagmi.config.js  ← local-only change, revert before committing
import { foundry } from "wagmi/chains"; // was: sepolia

// ... keep the connectors block unchanged ...

export const wagmiConfig = createConfig({
  chains: [foundry], // was: [sepolia]
  connectors,
  transports: {
    [foundry.id]: http("http://localhost:8545"), // was: sepolia transport
  },
  ssr: false,
});
```

### Step 5 — Add Anvil to MetaMask

In MetaMask → **Add a network manually**:

| Field           | Value                   |
| --------------- | ----------------------- |
| Network name    | Anvil Local             |
| New RPC URL     | `http://localhost:8545` |
| Chain ID        | `31337`                 |
| Currency symbol | `ETH`                   |

Then **Import account** using one of the private keys printed by Anvil in Step 1 — it will have 10 000 test ETH.

### Step 6 — Start the frontend

```shell
make frontend
# → http://localhost:5173
```

Connect MetaMask to the **Anvil Local** network and the imported test account. All three contracts are live locally and the full UI works.

### Reverting for Sepolia / production

Before committing, restore the production config:

```shell
git checkout -- frontend/src/wagmi.config.js
git checkout -- frontend/src/constants/contracts.js
```

---

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

Tests live in `test/`, mirroring the `src/` layout. Each file deploys its own contract in `setUp()` with `address(this)` as owner. `vm.prank` and `makeAddr` are used for non-owner scenarios. In ERC-1155 tests, `vm.etch(user, "")` wipes any code at fuzz addresses so `onERC1155Received` hooks don't fire unexpectedly.

### ERC-1155 — `test/ERC1155/TokenVerse1155.t.sol`

| Test                              | What it verifies                                        |
| --------------------------------- | ------------------------------------------------------- |
| `testMintGold`                    | Single mint and balance                                 |
| `testBatchMint`                   | Batch mint of GOLD, GEMS, EVENT_TICKET                  |
| `testBurnGold`                    | Partial burn, remainder check                           |
| `testDismantleDragonSword`        | Sword burns → 100 Dragon Glass minted                   |
| `testCannotDismantleWithoutSword` | Revert guard for zero-sword dismantle                   |
| `testTransferGold`                | `safeTransferFrom` between addresses                    |
| `testTotalSupply`                 | Supply tracking via `ERC1155Supply`                     |
| `testClaimStarterPack`            | Faucet mints 100 GOLD + 10 GEMS + 1 unique Dragon Sword |
| `testCannotClaimStarterPackTwice` | Double-claim reverts                                    |

### ERC-20 — `test/ERC20/TokenVerseGold.t.sol`

| Test                                        | What it verifies                             |
| ------------------------------------------- | -------------------------------------------- |
| `testOwnerMint`                             | Owner can mint arbitrary amount              |
| `testNonOwnerCannotMint`                    | Non-owner mint reverts                       |
| `testFaucetClaim`                           | Faucet mints 1,000 TVG and sets `hasClaimed` |
| `testFaucetEmitsEvent`                      | `FaucetClaimed` event emitted                |
| `testFaucetDoubleClaim`                     | Second claim from same address reverts       |
| `testTransfer`                              | Direct token transfer between wallets        |
| `testApproveAndTransferFrom`                | Approve a spender and pull tokens            |
| `testTransferFromExceedingAllowanceReverts` | Over-allowance pull reverts                  |
| `testBurn`                                  | Holder burns own tokens                      |
| `testBurnFrom`                              | Approved spender burns via `burnFrom`        |
| `testNameAndSymbol`                         | Name, symbol, decimals metadata              |

### ERC-721 — `test/ERC721/TokenVerseNFT.t.sol`

| Test                                                                  | What it verifies                        |
| --------------------------------------------------------------------- | --------------------------------------- |
| `testNameAndSymbol`                                                   | Name and symbol                         |
| `testMintDragonKnight` / `testMintEmberWitch` / `testMintVoidStalker` | Each character type mints               |
| `testMintAllThreeTypesOneWallet`                                      | One wallet mints all three types        |
| `testTokenIdsIncrementSequentially`                                   | Sequential token IDs across wallets     |
| `testTokenURI*`                                                       | Correct IPFS URI per character type     |
| `testMintEmitsNFTMinted`                                              | `NFTMinted` event emitted               |
| `testMintInvalidTypeReverts`                                          | Out-of-range `typeId` reverts           |
| `testMintSameTypeTwiceReverts`                                        | Same wallet, same type → revert         |
| `testHasMintedType*`                                                  | Per-wallet per-type tracking            |
| `testTokenOfOwnerByIndex`                                             | `ERC721Enumerable` index lookup         |
| `testSafeTransferFrom`                                                | Transfer NFT to another wallet          |
| `testApproveAndTransferFrom`                                          | Token-level approve + transfer          |
| `testSetApprovalForAll`                                               | Operator-level approval                 |
| `testSupportsInterface`                                               | ERC721, Enumerable, Metadata interfaces |

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
│       │                              #   ArchitectureVisualizer, UseCaseCards, InventoryCTA, ErrorBoundary
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
├── img/                               # Token art assets
├── .github/workflows/test.yml
├── Makefile
└── foundry.toml
```

---

## Tech Stack

| Layer              | Technology                                                                       | Version                    |
| ------------------ | -------------------------------------------------------------------------------- | -------------------------- |
| Solidity           | `^0.8.26`                                                                        | —                          |
| Contract framework | [Foundry](https://book.getfoundry.sh/) (Forge, Cast, Anvil, Chisel)              | latest                     |
| Contract libraries | [OpenZeppelin Contracts](https://github.com/OpenZeppelin/openzeppelin-contracts) | v5                         |
| Frontend build     | React + [Vite](https://vitejs.dev/)                                              | React 19, Vite 8           |
| Wallet integration | [Wagmi v2](https://wagmi.sh/) + [RainbowKit v2](https://www.rainbowkit.com/)     | Wagmi 2.19, RainbowKit 2.2 |
| Chain interaction  | [viem](https://viem.sh/)                                                         | 2.51                       |
| Data fetching      | [TanStack Query](https://tanstack.com/query)                                     | v5                         |
| Charts             | [Recharts](https://recharts.org/)                                                | v3                         |
| Styling            | [Tailwind CSS v3](https://tailwindcss.com/)                                      | 3.4                        |
| Hosting            | [Vercel](https://vercel.com/)                                                    | —                          |

---

## Resources

- [Foundry Book](https://book.getfoundry.sh/)
- [OpenZeppelin Docs](https://docs.openzeppelin.com/contracts)
- [EIP-20 — ERC-20 Standard](https://eips.ethereum.org/EIPS/eip-20)
- [EIP-721 — ERC-721 Standard](https://eips.ethereum.org/EIPS/eip-721)
- [EIP-1155 — ERC-1155 Standard](https://eips.ethereum.org/EIPS/eip-1155)
- [WalletConnect Cloud](https://cloud.walletconnect.com)
- [Sepolia Testnet Faucet](https://sepoliafaucet.com/)
