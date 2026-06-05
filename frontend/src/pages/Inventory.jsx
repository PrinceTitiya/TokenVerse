import { useEffect, useState, useCallback } from 'react';
import { useAccount, useChainId, useReadContracts, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { formatUnits, parseUnits } from 'viem';
import {
  TOKENS, RARITY_CONFIG,
  TOKEN_VERSE_1155_ADDRESS, TOKEN_VERSE_ABI,
  TOKEN_VERSE_ERC20_ADDRESS, TOKEN_VERSE_ERC20_ABI,
  TOKEN_VERSE_ERC721_ADDRESS, TOKEN_VERSE_ERC721_ABI,
} from '../constants/contracts';

const ERC721_TYPES = [
  {
    id: 0,
    name: 'Dragon Knight',
    class: 'Warrior',
    element: 'Steel',
    weapon: 'Dragon Sword',
    imageCid: 'bafybeif3awzqpskc3dtsd7k562nw4ctnhubtisav7nczbmy7uzgbm4joqi',
    ownedBorder: 'border-amber-500/30 hover:border-amber-500/60',
    ownedGlow: 'hover:shadow-amber-500/20',
    badgeClass: 'bg-amber-500/10 text-amber-400',
    imageBg: 'from-amber-950/60 to-gray-900',
  },
  {
    id: 1,
    name: 'Ember Witch',
    class: 'Mage',
    element: 'Fire',
    weapon: 'Ember Staff',
    imageCid: 'bafybeieefdnvurup7fvj5d26q2o7nhmaxmw332l56qyzqityrhaarcgiza',
    ownedBorder: 'border-rose-500/30 hover:border-rose-500/60',
    ownedGlow: 'hover:shadow-rose-500/20',
    badgeClass: 'bg-rose-500/10 text-rose-400',
    imageBg: 'from-rose-950/60 to-gray-900',
  },
  {
    id: 2,
    name: 'Void Stalker',
    class: 'Rogue',
    element: 'Shadow',
    weapon: 'Void Daggers',
    imageCid: 'bafybeibsfifb7z5degyt7h7vwkdnzqfnx7zdy7vudmeyn7z2hqdozfefte',
    ownedBorder: 'border-purple-500/30 hover:border-purple-500/60',
    ownedGlow: 'hover:shadow-purple-500/20',
    badgeClass: 'bg-purple-500/10 text-purple-400',
    imageBg: 'from-purple-950/60 to-gray-900',
  },
];

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

/* ─── contract info bar ────────────────────────────────────── */
function AddressChip({ address, explorerBase, copiedKey, copied, onCopy }) {
  const display = `${address.slice(0, 6)}…${address.slice(-4)}`;
  const href = explorerBase ? `${explorerBase}/address/${address}` : null;
  const isCopied = copied === copiedKey;

  return (
    <span className="flex items-center gap-1">
      {href ? (
        <a href={href} target="_blank" rel="noopener noreferrer"
          className="font-mono text-xs text-gray-300 transition-colors hover:text-white">
          {display}
        </a>
      ) : (
        <span className="font-mono text-xs text-gray-300">{display}</span>
      )}
      <button
        onClick={() => onCopy(address, copiedKey)}
        title="Copy address"
        className="text-gray-600 transition-colors hover:text-gray-300"
      >
        {isCopied ? (
          <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
            <path d="M2 6l3 3 5-5" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
            <rect x="4" y="4" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.2" />
            <path d="M2 8V2h6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>
    </span>
  );
}

function ContractInfoBar({ contractAddress, abi, accent = 'text-amber-400', borderColor = 'border-amber-500/20', bgColor = 'bg-amber-500/[0.04]' }) {
  const [copied, setCopied] = useState(null);
  const chainId = useChainId();

  const { data: ownerAddr } = useReadContract({
    address: contractAddress,
    abi,
    functionName: 'owner',
    query: { enabled: !!contractAddress },
  });

  const isSepolia = chainId === 11155111;
  const isAnvil   = chainId === 31337;
  const explorerBase = isSepolia ? 'https://sepolia.etherscan.io' : null;
  const networkLabel = isSepolia ? 'Sepolia' : isAnvil ? 'Anvil' : `Chain ${chainId}`;
  const networkDot   = isSepolia ? 'bg-blue-400' : isAnvil ? 'bg-orange-400' : 'bg-gray-500';

  function copyTo(value, key) {
    navigator.clipboard.writeText(value);
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  }

  return (
    <div className={`mb-4 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border ${borderColor} ${bgColor} px-4 py-2.5`}>

      {/* network */}
      <span className="flex items-center gap-1.5">
        <span className={`h-1.5 w-1.5 rounded-full ${networkDot}`} />
        <span className="text-xs text-gray-500">{networkLabel}</span>
      </span>

      <span className="h-3 w-px bg-white/10" />

      {/* contract address */}
      <span className="flex items-center gap-1.5">
        <span className="text-xs font-medium text-gray-500">Contract</span>
        <AddressChip
          address={contractAddress}
          explorerBase={explorerBase}
          copiedKey="contract"
          copied={copied}
          onCopy={copyTo}
        />
      </span>

      <span className="h-3 w-px bg-white/10" />

      {/* deployer / owner */}
      <span className="flex items-center gap-1.5">
        <span className="text-xs font-medium text-gray-500">Deployer</span>
        {ownerAddr ? (
          <AddressChip
            address={ownerAddr}
            explorerBase={explorerBase}
            copiedKey="deployer"
            copied={copied}
            onCopy={copyTo}
          />
        ) : (
          <span className="h-3 w-20 animate-pulse rounded bg-white/5" />
        )}
      </span>

      {/* etherscan link – pinned right */}
      {explorerBase && (
        <a
          href={`${explorerBase}/address/${contractAddress}`}
          target="_blank"
          rel="noopener noreferrer"
          className={`ml-auto flex items-center gap-1 text-xs ${accent} opacity-50 transition-opacity hover:opacity-100`}
        >
          Etherscan
          <svg width="9" height="9" viewBox="0 0 12 12" fill="none">
            <path d="M5 2H2a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1V7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            <path d="M8 2h2v2M10 2L6 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
      )}
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

/* ─── toast notification ───────────────────────────────────── */
function ToastNotification({ message }) {
  if (!message) return null;
  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl border border-white/10 bg-gray-900 px-5 py-4 shadow-2xl shadow-black/50">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/20">
        <svg width="14" height="14" viewBox="0 0 12 12" fill="none">
          <path d="M2 6l3 3 5-5" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <p className="text-sm font-semibold text-white">{message}</p>
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
function TransferPanel({ balance, onSuccess, onNotify }) {
  const [isOpen, setIsOpen]         = useState(false);
  const [recipient, setRecipient]   = useState('');
  const [amount, setAmount]         = useState('');
  const [inputError, setInputError] = useState('');

  const { writeContract, data: txHash, isPending, reset } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash: txHash });

  useEffect(() => {
    if (isConfirmed) {
      onSuccess?.();
      onNotify?.('Transfer confirmed!');
      const timer = setTimeout(() => {
        reset();
        setRecipient('');
        setAmount('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isConfirmed, onSuccess, onNotify, reset]);

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
      abi: TOKEN_VERSE_ERC20_ABI,
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
function ApprovePanel({ ownerAddress, balance, onSuccess, onNotify }) {
  const [isOpen, setIsOpen]     = useState(false);

  // ── Step 1: approve ───────────────────────────────────────
  const [spender, setSpender]   = useState('');
  const [s1Amount, setS1Amount] = useState('');
  const [s1Error, setS1Error]   = useState('');

  const isValidSpender = /^0x[0-9a-fA-F]{40}$/.test(spender);

  const { data: s1Allowance, refetch: refetchS1 } = useReadContract({
    address: TOKEN_VERSE_ERC20_ADDRESS,
    abi: TOKEN_VERSE_ERC20_ABI,
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
      onNotify?.('Allowance updated!');
      const t = setTimeout(() => { s1Reset(); setS1Amount(''); }, 3000);
      return () => clearTimeout(t);
    }
  }, [s1Confirmed, onSuccess, onNotify, refetchS1, s1Reset]);

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
      abi: TOKEN_VERSE_ERC20_ABI,
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
    abi: TOKEN_VERSE_ERC20_ABI,
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
      onNotify?.('Tokens pulled!');
      const t = setTimeout(() => { s2Reset(); setS2Amount(''); }, 3000);
      return () => clearTimeout(t);
    }
  }, [s2Confirmed, onSuccess, onNotify, refetchS2, s2Reset]);

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
      abi: TOKEN_VERSE_ERC20_ABI,
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

/* ─── ERC-721 holding card ─────────────────────────────────── */
function ERC721HoldingCard({ nftType, hasMinted }) {
  const owned = hasMinted === true;

  return (
    <div className={`
      group relative flex flex-col overflow-hidden rounded-2xl border bg-gray-900
      transition-all duration-300
      ${owned
        ? `${nftType.ownedBorder} ${nftType.ownedGlow} hover:-translate-y-1 hover:shadow-xl`
        : 'border-white/5 opacity-50'}
    `}>
      {/* image */}
      <div className={`relative aspect-square overflow-hidden bg-gradient-to-b ${owned ? nftType.imageBg : 'from-gray-800 to-gray-900'} p-5`}>
        <img
          src={`${IPFS_GATEWAY}${nftType.imageCid}`}
          alt={nftType.name}
          className={`h-full w-full object-contain drop-shadow-lg transition-transform duration-300 ${owned ? 'group-hover:scale-105' : 'grayscale'}`}
          loading="lazy"
        />
        <span className={`absolute right-3 top-3 rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide ${owned ? nftType.badgeClass : 'bg-white/5 text-gray-500'}`}>
          Legendary
        </span>
        <span className="absolute left-3 top-3 rounded-full bg-black/40 px-2 py-0.5 font-mono text-xs text-gray-400 backdrop-blur-sm">
          Type #{nftType.id}
        </span>
      </div>

      {/* info */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-bold text-white">{nftType.name}</h3>
          <span className={`rounded-full px-2 py-0.5 font-mono text-xs font-semibold ${owned ? nftType.badgeClass : 'bg-white/5 text-gray-600'}`}>
            #{nftType.id}
          </span>
        </div>

        {/* trait chips */}
        <div className="flex flex-wrap gap-1.5">
          {[nftType.class, nftType.element, nftType.weapon].map((attr) => (
            <span
              key={attr}
              className={`rounded-full border px-2 py-0.5 text-xs ${owned ? 'border-white/10 bg-white/5 text-gray-400' : 'border-white/5 bg-transparent text-gray-600'}`}
            >
              {attr}
            </span>
          ))}
        </div>

        {/* ownership row */}
        <div className="mt-auto border-t border-white/5 pt-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">ERC-721</span>
            {owned ? (
              <span className={`flex items-center gap-1.5 rounded-full border border-current/20 px-2.5 py-1 text-xs font-semibold ${nftType.badgeClass}`}>
                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                Minted
              </span>
            ) : (
              <span className="rounded-full bg-white/5 px-2.5 py-0.5 text-xs font-medium text-gray-500">
                Not Minted
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── ERC-721 transfer panel ───────────────────────────────── */
function ERC721TransferPanel({ address, nftMinted, nftBalance, onSuccess, onNotify }) {
  const [isOpen, setIsOpen]           = useState(false);
  const [recipient, setRecipient]     = useState('');
  const [selectedTypeId, setSelectedTypeId] = useState('');
  const [inputError, setInputError]   = useState('');

  const ownedTypes = ERC721_TYPES.filter((t) => nftMinted[t.id]);
  const hasAnyOwned = nftBalance != null && nftBalance > 0n;

  // Step 1: enumerate all tokenIds the address currently holds (max 3)
  const { data: tokenIndexData } = useReadContracts({
    contracts: [0n, 1n, 2n].map((i) => ({
      address: TOKEN_VERSE_ERC721_ADDRESS,
      abi: TOKEN_VERSE_ERC721_ABI,
      functionName: 'tokenOfOwnerByIndex',
      args: [address ?? '0x0000000000000000000000000000000000000000', i],
    })),
    query: { enabled: !!address && !!TOKEN_VERSE_ERC721_ADDRESS && isOpen && hasAnyOwned },
  });

  const ownedTokenIds = [0, 1, 2]
    .map((i) => tokenIndexData?.[i]?.status === 'success' ? tokenIndexData[i].result : null)
    .filter((id) => id != null);

  // Step 2: fetch tokenURI for each owned tokenId to resolve typeId
  const { data: uriData } = useReadContracts({
    contracts: ownedTokenIds.map((tokenId) => ({
      address: TOKEN_VERSE_ERC721_ADDRESS,
      abi: TOKEN_VERSE_ERC721_ABI,
      functionName: 'tokenURI',
      args: [tokenId],
    })),
    query: { enabled: ownedTokenIds.length > 0 && isOpen },
  });

  // Build typeId → tokenId map by parsing "ipfs://…/0.json" → 0
  const typeToTokenId = {};
  ownedTokenIds.forEach((tokenId, i) => {
    const uri = uriData?.[i]?.status === 'success' ? uriData[i].result : null;
    if (uri) {
      const typeId = parseInt(uri.split('/').pop());
      if (!isNaN(typeId)) typeToTokenId[typeId] = tokenId;
    }
  });

  const isValidRecipient = /^0x[0-9a-fA-F]{40}$/.test(recipient);
  const selectedTypeIdNum = selectedTypeId !== '' ? parseInt(selectedTypeId) : null;

  // Live ownership check for the recipient — three-step chain identical to the
  // inventory display fix. hasMintedType cannot be used here: it only records
  // who called mint() and is never cleared on transfer, so the original minter
  // permanently returns true even after sending the NFT away (blocks send-back).
  const { data: recipientBalRaw } = useReadContract({
    address: TOKEN_VERSE_ERC721_ADDRESS,
    abi: TOKEN_VERSE_ERC721_ABI,
    functionName: 'balanceOf',
    args: [isValidRecipient ? recipient : '0x0000000000000000000000000000000000000000'],
    query: { enabled: isValidRecipient && !!TOKEN_VERSE_ERC721_ADDRESS },
  });
  const recipientBalNum = recipientBalRaw != null ? Number(recipientBalRaw) : 0;

  const { data: recipientIndexData } = useReadContracts({
    contracts: [0n, 1n, 2n].map((i) => ({
      address: TOKEN_VERSE_ERC721_ADDRESS,
      abi: TOKEN_VERSE_ERC721_ABI,
      functionName: 'tokenOfOwnerByIndex',
      args: [isValidRecipient ? recipient : '0x0000000000000000000000000000000000000000', i],
    })),
    query: { enabled: isValidRecipient && !!TOKEN_VERSE_ERC721_ADDRESS && recipientBalNum > 0 },
  });

  const recipientOwnedIds = [0, 1, 2]
    .map((i) => recipientIndexData?.[i]?.status === 'success' ? recipientIndexData[i].result : null)
    .filter((id) => id != null);

  const { data: recipientUriData } = useReadContracts({
    contracts: recipientOwnedIds.map((tokenId) => ({
      address: TOKEN_VERSE_ERC721_ADDRESS,
      abi: TOKEN_VERSE_ERC721_ABI,
      functionName: 'tokenURI',
      args: [tokenId],
    })),
    query: { enabled: recipientOwnedIds.length > 0 },
  });

  const recipientOwnedTypeIds = new Set();
  recipientOwnedIds.forEach((_, i) => {
    const uri = recipientUriData?.[i]?.status === 'success' ? recipientUriData[i].result : null;
    if (uri) {
      const typeId = parseInt(uri.split('/').pop());
      if (!isNaN(typeId)) recipientOwnedTypeIds.add(typeId);
    }
  });

  // true = recipient currently holds a token of this exact type
  const recipientOwnsType = selectedTypeIdNum !== null && recipientOwnedTypeIds.has(selectedTypeIdNum);

  // loading: waiting for balance, or for index/uri chain when balance > 0
  const recipientCheckLoading = isValidRecipient && (
    recipientBalRaw === undefined ||
    (recipientBalNum > 0 && recipientIndexData == null) ||
    (recipientOwnedIds.length > 0 && recipientUriData == null)
  );

  const { writeContract, data: txHash, isPending, reset } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash: txHash });

  useEffect(() => {
    if (isConfirmed) {
      onSuccess?.();
      onNotify?.('NFT transferred!');
      const t = setTimeout(() => {
        reset();
        setRecipient('');
        setSelectedTypeId('');
        setInputError('');
      }, 3000);
      return () => clearTimeout(t);
    }
  }, [isConfirmed, onSuccess, onNotify, reset]);

  function handleTransfer() {
    setInputError('');
    if (!isValidRecipient) { setInputError('Enter a valid 0x address'); return; }
    if (selectedTypeIdNum === null) { setInputError('Select a character to transfer'); return; }
    if (recipientCheckLoading) { setInputError('Still checking recipient — try again in a moment'); return; }
    if (recipientOwnsType) { setInputError('Recipient already holds this character type'); return; }
    const tokenId = typeToTokenId[selectedTypeIdNum];
    if (tokenId == null) { setInputError('Token not found — you may have already transferred it'); return; }
    writeContract({
      address: TOKEN_VERSE_ERC721_ADDRESS,
      abi: TOKEN_VERSE_ERC721_ABI,
      functionName: 'safeTransferFrom',
      args: [address, recipient, tokenId],
    });
  }

  const selectedType = ERC721_TYPES.find((t) => t.id === selectedTypeIdNum);
  const resolvedTokenId = selectedTypeIdNum !== null ? typeToTokenId[selectedTypeIdNum] : null;
  const isBusy = isPending || isConfirming;

  if (!hasAnyOwned) return (
    <div className="mt-3 flex items-center gap-3 rounded-2xl border border-white/5 bg-gray-900 px-6 py-4">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-blue-500/20 bg-blue-500/10">
        <svg width="14" height="14" viewBox="0 0 12 12" fill="none">
          <path d="M2 6h8M7 3l3 3-3 3" stroke="#60a5fa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <div>
        <p className="text-sm font-semibold text-blue-300">No NFTs to transfer</p>
        <p className="text-xs text-gray-500">
          You don't hold any character NFTs. Mint one on the ERC-721 page, or ask someone to send you one.
        </p>
      </div>
    </div>
  );

  return (
    <div className="mt-3 overflow-hidden rounded-2xl border border-white/5 bg-gray-900">
      {/* header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between px-6 py-4 text-left transition-colors hover:bg-white/[0.02]"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-blue-500/20 bg-blue-500/10">
            <svg width="14" height="14" viewBox="0 0 12 12" fill="none">
              <path d="M2 6h8M7 3l3 3-3 3" stroke="#60a5fa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Transfer NFT</p>
            <p className="text-xs text-gray-500">Send a character to another wallet</p>
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
          {/* callout */}
          <div className="rounded-xl border border-blue-500/10 bg-blue-500/[0.05] px-4 py-3">
            <p className="text-xs leading-relaxed text-gray-400">
              <span className="font-semibold text-blue-300">safeTransferFrom(from, to, tokenId)</span>{' '}
              moves full ownership to a new wallet. The recipient must not already hold that character type.
            </p>
          </div>

          {/* character selector */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-400">
              Character to Transfer
            </label>
            <select
              value={selectedTypeId}
              onChange={(e) => { setSelectedTypeId(e.target.value); setInputError(''); }}
              disabled={isBusy}
              className="w-full rounded-xl border border-white/10 bg-gray-950 px-4 py-2.5 text-sm text-white outline-none transition focus:border-blue-500/50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <option value="">Select a character…</option>
              {ownedTypes.map((t) => (
                <option key={t.id} value={t.id.toString()}>
                  {t.name} — Type #{t.id} ({t.class} · {t.element})
                </option>
              ))}
            </select>
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
              onChange={(e) => { setRecipient(e.target.value); setInputError(''); }}
              disabled={isBusy}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 font-mono text-sm text-white placeholder-gray-600 outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 disabled:opacity-50"
            />
          </div>

          {/* live recipient status */}
          {isValidRecipient && selectedTypeIdNum !== null && (
            <div className={`flex items-center justify-between rounded-xl border px-4 py-3 transition-colors ${
              recipientCheckLoading
                ? 'border-white/5 bg-white/[0.02]'
                : recipientOwnsType
                  ? 'border-rose-500/20 bg-rose-500/5'
                  : 'border-white/5 bg-white/[0.02]'
            }`}>
              <span className="text-xs text-gray-500">Recipient status</span>
              {recipientCheckLoading ? (
                <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-500">
                  <span className="h-3 w-3 animate-spin rounded-full border border-gray-500 border-t-transparent" />
                  Checking…
                </span>
              ) : (
                <span className={`text-xs font-semibold ${recipientOwnsType ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {recipientOwnsType ? '✕ Already holds this type' : '✓ Can receive'}
                </span>
              )}
            </div>
          )}

          {/* transfer preview */}
          {selectedType && resolvedTokenId != null && (
            <div className="flex items-center justify-between rounded-xl border border-white/5 bg-gray-950/60 px-4 py-2.5">
              <span className="text-xs text-gray-500">Transferring</span>
              <div className="flex items-center gap-2">
                <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${selectedType.badgeClass}`}>
                  Legendary
                </span>
                <span className="text-sm font-semibold text-white">{selectedType.name}</span>
                <span className="font-mono text-xs text-gray-500">#{resolvedTokenId.toString()}</span>
              </div>
            </div>
          )}

          {/* inline error */}
          {inputError && <p className="text-xs text-rose-400">{inputError}</p>}

          {/* tx states */}
          {isConfirmed ? (
            <div className="flex items-center justify-center gap-2 rounded-xl border border-blue-500/20 bg-blue-500/10 py-3 text-sm font-semibold text-blue-300">
              <svg width="14" height="14" viewBox="0 0 12 12" fill="none">
                <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              NFT transferred!
            </div>
          ) : isPending ? (
            <div className="flex items-center justify-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/10 py-3 text-sm font-semibold text-amber-400">
              <span className="h-4 w-4 animate-spin rounded-full border border-amber-400 border-t-transparent" />
              Confirm in wallet…
            </div>
          ) : isConfirming ? (
            <div className="flex items-center justify-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/10 py-3 text-sm font-semibold text-amber-400">
              <span className="h-4 w-4 animate-spin rounded-full border border-amber-400 border-t-transparent" />
              Transferring…
            </div>
          ) : (
            <button
              onClick={handleTransfer}
              disabled={!isValidRecipient || selectedTypeIdNum === null || recipientOwnsType || recipientCheckLoading || isBusy}
              className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 py-3 text-sm font-semibold text-white transition-all duration-200 hover:from-blue-500 hover:to-blue-400 hover:shadow-lg hover:shadow-blue-500/20 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Transfer NFT →
            </button>
          )}
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

/* ─── ERC-1155 batch transfer panel ───────────────────────── */
function ERC1155BatchTransferPanel({ address, balances, onSuccess, onNotify }) {
  const [isOpen, setIsOpen]       = useState(false);
  const [recipient, setRecipient] = useState('');
  const [amounts, setAmounts]     = useState({});
  const [inputError, setInputError] = useState('');

  const ownedTokens = balances.filter(({ balance }) => balance != null && balance > 0n);

  const { writeContract, data: txHash, isPending, reset } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash: txHash });

  useEffect(() => {
    if (isConfirmed) {
      onSuccess?.();
      onNotify?.('Batch transfer confirmed!');
      const t = setTimeout(() => {
        reset();
        setRecipient('');
        setAmounts({});
        setInputError('');
      }, 3000);
      return () => clearTimeout(t);
    }
  }, [isConfirmed, onSuccess, onNotify, reset]);

  function safeBig(str) {
    try { const n = BigInt(str); return n >= 0n ? n : null; } catch { return null; }
  }

  const selected = ownedTokens.filter(({ token, balance }) => {
    const n = safeBig(amounts[token.id.toString()]);
    return n != null && n > 0n && n <= balance;
  });

  const isValidRecipient = /^0x[0-9a-fA-F]{40}$/.test(recipient);
  const isBusy = isPending || isConfirming;

  function handleBatchTransfer() {
    setInputError('');
    if (!isValidRecipient) { setInputError('Enter a valid 0x address'); return; }
    if (selected.length === 0) { setInputError('Enter a valid amount for at least one token'); return; }
    for (const { token, balance } of ownedTokens) {
      const amt = amounts[token.id.toString()];
      if (!amt) continue;
      const n = safeBig(amt);
      if (n == null || n <= 0n) { setInputError(`Invalid amount for ${token.name}`); return; }
      if (n > balance) { setInputError(`Amount exceeds your balance for ${token.name}`); return; }
    }
    writeContract({
      address: TOKEN_VERSE_1155_ADDRESS,
      abi: TOKEN_VERSE_ABI,
      functionName: 'safeBatchTransferFrom',
      args: [
        address,
        recipient,
        selected.map(({ token }) => token.id),
        selected.map(({ token }) => BigInt(amounts[token.id.toString()])),
        '0x',
      ],
    });
  }

  if (ownedTokens.length === 0) return null;

  return (
    <div className="mt-3 overflow-hidden rounded-2xl border border-white/5 bg-gray-900">
      {/* accordion header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between px-6 py-4 text-left transition-colors hover:bg-white/[0.02]"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-amber-500/20 bg-amber-500/10">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 4h12M1 7h12M1 10h12" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Batch Transfer</p>
            <p className="text-xs text-gray-500">Send multiple token types in one tx · safeBatchTransferFrom</p>
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
          <div className="rounded-xl border border-amber-500/10 bg-amber-500/[0.05] px-4 py-3">
            <p className="text-xs leading-relaxed text-gray-400">
              <span className="font-semibold text-amber-300">safeBatchTransferFrom(from, to, ids[], amounts[], data)</span>{' '}
              moves multiple token types to one address in a single transaction — emitting one{' '}
              <span className="font-mono text-gray-300">TransferBatch</span> event instead of N{' '}
              <span className="font-mono text-gray-300">TransferSingle</span> events.
              This is ERC-1155's core gas advantage over ERC-20 and ERC-721.
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
              onChange={(e) => { setRecipient(e.target.value); setInputError(''); }}
              disabled={isBusy}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 font-mono text-sm text-white placeholder-gray-600 outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 disabled:opacity-50"
            />
          </div>

          {/* token amount rows */}
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-400">
              Amounts to Send
            </label>
            <div className="flex flex-col gap-2">
              {ownedTokens.map(({ token, balance }) => {
                const rarity  = RARITY_CONFIG[token.rarity];
                const amt     = amounts[token.id.toString()] ?? '';
                const n       = safeBig(amt);
                const tooHigh = n != null && n > balance;
                return (
                  <div
                    key={token.id}
                    className={`flex items-center gap-3 rounded-xl border px-4 py-3 transition-colors ${
                      tooHigh ? 'border-rose-500/30 bg-rose-500/5' : 'border-white/5 bg-gray-950/40'
                    }`}
                  >
                    {/* token info */}
                    <div className="flex min-w-0 flex-1 items-center gap-2">
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${rarity.badge}`}>
                        {token.rarity}
                      </span>
                      <span className="truncate text-sm font-medium text-white">{token.name}</span>
                      <span className="font-mono text-xs text-gray-600">#{token.id.toString()}</span>
                    </div>
                    {/* balance indicator */}
                    <span className="shrink-0 text-xs text-gray-500">
                      bal: <span className="font-mono text-gray-400">{balance.toString()}</span>
                    </span>
                    {/* amount input + MAX */}
                    <div className="relative shrink-0">
                      <input
                        type="number"
                        min="1"
                        max={balance.toString()}
                        value={amt}
                        onChange={(e) => {
                          setAmounts((prev) => ({ ...prev, [token.id.toString()]: e.target.value }));
                          setInputError('');
                        }}
                        disabled={isBusy}
                        placeholder="0"
                        className={`w-24 rounded-lg border bg-gray-900 px-3 py-1.5 pr-10 text-right text-sm text-white placeholder-gray-600 outline-none transition focus:border-amber-500/50 disabled:opacity-30 ${
                          tooHigh ? 'border-rose-500/40' : 'border-white/10'
                        }`}
                      />
                      <button
                        onClick={() => setAmounts((prev) => ({ ...prev, [token.id.toString()]: balance.toString() }))}
                        disabled={isBusy}
                        className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded px-1 py-0.5 text-xs font-bold text-amber-400 hover:bg-amber-500/10 disabled:opacity-40"
                      >
                        MAX
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* live transfer preview */}
          {selected.length > 0 && isValidRecipient && (
            <div className="rounded-xl border border-white/5 bg-gray-950/60 px-4 py-3">
              <p className="mb-2 text-xs text-gray-500">Sending</p>
              <div className="flex flex-wrap gap-2">
                {selected.map(({ token }) => {
                  const rarity = RARITY_CONFIG[token.rarity];
                  return (
                    <span
                      key={token.id}
                      className={`rounded-full border border-current/20 px-2.5 py-0.5 text-xs font-semibold ${rarity.badge}`}
                    >
                      {token.name} × {amounts[token.id.toString()]}
                    </span>
                  );
                })}
              </div>
              <p className="mt-2 font-mono text-xs text-gray-600">
                to: {recipient.slice(0, 10)}…{recipient.slice(-8)}
              </p>
            </div>
          )}

          {/* inline error */}
          {inputError && <p className="text-xs text-rose-400">{inputError}</p>}

          {/* tx states */}
          {isConfirmed ? (
            <div className="flex items-center justify-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 py-3 text-sm font-semibold text-emerald-400">
              <svg width="14" height="14" viewBox="0 0 12 12" fill="none">
                <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Batch transfer confirmed!
            </div>
          ) : isPending ? (
            <div className="flex items-center justify-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/10 py-3 text-sm font-semibold text-amber-400">
              <span className="h-4 w-4 animate-spin rounded-full border border-amber-400 border-t-transparent" />
              Confirm in wallet…
            </div>
          ) : isConfirming ? (
            <div className="flex items-center justify-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/10 py-3 text-sm font-semibold text-amber-400">
              <span className="h-4 w-4 animate-spin rounded-full border border-amber-400 border-t-transparent" />
              Sending batch…
            </div>
          ) : (
            <button
              onClick={handleBatchTransfer}
              disabled={!isValidRecipient || selected.length === 0 || isBusy}
              className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-purple-500 py-3 text-sm font-semibold text-gray-950 transition-all duration-200 hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {selected.length > 0
                ? `Send ${selected.length} Token Type${selected.length > 1 ? 's' : ''} →`
                : 'Enter amounts above to continue'}
            </button>
          )}

          {/* on-chain signature callout */}
          <div className="rounded-xl border border-white/5 bg-gray-950/60 px-4 py-3">
            <p className="mb-1 text-xs text-gray-600">Calling on-chain</p>
            <div className="font-mono text-xs text-gray-300">
              <span className="text-amber-400">safeBatchTransferFrom</span>
              <span className="text-gray-500">(from, to,</span>
            </div>
            <div className="font-mono text-xs text-gray-500 pl-4">
              ids[{selected.map((s) => s.token.id.toString()).join(', ') || '…'}],
            </div>
            <div className="font-mono text-xs text-gray-500 pl-4">
              amounts[{selected.map((s) => amounts[s.token.id.toString()]).join(', ') || '…'}]
            </div>
            <div className="font-mono text-xs text-gray-500">)</div>
          </div>

        </div>
      )}
    </div>
  );
}

/* ─── ERC-20 burn panel ─────────────────────────────────────── */
function BurnTVGPanel({ balance, onSuccess, onNotify }) {
  const [isOpen, setIsOpen]     = useState(false);
  const [amount, setAmount]     = useState('');
  const [inputError, setInputError] = useState('');

  const { writeContract, data: txHash, isPending, reset } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash: txHash });

  useEffect(() => {
    if (isConfirmed) {
      onSuccess?.();
      onNotify?.('Tokens burned!');
      const t = setTimeout(() => { reset(); setAmount(''); }, 3000);
      return () => clearTimeout(t);
    }
  }, [isConfirmed, onSuccess, onNotify, reset]);

  function handleBurn() {
    setInputError('');
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      setInputError('Enter a valid amount');
      return;
    }
    let parsed;
    try { parsed = parseUnits(amount, 18); } catch { setInputError('Invalid amount'); return; }
    if (parsed > balance) { setInputError('Amount exceeds your balance'); return; }
    writeContract({
      address: TOKEN_VERSE_ERC20_ADDRESS,
      abi: TOKEN_VERSE_ERC20_ABI,
      functionName: 'burn',
      args: [parsed],
    });
  }

  const isBusy = isPending || isConfirming;
  if (!balance || balance === 0n) return null;

  return (
    <div className="overflow-hidden rounded-2xl border border-white/5 bg-gray-900">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between px-6 py-4 text-left transition-colors hover:bg-white/[0.02]"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-rose-500/20 bg-rose-500/10">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="#f87171" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 2C6.5 4.5 4 6 4 9a4 4 0 0 0 8 0c0-3-2.5-4.5-4-7Z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Burn TVG</p>
            <p className="text-xs text-gray-500">Permanently destroy tokens · reduces total supply</p>
          </div>
        </div>
        <svg width="16" height="16" viewBox="0 0 12 12" fill="none"
          className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        >
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {isOpen && (
        <div className="space-y-4 border-t border-white/5 px-6 pb-6 pt-5">
          <div className="rounded-xl border border-rose-500/10 bg-rose-500/[0.05] px-4 py-3">
            <p className="text-xs leading-relaxed text-gray-400">
              <span className="font-semibold text-rose-300">burn(amount)</span> permanently destroys
              tokens from your balance and reduces{' '}
              <span className="font-mono text-gray-300">totalSupply</span> by the same amount —
              unlike a transfer to <span className="font-mono text-gray-300">address(0)</span> which
              moves tokens without updating the supply counter. This action is irreversible.
            </p>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-400">
              Amount to Burn (TVG)
            </label>
            <div className="relative">
              <input
                type="number" placeholder="0.00" min="0" value={amount}
                onChange={(e) => { setAmount(e.target.value); setInputError(''); }}
                disabled={isBusy}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 pr-16 text-sm text-white placeholder-gray-600 outline-none focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/20 disabled:opacity-50"
              />
              <button
                onClick={() => balance && setAmount(formatUnits(balance, 18))}
                disabled={isBusy || !balance}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md bg-rose-500/20 px-2 py-0.5 text-xs font-bold text-rose-400 hover:bg-rose-500/30 disabled:opacity-40"
              >MAX</button>
            </div>
            <p className="mt-1 text-right text-xs text-gray-600">
              Balance: <span className="text-gray-400">{formatTVG(balance)} TVG</span>
            </p>
          </div>

          {inputError && <p className="text-xs text-rose-400">{inputError}</p>}

          {isConfirmed ? (
            <div className="flex items-center justify-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 py-3 text-sm font-semibold text-rose-300">
              <svg width="14" height="14" viewBox="0 0 12 12" fill="none">
                <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Tokens burned!
            </div>
          ) : isPending ? (
            <div className="flex items-center justify-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/10 py-3 text-sm font-semibold text-amber-400">
              <span className="h-4 w-4 animate-spin rounded-full border border-amber-400 border-t-transparent" />
              Confirm in wallet…
            </div>
          ) : isConfirming ? (
            <div className="flex items-center justify-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/10 py-3 text-sm font-semibold text-amber-400">
              <span className="h-4 w-4 animate-spin rounded-full border border-amber-400 border-t-transparent" />
              Burning…
            </div>
          ) : (
            <button onClick={handleBurn}
              className="w-full rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 py-3 text-sm font-semibold text-white transition-all duration-200 hover:from-rose-500 hover:to-rose-400 hover:shadow-lg hover:shadow-rose-500/20 active:scale-[0.98]"
            >
              Burn TVG →
            </button>
          )}

          <div className="rounded-xl border border-white/5 bg-gray-950/60 px-4 py-3">
            <p className="mb-1 text-xs text-gray-600">Calling on-chain</p>
            <div className="font-mono text-xs text-gray-300">
              <span className="text-rose-400">burn</span>
              <span className="text-gray-500">(</span>
              <span className="text-amber-300">uint256</span>
              <span className="text-gray-300"> amount</span>
              <span className="text-gray-500">)</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── ERC-1155 burn panel ────────────────────────────────────── */
function Burn1155Panel({ address, balances, onSuccess, onNotify }) {
  const [isOpen, setIsOpen]         = useState(false);
  const [selectedId, setSelectedId] = useState('');
  const [amount, setAmount]         = useState('');
  const [inputError, setInputError] = useState('');

  const ownedTokens = balances.filter(({ balance }) => balance != null && balance > 0n);
  const selectedEntry = ownedTokens.find(({ token }) => token.id.toString() === selectedId);

  const { writeContract, data: txHash, isPending, reset } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash: txHash });

  useEffect(() => {
    if (isConfirmed) {
      onSuccess?.();
      onNotify?.('Tokens burned!');
      const t = setTimeout(() => { reset(); setAmount(''); setSelectedId(''); }, 3000);
      return () => clearTimeout(t);
    }
  }, [isConfirmed, onSuccess, onNotify, reset]);

  function handleBurn() {
    setInputError('');
    if (!selectedId) { setInputError('Select a token type to burn'); return; }
    if (!amount || isNaN(parseInt(amount)) || parseInt(amount) <= 0) {
      setInputError('Enter a valid amount');
      return;
    }
    const amtBig = BigInt(amount);
    if (selectedEntry && amtBig > selectedEntry.balance) {
      setInputError('Amount exceeds your balance');
      return;
    }
    writeContract({
      address: TOKEN_VERSE_1155_ADDRESS,
      abi: TOKEN_VERSE_ABI,
      functionName: 'burn',
      args: [address, BigInt(selectedId), amtBig],
    });
  }

  const isBusy = isPending || isConfirming;
  if (ownedTokens.length === 0) return null;

  return (
    <div className="mt-3 overflow-hidden rounded-2xl border border-white/5 bg-gray-900">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between px-6 py-4 text-left transition-colors hover:bg-white/[0.02]"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-rose-500/20 bg-rose-500/10">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="#f87171" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 2C6.5 4.5 4 6 4 9a4 4 0 0 0 8 0c0-3-2.5-4.5-4-7Z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Burn Tokens</p>
            <p className="text-xs text-gray-500">Permanently destroy any token type · burn(from, id, amount)</p>
          </div>
        </div>
        <svg width="16" height="16" viewBox="0 0 12 12" fill="none"
          className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        >
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {isOpen && (
        <div className="space-y-4 border-t border-white/5 px-6 pb-6 pt-5">
          <div className="rounded-xl border border-rose-500/10 bg-rose-500/[0.05] px-4 py-3">
            <p className="text-xs leading-relaxed text-gray-400">
              <span className="font-semibold text-rose-300">burn(from, id, amount)</span> permanently
              destroys tokens for a specific ID. Only the holder or an approved operator can call
              this — enforced by a custom{' '}
              <span className="font-mono text-gray-300">NotApproved</span> error on the contract.
              This action is irreversible.
            </p>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-400">
              Token to Burn
            </label>
            <select
              value={selectedId}
              onChange={(e) => { setSelectedId(e.target.value); setAmount(''); setInputError(''); }}
              disabled={isBusy}
              className="w-full rounded-xl border border-white/10 bg-gray-950 px-4 py-2.5 text-sm text-white outline-none transition focus:border-rose-500/50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <option value="">Select a token…</option>
              {ownedTokens.map(({ token, balance }) => (
                <option key={token.id} value={token.id.toString()}>
                  {token.name} (ID #{token.id.toString()}) — balance: {balance.toString()}
                </option>
              ))}
            </select>
          </div>

          {selectedEntry && (
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-400">
                Amount to Burn
              </label>
              <div className="relative">
                <input
                  type="number" placeholder="0" min="1" value={amount}
                  onChange={(e) => { setAmount(e.target.value); setInputError(''); }}
                  disabled={isBusy}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 pr-16 text-sm text-white placeholder-gray-600 outline-none focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/20 disabled:opacity-50"
                />
                <button
                  onClick={() => setAmount(selectedEntry.balance.toString())}
                  disabled={isBusy}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md bg-rose-500/20 px-2 py-0.5 text-xs font-bold text-rose-400 hover:bg-rose-500/30 disabled:opacity-40"
                >MAX</button>
              </div>
              <p className="mt-1 text-right text-xs text-gray-600">
                Balance: <span className="text-gray-400">{selectedEntry.balance.toString()}</span>
              </p>
            </div>
          )}

          {inputError && <p className="text-xs text-rose-400">{inputError}</p>}

          {isConfirmed ? (
            <div className="flex items-center justify-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 py-3 text-sm font-semibold text-rose-300">
              <svg width="14" height="14" viewBox="0 0 12 12" fill="none">
                <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Tokens burned!
            </div>
          ) : isPending ? (
            <div className="flex items-center justify-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/10 py-3 text-sm font-semibold text-amber-400">
              <span className="h-4 w-4 animate-spin rounded-full border border-amber-400 border-t-transparent" />
              Confirm in wallet…
            </div>
          ) : isConfirming ? (
            <div className="flex items-center justify-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/10 py-3 text-sm font-semibold text-amber-400">
              <span className="h-4 w-4 animate-spin rounded-full border border-amber-400 border-t-transparent" />
              Burning…
            </div>
          ) : (
            <button
              onClick={handleBurn}
              disabled={!selectedId || !amount || isBusy}
              className="w-full rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 py-3 text-sm font-semibold text-white transition-all duration-200 hover:from-rose-500 hover:to-rose-400 hover:shadow-lg hover:shadow-rose-500/20 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Burn Tokens →
            </button>
          )}

          <div className="rounded-xl border border-white/5 bg-gray-950/60 px-4 py-3">
            <p className="mb-1 text-xs text-gray-600">Calling on-chain</p>
            <div className="font-mono text-xs text-gray-300">
              <span className="text-rose-400">burn</span>
              <span className="text-gray-500">(</span>
              <span className="text-amber-300">address</span>
              <span className="text-gray-300"> from, </span>
              <span className="text-amber-300">uint256</span>
              <span className="text-gray-300"> id, </span>
              <span className="text-amber-300">uint256</span>
              <span className="text-gray-300"> amount</span>
              <span className="text-gray-500">)</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── ERC-721 operator approval panel ─────────────────────── */
function SetApprovalForAllPanel({ address, onSuccess, onNotify }) {
  const [isOpen, setIsOpen]     = useState(false);
  const [operator, setOperator] = useState('');
  const [inputError, setInputError] = useState('');
  const [pendingAction, setPendingAction] = useState(null);

  const isValidOperator = /^0x[0-9a-fA-F]{40}$/.test(operator);

  const { data: isApproved, refetch: refetchApproval } = useReadContract({
    address: TOKEN_VERSE_ERC721_ADDRESS,
    abi: TOKEN_VERSE_ERC721_ABI,
    functionName: 'isApprovedForAll',
    args: [address ?? '0x0000000000000000000000000000000000000000', operator],
    query: { enabled: isValidOperator && !!address && !!TOKEN_VERSE_ERC721_ADDRESS },
  });

  const { writeContract, data: txHash, isPending, reset } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash: txHash });

  useEffect(() => {
    if (isConfirmed) {
      onSuccess?.();
      refetchApproval();
      onNotify?.(pendingAction === 'grant' ? 'Operator approved!' : 'Approval revoked!');
      const t = setTimeout(() => { reset(); setPendingAction(null); }, 3000);
      return () => clearTimeout(t);
    }
  }, [isConfirmed, onSuccess, onNotify, refetchApproval, pendingAction, reset]);

  function handleToggle(approve) {
    setInputError('');
    if (!isValidOperator) { setInputError('Enter a valid operator address'); return; }
    setPendingAction(approve ? 'grant' : 'revoke');
    writeContract({
      address: TOKEN_VERSE_ERC721_ADDRESS,
      abi: TOKEN_VERSE_ERC721_ABI,
      functionName: 'setApprovalForAll',
      args: [operator, approve],
    });
  }

  const isBusy = isPending || isConfirming;

  return (
    <div className="mt-3 overflow-hidden rounded-2xl border border-white/5 bg-gray-900">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between px-6 py-4 text-left transition-colors hover:bg-white/[0.02]"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-purple-500/20 bg-purple-500/10">
            <svg width="14" height="14" viewBox="0 0 12 12" fill="none">
              <path d="M6 1L1 3v3c0 2.8 2.2 4.7 5 5 2.8-.3 5-2.2 5-5V3L6 1z" stroke="#a78bfa" strokeWidth="1.3" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Operator Approval</p>
            <p className="text-xs text-gray-500">Grant or revoke full collection access · setApprovalForAll</p>
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

          <div className="rounded-xl border border-purple-500/10 bg-purple-500/[0.05] px-4 py-3">
            <p className="text-xs leading-relaxed text-gray-400">
              <span className="font-semibold text-purple-300">setApprovalForAll(operator, true)</span>{' '}
              grants another address full control over every NFT you own — this is how marketplaces
              like OpenSea list your tokens without per-token approvals. Call with{' '}
              <span className="font-mono text-gray-300">false</span> to revoke at any time.
            </p>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-400">
              Operator Address
            </label>
            <input
              type="text"
              placeholder="0x…"
              value={operator}
              onChange={(e) => { setOperator(e.target.value); setInputError(''); }}
              disabled={isBusy}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 font-mono text-sm text-white placeholder-gray-600 outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 disabled:opacity-50"
            />
          </div>

          {isValidOperator && (
            <div className={`flex items-center justify-between rounded-xl border px-4 py-3 transition-colors ${
              isApproved
                ? 'border-purple-500/30 bg-purple-500/5'
                : 'border-white/5 bg-white/[0.02]'
            }`}>
              <span className="text-xs text-gray-500">Current status for this operator</span>
              <span className={`flex items-center gap-1.5 text-xs font-semibold ${isApproved ? 'text-purple-400' : 'text-gray-500'}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${isApproved ? 'bg-purple-400' : 'bg-gray-600'}`} />
                {isApproved === undefined ? '…' : isApproved ? 'Approved — full access granted' : 'Not approved'}
              </span>
            </div>
          )}

          {inputError && <p className="text-xs text-rose-400">{inputError}</p>}

          {isConfirmed ? (
            <div className="flex items-center justify-center gap-2 rounded-xl border border-purple-500/20 bg-purple-500/10 py-3 text-sm font-semibold text-purple-300">
              <svg width="14" height="14" viewBox="0 0 12 12" fill="none">
                <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {pendingAction === 'grant' ? 'Operator approved!' : 'Approval revoked!'}
            </div>
          ) : isPending ? (
            <div className="flex items-center justify-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/10 py-3 text-sm font-semibold text-amber-400">
              <span className="h-4 w-4 animate-spin rounded-full border border-amber-400 border-t-transparent" />
              Confirm in wallet…
            </div>
          ) : isConfirming ? (
            <div className="flex items-center justify-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/10 py-3 text-sm font-semibold text-amber-400">
              <span className="h-4 w-4 animate-spin rounded-full border border-amber-400 border-t-transparent" />
              Updating approval…
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleToggle(true)}
                disabled={isBusy || !isValidOperator || isApproved === true}
                className="rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 py-3 text-sm font-semibold text-white transition-all duration-200 hover:from-purple-500 hover:to-purple-400 hover:shadow-lg hover:shadow-purple-500/20 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Grant Access
              </button>
              <button
                onClick={() => handleToggle(false)}
                disabled={isBusy || !isValidOperator || !isApproved}
                className="rounded-xl border border-rose-500/30 bg-rose-500/10 py-3 text-sm font-semibold text-rose-400 transition-all duration-200 hover:bg-rose-500/20 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Revoke Access
              </button>
            </div>
          )}

          <div className="rounded-xl border border-white/5 bg-gray-950/60 px-4 py-3">
            <p className="mb-1 text-xs text-gray-600">Calling on-chain</p>
            <div className="font-mono text-xs text-gray-300">
              <span className="text-purple-400">setApprovalForAll</span>
              <span className="text-gray-500">(</span>
              <span className="text-amber-300">address</span>
              <span className="text-gray-300"> operator, </span>
              <span className="text-amber-300">bool</span>
              <span className="text-gray-300"> approved</span>
              <span className="text-gray-500">)</span>
            </div>
            <p className="mt-1 text-xs text-gray-600">
              Emits <span className="font-mono text-gray-500">ApprovalForAll(owner, operator, approved)</span>
            </p>
          </div>

        </div>
      )}
    </div>
  );
}

/* ─── page ─────────────────────────────────────────────────── */
export default function Inventory() {
  const { address, isConnected } = useAccount();
  const [toastMsg, setToastMsg] = useState(null);

  const notify = useCallback((message) => {
    setToastMsg(message);
    setTimeout(() => setToastMsg(null), 3500);
  }, []);

  // ERC-20 reads
  const { data: erc20Data, isLoading: erc20Loading, refetch: refetchErc20 } = useReadContracts({
    contracts: [
      { address: TOKEN_VERSE_ERC20_ADDRESS, abi: TOKEN_VERSE_ERC20_ABI, functionName: 'balanceOf', args: [address ?? '0x0000000000000000000000000000000000000000'] },
      { address: TOKEN_VERSE_ERC20_ADDRESS, abi: TOKEN_VERSE_ERC20_ABI, functionName: 'hasClaimed', args: [address ?? '0x0000000000000000000000000000000000000000'] },
    ],
    query: { enabled: !!address && !!TOKEN_VERSE_ERC20_ADDRESS },
  });

  const tvgBalance  = erc20Data?.[0]?.status === 'success' ? erc20Data[0].result : null;
  const tvgClaimed  = erc20Data?.[1]?.status === 'success' ? erc20Data[1].result : false;

  // ERC-721 reads — three-step chain: balance → tokenIds → typeIds via URI.
  // We cannot use hasMintedType here because it only tracks who *minted*, not
  // who currently *owns* the token after a safeTransferFrom.
  const { data: nftBalRaw, isLoading: erc721BalLoading, refetch: refetchNftBal } = useReadContract({
    address: TOKEN_VERSE_ERC721_ADDRESS,
    abi: TOKEN_VERSE_ERC721_ABI,
    functionName: 'balanceOf',
    args: [address ?? '0x0000000000000000000000000000000000000000'],
    query: { enabled: !!address && !!TOKEN_VERSE_ERC721_ADDRESS },
  });

  const nftBalance    = nftBalRaw ?? null;
  const nftBalanceNum = nftBalance != null ? Number(nftBalance) : 0;

  const { data: tokenIndexData, refetch: refetchTokenIdx } = useReadContracts({
    contracts: [0n, 1n, 2n].map((i) => ({
      address: TOKEN_VERSE_ERC721_ADDRESS,
      abi: TOKEN_VERSE_ERC721_ABI,
      functionName: 'tokenOfOwnerByIndex',
      args: [address ?? '0x0000000000000000000000000000000000000000', i],
    })),
    query: { enabled: !!address && !!TOKEN_VERSE_ERC721_ADDRESS && nftBalanceNum > 0 },
  });

  const ownedTokenIds = [0, 1, 2]
    .map((i) => tokenIndexData?.[i]?.status === 'success' ? tokenIndexData[i].result : null)
    .filter((id) => id != null);

  const { data: nftUriData, refetch: refetchNftUris } = useReadContracts({
    contracts: ownedTokenIds.map((tokenId) => ({
      address: TOKEN_VERSE_ERC721_ADDRESS,
      abi: TOKEN_VERSE_ERC721_ABI,
      functionName: 'tokenURI',
      args: [tokenId],
    })),
    query: { enabled: ownedTokenIds.length > 0 },
  });

  const ownedTypeIds = new Set();
  ownedTokenIds.forEach((_, i) => {
    const uri = nftUriData?.[i]?.status === 'success' ? nftUriData[i].result : null;
    if (uri) {
      const typeId = parseInt(uri.split('/').pop());
      if (!isNaN(typeId)) ownedTypeIds.add(typeId);
    }
  });

  const nftMinted = ERC721_TYPES.map((t) => ownedTypeIds.has(t.id));
  const hasAnyNft = nftMinted.some(Boolean);

  const erc721Loading = erc721BalLoading ||
    (nftBalanceNum > 0 && tokenIndexData == null) ||
    (ownedTokenIds.length > 0 && nftUriData == null);

  const refetchErc721 = useCallback(() => {
    refetchNftBal();
    refetchTokenIdx();
    refetchNftUris();
  }, [refetchNftBal, refetchTokenIdx, refetchNftUris]);

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
      <ToastNotification message={toastMsg} />
      <div className="mx-auto max-w-7xl">

        {/* ── Page header ─────────────────────────────────────────── */}
        <div className="mb-10 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-amber-400">
            Your Holdings
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <StatPill label="TVG Balance"   value={erc20Loading ? '—' : formatTVG(tvgBalance)} />
            <StatPill label="NFTs Owned"    value={erc721Loading ? '—' : (nftBalance != null ? nftBalance.toString() : '0')} />
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
          <ContractInfoBar
            contractAddress={TOKEN_VERSE_ERC20_ADDRESS}
            abi={TOKEN_VERSE_ERC20_ABI}
            accent="text-emerald-400"
            borderColor="border-emerald-500/20"
            bgColor="bg-emerald-500/[0.04]"
          />
          <ERC20HoldingCard
            balance={tvgBalance}
            hasClaimed={tvgClaimed}
            isLoading={erc20Loading}
          />
          <div className="mt-3 flex flex-col gap-3">
            <TransferPanel balance={tvgBalance} onSuccess={refetchErc20} onNotify={notify} />
            <ApprovePanel ownerAddress={address} balance={tvgBalance} onSuccess={refetchErc20} onNotify={notify} />
            <BurnTVGPanel balance={tvgBalance} onSuccess={refetchErc20} onNotify={notify} />
          </div>
        </div>

        {/* ── ERC-721 section ──────────────────────────────────────── */}
        <div className="mb-12">
          <SectionHeader
            eyebrow="ERC-721 · Non-Fungible Tokens"
            title="Character NFTs"
            accent="text-blue-400"
          />
          <ContractInfoBar
            contractAddress={TOKEN_VERSE_ERC721_ADDRESS}
            abi={TOKEN_VERSE_ERC721_ABI}
            accent="text-blue-400"
            borderColor="border-blue-500/20"
            bgColor="bg-blue-500/[0.04]"
          />

          {!erc721Loading && !hasAnyNft && (
            <div className="mb-6 flex items-center gap-3 rounded-2xl border border-blue-500/20 bg-blue-500/5 px-6 py-4">
              <span className="text-xl">🧙</span>
              <div>
                <p className="text-sm font-semibold text-blue-300">No character NFTs yet</p>
                <p className="text-xs text-gray-400">Head to the ERC-721 page to claim a character.</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            {erc721Loading
              ? ERC721_TYPES.map((t) => <SkeletonCard key={t.id} />)
              : ERC721_TYPES.map((nftType) => (
                  <ERC721HoldingCard
                    key={nftType.id}
                    nftType={nftType}
                    hasMinted={nftMinted[nftType.id]}
                  />
                ))}
          </div>

          <ERC721TransferPanel
            address={address}
            nftMinted={nftMinted}
            nftBalance={nftBalance}
            onSuccess={refetchErc721}
            onNotify={notify}
          />
          <SetApprovalForAllPanel
            address={address}
            onSuccess={refetchErc721}
            onNotify={notify}
          />
        </div>

        {/* ── ERC-1155 section ─────────────────────────────────────── */}
        <div>
          <SectionHeader
            eyebrow="ERC-1155 · Multi-Token"
            title="TokenVerse Collection"
            accent="text-amber-400"
          />
          <ContractInfoBar
            contractAddress={TOKEN_VERSE_1155_ADDRESS}
            abi={TOKEN_VERSE_ABI}
            accent="text-amber-400"
            borderColor="border-amber-500/20"
            bgColor="bg-amber-500/[0.04]"
          />

          {/* empty state */}
          {!isLoading && !hasAny1155 && (
            <div className="mb-6 flex items-center gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/5 px-6 py-4">
              <span className="text-xl">🎒</span>
              <div>
                <p className="text-sm font-semibold text-amber-300">No ERC-1155 tokens yet</p>
                <p className="text-xs text-gray-400">Head to the ERC-1155 page and claim your free Starter Pack.</p>
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

          <ERC1155BatchTransferPanel
            address={address}
            balances={balances}
            onSuccess={refetch}
            onNotify={notify}
          />
          <Burn1155Panel
            address={address}
            balances={balances}
            onSuccess={refetch}
            onNotify={notify}
          />
        </div>

      </div>
    </div>
  );
}
