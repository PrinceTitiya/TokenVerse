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
    <div className="min-h-[calc(100vh-5rem)] bg-gray-950 px-6 py-16">
      <div className="mx-auto max-w-7xl">

        {/* ── Hero ────────────────────────────────────────────────────── */}
        <section className="mb-20">

          {/* Top label */}
          <div className="mb-6 flex items-center justify-center gap-3">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-amber-500/60" />
            <p className="text-xs font-semibold uppercase tracking-widest text-amber-400">
              Token Standards Explorer
            </p>
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-amber-500/60" />
          </div>

          {/* Title */}
          <div className="mb-6 text-center">
            <h1 className="mb-4 text-5xl font-extrabold tracking-tight text-white leading-tight">
              One Blockchain.{' '}
              <span className="bg-gradient-to-r from-amber-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
                Three Standards.
              </span>
            </h1>
            <p className="mx-auto max-w-2xl text-base text-gray-400 leading-relaxed">
              ERC-20, ERC-721, and ERC-1155 each solve a different problem. This explorer
              walks through the architectural and practical differences — so you understand
              not just what each standard does, but <em className="text-gray-300 not-italic font-medium">why it was invented</em>.
            </p>
          </div>

          {/* Three standard pills */}
          <div className="mb-14 flex flex-wrap items-center justify-center gap-3">
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
          <div className="mb-12 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
            <div className="h-px w-full bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
            <div className="p-8 md:p-10">
              <div className="grid gap-8 md:grid-cols-2 md:gap-12 lg:grid-cols-[1fr_2fr]">

                {/* Left — the problem statement */}
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-purple-400">
                    The Core Problem
                  </p>
                  <h2 className="mb-4 text-2xl font-bold text-white leading-snug">
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
          <div className="grid gap-5 sm:grid-cols-3">

            {/* ERC-20 */}
            <div className="group overflow-hidden rounded-2xl border border-emerald-500/20 bg-white/[0.03] transition-all duration-200 hover:border-emerald-500/40 hover:bg-emerald-500/[0.04]">
              <div className="h-px w-full bg-gradient-to-r from-transparent via-emerald-500/60 to-transparent" />
              <div className="p-6">
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-widest text-emerald-400">ERC-20</span>
                    <h3 className="mt-1 text-xl font-bold text-white">Fungible Token</h3>
                  </div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-emerald-400">
                      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M8 12h8M12 8v8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </div>
                </div>

                <p className="mb-5 text-sm text-gray-400 leading-relaxed">
                  All tokens are identical and interchangeable. A balance ledger, not a list of
                  owned items. The standard for currency, stablecoins, and governance.
                </p>

                <div className="mb-5 space-y-2">
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

                <div className="flex flex-wrap gap-2">
                  {['USDC', 'DAI', 'UNI', 'WETH'].map((t) => (
                    <span key={t} className="rounded-full border border-emerald-500/20 bg-emerald-500/5 px-2.5 py-0.5 font-mono text-xs text-emerald-300">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* ERC-721 */}
            <div className="group overflow-hidden rounded-2xl border border-blue-500/20 bg-white/[0.03] transition-all duration-200 hover:border-blue-500/40 hover:bg-blue-500/[0.04]">
              <div className="h-px w-full bg-gradient-to-r from-transparent via-blue-500/60 to-transparent" />
              <div className="p-6">
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-widest text-blue-400">ERC-721</span>
                    <h3 className="mt-1 text-xl font-bold text-white">Non-Fungible Token</h3>
                  </div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-blue-400">
                      <rect x="4" y="4" width="16" height="16" rx="3" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M9 9h6M9 13h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      <circle cx="16" cy="16" r="3" fill="currentColor" opacity=".25" />
                      <path d="M15 16h2M16 15v2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                    </svg>
                  </div>
                </div>

                <p className="mb-5 text-sm text-gray-400 leading-relaxed">
                  Every token has a unique ID and distinct owner. Ownership is tracked per token,
                  not per balance. The standard for digital art, collectibles, and identity.
                </p>

                <div className="mb-5 space-y-2">
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

                <div className="flex flex-wrap gap-2">
                  {['CryptoPunks', 'BAYC', 'ENS', 'Pudgy'].map((t) => (
                    <span key={t} className="rounded-full border border-blue-500/20 bg-blue-500/5 px-2.5 py-0.5 font-mono text-xs text-blue-300">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* ERC-1155 */}
            <div className="group overflow-hidden rounded-2xl border border-amber-500/20 bg-white/[0.03] transition-all duration-200 hover:border-amber-500/40 hover:bg-amber-500/[0.04]">
              <div className="h-px w-full bg-gradient-to-r from-transparent via-amber-500/60 to-transparent" />
              <div className="p-6">
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-widest text-amber-400">ERC-1155</span>
                    <h3 className="mt-1 text-xl font-bold text-white">Multi-Token Standard</h3>
                  </div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-amber-400">
                      <rect x="3" y="3" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.5" />
                      <rect x="13" y="3" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.5" />
                      <rect x="3" y="13" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.5" />
                      <rect x="13" y="13" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.5" opacity=".4" />
                    </svg>
                  </div>
                </div>

                <p className="mb-5 text-sm text-gray-400 leading-relaxed">
                  One contract, many token types. IDs can represent fungible or non-fungible tokens.
                  Batch operations make it 90%+ cheaper for games and multi-asset protocols.
                </p>

                <div className="mb-5 space-y-2">
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

                <div className="flex flex-wrap gap-2">
                  {['Enjin', 'OpenSea', 'Gods Unchained', 'TokenVerse'].map((t) => (
                    <span key={t} className="rounded-full border border-amber-500/20 bg-amber-500/5 px-2.5 py-0.5 font-mono text-xs text-amber-300">
                      {t}
                    </span>
                  ))}
                </div>
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
        <section className="mb-20">

          {/* Section label */}
          <div className="mb-6 flex items-center justify-center gap-3">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-purple-500/60" />
            <p className="text-xs font-semibold uppercase tracking-widest text-purple-400">
              Decision Tree
            </p>
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-purple-500/60" />
          </div>

          <div className="mb-3 text-center">
            <h2 className="mb-3 text-3xl font-extrabold tracking-tight text-white">
              Which Standard Should You Use?
            </h2>
            <p className="mx-auto max-w-xl text-sm text-gray-400 leading-relaxed">
              Answer three questions and the right standard will be apparent. The logic is simple —
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
          <div className="mb-6 flex items-center justify-center gap-3">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-white/20" />
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
              Summary
            </p>
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-white/20" />
          </div>

          <div className="mb-10 text-center">
            <h2 className="mb-3 text-3xl font-extrabold tracking-tight text-white">
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

          {/* Quick-reference cards */}
          <div className="mb-10 grid gap-5 sm:grid-cols-3">
            {[
              {
                standard: 'ERC-20',
                tagline: 'Fungible Currency',
                colorLabel: 'text-emerald-400',
                border: 'border-emerald-500/20 hover:border-emerald-500/40',
                glow: 'via-emerald-500/40',
                bg: 'hover:bg-emerald-500/[0.03]',
                dot: 'bg-emerald-500',
                model: 'mapping(address → uint256)',
                principle: 'Every unit is identical. The contract tracks balances, not individual tokens.',
                when: [
                  'The asset should be divisible',
                  'All units are worth the same',
                  'DeFi composability is required',
                ],
              },
              {
                standard: 'ERC-721',
                tagline: 'Non-Fungible Token',
                colorLabel: 'text-blue-400',
                border: 'border-blue-500/20 hover:border-blue-500/40',
                glow: 'via-blue-500/40',
                bg: 'hover:bg-blue-500/[0.03]',
                dot: 'bg-blue-500',
                model: 'mapping(uint256 → address)',
                principle: 'Every token has a unique ID. Ownership is tracked per item, not per balance.',
                when: [
                  'Each token must be distinct',
                  'Provenance and scarcity matter',
                  'On-chain identity is the goal',
                ],
              },
              {
                standard: 'ERC-1155',
                tagline: 'Multi-Token Standard',
                colorLabel: 'text-amber-400',
                border: 'border-amber-500/20 hover:border-amber-500/40',
                glow: 'via-amber-500/40',
                bg: 'hover:bg-amber-500/[0.03]',
                dot: 'bg-amber-500',
                model: 'mapping(uint256 → mapping(address → uint256))',
                principle: 'One contract manages many token types. IDs can be fungible, non-fungible, or both.',
                when: [
                  'Multiple asset types in one system',
                  'Batch operations reduce gas costs',
                  'Gaming, metaverse, or hybrid protocols',
                ],
              },
            ].map(({ standard, tagline, colorLabel, border, glow, bg, dot, model, principle, when }) => (
              <div
                key={standard}
                className={`group overflow-hidden rounded-2xl border bg-white/[0.02] transition-all duration-200 ${border} ${bg}`}
              >
                <div className={`h-px w-full bg-gradient-to-r from-transparent ${glow} to-transparent`} />
                <div className="p-6">
                  <p className={`mb-0.5 text-xs font-bold uppercase tracking-widest ${colorLabel}`}>{standard}</p>
                  <h3 className="mb-3 text-lg font-bold text-white">{tagline}</h3>
                  <p className="mb-4 font-mono text-[11px] text-gray-500 leading-relaxed">{model}</p>
                  <p className="mb-5 text-xs text-gray-400 leading-relaxed">{principle}</p>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-600">Choose when</p>
                  <ul className="space-y-1.5">
                    {when.map((w) => (
                      <li key={w} className="flex items-start gap-2 text-xs text-gray-400">
                        <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${dot}`} />
                        {w}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          {/* Closing statement */}
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
            <div className="h-px w-full bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />
            <div className="p-8 text-center">
              <p className="mx-auto max-w-2xl text-sm text-gray-400 leading-relaxed">
                TokenVerse deploys all three standards on Ethereum — not to demonstrate breadth, but to show that each
                standard is a deliberate engineering decision. ERC-20 for fungible currency
                (<span className="font-mono text-gray-300">TVG</span>), ERC-1155 for a multi-asset game inventory
                (gold, gems, weapons, tickets), and ERC-721 (Phase 3 — in progress) for unique-ownership identity proofs.
                The right standard is never the most popular one — it is the one whose data model matches the asset.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                {[
                  { label: 'ERC-20 · TVG Token',       color: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/5' },
                  { label: 'ERC-1155 · Game Inventory', color: 'border-amber-500/30 text-amber-400 bg-amber-500/5'       },
                  { label: 'ERC-721 · Unique Assets',   color: 'border-blue-500/30 text-blue-400 bg-blue-500/5'         },
                ].map(({ label, color }) => (
                  <span key={label} className={`rounded-full border px-3 py-1 text-xs font-medium ${color}`}>
                    {label}
                  </span>
                ))}
              </div>
            </div>
          </div>

        </section>

      </div>
    </div>
  );
}
