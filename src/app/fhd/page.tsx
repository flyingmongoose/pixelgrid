'use client';

import React, { useState, useEffect, useRef } from 'react';
import { WagmiProvider, createConfig } from 'wagmi';
import { base } from 'viem/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { getDefaultConfig, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { useReadContract, useReadContracts } from 'wagmi';
import { parseAbiItem } from 'viem';
import { RgbaColorPicker } from 'react-colorful';
import { NavbarHeader } from '@/components/NavbarHeader';
import { Footer } from '@/components/layout/Footer';

const config = getDefaultConfig({
  appName: 'PixelGrid',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '',
  chains: [base],
  ssr: true,
});

const queryClient = new QueryClient();

const CONTRACT_ADDRESS = '0x4821011E135edcaE76fD2Ff857a45ECa9154a378' as const; // Replace with your actual contract address on Base mainnet

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

interface MintModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function MintModal({ isOpen, onClose }: MintModalProps) {
  const [x, setX] = useState('');
  const [y, setY] = useState('');
  const [color, setColor] = useState({ r: 0, g: 0, b: 0, a: 1 });
  const [ownerMessage, setOwnerMessage] = useState('');

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Minting pixel:', { x, y, color, ownerMessage });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">Mint a Pixel</h2>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <input type="number" placeholder="X Position (0-1920)" value={x} onChange={(e) => setX(e.target.value)} className="border p-2 rounded" min="0" max="1920" required />
            <input type="number" placeholder="Y Position (0-1080)" value={y} onChange={(e) => setY(e.target.value)} className="border p-2 rounded" min="0" max="1080" required />
          </div>
          <div className="mb-4 flex justify-center">
            <RgbaColorPicker color={color} onChange={setColor} />
          </div>
          <textarea placeholder="Message" value={ownerMessage} onChange={(e) => setOwnerMessage(e.target.value)} className="border p-2 rounded w-full mb-4" required></textarea>
          <div className="flex justify-end">
            <button type="button" onClick={onClose} className="mr-2 px-4 py-2 bg-[#0052FF] text-white rounded hover:bg-[#0039B3] transition-colors">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-[#0052FF] text-white rounded hover:bg-[#0039B3] transition-colors">Mint</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function FHDPage() {
  const [mounted, setMounted] = useState(false);
  const [initialScale, setInitialScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMintModalOpen, setIsMintModalOpen] = useState(false);

  useEffect(() => {
    setMounted(true);

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
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  const handleMintClick = () => {
    setIsMintModalOpen(true);
  };

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <div className="flex flex-col h-screen bg-white">
            <NavbarHeader onMintClick={handleMintClick} />
            <main className="flex-grow relative overflow-hidden" ref={containerRef}>
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
            </main>
            <Footer />
          </div>
          <MintModal isOpen={isMintModalOpen} onClose={() => setIsMintModalOpen(false)} />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
