import { useEffect, useState } from 'react';
import { useAccount, useReadContracts, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { TOKEN_VERSE_ERC721_ADDRESS, TOKEN_VERSE_ERC721_ABI } from '../constants/contracts';
import InventoryCTA, { ICONS } from '../components/InventoryCTA';

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

  const { data, isLoading, isError: contractError, refetch } = useReadContracts({
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
          Public mint — any wallet can claim one of each character type. No global cap; the
          per-wallet-per-type mapping is the only guard.
        </p>

        {(!TOKEN_VERSE_ERC721_ADDRESS || contractError) && (
          <div className={`mb-6 flex items-start gap-2.5 rounded-xl border px-4 py-3 text-xs ${
            contractError
              ? 'border-rose-500/20 bg-rose-500/5 text-rose-400'
              : 'border-yellow-500/20 bg-yellow-500/5 text-yellow-400'
          }`}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="mt-0.5 shrink-0">
              <path d="M8 2L1 14h14L8 2z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M8 7v3M8 11.5v.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            </svg>
            {contractError ? (
              <>Contract unreachable — wrong address or Anvil not running. Check{' '}
              <span className="font-mono">VITE_ERC721_CONTRACT_ADDRESS</span>{' '}and run{' '}
              <span className="font-mono">make anvil</span>.</>
            ) : (
              <>ERC-721 contract is not deployed. Run{' '}
              <span className="font-mono">make deploy-erc721-local</span>{' '}and update{' '}
              <span className="font-mono">VITE_ERC721_CONTRACT_ADDRESS</span>.</>
            )}
          </div>
        )}

        {/* live minted counter */}
        <div className="mb-6 rounded-xl border border-white/5 bg-gray-900/60 p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-gray-500">Total NFTs Minted</p>
            <span className="text-sm font-semibold tabular-nums text-white">
              {isLoading ? (
                <span className="h-4 w-10 animate-pulse rounded bg-white/10 inline-block" />
              ) : (
                totalSupply != null ? totalSupply.toString() : '—'
              )}
            </span>
          </div>
          <p className="mt-1 text-xs text-gray-600">
            3 types · one per wallet per type · unlimited wallets
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
                    {!TOKEN_VERSE_ERC721_ADDRESS ? (
                      <div className="flex items-center justify-center gap-2 rounded-xl border border-gray-700/50 bg-gray-800/30 py-2.5 text-xs font-semibold text-gray-500 cursor-not-allowed select-none">
                        Contract not deployed
                      </div>
                    ) : contractError ? (
                      <div className="flex items-center justify-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/5 py-2.5 text-xs font-semibold text-rose-400">
                        <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                          <path d="M8 2L1 14h14L8 2z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M8 7v3M8 11.5v.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                        </svg>
                        Contract unreachable
                      </div>
                    ) : !isConnected ? (
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

        {hasMinted.some(Boolean) && (
          <InventoryCTA
            accent={{
              border: 'border-blue-500/20',
              bg: 'bg-blue-500/[0.04]',
              glow: 'via-blue-500/40',
              label: 'text-blue-400',
              iconClass: 'text-blue-400',
              btn: 'bg-gradient-to-r from-blue-500 to-indigo-500',
            }}
            hint="Your NFT is on-chain and permanently in your wallet. Head to Inventory to explore ERC-721 ownership mechanics with your character."
            items={[
              { icon: ICONS.transfer, action: 'safeTransferFrom()', desc: 'transfer your NFT to any wallet — the contract verifies the recipient can hold it' },
              { icon: ICONS.approve, action: 'setApprovalForAll()', desc: 'grant an operator address full control over your entire collection' },
            ]}
          />
        )}
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
          Mint a live ERC-721 character — each token ID is provably unique, permanently owned on-chain, and backed by decentralized IPFS metadata.
          </p>

          {/* Stat pills */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            {[
              { label: 'Standard',       value: 'ERC-721'   },
              { label: 'Symbol',         value: 'TVNFT'     },
              { label: 'Per wallet',      value: '1 per type' },
              { label: 'Types',          value: '3'         },
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
                icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400"><circle cx="7.5" cy="15.5" r="5.5"/><path d="M21 2l-9.6 9.6M15.5 7.5l3 3"/></svg>,
                title: 'Type ≠ Token ID',
                body: 'typeId is metadata — it describes what kind of token it is. tokenId is the identity. If 50 wallets all mint Dragon Knight (typeId 0), each receives a different tokenId: #0, #1, #2… ownerOf(tokenId) always resolves to exactly one address, no matter how many tokens share the same type.',
                accent: 'border-blue-500/30 hover:border-blue-500/60',
              },
              {
                icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M9 13h6M9 17h4"/></svg>,
                title: 'Provable Ownership',
                body: 'ownerOf(tokenId) returns the current owner — no database, no platform, no intermediary. The ledger is the source of truth. Ownership transfers atomically when safeTransferFrom emits a Transfer event.',
                accent: 'border-purple-500/30 hover:border-purple-500/60',
              },
              {
                icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-amber-400"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
                title: 'Token-Gating',
                body: 'NFT = key. Holding a specific tokenId can unlock a Discord server, a game level, a real-world event, or a governance vote. The same balanceOf() call that checks token count gates access.',
                accent: 'border-amber-500/30 hover:border-amber-500/60',
              },
              {
                icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-rose-400"><path d="M13 2L4.5 13.5H12L11 22L19.5 10.5H12L13 2z"/></svg>,
                title: 'Public Mint',
                body: 'TVNFT enforces one mint per character type per address via a nested mapping — no global supply cap needed. Any wallet can mint all three types permissionlessly, mirroring how real production NFT drops work: on-chain rules replace the deployer as the gatekeeper.',
                accent: 'border-rose-500/30 hover:border-rose-500/60',
              },
            ].map(({ icon, title, body, accent }) => (
              <div
                key={title}
                className={`rounded-2xl border bg-white/[0.03] p-5 text-left transition-all duration-200 ${accent}`}
              >
                <span className="mb-3 block">{icon}</span>
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
                  attempt. No global supply cap — the mapping alone enforces the rule.
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
                  <span className="text-blue-400/80">_nextTokenId++</span> — the global counter
                  increments on every mint regardless of type, so two Dragon Knights minted by
                  different wallets get distinct tokenIds.
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
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <p className="text-xs font-semibold text-blue-300">
                      tokenURI() — On-Chain Metadata Pointer
                    </p>
                    <span className="rounded-full bg-orange-500/10 px-2 py-0.5 text-xs font-medium text-orange-400">OpenZeppelin · ERC721URIStorage</span>
                  </div>
                  <p className="text-xs leading-relaxed text-gray-400">
                    Every NFT needs a way to describe itself — its name, image, and traits. <span className="font-mono text-gray-300">tokenURI(tokenId)</span> returns a link to a JSON file stored on IPFS that holds all that data. OpenZeppelin's <span className="font-mono text-gray-300">ERC721URIStorage</span> extension handles storing that link on-chain so marketplaces and wallets can read it without any backend.
                  </p>
                </div>
              </div>

              {/* ERC721Enumerable callout */}
              <div className="flex items-start gap-3 rounded-xl border border-purple-500/15 bg-purple-500/5 px-5 py-4">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="mt-0.5 shrink-0 text-purple-400">
                  <rect x="2" y="3" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3" />
                  <rect x="9" y="3" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3" />
                  <rect x="2" y="10" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3" />
                  <rect x="9" y="10" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3" />
                </svg>
                <div>
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <p className="text-xs font-semibold text-purple-300">
                      ERC721Enumerable — How Wallets Find Your NFTs
                    </p>
                    <span className="rounded-full bg-orange-500/10 px-2 py-0.5 text-xs font-medium text-orange-400">OpenZeppelin · ERC721Enumerable</span>
                  </div>
                  <p className="text-xs leading-relaxed text-gray-400">
                    ERC-721 can tell how many NFTs a wallet owns using <span className="font-mono text-gray-300">balanceOf()</span>. OpenZeppelin's <span className="font-mono text-gray-300">ERC721Enumerable</span> extension adds the ability to list and retrieve each NFT individually — so apps can loop through your entire collection. This is how wallets and NFT marketplaces can display all NFTs owned by a user.
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
            Every project below works because the underlying asset is <span className="font-medium text-gray-300">unique by design</span> — the specific token ID is what carries value, not the quantity.
          </p>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              {
                category: 'Collectibles & PFPs',
                examples: ['CryptoPunks', 'BAYC', 'Azuki'],
                description: 'CryptoPunk #3100 is not interchangeable with #7804 — rarity, traits, and history make each one distinct. ownerOf(tokenId) is the immutable proof of provenance. A fungible token can\'t express that.',
                accent: 'border-blue-500/20 hover:border-blue-500/40',
                badge: 'bg-blue-500/10 text-blue-400',
              },
              {
                category: 'Gaming Assets',
                examples: ['Axie Infinity', 'Gods Unchained', 'Parallel'],
                description: 'A game character, sword, or collectible NFT can be tracked throughout its lifetime—from minting to every owner it has ever had. ERC-721 makes this ownership history transparent and verifiable on-chain.',
                accent: 'border-purple-500/20 hover:border-purple-500/40',
                badge: 'bg-purple-500/10 text-purple-400',
              },
              {
                category: 'Identity & Domains',
                examples: ['ENS', 'POAPs', 'Soulbound tokens'],
                description: '"vitalik.eth" can have exactly one owner at any time — uniqueness is the product. ENS names are ERC-721 tokens: ownerOf tells you who controls the domain. No amount of a fungible token can express that.',
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
