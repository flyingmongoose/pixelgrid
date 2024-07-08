// src/config/rpcConfig.ts

import { http } from 'viem';

const RPC_ENDPOINTS = [
  'https://api.developer.coinbase.com/rpc/v1/base-sepolia/w0bVMmP3P8lmN3q9z65Fmb7shCoFFqkU'
  // 'https://base.rpc.subquery.network/public',
  // 'https://api.developer.coinbase.com/rpc/v1/base/w0bVMmP3P8lmN3q9z65Fmb7shCoFFqkU',
  // 'https://base.blockpi.network/v1/rpc/c29b66a3ecbfe70c69d1156e4409628327b93a3e',
  // 'https://base-mainnet.g.alchemy.com/v2/hfaC4jL6KKyjgFcwKVlebZOhFOsl7qaw',
  // 'https://base-mainnet.unifra.io/v1/246db732f17b41ae9b4094f805437ede',
  // 'https://base-mainnet.core.chainstack.com/adf3a9b944e0f18e197d925feb481123',
  // 'https://base.gateway.tenderly.co/76vH8UZvPtFBkYsBdyOK2s',
  // 'https://go.getblock.io/1844003c56c64616901d4705ff5838d5',
  // 'https://base.api.onfinality.io/rpc?apikey=f7edb63a-427a-4b44-baf1-2c7789a671bf',
  // 'https://lb.nodies.app/v1/5dd38db88273493ebdd92da710ea7767',
  // 'https://lb.drpc.org/ogrpc?network=base&dkey=AhGwKMz-L0pLtnrpmes1yOw1TPeUOLgR76cohkHL9tz4',
  // 'https://base.w3node.com/11e92a0f88dfa9414402d49437438fdf9b6d18c4798d5b54db799f8f257043b9/api',
  // 'https://base-mainnet.g.allthatnode.com/archive/evm/4b56449a543c497585ccd3ba4f51a1ca',
  // 'https://rpc.ankr.com/base/6a517ac78bc88336f5fe1e64221db046748636f38c2b881b9cac7423b879bd6f',
];

export const fallbackTransport = http(RPC_ENDPOINTS[0], {
  timeout: 10000,
  retryCount: 3,
  retryDelay: 1000,
});

export const rpcTransports = RPC_ENDPOINTS.map(endpoint => 
  http(endpoint, {
    timeout: 10000,
    retryCount: 3,
    retryDelay: 1000,
  })
);
