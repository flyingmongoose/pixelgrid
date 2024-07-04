'use client'

import { WagmiProvider as WagmiProviderOriginal } from 'wagmi'
import { RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { config } from '../config/wagmi'

export default function WagmiProvider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProviderOriginal config={config}>
      <RainbowKitProvider>{children}</RainbowKitProvider>
    </WagmiProviderOriginal>
  )
}
