import { useEffect, useState } from 'react';
import { useAccount, useReadContracts, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { TOKEN_VERSE_ERC721_ADDRESS, TOKEN_VERSE_ERC721_ABI } from '../constants/contracts';

const IPFS_GATEWAY = 'https://ipfs.io/ipfs/';

const NFT_TYPES = [
  {
    id: 0,
    name: 'Dragon Knight',
    description: 'The sole warrior of TokenVerse who forged the legendary Dragon Sword. Bearer of this NFT commands the realm\'s mightiest blade.',
    class: 'Warrior',
    element: 'Steel',
    weapon: 'Dragon Sword',
    imageCid: 'bafybeif3awzqpskc3dtsd7k562nw4ctnhubtisav7nczbmy7uzgbm4joqi',
    accent: 'border-amber-500/30 hover:border-amber-500/60',
    badgeClass: 'bg-amber-500/10 text-amber-400',
    imageBg: 'from-amber-950/60 to-gray-900',
    glow: 'hover:shadow-amber-500/20',
    mintBtn: 'bg-gradient-to-r from-amber-500 to-orange-500',
    confirmedClass: 'bg-amber-500/10 text-amber-400',
  },
  {
    id: 1,
    name: 'Ember Witch',
    description: 'Ancient fire sorceress who channels Dragon Glass into devastating flame. Her spells have turned kingdoms to ash.',
    class: 'Mage',
    element: 'Fire',
    weapon: 'Ember Staff',
    imageCid: 'bafybeieefdnvurup7fvj5d26q2o7nhmaxmw332l56qyzqityrhaarcgiza',
    accent: 'border-rose-500/30 hover:border-rose-500/60',
    badgeClass: 'bg-rose-500/10 text-rose-400',
    imageBg: 'from-rose-950/60 to-gray-900',
    glow: 'hover:shadow-rose-500/20',
    mintBtn: 'bg-gradient-to-r from-rose-500 to-orange-500',
    confirmedClass: 'bg-rose-500/10 text-rose-400',
  },
  {
    id: 2,
    name: 'Void Stalker',
    description: 'A phantom rogue who moves between transactions unseen. No vault in TokenVerse has ever held against the Void Stalker.',
    class: 'Rogue',
    element: 'Shadow',
    weapon: 'Void Daggers',
    imageCid: 'bafybeibsfifb7z5degyt7h7vwkdnzqfnx7zdy7vudmeyn7z2hqdozfefte',
    accent: 'border-purple-500/30 hover:border-purple-500/60',
    badgeClass: 'bg-purple-500/10 text-purple-400',
    imageBg: 'from-purple-950/60 to-gray-900',
    glow: 'hover:shadow-purple-500/20',
    mintBtn: 'bg-gradient-to-r from-purple-500 to-blue-500',
    confirmedClass: 'bg-purple-500/10 text-purple-400',
  },
];

/* ─── mint section ─────────────────────────────────────────── */
function MintSection() {
  const { address, isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();
  const [mintingTypeId, setMintingTypeId] = useState(null);

  const { data, isLoading, refetch } = useReadContracts({
    contracts: [
      {
        address: TOKEN_VERSE_ERC721_ADDRESS,
        abi: TOKEN_VERSE_ERC721_ABI,
        functionName: 'totalSupply',
      },
      ...NFT_TYPES.map((t) => ({
        address: TOKEN_VERSE_ERC721_ADDRESS,
        abi: TOKEN_VERSE_ERC721_ABI,
        functionName: 'hasMintedType',
        args: [address ?? '0x0000000000000000000000000000000000000000', BigInt(t.id)],
      })),
    ],
    query: { enabled: !!TOKEN_VERSE_ERC721_ADDRESS },
  });

  const totalSupply = data?.[0]?.status === 'success' ? data[0].result : null;
  const hasMinted = NFT_TYPES.map((_, i) =>
    data?.[i + 1]?.status === 'success' ? data[i + 1].result : false,
  );
  const maxSupplyReached = totalSupply != null && totalSupply >= 50n;

  const { writeContract, data: txHash, isPending, error: writeError, reset } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash: txHash });

  useEffect(() => {
    if (isConfirmed) {
      refetch();
      const t = setTimeout(() => {
        reset();
        setMintingTypeId(null);
      }, 4000);
      return () => clearTimeout(t);
    }
  }, [isConfirmed, refetch, reset]);

  function handleMint(typeId) {
    setMintingTypeId(typeId);
    writeContract({
      address: TOKEN_VERSE_ERC721_ADDRESS,
      abi: TOKEN_VERSE_ERC721_ABI,
      functionName: 'mint',
      args: [BigInt(typeId)],
    });
  }

  return (
    <div className="mb-14 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
      <div className="h-px w-full bg-gradient-to-r from-transparent via-blue-500/60 to-transparent" />

      <div className="p-8">
        <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-blue-400">
          Live Interaction
        </p>
        <h2 className="mb-1 text-xl font-bold text-white">Mint — Claim a Character NFT</h2>
        <p className="mb-6 text-sm text-gray-400">
          Public mint — any wallet can claim one of each character type while supply remains.
        </p>

        {/* supply progress */}
        <div className="mb-6 rounded-xl border border-white/5 bg-gray-900/60 p-5">
          <div className="mb-2 flex items-end justify-between">
            <p className="text-xs font-medium text-gray-500">Global Supply</p>
            <span className="text-sm font-semibold tabular-nums text-white">
              {isLoading ? (
                <span className="h-4 w-12 animate-pulse rounded bg-white/10 inline-block" />
              ) : (
                <>{totalSupply != null ? totalSupply.toString() : '—'} / 50</>
              )}
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
              style={{ width: totalSupply != null ? `${(Number(totalSupply) / 50) * 100}%` : '0%' }}
            />
          </div>
          <p className="mt-2 text-xs text-gray-600">
            {totalSupply != null ? 50 - Number(totalSupply) : '—'} NFTs remaining across all types
          </p>
        </div>

        {/* NFT type cards */}
        <div className="grid gap-5 sm:grid-cols-3">
          {NFT_TYPES.map((nftType) => {
            const alreadyMinted = isConnected && hasMinted[nftType.id];
            const isThisPending = isPending && mintingTypeId === nftType.id;
            const isThisConfirming = isConfirming && mintingTypeId === nftType.id;
            const isThisConfirmed = isConfirmed && mintingTypeId === nftType.id;

            return (
              <div
                key={nftType.id}
                className={`group flex flex-col overflow-hidden rounded-2xl border bg-gray-900 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${nftType.accent} ${nftType.glow}`}
              >
                {/* image */}
                <div className={`relative aspect-square overflow-hidden bg-gradient-to-b ${nftType.imageBg} p-5`}>
                  <img
                    src={`${IPFS_GATEWAY}${nftType.imageCid}`}
                    alt={nftType.name}
                    className="h-full w-full object-contain drop-shadow-lg transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                  <span className={`absolute right-3 top-3 rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide ${nftType.badgeClass}`}>
                    Legendary
                  </span>
                  <span className="absolute left-3 top-3 rounded-full bg-black/40 px-2 py-0.5 font-mono text-xs text-gray-400 backdrop-blur-sm">
                    Type #{nftType.id}
                  </span>
                </div>

                {/* info */}
                <div className="flex flex-1 flex-col gap-3 p-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-white">{nftType.name}</h3>
                      <span className={`rounded-full px-2 py-0.5 font-mono text-xs font-semibold ${nftType.badgeClass}`}>
                        #{nftType.id}
                      </span>
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-gray-400">{nftType.description}</p>
                  </div>

                  {/* trait chips */}
                  <div className="flex flex-wrap gap-1.5">
                    {[nftType.class, nftType.element, nftType.weapon].map((attr) => (
                      <span
                        key={attr}
                        className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-xs text-gray-400"
                      >
                        {attr}
                      </span>
                    ))}
                  </div>

                  {/* mint button */}
                  <div className="mt-auto pt-1">
                    {!isConnected ? (
                      <button
                        onClick={openConnectModal}
                        className="w-full rounded-xl bg-white py-2.5 text-xs font-bold text-gray-900 transition-all hover:bg-gray-100"
                      >
                        Connect to Mint
                      </button>
                    ) : isThisConfirmed ? (
                      <div className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-semibold ${nftType.confirmedClass}`}>
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Minted!
                      </div>
                    ) : isThisPending ? (
                      <div className="flex items-center justify-center gap-2 rounded-xl bg-amber-500/10 py-2.5 text-xs font-semibold text-amber-400">
                        <span className="h-3 w-3 animate-spin rounded-full border border-amber-400 border-t-transparent" />
                        Confirm in wallet…
                      </div>
                    ) : isThisConfirming ? (
                      <div className="flex items-center justify-center gap-2 rounded-xl bg-amber-500/10 py-2.5 text-xs font-semibold text-amber-400">
                        <span className="h-3 w-3 animate-spin rounded-full border border-amber-400 border-t-transparent" />
                        Minting…
                      </div>
                    ) : alreadyMinted ? (
                      <div className="flex items-center justify-center gap-2 rounded-xl border border-blue-500/20 bg-blue-500/5 py-2.5 text-xs font-semibold text-blue-400">
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.3" />
                          <path d="M6 4v3M6 8.5v.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                        </svg>
                        Already Minted
                      </div>
                    ) : maxSupplyReached ? (
                      <div className="flex items-center justify-center rounded-xl border border-rose-500/20 bg-rose-500/5 py-2.5 text-xs font-semibold text-rose-400">
                        Supply Exhausted
                      </div>
                    ) : (
                      <button
                        onClick={() => handleMint(nftType.id)}
                        disabled={isPending || isConfirming}
                        className={`w-full rounded-xl py-2.5 text-xs font-bold text-gray-950 transition-all duration-200 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 ${nftType.mintBtn}`}
                      >
                        Mint {nftType.name}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* write error feedback */}
        {writeError && !isPending && !isConfirmed && (
          <p className="mt-4 text-center text-xs text-rose-400">
            Transaction rejected or failed. Try again.
          </p>
        )}

        {/* function signature callout */}
        <div className="mt-6 rounded-xl border border-white/5 bg-gray-950/60 px-4 py-3">
          <p className="mb-1 text-xs text-gray-600">Calling on-chain</p>
          <div className="font-mono text-xs text-gray-300">
            <span className="text-blue-400">mint</span>
            <span className="text-gray-500">(</span>
            <span className="text-amber-300">uint256</span>
            <span className="text-gray-300"> typeId</span>
            <span className="text-gray-500">)</span>
            <span className="ml-2 text-gray-600">→ mints 1 unique NFT to msg.sender</span>
          </div>
          <div className="mt-1 font-mono text-xs text-gray-600">
            contract:{' '}
            {TOKEN_VERSE_ERC721_ADDRESS
              ? `${TOKEN_VERSE_ERC721_ADDRESS.slice(0, 8)}…${TOKEN_VERSE_ERC721_ADDRESS.slice(-6)}`
              : 'not deployed'}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ERC721() {
  return (
    <div className="min-h-[calc(100vh-5rem)] bg-gray-950 px-6 py-16">
      <div className="mx-auto max-w-7xl">

        {/* ── Hero ──────────────────────────────────────────────────── */}
        <div className="mb-14 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-blue-400">
            ERC-721 · Non-Fungible Tokens
          </p>
          <h1 className="mb-4 text-5xl font-extrabold tracking-tight text-white">
            TokenVerse{' '}
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              NFT
            </span>
          </h1>
          <p className="mx-auto max-w-2xl text-base text-gray-400">
            The standard behind every PFP collection, on-chain game asset, and digital credential.
            Mint a live ERC-721 character — each token ID is provably unique, permanently owned,
            and stored on-chain with full metadata.
          </p>

          {/* Stat pills */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            {[
              { label: 'Standard',       value: 'ERC-721'   },
              { label: 'Symbol',         value: 'TVNFT'     },
              { label: 'Max Supply',     value: '50'        },
              { label: 'Types',          value: '3'         },
              { label: 'Per wallet',     value: '1 per type'},
            ].map(({ label, value }) => (
              <div
                key={label}
                className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm"
              >
                <span className="font-bold text-white">{value}</span>
                <span className="text-gray-400">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Why ERC-721 ────────────────────────────────────────────── */}
        <div className="mb-14 text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-purple-400">
            The Standard
          </p>
          <h2 className="mb-3 text-2xl font-bold text-white">Why ERC-721?</h2>
          <p className="mx-auto mb-8 max-w-xl text-sm text-gray-400">
            Before ERC-721, there was no standard way to represent unique ownership on-chain.
            This standard made NFTs possible.
          </p>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: '🔑',
                title: 'True Uniqueness',
                body: 'Every ERC-721 token has a unique integer ID — tokenId. Two wallets can own token #1 and token #2, but never two copies of the same token. The contract enforces this at the lowest level.',
                accent: 'border-blue-500/30 hover:border-blue-500/60',
              },
              {
                icon: '📜',
                title: 'Provable Ownership',
                body: 'ownerOf(tokenId) returns the current owner — no database, no platform, no intermediary. The ledger is the source of truth. Ownership transfers atomically when safeTransferFrom emits a Transfer event.',
                accent: 'border-purple-500/30 hover:border-purple-500/60',
              },
              {
                icon: '🎟️',
                title: 'Token-Gating',
                body: 'NFT = key. Holding a specific tokenId can unlock a Discord server, a game level, a real-world event, or a governance vote. The same balanceOf() call that checks token count gates access.',
                accent: 'border-amber-500/30 hover:border-amber-500/60',
              },
              {
                icon: '⚡',
                title: 'Public Mint Faucet',
                body: 'Unlike the ERC-1155 Mint Lab which is owner-only, the TVNFT mint is open to any wallet — one of each character type per address. No deployer needed, same as production NFT drops.',
                accent: 'border-rose-500/30 hover:border-rose-500/60',
              },
            ].map(({ icon, title, body, accent }) => (
              <div
                key={title}
                className={`rounded-2xl border bg-white/[0.03] p-5 text-left transition-all duration-200 ${accent}`}
              >
                <span className="mb-3 block text-2xl">{icon}</span>
                <h3 className="mb-1.5 text-sm font-bold text-white">{title}</h3>
                <p className="text-xs leading-relaxed text-gray-400">{body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── How It Works ───────────────────────────────────────────── */}
        <div className="mb-14 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
          <div className="h-px w-full bg-gradient-to-r from-transparent via-blue-500/60 to-transparent" />

          <div className="p-8">
            <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-blue-400">
              How It Works
            </p>
            <h2 className="mb-6 text-xl font-bold text-white">ERC-721 Core Functions</h2>

            <div className="grid gap-6 md:grid-cols-3">

              {/* mint() */}
              <div className="rounded-xl border border-white/5 bg-gray-900/60 p-5">
                <div className="mb-3 flex items-center gap-2">
                  <span className="rounded-lg bg-blue-500/10 px-2.5 py-1 font-mono text-xs font-bold text-blue-400">
                    mint()
                  </span>
                  <span className="text-xs text-gray-500">Public · one per type</span>
                </div>
                <p className="mb-4 text-xs leading-relaxed text-gray-400">
                  Any wallet can call this to receive a character NFT. The contract tracks claims
                  via a{' '}
                  <span className="font-mono text-gray-300">mapping(address =&gt; mapping(uint256 =&gt; bool))</span>{' '}
                  and reverts with{' '}
                  <span className="font-mono text-gray-300">AlreadyMinted</span> on a second
                  attempt. A global cap of 50 enforces scarcity.
                </p>
                <div className="rounded-lg bg-gray-950/80 px-4 py-3 font-mono text-xs text-gray-300">
                  <span className="text-blue-400">mint</span>
                  <span className="text-gray-500">(</span>
                  <span className="text-amber-300">uint256</span>
                  <span className="text-gray-300"> typeId</span>
                  <span className="text-gray-500">)</span>
                  <br />
                  <span className="text-gray-600">// mints tokenId N → msg.sender</span>
                </div>
                <p className="mt-3 text-xs text-gray-500">
                  <span className="text-blue-400/80">_nextTokenId++</span> — each mint
                  auto-increments the global token counter.
                </p>
              </div>

              {/* safeTransferFrom() */}
              <div className="rounded-xl border border-white/5 bg-gray-900/60 p-5">
                <div className="mb-3 flex items-center gap-2">
                  <span className="rounded-lg bg-amber-500/10 px-2.5 py-1 font-mono text-xs font-bold text-amber-400">
                    safeTransferFrom()
                  </span>
                  <span className="text-xs text-gray-500">Holder</span>
                </div>
                <p className="mb-4 text-xs leading-relaxed text-gray-400">
                  Moves a specific token to a new owner. The "safe" variant calls{' '}
                  <span className="font-mono text-gray-300">onERC721Received</span> on the
                  recipient if it's a contract — preventing tokens from being permanently
                  locked in contracts that can't handle them.
                </p>
                <div className="rounded-lg bg-gray-950/80 px-4 py-3 font-mono text-xs text-gray-300">
                  <span className="text-amber-400">safeTransferFrom</span>
                  <span className="text-gray-500">(</span>
                  <br />
                  <span className="pl-4 text-amber-300">address</span>
                  <span className="text-gray-300"> from,</span>
                  <br />
                  <span className="pl-4 text-amber-300">address</span>
                  <span className="text-gray-300"> to,</span>
                  <br />
                  <span className="pl-4 text-amber-300">uint256</span>
                  <span className="text-gray-300"> tokenId</span>
                  <br />
                  <span className="text-gray-500">)</span>
                </div>
                <p className="mt-3 text-xs text-gray-500">
                  <span className="text-amber-400/80">ownerOf changes</span> atomically —
                  no intermediate state where nobody owns it.
                </p>
              </div>

              {/* approve + setApprovalForAll */}
              <div className="rounded-xl border border-white/5 bg-gray-900/60 p-5">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span className="rounded-lg bg-purple-500/10 px-2.5 py-1 font-mono text-xs font-bold text-purple-400">
                    approve()
                  </span>
                  <span className="text-xs text-gray-500">+</span>
                  <span className="rounded-lg bg-rose-500/10 px-2.5 py-1 font-mono text-xs font-bold text-rose-400">
                    setApprovalForAll()
                  </span>
                </div>
                <p className="mb-4 text-xs leading-relaxed text-gray-400">
                  Two delegation patterns. <span className="font-mono text-gray-300">approve(spender, tokenId)</span>{' '}
                  grants rights over one specific token. <span className="font-mono text-gray-300">setApprovalForAll(operator, true)</span>{' '}
                  grants an operator rights over the entire collection — how marketplaces
                  like OpenSea work.
                </p>
                <div className="rounded-lg bg-gray-950/80 px-4 py-3 font-mono text-xs text-gray-300 space-y-1">
                  <div>
                    <span className="text-purple-400">approve</span>
                    <span className="text-gray-500">(spender, 42)</span>
                  </div>
                  <div>
                    <span className="text-rose-400">setApprovalForAll</span>
                    <span className="text-gray-500">(market, true)</span>
                  </div>
                  <div className="text-gray-600">
                    {'// market can now list any token'}
                  </div>
                </div>
                <p className="mt-3 text-xs text-gray-500">
                  <span className="text-purple-400/80">Revoke any time</span> —
                  call <span className="font-mono">setApprovalForAll(market, false)</span>.
                </p>
              </div>
            </div>

            {/* special callouts */}
            <div className="mt-6 grid gap-4 md:grid-cols-2">

              {/* tokenURI callout */}
              <div className="flex items-start gap-3 rounded-xl border border-blue-500/15 bg-blue-500/5 px-5 py-4">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="mt-0.5 shrink-0 text-blue-400">
                  <rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.3" />
                  <path d="M5 6h6M5 9h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                </svg>
                <div>
                  <p className="mb-1 text-xs font-semibold text-blue-300">
                    tokenURI() — On-Chain Metadata Pointer
                  </p>
                  <p className="text-xs leading-relaxed text-gray-400">
                    Each tokenId maps to a URI returned by{' '}
                    <span className="font-mono text-gray-300">tokenURI(tokenId)</span>. This
                    contract stores the full URI on-chain via{' '}
                    <span className="font-mono text-gray-300">ERC721URIStorage</span>,
                    pointing to an IPFS JSON file with name, description, image, and
                    attributes. Marketplaces read this to display the NFT.
                  </p>
                </div>
              </div>

              {/* diamond inheritance callout */}
              <div className="flex items-start gap-3 rounded-xl border border-purple-500/15 bg-purple-500/5 px-5 py-4">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="mt-0.5 shrink-0 text-purple-400">
                  <path d="M8 2L14 8L8 14L2 8L8 2Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
                  <path d="M8 6v4M6 8h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                </svg>
                <div>
                  <p className="mb-1 text-xs font-semibold text-purple-300">
                    Diamond Inheritance — Four Overrides Required
                  </p>
                  <p className="text-xs leading-relaxed text-gray-400">
                    Inheriting <span className="font-mono text-gray-300">ERC721</span>,{' '}
                    <span className="font-mono text-gray-300">ERC721URIStorage</span>, and{' '}
                    <span className="font-mono text-gray-300">ERC721Enumerable</span>{' '}
                    together creates four ambiguous function conflicts:{' '}
                    <span className="font-mono text-gray-300">_update</span>,{' '}
                    <span className="font-mono text-gray-300">_increaseBalance</span>,{' '}
                    <span className="font-mono text-gray-300">tokenURI</span>, and{' '}
                    <span className="font-mono text-gray-300">supportsInterface</span>.
                    Each must be manually overridden with{' '}
                    <span className="font-mono text-gray-300">super</span> to chain both
                    parent implementations in the correct order.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Mint Lab ──────────────────────────────────────────────── */}
        <MintSection />

        {/* ── Where ERC-721 is used ──────────────────────────────────── */}
        <div className="text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-blue-400">
            Real World
          </p>
          <h2 className="mb-3 text-2xl font-bold text-white">Where ERC-721 Lives</h2>
          <p className="mx-auto mb-8 max-w-xl text-sm text-gray-400">
            Every project below runs the same ownerOf / safeTransferFrom interface you just learned.
          </p>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              {
                category: 'Profile Pictures',
                examples: ['BAYC', 'CryptoPunks', 'Azuki'],
                description: 'Identity-layer NFTs. The tokenId is your on-chain avatar — used as a Twitter PFP, Discord role, club membership, and status signal. Combined blue-chip market cap exceeds $2B.',
                accent: 'border-blue-500/20 hover:border-blue-500/40',
                badge: 'bg-blue-500/10 text-blue-400',
              },
              {
                category: 'Gaming & Metaverse',
                examples: ['Axie', 'Gods Unchained', 'Parallel'],
                description: 'In-game assets as NFTs — characters, cards, land. ERC-721 means you truly own the asset. Trade it on any marketplace, bridge it across games, or hold it after the game shuts down.',
                accent: 'border-purple-500/20 hover:border-purple-500/40',
                badge: 'bg-purple-500/10 text-purple-400',
              },
              {
                category: 'Real-World Assets',
                examples: ['ENS', 'Tickets', 'Credentials'],
                description: 'Domain names (ENS), event tickets, diplomas, legal documents. The uniqueness guarantee of ERC-721 makes it the natural fit for anything that must be provably one-of-a-kind.',
                accent: 'border-amber-500/20 hover:border-amber-500/40',
                badge: 'bg-amber-500/10 text-amber-400',
              },
            ].map(({ category, examples, description, accent, badge }) => (
              <div
                key={category}
                className={`rounded-2xl border bg-white/[0.03] p-6 text-left transition-all duration-200 ${accent}`}
              >
                <span className={`mb-3 inline-block rounded-full px-3 py-1 text-xs font-semibold ${badge}`}>
                  {category}
                </span>
                <div className="mb-3 flex flex-wrap gap-2">
                  {examples.map((ex) => (
                    <span
                      key={ex}
                      className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 font-mono text-xs text-white"
                    >
                      {ex}
                    </span>
                  ))}
                </div>
                <p className="text-xs leading-relaxed text-gray-400">{description}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
