// src/app/fhd/page.tsx

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
import { SlideOutMintModal } from '@/components/SlideOutMintModal';
import { useAccount } from 'wagmi';

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
  const [showMintModal, setShowMintModal] = useState(false);
  const [selectedPixel, setSelectedPixel] = useState<{ x: number, y: number } | null>(null);
  const { isConnected } = useAccount();

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

  const handlePixelClick = (x: number, y: number) => {
    setSelectedPixel({ x, y });
    setShowMintModal(true);
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-white">
      <NavbarHeader />
      <main className="flex-grow overflow-hidden">
        <div ref={mainRef} className="w-full h-full relative">
        <CanvasPixelGrid 
          dimensions={dimensions} 
          onPixelClick={handlePixelClick}
          selectedPixel={selectedPixel}
        />
        </div>
      </main>
      <Footer />
      {showMintModal && selectedPixel && (
        <SlideOutMintModal
          isOpen={showMintModal}
          onClose={() => {
            setShowMintModal(false);
            setSelectedPixel(null);
          }}
          x={selectedPixel.x}
          y={selectedPixel.y}
        />
      )}
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
