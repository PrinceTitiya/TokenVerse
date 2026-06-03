function AddressChip({ short, color }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 font-mono text-[11px] font-medium ${color}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-60" />
      {short}
    </span>
  );
}

function ArrowRight({ color }) {
  return (
    <span className={`mx-2 text-xs ${color} opacity-50`}>──→</span>
  );
}

export default function ArchitectureVisualizer() {
  return (
    <section className="mb-20">
      <div className="mb-8">
        <h2 className="mb-2 text-2xl font-bold text-white">Architecture Visualization</h2>
        <p className="text-sm text-gray-400">
          How each standard stores ownership on-chain — from the Solidity mapping down to real wallet data.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">

        {/* ── ERC-20 ─────────────────────────────────────────────────── */}
        <div className="overflow-hidden rounded-2xl border border-emerald-500/20 bg-white/[0.03]">
          <div className="h-px w-full bg-gradient-to-r from-transparent via-emerald-500/60 to-transparent" />
          <div className="p-6">

            {/* Header */}
            <div className="mb-5">
              <span className="text-xs font-semibold uppercase tracking-widest text-emerald-400">ERC-20</span>
              <h3 className="mt-1 text-lg font-bold text-white">Balance Ledger</h3>
              <p className="mt-1 text-xs text-gray-500">
                One number per address. No token IDs — just who holds how much.
              </p>
            </div>

            {/* Solidity mapping */}
            <div className="mb-5 rounded-xl border border-white/5 bg-gray-950/80 px-4 py-3">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-gray-600">Storage</p>
              <div className="font-mono text-xs leading-relaxed">
                <span className="text-purple-400">mapping</span>
                <span className="text-gray-400">(</span>
                <span className="text-blue-300">address</span>
                <span className="text-gray-400"> =&gt; </span>
                <span className="text-amber-300">uint256</span>
                <span className="text-gray-400">)</span>
                <span className="text-gray-500"> balances</span>
              </div>
            </div>

            {/* Visual diagram */}
            <div className="rounded-xl border border-white/5 bg-gray-900/60 p-4">
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-gray-600">State</p>
              <div className="space-y-2.5">
                {[
                  { addr: '0xAlley', balance: '500', unit: 'TVG' },
                  { addr: '0xBen',   balance: '200', unit: 'TVG' },
                  { addr: '0xHazzle', balance: '0',   unit: 'TVG' },
                ].map(({ addr, balance, unit }) => (
                  <div key={addr} className="flex items-center">
                    <AddressChip short={addr} color="text-emerald-300 bg-emerald-500/10" />
                    <ArrowRight color="text-emerald-400" />
                    <span className="font-mono text-sm font-bold text-white">{balance}</span>
                    <span className="ml-1.5 text-xs text-gray-500">{unit}</span>
                  </div>
                ))}
              </div>
              <p className="mt-4 border-t border-white/5 pt-3 text-[11px] text-gray-600">
                Query: <span className="font-mono text-gray-400">balanceOf(address)</span>
              </p>
            </div>

          </div>
        </div>

        {/* ── ERC-721 ────────────────────────────────────────────────── */}
        <div className="overflow-hidden rounded-2xl border border-blue-500/20 bg-white/[0.03]">
          <div className="h-px w-full bg-gradient-to-r from-transparent via-blue-500/60 to-transparent" />
          <div className="p-6">

            {/* Header */}
            <div className="mb-5">
              <span className="text-xs font-semibold uppercase tracking-widest text-blue-400">ERC-721</span>
              <h3 className="mt-1 text-lg font-bold text-white">Ownership Registry</h3>
              <p className="mt-1 text-xs text-gray-500">
                Every token ID maps to exactly one owner address. Unique by design.
              </p>
            </div>

            {/* Solidity mapping */}
            <div className="mb-5 rounded-xl border border-white/5 bg-gray-950/80 px-4 py-3">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-gray-600">Storage</p>
              <div className="font-mono text-xs leading-relaxed">
                <span className="text-purple-400">mapping</span>
                <span className="text-gray-400">(</span>
                <span className="text-amber-300">uint256</span>
                <span className="text-gray-400"> =&gt; </span>
                <span className="text-blue-300">address</span>
                <span className="text-gray-400">)</span>
                <span className="text-gray-500"> owners</span>
              </div>
            </div>

            {/* Visual diagram */}
            <div className="rounded-xl border border-white/5 bg-gray-900/60 p-4">
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-gray-600">State</p>
              <div className="space-y-2.5">
                {[
                  { id: '#1', owner: '0xAlley' },
                  { id: '#2', owner: '0xBen'   },
                  { id: '#3', owner: '0xAlley' },
                ].map(({ id, owner }) => (
                  <div key={id} className="flex items-center">
                    <span className="w-10 font-mono text-xs font-bold text-blue-300">
                      Token{id}
                    </span>
                    <ArrowRight color="text-blue-400" />
                    <AddressChip short={owner} color="text-blue-200 bg-blue-500/10" />
                  </div>
                ))}
              </div>
              <p className="mt-4 border-t border-white/5 pt-3 text-[11px] text-gray-600">
                Query: <span className="font-mono text-gray-400">ownerOf(tokenId)</span>
              </p>
            </div>

          </div>
        </div>

        {/* ── ERC-1155 ───────────────────────────────────────────────── */}
        <div className="overflow-hidden rounded-2xl border border-amber-500/20 bg-white/[0.03]">
          <div className="h-px w-full bg-gradient-to-r from-transparent via-amber-500/60 to-transparent" />
          <div className="p-6">

            {/* Header */}
            <div className="mb-5">
              <span className="text-xs font-semibold uppercase tracking-widest text-amber-400">ERC-1155</span>
              <h3 className="mt-1 text-lg font-bold text-white">Nested Balance Matrix</h3>
              <p className="mt-1 text-xs text-gray-500">
                A balance per (tokenId, address) pair — fungible and non-fungible in one contract.
              </p>
            </div>

            {/* Solidity mapping */}
            <div className="mb-5 rounded-xl border border-white/5 bg-gray-950/80 px-4 py-3">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-gray-600">Storage</p>
              <div className="font-mono text-xs leading-relaxed">
                <span className="text-purple-400">mapping</span>
                <span className="text-gray-400">(</span>
                <span className="text-amber-300">uint256</span>
                <span className="text-gray-400"> =&gt; </span>
                <span className="text-purple-400">mapping</span>
                <span className="text-gray-400">(</span>
                <span className="text-blue-300">address</span>
                <span className="text-gray-400"> =&gt; </span>
                <span className="text-amber-300">uint256</span>
                <span className="text-gray-400">))</span>
                <span className="text-gray-500"> balances</span>
              </div>
            </div>

            {/* Visual diagram — tree structure */}
            <div className="rounded-xl border border-white/5 bg-gray-900/60 p-4">
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-gray-600">State</p>
              <div className="space-y-3">

                {/* Gold token */}
                <div>
                  <div className="mb-1.5 flex items-center gap-2">
                    <span className="rounded bg-amber-500/15 px-1.5 py-0.5 font-mono text-[11px] font-bold text-amber-300">
                      ID: 1 · Gold
                    </span>
                  </div>
                  <div className="ml-3 space-y-1.5 border-l border-white/10 pl-3">
                    {[
                      { addr: '0xAlley', bal: '500' },
                      { addr: '0xBen',   bal: '200' },
                    ].map(({ addr, bal }) => (
                      <div key={addr} className="flex items-center">
                        <span className="mr-1 text-[10px] text-gray-700">├</span>
                        <AddressChip short={addr} color="text-amber-200 bg-amber-500/10" />
                        <ArrowRight color="text-amber-400" />
                        <span className="font-mono text-sm font-bold text-white">{bal}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Dragon Sword token */}
                <div>
                  <div className="mb-1.5 flex items-center gap-2">
                    <span className="rounded bg-purple-500/15 px-1.5 py-0.5 font-mono text-[11px] font-bold text-purple-300">
                      ID: 3 · Dragon Sword
                    </span>
                  </div>
                  <div className="ml-3 space-y-1.5 border-l border-white/10 pl-3">
                    {[
                      { addr: '0xAlley', bal: '1' },
                      { addr: '0xBen',   bal: '0' },
                    ].map(({ addr, bal }) => (
                      <div key={addr} className="flex items-center">
                        <span className="mr-1 text-[10px] text-gray-700">├</span>
                        <AddressChip short={addr} color="text-amber-200 bg-amber-500/10" />
                        <ArrowRight color="text-amber-400" />
                        <span className="font-mono text-sm font-bold text-white">{bal}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <p className="mt-4 border-t border-white/5 pt-3 text-[11px] text-gray-600">
                Query: <span className="font-mono text-gray-400">balanceOf(address, id)</span>
              </p>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
