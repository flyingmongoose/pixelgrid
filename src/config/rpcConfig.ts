// src/config/rpcConfig.ts

import { http, HttpTransport } from 'viem';

if (!process.env.NEXT_PUBLIC_RPC_ENDPOINTS) {
  throw new Error('NEXT_PUBLIC_RPC_ENDPOINTS environment variable is not set');
}

/**
 * Array of RPC endpoints for the Base network.
 * These endpoints are used as fallback options if the primary endpoint fails.
 */
export const RPC_ENDPOINTS: readonly string[] = process.env.NEXT_PUBLIC_RPC_ENDPOINTS.split(',').map(endpoint => endpoint.trim());

/**
 * Configuration for HTTP transport.
 */
const HTTP_CONFIG = {
  timeout: 10000,
  retryCount: 3,
  retryDelay: 1000,
} as const;

/**
 * The fallback transport using the first RPC endpoint.
 * This is used as a primary transport option.
 */
export const fallbackTransport: HttpTransport = http(RPC_ENDPOINTS[0], HTTP_CONFIG);

/**
 * Array of HTTP transports created from all RPC endpoints.
 * These can be used as fallback options if the primary transport fails.
 */
export const rpcTransports: HttpTransport[] = RPC_ENDPOINTS.map(endpoint =>
  http(endpoint, HTTP_CONFIG)
);

/**
 * Returns a random RPC endpoint from the list.
 * This can be used to distribute requests across different endpoints.
 * 
 * @returns A randomly selected RPC endpoint URL.
 */
export function getRandomRpcEndpoint(): string {
  const randomIndex = Math.floor(Math.random() * RPC_ENDPOINTS.length);
  return RPC_ENDPOINTS[randomIndex];
}

/**
 * Creates an HTTP transport with the given endpoint.
 * 
 * @param endpoint - The RPC endpoint URL to use for the transport.
 * @returns An HttpTransport instance configured with the given endpoint.
 */
export function createHttpTransport(endpoint: string): HttpTransport {
  return http(endpoint, HTTP_CONFIG);
}
