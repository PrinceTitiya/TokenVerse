# TokenVerse

An educational blockchain project demonstrating Ethereum token standards through real smart contract implementations. Built with Foundry and OpenZeppelin.

> **Goal:** Answer the question — *"Why do different token standards exist in Ethereum?"*

---

## Project Vision

TokenVerse is an interactive learning and demonstration platform that explains ERC20, ERC721, and ERC1155 through real smart contracts and hands-on interactions — minting, transferring, burning, and comparing gas efficiency across standards.

| Feature         | ERC20   | ERC721 | ERC1155   |
|-----------------|---------|--------|-----------|
| Fungible        | Yes     | No     | Both      |
| NFTs            | No      | Yes    | Yes       |
| Batch Transfer  | No      | No     | Yes       |
| Gas Efficiency  | Medium  | Low    | High      |
| Gaming Friendly | Limited | Medium | Excellent |

---

## What's Built

| Phase | Scope | Status |
|-------|-------|--------|
| 1 | ERC1155 — Contract + Frontend | Done |
| 2 | ERC20 — Contract + Frontend | Contract done, approve/transferFrom demo pending |
| 3 | ERC721 — Contract + Frontend | Done |
| 4 | Comparison Dashboard | Pending |
| 5 | Deploy + Polish (Sepolia) | Pending |

---

## Contracts

### ERC1155 — `TokenVerse1155`

A multi-token contract with a gaming-inventory theme, featuring five token types and a crafting mechanic.

**Contract:** `src/ERC1155/TokenVerse1155.sol`  
**Inherits:** `ERC1155`, `ERC1155Supply`, `Ownable`

**Token IDs**

| ID | Token        | Type          |
|----|--------------|---------------|
| 1  | GOLD         | Fungible      |
| 2  | GEMS         | Fungible      |
| 3  | DRAGON_SWORD | NFT           |
| 4  | EVENT_TICKET | Semi-fungible |
| 5  | DRAGON_GLASS | Fungible      |

**Key Functions**

| Function | Access | Description |
|----------|--------|-------------|
| `mint(to, id, amount)` | `onlyOwner` | Mint a single token type |
| `mintBatch(to, ids[], amounts[])` | `onlyOwner` | Batch mint multiple types in one tx |
| `burn(from, id, amount)` | holder or approved | Burn a single token type |
| `burnBatch(from, ids[], amounts[])` | holder or approved | Batch burn |
| `dismantleDragonSword()` | holder | Crafting: burns 1 Dragon Sword → mints 100 Dragon Glass |

Metadata URI: `https://tokenverse.xyz/metadata/{id}.json` (ERC1155 `{id}` template, substituted client-side)

---

### ERC20 — `TokenVerseGold`

A fungible token demonstrating the standard approval/transfer flow, with a public faucet for live demos.

**Contract:** `src/ERC20/TokenVerseGold.sol`  
**Inherits:** `ERC20`, `ERC20Burnable`, `Ownable`  
**Symbol:** `TVG` · **Decimals:** 18

**Key Functions**

| Function | Access | Description |
|----------|--------|-------------|
| `mint(address, uint256)` | `onlyOwner` | Mint TVG to any address |
| `faucet()` | public | Mints 1 000 TVG to caller; one claim per address, 100 total cap |
| `burn(uint256)` | holder | Burn caller's own TVG |
| `burnFrom(address, uint256)` | approved spender | Burn from another address with allowance |

**Faucet rules:** `TokenVerseGold__AlreadyClaimed` if the address has already claimed. `TokenVerseGold__FaucetDepleted` after 100 global claims.

---

### ERC721 — `TokenVerseNFT`

A character-NFT collection demonstrating unique ownership, IPFS metadata, and per-type mint limits.

**Contract:** `src/ERC721/TokenVerseNFT.sol`  
**Inherits:** `ERC721`, `ERC721URIStorage`, `ERC721Enumerable`, `Ownable`  
**Symbol:** `TVNFT` · **Max Supply:** 50

**Character Types**

| ID | Character    |
|----|--------------|
| 0  | Dragon Knight |
| 1  | Ember Witch  |
| 2  | Void Stalker |

**Key Functions**

| Function | Access | Description |
|----------|--------|-------------|
| `mint(typeId)` | public | Mints one character NFT of the given type; one per wallet per type |
| `hasMintedType(wallet, typeId)` | view | Returns whether a wallet has minted a specific type |

**Mint rules:** `TokenVerseNFT__InvalidType` if `typeId >= 3`. `TokenVerseNFT__AlreadyMinted` if the caller already holds that type. `TokenVerseNFT__MaxSupplyReached` at 50 total tokens.  
**Metadata:** IPFS — `ipfs://bafybeihrz5ifacb77eu7dvhesuhdougxkecasoijmvk3vw7gm425vd4kve/{typeId}.json`

