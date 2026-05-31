# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

The `Makefile` wraps the most common tasks. Prefer `make` over raw `forge` commands.

```shell
# Build & test
make build
make test
make test-match T=testMintGold     # run a single test by name

# Formatting (required by CI)
make fmt                           # write in place (forge fmt)
forge fmt --check                  # CI check only

# Gas snapshot
make snapshot

# Local Ethereum node
make anvil

# Frontend
make frontend-install              # npm install inside frontend/
make frontend                      # starts Vite dev server (localhost:5173)

# Deploy (simulate = no --broadcast)
make simulate-deploy-local         # dry-run against Anvil, reads LOCAL_PRIVATE_KEY from .env
make deploy-local                  # NOTE: currently missing --broadcast in Makefile — behaves as dry-run
make simulate-deploy-sepolia       # dry-run against Sepolia
make deploy-sepolia                # broadcast + verify on Sepolia (needs ETHERSCAN_API_KEY)
```

Raw forge equivalents when you need extra flags:

```shell
forge test --match-path test/ERC1155/TokenVerse1155.t.sol -vvv
forge script script/DeployTokenVerse1155.s.sol --rpc-url http://localhost:8545 --broadcast
```

### Environment variables

`.env` is loaded automatically by `make` via `-include .env`. Required vars:

| Variable | Used by |
|---|---|
| `LOCAL_PRIVATE_KEY` | Makefile `deploy-local` / `simulate-deploy-local` |
| `PRIVATE_KEY` | Makefile `deploy-sepolia` / `simulate-deploy-sepolia` |
| `SEPOLIA_RPC_URL` | Sepolia deploy targets |
| `ETHERSCAN_API_KEY` | Contract verification on Sepolia |
| `VITE_CONTRACT_ADDRESS` | Frontend — address of the deployed `TokenVerse1155` |
| `VITE_WALLETCONNECT_PROJECT_ID` | Frontend — RainbowKit wallet connect modal |
| `VITE_SEPOLIA_RPC_URL` | Frontend — transport for Sepolia in wagmi config |

After every fresh `make deploy-local`, the contract address changes — update `VITE_CONTRACT_ADDRESS` in `.env` before using the frontend.

## Architecture

### Project roadmap

TokenVerse is planned to demonstrate ERC20, ERC721, and ERC1155 standards side-by-side. Currently only ERC1155 is implemented. New contracts go under `src/ERC20/`, `src/ERC721/`, etc. Tests and deploy scripts mirror that layout under `test/` and `script/`.

### Solidity (Foundry)

Solidity `^0.8.26`, OpenZeppelin as a git submodule. Remapping: `@openzeppelin/contracts/` → `lib/openzeppelin-contracts/contracts/`.

`TokenVerse1155` (`src/ERC1155/TokenVerse1155.sol`) is the only deployed contract. It inherits `ERC1155`, `ERC1155Supply`, and `Ownable`. The `_update` override is required to resolve the diamond-inheritance conflict between `ERC1155` and `ERC1155Supply`.

Token IDs are `uint256` constants: GOLD=1, GEMS=2, DRAGON_SWORD=3, EVENT_TICKET=4, DRAGON_GLASS=5.

Key design decisions:
- `mint` / `mintBatch` are `onlyOwner`. `burn` / `burnBatch` are callable by the holder or an approved operator — enforced via the custom `NotApproved` error because OZ's `_burn` does not enforce this internally.
- `dismantleDragonSword()` is the crafting mechanic: burns 1 DRAGON_SWORD → mints 100 DRAGON_GLASS. This is the pattern to replicate for future crafting recipes.

Token metadata lives in `metadata/1.json`–`5.json`. The base URI uses the ERC1155 `{id}` template (`ipfs://.../{id}.json`); `uri()` returns the template unchanged for every token ID — substitution is done client-side per the spec.

### Tests

Tests live in `test/ERC1155/TokenVerse1155.t.sol`. The contract deploys `TokenVerse1155` in `setUp()` with `address(this)` as owner. Use `vm.prank(user)` for non-owner calls; `makeAddr("user1")` / `makeAddr("user2")` for named addresses.

### Frontend

React + Vite app in `frontend/`. Stack: Wagmi v2, RainbowKit v2, viem, TanStack Query, Tailwind CSS v3.

Provider order in `main.jsx`: `WagmiProvider` → `QueryClientProvider` → `RainbowKitProvider` → `BrowserRouter`.

**`frontend/src/constants/contracts.js`** — single source of truth for the frontend. Exports `TOKEN_VERSE_ADDRESS`, `TOKEN_VERSE_ABI` (hand-maintained fragment — must be updated manually if the contract interface changes), `TOKENS` (metadata array for all 5 tokens), and `RARITY_CONFIG` (Tailwind class maps keyed by rarity string).

**`frontend/src/wagmi.config.js`** — explicit `transports` are required for both Sepolia and the local Anvil chain (id 31337). Without them, wagmi's `getDefaultConfig` may silently omit the transport, causing `to: None` errors on Anvil `eth_call` requests.

### CI

GitHub Actions (`.github/workflows/test.yml`) runs `forge fmt --check`, `forge build --sizes`, and `forge test -vvv` on every push and PR.
