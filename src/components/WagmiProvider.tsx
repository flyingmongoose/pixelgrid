// src/components/WagmiProvider.tsx

'use client'

import React from 'react';
import { WagmiProvider as WagmiProviderOriginal } from 'wagmi';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { config } from '../config/wagmi';

interface WagmiProviderProps {
  children: React.ReactNode;
}

/**
 * WagmiProvider component that wraps the application with WagmiProvider and RainbowKitProvider.
 * 
 * @param {WagmiProviderProps} props - The props for the WagmiProvider component.
 * @returns {JSX.Element} The wrapped children components.
 */
export default function WagmiProvider({ children }: WagmiProviderProps): JSX.Element {
  return (
    <WagmiProviderOriginal config={config}>
      <RainbowKitProvider>
        {children}
      </RainbowKitProvider>
    </WagmiProviderOriginal>
  );
}