---

## Test Suites

Tests are written in Foundry. Each contract deploys itself in `setUp()` with `address(this)` as owner. `vm.prank` and `makeAddr` are used for non-owner scenarios.

### ERC1155 — `test/ERC1155/TokenVerse1155.t.sol`

| Test | Description |
|------|-------------|
| `testMintGold` | Single mint and balance verification |
| `testBatchMint` | Batch mint of GOLD, GEMS, and EVENT_TICKET |
| `testBurnGold` | Burn partial balance and verify remainder |
| `testDismantleDragonSword` | Crafting: sword burns, Dragon Glass mints |
| `testCannotDismantleWithoutSword` | Revert guard for zero-sword dismantle |
| `testTransferGold` | `safeTransferFrom` between two addresses |
| `testTotalSupply` | Supply tracking via `ERC1155Supply` |

### ERC20 — `test/ERC20/TokenVerseGold.t.sol`

| Test | Description |
|------|-------------|
| `testOwnerMint` | Owner can mint arbitrary amount |
| `testNonOwnerCannotMint` | Non-owner mint reverts |
| `testFaucetClaim` | Faucet mints 1 000 TVG and sets `hasClaimed` |
| `testFaucetEmitsEvent` | `FaucetClaimed` event is emitted |
| `testFaucetDoubleClaim` | Second claim from same address reverts |
| `testFaucetDepleted` | 101st claim reverts after 100 global claims |
| `testTransfer` | Direct token transfer between wallets |
| `testApproveAndTransferFrom` | Approve a spender and pull tokens |
| `testTransferFromExceedingAllowanceReverts` | Over-allowance pull reverts |
| `testBurn` | Holder burns own tokens |
| `testBurnFrom` | Approved spender burns via `burnFrom` |
| `testNameAndSymbol` | Metadata — name, symbol, decimals |

### ERC721 — `test/ERC721/TokenVerseNFT.t.sol`

| Test | Description |
|------|-------------|
| `testNameAndSymbol` | Metadata — name and symbol |
| `testConstants` | Type IDs and max supply constants |
| `testMintDragonKnight` / `testMintEmberWitch` / `testMintVoidStalker` | Mint each character type |
| `testMintAllThreeTypesOneWallet` | One wallet mints all three types |
| `testTokenIdsIncrementSequentially` | Token IDs are sequential across wallets |
| `testTokenURI*` | IPFS URI set correctly per character type |
| `testMintEmitsNFTMinted` | `NFTMinted` event emitted on mint |
| `testMintInvalidTypeReverts` | Out-of-range type ID reverts |
| `testMintSameTypeTwiceReverts` | Second mint of same type from same wallet reverts |
| `testMaxSupplyReachedReverts` | 51st mint reverts at cap of 50 |
| `testHasMintedType*` | Per-wallet per-type tracking |
| `testTokenOfOwnerByIndex` | `ERC721Enumerable` index lookup |
| `testSafeTransferFrom` | Transfer NFT to another wallet |
| `testApproveAndTransferFrom` | Token-level approve + transfer |
| `testSetApprovalForAll` | Operator-level approval |
| `testSupportsInterface` | ERC721, ERC721Enumerable, ERC721Metadata interfaces |

---

## Frontend

React + Vite app in `frontend/`. Stack: **Wagmi v2**, **RainbowKit v2**, **viem**, **TanStack Query**, **Tailwind CSS v3**.

| Route | Page | Description |
|-------|------|-------------|
| `/` | Home | Token showcase — ERC1155 token grid |
| `/inventory` | Inventory | Per-wallet ERC1155 holdings |
| `/mint-lab` | MintLab | Mint single/batch, dismantle Dragon Sword |
| `/erc20` | ERC20 | Faucet claim, TVG balance display |
| `/erc721` | ERC721 | Character NFT gallery, mint by type, wallet holdings |

**`frontend/src/constants/contracts.js`** is the single source of truth for ABIs and addresses. Update it after every fresh local deploy.

---

## Tech Stack

