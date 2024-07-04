// src/hooks/useContractData.ts

import { useState, useEffect, useCallback } from 'react';
import { usePublicClient, useContractRead } from 'wagmi';
import { CONTRACT_ADDRESS, ABI } from '../config/publicClient';

interface Pixel {
  x: number;
  y: number;
  color: string;
  ownerMessage: string;
}

type PixelData = [bigint, bigint, string];

export function useContractData() {
  const [pixels, setPixels] = useState<Pixel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const publicClient = usePublicClient();

  const { data: totalMintedPixels } = useContractRead({
    address: CONTRACT_ADDRESS,
    abi: ABI,
    functionName: 'totalMintedPixels',
  });

  const loadBatch = useCallback(async (start: number, batchSize: number) => {
    if (!totalMintedPixels || !publicClient) return;

    const totalPixels = Number(totalMintedPixels);
    const end = Math.min(start + batchSize, totalPixels);
    const batchIndexes = Array.from({ length: end - start }, (_, i) => start + i);

    try {
      const pixelsData = await publicClient.multicall({
        contracts: batchIndexes.map(index => ({
          address: CONTRACT_ADDRESS,
          abi: ABI,
          functionName: 'pixels',
          args: [BigInt(index)],
        })),
        allowFailure: true,
      });

      const newPixels = pixelsData
        .map((pixelData) => {
          if (pixelData.status === 'success' && pixelData.result) {
            // First, cast to unknown, then to PixelData
            const [color, position, ownerMessage] = pixelData.result as unknown as PixelData;
            
            const x = Number(position & BigInt(0xFFFF));
            const y = Number(position >> BigInt(16));
            const r = Number((color >> BigInt(24)) & BigInt(0xFF));
            const g = Number((color >> BigInt(16)) & BigInt(0xFF));
            const b = Number((color >> BigInt(8)) & BigInt(0xFF));
            const a = Number(color & BigInt(0xFF));
            
            return {
              x,
              y,
              color: `rgba(${r},${g},${b},${a / 255})`,
              ownerMessage,
            };
          }
          return null;
        })
        .filter((pixel): pixel is Pixel => pixel !== null);

      setPixels(prevPixels => [...prevPixels, ...newPixels]);
      setProgress((end / totalPixels) * 100);

      if (end < totalPixels) {
        await loadBatch(end, batchSize);
      } else {
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error loading pixel batch:', error);
      setIsLoading(false);
    }
  }, [totalMintedPixels, publicClient]);

  useEffect(() => {
    if (totalMintedPixels && publicClient) {
      loadBatch(0, 1000);
    }
  }, [totalMintedPixels, publicClient, loadBatch]);

  const refreshPixel = useCallback(async (x: number, y: number) => {
    if (!publicClient) {
      console.error('Public client is not available');
      return;
    }

    const tokenId = BigInt(x) * BigInt(65536) + BigInt(y);
    try {
      const data = await publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: ABI,
        functionName: 'pixels',
        args: [tokenId],
      });

      if (data) {
        // First, cast to unknown, then to PixelData
        const [color, position, ownerMessage] = data as unknown as PixelData;
        const r = Number((color >> BigInt(24)) & BigInt(0xFF));
        const g = Number((color >> BigInt(16)) & BigInt(0xFF));
        const b = Number((color >> BigInt(8)) & BigInt(0xFF));
        const a = Number(color & BigInt(0xFF));

        const updatedPixel: Pixel = {
          x,
          y,
          color: `rgba(${r},${g},${b},${a / 255})`,
          ownerMessage,
        };

        setPixels(prevPixels => prevPixels.map(p => 
          (p.x === x && p.y === y) ? updatedPixel : p
        ));
      }
    } catch (error) {
      console.error('Error refreshing pixel:', error);
    }
  }, [publicClient]);

  return { pixels, isLoading, progress, refreshPixel };
}
