"use client";
import { WagmiProvider, createConfig, http } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { defineChain } from 'viem';
import { ReactNode, useState } from 'react';

const westendAssetHub = defineChain({
  id: 997,
  name: 'Westend Asset Hub',
  network: 'westend-asset-hub',
  nativeCurrency: {
    name: 'WND',
    symbol: 'WND',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://westend-asset-hub-eth-rpc.polkadot.io'],
    },
  },
  testnet: true,
});

export default function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const config = createConfig({
    chains: [westendAssetHub],
    transports: {
      [westendAssetHub.id]: http(),
    },
  });
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
} 