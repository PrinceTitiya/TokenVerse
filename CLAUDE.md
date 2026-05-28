# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```shell
# Build
forge build

# Run all tests
forge test

# Run tests with verbose output (recommended during development)
forge test -vvv

# Run a single test by name
forge test --match-test testMintGold -vvv

# Run all tests in a specific file
forge test --match-path test/ERC1155/TokenVerse1155.t.sol -vvv

# Format code (required by CI)
forge fmt

# Check formatting without writing (CI uses this)
forge fmt --check

# Gas snapshot
forge snapshot

# Deploy to a local anvil node
forge script script/DeployTokenVerse1155.s.sol --rpc-url http://localhost:8545 --broadcast

# Deploy to a live network (e.g. Sepolia) — requires PRIVATE_KEY env var
forge script script/DeployTokenVerse1155.s.sol --rpc-url $SEPOLIA_RPC_URL --broadcast --verify

# Local Ethereum node
anvil
```

## Architecture

This is a Foundry project using Solidity `^0.8.26` and OpenZeppelin contracts as a git submodule.

**Remapping:** `@openzeppelin/contracts/` maps to `lib/openzeppelin-contracts/contracts/` — use this import path in all contracts.

### Contract structure

`TokenVerse1155` (`src/ERC1155/TokenVerse1155.sol`) is the only deployed contract so far. It inherits from three OZ contracts: `ERC1155`, `ERC1155Supply`, and `Ownable`. The `_update` override is required to resolve the diamond-inheritance conflict between `ERC1155` and `ERC1155Supply`.

Token IDs are declared as `uint256` constants (GOLD=1, GEMS=2, DRAGON_SWORD=3, EVENT_TICKET=4, DRAGON_GLASS=5). The key custom mechanic is `dismantleDragonSword()`: burns 1 DRAGON_SWORD from `msg.sender` and mints 100 DRAGON_GLASS in return — a crafting pattern to replicate for future mechanics.

`mint` and `mintBatch` are `onlyOwner`. `burn` and `burnBatch` are callable by the token holder or an approved operator, enforced via the custom `NotApproved` error — OZ ERC1155 does not enforce this on `_burn` internally.

### Metadata

Token metadata lives in `metadata/` as `1.json`–`5.json`. The base URI in the constructor uses the ERC1155 `{id}` template:

```
ipfs://bafybeiddzghzwimp3nbwch6mqd4h3apqfah24hb2tbwwhdepukby6io5ni/{id}.json
```

`uri()` returns this template unchanged for every token ID — `{id}` substitution is done client-side per the ERC1155 spec. Raw IPFS gateway URLs for each token image are in `CID.txt`.

### Test structure

Tests live in `test/ERC1155/TokenVerse1155.t.sol`. The test contract deploys `TokenVerse1155` in `setUp()` and sets itself as owner (`address(this)`). Named test addresses are created with `makeAddr("user1")` / `makeAddr("user2")`. Use `vm.prank(user)` to simulate calls from non-owner addresses.

### Roadmap context

The project is planned to expand with ERC20, ERC721, gas comparison tooling, and a React frontend (Wagmi + RainbowKit). New contracts should go under `src/ERC20/`, `src/ERC721/`, etc., following the same directory convention. Tests and deploy scripts should mirror that layout under `test/` and `script/`.

### CI

GitHub Actions (`.github/workflows/test.yml`) runs `forge fmt --check`, `forge build --sizes`, and `forge test -vvv` on every push and PR.
