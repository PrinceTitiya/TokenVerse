/* Real gas values from: forge test --gas-report / forge build --sizes */
const DEPLOY_DATA = [
  { standard: 'ERC-20',   gas: 1_297_067, bytes: 6_744,  accent: 'text-emerald-400', dot: 'bg-emerald-500', track: 'bg-emerald-500/70' },
  { standard: 'ERC-1155', gas: 2_607_789, bytes: 12_620, accent: 'text-amber-400',   dot: 'bg-amber-500',   track: 'bg-amber-500/70'   },
  { standard: 'ERC-721',  gas: 2_872_970, bytes: 13_746, accent: 'text-blue-400',    dot: 'bg-blue-500',    track: 'bg-blue-500/70'    },
];

const MINT_GROUP = [
  { label: 'ERC-20',   sublabel: 'mint()',                gas: 71_241,  bar: 'bg-emerald-500', glow: 'shadow-emerald-500/20' },
  { label: 'ERC-1155', sublabel: 'mint() single',         gas: 99_380,  bar: 'bg-amber-500',   glow: 'shadow-amber-500/20'   },
  { label: 'ERC-721',  sublabel: 'mint() with metadata',  gas: 274_354, bar: 'bg-blue-500',    glow: 'shadow-blue-500/20'    },
];

const TRANSFER_GROUP = [
  { label: 'ERC-20',   sublabel: 'transfer()',          gas: 52_167, bar: 'bg-emerald-500', glow: 'shadow-emerald-500/20' },
  { label: 'ERC-1155', sublabel: 'safeTransferFrom()',  gas: 58_991, bar: 'bg-amber-500',   glow: 'shadow-amber-500/20'   },
  { label: 'ERC-721',  sublabel: 'safeTransferFrom()',  gas: 65_927, bar: 'bg-blue-500',    glow: 'shadow-blue-500/20'    },
];

/* 5 × ERC-20 mint median (71,241) = 356,205 | 5 × ERC-721 mint median (274,354) = 1,371,770 */
const BATCH_GROUP = [
  { label: 'ERC-1155 mintBatch', sublabel: '5 token types — 1 tx',           gas: 195_676,   bar: 'bg-amber-500',   glow: 'shadow-amber-500/20', highlight: true  },
  { label: '5× ERC-20 mint',    sublabel: '5 token types — 5 separate txs',  gas: 356_205,   bar: 'bg-emerald-500', glow: 'shadow-emerald-500/10', highlight: false },
  { label: '5× ERC-721 mint',   sublabel: '5 token types — 5 separate txs',  gas: 1_371_770, bar: 'bg-blue-500',    glow: 'shadow-blue-500/10',  highlight: false },
];

function formatGas(n) {
  return n.toLocaleString('en-US');
}

