'use client';

import React, { useState, useEffect } from 'react';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { baseSepolia } from 'viem/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { getDefaultConfig, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { PixelGridLogo } from '@/components/PixelGridLogo';
import Image from 'next/image';

const config = getDefaultConfig({
  appName: 'PixelGrid',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '',
  chains: [baseSepolia],
  ssr: true,
});

const queryClient = new QueryClient();

export default function FHDPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <div className="min-h-screen bg-white flex flex-col">
            <header className="p-4 border-b flex justify-between items-center">
              <PixelGridLogo />
              <ConnectButton />
            </header>
            <main className="flex-grow p-4">
              <h2 className="text-xl mb-4">Welcome to PixelGrid</h2>
              <p>This page demonstrates the use of RainbowKit for wallet connection.</p>
            </main>
            <footer className="p-4 border-t">
              <div className="flex flex-col items-center justify-center">
                <p className="text-sm text-gray-600 mb-2">Developed for</p>
                <a 
                  href="https://base.org/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center space-x-2 text-[#0052FF] hover:text-[#0039B3] transition-colors"
                >
                  <Image src="/base-logo.svg" alt="Base Logo" width={24} height={24} />
                  <span className="font-semibold">Base Chain</span>
                </a>
              </div>
            </footer>
          </div>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
