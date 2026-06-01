-include .env

.PHONY: build test fmt snapshot anvil frontend frontend-install \
        simulate-deploy-1155-local simulate-deploy-1155-sepolia \
        deploy-1155-local deploy-1155-sepolia \
        simulate-deploy-erc20-local simulate-deploy-erc20-sepolia \
        deploy-erc20-local deploy-erc20-sepolia \
        simulate-deploy-erc721-local simulate-deploy-erc721-sepolia \
        deploy-erc721-local deploy-erc721-sepolia \
        simulate-mint-1155-local mint-1155-local

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
	forge script script/ERC1155/DeployTokenVerse1155.s.sol \
		--rpc-url http://localhost:8545 \
		--private-key $(LOCAL_PRIVATE_KEY) \
		-vvv

simulate-deploy-1155-sepolia:
	forge script script/ERC1155/DeployTokenVerse1155.s.sol \
		--rpc-url $(SEPOLIA_RPC_URL) \
		--private-key $(PRIVATE_KEY) \
		-vvv

# ── Mint ─────────────────────────────────────────────────────────────────────
simulate-mint-1155-local:
	forge script script/ERC1155/MintTokenVerse1155.s.sol \
		--rpc-url http://localhost:8545 \
		--private-key $(LOCAL_PRIVATE_KEY) \
		-vvv

mint-1155-local:
	forge script script/ERC1155/MintTokenVerse1155.s.sol \
		--rpc-url http://localhost:8545 \
		--private-key $(LOCAL_PRIVATE_KEY) \
		--broadcast \
		-vvv

# ── Deploy ────────────────────────────────────────────────────────────────────
deploy-1155-local:
	forge script script/ERC1155/DeployTokenVerse1155.s.sol \
		--rpc-url http://localhost:8545 \
		--private-key $(LOCAL_PRIVATE_KEY) \
		--broadcast \
		-vvv

deploy-1155-sepolia:
	forge script script/ERC1155/DeployTokenVerse1155.s.sol \
		--rpc-url $(SEPOLIA_RPC_URL) \
		--private-key $(PRIVATE_KEY) \
		--broadcast \
		--verify \
		--etherscan-api-key $(ETHERSCAN_API_KEY) \
		-vvv

# ── ERC20: TokenVerseGold ─────────────────────────────────────────────────────
simulate-deploy-erc20-local:
	forge script script/ERC20/DeployTokenVerseGold.s.sol \
		--rpc-url http://localhost:8545 \
		--private-key $(LOCAL_PRIVATE_KEY) \
		-vvv

simulate-deploy-erc20-sepolia:
	forge script script/ERC20/DeployTokenVerseGold.s.sol \
		--rpc-url $(SEPOLIA_RPC_URL) \
		--private-key $(PRIVATE_KEY) \
		-vvv

deploy-erc20-local:
	forge script script/ERC20/DeployTokenVerseGold.s.sol \
		--rpc-url http://localhost:8545 \
		--private-key $(LOCAL_PRIVATE_KEY) \
		--broadcast \
		-vvv

deploy-erc20-sepolia:
	forge script script/ERC20/DeployTokenVerseGold.s.sol \
		--rpc-url $(SEPOLIA_RPC_URL) \
		--private-key $(PRIVATE_KEY) \
		--broadcast \
		--verify \
		--etherscan-api-key $(ETHERSCAN_API_KEY) \
		-vvv

# ── ERC721: TokenVerseNFT ─────────────────────────────────────────────────────
simulate-deploy-erc721-local:
	forge script script/ERC721/DeployTokenVerseNFT.s.sol \
		--rpc-url http://localhost:8545 \
		--private-key $(LOCAL_PRIVATE_KEY) \
		-vvv

simulate-deploy-erc721-sepolia:
	forge script script/ERC721/DeployTokenVerseNFT.s.sol \
		--rpc-url $(SEPOLIA_RPC_URL) \
		--private-key $(PRIVATE_KEY) \
		-vvv

deploy-erc721-local:
	forge script script/ERC721/DeployTokenVerseNFT.s.sol \
		--rpc-url http://localhost:8545 \
		--private-key $(LOCAL_PRIVATE_KEY) \
		--broadcast \
		-vvv

deploy-erc721-sepolia:
	forge script script/ERC721/DeployTokenVerseNFT.s.sol \
		--rpc-url $(SEPOLIA_RPC_URL) \
		--private-key $(PRIVATE_KEY) \
		--broadcast \
		--verify \
		--etherscan-api-key $(ETHERSCAN_API_KEY) \
		-vvv
