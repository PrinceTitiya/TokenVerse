import { connectorsForWallets } from '@rainbow-me/rainbowkit';
import {
  metaMaskWallet,
  walletConnectWallet,
  rainbowWallet,
} from '@rainbow-me/rainbowkit/wallets';
import { createConfig } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { http } from 'viem';

const connectors = connectorsForWallets(
  [
    {
      groupName: 'Popular',
      wallets: [metaMaskWallet, rainbowWallet, walletConnectWallet],
    },
  ],
  {
    appName: 'TokenVerse',
    projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID,
  },
);

export const wagmiConfig = createConfig({
  chains: [sepolia],
  connectors,
  transports: {
    [sepolia.id]: http(import.meta.env.VITE_SEPOLIA_RPC_URL || ''),
  },
  ssr: false,
});
