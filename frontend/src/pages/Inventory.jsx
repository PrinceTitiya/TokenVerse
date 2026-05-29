import { useAccount, useReadContracts } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { TOKENS, RARITY_CONFIG, TOKEN_VERSE_ADDRESS, TOKEN_VERSE_ABI } from '../constants/contracts';

const IPFS_GATEWAY = 'https://ipfs.io/ipfs/';

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


function ConnectPrompt() {
  const { openConnectModal } = useConnectModal();
  return (
    <div className="flex min-h-[calc(100vh-5rem)] flex-col items-center justify-center bg-gray-950 px-6 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-amber-400">
          <rect x="2" y="7" width="20" height="14" rx="2" />
          <path d="M16 12h.01" />
          <path d="M2 10h20" />
          <path d="M6 3l2-1h8l2 1" />
        </svg>
      </div>
      <h2 className="mb-2 text-2xl font-bold text-white">Connect Your Wallet</h2>
      <p className="mb-8 max-w-xs text-sm text-gray-400">
        Connect your MetaMask wallet to view your TokenVerse holdings.
      </p>
      <button
        onClick={openConnectModal}
        className="group flex items-center gap-3 rounded-full bg-white py-2.5 pl-6 pr-2.5 text-base font-semibold text-gray-900 transition-all duration-200 hover:bg-gray-100 hover:shadow-lg hover:shadow-white/10"
      >
        Connect Wallet
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-400 transition-transform duration-200 group-hover:scale-110">
          <svg width="14" height="14" viewBox="0 0 12 12" fill="none">
            <path d="M2.5 6h7M6.5 3l3 3-3 3" stroke="#111" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </button>
    </div>
  );
}

function StatPill({ label, value }) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm">
      <span className="font-bold text-white">{value}</span>
      <span className="text-gray-400">{label}</span>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-white/5 bg-gray-900">
      <div className="aspect-square animate-pulse bg-white/5" />
      <div className="flex flex-col gap-3 p-4">
        <div className="h-4 w-3/4 animate-pulse rounded bg-white/10" />
        <div className="h-3 w-1/3 animate-pulse rounded bg-white/5" />
        <div className="mt-2 h-8 w-1/2 animate-pulse rounded bg-white/10" />
      </div>
    </div>
  );
}

function HoldingCard({ token, balance }) {
  const rarity = RARITY_CONFIG[token.rarity];
  const owned = balance != null && balance > 0n;
  const imageUrl = `${IPFS_GATEWAY}${token.imageCid}`;

  return (
    <div
      className={`
        group relative flex flex-col overflow-hidden rounded-2xl border bg-gray-900
        transition-all duration-300
        ${owned ? `hover:-translate-y-1 hover:shadow-xl ${rarity.border} ${RARITY_GLOW[token.rarity]}` : 'border-white/5 opacity-50'}
      `}
    >
      {/* Image */}
      <div className={`relative aspect-square bg-gradient-to-b ${owned ? RARITY_IMAGE_BG[token.rarity] : 'from-gray-800 to-gray-900'} p-5`}>
        <img
          src={imageUrl}
          alt={token.name}
          className={`h-full w-full object-contain drop-shadow-lg transition-transform duration-300 ${owned ? 'group-hover:scale-105' : 'grayscale'}`}
          loading="lazy"
        />

        {/* Rarity badge */}
        <span className={`absolute right-3 top-3 rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide ${owned ? rarity.badge : 'bg-white/5 text-gray-500'}`}>
          {token.rarity}
        </span>

        {/* Token ID chip */}
        <span className="absolute left-3 top-3 rounded-full bg-black/40 px-2 py-0.5 font-mono text-xs text-gray-400 backdrop-blur-sm">
          #{token.id.toString()}
        </span>
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-1 p-4">
        <h3 className="text-base font-bold text-white">{token.name}</h3>
        <span className="font-mono text-xs text-gray-500">Token ID #{token.id.toString()}</span>

        {/* Balance */}
        <div className="mt-auto border-t border-white/5 pt-3">
          {owned ? (
            <div className="flex items-end justify-between">
              <span className="text-xs text-gray-500">Balance</span>
              <span className="text-xl font-extrabold tabular-nums text-white">
                {balance.toString()}
              </span>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Balance</span>
              <span className="rounded-full bg-white/5 px-2.5 py-0.5 text-xs font-medium text-gray-500">
                Not Owned
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Inventory() {
  const { address, isConnected } = useAccount();

  const { data, isLoading } = useReadContracts({
    contracts: TOKENS.map((t) => ({
      address: TOKEN_VERSE_ADDRESS,
      abi: TOKEN_VERSE_ABI,
      functionName: 'balanceOf',
      args: [address, t.id],
    })),
    query: { enabled: !!address },
  });

  if (!isConnected) return <ConnectPrompt />;

  const balances = TOKENS.map((t, i) => ({
    token: t,
    balance: data?.[i]?.status === 'success' ? data[i].result : null,
  }));

  const totalUnits = balances.reduce((sum, { balance }) => sum + (balance ?? 0n), 0n);
  const uniqueTypes = balances.filter(({ balance }) => balance != null && balance > 0n).length;
  const hasAny = uniqueTypes > 0;

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-gray-950 px-6 py-16">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-10 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-amber-400">
            Your Holdings
          </p>

          {/* Summary stats */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <StatPill label="Total Units" value={isLoading ? '—' : totalUnits.toString()} />
            <StatPill label="Unique Types" value={isLoading ? '—' : `${uniqueTypes} / ${TOKENS.length}`} />
          </div>
        </div>

        {/* Empty state banner */}
        {!isLoading && !hasAny && (
          <div className="mb-10 flex items-center gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/5 px-6 py-4">
            <span className="text-xl">🎒</span>
            <div>
              <p className="text-sm font-semibold text-amber-300">Your inventory is empty</p>
              <p className="text-xs text-gray-400">You don't hold any TokenVerse tokens yet. Head to the mint page to get started.</p>
            </div>
          </div>
        )}

        {/* Token grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {isLoading
            ? TOKENS.map((t) => <SkeletonCard key={t.id} />)
            : balances.map(({ token, balance }) => (
                <HoldingCard key={token.id} token={token} balance={balance} />
              ))}
        </div>
      </div>
    </div>
  );
}
