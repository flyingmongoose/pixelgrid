import { useState, useEffect } from 'react';
import { useReadContract, useReadContracts } from 'wagmi';
import { parseAbiItem } from 'viem';

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

  return { pixels };
}
