import { Link } from 'react-router-dom';
import StandardsComparisonTable from '../components/StandardsComparisonTable.jsx';
import ArchitectureVisualizer from '../components/ArchitectureVisualizer.jsx';
import GasComparisonChart from '../components/GasComparisonChart.jsx';

/* ── Decision Tree (static) ──────────────────────────────────────────────── */

const TREE_STEPS = [
  {
    id: 1,
    q: 'Are all units identical and interchangeable — can one token be exchanged 1:1 with another?',
    hint: 'Think: currencies, stablecoins, governance tokens. Every unit is the same.',
    yes: {
      standard: 'ERC-20',
      tagline: 'Fungible Token',
      text: 'text-emerald-400',
      border: 'border-emerald-500/30',
      bg: 'bg-emerald-500/5',
      badgeBg: 'bg-emerald-500/10',
      glow: 'via-emerald-500/40',
    },
  },
  {
    id: 2,
    q: 'Does each individual asset need its own unique identity?',
    hint: 'Distinct provable ownership per item — digital art, collectibles, ENS domains.',
    yes: {
      standard: 'ERC-721',
      tagline: 'Non-Fungible Token',
      text: 'text-blue-400',
      border: 'border-blue-500/30',
      bg: 'bg-blue-500/5',
      badgeBg: 'bg-blue-500/10',
      glow: 'via-blue-500/40',
    },
  },
  {
    id: 3,
    q: 'Do you need multiple token types inside a single contract?',
    hint: 'Fungible and non-fungible together — game inventories, metaverse assets.',
    yes: {
      standard: 'ERC-1155',
      tagline: 'Multi-Token Standard',
      text: 'text-amber-400',
      border: 'border-amber-500/30',
      bg: 'bg-amber-500/5',
      badgeBg: 'bg-amber-500/10',
      glow: 'via-amber-500/40',
    },
  },
];

/* ── Tradeoff comparison data (summary synthesis) ───────────────────────── */

const TRADEOFFS = [
  {
    dimension: 'Contract simplicity',
    desc: 'Interface surface and deployment cost',
    erc20:   { label: 'Minimal',       note: '~1.3M gas deploy',          color: 'text-emerald-400' },
    erc721:  { label: 'Moderate',      note: '~2.9M gas deploy',          color: 'text-amber-400'   },
    erc1155: { label: 'Most complex',  note: '~2.6M gas deploy',          color: 'text-rose-400'    },
  },
  {
    dimension: 'Gas at scale',
    desc: 'Cost when operating on many tokens at once',
    erc20:   { label: 'Linear',        note: 'each tx is separate',        color: 'text-amber-400'   },
    erc721:  { label: 'Most expensive',note: '3.85× more than ERC-20',     color: 'text-rose-400'    },
    erc1155: { label: 'Cheapest',      note: '86% less than 5× ERC-721',   color: 'text-emerald-400' },
  },
  {
    dimension: 'DeFi composability',
    desc: 'Works out-of-the-box with DEXs, lending, vaults',
    erc20:   { label: 'Native',        note: 'every protocol supports it', color: 'text-emerald-400' },
    erc721:  { label: 'Limited',       note: 'NFT-specific markets only',  color: 'text-amber-400'   },
    erc1155: { label: 'Needs adapter', note: 'requires wrapping for DeFi', color: 'text-rose-400'    },
  },
  {
    dimension: 'Asset provenance',
    desc: 'Proving who owned a specific item and when',
    erc20:   { label: 'None',          note: 'balances are fungible',      color: 'text-gray-500'    },
    erc721:  { label: 'Complete',      note: 'per-token transfer history', color: 'text-emerald-400' },
    erc1155: { label: 'Per type only', note: 'ID-level, not token-level',  color: 'text-amber-400'   },
  },
  {
    dimension: 'Multi-asset in one contract',
    desc: 'Currencies, items, and collectibles under one address',
    erc20:   { label: 'One type only', note: null,                         color: 'text-gray-500'    },
    erc721:  { label: 'One type only', note: null,                         color: 'text-gray-500'    },
    erc1155: { label: 'Native',        note: 'any number of token IDs',    color: 'text-emerald-400' },
  },
];