- **Smart Contracts:** Solidity `^0.8.26`
- **Framework:** [Foundry](https://book.getfoundry.sh/) (Forge, Cast, Anvil, Chisel)
- **Libraries:** [OpenZeppelin Contracts](https://github.com/OpenZeppelin/openzeppelin-contracts)
  - ERC1155: `ERC1155`, `ERC1155Supply`, `Ownable`
  - ERC20: `ERC20`, `ERC20Burnable`, `Ownable`
  - ERC721: `ERC721`, `ERC721URIStorage`, `ERC721Enumerable`, `Ownable`
- **Frontend:** React, Vite, Wagmi v2, RainbowKit v2, viem, TanStack Query, Tailwind CSS v3

---

## Getting Started

### Prerequisites

Install Foundry:

```shell
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

### Install Dependencies

```shell
forge install
```

### Build

```shell
make build
# or: forge build
```

### Test

```shell
make test
# or: forge test -vvv
```

Run a single test by name:

```shell
make test-match T=testMintGold
```

### Format

```shell
make fmt
# CI check only: forge fmt --check
```

### Gas Snapshot

```shell
make snapshot
```

### Local Ethereum Node

```shell
make anvil
```

### Deploy Locally (Anvil)

```shell
# ERC1155
make deploy-1155-local

# ERC20
make deploy-erc20-local

# ERC721
make deploy-erc721-local
```

After every fresh local deploy, update the corresponding `VITE_*_CONTRACT_ADDRESS` in `frontend/.env.local`.

### Frontend

```shell
make frontend-install   # first time only
make frontend           # starts Vite dev server at localhost:5173
```

---

## Environment Variables

`.env` is loaded automatically by `make`. Required vars:

| Variable | Used by |
|----------|---------|
| `LOCAL_PRIVATE_KEY` | All `*-local` deploy/mint targets |
| `PRIVATE_KEY` | All Sepolia deploy targets |
| `SEPOLIA_RPC_URL` | Sepolia deploy targets |
| `ETHERSCAN_API_KEY` | Contract verification on Sepolia |
| `VITE_ERC1155_CONTRACT_ADDRESS` | Frontend — deployed `TokenVerse1155` address |
| `VITE_ERC20_CONTRACT_ADDRESS` | Frontend — deployed `TokenVerseGold` address |
| `VITE_ERC721_CONTRACT_ADDRESS` | Frontend — deployed `TokenVerseNFT` address |
| `VITE_WALLETCONNECT_PROJECT_ID` | Frontend — RainbowKit wallet connect modal |
| `VITE_SEPOLIA_RPC_URL` | Frontend — transport for Sepolia in wagmi config |

---

## Project Structure

```
TokenVerse/
├── src/
│   ├── ERC1155/
│   │   └── TokenVerse1155.sol       # Multi-token gaming contract
│   ├── ERC20/
│   │   └── TokenVerseGold.sol       # Fungible token with faucet
│   └── ERC721/
│       └── TokenVerseNFT.sol        # Character NFT collection
├── test/
│   ├── ERC1155/
│   │   └── TokenVerse1155.t.sol
│   ├── ERC20/
│   │   └── TokenVerseGold.t.sol
│   └── ERC721/
│       └── TokenVerseNFT.t.sol
├── script/
│   ├── ERC1155/DeployTokenVerse1155.s.sol
│   ├── ERC20/DeployTokenVerseGold.s.sol
│   └── ERC721/DeployTokenVerseNFT.s.sol
├── frontend/
│   └── src/
│       ├── pages/                   # Home, Inventory, MintLab, ERC20, ERC721
│       ├── constants/contracts.js   # ABIs + addresses (single source of truth)
│       └── wagmi.config.js
├── metadata/                        # ERC1155 JSON metadata (1–5)
├── lib/
│   ├── openzeppelin-contracts/
│   └── forge-std/
├── Makefile
└── foundry.toml
```

---

## Roadmap

- [x] ERC1155 — multi-token gaming contract + full test suite
- [x] ERC1155 — frontend (Home, MintLab, Inventory pages)
- [x] ERC20 — fungible token with faucet + full test suite
- [x] ERC20 — frontend (faucet claim, balance display)
- [x] ERC721 — character NFT contract with IPFS metadata + full test suite
- [x] ERC721 — frontend (gallery, mint, holdings)
- [ ] ERC20 — approve + transferFrom demo section in frontend
- [ ] Comparison Dashboard (gas visualizer, feature matrix, use-case cards)
- [ ] Unified ownership view (TVG + ERC721 + ERC1155 in one page)
- [ ] Deploy all 3 contracts to Sepolia + verify on Etherscan
- [ ] Deploy frontend to Vercel

---

## Resources

- [Foundry Book](https://book.getfoundry.sh/)
- [OpenZeppelin Docs](https://docs.openzeppelin.com/contracts)
- [ERC1155 Standard (EIP-1155)](https://eips.ethereum.org/EIPS/eip-1155)
- [ERC721 Standard (EIP-721)](https://eips.ethereum.org/EIPS/eip-721)
- [ERC20 Standard (EIP-20)](https://eips.ethereum.org/EIPS/eip-20)
