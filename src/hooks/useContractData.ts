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

type PixelData = [bigint, bigint, string];

export function useContractData(): {
  pixels: Pixel[];
  isLoading: boolean;
  progress: number;
  refreshPixel: (x: number, y: number) => Promise<void>;
} {
  var [pixels, setPixels] = useState<Pixel[]>([]);
  var [isLoading, setIsLoading] = useState<boolean>(true);
  var [progress, setProgress] = useState<number>(0);
  var [totalMintedPixels, setTotalMintedPixels] = useState<bigint | null>(null);
  var publicClient = usePublicClient();

  var fetchTotalMintedPixels = useCallback(function(): Promise<void> {
    if (!publicClient) {
      console.error('Public client not available');
      return Promise.resolve();
    }

    return publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: ABI,
      functionName: 'totalMintedPixels',
    }).then(function(result) {
      setTotalMintedPixels(result as bigint);
      //console.log('Total minted pixels:', result.toString());
    }).catch(function(error) {
      console.error('Error fetching total minted pixels:', error);
    });
  }, [publicClient]);

  var loadBatch = useCallback(function(start: number, batchSize: number): Promise<void> {
    if (totalMintedPixels === null || !publicClient) {
      //console.log('Total minted pixels or public client not available');
      return Promise.resolve();
    }

    var totalPixels = Number(totalMintedPixels);
    if (totalPixels === 0) {
      //console.log('No pixels to load');
      setIsLoading(false);
      setProgress(100);
      return Promise.resolve();
    }

    var end = Math.min(start + batchSize, totalPixels);
    var batchIndexes = Array.from({ length: end - start }, function(_, i) { return start + i; });

    //console.log('Loading batch:', start, 'to', end, 'of', totalPixels);

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
      var newPixels = pixelsData
        .map(function(pixelData) {
          if (pixelData.status === 'success' && pixelData.result) {
            var result = pixelData.result as unknown as PixelData;
            var color = result[0];
            var position = result[1];
            var ownerMessage = result[2];
            
            var x = Number(position & BigInt(0xFFFF));
            var y = Number(position >> BigInt(16));
            var r = Number((color >> BigInt(24)) & BigInt(0xFF));
            var g = Number((color >> BigInt(16)) & BigInt(0xFF));
            var b = Number((color >> BigInt(8)) & BigInt(0xFF));
            var a = Number(color & BigInt(0xFF));
            
            return {
              x: x,
              y: y,
              color: 'rgba(' + r + ',' + g + ',' + b + ',' + (a / 255) + ')',
              ownerMessage: ownerMessage,
            };
          }
          return null;
        })
        .filter(function(pixel): pixel is Pixel { return pixel !== null; });

      setPixels(function(prevPixels) { return prevPixels.concat(newPixels); });
      var newProgress = Math.min((end / totalPixels) * 100, 100);
      setProgress(newProgress);
      //console.log('Progress:', newProgress.toFixed(2) + '%');

      if (end < totalPixels) {
        return loadBatch(end, batchSize);
      } else {
        //console.log('All pixels loaded');
        setIsLoading(false);
        return Promise.resolve();
      }
    }).catch(function(error) {
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
      //console.log('Starting to load pixels, total:', totalMintedPixels.toString());
      loadBatch(0, 1000);
    } else {
      //console.log('Waiting for totalMintedPixels and publicClient');
    }
  }, [totalMintedPixels, publicClient, loadBatch]);

  var refreshPixel = useCallback(function(x: number, y: number): Promise<void> {
    if (!publicClient) {
      console.error('Public client is not available');
      return Promise.resolve();
    }

    var tokenId = BigInt(x) * BigInt(65536) + BigInt(y);
    return publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: ABI,
      functionName: 'pixels',
      args: [tokenId],
    }).then(function(data) {
      if (data) {
        var result = data as unknown as PixelData;
        var color = result[0];
        var r = Number((color >> BigInt(24)) & BigInt(0xFF));
        var g = Number((color >> BigInt(16)) & BigInt(0xFF));
        var b = Number((color >> BigInt(8)) & BigInt(0xFF));
        var a = Number(color & BigInt(0xFF));
        var ownerMessage = result[2];

        var updatedPixel: Pixel = {
          x: x,
          y: y,
          color: 'rgba(' + r + ',' + g + ',' + b + ',' + (a / 255) + ')',
          ownerMessage: ownerMessage,
        };

        setPixels(function(prevPixels) {
          return prevPixels.map(function(p) {
            return (p.x === x && p.y === y) ? updatedPixel : p;
          });
        });
        //console.log('Pixel refreshed:', '(' + x + ', ' + y + ')');
      }
    }).catch(function(error) {
      console.error('Error refreshing pixel:', error);
    });
  }, [publicClient]);

  return { 
    pixels: pixels, 
    isLoading: isLoading, 
    progress: isNaN(progress) ? 0 : progress, 
    refreshPixel: refreshPixel 
  };
}
