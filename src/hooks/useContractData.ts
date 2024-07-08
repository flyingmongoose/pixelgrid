// src/hooks/useContractData.ts

import { useState, useEffect, useCallback } from 'react';
import { usePublicClient } from 'wagmi';
import { CONTRACT_ADDRESS, ABI } from '../config/publicClient';

interface Pixel {
  x: number;
  y: number;
  color: string;
  ownerMessage: string;
}

type PixelData = [string, string, string];

export function useContractData(): {
  pixels: Pixel[];
  isLoading: boolean;
  progress: number;
  refreshPixel: (x: number, y: number) => Promise<void>;
} {
  const [pixels, setPixels] = useState<Pixel[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [progress, setProgress] = useState<number>(0);
  const [totalMintedPixels, setTotalMintedPixels] = useState<string | null>(null);
  const publicClient = usePublicClient();

  const fetchTotalMintedPixels = useCallback(function(): Promise<void> {
    if (!publicClient) {
      console.error('Public client not available');
      return Promise.resolve();
    }

    return publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: ABI,
      functionName: 'totalMintedPixels',
    }).then(function(result: unknown) {
      setTotalMintedPixels((result as bigint).toString());
    }).catch(function(error: unknown) {
      console.error('Error fetching total minted pixels:', error);
    });
  }, [publicClient]);

  const loadBatch = useCallback(function(start: number, batchSize: number): Promise<void> {
    if (totalMintedPixels === null || !publicClient) {
      return Promise.resolve();
    }

    const totalPixels = parseInt(totalMintedPixels, 10);
    if (totalPixels === 0) {
      setIsLoading(false);
      setProgress(100);
      return Promise.resolve();
    }

    const end = Math.min(start + batchSize, totalPixels);
    const batchIndexes = Array.from({ length: end - start }, function(_, i) { return start + i; });

    return publicClient.multicall({
      contracts: batchIndexes.map(function(index) {
        return {
          address: CONTRACT_ADDRESS,
          abi: ABI,
          functionName: 'pixels',
          args: [BigInt(index)],
        };
      }),
      allowFailure: true,
    }).then(function(pixelsData) {
      const newPixels = pixelsData
        .map(function(pixelData) {
          if (pixelData.status === 'success' && pixelData.result) {
            const result = pixelData.result as unknown as PixelData;
            const color = parseInt(result[0]);
            const position = parseInt(result[1]);
            const ownerMessage = result[2];
            
            const x = position & 0xFFFF;
            const y = position >> 16;
            const r = color >> 24 & 0xFF;
            const g = color >> 16 & 0xFF;
            const b = color >> 8 & 0xFF;
            const a = color & 0xFF;
            
            return {
              x: x,
              y: y,
              color: `rgba(${r},${g},${b},${a / 255})`,
              ownerMessage: ownerMessage,
            };
          }
          return null;
        })
        .filter(function(pixel): pixel is Pixel { return pixel !== null; });

      setPixels(function(prevPixels) { return prevPixels.concat(newPixels); });
      const newProgress = Math.min((end / totalPixels) * 100, 100);
      setProgress(newProgress);

      if (end < totalPixels) {
        return loadBatch(end, batchSize);
      } else {
        setIsLoading(false);
        return Promise.resolve();
      }
    }).catch(function(error: unknown) {
      console.error('Error loading pixel batch:', error);
      setIsLoading(false);
      return Promise.resolve();
    });
  }, [totalMintedPixels, publicClient]);

  useEffect(function() {
    fetchTotalMintedPixels();
  }, [fetchTotalMintedPixels]);

  useEffect(function() {
    if (totalMintedPixels !== null && publicClient) {
      loadBatch(0, 1000);
    }
  }, [totalMintedPixels, publicClient, loadBatch]);

  const refreshPixel = useCallback(async function(x: number, y: number): Promise<void> {
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
        const result = data as unknown as PixelData;
        const color = parseInt(result[0]);
        const r = color >> 24 & 0xFF;
        const g = color >> 16 & 0xFF;
        const b = color >> 8 & 0xFF;
        const a = color & 0xFF;
        const ownerMessage = result[2];

        const updatedPixel: Pixel = {
          x: x,
          y: y,
          color: `rgba(${r},${g},${b},${a / 255})`,
          ownerMessage: ownerMessage,
        };

        setPixels(function(prevPixels) {
          const pixelIndex = prevPixels.findIndex(p => p.x === x && p.y === y);
          if (pixelIndex !== -1) {
            // Update existing pixel
            const newPixels = [...prevPixels];
            newPixels[pixelIndex] = updatedPixel;
            return newPixels;
          } else {
            // Add new pixel
            return [...prevPixels, updatedPixel];
          }
        });
      }
    } catch (error) {
      console.error('Error refreshing pixel:', error);
    }
  }, [publicClient]);

  return { 
    pixels: pixels, 
    isLoading: isLoading, 
    progress: isNaN(progress) ? 0 : progress, 
    refreshPixel: refreshPixel 
  };
}
