// src/config/publicClient.ts

import { createPublicClient, http } from 'viem';
import { base } from 'viem/chains';

if (!process.env.NEXT_PUBLIC_RPC_URL) {
  throw new Error('NEXT_PUBLIC_RPC_URL environment variable is not set');
}

export const publicClient = createPublicClient({
  chain: base,
  transport: http(process.env.NEXT_PUBLIC_RPC_URL),
});

export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`;

if (!CONTRACT_ADDRESS) {
  throw new Error('NEXT_PUBLIC_CONTRACT_ADDRESS environment variable is not set');
}

export const ABI = [
  {
    name: 'totalMintedPixels',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint256' }],
  },
  {
    name: 'pixels',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ type: 'uint256' }],
    outputs: [
      { name: 'color', type: 'uint32' },
      { name: 'position', type: 'uint32' },
      { name: 'ownerMessage', type: 'string' },
    ],
  },
  {
    name: 'PIXEL_PRICE_USDC',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint256' }],
  },
  {
    name: 'mintPixel',
    type: 'function',
    stateMutability: 'payable',
    inputs: [
      { type: 'uint8', name: 'red' },
      { type: 'uint8', name: 'green' },
      { type: 'uint8', name: 'blue' },
      { type: 'uint8', name: 'alpha' },
      { type: 'uint16', name: 'x' },
      { type: 'uint16', name: 'y' },
      { type: 'string', name: 'ownerMessage' },
      { type: 'bytes', name: 'signature' },
    ],
    outputs: [],
  },
  {
    name: 'getLatestPrice',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'int256' }],
  },
  {
    name: 'updatePixel',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { type: 'uint256', name: 'tokenId' },
      { type: 'uint8', name: 'red' },
      { type: 'uint8', name: 'green' },
      { type: 'uint8', name: 'blue' },
      { type: 'uint8', name: 'alpha' },
      { type: 'string', name: 'ownerMessage' },
    ],
    outputs: [],
  },
  {
    name: 'tokenURI',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ type: 'uint256', name: 'tokenId' }],
    outputs: [{ type: 'string' }],
  },
] as const;