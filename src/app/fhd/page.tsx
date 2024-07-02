'use client';

import React from 'react';
import { useEffect, useRef, useState } from 'react';
import { WagmiProvider, createConfig } from 'wagmi';
import { base } from 'viem/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { getDefaultConfig, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { NavbarHeader } from '@/components/NavbarHeader';
import { Footer } from '@/components/layout/Footer';
import { CanvasPixelGrid } from '@/components/CanvasPixelGrid';

const config = getDefaultConfig({
  appName: 'PixelGrid',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '',
  chains: [base],
  ssr: true,
});

const queryClient = new QueryClient();

function FHDPageContent() {
  const mainRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 1920, height: 1080 });

  useEffect(() => {
    function updateDimensions() {
      if (mainRef.current) {
        const { clientWidth, clientHeight } = mainRef.current;
        setDimensions({
          width: clientWidth,
          height: clientHeight
        });
      }
    }

    window.addEventListener('resize', updateDimensions);
    updateDimensions();

    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-white">
      <NavbarHeader />
      <main className="flex-grow overflow-hidden">
        <div ref={mainRef} className="w-full h-full relative">
          <CanvasPixelGrid dimensions={dimensions} />
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function FHDPage() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <FHDPageContent />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
