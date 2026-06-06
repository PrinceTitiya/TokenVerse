import { useEffect } from 'react';
import { useReadContracts, useReadContract, useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { TOKENS, RARITY_CONFIG, TOKEN_VERSE_1155_ADDRESS, TOKEN_VERSE_ABI } from '../constants/contracts';
import InventoryCTA, { ICONS } from '../components/InventoryCTA';

const IPFS_GATEWAY = 'https://ipfs.io/ipfs/';

const RARITY_ORDER = { Legendary: 0, Epic: 1, Rare: 2, Common: 3 };

const RARITY_GLOW = {
  Common: '',
  Rare: 'hover:shadow-blue-500/20',
  Epic: 'hover:shadow-purple-500/20',
  Legendary: 'hover:shadow-amber-500/30',
};

const RARITY_IMAGE_BG = {
  Common: 'from-gray-800 to-gray-900',
  Rare: 'from-blue-950/60 to-gray-900',
  Epic: 'from-purple-950/60 to-gray-900',
  Legendary: 'from-amber-950/60 to-gray-900',
};

/* ─── supply value with skeleton ───────────────────────────── */
function SupplyValue({ status, value }) {
  if (status === 'pending') return <span className="h-4 w-12 animate-pulse rounded bg-white/10" />;
  if (status === 'failure' || value == null) return <span className="text-gray-500">—</span>;
  return <span className="tabular-nums">{value.toString()}</span>;
}

/* ─── token card ───────────────────────────────────────────── */
function TokenCard({ token, supplyResult, isNft }) {
  const rarity = RARITY_CONFIG[token.rarity];
  const imageUrl = `${IPFS_GATEWAY}${token.imageCid}`;

  return (
    <div className={`
      group relative flex flex-col overflow-hidden rounded-2xl border bg-gray-900
      transition-all duration-300 hover:-translate-y-1 hover:shadow-xl
      ${rarity.border} ${RARITY_GLOW[token.rarity]}
    `}>
      {/* Image */}
      <div className={`relative aspect-square bg-gradient-to-b ${RARITY_IMAGE_BG[token.rarity]} p-3`}>
        <img
          src={imageUrl}
          alt={token.name}
          className="h-full w-full object-contain drop-shadow-lg transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        <span className={`absolute right-3 top-3 rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide ${rarity.badge}`}>
          {token.rarity}
        </span>
        <span className="absolute left-3 top-3 rounded-full bg-black/40 px-2 py-0.5 font-mono text-xs text-gray-400 backdrop-blur-sm">
          {isNft ? 'ID 1000+' : `#${token.id.toString()}`}
        </span>
        {isNft && (
          <span className="absolute left-3 bottom-3 rounded-full border border-amber-500/40 bg-amber-500/20 px-2 py-0.5 text-xs font-bold text-amber-300">
            Unique
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="text-base font-bold text-white">{token.name}</h3>
        <span className="font-mono text-xs text-gray-500">
          {isNft ? 'NFT-like · Unique per holder' : `Token ID #${token.id.toString()}`}
        </span>
        <p className="line-clamp-3 min-h-[3.75rem] text-xs leading-relaxed text-gray-400">{token.description}</p>

        <div className="mt-auto flex items-center justify-between border-t border-white/5 pt-3">
          <span className="text-xs text-gray-500">{isNft ? 'Total Minted' : 'Total Supply'}</span>
          <span className={`text-sm font-semibold ${supplyResult?.status === 'success' ? 'text-white' : 'text-gray-500'}`}>
            <SupplyValue
              status={supplyResult == null ? 'pending' : supplyResult.status}
              value={supplyResult?.result}
            />
          </span>
        </div>
      </div>
    </div>
  );
}

/* ─── how it works education box ──────────────────────────── */
function HowItWorksBox() {
  return (
    <div className="mb-14 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
      <div className="h-px w-full bg-gradient-to-r from-transparent via-amber-500/60 to-transparent" />

      <div className="p-8">
        <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-amber-400">
          How It Works
        </p>
        <h2 className="mb-6 text-xl font-bold text-white">ERC-1155 Core Functions</h2>

        {/* 3 main function cards */}
        <div className="grid gap-6 md:grid-cols-3">

          {/* mint() */}
          <div className="rounded-xl border border-white/5 bg-gray-900/60 p-5">
            <div className="mb-3 flex items-center gap-2">
              <span className="rounded-lg bg-amber-500/10 px-2.5 py-1 font-mono text-xs font-bold text-amber-400">
                mint()
              </span>
              <span className="text-xs text-gray-500">Single · onlyOwner</span>
            </div>
            <p className="mb-4 text-xs leading-relaxed text-gray-400">
              Mints a specific token ID in any amount to any address. Each token type has
              a unique <span className="font-mono text-gray-300">id</span> — same function
              call, different integers, different assets entirely. Exception: Dragon Sword
              IDs (1000+) are auto-assigned per wallet via{' '}
              <span className="font-mono text-gray-300">claimStarterPack()</span>, not
              passed in directly.
            </p>
            <div className="rounded-lg bg-gray-950/80 px-4 py-3 font-mono text-xs text-gray-300">
              <span className="text-amber-400">mint</span>
              <span className="text-gray-500">(</span>
              <span className="text-amber-300">address</span> to,{' '}
              <span className="text-amber-300">uint256</span> id,{' '}
              <span className="text-amber-300">uint256</span> amount
              <span className="text-gray-500">)</span>
            </div>
            <p className="mt-3 text-xs text-gray-500">
              Emits <span className="font-mono text-gray-400">TransferSingle</span> — one event, one token type.
            </p>
          </div>

          {/* mintBatch() */}
          <div className="rounded-xl border border-white/5 bg-gray-900/60 p-5">
            <div className="mb-3 flex items-center gap-2">
              <span className="rounded-lg bg-purple-500/10 px-2.5 py-1 font-mono text-xs font-bold text-purple-400">
                mintBatch()
              </span>
              <span className="text-xs text-gray-500">Batch · onlyOwner</span>
            </div>
            <p className="mb-4 text-xs leading-relaxed text-gray-400">
              Mints multiple token types atomically. Parallel arrays —
              {' '}<span className="font-mono text-gray-300">ids[i]</span> maps to{' '}
              <span className="font-mono text-gray-300">amounts[i]</span>. One transaction
              instead of five, one gas cost instead of five.
            </p>
            <div className="rounded-lg bg-gray-950/80 px-4 py-3 font-mono text-xs text-gray-300">
              <span className="text-purple-400">mintBatch</span>
              <span className="text-gray-500">(</span>
              <span className="text-amber-300">address</span> to,{' '}
              <span className="text-amber-300">uint256[]</span> ids,{' '}
              <span className="text-amber-300">uint256[]</span> amounts
              <span className="text-gray-500">)</span>
            </div>
            <p className="mt-3 text-xs text-gray-500">
              Emits <span className="font-mono text-gray-400">TransferBatch</span> — one event for all types.
            </p>
          </div>

          {/* burn() */}
          <div className="rounded-xl border border-white/5 bg-gray-900/60 p-5">
            <div className="mb-3 flex items-center gap-2">
              <span className="rounded-lg bg-rose-500/10 px-2.5 py-1 font-mono text-xs font-bold text-rose-400">
                burn()
              </span>
              <span className="text-xs text-gray-500">Holder or Approved</span>
            </div>
            <p className="mb-4 text-xs leading-relaxed text-gray-400">
              Permanently destroys tokens. Only the holder or an approved operator can
              burn — enforced by a custom{' '}
              <span className="font-mono text-gray-300">NotApproved</span> error rather
              than relying on OZ's internal checks.
            </p>
            <div className="rounded-lg bg-gray-950/80 px-4 py-3 font-mono text-xs text-gray-300">
              <span className="text-rose-400">burn</span>
              <span className="text-gray-500">(</span>
              <span className="text-amber-300">address</span> from,{' '}
              <span className="text-amber-300">uint256</span> id,{' '}
              <span className="text-amber-300">uint256</span> amount
              <span className="text-gray-500">)</span>
            </div>
            <p className="mt-3 text-xs text-gray-500">
              <span className="font-mono text-gray-400">burnBatch</span> works the same way for multiple types at once.
            </p>
          </div>
        </div>

        {/* dismantleDragonSword — special callout */}
        <div className="mt-6 flex flex-col gap-4 md:flex-row">
          <div className="flex-1 overflow-hidden rounded-xl border border-amber-500/20 bg-amber-500/5">
            <div className="h-px w-full bg-gradient-to-r from-amber-500/40 via-rose-500/40 to-transparent" />
            <div className="p-5">
              <div className="mb-3 flex items-center gap-2">
                <span className="rounded-lg bg-gradient-to-r from-amber-500/20 to-rose-500/20 px-2.5 py-1 font-mono text-xs font-bold text-amber-300">
                  dismantleDragonSword()
                </span>
                <span className="text-xs text-gray-500">On-Chain Crafting</span>
              </div>
              <p className="mb-4 text-xs leading-relaxed text-gray-400">
                Burns your unique Dragon Sword (ID 1000+) and mints 100 Dragon Glass (ID
                5) in a single atomic transaction. Every holder's sword has a different
                token ID — the contract calls{' '}
                <span className="font-mono text-gray-300">isSword(swordId)</span> to verify
                the ID is in the valid range (≥ 1000) No external marketplace, no middleman.
              </p>
              <div className="rounded-lg bg-gray-950/80 px-4 py-3 font-mono text-xs text-gray-300 space-y-1">
                <div>
                  <span className="text-gray-600">{'// check: isSword(swordId) && balanceOf(msg.sender, swordId) >= 1'}</span>
                </div>
                <div>
                  <span className="text-rose-400">_burn</span>
                  <span className="text-gray-500">(msg.sender, swordId, 1)</span>
                </div>
                <div>
                  <span className="text-amber-400">_mint</span>
                  <span className="text-gray-500">(msg.sender, DRAGON_GLASS, 100, "")</span>
                </div>
                <div>
                  <span className="text-purple-400">emit</span>
                  <span className="text-gray-500"> SwordDismantled(msg.sender, 100)</span>
                </div>
              </div>
            </div>
          </div>

          {/* _update override explanation */}
          <div className="flex-1 rounded-xl border border-white/5 bg-gray-900/60 p-5">
            <div className="mb-3 flex items-center gap-2">
              <span className="rounded-lg bg-blue-500/10 px-2.5 py-1 font-mono text-xs font-bold text-blue-400">
                _update()
              </span>
              <span className="text-xs text-gray-500">Diamond Inheritance Fix</span>
            </div>
            <p className="mb-4 text-xs leading-relaxed text-gray-400">
              Both <span className="font-mono text-gray-300">ERC1155</span> and{' '}
              <span className="font-mono text-gray-300">ERC1155Supply</span> define{' '}
              <span className="font-mono text-gray-300">_update()</span>. Solidity refuses to
              compile unless you resolve the conflict by overriding it manually and calling{' '}
              <span className="font-mono text-gray-300">super._update()</span>. This hooks into both
              parent implementations in the correct order.
            </p>
            <div className="rounded-lg bg-gray-950/80 px-4 py-3 font-mono text-xs text-gray-300">
              <div>
                <span className="text-blue-400">function</span>{' '}
                <span className="text-white">_update</span>
                <span className="text-gray-500">(...)</span>
              </div>
              <div className="pl-4">
                <span className="text-blue-400">override</span>
                <span className="text-gray-500">(ERC1155, ERC1155Supply)</span>
              </div>
              <div className="pl-4">
                <span className="text-purple-400">super</span>
                <span className="text-gray-500">._update(...)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── starter pack faucet ──────────────────────────────────── */
function StarterPackSection() {
  const { address, isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();

  const { data, isLoading, refetch } = useReadContracts({
    contracts: [
      {
        address: TOKEN_VERSE_1155_ADDRESS,
        abi: TOKEN_VERSE_ABI,
        functionName: 'hasClaimedStarterPack',
        args: [address ?? '0x0000000000000000000000000000000000000000'],
      },
      {
        address: TOKEN_VERSE_1155_ADDRESS,
        abi: TOKEN_VERSE_ABI,
        functionName: 'balanceOf',
        args: [address ?? '0x0000000000000000000000000000000000000000', 1n],
      },
      {
        address: TOKEN_VERSE_1155_ADDRESS,
        abi: TOKEN_VERSE_ABI,
        functionName: 'balanceOf',
        args: [address ?? '0x0000000000000000000000000000000000000000', 2n],
      },
      {
        address: TOKEN_VERSE_1155_ADDRESS,
        abi: TOKEN_VERSE_ABI,
        functionName: 'swordIdOf',
        args: [address ?? '0x0000000000000000000000000000000000000000'],
      },
    ],
    query: { enabled: !!TOKEN_VERSE_1155_ADDRESS },
  });

  const alreadyClaimed = data?.[0]?.status === 'success' ? data[0].result : false;
  const goldBalance    = data?.[1]?.status === 'success' ? data[1].result : null;
  const gemsBalance    = data?.[2]?.status === 'success' ? data[2].result : null;
  const userSwordId    = data?.[3]?.status === 'success' ? data[3].result : null;

  const { data: swordBalance } = useReadContract({
    address: TOKEN_VERSE_1155_ADDRESS,
    abi: TOKEN_VERSE_ABI,
    functionName: 'balanceOf',
    args: [address ?? '0x0000000000000000000000000000000000000000', userSwordId ?? 0n],
    query: { enabled: !!TOKEN_VERSE_1155_ADDRESS && !!address && userSwordId != null && userSwordId > 0n },
  });

  const { writeContract, data: txHash, isPending, error: writeError, reset } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash: txHash });

  useEffect(() => {
    if (isConfirmed) {
      refetch();
      const t = setTimeout(reset, 4000);
      return () => clearTimeout(t);
    }
  }, [isConfirmed, refetch, reset]);

  function handleClaim() {
    writeContract({ address: TOKEN_VERSE_1155_ADDRESS, abi: TOKEN_VERSE_ABI, functionName: 'claimStarterPack' });
  }

  function ClaimButton() {
    if (!isConnected) {
      return (
        <button
          onClick={openConnectModal}
          className="w-full rounded-xl bg-white py-3 text-sm font-bold text-gray-900 transition-all hover:bg-gray-100"
        >
          Connect Wallet to Claim
        </button>
      );
    }
    if (isConfirmed) {
      return (
        <div className="flex items-center justify-center gap-2 rounded-xl bg-emerald-500/10 py-3 text-sm font-semibold text-emerald-400">
          <svg width="14" height="14" viewBox="0 0 12 12" fill="none">
            <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Starter Pack received!
        </div>
      );
    }
    if (isPending) {
      return (
        <div className="flex items-center justify-center gap-2 rounded-xl bg-amber-500/10 py-3 text-sm font-semibold text-amber-400">
          <span className="h-3.5 w-3.5 animate-spin rounded-full border border-amber-400 border-t-transparent" />
          Confirm in wallet…
        </div>
      );
    }
    if (isConfirming) {
      return (
        <div className="flex items-center justify-center gap-2 rounded-xl bg-amber-500/10 py-3 text-sm font-semibold text-amber-400">
          <span className="h-3.5 w-3.5 animate-spin rounded-full border border-amber-400 border-t-transparent" />
          Claiming…
        </div>
      );
    }
    if (alreadyClaimed) {
      return (
        <div className="flex items-center justify-center gap-2 rounded-xl border border-blue-500/20 bg-blue-500/5 py-3 text-sm font-semibold text-blue-400">
          <svg width="14" height="14" viewBox="0 0 12 12" fill="none">
            <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.3" />
            <path d="M6 4v3M6 8.5v.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
          Already Claimed
        </div>
      );
    }
    return (
      <button
        onClick={handleClaim}
        className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-purple-500 py-3 text-sm font-bold text-gray-950 transition-all duration-200 hover:opacity-90"
      >
        Claim Starter Pack
      </button>
    );
  }

  const tokenRows = [
    { label: 'Gold',         balance: goldBalance,  color: 'text-amber-400',  bg: 'bg-amber-500/10',  id: '1' },
    { label: 'Gems',         balance: gemsBalance,  color: 'text-blue-400',   bg: 'bg-blue-500/10',   id: '2' },
    { label: 'Dragon Sword', balance: swordBalance ?? null, color: 'text-purple-400', bg: 'bg-purple-500/10', id: userSwordId ? userSwordId.toString() : '…' },
  ];

  return (
    <div className="mb-14 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
      <div className="h-px w-full bg-gradient-to-r from-transparent via-amber-500/60 to-transparent" />

      <div className="p-8">
        <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-amber-400">
          Live Interaction
        </p>
        <h2 className="mb-1 text-xl font-bold text-white">Starter Pack — Try ERC-1155</h2>
        <p className="mb-6 text-sm text-gray-400">
          Claim your free tokens and experience batch minting first-hand. Under the hood this
          calls <span className="font-mono text-gray-300">_mintBatch()</span> — one transaction
          that mints three different token IDs atomically.
        </p>

        <div className="grid gap-6 md:grid-cols-2">

          {/* Left — live balances */}
          <div className="flex flex-col gap-3">
            <p className="text-xs font-medium text-gray-500">Your Balances</p>
            {tokenRows.map(({ label, balance, color, bg, id }) => (
              <div
                key={id}
                className="flex items-center justify-between rounded-xl border border-white/5 bg-gray-900/60 px-5 py-4"
              >
                <div className="flex items-center gap-3">
                  <span className={`rounded-full px-2 py-0.5 font-mono text-xs font-bold ${bg} ${color}`}>
                    #{id}
                  </span>
                  <span className="text-sm font-medium text-gray-300">{label}</span>
                </div>
                {isLoading ? (
                  <div className="h-5 w-10 animate-pulse rounded bg-white/10" />
                ) : (
                  <span className="text-sm font-bold tabular-nums text-white">
                    {isConnected && balance != null ? balance.toString() : '—'}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Right — claim panel */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-4 rounded-xl border border-white/5 bg-gray-900/60 p-5">
              <div>
                <p className="mb-2 text-xs font-medium text-gray-500">What you'll receive</p>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-400">10 Gold</span>
                  <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-400">5 Gems</span>
                  <span className="rounded-full bg-purple-500/10 px-3 py-1 text-xs font-bold text-purple-400">1 Dragon Sword</span>
                </div>
              </div>

              <div className="border-t border-white/5 pt-4">
                <ClaimButton />
              </div>

              {writeError && !isPending && !isConfirmed && (
                <p className="text-center text-xs text-rose-400">
                  Transaction rejected or failed. Try again.
                </p>
              )}

              {isConnected && !isLoading && (
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <span>Pack status</span>
                  <span className={alreadyClaimed ? 'text-blue-400' : 'text-amber-400'}>
                    {alreadyClaimed ? 'Claimed' : 'Available'}
                  </span>
                </div>
              )}
            </div>

            {/* function signature callout */}
            <div className="rounded-xl border border-white/5 bg-gray-950/60 px-4 py-3">
              <p className="mb-1 text-xs text-gray-600">Calling on-chain</p>
              <div className="font-mono text-xs text-gray-300">
                <span className="text-amber-400">claimStarterPack</span>
                <span className="text-gray-500">()</span>
                <span className="ml-2 text-gray-600">→ _mintBatch([1,2], [10,5]) + _mint(swordId, 1)</span>
              </div>
              <div className="mt-1 font-mono text-xs text-gray-600">
                contract:{' '}
                {TOKEN_VERSE_1155_ADDRESS
                  ? `${TOKEN_VERSE_1155_ADDRESS.slice(0, 8)}…${TOKEN_VERSE_1155_ADDRESS.slice(-6)}`
                  : 'not deployed'}
              </div>
            </div>
          </div>
        </div>

        {(alreadyClaimed || isConfirmed) && (
          <InventoryCTA
            accent={{
              border: 'border-amber-500/20',
              bg: 'bg-amber-500/[0.04]',
              glow: 'via-amber-500/40',
              label: 'text-amber-400',
              iconClass: 'text-amber-400',
              btn: 'bg-gradient-to-r from-amber-500 to-orange-500',
            }}
            hint="Your starter pack (10 Gold · 5 Gems · 1 Dragon Sword) is live on Sepolia. Head to Inventory to try ERC-1155 mechanics — including the on-chain crafting pattern unique to this standard."
            items={[
              { icon: ICONS.dismantle, action: 'dismantleDragonSword()', desc: 'burn 1 Dragon Sword and receive 100 Dragon Glass shards in one atomic transaction' },
              { icon: ICONS.batch, action: 'safeBatchTransferFrom()', desc: 'send multiple token types to another wallet in a single call' },
              { icon: ICONS.burn, action: 'burn()', desc: 'permanently destroy tokens from your balance' },
            ]}
          />
        )}
      </div>
    </div>
  );
}

/* ─── page ─────────────────────────────────────────────────── */
export default function ERC1155() {
  const { data } = useReadContracts({
    contracts: TOKENS.map((t) => ({
      address: TOKEN_VERSE_1155_ADDRESS,
      abi: TOKEN_VERSE_ABI,
      functionName: 'totalSupply',
      args: [t.id],
    })),
  });

  // Dragon Sword uses unique IDs starting at 1000 — total minted = nextSwordId - 1000
  const { data: nextSwordIdRaw } = useReadContract({
    address: TOKEN_VERSE_1155_ADDRESS,
    abi: TOKEN_VERSE_ABI,
    functionName: 'nextSwordId',
    query: { enabled: !!TOKEN_VERSE_1155_ADDRESS },
  });

  const sortedTokens = [...TOKENS].sort(
    (a, b) => RARITY_ORDER[a.rarity] - RARITY_ORDER[b.rarity],
  );

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-gray-950 px-6 py-16">
      <div className="mx-auto max-w-7xl">

        {/* ── Hero ──────────────────────────────────────────────── */}
        <div className="mb-14 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-amber-400">
            ERC-1155 · On-Chain Gaming
          </p>
          <h1 className="mb-4 text-5xl font-extrabold tracking-tight text-white">
            The Token{' '}
            <span className="bg-gradient-to-r from-amber-400 to-purple-400 bg-clip-text text-transparent">
              Collection
            </span>
          </h1>
          <p className="mx-auto max-w-xl text-base text-gray-400">
            Five unique assets live on-chain inside a single ERC-1155 contract — from
            common currency to legendary weapons. Collect, craft, and trade inside TokenVerse.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            {[
              { label: 'Tokens',    value: '5'       },
              { label: 'Rarities',  value: '4'       },
              { label: 'Standard',  value: 'ERC-1155' },
              { label: 'Contract',  value: '1'       },
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

        {/* ── Why ERC-1155 ───────────────────────────────────────── */}
        <div className="mb-14 text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-purple-400">
            The Standard
          </p>
          <h2 className="mb-3 text-2xl font-bold text-white">Why ERC-1155?</h2>
          <p className="mx-auto mb-8 max-w-lg text-sm text-gray-400">
            Before ERC-1155, every token type needed its own separate contract. This standard changed that.
          </p>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-amber-400"><path d="M12 2L2 7l10 5 10-5-10-5zM2 12l10 5 10-5M2 17l10 5 10-5"/></svg>,
                title: 'One Contract, All Tokens',
                body: 'ERC-20 and ERC-721 require a fresh deployment per token type. ERC-1155 bundles unlimited token IDs into a single contract, slashing deployment cost and complexity.',
                accent: 'border-amber-500/30 hover:border-amber-500/60',
              },
              {
                icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400"><circle cx="7" cy="12" r="4"/><rect x="13" y="8" width="8" height="8" rx="1"/></svg>,
                title: 'Fungible & Non-Fungible',
                body: 'A single standard covers both: token ID 1 can be a currency (many copies, identical value) while token ID 3 is a unique sword — no separate ERC-721 contract needed.',
                accent: 'border-purple-500/30 hover:border-purple-500/60',
              },
              {
                icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
                title: 'Batch Operations',
                body: 'Mint, transfer, or burn multiple token types in one transaction. One blockchain call instead of five cuts gas fees dramatically for games and marketplaces.',
                accent: 'border-blue-500/30 hover:border-blue-500/60',
              },
              {
                icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-rose-400"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>,
                title: 'On-Chain Crafting',
                body: 'Burn inputs to mint outputs — all in one atomic call. TokenVerse uses this for dismantling: trade 1 Dragon Sword for 100 Dragon Glass shards, no middleman.',
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

        {/* ── How It Works ───────────────────────────────────────── */}
        <HowItWorksBox />

        {/* ── Token Collection ───────────────────────────────────── */}
        <div>
          <div className="mb-8 text-center">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-amber-400">
              The Collection
            </p>
            <h2 className="mb-3 text-2xl font-bold text-white">5 Tokens, One Contract</h2>
            <p className="mx-auto max-w-2xl text-sm text-gray-400">
              Each token lives at a different integer ID inside the same contract address.
              Gold (ID 1) and Gems (ID 2) are fungible — stackable resources minted in
              every starter pack. Dragon Sword is NFT-like — instead of a fixed ID, each
              wallet that claims a starter pack receives a unique sword ID starting at 1000,
              tracked on-chain via{' '}
              <span className="font-mono text-gray-300">swordIdOf[address]</span>. Event
              Ticket (ID 4) is owner-controlled. Dragon Glass (ID 5) is the crafting
              output — the only way to get it is by dismantling your Dragon Sword, which
              burns 1 sword and mints 100 Dragon Glass in one atomic call.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {sortedTokens.map((token) => {
              const originalIndex = TOKENS.findIndex((t) => t.id === token.id);
              const isDragonSword = token.id === 3n;

              let supplyResult = data?.[originalIndex];
              if (isDragonSword && nextSwordIdRaw != null) {
                supplyResult = { status: 'success', result: nextSwordIdRaw - 1000n };
              }

              return (
                <TokenCard
                  key={token.id}
                  token={token}
                  supplyResult={supplyResult}
                  isNft={isDragonSword}
                />
              );
            })}
          </div>

          {/* Rarity legend */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs text-gray-500">
            <span className="font-medium uppercase tracking-widest">Rarity</span>
            {Object.entries(RARITY_CONFIG).map(([name, cfg]) => (
              <span key={name} className={`rounded-full px-3 py-1 font-semibold ${cfg.badge}`}>
                {name}
              </span>
            ))}
          </div>
        </div>

        {/* ── Starter Pack Faucet ────────────────────────────────── */}
        <div className="mt-14">
          <StarterPackSection />
        </div>

        {/* ── Where ERC-1155 is used ─────────────────────────────────── */}
        <div className="mt-20 text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-amber-400">
            Real World
          </p>
          <h2 className="mb-3 text-2xl font-bold text-white">Where ERC-1155 Lives</h2>
          <p className="mx-auto mb-8 max-w-xl text-sm text-gray-400">
            Every project below works because the underlying system needs <span className="font-medium text-gray-300">multiple token types in one place</span> — a problem ERC-20 and ERC-721 can only solve with separate contract deployments.
          </p>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              {
                category: 'Game Inventories',
                examples: ['Enjin', 'Gods Unchained', 'TokenVerse'],
                description: 'Gold coins (fungible), legendary weapons (capped edition), consumable potions — all live under one contract address. With ERC-721 you\'d need a separate deployment for every item type. ERC-1155 handles all of them as different integer IDs.',
                accent: 'border-amber-500/20 hover:border-amber-500/40',
                badge: 'bg-amber-500/10 text-amber-400',
              },
              {
                category: 'Metaverse Assets',
                examples: ['Decentraland', 'The Sandbox', 'OpenSea'],
                description: 'Wearables, land add-ons, and limited cosmetic drops mix fungible supplies (50 copies of a hat) with unique items. ERC-1155 lets the same contract manage all tiers — its batch transfer makes distributing drops to thousands of wallets economical.',
                accent: 'border-purple-500/20 hover:border-purple-500/40',
                badge: 'bg-purple-500/10 text-purple-400',
              },
              {
                category: 'Multi-Asset Drops',
                examples: ['Airdrop campaigns', 'Loyalty rewards', 'Event passes'],
                description: 'Sending 10 different reward tokens to 1,000 wallets via ERC-721 or ERC-20 costs 10,000 transactions. With safeBatchTransferFrom that collapses to 1,000 — one per recipient. The gas saving scales linearly with the number of token types.',
                accent: 'border-blue-500/20 hover:border-blue-500/40',
                badge: 'bg-blue-500/10 text-blue-400',
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
