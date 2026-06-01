import { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { parseUnits } from 'viem';
import {
  TOKENS, RARITY_CONFIG,
  TOKEN_VERSE_1155_ADDRESS, TOKEN_VERSE_ABI,
  TOKEN_VERSE_ERC20_ADDRESS, TOKEN_VERSE_ERC20_ABI,
  TOKEN_VERSE_ERC721_ADDRESS, TOKEN_VERSE_ERC721_ABI,
} from '../constants/contracts';

const ERC721_TYPES = [
  { id: 0, name: 'Dragon Knight', class: 'Warrior', element: 'Steel'  },
  { id: 1, name: 'Ember Witch',   class: 'Mage',    element: 'Fire'   },
  { id: 2, name: 'Void Stalker',  class: 'Rogue',   element: 'Shadow' },
];

/* ─── shared: tx button ────────────────────────────────────── */
function TxButton({ onClick, isPending, isConfirming, isConfirmed, disabled, label, confirmLabel = 'Done!' }) {
  if (isConfirmed) {
    return (
      <div className="flex items-center justify-center gap-2 rounded-xl bg-emerald-500/10 py-3 text-sm font-semibold text-emerald-400">
        <svg width="14" height="14" viewBox="0 0 12 12" fill="none">
          <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {confirmLabel}
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
        Minting…
      </div>
    );
  }
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-purple-500 py-3 text-sm font-bold text-gray-950 transition-all duration-200 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-30"
    >
      {label}
    </button>
  );
}

/* ─── shared: section header ───────────────────────────────── */
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

/* ─── owner badge (top-right) ──────────────────────────────── */
function OwnerBadge({ owner, address, isConnected }) {
  const isOwner = isConnected && address && owner && address.toLowerCase() === owner.toLowerCase();

  return (
    <div className={`inline-flex items-center gap-2.5 rounded-full border px-4 py-2 text-sm ${
      isOwner
        ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-300'
        : isConnected
          ? 'border-white/10 bg-white/5 text-gray-400'
          : 'border-white/5 bg-transparent text-gray-600'
    }`}>
      <span className={`h-2 w-2 rounded-full ${isOwner ? 'bg-emerald-400' : isConnected ? 'bg-amber-400' : 'bg-gray-600'}`} />
      <span className="font-medium">
        {isOwner ? 'Contract Owner' : isConnected ? 'Not Owner' : 'Not Connected'}
      </span>
      {owner && (
        <span className="font-mono text-xs text-gray-500">
          {owner.slice(0, 6)}…{owner.slice(-4)}
        </span>
      )}
    </div>
  );
}

