'use client';

import { useState, useEffect } from 'react';
import { ConnectWallet, Wallet, WalletDropdown, WalletDropdownLink, WalletDropdownDisconnect } from '@coinbase/onchainkit/wallet';
import { OnchainKitProvider } from '@coinbase/onchainkit';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { baseSepolia } from 'viem/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Identity, Avatar, Name, Address, EthBalance } from '@coinbase/onchainkit/identity';
import { getDefaultConfig, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { ConnectButton } from '@rainbow-me/rainbowkit';

const config = getDefaultConfig({
  appName: 'PixelGrid',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '',
  chains: [baseSepolia],
  ssr: true,
});

const queryClient = new QueryClient();

export default function FHDPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <OnchainKitProvider apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY || ''} chain={baseSepolia}>
            <div className="min-h-screen bg-white">
              <header className="p-4 border-b flex justify-between items-center">
                <h1 className="text-2xl font-bold">FHD Page</h1>
                <div className="flex space-x-4">
                  {mounted && (
                    <Wallet>
                      <ConnectWallet>
                        <Avatar className="h-6 w-6" />
                        <Name />
                      </ConnectWallet>
                      <WalletDropdown>
                        <Identity className="px-4 pt-3 pb-2" hasCopyAddressOnClick>
                          <Avatar />
                          <Name />
                          <Address />
                          <EthBalance />
                        </Identity>
                        <WalletDropdownLink icon="wallet" href="https://wallet.coinbase.com">
                          Go to Wallet Dashboard
                        </WalletDropdownLink>
                        <WalletDropdownDisconnect />
                      </WalletDropdown>
                    </Wallet>
                  )}
                  <ConnectButton />
                </div>
              </header>
              <main className="p-4">
                <h2 className="text-xl mb-4">Welcome to the FHD Page</h2>
                <p>This page demonstrates the use of OnchainKit and RainbowKit for wallet connection.</p>
              </main>
            </div>
          </OnchainKitProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
