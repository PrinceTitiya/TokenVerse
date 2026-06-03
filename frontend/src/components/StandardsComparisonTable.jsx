import { Fragment } from 'react';

const ROWS = [
  {
    group: 'Token Types',
    features: [
      { label: 'Fungible Assets',       erc20: 'yes',       erc721: 'no',      erc1155: 'yes'       },
      { label: 'Non-Fungible Tokens',   erc20: 'no',        erc721: 'yes',     erc1155: 'yes'       },
      { label: 'Semi-Fungible Assets',  erc20: 'no',        erc721: 'no',      erc1155: 'yes'       },
    ],
  },
  {
    group: 'Operations',
    features: [
      { label: 'Batch Mint',                   erc20: 'no',  erc721: 'no',  erc1155: 'yes' },
      { label: 'Batch Transfer',               erc20: 'no',  erc721: 'no',  erc1155: 'yes' },
      { label: 'Multiple Assets Per Contract', erc20: 'no',  erc721: 'no',  erc1155: 'yes' },
      { label: 'Inventory Systems',            erc20: 'no',  erc721: 'no',  erc1155: 'yes' },
    ],
  },
  {
    group: 'Features',
    features: [
      { label: 'Metadata Support', erc20: 'limited', erc721: 'yes', erc1155: 'yes' },
    ],
  },
  {
    group: 'Compatibility & Efficiency',
    features: [
      { label: 'DeFi Compatibility',   erc20: 'excellent', erc721: 'limited', erc1155: 'medium'    },
      { label: 'Gaming Compatibility', erc20: 'medium',    erc721: 'medium',  erc1155: 'excellent' },
      { label: 'Gas Efficiency',       erc20: 'medium',    erc721: 'low',     erc1155: 'high'      },
    ],
  },
];

const TIER = {
  yes:       { icon: '✓', label: 'Yes',       cls: 'text-emerald-400 bg-emerald-500/10'  },
  no:        { icon: '✕', label: 'No',        cls: 'text-gray-600   bg-white/[0.03]'     },
  limited:   { icon: '~', label: 'Limited',   cls: 'text-amber-400  bg-amber-500/10'     },
  medium:    { icon: '◑', label: 'Medium',    cls: 'text-amber-400  bg-amber-500/10'     },
  excellent: { icon: '★', label: 'Excellent', cls: 'text-emerald-400 bg-emerald-500/10'  },
  high:      { icon: '↑', label: 'High',      cls: 'text-emerald-400 bg-emerald-500/10'  },
  low:       { icon: '↓', label: 'Low',       cls: 'text-rose-400   bg-rose-500/10'      },
};

function Cell({ value }) {
  const t = TIER[value];
  return (
    <td className="px-4 py-2.5 text-center">
      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${t.cls}`}>
        <span className="text-[10px] leading-none">{t.icon}</span>
        {t.label}
      </span>
    </td>
  );
}

export default function StandardsComparisonTable() {
  return (
    <section className="mb-20">
      {/* Section header */}
      <div className="mb-8">
        <h2 className="mb-2 text-2xl font-bold text-white">Standards Comparison</h2>
        <p className="text-sm text-gray-400">
          Feature-by-feature breakdown — what each standard supports out of the box.
        </p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03]">
        <div className="h-px w-full bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />

        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-sm">

            {/* Column headers — sticky so standard names stay visible while scrolling */}
            <thead className="sticky top-20 z-10">
              <tr className="border-b border-white/5 bg-gray-950">
                <th className="px-5 py-4 text-left text-xs font-medium text-gray-500 w-[40%]">
                  Feature
                </th>
                <th className="px-4 py-4 text-center w-[20%]">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400">
                    ERC-20
                  </span>
                </th>
                <th className="px-4 py-4 text-center w-[20%]">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-400">
                    ERC-721
                  </span>
                </th>
                <th className="px-4 py-4 text-center w-[20%]">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-400">
                    ERC-1155
                  </span>
                </th>
              </tr>
            </thead>

            <tbody>
              {ROWS.map(({ group, features }, gi) => (
                <Fragment key={group}>
                  {/* Group label row */}
                  <tr className="border-b border-white/[0.04] bg-white/[0.015]">
                    <td
                      colSpan={4}
                      className="px-5 py-2 text-[10px] font-semibold uppercase tracking-widest text-gray-600"
                    >
                      {group}
                    </td>
                  </tr>

                  {/* Feature rows */}
                  {features.map(({ label, erc20, erc721, erc1155 }, fi) => (
                    <tr
                      key={label}
                      className={`border-b border-white/[0.04] transition-colors duration-100 hover:bg-white/[0.025] ${
                        gi === ROWS.length - 1 && fi === features.length - 1 ? 'border-b-0' : ''
                      }`}
                    >
                      <td className="px-5 py-2.5 text-sm text-gray-300">{label}</td>
                      <Cell value={erc20} />
                      <Cell value={erc721} />
                      <Cell value={erc1155} />
                    </tr>
                  ))}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </section>
  );
}