function DecisionTreeStatic() {
  return (
    <div className="mx-auto max-w-3xl">
      <div className="relative pl-8">

        {/* START node — dot + pill + connector to Q1 */}
        <div className="relative mb-1">
          <div className="absolute -left-[21px] top-[7px] h-3 w-3 rounded-full border border-white/20 bg-gray-950" />
          <div className="absolute -left-[20.5px] top-[19px] h-6 w-px bg-white/10" />
          <span className="rounded-full border border-white/15 bg-white/[0.04] px-5 py-1.5 text-xs font-bold uppercase tracking-widest text-gray-500">
            Start
          </span>
        </div>

        {TREE_STEPS.map((step, idx) => {
          const isLast = idx === TREE_STEPS.length - 1;
          const { yes } = step;

          return (
            <div key={step.id} className="relative mb-1">
              {/* Spine dot */}
              <div className="absolute -left-[21px] top-[22px] h-3 w-3 rounded-full border border-purple-500/40 bg-gray-950" />

              {/* Per-step spine segment — runs from dot through NO label; stops at last question */}
              {!isLast && (
                <div className="absolute -left-[20.5px] top-[28px] bottom-0 w-px bg-white/10" />
              )}

              {/* Question card + YES result */}
              <div className="flex items-stretch gap-4">
                <div className="min-w-0 flex-1 overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]">
                  <div className="h-px w-full bg-gradient-to-r from-transparent via-purple-500/25 to-transparent" />
                  <div className="p-4">
                    <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-purple-400">
                      Question {step.id}
                    </p>
                    <p className="mb-1 text-sm font-semibold text-white leading-snug">{step.q}</p>
                    <p className="text-xs italic text-gray-500">{step.hint}</p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <div className="flex flex-col items-center gap-1.5">
                    {/* YES badge colour matches the result standard */}
                    <span className={`rounded-full border px-2.5 py-0.5 text-xs font-bold ${yes.border} ${yes.badgeBg} ${yes.text}`}>
                      YES
                    </span>
                    <div className="h-px w-8 bg-white/10" />
                  </div>

                  <div className={`w-40 shrink-0 overflow-hidden rounded-xl border ${yes.border} ${yes.bg}`}>
                    <div className={`h-px w-full bg-gradient-to-r from-transparent ${yes.glow} to-transparent`} />
                    <div className="p-3 text-center">
                      <p className={`text-[10px] font-bold uppercase tracking-wider ${yes.text}`}>Use</p>
                      <p className="mt-0.5 text-xl font-extrabold text-white">{yes.standard}</p>
                      <p className="text-[10px] text-gray-400">{yes.tagline}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* NO label — only between questions */}
              {!isLast && (
                <div className="mb-3 mt-2 pl-1">
                  <span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-0.5 text-xs font-semibold text-gray-500">
                    NO ↓
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Compare() {
  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-gray-950 px-6 py-10">
      <div className="mx-auto max-w-7xl">

        {/* ── Hero ────────────────────────────────────────────────────── */}
        <section className="mb-16">

          {/* Top label */}
          <div className="mb-4 flex items-center justify-center gap-3">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-amber-500/60" />
            <p className="text-[10px] font-semibold uppercase tracking-widest text-amber-400">
              Token Standards Explorer
            </p>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-amber-500/60" />
          </div>

          {/* Title */}
          <div className="mb-5 text-center">
            <h1 className="mb-3 text-4xl font-extrabold tracking-tight text-white leading-tight">
              One Blockchain.{' '}
              <span className="bg-gradient-to-r from-amber-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
                Three Standards.
              </span>
            </h1>
            <p className="mx-auto max-w-xl text-sm text-gray-400 leading-relaxed">
              ERC-20, ERC-721, and ERC-1155 each solve a different problem. This explorer
              walks through the architectural and practical differences — so you understand
              not just what each standard does, but <em className="text-gray-300 not-italic font-medium">why it was invented</em>.
            </p>
          </div>

          {/* Three standard pills */}
          <div className="mb-10 flex flex-wrap items-center justify-center gap-2.5">
            {[
              { label: 'ERC-20', desc: 'Fungible Currency',   color: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400' },
              { label: 'ERC-721', desc: 'Unique Ownership',   color: 'border-blue-500/40 bg-blue-500/10 text-blue-400'         },
              { label: 'ERC-1155', desc: 'Hybrid Multi-Token', color: 'border-amber-500/40 bg-amber-500/10 text-amber-400'      },
            ].map(({ label, desc, color }) => (
              <div key={label} className={`flex items-center gap-2.5 rounded-full border px-5 py-2 text-sm ${color}`}>
                <span className="font-bold">{label}</span>
                <span className="text-xs opacity-70">·</span>
                <span className="text-xs font-medium opacity-80">{desc}</span>
              </div>
            ))}
          </div>

          {/* Why different standards exist */}
          <div className="mb-8 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
            <div className="h-px w-full bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
            <div className="p-6 md:p-8">
              <div className="grid gap-8 md:grid-cols-2 md:gap-12 lg:grid-cols-[1fr_2fr]">

                {/* Left — the problem statement */}
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-purple-400">
                    The Core Problem
                  </p>
                  <h2 className="mb-3 text-xl font-bold text-white leading-snug">
                    Why doesn't one standard cover everything?
                  </h2>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    Digital assets on Ethereum aren't all the same thing. A dollar is interchangeable
                    with any other dollar. A piece of land is unique — no two plots are the same.
                    A video game inventory mixes currencies, weapons, and rare items.
                  </p>
                  <p className="mt-3 text-sm text-gray-400 leading-relaxed">
                    Each of these requires a fundamentally different data model. Forcing them into
                    a single interface would mean compromising the design for all three.
                  </p>
                </div>

                {/* Right — the three answers */}
                <div className="flex flex-col gap-4">
                  {[
                    {
                      standard: 'ERC-20',
                      problem:  'How do we represent currency on-chain?',
                      answer:   'A shared ledger of balances. Every unit is identical — no IDs, no uniqueness. The same interface powers USDC, DAI, and every governance token.',
                      accent:   'border-l-emerald-500/70 bg-emerald-500/5',
                      label:    'text-emerald-400',
                    },
                    {
                      standard: 'ERC-721',
                      problem:  'How do we prove unique digital ownership?',
                      answer:   'Each token gets an immutable ID. Ownership is tracked per ID, not per balance. This makes provenance, scarcity, and identity possible on-chain.',
                      accent:   'border-l-blue-500/70 bg-blue-500/5',
                      label:    'text-blue-400',
                    },
                    {
                      standard: 'ERC-1155',
                      problem:  'What if one contract needs both?',
                      answer:   'A single contract manages multiple token types under one address. Token IDs can be fungible (gold coins) or non-fungible (a specific sword) — batch operations reduce gas.',
                      accent:   'border-l-amber-500/70 bg-amber-500/5',
                      label:    'text-amber-400',
                    },
                  ].map(({ standard, problem, answer, accent, label }) => (
                    <div key={standard} className={`rounded-xl border-l-2 pl-5 pr-5 py-4 ${accent}`}>
                      <div className="mb-1 flex items-center gap-2">
                        <span className={`text-xs font-bold ${label}`}>{standard}</span>
                        <span className="text-xs text-gray-500">answered:</span>
                        <span className="text-xs italic text-gray-400">{problem}</span>
                      </div>
                      <p className="text-sm text-gray-300 leading-relaxed">{answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Three standard cards */}
          <div className="grid gap-4 sm:grid-cols-3">

            {/* ERC-20 */}
            <div className="group overflow-hidden rounded-2xl border border-emerald-500/20 bg-white/[0.03] transition-all duration-200 hover:border-emerald-500/40 hover:bg-emerald-500/[0.04]">
              <div className="h-px w-full bg-gradient-to-r from-transparent via-emerald-500/60 to-transparent" />
              <div className="p-5">
                <div className="mb-3 flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-emerald-400">ERC-20</span>
                    <h3 className="mt-0.5 text-base font-bold text-white">Fungible Token</h3>
                  </div>
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-emerald-400">
                      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M8 12h8M12 8v8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </div>
                </div>

                <p className="mb-4 text-xs text-gray-400 leading-relaxed">
                  All tokens are identical and interchangeable. A balance ledger, not a list of
                  owned items. The standard for currency, stablecoins, and governance.
                </p>

                <div className="mb-4 space-y-1.5">
                  {[
                    { k: 'Token model',   v: 'Balance per address'    },
                    { k: 'Uniqueness',    v: 'None — all identical'   },
                    { k: 'Transfer unit', v: 'Any decimal amount'     },
                    { k: 'Key function',  v: 'approve + transferFrom' },
                  ].map(({ k, v }) => (
                    <div key={k} className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">{k}</span>
                      <span className="font-mono text-gray-300">{v}</span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {['USDC', 'DAI', 'UNI', 'WETH'].map((t) => (
                    <span key={t} className="rounded-full border border-emerald-500/20 bg-emerald-500/5 px-2 py-0.5 font-mono text-[10px] text-emerald-300">
                      {t}
                    </span>
                  ))}
                </div>

                <Link
                  to="/erc20"
                  className="mt-4 flex items-center justify-between rounded-xl border border-emerald-500/25 bg-emerald-500/8 px-4 py-2 text-xs font-semibold text-emerald-400 transition-all duration-150 hover:border-emerald-500/50 hover:bg-emerald-500/15"
                >
                  Explore ERC-20
                  <span className="text-emerald-500">→</span>
                </Link>
              </div>
            </div>

            {/* ERC-721 */}
            <div className="group overflow-hidden rounded-2xl border border-blue-500/20 bg-white/[0.03] transition-all duration-200 hover:border-blue-500/40 hover:bg-blue-500/[0.04]">
              <div className="h-px w-full bg-gradient-to-r from-transparent via-blue-500/60 to-transparent" />
              <div className="p-5">
                <div className="mb-3 flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-blue-400">ERC-721</span>
                    <h3 className="mt-0.5 text-base font-bold text-white">Non-Fungible Token</h3>
                  </div>
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-blue-400">
                      <rect x="4" y="4" width="16" height="16" rx="3" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M9 9h6M9 13h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      <circle cx="16" cy="16" r="3" fill="currentColor" opacity=".25" />
                      <path d="M15 16h2M16 15v2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                    </svg>
                  </div>
                </div>

                <p className="mb-4 text-xs text-gray-400 leading-relaxed">
                  Every token has a unique ID and distinct owner. Ownership is tracked per token,
                  not per balance. The standard for digital art, collectibles, and identity.
                </p>

                <div className="mb-4 space-y-1.5">
                  {[
                    { k: 'Token model',   v: 'Owner per token ID'   },
                    { k: 'Uniqueness',    v: 'Every token is unique' },
                    { k: 'Transfer unit', v: 'Whole tokens only'     },
                    { k: 'Key function',  v: 'ownerOf + safeTransfer' },
                  ].map(({ k, v }) => (
                    <div key={k} className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">{k}</span>
                      <span className="font-mono text-gray-300">{v}</span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {['CryptoPunks', 'BAYC', 'ENS', 'Pudgy'].map((t) => (
                    <span key={t} className="rounded-full border border-blue-500/20 bg-blue-500/5 px-2 py-0.5 font-mono text-[10px] text-blue-300">
                      {t}
                    </span>
                  ))}
                </div>

                <Link
                  to="/erc721"
                  className="mt-4 flex items-center justify-between rounded-xl border border-blue-500/25 bg-blue-500/8 px-4 py-2 text-xs font-semibold text-blue-400 transition-all duration-150 hover:border-blue-500/50 hover:bg-blue-500/15"
                >
                  Explore ERC-721
                  <span className="text-blue-500">→</span>
                </Link>
              </div>
            </div>

            {/* ERC-1155 */}
            <div className="group overflow-hidden rounded-2xl border border-amber-500/20 bg-white/[0.03] transition-all duration-200 hover:border-amber-500/40 hover:bg-amber-500/[0.04]">
              <div className="h-px w-full bg-gradient-to-r from-transparent via-amber-500/60 to-transparent" />
              <div className="p-5">
                <div className="mb-3 flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-amber-400">ERC-1155</span>
                    <h3 className="mt-0.5 text-base font-bold text-white">Multi-Token Standard</h3>
                  </div>
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-amber-400">
                      <rect x="3" y="3" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.5" />
                      <rect x="13" y="3" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.5" />
                      <rect x="3" y="13" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.5" />
                      <rect x="13" y="13" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.5" opacity=".4" />
                    </svg>
                  </div>
                </div>

                <p className="mb-4 text-xs text-gray-400 leading-relaxed">
                  One contract, many token types. IDs can represent fungible or non-fungible tokens.
                  Batch operations make it 90%+ cheaper for games and multi-asset protocols.
                </p>

                <div className="mb-4 space-y-1.5">
                  {[
                    { k: 'Token model',   v: 'Balance per (address, id)'   },
                    { k: 'Uniqueness',    v: 'Per-ID — fungible or not'     },
                    { k: 'Transfer unit', v: 'Any amount, any ID, batched'  },
                    { k: 'Key function',  v: 'safeBatchTransferFrom'        },
                  ].map(({ k, v }) => (
                    <div key={k} className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">{k}</span>
                      <span className="font-mono text-gray-300">{v}</span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {['Enjin', 'OpenSea', 'Gods Unchained'].map((t) => (
                    <span key={t} className="rounded-full border border-amber-500/20 bg-amber-500/5 px-2 py-0.5 font-mono text-[10px] text-amber-300">
                      {t}
                    </span>
                  ))}
                </div>

                <Link
                  to="/erc1155"
                  className="mt-4 flex items-center justify-between rounded-xl border border-amber-500/25 bg-amber-500/8 px-4 py-2 text-xs font-semibold text-amber-400 transition-all duration-150 hover:border-amber-500/50 hover:bg-amber-500/15"
                >
                  Explore ERC-1155
                  <span className="text-amber-500">→</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── Section 2: Standards Comparison Table ───────────────────── */}
        <StandardsComparisonTable />

        {/* ── Section 3: Architecture Visualization ───────────────────── */}
        <ArchitectureVisualizer />

        {/* ── Section 4: Gas Comparison ───────────────────────────────── */}
        <GasComparisonChart />

        {/* ── Section 5: Decision Tree ─────────────────────────────────── */}
        <section className="mb-16">

          {/* Section label */}
          <div className="mb-4 flex items-center justify-center gap-3">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-purple-500/60" />
            <p className="text-[10px] font-semibold uppercase tracking-widest text-purple-400">
              Decision Tree
            </p>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-purple-500/60" />
          </div>

          <div className="mb-3 text-center">
            <h2 className="mb-2 text-2xl font-extrabold tracking-tight text-white">
              Which Standard Should You Use?
            </h2>
            <p className="mx-auto max-w-xl text-sm text-gray-400 leading-relaxed">
              Answer three questions and the right standard will be apparent. The logic is simple,
              but most developers skip it and reach for the wrong tool.
            </p>
          </div>

          {/* Static logic reference — three paths at a glance */}
          <div className="mb-10 mt-8 grid gap-3 sm:grid-cols-3">
            {[
              {
                q: 'Need interchangeable currency?',
                standard: 'ERC-20',
                color: 'border-emerald-500/30 bg-emerald-500/5 text-emerald-400',
                dot: 'bg-emerald-500',
              },
              {
                q: 'Need provably unique ownership?',
                standard: 'ERC-721',
                color: 'border-blue-500/30 bg-blue-500/5 text-blue-400',
                dot: 'bg-blue-500',
              },
              {
                q: 'Need both in one contract?',
                standard: 'ERC-1155',
                color: 'border-amber-500/30 bg-amber-500/5 text-amber-400',
                dot: 'bg-amber-500',
              },
            ].map(({ q, standard, color, dot }) => (
              <div key={standard} className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${color}`}>
                <span className={`h-2 w-2 shrink-0 rounded-full ${dot}`} />
                <div className="min-w-0">
                  <p className="text-xs text-gray-400 leading-snug">{q}</p>
                  <p className="mt-0.5 font-bold">{standard}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Static decision tree */}
          <DecisionTreeStatic />
        </section>

        {/* ── Final Summary ────────────────────────────────────────────── */}
        <section className="mb-8">

          {/* Section label */}
          <div className="mb-4 flex items-center justify-center gap-3">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-white/20" />
            <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
              Summary
            </p>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-white/20" />
          </div>

          <div className="mb-8 text-center">
            <h2 className="mb-2 text-2xl font-extrabold tracking-tight text-white">
              Three Standards.{' '}
              <span className="bg-gradient-to-r from-emerald-400 via-blue-400 to-amber-400 bg-clip-text text-transparent">
                One Principle.
              </span>
            </h2>
            <p className="mx-auto max-w-xl text-sm text-gray-400 leading-relaxed">
              Every token standard on Ethereum is a different answer to the same question:
              <em className="text-gray-300 not-italic font-medium"> what is the minimum data model needed to represent this type of asset?</em>
            </p>
          </div>

          {/* Tradeoff comparison — all three standards on the same dimensions */}
          <div className="mb-10 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
            <div className="h-px w-full bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] border-collapse">
                <thead>
                  <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                    <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-gray-600 w-[30%]">
                      Tradeoff dimension
                    </th>
                    {[
                      { label: 'ERC-20',   color: 'text-emerald-400' },
                      { label: 'ERC-721',  color: 'text-blue-400'    },
                      { label: 'ERC-1155', color: 'text-amber-400'   },
                    ].map(({ label, color }) => (
                      <th key={label} className="px-4 py-4 text-center w-[23%]">
                        <span className={`text-xs font-bold ${color}`}>{label}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {TRADEOFFS.map(({ dimension, desc, erc20, erc721, erc1155 }, i) => (
                    <tr
                      key={dimension}
                      className={`border-b border-white/[0.04] ${i === TRADEOFFS.length - 1 ? 'border-b-0' : ''}`}
                    >
                      <td className="px-6 py-4">
                        <p className="text-sm font-semibold text-white">{dimension}</p>
                        <p className="mt-0.5 text-[11px] leading-snug text-gray-600">{desc}</p>
                      </td>
                      {[erc20, erc721, erc1155].map((cell, ci) => (
                        <td key={ci} className="px-4 py-4 text-center">
                          <p className={`text-xs font-semibold ${cell.color}`}>{cell.label}</p>
                          {cell.note && (
                            <p className="mt-0.5 text-[10px] leading-tight text-gray-600">{cell.note}</p>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Closing statement */}
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
            <div className="h-px w-full bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />
            <div className="p-8 text-center">
              <p className="mx-auto max-w-2xl text-sm text-gray-400 leading-relaxed">
                TokenVerse deploys all three standards on Ethereum, not to demonstrate breadth, but to show that each
                standard is a deliberate engineering decision. ERC-20 for fungible currency
                (<span className="font-mono text-gray-300">TVG</span>),  ERC-721 for unique-ownership identity proofs and
                ERC-1155 for a multi-asset game inventory (gold, gems, weapons, tickets, unique cards).
                The right standard is never the most popular one but the one whose data model matches the asset.
              </p>
              <div className="mt-8 flex items-center justify-center gap-3">
                <div className="h-px w-16 bg-gradient-to-r from-transparent to-emerald-500/40" />
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500/50" />
                <div className="h-px w-8 bg-gradient-to-r from-emerald-500/40 to-amber-500/40" />
                <div className="h-2 w-2 rounded-full bg-amber-500/60" />
                <div className="h-px w-8 bg-gradient-to-r from-amber-500/40 to-blue-500/40" />
                <div className="h-1.5 w-1.5 rounded-full bg-blue-500/50" />
                <div className="h-px w-16 bg-gradient-to-r from-blue-500/40 to-transparent" />
              </div>
            </div>
          </div>

        </section>

      </div>
    </div>
  );
}
