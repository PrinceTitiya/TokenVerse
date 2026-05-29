import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { sepolia } from 'wagmi/chains';
import { http } from 'wagmi';

const anvil = {
  id: 31337,
  name: 'Anvil',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['http://localhost:8545'] },
  },
};

export const wagmiConfig = getDefaultConfig({
  appName: 'TokenVerse',
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID,
  chains: [anvil, sepolia],
  // Explicit transports required — without them wagmi silently omits the
  // transport, causing "to: None" errors on Anvil eth_call requests.
  transports: {
    [anvil.id]: http('http://localhost:8545'),
    [sepolia.id]: http(import.meta.env.VITE_SEPOLIA_RPC_URL || ''),
  },
  ssr: false,
});
