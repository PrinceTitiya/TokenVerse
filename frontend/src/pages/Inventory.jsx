import { useEffect, useState } from 'react';
import { useAccount, useReadContracts, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { formatUnits, parseUnits } from 'viem';
import {
  TOKENS, RARITY_CONFIG,
  TOKEN_VERSE_1155_ADDRESS, TOKEN_VERSE_ABI,
  TOKEN_VERSE_ERC20_ADDRESS, TOKEN_VERSE_GOLD_ABI,
} from '../constants/contracts';

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

function formatTVG(raw) {
  if (raw == null) return '—';
  const n = parseFloat(formatUnits(raw, 18));
  return n.toLocaleString('en-US', { maximumFractionDigits: 2 });
}

/* ─── connect prompt ───────────────────────────────────────── */
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

/* ─── shared atoms ─────────────────────────────────────────── */
function StatPill({ label, value }) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm">
      <span className="font-bold text-white">{value}</span>
      <span className="text-gray-400">{label}</span>
    </div>
  );
}

function SectionHeader({ eyebrow, title, accent = 'text-amber-400' }) {
  return (
    <div className="mb-6 flex items-center gap-4">
      <div className="flex flex-col">
        <p className={`text-xs font-semibold uppercase tracking-widest ${accent}`}>{eyebrow}</p>
        <h2 className="text-lg font-bold text-white">{title}</h2>
      </div>
      <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
    </div>
  );
}

/* ─── ERC-20 holding card ──────────────────────────────────── */
function ERC20SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/5 bg-gray-900">
      <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center">
        <div className="h-24 w-24 shrink-0 animate-pulse rounded-2xl bg-white/5" />
        <div className="flex flex-1 flex-col gap-3">
          <div className="h-4 w-32 animate-pulse rounded bg-white/10" />
          <div className="h-8 w-48 animate-pulse rounded bg-white/10" />
          <div className="h-3 w-24 animate-pulse rounded bg-white/5" />
        </div>
      </div>
    </div>
  );
}

function ERC20HoldingCard({ balance, hasClaimed, isLoading }) {
  const hasBalance = balance != null && balance > 0n;

  if (isLoading) return <ERC20SkeletonCard />;

  return (
    <div className={`
      group overflow-hidden rounded-2xl border bg-gray-900 transition-all duration-300
      ${hasBalance
        ? 'border-emerald-500/30 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-emerald-500/10'
        : 'border-white/5 opacity-60'}
    `}>
      <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center">

        {/* Visual — coin icon on gradient */}
        <div className="relative flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/20 to-amber-500/20 border border-white/5">
          <span className="text-3xl font-black tracking-tight text-white">TVG</span>
          {/* standard badge */}
          <span className="absolute -top-2 -right-2 rounded-full bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 text-xs font-bold text-emerald-400">
            ERC-20
          </span>
        </div>

        {/* Details */}
        <div className="flex flex-1 flex-col gap-3">
          <div>
            <h3 className="text-base font-bold text-white">TokenVerse Gold</h3>
            <span className="font-mono text-xs text-gray-500">Fungible · 18 decimals</span>
          </div>

          {/* Balance row */}
          <div className="flex items-end gap-2">
            <span className={`text-3xl font-extrabold tabular-nums ${hasBalance ? 'text-white' : 'text-gray-600'}`}>
              {formatTVG(balance)}
            </span>
            <span className="mb-0.5 text-base font-semibold text-gray-500">TVG</span>
          </div>
        </div>

        {/* Right badges */}
        <div className="flex shrink-0 flex-row gap-2 sm:flex-col sm:items-end">
          {/* faucet status */}
          <div className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${
            hasClaimed
              ? 'border-blue-500/20 bg-blue-500/5 text-blue-400'
              : 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400'
          }`}>
            {hasClaimed ? (
              <>
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                  <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.3" />
                  <path d="M4 6l1.5 1.5L8 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Faucet Claimed
              </>
            ) : (
              <>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Faucet Available
              </>
            )}
          </div>

          {/* balance status */}
          <div className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${
            hasBalance
              ? 'border-white/10 bg-white/5 text-gray-300'
              : 'border-white/5 bg-transparent text-gray-600'
          }`}>
            {hasBalance ? 'Holding' : 'Not Holding'}
          </div>
        </div>
      </div>

      {/* bottom bar — only when balance exists */}
      {hasBalance && (
        <div className="border-t border-white/5 bg-emerald-500/[0.03] px-6 py-2.5">
          <p className="text-xs text-gray-600">
            <span className="font-mono text-gray-500">{formatTVG(balance)} TVG</span>
            {' '}· 1 token type · ERC-20 standard
          </p>
        </div>
      )}
    </div>
  );
}

