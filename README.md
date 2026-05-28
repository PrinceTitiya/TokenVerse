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

## Current Implementation

### ERC1155 — `TokenVerse1155`

A multi-token contract with a gaming-inventory theme, featuring five token types and a unique crafting mechanic.

**Token IDs**

| ID | Token         | Type          |
|----|---------------|---------------|
| 1  | GOLD          | Fungible      |
| 2  | GEMS          | Fungible      |
| 3  | DRAGON_SWORD  | NFT           |
| 4  | EVENT_TICKET  | Semi-fungible |
| 5  | DRAGON_GLASS  | Fungible      |

**Key Features**

- `mint(to, id, amount)` — single token mint (owner only)
- `mintBatch(to, ids[], amounts[])` — batch mint multiple types in one tx (owner only)
- `burn(from, id, amount)` — single burn (caller or approved)
- `burnBatch(from, ids[], amounts[])` — batch burn
- `dismantleDragonSword()` — crafting mechanic: burns 1 Dragon Sword and mints 100 Dragon Glass
- `ERC1155Supply` extension — tracks `totalSupply` per token ID
- Metadata URI: `https://tokenverse.xyz/metadata/{id}.json`

**Contract:** `src/ERC1155/TokenVerse1155.sol`

---

## Test Suite

Tests are written in Foundry and cover:

| Test | Description |
|------|-------------|
| `testMintGold` | Single mint and balance verification |
| `testBatchMint` | Batch mint of GOLD, GEMS, and EVENT_TICKET |
| `testBurnGold` | Burn partial balance and verify remainder |
| `testDismantleDragonSword` | Crafting mechanic — sword burns, glass mints |
| `testCannotDismantleWithoutSword` | Revert guard for zero-sword dismantle |
| `testTransferGold` | `safeTransferFrom` between two addresses |
| `testTotalSupply` | Supply tracking via ERC1155Supply |

**Test file:** `test/ERC1155/TokenVerse1155.t.sol`

---

## Tech Stack

- **Smart Contracts:** Solidity `^0.8.24`
- **Framework:** [Foundry](https://book.getfoundry.sh/) (Forge, Cast, Anvil, Chisel)
- **Libraries:** [OpenZeppelin Contracts](https://github.com/OpenZeppelin/openzeppelin-contracts)
  - `ERC1155`, `ERC1155Supply`, `Ownable`

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
forge build
```

### Test

```shell
forge test
```

### Test with verbose output

```shell
forge test -vv
```

### Gas Snapshot

```shell
forge snapshot
```

### Format

```shell
forge fmt
```

### Local Node

```shell
anvil
```

### Deploy

```shell
forge script script/<ScriptName>.s.sol --rpc-url <your_rpc_url> --private-key <your_private_key>
```

---

## Project Structure

```
TokenVerse/
├── src/
│   └── ERC1155/
│       └── TokenVerse1155.sol      # Multi-token gaming contract
├── test/
│   └── ERC1155/
│       └── TokenVerse1155.t.sol    # Foundry test suite
├── lib/
│   ├── openzeppelin-contracts/
│   └── forge-std/
└── foundry.toml
```

---

## Roadmap

- [x] ERC1155 contract with gaming inventory + crafting mechanic
- [ ] ERC20 — fungible token (stablecoin / governance token demo)
- [ ] ERC721 — NFT contract with metadata and gallery
- [ ] Gas comparison across all three standards
- [ ] Frontend (React + Wagmi + RainbowKit)
- [ ] Deployment to Sepolia testnet

---

## Resources

- [Foundry Book](https://book.getfoundry.sh/)
- [OpenZeppelin Docs](https://docs.openzeppelin.com/contracts)
- [ERC1155 Standard (EIP-1155)](https://eips.ethereum.org/EIPS/eip-1155)
- [ERC721 Standard (EIP-721)](https://eips.ethereum.org/EIPS/eip-721)
- [ERC20 Standard (EIP-20)](https://eips.ethereum.org/EIPS/eip-20)
