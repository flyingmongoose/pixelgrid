// src/hooks/useContractData.ts

import { useState, useEffect, useCallback } from 'react';
import { usePublicClient } from 'wagmi';
import { CONTRACT_ADDRESS, ABI } from '../config/publicClient';

export interface Pixel {
  x: number;
  y: number;
  color: string;
  ownerMessage: string;
  owner: string;
  transactionHash?: `0x${string}`;
}

type PixelData = readonly [bigint, bigint, string] | readonly [bigint, bigint, string, string];

export function useContractData(): {
  pixels: Pixel[];
  isLoading: boolean;
  progress: number;
  refreshPixel: (x: number, y: number) => Promise<void>;
} {
  const [pixels, setPixels] = useState<Pixel[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [progress, setProgress] = useState<number>(0);
  const [totalMintedPixels, setTotalMintedPixels] = useState<bigint | null>(null);
  const publicClient = usePublicClient();

  const fetchTotalMintedPixels = useCallback(async (): Promise<void> => {
    if (!publicClient) {
      console.error('Public client not available');
      return;
    }
    try {
      const result = await publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: ABI,
        functionName: 'totalMintedPixels',
      });
      if (typeof result === 'bigint') {
        const total = result;
        console.log('Total minted pixels:', total.toString());
        setTotalMintedPixels(total);
      } else {
        console.error('Unexpected result type for totalMintedPixels:', result);
      }
    } catch (error) {
      console.error('Error fetching total minted pixels:', error);
    }
  }, [publicClient]);

const fetchPixelByIndex = useCallback(async (index: bigint): Promise<Pixel | null> => {
  if (!publicClient) return null;

  try {
    console.log(`Fetching token ID for index ${index}`);
    const tokenId = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: ABI,
      functionName: 'tokenByIndex',
      args: [index],
    });
    console.log(`Token ID for index ${index}: ${tokenId}`);

    console.log(`Fetching pixel data for token ID ${tokenId}`);
    const pixelData = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: ABI,
      functionName: 'pixels',
      args: [tokenId],
    }) as unknown as PixelData;

    console.log(`Pixel data for token ID ${tokenId}:`, pixelData);

    if (Array.isArray(pixelData) && (pixelData.length === 3 || pixelData.length === 4)) {
      const [color, position, ownerMessage, owner = ''] = pixelData;
      const colorBigInt = BigInt(color);
      const positionBigInt = BigInt(position);

      const y = Number(positionBigInt & 0xFFFFn);
      const x = Number((positionBigInt >> 16n) & 0xFFFFn);

      const r = Number((colorBigInt >> 24n) & 0xFFn);
      const g = Number((colorBigInt >> 16n) & 0xFFn);
      const b = Number((colorBigInt >> 8n) & 0xFFn);
      const a = Number(colorBigInt & 0xFFn);

      return {
        x,
        y,
        color: `rgba(${r},${g},${b},${a / 255})`,
        ownerMessage: ownerMessage || "",
        owner,
      };
    } else {
      console.error(`Invalid pixel data format for token ID ${tokenId}:`, pixelData);
    }
  } catch (error) {
    console.error(`Error fetching pixel at index ${index}:`, error);
  }
  return null;
}, [publicClient]);


  const loadBatch = useCallback(async (start: bigint, batchSize: bigint): Promise<void> => {
    if (totalMintedPixels === null || !publicClient) {
      return;
    }

    if (totalMintedPixels === 0n) {
      setIsLoading(false);
      setProgress(100);
      return;
    }

    const end = start + batchSize > totalMintedPixels ? totalMintedPixels : start + batchSize;
    const batchIndexes = Array.from({ length: Number(end - start) }, (_, i) => start + BigInt(i));

    try {
      const newPixels = await Promise.all(batchIndexes.map(fetchPixelByIndex));
      const validPixels = newPixels.filter((pixel): pixel is Pixel => pixel !== null);

      console.log(`Processed ${validPixels.length} pixels out of ${batchIndexes.length} queried`);
      console.log('Valid pixels:', validPixels);

      setPixels((prevPixels) => [...prevPixels, ...validPixels]);
      const newProgress = Math.min(Number((end * 100n) / totalMintedPixels), 100);
      setProgress(newProgress);

      if (end < totalMintedPixels) {
        await loadBatch(end, batchSize);
      } else {
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error loading pixel batch:', error);
      setIsLoading(false);
    }
  }, [totalMintedPixels, publicClient, fetchPixelByIndex]);

  useEffect(() => {
    fetchTotalMintedPixels();
  }, [fetchTotalMintedPixels]);

  useEffect(() => {
    if (totalMintedPixels !== null && publicClient) {
      loadBatch(0n, 1000n);
    }
  }, [totalMintedPixels, publicClient, loadBatch]);

  const refreshPixel = useCallback(async (x: number, y: number): Promise<void> => {
    if (!publicClient) {
      console.error('Public client is not available');
      return;
    }

    const tokenId = BigInt((x << 16) | y);
    try {
      const data = await publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: ABI,
        functionName: 'pixels',
        args: [tokenId],
      }) as unknown as PixelData;

      if (Array.isArray(data) && (data.length === 3 || data.length === 4)) {
        const [color, position, ownerMessage, owner = ''] = data;
        const colorBigInt = BigInt(color);
        const r = Number((colorBigInt >> 24n) & 0xFFn);
        const g = Number((colorBigInt >> 16n) & 0xFFn);
        const b = Number((colorBigInt >> 8n) & 0xFFn);
        const a = Number(colorBigInt & 0xFFn);

        // Fetch transaction hash for the pixel
        const events = await publicClient.getContractEvents({
          address: CONTRACT_ADDRESS,
          abi: ABI,
          eventName: 'PixelMinted',
          args: {
            tokenId: tokenId,
          },
          fromBlock: 0n,
          toBlock: 'latest',
        });

        let transactionHash = undefined;
        if (events.length > 0) {
          transactionHash = events[0].transactionHash;
        }

        const updatedPixel: Pixel = {
          x,
          y,
          color: `rgba(${r},${g},${b},${a / 255})`,
          ownerMessage: ownerMessage || "",
          owner,
          transactionHash,
        };

        setPixels((prevPixels) => prevPixels.map((p) => (p.x === x && p.y === y) ? updatedPixel : p));
      }
    } catch (error) {
      console.error('Error refreshing pixel:', error);
    }
  }, [publicClient]);

  return {
    pixels,
    isLoading,
    progress: isNaN(progress) ? 0 : progress,
    refreshPixel
  };
}