function BarRow({ label, sublabel, gas, bar, glow, highlight, maxGas }) {
  const pct = Math.max(4, (gas / maxGas) * 100);
  return (
    <div className="flex items-center gap-4">
      {/* Label */}
      <div className="w-36 shrink-0">
        <span className={`text-xs font-bold ${highlight ? 'text-amber-300' : 'text-gray-300'}`}>{label}</span>
        <p className="text-[10px] text-gray-600 leading-tight">{sublabel}</p>
      </div>

      {/* Bar track */}
      <div className="flex flex-1 items-center gap-3">
        <div className="relative h-5 flex-1 overflow-hidden rounded-full bg-white/[0.04]">
          <div
            className={`h-full rounded-full ${bar} opacity-80 shadow-sm ${glow}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        {/* Gas value */}
        <div className="w-28 shrink-0 text-right">
          <span className={`font-mono text-xs font-semibold tabular-nums ${highlight ? 'text-amber-300' : 'text-gray-400'}`}>
            {(gas === 1_371_770 || gas === 356_205) ? '~' : ''}{formatGas(gas)}
          </span>
          <span className="ml-1 text-[10px] text-gray-600">gas</span>
        </div>
      </div>
    </div>
  );
}

function GroupSection({ title, subtitle, note, rows, divider }) {
  const maxGas = Math.max(...rows.map((r) => r.gas));
  return (
    <div className={divider ? 'border-b border-white/[0.06] pb-6 mb-6' : ''}>
      <div className="mb-1 flex items-baseline justify-between">
        <div className="flex items-baseline gap-3">
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{title}</span>
          <span className="text-[10px] text-gray-700">{subtitle}</span>
        </div>
        <span className="text-[10px] text-gray-600">units: gas</span>
      </div>
      {note && (
        <p className="mb-3 text-[10px] italic text-gray-600">{note}</p>
      )}
      {!note && <div className="mb-4" />}
      <div className="space-y-3">
        {rows.map((row) => (
          <BarRow key={row.label} {...row} maxGas={maxGas} />
        ))}
      </div>
    </div>
  );
}

function DeploymentTable() {
  const maxGas = Math.max(...DEPLOY_DATA.map((r) => r.gas));
  return (
    <div className="border-b border-white/[0.06] pb-6 mb-6">
      <div className="mb-4 flex items-baseline justify-between">
        <div className="flex items-baseline gap-3">
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Deployment</span>
          <span className="text-[10px] text-gray-700">one-time cost to publish the contract</span>
        </div>
        <span className="text-[10px] text-gray-600">units: gas · bytes</span>
      </div>

      {/* Bar rows */}
      <div className="mb-5 space-y-3">
        {DEPLOY_DATA.map(({ standard, gas, track }) => {
          const pct = Math.max(4, (gas / maxGas) * 100);
          return (
            <div key={standard} className="flex items-center gap-4">
              <div className="w-36 shrink-0">
                <span className="text-xs font-bold text-gray-300">{standard}</span>
                <p className="text-[10px] text-gray-600 leading-tight">constructor + bytecode upload</p>
              </div>
              <div className="flex flex-1 items-center gap-3">
                <div className="relative h-5 flex-1 overflow-hidden rounded-full bg-white/[0.04]">
                  <div className={`h-full rounded-full ${track} opacity-80`} style={{ width: `${pct}%` }} />
                </div>
                <div className="w-28 shrink-0 text-right">
                  <span className="font-mono text-xs font-semibold tabular-nums text-gray-400">
                    {formatGas(gas)}
                  </span>
                  <span className="ml-1 text-[10px] text-gray-600">gas</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary table */}
      <div className="overflow-hidden rounded-xl border border-white/[0.07]">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-white/[0.06] bg-white/[0.025]">
              <th className="py-2 pl-4 text-left font-semibold text-gray-500 uppercase tracking-wider text-[10px]">Standard</th>
              <th className="py-2 text-right font-semibold text-gray-500 uppercase tracking-wider text-[10px]">Deployment Gas</th>
              <th className="py-2 pr-4 text-right font-semibold text-gray-500 uppercase tracking-wider text-[10px]">Contract Size</th>
            </tr>
          </thead>
          <tbody>
            {DEPLOY_DATA.map(({ standard, gas, bytes, accent, dot }, i) => (
              <tr
                key={standard}
                className={`${i < DEPLOY_DATA.length - 1 ? 'border-b border-white/[0.04]' : ''}`}
              >
                <td className="py-2.5 pl-4">
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${dot}`} />
                    <span className={`font-bold ${accent}`}>{standard}</span>
                  </div>
                </td>
                <td className="py-2.5 text-right font-mono tabular-nums text-gray-300">
                  {formatGas(gas)}
                </td>
                <td className="py-2.5 pr-4 text-right font-mono tabular-nums text-gray-400">
                  {bytes.toLocaleString('en-US')} bytes
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function GasComparisonChart() {
  return (
    <section className="mb-20">
      {/* Section header */}
      <div className="mb-8">
        <h2 className="mb-2 text-2xl font-bold text-white">Gas Comparison</h2>
        <p className="text-sm text-gray-400">
          Real values measured with <span className="font-mono text-gray-300">forge test --gas-report</span> on the live TokenVerse contracts.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
        <div className="h-px w-full bg-gradient-to-r from-transparent via-rose-500/40 to-transparent" />

        <div className="p-6 md:p-8">

          {/* Color key */}
          <div className="mb-8 flex flex-wrap gap-4">
            {[
              { dot: 'bg-emerald-500', label: 'ERC-20'   },
              { dot: 'bg-blue-500',    label: 'ERC-721'  },
              { dot: 'bg-amber-500',   label: 'ERC-1155' },
              { dot: 'bg-gray-500',    label: 'Baseline comparison' },
            ].map(({ dot, label }) => (
              <div key={label} className="flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-full ${dot}`} />
                <span className="text-xs text-gray-400">{label}</span>
              </div>
            ))}
          </div>

          {/* Chart groups */}
          <GroupSection
            title="Mint — single token"
            subtitle="first mint, cold storage slot"
            note="ERC-1155 costs slightly more than ERC-20 per single mint — the efficiency advantage only appears when minting multiple token types in one batch transaction (see below)."
            rows={MINT_GROUP}
            divider
          />
          <GroupSection
            title="Transfer — single token"
            subtitle="warm storage, existing holders"
            rows={TRANSFER_GROUP}
            divider
          />
          <GroupSection
            title="Batch mint — 5 token types"
            subtitle="ERC-1155 one tx vs 5 separate ERC-721 mints"
            rows={BATCH_GROUP}
            divider
          />
          <DeploymentTable />
        </div>

        {/* Insight callouts */}
        <div className="border-t border-white/[0.06] bg-white/[0.015] px-6 py-5 md:px-8">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-gray-600">Key Takeaways</p>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              {
                stat:   '3.85×',
                label:  'ERC-721 mint costs 3.85× more than ERC-20 mint',
                detail: 'Ownership pointer + enumerable index writes per token ID',
                color:  'border-blue-500/20 bg-blue-500/5 text-blue-400',
              },
              {
                stat:   '45% – 86%',
                label:  'ERC-1155 batch beats both standards on bulk mints',
                detail: '45% cheaper than 5× ERC-20 mints · 86% cheaper than 5× ERC-721 mints',
                color:  'border-amber-500/20 bg-amber-500/5 text-amber-400',
              },
              {
                stat:   '1.26×',
                label:  'ERC-721 transfers cost 26% more than ERC-20',
                detail: '52K → 59K → 66K gas: ERC-20 cheapest, ERC-721 highest — extra owner-map writes add overhead, but the gap is far narrower than at mint time',
                color:  'border-blue-500/20 bg-blue-500/5 text-blue-400',
              },
            ].map(({ stat, label, detail, color }) => (
              <div key={stat} className={`rounded-xl border px-4 py-3 ${color}`}>
                <p className="mb-1 text-xl font-extrabold">{stat}</p>
                <p className="mb-1 text-xs font-semibold text-white leading-snug">{label}</p>
                <p className="text-[11px] text-gray-500 leading-relaxed">{detail}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
