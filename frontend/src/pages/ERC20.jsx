import { useEffect } from 'react';
import { useAccount, useReadContracts, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { TOKEN_VERSE_ERC20_ADDRESS, TOKEN_VERSE_ERC20_ABI } from '../constants/contracts';
import { formatUnits } from 'viem';

/* ─── format TVG balance ───────────────────────────────────── */
function formatTVG(raw) {
  if (raw == null) return '—';
  const n = parseFloat(formatUnits(raw, 18));
  return n.toLocaleString('en-US', { maximumFractionDigits: 2 });
}

/* ─── faucet section ───────────────────────────────────────── */
function FaucetSection() {
  const { address, isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();

  const { data, isLoading, refetch } = useReadContracts({
    contracts: [
      { address: TOKEN_VERSE_ERC20_ADDRESS, abi: TOKEN_VERSE_ERC20_ABI, functionName: 'balanceOf', args: [address ?? '0x0000000000000000000000000000000000000000'] },
      { address: TOKEN_VERSE_ERC20_ADDRESS, abi: TOKEN_VERSE_ERC20_ABI, functionName: 'hasClaimed', args: [address ?? '0x0000000000000000000000000000000000000000'] },
      { address: TOKEN_VERSE_ERC20_ADDRESS, abi: TOKEN_VERSE_ERC20_ABI, functionName: 'totalFaucetClaims' },
    ],
    query: { enabled: !!TOKEN_VERSE_ERC20_ADDRESS },
  });

  const balance       = data?.[0]?.status === 'success' ? data[0].result : null;
  const alreadyClaimed = data?.[1]?.status === 'success' ? data[1].result : false;
  const totalClaims   = data?.[2]?.status === 'success' ? data[2].result : null;
  const faucetDepleted = totalClaims != null && totalClaims >= 100n;

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
    writeContract({ address: TOKEN_VERSE_ERC20_ADDRESS, abi: TOKEN_VERSE_ERC20_ABI, functionName: 'faucet' });
  }

  /* ── button state ── */
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
          1 000 TVG received!
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
    if (faucetDepleted) {
      return (
        <div className="flex items-center justify-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/5 py-3 text-sm font-semibold text-rose-400">
          Faucet Depleted — 100 / 100 claimed
        </div>
      );
    }
    return (
      <button
        onClick={handleClaim}
        className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-amber-500 py-3 text-sm font-bold text-gray-950 transition-all duration-200 hover:opacity-90"
      >
        Claim 1 000 TVG
      </button>
    );
  }

  return (
    <div className="mb-14 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
      <div className="h-px w-full bg-gradient-to-r from-transparent via-emerald-500/60 to-transparent" />

      <div className="p-8">
        <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-emerald-400">
          Live Interaction
        </p>
        <h2 className="mb-1 text-xl font-bold text-white">Faucet — Claim 1 000 TVG</h2>
        <p className="mb-6 text-sm text-gray-400">
          Public function — any wallet can claim once while the cap hasn't been reached.
        </p>

        <div className="grid gap-6 md:grid-cols-2">

          {/* Left — stats */}
          <div className="flex flex-col gap-4">

            {/* Balance */}
            <div className="rounded-xl border border-white/5 bg-gray-900/60 p-5">
              <p className="mb-1 text-xs font-medium text-gray-500">Your TVG Balance</p>
              {isLoading ? (
                <div className="h-8 w-32 animate-pulse rounded bg-white/10" />
              ) : (
                <p className="text-3xl font-extrabold tabular-nums text-white">
                  {isConnected ? formatTVG(balance) : '—'}
                  <span className="ml-2 text-base font-semibold text-gray-500">TVG</span>
                </p>
              )}
            </div>

            {/* Faucet counter */}
            <div className="rounded-xl border border-white/5 bg-gray-900/60 p-5">
              <p className="mb-2 text-xs font-medium text-gray-500">Faucet Claims</p>
              <div className="mb-2 flex items-end justify-between">
                <span className="text-2xl font-extrabold tabular-nums text-white">
                  {totalClaims != null ? totalClaims.toString() : '—'}
                </span>
                <span className="text-sm text-gray-500">/ 100</span>
              </div>
              {/* progress bar */}
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-amber-500 transition-all duration-500"
                  style={{ width: totalClaims != null ? `${(Number(totalClaims) / 100) * 100}%` : '0%' }}
                />
              </div>
              <p className="mt-2 text-xs text-gray-600">
                {totalClaims != null ? 100 - Number(totalClaims) : '—'} claims remaining
              </p>
            </div>
          </div>

          {/* Right — claim button + status */}
          <div className="flex flex-col gap-4">
            <div className="rounded-xl border border-white/5 bg-gray-900/60 p-5 flex flex-col gap-4">
              <div>
                <p className="mb-1 text-xs font-medium text-gray-500">What you'll receive</p>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-extrabold text-white">1 000</span>
                  <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-bold text-emerald-400">TVG</span>
                </div>
              </div>

              <div className="border-t border-white/5 pt-4">
                <ClaimButton />
              </div>

              {/* write error feedback */}
              {writeError && !isPending && !isConfirmed && (
                <p className="text-center text-xs text-rose-400">
                  Transaction rejected or failed. Try again.
                </p>
              )}

              {/* claim status badge */}
              {isConnected && !isLoading && (
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <span>Claim status</span>
                  <span className={alreadyClaimed ? 'text-blue-400' : faucetDepleted ? 'text-rose-400' : 'text-emerald-400'}>
                    {alreadyClaimed ? 'Used' : faucetDepleted ? 'Depleted' : 'Available'}
                  </span>
                </div>
              )}
            </div>

            {/* function signature callout */}
            <div className="rounded-xl border border-white/5 bg-gray-950/60 px-4 py-3">
              <p className="mb-1 text-xs text-gray-600">Calling on-chain</p>
              <div className="font-mono text-xs text-gray-300">
                <span className="text-emerald-400">faucet</span>
                <span className="text-gray-500">()</span>
                <span className="ml-2 text-gray-600">→ mints 1 000 TVG</span>
              </div>
              <div className="mt-1 font-mono text-xs text-gray-600">
                contract: {TOKEN_VERSE_ERC20_ADDRESS
                  ? `${TOKEN_VERSE_ERC20_ADDRESS.slice(0, 8)}…${TOKEN_VERSE_ERC20_ADDRESS.slice(-6)}`
                  : 'not deployed'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ERC20() {
  return (
    <div className="min-h-[calc(100vh-5rem)] bg-gray-950 px-6 py-16">
      <div className="mx-auto max-w-7xl">

        {/* ── Hero ──────────────────────────────────────────────────── */}
        <div className="mb-14 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-emerald-400">
            ERC-20 · Fungible Tokens
          </p>
          <h1 className="mb-4 text-5xl font-extrabold tracking-tight text-white">
            TokenVerse{' '}
            <span className="bg-gradient-to-r from-emerald-400 to-amber-400 bg-clip-text text-transparent">
              Gold
            </span>
          </h1>
          <p className="mx-auto max-w-2xl text-base text-gray-400">
            The standard behind every DeFi protocol, stablecoin, and governance token.
            Interact with a live ERC-20 — claim from the faucet, transfer, approve a spender,
            and watch how supply changes.
          </p>

          {/* Stat pills */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            {[
              { label: 'Standard',     value: 'ERC-20'  },
              { label: 'Symbol',       value: 'TVG'     },
              { label: 'Decimals',     value: '18'      },
              { label: 'Faucet cap',   value: '100'     },
              { label: 'Per claim',    value: '1 000'   },
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

        {/* ── Why ERC-20 ─────────────────────────────────────────────── */}
        <div className="mb-14 text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-purple-400">
            The Standard
          </p>
          <h2 className="mb-3 text-2xl font-bold text-white">Why ERC-20?</h2>
          <p className="mx-auto mb-8 max-w-xl text-sm text-gray-400">
            ERC-20 is the most deployed token standard in existence. Understanding it is
            understanding how value moves on Ethereum.
          </p>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: '🪙',
                title: 'Perfectly Fungible',
                body: 'Every TVG token is identical — 1 TVG always equals 1 TVG. No token IDs, no rarity, no uniqueness. This is what makes them usable as currency, fees, or collateral.',
                accent: 'border-emerald-500/30 hover:border-emerald-500/60',
              },
              {
                icon: '🔐',
                title: 'The Allowance Mechanism',
                body: 'Before ERC-20, no standard existed for letting a smart contract spend tokens on your behalf. approve() + transferFrom() solved this and made DEXes, lending protocols, and DeFi possible.',
                accent: 'border-blue-500/30 hover:border-blue-500/60',
              },
              {
                icon: '🌐',
                title: 'Powers All of DeFi',
                body: 'USDT, USDC, DAI, WETH, UNI, AAVE — every major DeFi asset is an ERC-20. The same four functions (transfer, approve, transferFrom, balanceOf) power trillions in daily volume.',
                accent: 'border-amber-500/30 hover:border-amber-500/60',
              },
              {
                icon: '⚡',
                title: 'Public Faucet',
                body: 'Unlike the ERC-1155 Mint Lab which is owner-only, the TVG faucet is open to anyone. Any wallet can claim 1 000 TVG once — no deployer access needed.',
                accent: 'border-purple-500/30 hover:border-purple-500/60',
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

        {/* ── Education Box ──────────────────────────────────────────── */}
        <div className="mb-14 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
          {/* top accent */}
          <div className="h-px w-full bg-gradient-to-r from-transparent via-emerald-500/60 to-transparent" />

          <div className="p-8">
            <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-emerald-400">
              How It Works
            </p>
            <h2 className="mb-6 text-xl font-bold text-white">ERC-20 Core Functions</h2>

            <div className="grid gap-6 md:grid-cols-3">

              {/* faucet() */}
              <div className="rounded-xl border border-white/5 bg-gray-900/60 p-5">
                <div className="mb-3 flex items-center gap-2">
                  <span className="rounded-lg bg-emerald-500/10 px-2.5 py-1 font-mono text-xs font-bold text-emerald-400">
                    faucet()
                  </span>
                  <span className="text-xs text-gray-500">Public</span>
                </div>
                <p className="mb-4 text-xs leading-relaxed text-gray-400">
                  Anyone can call this once to receive{' '}
                  <span className="font-mono text-gray-300">1 000 TVG</span>. The contract
                  tracks claims via a{' '}
                  <span className="font-mono text-gray-300">mapping(address =&gt; bool)</span>{' '}
                  and reverts with{' '}
                  <span className="font-mono text-gray-300">AlreadyClaimed</span> on a second
                  attempt. After 100 total claims it permanently reverts with{' '}
                  <span className="font-mono text-gray-300">FaucetDepleted</span>.
                </p>
                <div className="rounded-lg bg-gray-950/80 px-4 py-3 font-mono text-xs text-gray-300">
                  <span className="text-emerald-400">faucet</span>
                  <span className="text-gray-500">()</span>
                  <br />
                  <span className="text-gray-600">// mints 1 000 TVG → msg.sender</span>
                </div>
                <p className="mt-3 text-xs text-gray-500">
                  <span className="text-emerald-400/80">No owner required</span> — any wallet,
                  any time, while claims remain.
                </p>
              </div>

              {/* transfer() */}
              <div className="rounded-xl border border-white/5 bg-gray-900/60 p-5">
                <div className="mb-3 flex items-center gap-2">
                  <span className="rounded-lg bg-amber-500/10 px-2.5 py-1 font-mono text-xs font-bold text-amber-400">
                    transfer()
                  </span>
                  <span className="text-xs text-gray-500">Holder</span>
                </div>
                <p className="mb-4 text-xs leading-relaxed text-gray-400">
                  Moves tokens directly from{' '}
                  <span className="font-mono text-gray-300">msg.sender</span> to a recipient.
                  No approval step needed — you push your own tokens. The EVM deducts from
                  your balance and credits the recipient atomically, then emits a{' '}
                  <span className="font-mono text-gray-300">Transfer</span> event.
                </p>
                <div className="rounded-lg bg-gray-950/80 px-4 py-3 font-mono text-xs text-gray-300">
                  <span className="text-amber-400">transfer</span>
                  <span className="text-gray-500">(</span>
                  <span className="text-amber-300">address</span> to,{' '}
                  <span className="text-amber-300">uint256</span> amount
                  <span className="text-gray-500">)</span>
                </div>
                <p className="mt-3 text-xs text-gray-500">
                  <span className="text-amber-400/80">totalSupply unchanged</span> — tokens
                  move between wallets, none are created or destroyed.
                </p>
              </div>

              {/* approve + transferFrom */}
              <div className="rounded-xl border border-white/5 bg-gray-900/60 p-5">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span className="rounded-lg bg-blue-500/10 px-2.5 py-1 font-mono text-xs font-bold text-blue-400">
                    approve()
                  </span>
                  <span className="text-xs text-gray-500">+</span>
                  <span className="rounded-lg bg-purple-500/10 px-2.5 py-1 font-mono text-xs font-bold text-purple-400">
                    transferFrom()
                  </span>
                </div>
                <p className="mb-4 text-xs leading-relaxed text-gray-400">
                  The two-step allowance flow. First the owner calls{' '}
                  <span className="font-mono text-gray-300">approve(spender, amount)</span> to
                  grant a spending limit. Then the spender calls{' '}
                  <span className="font-mono text-gray-300">transferFrom(owner, to, amount)</span>{' '}
                  to pull tokens. This is how every DEX swap and lending protocol works.
                </p>
                <div className="rounded-lg bg-gray-950/80 px-4 py-3 font-mono text-xs text-gray-300 space-y-1">
                  <div>
                    <span className="text-blue-400">approve</span>
                    <span className="text-gray-500">(spender, 500)</span>
                  </div>
                  <div>
                    <span className="text-purple-400">transferFrom</span>
                    <span className="text-gray-500">(owner, to, 300)</span>
                  </div>
                  <div className="text-gray-600">
                    {'// allowance: 500 → 200'}
                  </div>
                </div>
                <p className="mt-3 text-xs text-gray-500">
                  <span className="text-blue-400/80">allowance decreases</span> with each pull —
                  the spender can never exceed what was approved.
                </p>
              </div>
            </div>

            {/* burn callout */}
            <div className="mt-6 grid gap-4 md:grid-cols-2">

              {/* burn */}
              <div className="flex items-start gap-3 rounded-xl border border-rose-500/15 bg-rose-500/5 px-5 py-4">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="mt-0.5 shrink-0 text-rose-400">
                  <path d="M8 2C6 5 3 6.5 3 9.5a5 5 0 0 0 10 0C13 6.5 10 5 8 2Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
                  <path d="M8 12a2 2 0 0 1-2-2c0-1.5 2-3 2-3s2 1.5 2 3a2 2 0 0 1-2 2Z" fill="currentColor" opacity=".4" />
                </svg>
                <div>
                  <p className="mb-1 text-xs font-semibold text-rose-300">
                    burn() — Deflationary Supply
                  </p>
                  <p className="text-xs leading-relaxed text-gray-400">
                    Any holder can destroy their own tokens by calling{' '}
                    <span className="font-mono text-gray-300">burn(amount)</span>. This
                    permanently reduces <span className="font-mono text-gray-300">totalSupply</span>{' '}
                    — unlike a transfer to <span className="font-mono text-gray-300">address(0)</span>{' '}
                    which moves tokens without updating the supply counter.
                    <span className="font-mono text-gray-300"> burnFrom(owner, amount)</span> lets
                    an approved spender burn on someone else's behalf.
                  </p>
                </div>
              </div>

              {/* no owner required callout */}
              <div className="flex items-start gap-3 rounded-xl border border-emerald-500/15 bg-emerald-500/5 px-5 py-4">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="mt-0.5 shrink-0 text-emerald-400">
                  <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.3" />
                  <path d="M5.5 8.5l2 2 3-3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div>
                  <p className="mb-1 text-xs font-semibold text-emerald-300">
                    ERC-20 vs ERC-1155 Mint Lab
                  </p>
                  <p className="text-xs leading-relaxed text-gray-400">
                    The Mint Lab requires you to be the contract owner. This page does not.
                    The <span className="font-mono text-gray-300">faucet()</span>, {' '}
                    <span className="font-mono text-gray-300">transfer()</span>, {' '}
                    <span className="font-mono text-gray-300">approve()</span>, and {' '}
                    <span className="font-mono text-gray-300">burn()</span> functions are all
                    callable by any wallet — demonstrating a real permissionless token
                    as it would exist in production.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Faucet ────────────────────────────────────────────────── */}
        <FaucetSection />

        {/* ── Where is ERC-20 used? ──────────────────────────────────── */}
        <div className="text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-amber-400">
            Real World
          </p>
          <h2 className="mb-3 text-2xl font-bold text-white">Where ERC-20 Lives</h2>
          <p className="mx-auto mb-8 max-w-xl text-sm text-gray-400">
            Every token below works because the underlying asset is <span className="font-medium text-gray-300">fungible by design</span> — the identity of a specific token never matters, only the amount.
          </p>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              {
                category: 'Stablecoins',
                examples: ['USDT', 'USDC', 'DAI'],
                description: 'Fungibility is the requirement — USDC #42 must equal USDC #43, always. ERC-20\'s balance model enforces this automatically. An ERC-721 stablecoin would make every dollar a non-interchangeable collectible.',
                accent: 'border-emerald-500/20 hover:border-emerald-500/40',
                badge: 'bg-emerald-500/10 text-emerald-400',
              },
              {
                category: 'Governance',
                examples: ['UNI', 'AAVE', 'COMP'],
                description: 'Voting weight is a number, not a token ID. 1,000 UNI = 1,000 votes regardless of which specific tokens you hold. The balance model makes delegation, splitting, and on-chain tallying trivial.',
                accent: 'border-purple-500/20 hover:border-purple-500/40',
                badge: 'bg-purple-500/10 text-purple-400',
              },
              {
                category: 'Wrapped Assets',
                examples: ['WETH', 'WBTC', 'stETH'],
                description: 'DeFi protocols call approve() and transferFrom() — they expect ERC-20. WETH bridges native ETH into that interface so Uniswap, Aave, and Compound can treat it identically to every other token.',
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
