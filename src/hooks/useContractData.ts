// src/hooks/useContractData.ts

import { useState, useEffect } from 'react';
import { useReadContract, useReadContracts } from 'wagmi';
import { parseAbiItem } from 'viem';

const CONTRACT_ADDRESS = '0x4821011E135edcaE76fD2Ff857a45ECa9154a378' as const;

const ABI = [
  parseAbiItem('function totalMintedPixels() view returns (uint256)'),
  parseAbiItem('function pixels(uint256) view returns (uint256)'),
] as const;

interface Pixel {
  x: number;
  y: number;
  color: string;
}

export function useContractData() {
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
            const data = Number(pixelData.result);
            
            // Unpack the data
            const color = Math.floor(data / (2 ** 32)); // Upper 32 bits
            const position = data & ((1 << 32) - 1); // Lower 32 bits

            const x = position >> 16;
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

  return { pixels };
}
