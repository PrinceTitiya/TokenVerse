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

# Deploy ERC1155 (TokenVerse1155)
make simulate-deploy-1155-local    # dry-run against Anvil
make deploy-1155-local             # broadcast to Anvil
make simulate-deploy-1155-sepolia  # dry-run against Sepolia
make deploy-sepolia                # broadcast + verify on Sepolia (ERC1155)

# Deploy ERC20 (TokenVerseGold)
make simulate-deploy-erc20-local   # dry-run against Anvil
make deploy-erc20-local            # broadcast to Anvil
make simulate-deploy-erc20-sepolia # dry-run against Sepolia
make deploy-erc20-sepolia          # broadcast + verify on Sepolia

# Mint (ERC1155 local only)
make simulate-mint-1155-local
make mint-1155-local
```

Raw forge equivalents when you need extra flags:

```shell
forge test --match-path test/ERC1155/TokenVerse1155.t.sol -vvv
forge test --match-path test/ERC20/TokenVerseGold.t.sol -vvv
forge script script/DeployTokenVerse1155.s.sol --rpc-url http://localhost:8545 --broadcast
```

### Environment variables

`.env` is loaded automatically by `make` via `-include .env`. Required vars:

| Variable | Used by |
|---|---|
| `LOCAL_PRIVATE_KEY` | All `*-local` deploy/mint targets |
| `PRIVATE_KEY` | All Sepolia deploy targets |
| `SEPOLIA_RPC_URL` | Sepolia deploy targets |
| `ETHERSCAN_API_KEY` | Contract verification on Sepolia |
| `VITE_ERC1155_CONTRACT_ADDRESS` | Frontend — deployed `TokenVerse1155` address |
| `VITE_ERC20_CONTRACT_ADDRESS` | Frontend — deployed `TokenVerseGold` address |
| `VITE_WALLETCONNECT_PROJECT_ID` | Frontend — RainbowKit wallet connect modal |
| `VITE_SEPOLIA_RPC_URL` | Frontend — transport for Sepolia in wagmi config |

After every fresh local deploy, the contract address changes — update the corresponding `VITE_*_CONTRACT_ADDRESS` in `frontend/.env.local` before using the frontend.

## Architecture

### Project roadmap

TokenVerse demonstrates ERC20, ERC721, and ERC1155 standards side-by-side. ERC1155 and ERC20 are implemented. New contracts follow the pattern: `src/ERC20/`, `src/ERC721/`, etc., with mirrored layout under `test/` and `script/`.

| Phase | Scope | Status |
|-------|-------|--------|
| 1 | ERC1155 — Contract + Frontend | Done |
| 2 | ERC20 — Contract + Frontend | Contract done, frontend in progress |
| 3 | ERC721 — Contract + Frontend | Pending |
| 4 | Comparison Dashboard | Pending |
| 5 | Deploy + Polish | Pending |

### Solidity (Foundry)

Solidity `^0.8.26`, OpenZeppelin as a git submodule. Remapping: `@openzeppelin/contracts/` → `lib/openzeppelin-contracts/contracts/`.

**`TokenVerse1155`** (`src/ERC1155/TokenVerse1155.sol`) inherits `ERC1155`, `ERC1155Supply`, and `Ownable`. The `_update` override is required to resolve the diamond-inheritance conflict between `ERC1155` and `ERC1155Supply`.

- Token IDs are `uint256` constants: GOLD=1, GEMS=2, DRAGON_SWORD=3, EVENT_TICKET=4, DRAGON_GLASS=5.
- `mint` / `mintBatch` are `onlyOwner`. `burn` / `burnBatch` are callable by the holder or an approved operator — enforced via the custom `NotApproved` error because OZ's `_burn` does not enforce this internally.
- `dismantleDragonSword()` is the crafting mechanic: burns 1 DRAGON_SWORD → mints 100 DRAGON_GLASS. This is the pattern to replicate for future crafting recipes.
- Token metadata lives in `metadata/1.json`–`5.json`. The base URI uses the ERC1155 `{id}` template; `uri()` returns the template unchanged — substitution is done client-side per the spec.

**`TokenVerseGold`** (`src/ERC20/TokenVerseGold.sol`) inherits `ERC20`, `ERC20Burnable`, and `Ownable`. Symbol: `TVG`.

- `mint(address, uint256)` is `onlyOwner`.
- `faucet()` is public: mints 1000 TVG to the caller once per address, with a global cap of 100 total claims. Errors: `TokenVerseGold__AlreadyClaimed`, `TokenVerseGold__FaucetDepleted`.

### Tests

Tests mirror the `src/` layout under `test/`. Each contract deploys itself in `setUp()` with `address(this)` as owner. Use `vm.prank(user)` for non-owner calls; `makeAddr("user1")` for named addresses.

- `test/ERC1155/TokenVerse1155.t.sol`
- `test/ERC20/TokenVerseGold.t.sol`

### Frontend

React + Vite app in `frontend/`. Stack: Wagmi v2, RainbowKit v2, viem, TanStack Query, Tailwind CSS v3.

Provider order in `main.jsx`: `WagmiProvider` → `QueryClientProvider` → `RainbowKitProvider` → `BrowserRouter`.

Routes: `/` (ERC1155), `/inventory`, `/mint-lab`, `/erc20`.

**`frontend/src/constants/contracts.js`** — single source of truth for the frontend. Exports `TOKEN_VERSE_1155_ADDRESS`, `TOKEN_VERSE_ERC20_ADDRESS`, `TOKEN_VERSE_ABI` (ERC1155), `TOKEN_VERSE_GOLD_ABI` (ERC20), `TOKENS` (metadata array for all 5 ERC1155 tokens), and `RARITY_CONFIG`. The ABI fragments are hand-maintained — update them manually if the contract interface changes.

**`frontend/src/wagmi.config.js`** — explicit `transports` are required for both Sepolia and the local Anvil chain (id 31337). Without them, wagmi's `getDefaultConfig` may silently omit the transport, causing `to: None` errors on Anvil `eth_call` requests.

### CI

GitHub Actions (`.github/workflows/test.yml`) runs `forge fmt --check`, `forge build --sizes`, and `forge test -vvv` on every push and PR.