/* ─── ERC-20 education ─────────────────────────────────────── */
function ERC20EducationBox() {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
      <div className="h-px w-full bg-gradient-to-r from-transparent via-emerald-500/60 to-transparent" />
      <div className="p-6">
        <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-emerald-400">How It Works</p>
        <h3 className="mb-4 text-base font-bold text-white">ERC-20 Owner Mint</h3>

        <div className="mb-4 rounded-xl border border-white/5 bg-gray-900/60 p-4">
          <div className="mb-2 flex items-center gap-2">
            <span className="rounded-lg bg-emerald-500/10 px-2.5 py-1 font-mono text-xs font-bold text-emerald-400">mint()</span>
            <span className="text-xs text-gray-500">Owner Only</span>
          </div>
          <p className="mb-3 text-xs leading-relaxed text-gray-400">
            Mints any amount of TVG to any address. Unlike the public{' '}
            <span className="font-mono text-gray-300">faucet()</span> which is capped at 1 000 TVG
            per wallet, this function has no ceiling — it's reserved for the owner to seed
            liquidity, reward users, or fund demos.
          </p>
          <div className="rounded-lg bg-gray-950/80 px-4 py-3 font-mono text-xs text-gray-300">
            <span className="text-emerald-400">mint</span>
            <span className="text-gray-500">(</span>
            <span className="text-amber-300">address</span>{' '}to,{' '}
            <span className="text-amber-300">uint256</span>{' '}amount
            <span className="text-gray-500">)</span>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-xl border border-emerald-500/15 bg-emerald-500/5 px-4 py-3">
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none" className="mt-0.5 shrink-0 text-emerald-400">
            <path d="M8 1.5a2.5 2.5 0 0 1 2.5 2.5v1h1A1.5 1.5 0 0 1 13 6.5v7A1.5 1.5 0 0 1 11.5 15h-7A1.5 1.5 0 0 1 3 13.5v-7A1.5 1.5 0 0 1 4.5 5h1V4A2.5 2.5 0 0 1 8 1.5Zm0 1.5A1 1 0 0 0 7 4v1h2V4a1 1 0 0 0-1-1Z" fill="currentColor" />
          </svg>
          <p className="text-xs leading-relaxed text-gray-400">
            <span className="font-semibold text-emerald-300">onlyOwner</span> — protected by
            OpenZeppelin's <span className="font-mono text-gray-300">Ownable</span>. Amount is
            in whole TVG tokens; the contract handles the 10¹⁸ decimal shift.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─── ERC-20 mint form ─────────────────────────────────────── */
function ERC20MintForm({ isOwner, address }) {
  const [to, setTo] = useState('');
  const [amount, setAmount] = useState('');

  const { writeContract, data: txHash, isPending, reset } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash: txHash });

  useEffect(() => {
    if (isConfirmed) {
      setAmount('');
      const t = setTimeout(reset, 3000);
      return () => clearTimeout(t);
    }
  }, [isConfirmed, reset]);

  function handleMint() {
    const recipient = to.trim() || address;
    if (!recipient || !amount || Number(amount) <= 0) return;
    writeContract({
      address: TOKEN_VERSE_ERC20_ADDRESS,
      abi: TOKEN_VERSE_ERC20_ABI,
      functionName: 'mint',
      args: [recipient, parseUnits(amount, 18)],
    });
  }

  const recipient = to.trim() || address;
  const canSubmit = isOwner && !!recipient && !!amount && Number(amount) > 0;

  return (
    <div className="rounded-2xl border border-white/5 bg-gray-900 p-6">
      <div className="mb-5 flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10">
          <span className="font-mono text-sm font-bold text-emerald-400">TVG</span>
        </span>
        <div>
          <h3 className="text-base font-bold text-white">Mint TVG</h3>
          <p className="text-xs text-gray-500">Calls <span className="font-mono text-gray-300">mint(to, amount)</span></p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {/* recipient */}
        <div>
          <label className="mb-1.5 block text-xs font-medium text-gray-400">
            Recipient address
            <span className="ml-2 text-gray-600">(leave blank to use connected wallet)</span>
          </label>
          <input
            type="text"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder={address ?? '0x…'}
            disabled={!isOwner}
            className="w-full rounded-xl border border-white/10 bg-gray-950 px-4 py-2.5 font-mono text-sm text-white placeholder-gray-600 outline-none transition focus:border-emerald-500/50 disabled:cursor-not-allowed disabled:opacity-40"
          />
        </div>

        {/* amount */}
        <div>
          <label className="mb-1.5 block text-xs font-medium text-gray-400">Amount (TVG)</label>
          <input
            type="number"
            min="1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g. 5000"
            disabled={!isOwner}
            className="w-full rounded-xl border border-white/10 bg-gray-950 px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none transition focus:border-emerald-500/50 disabled:cursor-not-allowed disabled:opacity-40"
          />
        </div>

        {/* preview */}
        {amount && Number(amount) > 0 && (
          <div className="flex items-center justify-between rounded-xl border border-white/5 bg-gray-950/60 px-4 py-2.5">
            <span className="text-xs text-gray-500">Minting</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-white tabular-nums">
                {Number(amount).toLocaleString()}
              </span>
              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-bold text-emerald-400">TVG</span>
            </div>
          </div>
        )}

        <TxButton
          onClick={handleMint}
          isPending={isPending}
          isConfirming={isConfirming}
          isConfirmed={isConfirmed}
          disabled={!canSubmit}
          label="Mint TVG"
          confirmLabel="TVG minted successfully!"
        />

        {!isOwner && (
          <p className="text-center text-xs text-gray-600">Connect as owner to enable minting</p>
        )}
      </div>
    </div>
  );
}

