import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// React 19 dev mode serializes component state for DevTools via JSON.stringify,
// which throws on BigInt values returned by wagmi/viem. Teach it how to handle them.
BigInt.prototype.toJSON = function () { return this.toString(); };

// Prevent unhandled wallet connector rejections (e.g. MetaMask not installed)
// from crashing the page. RainbowKit surfaces these in its own UI.
window.addEventListener('unhandledrejection', (event) => {
  const msg = event.reason?.message ?? '';
  if (
    msg.includes('MetaMask') ||
    msg.includes('ethereum') ||
    msg.includes('wallet') ||
    msg.includes('provider') ||
    msg.includes('connector') ||
    msg.includes('User rejected')
  ) {
    event.preventDefault();
  }
});

import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { BrowserRouter } from 'react-router-dom';

import '@rainbow-me/rainbowkit/styles.css';
import './index.css';

import { wagmiConfig } from './wagmi.config';
import App from './App.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </ErrorBoundary>
  </StrictMode>,
);
