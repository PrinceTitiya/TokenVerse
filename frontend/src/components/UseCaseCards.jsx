const USE_CASES = [
  {
    standard:  'ERC-20',
    title:     'Fungible Currency',
    tagline:   'Use when every unit of value is interchangeable — the identity of the token doesn\'t matter, only the amount.',
    color: {
      tag:      'text-emerald-400',
      topGrad:  'from-transparent via-emerald-500/50 to-transparent',
      border:   'border-emerald-500/20 hover:border-emerald-500/35',
      tileBg:   'border-emerald-500/10 bg-emerald-500/[0.04]',
      pill:     'border-emerald-500/20 bg-emerald-500/5 text-emerald-300',
    },
    cases: [
      {
        name:     'Stablecoins',
        why:      'Value is the unit. You send $100, not "this specific dollar token #4821."',
        examples: ['USDC', 'USDT', 'DAI'],
      },
      {
        name:     'Governance',
        why:      'Voting weight equals balance. One holder with 1,000 tokens outweighs ten with 100 each.',
        examples: ['UNI', 'COMP', 'AAVE'],
      },
      {
        name:     'DeFi Primitives',
        why:      'AMMs, lending pools, and yield aggregators assume fractional, splittable, mergeable balances.',
        examples: ['LP tokens', 'cTokens', 'aTokens'],
      },
      {
        name:     'Wrapped Assets',
        why:      'Bridge non-EVM value (ETH, BTC) into a composable, standard interface every protocol understands.',
        examples: ['WETH', 'WBTC', 'stETH'],
      },
    ],
    avoid: 'Don\'t use for unique assets — USDC as ERC-721 would make every dollar a non-splittable collectible. You couldn\'t send $0.50 or merge two balances.',
  },
  {
    standard:  'ERC-721',
    title:     'Unique Ownership',
    tagline:   'Use when the specific token — not the quantity — is what carries value. Provenance and scarcity are the product.',
    color: {
      tag:      'text-blue-400',
      topGrad:  'from-transparent via-blue-500/50 to-transparent',
      border:   'border-blue-500/20 hover:border-blue-500/35',
      tileBg:   'border-blue-500/10 bg-blue-500/[0.04]',
      pill:     'border-blue-500/20 bg-blue-500/5 text-blue-300',
    },
    cases: [
      {
        name:     'Digital Art & Collectibles',
        why:      'Provenance matters. You own this CryptoPunk #3100 — not just "a CryptoPunk."',
        examples: ['CryptoPunks', 'BAYC', 'Art Blocks'],
      },
      {
        name:     'Domain Names',
        why:      '"vitalik.eth" can have exactly one owner at any time. Uniqueness is the product.',
        examples: ['ENS', 'Unstoppable Domains'],
      },
      {
        name:     'Real World Assets',
        why:      'No two properties share location, size, and condition. Interchangeability would destroy value.',
        examples: ['Tokenized real estate', 'Luxury goods RWA'],
      },
      {
        name:     'Identity & Credentials',
        why:      'A diploma proves you completed a specific course — it can\'t be split, merged, or averaged.',
        examples: ['Soulbound tokens', 'POAPs', 'On-chain certs'],
      },
    ],
    avoid: 'Don\'t use for large item catalogs — a game with 50 item types would need 50 separate ERC-721 contract deployments, each with its own gas overhead.',
  },
  {
    standard:  'ERC-1155',
    title:     'Multi-Token Hybrid',
    tagline:   'Use when one contract needs to manage many token types — some fungible, some scarce, all transferable in batch.',
    color: {
      tag:      'text-amber-400',
      topGrad:  'from-transparent via-amber-500/50 to-transparent',
      border:   'border-amber-500/20 hover:border-amber-500/35',
      tileBg:   'border-amber-500/10 bg-amber-500/[0.04]',
      pill:     'border-amber-500/20 bg-amber-500/5 text-amber-300',
    },
    cases: [
      {
        name:     'Game Inventories',
        why:      'Gold coins (fungible), legendary sword (NFT), health potions (semi-fungible) — all in one contract address.',
        examples: ['Enjin', 'Gods Unchained', 'TokenVerse'],
      },
      {
        name:     'Event Ticketing',
        why:      'Batch-mint 10,000 GA tickets in one tx. VIP seats are unique; standing tickets are fungible within their tier.',
        examples: ['Concert tickets', 'Festival passes', 'Sports events'],
      },
      {
        name:     'Metaverse Assets',
        why:      'Land parcels (NFT), in-world currency (fungible), wearable drops (limited supply) — unified under one address.',
        examples: ['Decentraland', 'The Sandbox'],
      },
      {
        name:     'Multi-Reward Drops',
        why:      'Send 10 different achievement badges to 100 winners in a single transaction instead of 1,000 separate calls.',
        examples: ['Achievement systems', 'Airdrop campaigns', 'Loyalty tiers'],
      },
    ],
    avoid: 'Avoid for pure DeFi composability — protocols like Uniswap and Aave expect the ERC-20 interface. ERC-1155 tokens won\'t plug into existing DeFi primitives without a wrapper.',
  },
];

function WarnIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" className="mt-0.5 shrink-0 text-rose-400">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 8v5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="16.5" r="1" fill="currentColor" />
    </svg>
  );
}

function StandardBlock({ standard, title, tagline, color, cases, avoid }) {
  return (
    <div className={`overflow-hidden rounded-2xl border ${color.border} bg-white/[0.03] transition-colors duration-200`}>
      <div className={`h-px w-full bg-gradient-to-r ${color.topGrad}`} />
      <div className="p-6 md:p-8">

        {/* Header */}
        <div className="mb-6">
          <div className="mb-1 flex flex-wrap items-baseline gap-2">
            <span className={`text-xs font-bold uppercase tracking-widest ${color.tag}`}>{standard}</span>
            <span className="text-gray-700 text-xs">·</span>
            <span className="text-sm font-semibold text-white">{title}</span>
          </div>
          <p className="text-xs text-gray-500 leading-relaxed">{tagline}</p>
        </div>

        {/* Use case tiles — 2-col mobile, 4-col desktop */}
        <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {cases.map(({ name, why, examples }) => (
            <div key={name} className={`flex flex-col rounded-xl border p-4 ${color.tileBg}`}>
              <p className="mb-1.5 text-xs font-bold text-white leading-snug">{name}</p>
              <p className="mb-3 flex-1 text-[11px] text-gray-500 leading-relaxed">{why}</p>
              <div className="flex flex-wrap gap-1.5">
                {examples.map((ex) => (
                  <span
                    key={ex}
                    className={`rounded-full border px-2 py-0.5 font-mono text-[10px] ${color.pill}`}
                  >
                    {ex}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Avoid callout */}
        <div className="flex items-start gap-2.5 rounded-xl border border-rose-500/15 bg-rose-500/[0.04] px-4 py-3">
          <WarnIcon />
          <p className="text-[11px] text-gray-400 leading-relaxed">
            <span className="font-semibold text-rose-400">Don't use here — </span>
            {avoid}
          </p>
        </div>

      </div>
    </div>
  );
}

export default function UseCaseCards() {
  return (
    <section className="mb-20">
      <div className="mb-8">
        <h2 className="mb-2 text-2xl font-bold text-white">Real World Use Cases</h2>
        <p className="text-sm text-gray-400">
          Each standard was invented to solve a specific class of problem. Picking the wrong one doesn't just
          waste gas — it makes the system{' '}
          <span className="font-medium text-gray-300">architecturally incorrect</span>.
        </p>
      </div>

      <div className="space-y-5">
        {USE_CASES.map((uc) => (
          <StandardBlock key={uc.standard} {...uc} />
        ))}
      </div>
    </section>
  );
}
