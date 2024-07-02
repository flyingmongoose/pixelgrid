'use client';

import React, { useState, useEffect, useRef } from 'react';
import { WagmiProvider, createConfig } from 'wagmi';
import { base } from 'viem/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { getDefaultConfig, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { useReadContract, useReadContracts } from 'wagmi';
import { parseAbiItem } from 'viem';
import { NavbarHeader } from '@/components/NavbarHeader';
import { Footer } from '@/components/layout/Footer';
import { LoadingOverlay } from '@/components/LoadingOverlay';

const config = getDefaultConfig({
  appName: 'PixelGrid',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '',
  chains: [base],
  ssr: true,
});

const queryClient = new QueryClient();

const CONTRACT_ADDRESS = '0x4821011E135edcaE76fD2Ff857a45ECa9154a378' as const;

const ABI = [
  parseAbiItem('function totalMintedPixels() view returns (uint256)'),
  parseAbiItem('function pixels(uint256) view returns (uint32 color, uint32 position, string ownerMessage)'),
] as const;

interface Pixel {
  x: number;
  y: number;
  color: string;
}

function PixelGrid() {
  const [pixels, setPixels] = useState<Pixel[]>([]);

  const { data: totalMintedPixels } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ABI,
    functionName: 'totalMintedPixels',
  });

  const pixelIndexes = totalMintedPixels ? Array.from({ length: Number(totalMintedPixels) }, (_, i) => i) : [];

  const { data: pixelsData } = useReadContracts({
    contracts: pixelIndexes.map(index => ({
      address: CONTRACT_ADDRESS,
      abi: ABI,
      functionName: 'pixels',
      args: [BigInt(index)],
    })),
  });

  useEffect(() => {
    if (pixelsData) {
      const newPixels: Pixel[] = pixelsData
        .map((pixelData) => {
          if (pixelData.result) {
            const result = pixelData.result as bigint;
            
            const binaryStr = result.toString(2).padStart(64, '0');
            
            const colorBinary = binaryStr.slice(0, 32);
            const positionBinary = binaryStr.slice(32);

            const color = parseInt(colorBinary, 2);
            const position = parseInt(positionBinary, 2);

            const x = (position >> 16) & 0xFFFF;
            const y = position & 0xFFFF;
            const r = (color >> 24) & 0xFF;
            const g = (color >> 16) & 0xFF;
            const b = (color >> 8) & 0xFF;
            const a = color & 0xFF;
            
            return {
              x,
              y,
              color: `rgba(${r},${g},${b},${a / 255})`,
            };
          }
          return null;
        })
        .filter((pixel): pixel is Pixel => pixel !== null);

      setPixels(newPixels);
    }
  }, [pixelsData]);

  return (
    <svg width="1920" height="1080" viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMid meet">
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
  );
}

export default function FHDPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [initialScale, setInitialScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        const containerHeight = containerRef.current.clientHeight;
        const scaleX = containerWidth / 1920;
        const scaleY = containerHeight / 1080;
        setInitialScale(Math.min(scaleX, scaleY));
      }
    };

    updateScale();
    window.addEventListener('resize', updateScale);

    // Simulate loading time (remove this in production and use actual loading logic)
    const timer = setTimeout(() => setIsLoading(false), 3000);

    return () => {
      window.removeEventListener('resize', updateScale);
      clearTimeout(timer);
    };
  }, []);

  if (isLoading) {
    return <LoadingOverlay />;
  }

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <div className="flex flex-col min-h-screen bg-white">
            {/* Warning Message */}
            <div className="bg-red-100 border-b-4 border-red-500 text-red-700 px-4 py-3 shadow-md" role="alert">
              <div className="flex justify-center items-center">
                <span className="text-3xl mr-2">⚠️</span>
                <p className="font-bold text-2xl underline">
                  Non-Functional Work In Progress
                </p>
                <span className="text-3xl ml-2">⚠️</span>
              </div>
            </div>
            
            <NavbarHeader />
            <main className="flex-grow relative" ref={containerRef}>
              <div className="absolute inset-0 overflow-hidden">
                <TransformWrapper
                  initialScale={initialScale}
                  minScale={initialScale}
                  maxScale={3}
                  centerOnInit={true}
                  panning={{disabled: false}}
                >
                  <TransformComponent wrapperStyle={{width: '100%', height: '100%'}}>
                    <PixelGrid />
                  </TransformComponent>
                </TransformWrapper>
              </div>
            </main>
            <Footer />
          </div>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
