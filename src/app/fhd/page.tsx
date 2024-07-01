'use client';

import React, { useState, useEffect, useRef } from 'react';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { baseSepolia } from 'viem/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { getDefaultConfig, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { PixelGridLogo } from '@/components/PixelGridLogo';
import Image from 'next/image';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';

const config = getDefaultConfig({
  appName: 'PixelGrid',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '',
  chains: [baseSepolia],
  ssr: true,
});

const queryClient = new QueryClient();

interface Pixel {
  x: number;
  y: number;
  color: string;
}

const getPixelData = (): Pixel[] => {
  const pixels: Pixel[] = [];
  for (let i = 0; i < 100; i++) {
    pixels.push({
      x: Math.floor(Math.random() * 1920),
      y: Math.floor(Math.random() * 1080),
      color: `rgba(${Math.random() * 255},${Math.random() * 255},${Math.random() * 255},1)`
    });
  }
  return pixels;
};

export default function FHDPage() {
  const [mounted, setMounted] = useState(false);
  const [pixels, setPixels] = useState<Pixel[]>([]);
  const [initialScale, setInitialScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    setPixels(getPixelData());

    const updateScale = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        const containerHeight = containerRef.current.clientHeight;
        const scaleX = containerWidth / 1920;
        const scaleY = containerHeight / 1080;
        setInitialScale(Math.max(scaleX, scaleY));
      }
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <div className="flex flex-col h-screen bg-white">
            <header className="p-4 border-b flex justify-between items-center">
              <PixelGridLogo />
              <ConnectButton />
            </header>
            <main className="flex-grow relative overflow-hidden" ref={containerRef}>
              <TransformWrapper
                initialScale={initialScale}
                minScale={initialScale}
                maxScale={3}
                centerOnInit={true}
                panning={{disabled: false}}
              >
                <TransformComponent wrapperStyle={{width: '100%', height: '100%'}}>
                  <svg 
                    width="1920" 
                    height="1080" 
                    viewBox="0 0 1920 1080" 
                    preserveAspectRatio="xMidYMid meet"
                  >
                    <rect width="1920" height="1080" fill="#f0f0f0" />
                    {pixels.map((pixel, index) => (
                      <rect
                        key={index}
                        x={pixel.x}
                        y={pixel.y}
                        width="1"
                        height="1"
                        fill={pixel.color}
                      />
                    ))}
                  </svg>
                </TransformComponent>
              </TransformWrapper>
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