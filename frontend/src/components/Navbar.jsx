import { ConnectButton } from '@rainbow-me/rainbowkit';
import { NavLink } from 'react-router-dom';

const NAV_LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/inventory', label: 'Inventory' },
];

function WalletButton() {
  return (
    <ConnectButton.Custom>
      {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
        const connected = mounted && account && chain;

        if (!mounted) return <div className="h-12 w-44 rounded-full bg-white/5" />;

        if (!connected) {
          return (
            <button
              onClick={openConnectModal}
              className="group flex items-center gap-3 rounded-full bg-white py-2.5 pl-7 pr-3 text-lg font-semibold text-gray-900 transition-all duration-200 hover:bg-gray-100 hover:shadow-lg hover:shadow-white/10"
            >
              Connect Wallet
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-400 transition-transform duration-200 group-hover:scale-110">
                <svg width="16" height="16" viewBox="0 0 12 12" fill="none">
                  <path d="M2.5 6h7M6.5 3l3 3-3 3" stroke="#111" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </button>
          );
        }

        if (chain.unsupported) {
          return (
            <button
              onClick={openChainModal}
              className="group flex items-center gap-3 rounded-full border border-red-500/30 bg-red-500/10 py-2.5 pl-7 pr-3 text-lg font-semibold text-red-400 transition-all duration-200 hover:bg-red-500/20"
            >
              Wrong Network
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-red-500/30">
                <svg width="16" height="16" viewBox="0 0 12 12" fill="none">
                  <path d="M6 3v3.5M6 8.5v.5" stroke="#f87171" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </span>
            </button>
          );
        }

        return (
          <div className="flex items-center gap-3">
            <button
              onClick={openChainModal}
              className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-base font-medium text-gray-300 transition-colors hover:bg-white/10"
            >
              {chain.hasIcon && chain.iconUrl && (
                <img src={chain.iconUrl} alt={chain.name} className="h-5 w-5 rounded-full" />
              )}
              {chain.name}
            </button>
            <button
              onClick={openAccountModal}
              className="group flex items-center gap-3 rounded-full bg-white py-2.5 pl-6 pr-3 text-lg font-semibold text-gray-900 transition-all duration-200 hover:bg-gray-100"
            >
              {account.displayName}
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-400 transition-transform duration-200 group-hover:scale-110">
                <svg width="16" height="16" viewBox="0 0 12 12" fill="none">
                  <circle cx="6" cy="4" r="2" fill="#111" />
                  <path d="M2 10c0-2.2 1.8-4 4-4s4 1.8 4 4" stroke="#111" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </span>
            </button>
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}

export default function Navbar() {
  return (
    <nav className="fixed left-0 right-0 top-0 z-50 border-b border-white/5 bg-gray-950/95 backdrop-blur-md">
      <div className="h-px w-full bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />

      <div className="flex h-20 w-full items-center justify-between px-10">

        {/* Left — logo + nav links */}
        <div className="flex items-center gap-10">
          <NavLink to="/" className="flex select-none items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-purple-500 shadow-lg shadow-amber-500/20">
              <span className="text-lg font-black text-gray-950">TV</span>
            </div>
            <span className="text-4xl font-bold tracking-tight text-white">
              Token<span className="bg-gradient-to-r from-amber-400 to-purple-400 bg-clip-text text-transparent">Verse</span>
            </span>
          </NavLink>

          <div className="flex items-center gap-8">
            {NAV_LINKS.map(({ to, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `relative text-lg font-medium tracking-wide transition-colors duration-200 ${
                    isActive
                      ? 'text-white after:absolute after:-bottom-1.5 after:left-0 after:h-px after:w-full after:bg-gradient-to-r after:from-amber-400 after:to-purple-400'
                      : 'text-gray-400 hover:text-white'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </div>
        </div>

        {/* Right — wallet */}
        <WalletButton />
      </div>
    </nav>
  );
}