/* ─── ERC-1155 education box ───────────────────────────────── */
function ERC1155EducationBox() {
  return (
    <div className="mb-8 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
      <div className="h-px w-full bg-gradient-to-r from-transparent via-amber-500/60 to-transparent" />
      <div className="p-6">
        <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-purple-400">How It Works</p>
        <h3 className="mb-5 text-base font-bold text-white">ERC-1155 Minting Functions</h3>

        <div className="grid gap-6 md:grid-cols-2">
          {/* mint() */}
          <div className="rounded-xl border border-white/5 bg-gray-900/60 p-5">
            <div className="mb-3 flex items-center gap-2">
              <span className="rounded-lg bg-amber-500/10 px-2.5 py-1 font-mono text-xs font-bold text-amber-400">mint()</span>
              <span className="text-xs text-gray-500">Single Token Type</span>
            </div>
            <p className="mb-4 text-xs leading-relaxed text-gray-400">
              Mints one specific token type in a given amount to an address. Internally calls{' '}
              <span className="font-mono text-gray-300">_mint(to, id, amount, "")</span> which
              updates the balance mapping and emits a{' '}
              <span className="font-mono text-gray-300">TransferSingle</span> event.
            </p>
            <div className="rounded-lg bg-gray-950/80 px-4 py-3 font-mono text-xs text-gray-300">
              <span className="text-purple-400">mint</span>
              <span className="text-gray-500">(</span>
              <span className="text-amber-300">address</span> to,{' '}
              <span className="text-amber-300">uint256</span> id,{' '}
              <span className="text-amber-300">uint256</span> amount
              <span className="text-gray-500">)</span>
            </div>
            <p className="mt-3 text-xs text-gray-500">
              <span className="text-amber-400/80">onlyOwner</span> — one transaction per token type.
            </p>
          </div>

          {/* mintBatch() */}
          <div className="rounded-xl border border-white/5 bg-gray-900/60 p-5">
            <div className="mb-3 flex items-center gap-2">
              <span className="rounded-lg bg-purple-500/10 px-2.5 py-1 font-mono text-xs font-bold text-purple-400">mintBatch()</span>
              <span className="text-xs text-gray-500">Multiple Token Types</span>
            </div>
            <p className="mb-4 text-xs leading-relaxed text-gray-400">
              Mints multiple token types in a single transaction using parallel arrays —{' '}
              <span className="font-mono text-gray-300">ids[i]</span> maps to{' '}
              <span className="font-mono text-gray-300">amounts[i]</span>. Emits one{' '}
              <span className="font-mono text-gray-300">TransferBatch</span> event instead
              of N separate events, saving gas proportional to how many types are minted.
            </p>
            <div className="rounded-lg bg-gray-950/80 px-4 py-3 font-mono text-xs text-gray-300">
              <span className="text-purple-400">mintBatch</span>
              <span className="text-gray-500">(</span>
              <span className="text-amber-300">address</span> to,{' '}
              <span className="text-amber-300">uint256[]</span> ids,{' '}
              <span className="text-amber-300">uint256[]</span> amounts
              <span className="text-gray-500">)</span>
            </div>
            <p className="mt-3 text-xs text-gray-500">
              <span className="text-purple-400/80">Gas advantage</span> — five mints in one call costs far less than five separate calls.
            </p>
          </div>
        </div>

        <div className="mt-5 flex items-start gap-3 rounded-xl border border-amber-500/15 bg-amber-500/5 px-5 py-4">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="mt-0.5 shrink-0 text-amber-400">
            <path d="M8 1.5a2.5 2.5 0 0 1 2.5 2.5v1h1A1.5 1.5 0 0 1 13 6.5v7A1.5 1.5 0 0 1 11.5 15h-7A1.5 1.5 0 0 1 3 13.5v-7A1.5 1.5 0 0 1 4.5 5h1V4A2.5 2.5 0 0 1 8 1.5Zm0 1.5A1 1 0 0 0 7 4v1h2V4a1 1 0 0 0-1-1Z" fill="currentColor" />
          </svg>
          <div>
            <p className="mb-1 text-xs font-semibold text-amber-300">Access Control — onlyOwner</p>
            <p className="text-xs leading-relaxed text-gray-400">
              Both functions are restricted to the contract owner via OpenZeppelin's{' '}
              <span className="font-mono text-gray-300">Ownable</span> pattern. Only the
              deployer's address can create new supply, preventing unlimited token printing.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── ERC-1155 single mint ─────────────────────────────────── */
function SingleMint({ isOwner, address }) {
  const [tokenId, setTokenId] = useState(TOKENS[0].id.toString());
  const [amount, setAmount] = useState('');

  const { writeContract, data: txHash, isPending, reset } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash: txHash });

  useEffect(() => {
    if (isConfirmed) {
      setAmount('');
      const t = setTimeout(reset, 3000);
      return () => clearTimeout(t);
    }
  }, [isConfirmed, reset]);

  function handleMint() {
    if (!amount || Number(amount) <= 0) return;
    writeContract({
      address: TOKEN_VERSE_1155_ADDRESS,
      abi: TOKEN_VERSE_ABI,
      functionName: 'mint',
      args: [address, BigInt(tokenId), BigInt(amount)],
    });
  }

  const selectedToken = TOKENS.find((t) => t.id.toString() === tokenId);
  const rarity = selectedToken ? RARITY_CONFIG[selectedToken.rarity] : null;
  const canSubmit = isOwner && !!amount && Number(amount) > 0;

  return (
    <div className="rounded-2xl border border-white/5 bg-gray-900 p-6">
      <div className="mb-5 flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10">
          <span className="font-mono text-sm font-bold text-amber-400">1×</span>
        </span>
        <div>
          <h3 className="text-base font-bold text-white">Single Mint</h3>
          <p className="text-xs text-gray-500">Calls <span className="font-mono text-gray-300">mint(to, id, amount)</span></p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-gray-400">Token</label>
          <select
            value={tokenId}
            onChange={(e) => setTokenId(e.target.value)}
            disabled={!isOwner}
            className="w-full rounded-xl border border-white/10 bg-gray-950 px-4 py-2.5 text-sm text-white outline-none transition focus:border-amber-500/50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {TOKENS.map((t) => (
              <option key={t.id} value={t.id.toString()}>
                {t.name} — #{t.id.toString()} ({t.rarity})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-gray-400">Amount</label>
          <input
            type="number"
            min="1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g. 100"
            disabled={!isOwner}
            className="w-full rounded-xl border border-white/10 bg-gray-950 px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none transition focus:border-amber-500/50 disabled:cursor-not-allowed disabled:opacity-40"
          />
        </div>

        {selectedToken && (
          <div className="flex items-center justify-between rounded-xl border border-white/5 bg-gray-950/60 px-4 py-2.5">
            <span className="text-xs text-gray-500">Minting</span>
            <div className="flex items-center gap-2">
              <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${rarity.badge}`}>
                {selectedToken.rarity}
              </span>
              <span className="text-sm font-semibold text-white">{selectedToken.name}</span>
              {amount && Number(amount) > 0 && (
                <span className="font-mono text-sm text-amber-400">× {amount}</span>
              )}
            </div>
          </div>
        )}

        <TxButton
          onClick={handleMint}
          isPending={isPending}
          isConfirming={isConfirming}
          isConfirmed={isConfirmed}
          disabled={!canSubmit}
          label="Mint Token"
          confirmLabel="Minted successfully!"
        />

        {!isOwner && (
          <p className="text-center text-xs text-gray-600">Connect as owner to enable minting</p>
        )}
      </div>
    </div>
  );
}

/* ─── ERC-1155 batch mint ──────────────────────────────────── */
const initBatch = () =>
  Object.fromEntries(TOKENS.map((t) => [t.id.toString(), { checked: false, amount: '' }]));

function BatchMint({ isOwner, address }) {
  const [selections, setSelections] = useState(initBatch);

  const { writeContract, data: txHash, isPending, reset } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash: txHash });

  useEffect(() => {
    if (isConfirmed) {
      setSelections(initBatch());
      const t = setTimeout(reset, 3000);
      return () => clearTimeout(t);
    }
  }, [isConfirmed, reset]);

  function toggle(id) {
    setSelections((prev) => ({ ...prev, [id]: { ...prev[id], checked: !prev[id].checked } }));
  }

  function setAmt(id, val) {
    setSelections((prev) => ({ ...prev, [id]: { ...prev[id], amount: val } }));
  }

  const selected = TOKENS.filter(
    (t) => selections[t.id.toString()]?.checked && Number(selections[t.id.toString()].amount) > 0,
  );

  function handleBatchMint() {
    if (selected.length === 0) return;
    writeContract({
      address: TOKEN_VERSE_1155_ADDRESS,
      abi: TOKEN_VERSE_ABI,
      functionName: 'mintBatch',
      args: [
        address,
        selected.map((t) => t.id),
        selected.map((t) => BigInt(selections[t.id.toString()].amount)),
      ],
    });
  }

  const canSubmit = isOwner && selected.length > 0;

  return (
    <div className="rounded-2xl border border-white/5 bg-gray-900 p-6">
      <div className="mb-5 flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/10">
          <span className="font-mono text-sm font-bold text-purple-400">N×</span>
        </span>
        <div>
          <h3 className="text-base font-bold text-white">Batch Mint</h3>
          <p className="text-xs text-gray-500">Calls <span className="font-mono text-gray-300">mintBatch(to, ids[], amounts[])</span></p>
        </div>
      </div>

      <div className="mb-4 flex flex-col gap-2">
        {TOKENS.map((t) => {
          const sel = selections[t.id.toString()];
          const rarity = RARITY_CONFIG[t.rarity];
          return (
            <label
              key={t.id}
              className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition-colors ${
                sel.checked ? 'border-purple-500/30 bg-purple-500/5' : 'border-white/5 bg-gray-950/40'
              } ${!isOwner ? 'cursor-not-allowed opacity-40' : ''}`}
            >
              <input
                type="checkbox"
                checked={sel.checked}
                disabled={!isOwner}
                onChange={() => toggle(t.id.toString())}
                className="h-4 w-4 accent-purple-500"
              />
              <div className="flex min-w-0 flex-1 items-center gap-2">
                <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${rarity.badge}`}>
                  {t.rarity}
                </span>
                <span className="truncate text-sm font-medium text-white">{t.name}</span>
                <span className="font-mono text-xs text-gray-600">#{t.id.toString()}</span>
              </div>
              <input
                type="number"
                min="1"
                value={sel.amount}
                disabled={!sel.checked || !isOwner}
                onChange={(e) => setAmt(t.id.toString(), e.target.value)}
                placeholder="amt"
                className="w-20 rounded-lg border border-white/10 bg-gray-900 px-3 py-1.5 text-right text-sm text-white placeholder-gray-600 outline-none transition focus:border-purple-500/50 disabled:cursor-not-allowed disabled:opacity-30"
              />
            </label>
          );
        })}
      </div>

      <div className="mb-4 rounded-xl border border-white/5 bg-gray-950/60 px-4 py-3">
        {selected.length === 0 ? (
          <p className="text-center text-xs text-gray-600">Select at least one token to batch mint</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {selected.map((t) => (
              <span key={t.id} className="rounded-full border border-purple-500/20 bg-purple-500/10 px-2.5 py-0.5 text-xs text-purple-300">
                {t.name} × {selections[t.id.toString()].amount}
              </span>
            ))}
          </div>
        )}
      </div>

      <TxButton
        onClick={handleBatchMint}
        isPending={isPending}
        isConfirming={isConfirming}
        isConfirmed={isConfirmed}
        disabled={!canSubmit}
        label={`Batch Mint${selected.length > 0 ? ` (${selected.length} type${selected.length > 1 ? 's' : ''})` : ''}`}
        confirmLabel="Batch minted successfully!"
      />

      {!isOwner && (
        <p className="mt-3 text-center text-xs text-gray-600">Connect as owner to enable minting</p>
      )}
    </div>
  );
}

/* ─── ERC-721 education box ────────────────────────────────── */
function ERC721EducationBox() {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
      <div className="h-px w-full bg-gradient-to-r from-transparent via-blue-500/60 to-transparent" />
      <div className="p-6">
        <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-blue-400">How It Works</p>
        <h3 className="mb-4 text-base font-bold text-white">ERC-721 Public Mint</h3>

        <div className="mb-4 rounded-xl border border-white/5 bg-gray-900/60 p-4">
          <div className="mb-2 flex items-center gap-2">
            <span className="rounded-lg bg-blue-500/10 px-2.5 py-1 font-mono text-xs font-bold text-blue-400">mint()</span>
            <span className="text-xs text-gray-500">Public · one per type</span>
          </div>
          <p className="mb-3 text-xs leading-relaxed text-gray-400">
            Any connected wallet can call this once per character type. The contract tracks
            claims via a nested{' '}
            <span className="font-mono text-gray-300">mapping(address =&gt; mapping(uint256 =&gt; bool))</span>{' '}
            and reverts with{' '}
            <span className="font-mono text-gray-300">AlreadyMinted</span> on a second attempt.
            A global cap of 50 enforces scarcity across all types.
          </p>
          <div className="rounded-lg bg-gray-950/80 px-4 py-3 font-mono text-xs text-gray-300">
            <span className="text-blue-400">mint</span>
            <span className="text-gray-500">(</span>
            <span className="text-amber-300">uint256</span>{' '}typeId
            <span className="text-gray-500">)</span>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-xl border border-blue-500/15 bg-blue-500/5 px-4 py-3">
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none" className="mt-0.5 shrink-0 text-blue-400">
            <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.3" />
            <path d="M5.5 8.5l2 2 3-3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <p className="text-xs leading-relaxed text-gray-400">
            <span className="font-semibold text-blue-300">No owner required</span> — unlike
            ERC-20 and ERC-1155 mints above, this function is open to any wallet. Tokens
            always mint to{' '}
            <span className="font-mono text-gray-300">msg.sender</span>; the{' '}
            <span className="font-mono text-gray-300">typeId</span> determines which character
            is assigned.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─── ERC-721 mint form ─────────────────────────────────────── */
function ERC721MintForm({ isConnected, address }) {
  const [typeId, setTypeId] = useState('0');

  const { data: alreadyMinted, refetch } = useReadContract({
    address: TOKEN_VERSE_ERC721_ADDRESS,
    abi: TOKEN_VERSE_ERC721_ABI,
    functionName: 'hasMintedType',
    args: [address ?? '0x0000000000000000000000000000000000000000', BigInt(typeId)],
    query: { enabled: !!TOKEN_VERSE_ERC721_ADDRESS && isConnected },
  });

  const { writeContract, data: txHash, isPending, reset } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash: txHash });

  useEffect(() => {
    if (isConfirmed) {
      refetch();
      const t = setTimeout(reset, 3000);
      return () => clearTimeout(t);
    }
  }, [isConfirmed, refetch, reset]);

  function handleMint() {
    writeContract({
      address: TOKEN_VERSE_ERC721_ADDRESS,
      abi: TOKEN_VERSE_ERC721_ABI,
      functionName: 'mint',
      args: [BigInt(typeId)],
    });
  }

  const selectedType = ERC721_TYPES.find((t) => t.id.toString() === typeId);
  const canSubmit = isConnected && !alreadyMinted;

  return (
    <div className="rounded-2xl border border-white/5 bg-gray-900 p-6">
      <div className="mb-5 flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10">
          <span className="font-mono text-sm font-bold text-blue-400">NFT</span>
        </span>
        <div>
          <h3 className="text-base font-bold text-white">Mint Character NFT</h3>
          <p className="text-xs text-gray-500">Calls <span className="font-mono text-gray-300">mint(typeId)</span></p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {/* recipient — read-only, contract always mints to msg.sender */}
        <div>
          <label className="mb-1.5 block text-xs font-medium text-gray-400">
            Recipient
            <span className="ml-2 text-gray-600">(mints to connected wallet)</span>
          </label>
          <div className="w-full rounded-xl border border-white/10 bg-gray-950 px-4 py-2.5 font-mono text-sm text-gray-500 truncate">
            {address ?? <span className="text-gray-600">not connected</span>}
          </div>
        </div>

        {/* character type */}
        <div>
          <label className="mb-1.5 block text-xs font-medium text-gray-400">Character Type</label>
          <select
            value={typeId}
            onChange={(e) => setTypeId(e.target.value)}
            disabled={!isConnected}
            className="w-full rounded-xl border border-white/10 bg-gray-950 px-4 py-2.5 text-sm text-white outline-none transition focus:border-blue-500/50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {ERC721_TYPES.map((t) => (
              <option key={t.id} value={t.id.toString()}>
                {t.name} — #{t.id} ({t.class} · {t.element})
              </option>
            ))}
          </select>
        </div>

        {/* preview row */}
        {selectedType && (
          <div className="flex items-center justify-between rounded-xl border border-white/5 bg-gray-950/60 px-4 py-2.5">
            <span className="text-xs text-gray-500">Minting</span>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-xs font-semibold text-blue-400">
                Legendary
              </span>
              <span className="text-sm font-semibold text-white">{selectedType.name}</span>
              <span className="font-mono text-xs text-gray-500">Type #{selectedType.id}</span>
            </div>
          </div>
        )}

        {/* already-minted notice */}
        {isConnected && alreadyMinted && (
          <div className="flex items-center justify-center gap-2 rounded-xl border border-blue-500/20 bg-blue-500/5 py-2.5 text-xs font-semibold text-blue-400">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.3" />
              <path d="M6 4v3M6 8.5v.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            </svg>
            Already minted this type
          </div>
        )}

        <TxButton
          onClick={handleMint}
          isPending={isPending}
          isConfirming={isConfirming}
          isConfirmed={isConfirmed}
          disabled={!canSubmit}
          label="Mint NFT"
          confirmLabel="NFT minted!"
        />

        {!isConnected && (
          <p className="text-center text-xs text-gray-600">Connect wallet to enable minting</p>
        )}
      </div>
    </div>
  );
}

/* ─── page ─────────────────────────────────────────────────── */
export default function MintLab() {
  const { address, isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();

  const { data: owner1155 } = useReadContract({
    address: TOKEN_VERSE_1155_ADDRESS,
    abi: TOKEN_VERSE_ABI,
    functionName: 'owner',
  });

  const { data: ownerERC20 } = useReadContract({
    address: TOKEN_VERSE_ERC20_ADDRESS,
    abi: TOKEN_VERSE_ERC20_ABI,
    functionName: 'owner',
  });

  const isOwner1155 = isConnected && !!address && !!owner1155 && address.toLowerCase() === owner1155.toLowerCase();
  const isOwnerERC20 = isConnected && !!address && !!ownerERC20 && address.toLowerCase() === ownerERC20.toLowerCase();

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-gray-950 px-6 py-10">
      <div className="mx-auto max-w-7xl">

        {/* ── Owner badge — top right ──────────────────────────── */}
        <div className="mb-8 flex items-start justify-between">
          {/* left spacer / hero title inline */}
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-amber-400">
              Owner Only
            </p>
            <h1 className="text-4xl font-extrabold tracking-tight text-white">
              Mint{' '}
              <span className="bg-gradient-to-r from-amber-400 to-purple-400 bg-clip-text text-transparent">
                Lab
              </span>
            </h1>
            <p className="mt-2 max-w-md text-sm text-gray-400">
              Create new token supply on-chain. ERC-20 fungible tokens and
              ERC-1155 multi-tokens — both owner-restricted, both live.
            </p>
            {!isConnected && (
              <button
                onClick={openConnectModal}
                className="mt-5 inline-flex items-center gap-3 rounded-full bg-white py-2.5 pl-7 pr-3 text-base font-semibold text-gray-900 transition-all duration-200 hover:bg-gray-100"
              >
                Connect Wallet
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-400">
                  <svg width="14" height="14" viewBox="0 0 12 12" fill="none">
                    <path d="M2.5 6h7M6.5 3l3 3-3 3" stroke="#111" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </button>
            )}
          </div>

          {/* owner badge — top right */}
          <OwnerBadge owner={owner1155} address={address} isConnected={isConnected} />
        </div>

        {/* ── ERC-20 section ───────────────────────────────────── */}
        <div className="mb-12">
          <SectionHeader
            eyebrow="ERC-20 · TokenVerse Gold"
            title="Mint Fungible Tokens"
            accent="text-emerald-400"
          />
          <div className="grid gap-6 lg:grid-cols-2">
            <ERC20EducationBox />
            <ERC20MintForm isOwner={isOwnerERC20} address={address} />
          </div>
        </div>

        {/* ── ERC-721 section ──────────────────────────────────── */}
        <div className="mb-12">
          <SectionHeader
            eyebrow="ERC-721 · TokenVerse NFT"
            title="Mint Character NFTs"
            accent="text-blue-400"
          />
          <div className="grid gap-6 lg:grid-cols-2">
            <ERC721EducationBox />
            <ERC721MintForm isConnected={isConnected} address={address} />
          </div>
        </div>

        {/* ── ERC-1155 section ─────────────────────────────────── */}
        <div>
          <SectionHeader
            eyebrow="ERC-1155 · Multi-Token"
            title="Mint Collection Tokens"
            accent="text-amber-400"
          />
          <ERC1155EducationBox />
          <div className="grid gap-6 md:grid-cols-2">
            <SingleMint isOwner={isOwner1155} address={address} />
            <BatchMint isOwner={isOwner1155} address={address} />
          </div>
        </div>

      </div>
    </div>
  );
}
