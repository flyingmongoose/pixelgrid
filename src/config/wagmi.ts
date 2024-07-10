// src/config/wagmi.ts

import { createConfig, fallback, http, Config } from 'wagmi';
import { base } from 'wagmi/chains';
import { RPC_ENDPOINTS } from './rpcConfig';

/**
 * Configuration for the Wagmi client.
 * This setup includes the Base chain and uses the primary RPC endpoint.
 */
export const config: Config = createConfig({
  chains: [base],
  transports: {
    [base.id]: http(RPC_ENDPOINTS[0]),
  },
});

/**
 * Alternative configuration using multiple RPC endpoints.
 * This uses a fallback mechanism to try multiple endpoints if one fails.
 */
export const configWithMultipleRPCs: Config = createConfig({
  chains: [base],
  transports: {
    [base.id]: fallback(
      RPC_ENDPOINTS.map(endpoint => http(endpoint))
    ),
  },
});

/**
 * Returns the current Wagmi configuration.
 * This function can be used to dynamically select between different configurations.
 * 
 * @returns The current Wagmi configuration.
 */
export function getWagmiConfig(): Config {
  // You can add logic here to determine which config to use
  return config;
}
