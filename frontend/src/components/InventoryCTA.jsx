import { Link } from 'react-router-dom';

export const ICONS = {
  transfer: (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 5h12M10 2l4 3-4 3M14 11H2M6 8l-4 3 4 3" />
    </svg>
  ),
  approve: (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="7" width="10" height="8" rx="1.5" />
      <path d="M5 7V5a3 3 0 0 1 6 0v2" />
    </svg>
  ),
  burn: (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 2C6.5 4.5 4 6 4 9a4 4 0 0 0 8 0c0-3-2.5-4.5-4-7Z" />
    </svg>
  ),
  nft: (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="12" height="12" rx="2" />
      <circle cx="8" cy="8" r="2" />
    </svg>
  ),
  batch: (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="5" height="5" rx="1" />
      <rect x="9" y="2" width="5" height="5" rx="1" />
      <rect x="2" y="9" width="5" height="5" rx="1" />
      <rect x="9" y="9" width="5" height="5" rx="1" />
    </svg>
  ),
  dismantle: (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 12l8-8M10 4h2v2" />
      <path d="M4 8.5l3.5 3.5" />
    </svg>
  ),
};

export default function InventoryCTA({ accent, hint, items }) {
  return (
    <div className={`mt-6 overflow-hidden rounded-xl border ${accent.border} ${accent.bg}`}>
      <div className={`h-px w-full bg-gradient-to-r from-transparent ${accent.glow} to-transparent`} />
      <div className="p-5">

        <div className="mb-3 flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className={accent.iconClass}>
            <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.3" />
            <path d="M5.5 8.5l2 2 3-3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <p className={`text-xs font-bold uppercase tracking-widest ${accent.label}`}>
            What's next?
          </p>
        </div>

        <p className="mb-4 text-xs leading-relaxed text-gray-400">{hint}</p>

        <div className="mb-5 space-y-2.5">
          {items.map(({ icon, action, desc }) => (
            <div key={action} className="flex items-start gap-2.5">
              <span className={`mt-0.5 shrink-0 ${accent.iconClass}`}>{icon}</span>
              <p className="text-xs leading-relaxed text-gray-400">
                <span className={`font-mono font-semibold ${accent.label}`}>{action}</span>
                {' — '}{desc}
              </p>
            </div>
          ))}
        </div>

        <Link
          to="/inventory"
          className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-gray-950 transition-all duration-200 hover:opacity-90 ${accent.btn}`}
        >
          Open Inventory
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 8h10M9 4l4 4-4 4" />
          </svg>
        </Link>

      </div>
    </div>
  );
}