/* ─── TVG transfer panel ───────────────────────────────────── */
function TransferPanel({ balance, onSuccess }) {
  const [isOpen, setIsOpen]         = useState(false);
  const [recipient, setRecipient]   = useState('');
  const [amount, setAmount]         = useState('');
  const [inputError, setInputError] = useState('');

  const { writeContract, data: txHash, isPending, reset } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash: txHash });

  useEffect(() => {
    if (isConfirmed) {
      onSuccess?.();
      const timer = setTimeout(() => {
        reset();
        setRecipient('');
        setAmount('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isConfirmed, onSuccess, reset]);

  function setMax() {
    if (balance) setAmount(formatUnits(balance, 18));
  }

  function handleSend() {
    setInputError('');
    if (!/^0x[0-9a-fA-F]{40}$/.test(recipient)) {
      setInputError('Enter a valid 0x address');
      return;
    }
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      setInputError('Enter a valid amount');
      return;
    }
    let parsed;
    try { parsed = parseUnits(amount, 18); } catch { setInputError('Invalid amount'); return; }
    if (parsed > balance) { setInputError('Amount exceeds your balance'); return; }
    writeContract({
      address: TOKEN_VERSE_ERC20_ADDRESS,
      abi: TOKEN_VERSE_GOLD_ABI,
      functionName: 'transfer',
      args: [recipient, parsed],
    });
  }

  const isBusy = isPending || isConfirming;

  return (
    <div className="overflow-hidden rounded-2xl border border-white/5 bg-gray-900">
      {/* header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between px-6 py-4 text-left transition-colors hover:bg-white/[0.02]"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-500/20 bg-emerald-500/10">
            <svg width="14" height="14" viewBox="0 0 12 12" fill="none">
              <path d="M2 6h8M7 3l3 3-3 3" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Send TVG</p>
            <p className="text-xs text-gray-500">Transfer to any address</p>
          </div>
        </div>
        <svg
          width="16" height="16" viewBox="0 0 12 12" fill="none"
          className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        >
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {isOpen && (
      <div className="space-y-4 border-t border-white/5 px-6 pb-6 pt-5">
          {/* education callout */}
          <div className="rounded-xl border border-emerald-500/10 bg-emerald-500/[0.05] px-4 py-3">
            <p className="text-xs leading-relaxed text-gray-400">
              <span className="font-semibold text-emerald-300">transfer(recipient, amount)</span> moves
              TVG directly from your wallet to another address — instant, no third party, no approval
              step required.
            </p>
          </div>

          {/* recipient */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-400">
              Recipient Address
            </label>
            <input
              type="text"
              placeholder="0x..."
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              disabled={isBusy}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 font-mono text-sm text-white placeholder-gray-600 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 disabled:opacity-50"
            />
          </div>

          {/* amount */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-400">
              Amount (TVG)
            </label>
            <div className="relative">
              <input
                type="number"
                placeholder="0.00"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={isBusy}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 pr-16 text-sm text-white placeholder-gray-600 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 disabled:opacity-50"
              />
              <button
                onClick={setMax}
                disabled={isBusy || !balance}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md bg-emerald-500/20 px-2 py-0.5 text-xs font-bold text-emerald-400 hover:bg-emerald-500/30 disabled:opacity-40"
              >
                MAX
              </button>
            </div>
            <p className="mt-1 text-right text-xs text-gray-600">
              Available: <span className="text-gray-400">{formatTVG(balance)} TVG</span>
            </p>
          </div>

          {/* inline error */}
          {inputError && (
            <p className="text-xs text-red-400">{inputError}</p>
          )}

          {/* tx states */}
          {isConfirmed ? (
            <div className="flex items-center justify-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 py-3 text-sm font-semibold text-emerald-400">
              <svg width="16" height="16" viewBox="0 0 12 12" fill="none">
                <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Transfer confirmed!
            </div>
          ) : isPending ? (
            <div className="flex items-center justify-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/10 py-3 text-sm font-semibold text-amber-400">
              <span className="h-4 w-4 animate-spin rounded-full border border-amber-400 border-t-transparent" />
              Confirm in wallet…
            </div>
          ) : isConfirming ? (
            <div className="flex items-center justify-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/10 py-3 text-sm font-semibold text-amber-400">
              <span className="h-4 w-4 animate-spin rounded-full border border-amber-400 border-t-transparent" />
              Sending…
            </div>
          ) : (
            <button
              onClick={handleSend}
              className="w-full rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 py-3 text-sm font-semibold text-gray-950 transition-all duration-200 hover:from-emerald-500 hover:to-emerald-400 hover:shadow-lg hover:shadow-emerald-500/20 active:scale-[0.98]"
            >
              Send TVG →
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── TVG allowance panel (approve + transferFrom) ─────────── */
function ApprovePanel({ ownerAddress, balance, onSuccess }) {
  const [isOpen, setIsOpen]     = useState(false);

  // ── Step 1: approve ───────────────────────────────────────
  const [spender, setSpender]   = useState('');
  const [s1Amount, setS1Amount] = useState('');
  const [s1Error, setS1Error]   = useState('');

  const isValidSpender = /^0x[0-9a-fA-F]{40}$/.test(spender);

  const { data: s1Allowance, refetch: refetchS1 } = useReadContract({
    address: TOKEN_VERSE_ERC20_ADDRESS,
    abi: TOKEN_VERSE_GOLD_ABI,
    functionName: 'allowance',
    args: [ownerAddress ?? '0x0000000000000000000000000000000000000000', spender],
    query: { enabled: isValidSpender && !!ownerAddress && !!TOKEN_VERSE_ERC20_ADDRESS },
  });

  const { writeContract: writeApprove, data: s1Hash, isPending: s1Pending, reset: s1Reset } = useWriteContract();
  const { isLoading: s1Confirming, isSuccess: s1Confirmed } = useWaitForTransactionReceipt({ hash: s1Hash });

  useEffect(() => {
    if (s1Confirmed) {
      onSuccess?.();
      refetchS1();
      const t = setTimeout(() => { s1Reset(); setS1Amount(''); }, 3000);
      return () => clearTimeout(t);
    }
  }, [s1Confirmed, onSuccess, refetchS1, s1Reset]);

  function handleApprove() {
    setS1Error('');
    if (!isValidSpender) { setS1Error('Enter a valid spender address'); return; }
    if (s1Amount === '' || isNaN(parseFloat(s1Amount)) || parseFloat(s1Amount) < 0) {
      setS1Error('Enter an amount — use 0 to revoke');
      return;
    }
    let parsed;
    try { parsed = parseUnits(s1Amount, 18); } catch { setS1Error('Invalid amount'); return; }
    writeApprove({
      address: TOKEN_VERSE_ERC20_ADDRESS,
      abi: TOKEN_VERSE_GOLD_ABI,
      functionName: 'approve',
      args: [spender, parsed],
    });
  }

  // ── Step 2: transferFrom ──────────────────────────────────
  const [fromAddr, setFromAddr] = useState('');
  const [toAddr, setToAddr]     = useState('');
  const [s2Amount, setS2Amount] = useState('');
  const [s2Error, setS2Error]   = useState('');

  const isValidFrom = /^0x[0-9a-fA-F]{40}$/.test(fromAddr);
  const isValidTo   = /^0x[0-9a-fA-F]{40}$/.test(toAddr);

  const { data: s2Allowance, refetch: refetchS2 } = useReadContract({
    address: TOKEN_VERSE_ERC20_ADDRESS,
    abi: TOKEN_VERSE_GOLD_ABI,
    functionName: 'allowance',
    args: [fromAddr, ownerAddress ?? '0x0000000000000000000000000000000000000000'],
    query: { enabled: isValidFrom && !!ownerAddress && !!TOKEN_VERSE_ERC20_ADDRESS },
  });

  const { writeContract: writeTF, data: s2Hash, isPending: s2Pending, reset: s2Reset } = useWriteContract();
  const { isLoading: s2Confirming, isSuccess: s2Confirmed } = useWaitForTransactionReceipt({ hash: s2Hash });

  useEffect(() => {
    if (s2Confirmed) {
      onSuccess?.();
      refetchS2();
      const t = setTimeout(() => { s2Reset(); setS2Amount(''); }, 3000);
      return () => clearTimeout(t);
    }
  }, [s2Confirmed, onSuccess, refetchS2, s2Reset]);

  function handleTransferFrom() {
    setS2Error('');
    if (!isValidFrom) { setS2Error('Enter a valid owner address'); return; }
    if (!isValidTo)   { setS2Error('Enter a valid recipient address'); return; }
    if (!s2Amount || isNaN(parseFloat(s2Amount)) || parseFloat(s2Amount) <= 0) {
      setS2Error('Enter a valid amount');
      return;
    }
    let parsed;
    try { parsed = parseUnits(s2Amount, 18); } catch { setS2Error('Invalid amount'); return; }
    if (s2Allowance != null && parsed > s2Allowance) { setS2Error('Amount exceeds your allowance'); return; }
    writeTF({
      address: TOKEN_VERSE_ERC20_ADDRESS,
      abi: TOKEN_VERSE_GOLD_ABI,
      functionName: 'transferFrom',
      args: [fromAddr, toAddr, parsed],
    });
  }

  const s1Busy = s1Pending || s1Confirming;
  const s2Busy = s2Pending || s2Confirming;

  return (
    <div className="overflow-hidden rounded-2xl border border-white/5 bg-gray-900">

      {/* panel header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between px-6 py-4 text-left transition-colors hover:bg-white/[0.02]"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-purple-500/20 bg-purple-500/10">
            <svg width="14" height="14" viewBox="0 0 12 12" fill="none">
              <rect x="2" y="5" width="8" height="6" rx="1" stroke="#a78bfa" strokeWidth="1.3" />
              <path d="M4 5V3.5a2 2 0 0 1 4 0V5" stroke="#a78bfa" strokeWidth="1.3" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Allowance</p>
            <p className="text-xs text-gray-500">Grant access · Use allowance</p>
          </div>
        </div>
        <svg
          width="16" height="16" viewBox="0 0 12 12" fill="none"
          className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        >
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {isOpen && (
      <div className="border-t border-white/5 px-6 pb-6 pt-5">

        {/* ── Step 1 ── */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-purple-500/30 bg-purple-500/20 text-xs font-bold text-purple-400">1</span>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Grant Access</p>
          </div>

          <div className="rounded-xl border border-purple-500/10 bg-purple-500/[0.05] px-4 py-3">
            <p className="text-xs leading-relaxed text-gray-400">
              <span className="font-semibold text-purple-300">approve(spender, amount)</span> lets
              another wallet spend up to a fixed amount of your TVG without ever touching your private key.
            </p>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-400">Spender Address</label>
            <input
              type="text" placeholder="0x..." value={spender}
              onChange={(e) => { setSpender(e.target.value); setS1Error(''); }}
              disabled={s1Busy}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 font-mono text-sm text-white placeholder-gray-600 outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 disabled:opacity-50"
            />
          </div>

          {isValidSpender && (
            <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3">
              <span className="text-xs text-gray-500">Current allowance</span>
              <span className={`font-mono text-sm font-bold ${s1Allowance != null && s1Allowance > 0n ? 'text-purple-300' : 'text-gray-500'}`}>
                {s1Allowance != null ? `${formatTVG(s1Allowance)} TVG` : '…'}
              </span>
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-400">Allowance Amount (TVG)</label>
            <div className="relative">
              <input
                type="number" placeholder="0.00" min="0" value={s1Amount}
                onChange={(e) => setS1Amount(e.target.value)}
                disabled={s1Busy}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 pr-16 text-sm text-white placeholder-gray-600 outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 disabled:opacity-50"
              />
              <button
                onClick={() => balance && setS1Amount(formatUnits(balance, 18))}
                disabled={s1Busy || !balance}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md bg-purple-500/20 px-2 py-0.5 text-xs font-bold text-purple-400 hover:bg-purple-500/30 disabled:opacity-40"
              >MAX</button>
            </div>
            <p className="mt-1 text-xs text-gray-600">Set to <span className="font-mono text-gray-500">0</span> to revoke.</p>
          </div>

          {s1Error && <p className="text-xs text-red-400">{s1Error}</p>}

          {s1Confirmed ? (
            <div className="flex items-center justify-center gap-2 rounded-xl border border-purple-500/20 bg-purple-500/10 py-3 text-sm font-semibold text-purple-300">
              <svg width="14" height="14" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              Allowance updated!
            </div>
          ) : s1Pending ? (
            <div className="flex items-center justify-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/10 py-3 text-sm font-semibold text-amber-400">
              <span className="h-4 w-4 animate-spin rounded-full border border-amber-400 border-t-transparent" />Confirm in wallet…
            </div>
          ) : s1Confirming ? (
            <div className="flex items-center justify-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/10 py-3 text-sm font-semibold text-amber-400">
              <span className="h-4 w-4 animate-spin rounded-full border border-amber-400 border-t-transparent" />Setting allowance…
            </div>
          ) : (
            <button onClick={handleApprove} className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 py-3 text-sm font-semibold text-white transition-all duration-200 hover:from-purple-500 hover:to-purple-400 hover:shadow-lg hover:shadow-purple-500/20 active:scale-[0.98]">
              Set Allowance →
            </button>
          )}
        </div>

        {/* divider */}
        <div className="my-6 h-px bg-white/5" />

        {/* ── Step 2 ── */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-sky-500/30 bg-sky-500/20 text-xs font-bold text-sky-400">2</span>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Use Allowance</p>
          </div>

          <div className="rounded-xl border border-sky-500/10 bg-sky-500/[0.05] px-4 py-3">
            <p className="text-xs leading-relaxed text-gray-400">
              <span className="font-semibold text-sky-300">transferFrom(from, to, amount)</span> lets
              you — as an approved spender — pull tokens from another wallet up to your authorized limit.
            </p>
          </div>

          {/* from */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-400">From (owner who approved you)</label>
            <input
              type="text" placeholder="0x..." value={fromAddr}
              onChange={(e) => { setFromAddr(e.target.value); setS2Error(''); }}
              disabled={s2Busy}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 font-mono text-sm text-white placeholder-gray-600 outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/20 disabled:opacity-50"
            />
          </div>

          {/* live authorized limit */}
          {isValidFrom && (
            <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3">
              <span className="text-xs text-gray-500">Your authorized limit</span>
              <span className={`font-mono text-sm font-bold ${s2Allowance != null && s2Allowance > 0n ? 'text-sky-300' : 'text-gray-500'}`}>
                {s2Allowance != null ? `${formatTVG(s2Allowance)} TVG` : '…'}
              </span>
            </div>
          )}

          {/* to */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-400">To (recipient)</label>
            <div className="relative">
              <input
                type="text" placeholder="0x..." value={toAddr}
                onChange={(e) => { setToAddr(e.target.value); setS2Error(''); }}
                disabled={s2Busy}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 pr-14 font-mono text-sm text-white placeholder-gray-600 outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/20 disabled:opacity-50"
              />
              <button
                onClick={() => ownerAddress && setToAddr(ownerAddress)}
                disabled={s2Busy || !ownerAddress}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md bg-sky-500/20 px-2 py-0.5 text-xs font-bold text-sky-400 hover:bg-sky-500/30 disabled:opacity-40"
              >ME</button>
            </div>
            <p className="mt-1 text-xs text-gray-600">Hit ME to fill your connected wallet.</p>
          </div>

          {/* amount */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-400">Amount (TVG)</label>
            <div className="relative">
              <input
                type="number" placeholder="0.00" min="0" value={s2Amount}
                onChange={(e) => setS2Amount(e.target.value)}
                disabled={s2Busy}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 pr-16 text-sm text-white placeholder-gray-600 outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/20 disabled:opacity-50"
              />
              <button
                onClick={() => s2Allowance != null && setS2Amount(formatUnits(s2Allowance, 18))}
                disabled={s2Busy || !s2Allowance}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md bg-sky-500/20 px-2 py-0.5 text-xs font-bold text-sky-400 hover:bg-sky-500/30 disabled:opacity-40"
              >MAX</button>
            </div>
          </div>

          {s2Error && <p className="text-xs text-red-400">{s2Error}</p>}

          {s2Confirmed ? (
            <div className="flex items-center justify-center gap-2 rounded-xl border border-sky-500/20 bg-sky-500/10 py-3 text-sm font-semibold text-sky-300">
              <svg width="14" height="14" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              Tokens pulled!
            </div>
          ) : s2Pending ? (
            <div className="flex items-center justify-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/10 py-3 text-sm font-semibold text-amber-400">
              <span className="h-4 w-4 animate-spin rounded-full border border-amber-400 border-t-transparent" />Confirm in wallet…
            </div>
          ) : s2Confirming ? (
            <div className="flex items-center justify-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/10 py-3 text-sm font-semibold text-amber-400">
              <span className="h-4 w-4 animate-spin rounded-full border border-amber-400 border-t-transparent" />Pulling tokens…
            </div>
          ) : (
            <button onClick={handleTransferFrom} className="w-full rounded-xl bg-gradient-to-r from-sky-600 to-sky-500 py-3 text-sm font-semibold text-white transition-all duration-200 hover:from-sky-500 hover:to-sky-400 hover:shadow-lg hover:shadow-sky-500/20 active:scale-[0.98]">
              Pull Tokens →
            </button>
          )}
        </div>

      </div>
      )}
    </div>
  );
}

/* ─── ERC-1155 skeleton & holding card ────────────────────── */
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

function DismantleButton({ isPending, isConfirming, isConfirmed, onDismantle }) {
  if (isConfirmed) {
    return (
      <div className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-500/10 py-2 text-xs font-semibold text-emerald-400">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        100 Dragon Glass received!
      </div>
    );
  }
  if (isPending) {
    return (
      <div className="flex items-center justify-center gap-2 rounded-xl bg-amber-500/10 py-2 text-xs font-semibold text-amber-400">
        <span className="h-3 w-3 animate-spin rounded-full border border-amber-400 border-t-transparent" />
        Confirm in wallet…
      </div>
    );
  }
  if (isConfirming) {
    return (
      <div className="flex items-center justify-center gap-2 rounded-xl bg-amber-500/10 py-2 text-xs font-semibold text-amber-400">
        <span className="h-3 w-3 animate-spin rounded-full border border-amber-400 border-t-transparent" />
        Dismantling…
      </div>
    );
  }
  return (
    <button
      onClick={onDismantle}
      className="w-full rounded-xl bg-gradient-to-r from-amber-500/20 to-rose-500/20 py-2 text-xs font-semibold text-amber-300 transition-all duration-200 hover:from-amber-500/30 hover:to-rose-500/30 hover:text-amber-200 border border-amber-500/20 hover:border-amber-500/40"
    >
      🔥 Dismantle → 100 Dragon Glass
    </button>
  );
}

function HoldingCard({ token, balance, dismantleState, onDismantle }) {
  const rarity = RARITY_CONFIG[token.rarity];
  const owned = balance != null && balance > 0n;
  const imageUrl = `${IPFS_GATEWAY}${token.imageCid}`;
  const isDragonSword = token.id === 3n;

  return (
    <div className={`
      group relative flex flex-col overflow-hidden rounded-2xl border bg-gray-900
      transition-all duration-300
      ${owned ? `hover:-translate-y-1 hover:shadow-xl ${rarity.border} ${RARITY_GLOW[token.rarity]}` : 'border-white/5 opacity-50'}
    `}>
      <div className={`relative aspect-square bg-gradient-to-b ${owned ? RARITY_IMAGE_BG[token.rarity] : 'from-gray-800 to-gray-900'} p-5`}>
        <img
          src={imageUrl}
          alt={token.name}
          className={`h-full w-full object-contain drop-shadow-lg transition-transform duration-300 ${owned ? 'group-hover:scale-105' : 'grayscale'}`}
          loading="lazy"
        />
        <span className={`absolute right-3 top-3 rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide ${owned ? rarity.badge : 'bg-white/5 text-gray-500'}`}>
          {token.rarity}
        </span>
        <span className="absolute left-3 top-3 rounded-full bg-black/40 px-2 py-0.5 font-mono text-xs text-gray-400 backdrop-blur-sm">
          #{token.id.toString()}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-1 p-4">
        <h3 className="text-base font-bold text-white">{token.name}</h3>
        <span className="font-mono text-xs text-gray-500">Token ID #{token.id.toString()}</span>

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

        {isDragonSword && owned && (
          <div className="mt-3">
            <DismantleButton onDismantle={onDismantle} {...dismantleState} />
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── page ─────────────────────────────────────────────────── */
export default function Inventory() {
  const { address, isConnected } = useAccount();

  // ERC-20 reads
  const { data: erc20Data, isLoading: erc20Loading, refetch: refetchErc20 } = useReadContracts({
    contracts: [
      { address: TOKEN_VERSE_ERC20_ADDRESS, abi: TOKEN_VERSE_GOLD_ABI, functionName: 'balanceOf', args: [address ?? '0x0000000000000000000000000000000000000000'] },
      { address: TOKEN_VERSE_ERC20_ADDRESS, abi: TOKEN_VERSE_GOLD_ABI, functionName: 'hasClaimed', args: [address ?? '0x0000000000000000000000000000000000000000'] },
    ],
    query: { enabled: !!address && !!TOKEN_VERSE_ERC20_ADDRESS },
  });

  const tvgBalance  = erc20Data?.[0]?.status === 'success' ? erc20Data[0].result : null;
  const tvgClaimed  = erc20Data?.[1]?.status === 'success' ? erc20Data[1].result : false;

  // ERC-1155 reads
  const { data, isLoading, refetch } = useReadContracts({
    contracts: TOKENS.map((t) => ({
      address: TOKEN_VERSE_1155_ADDRESS,
      abi: TOKEN_VERSE_ABI,
      functionName: 'balanceOf',
      args: [address, t.id],
    })),
    query: { enabled: !!address },
  });

  const { writeContract, data: txHash, isPending, reset } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash: txHash });

  useEffect(() => {
    if (isConfirmed) {
      refetch();
      const timer = setTimeout(reset, 3000);
      return () => clearTimeout(timer);
    }
  }, [isConfirmed, refetch, reset]);

  function handleDismantle() {
    writeContract({
      address: TOKEN_VERSE_1155_ADDRESS,
      abi: TOKEN_VERSE_ABI,
      functionName: 'dismantleDragonSword',
    });
  }

  if (!isConnected) return <ConnectPrompt />;

  const balances = TOKENS.map((t, i) => ({
    token: t,
    balance: data?.[i]?.status === 'success' ? data[i].result : null,
  }));

  const totalUnits  = balances.reduce((sum, { balance }) => sum + (balance ?? 0n), 0n);
  const uniqueTypes = balances.filter(({ balance }) => balance != null && balance > 0n).length;
  const hasAny1155  = uniqueTypes > 0;

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-gray-950 px-6 py-16">
      <div className="mx-auto max-w-7xl">

        {/* ── Page header ─────────────────────────────────────────── */}
        <div className="mb-10 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-amber-400">
            Your Holdings
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <StatPill label="TVG Balance"   value={erc20Loading ? '—' : formatTVG(tvgBalance)} />
            <StatPill label="1155 Units"    value={isLoading ? '—' : totalUnits.toString()} />
            <StatPill label="1155 Types"    value={isLoading ? '—' : `${uniqueTypes} / ${TOKENS.length}`} />
          </div>
        </div>

        {/* ── ERC-20 section ───────────────────────────────────────── */}
        <div className="mb-12">
          <SectionHeader
            eyebrow="ERC-20 · Fungible Token"
            title="TokenVerse Gold"
            accent="text-emerald-400"
          />
          <ERC20HoldingCard
            balance={tvgBalance}
            hasClaimed={tvgClaimed}
            isLoading={erc20Loading}
          />
          <div className="mt-3 flex flex-col gap-3">
            <TransferPanel balance={tvgBalance} onSuccess={refetchErc20} />
            <ApprovePanel ownerAddress={address} balance={tvgBalance} onSuccess={refetchErc20} />
          </div>
        </div>

        {/* ── ERC-1155 section ─────────────────────────────────────── */}
        <div>
          <SectionHeader
            eyebrow="ERC-1155 · Multi-Token"
            title="TokenVerse Collection"
            accent="text-amber-400"
          />

          {/* empty state */}
          {!isLoading && !hasAny1155 && (
            <div className="mb-6 flex items-center gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/5 px-6 py-4">
              <span className="text-xl">🎒</span>
              <div>
                <p className="text-sm font-semibold text-amber-300">No ERC-1155 tokens yet</p>
                <p className="text-xs text-gray-400">Head to the Mint Lab to get started.</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {isLoading
              ? TOKENS.map((t) => <SkeletonCard key={t.id} />)
              : balances.map(({ token, balance }) => (
                  <HoldingCard
                    key={token.id}
                    token={token}
                    balance={balance}
                    onDismantle={handleDismantle}
                    dismantleState={{ isPending, isConfirming, isConfirmed }}
                  />
                ))}
          </div>
        </div>

      </div>
    </div>
  );
}
