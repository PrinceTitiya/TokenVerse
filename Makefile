-include .env

.PHONY: build test fmt snapshot anvil frontend frontend-install \
        simulate-deploy-local simulate-deploy-sepolia \
        deploy-local deploy-sepolia \
        simulate-deploy-erc20-local simulate-deploy-erc20-sepolia \
        deploy-erc20-local deploy-erc20-sepolia \
        mint-local simulate-mint-local

# ── Build & test ──────────────────────────────────────────────────────────────
build:
	forge build

test:
	forge test -vvv

test-match:
	forge test --match-test $(T) -vvv

fmt:
	forge fmt

snapshot:
	forge snapshot

# ── Frontend ──────────────────────────────────────────────────────────────────
frontend-install:
	cd frontend && npm install

frontend:
	cd frontend && npm run dev

# ── Local node ────────────────────────────────────────────────────────────────
anvil:
	anvil

# ── Simulate-Deploy ────────────────────────────────────────────────────────────────────

simulate-deploy-1155-local:
	forge script script/DeployTokenVerse1155.s.sol \
		--rpc-url http://localhost:8545 \
		--private-key $(LOCAL_PRIVATE_KEY) \
		 -vvv
		
simulate-deploy-1155-sepolia:
	forge script script/DeployTokenVerse1155.s.sol \
		--rpc-url $(SEPOLIA_RPC_URL) \
		--private-key $(PRIVATE_KEY) \
		-vvv

# ── Mint ─────────────────────────────────────────────────────────────────────
simulate-mint-1155-local:
	forge script script/MintTokenVerse1155.s.sol \
		--rpc-url http://localhost:8545 \
		--private-key $(LOCAL_PRIVATE_KEY) \
		-vvv

mint-1155-local:
	forge script script/MintTokenVerse1155.s.sol \
		--rpc-url http://localhost:8545 \
		--private-key $(LOCAL_PRIVATE_KEY) \
		--broadcast \
		-vvv

# ── Deploy ────────────────────────────────────────────────────────────────────
deploy-1155-local:
	forge script script/DeployTokenVerse1155.s.sol \
		--rpc-url http://localhost:8545 \
		--private-key $(LOCAL_PRIVATE_KEY) \
		--broadcast \
		-vvv
		
deploy-sepolia:
	forge script script/DeployTokenVerse1155.s.sol \
		--rpc-url $(SEPOLIA_RPC_URL) \
		--private-key $(PRIVATE_KEY) \
		--broadcast \
		--verify \
		--etherscan-api-key $(ETHERSCAN_API_KEY) \
		-vvv

# ── ERC20: TokenVerseGold ─────────────────────────────────────────────────────
simulate-deploy-erc20-local:
	forge script script/DeployTokenVerseGold.s.sol \
		--rpc-url http://localhost:8545 \
		--private-key $(LOCAL_PRIVATE_KEY) \
		-vvv

simulate-deploy-erc20-sepolia:
	forge script script/DeployTokenVerseGold.s.sol \
		--rpc-url $(SEPOLIA_RPC_URL) \
		--private-key $(PRIVATE_KEY) \
		-vvv

deploy-erc20-local:
	forge script script/DeployTokenVerseGold.s.sol \
		--rpc-url http://localhost:8545 \
		--private-key $(LOCAL_PRIVATE_KEY) \
		--broadcast \
		-vvv

deploy-erc20-sepolia:
	forge script script/DeployTokenVerseGold.s.sol \
		--rpc-url $(SEPOLIA_RPC_URL) \
		--private-key $(PRIVATE_KEY) \
		--broadcast \
		--verify \
		--etherscan-api-key $(ETHERSCAN_API_KEY) \
		-vvv
