-include .env

.PHONY: build test fmt snapshot anvil deploy-local deploy-sepolia \
        simulate-deploy-local simulate-deploy-sepolia \
        mint-local simulate-mint-local \
        frontend frontend-install

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

simulate-deploy-local:
	forge script script/DeployTokenVerse1155.s.sol \
		--rpc-url http://localhost:8545 \
		--private-key $(LOCAL_PRIVATE_KEY) \
		 -vvv
		
simulate-deploy-sepolia:
	forge script script/DeployTokenVerse1155.s.sol \
		--rpc-url $(SEPOLIA_RPC_URL) \
		--private-key $(PRIVATE_KEY) \
		-vvv

# ── Mint ─────────────────────────────────────────────────────────────────────
simulate-mint-local:
	forge script script/MintTokenVerse1155.s.sol \
		--rpc-url http://localhost:8545 \
		--private-key $(LOCAL_PRIVATE_KEY) \
		-vvv

mint-local:
	forge script script/MintTokenVerse1155.s.sol \
		--rpc-url http://localhost:8545 \
		--private-key $(LOCAL_PRIVATE_KEY) \
		--broadcast \
		-vvv

# ── Deploy ────────────────────────────────────────────────────────────────────
deploy-local:
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
