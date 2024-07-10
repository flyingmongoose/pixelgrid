// src/config/publicClient.ts

import { createPublicClient, http, PublicClient, Address, Abi, Chain, Transport, Client, ClientConfig } from 'viem';
import { base } from 'viem/chains';

// Validate environment variables
if (!process.env.NEXT_PUBLIC_RPC_URL) {
  throw new Error('NEXT_PUBLIC_RPC_URL environment variable is not set');
}

if (!process.env.NEXT_PUBLIC_CONTRACT_ADDRESS) {
  throw new Error('NEXT_PUBLIC_CONTRACT_ADDRESS environment variable is not set');
}

/**
 * The public client instance for interacting with the blockchain.
 */
export const publicClient: PublicClient = createPublicClient({
  chain: base,
  transport: http(process.env.NEXT_PUBLIC_RPC_URL),
}) as PublicClient;

/**
 * The address of the smart contract.
 */
export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as Address;

/**
 * The ABI (Application Binary Interface) of the smart contract.
 */
export const ABI: Abi = [
  {
    inputs: [],
    name: "totalMintedPixels",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    name: "pixels",
    outputs: [
      { internalType: "uint32", name: "color", type: "uint32" },
      { internalType: "uint32", name: "position", type: "uint32" },
      { internalType: "string", name: "ownerMessage", type: "string" }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ internalType: "uint256", name: "index", type: "uint256" }],
    name: "tokenByIndex",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      { internalType: "uint8", name: "red", type: "uint8" },
      { internalType: "uint8", name: "green", type: "uint8" },
      { internalType: "uint8", name: "blue", type: "uint8" },
      { internalType: "uint8", name: "alpha", type: "uint8" },
      { internalType: "uint16", name: "x", type: "uint16" },
      { internalType: "uint16", name: "y", type: "uint16" },
      { internalType: "string", name: "ownerMessage", type: "string" },
      { internalType: "bytes", name: "signature", type: "bytes" }
    ],
    name: "mintPixel",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [],
    name: "PIXEL_PRICE_USDC",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "getLatestPrice",
    outputs: [{ internalType: "int256", name: "", type: "int256" }],
    stateMutability: "view",
    type: "function"
  }
];

/**
 * Fetches the transaction hash for a given pixel token ID.
 * @param tokenId - The token ID of the pixel
 * @returns A promise that resolves to the transaction hash if found, or undefined if not found
 */
export async function getTransactionHashForPixel(tokenId: bigint): Promise<string | undefined> {
  try {
    const events = await publicClient.getContractEvents({
      address: CONTRACT_ADDRESS,
      abi: ABI,
      eventName: 'PixelMinted',
      args: {
        tokenId: tokenId
      },
      fromBlock: 0n,
      toBlock: 'latest'
    });

    if (events.length > 0) {
      return events[0].transactionHash;
    }
  } catch (error) {
    console.error('Error fetching transaction hash for pixel:', error);
  }
  return undefined;
}
