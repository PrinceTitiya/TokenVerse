import { useReadContracts } from 'wagmi';
import { TOKENS, RARITY_CONFIG, TOKEN_VERSE_ADDRESS, TOKEN_VERSE_ABI } from '../constants/contracts';

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

function SupplyValue({ status, value }) {
  if (status === 'pending') {
    return <span className="h-4 w-12 animate-pulse rounded bg-white/10" />;
  }
  if (status === 'failure' || value == null) {
    return <span className="text-gray-500">—</span>;
  }
  return <span className="tabular-nums">{value.toString()}</span>;
}

function TokenCard({ token, supplyResult }) {
  const rarity = RARITY_CONFIG[token.rarity];
  const imageUrl = `${IPFS_GATEWAY}${token.imageCid}`;

  return (
    <div
      className={`
        group relative flex flex-col overflow-hidden rounded-2xl border bg-gray-900
        transition-all duration-300 hover:-translate-y-1 hover:shadow-xl
        ${rarity.border} ${RARITY_GLOW[token.rarity]}
      `}
    >
      {/* Image */}
      <div className={`relative aspect-square bg-gradient-to-b ${RARITY_IMAGE_BG[token.rarity]} p-5`}>
        <img
          src={imageUrl}
          alt={token.name}
          className="h-full w-full object-contain drop-shadow-lg transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />

        {/* Rarity badge */}
        <span
          className={`absolute right-3 top-3 rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide ${rarity.badge}`}
        >
          {token.rarity}
        </span>

        {/* Token ID chip */}
        <span className="absolute left-3 top-3 rounded-full bg-black/40 px-2 py-0.5 text-xs font-mono text-gray-400 backdrop-blur-sm">
          #{token.id.toString()}
        </span>
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="text-base font-bold text-white">{token.name}</h3>
        <span className="font-mono text-xs text-gray-500">Token ID #{token.id.toString()}</span>
        <p className="text-xs leading-relaxed text-gray-400">{token.description}</p>

        {/* Supply row */}
        <div className="mt-auto flex items-center justify-between border-t border-white/5 pt-3">
          <span className="text-xs text-gray-500">Total Supply</span>
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

export default function Home() {
  const { data } = useReadContracts({
    contracts: TOKENS.map((t) => ({
      address: TOKEN_VERSE_ADDRESS,
      abi: TOKEN_VERSE_ABI,
      functionName: 'totalSupply',
      args: [t.id],
    })),
  });

  const sortedTokens = [...TOKENS].sort(
    (a, b) => RARITY_ORDER[a.rarity] - RARITY_ORDER[b.rarity],
  );

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-gray-950 px-6 py-16">
      <div className="mx-auto max-w-7xl">

        {/* Hero */}
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
            Five unique assets live on-chain — from common currency to legendary weapons.
            Collect, craft, and trade inside TokenVerse.
          </p>

          {/* Stats pill row */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            {[
              { label: 'Tokens', value: '5' },
              { label: 'Rarities', value: '4' },
              { label: 'Standard', value: 'ERC-1155' },
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

        {/* Why ERC-1155 */}
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
                icon: '⚡',
                title: 'One Contract, All Tokens',
                body: 'ERC-20 and ERC-721 require a fresh deployment per token type. ERC-1155 bundles unlimited token IDs into a single contract, slashing deployment cost and complexity.',
                accent: 'border-amber-500/30 hover:border-amber-500/60',
              },
              {
                icon: '🔀',
                title: 'Fungible & Non-Fungible',
                body: 'A single standard covers both: token ID 1 can be a currency (many copies, identical value) while token ID 3 is a unique sword — no separate ERC-721 contract needed.',
                accent: 'border-purple-500/30 hover:border-purple-500/60',
              },
              {
                icon: '📦',
                title: 'Batch Operations',
                body: 'Mint, transfer, or burn multiple token types in one transaction. One blockchain call instead of five cuts gas fees dramatically for games and marketplaces.',
                accent: 'border-blue-500/30 hover:border-blue-500/60',
              },
              {
                icon: '🔥',
                title: 'On-Chain Crafting',
                body: 'Burn inputs to mint outputs — all in one atomic call. TokenVerse uses this for dismantling: trade 1 Dragon Sword for 100 Dragon Glass shards, no middleman.',
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

        {/* Token grid — sorted Legendary → Common */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {sortedTokens.map((token) => {
            const originalIndex = TOKENS.findIndex((t) => t.id === token.id);
            return (
              <TokenCard
                key={token.id}
                token={token}
                supplyResult={data?.[originalIndex]}
              />
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs text-gray-500">
          <span className="font-medium uppercase tracking-widest">Rarity</span>
          {Object.entries(RARITY_CONFIG).map(([name, cfg]) => (
            <span key={name} className={`rounded-full px-3 py-1 font-semibold ${cfg.badge}`}>
              {name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
