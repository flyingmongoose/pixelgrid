'use client';

import React, { useState, useEffect, useRef } from 'react';
import { WagmiProvider, createConfig } from 'wagmi';
import { base } from 'viem/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { getDefaultConfig, RainbowKitProvider, ConnectButton } from '@rainbow-me/rainbowkit';
import { useChainId, useSwitchChain } from 'wagmi';
import { NavbarHeader } from '@/components/NavbarHeader';
import { Footer } from '@/components/layout/Footer';
import { LoadingOverlay } from '@/components/LoadingOverlay';
import { PixelAnimation } from '@/components/PixelAnimation';
import { PixelGrid } from '@/components/PixelGrid/PixelGrid';

const config = getDefaultConfig({
  appName: 'PixelGrid',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '',
  chains: [base],
  ssr: true,
});

const queryClient = new QueryClient();

function FHDPageContent() {
  const [isLoading, setIsLoading] = useState(true);
  const [fadeIn, setFadeIn] = useState(false);
  const [initialScale, setInitialScale] = useState(1);
  const [isWalletButtonReady, setIsWalletButtonReady] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        const containerHeight = containerRef.current.clientHeight;
        const scaleX = containerWidth / 1920;
        const scaleY = containerHeight / 1080;
        setInitialScale(Math.min(scaleX, scaleY));
      }
    };

    updateScale();
    window.addEventListener('resize', updateScale);

    return () => {
      window.removeEventListener('resize', updateScale);
    };
  }, []);

  useEffect(() => {
    if (isWalletButtonReady) {
      setIsLoading(false);
      setFadeIn(true);
    }
  }, [isWalletButtonReady]);

  if (chainId !== base.id) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
        <div className="text-center">
          <p className="text-2xl mb-4">Please connect to the Base network</p>
          <button 
            onClick={() => switchChain({ chainId: base.id })}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Switch to Base
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="fixed top-4 right-4 z-50">
        <ConnectButton.Custom>
          {({ account, chain, openAccountModal, openChainModal, openConnectModal, authenticationStatus, mounted }) => {
            const ready = mounted && authenticationStatus !== 'loading';
            if (ready && !isWalletButtonReady) {
              setIsWalletButtonReady(true);
            }
            return (
              <div
                {...(!ready && {
                  'aria-hidden': true,
                  'style': {
                    opacity: 0,
                    pointerEvents: 'none',
                    userSelect: 'none',
                  },
                })}
              >
                {(() => {
                  if (!mounted || !ready) {
                    return null;
                  }
                  if (account && chain) {
                    return (
                      <button onClick={openAccountModal} type="button">
                        {account.displayName}
                      </button>
                    );
                  }
                  return (
                    <button onClick={openConnectModal} type="button">
                      Connect Wallet
                    </button>
                  );
                })()}
              </div>
            );
          }}
        </ConnectButton.Custom>
      </div>
      {isLoading ? (
        <LoadingOverlay percentage={50} />
      ) : (
        <div className={`flex flex-col min-h-screen bg-white transition-opacity duration-1000 ${fadeIn ? 'opacity-100' : 'opacity-0'}`}>
          {/* Warning Message */}
          <div className="bg-red-100 border-b-4 border-red-500 text-red-700 px-4 py-3 shadow-md" role="alert">
            <div className="flex justify-center items-center">
              <span className="text-3xl mr-2">⚠️</span>
              <p className="font-bold text-2xl underline" style={{ fontFamily: 'VT323, monospace' }}>
                Non-Functional Work In Progress
              </p>
              <span className="text-3xl ml-2">⚠️</span>
            </div>
          </div>
          
          <NavbarHeader />
          <main className="flex-grow relative" ref={containerRef}>
            <div className="absolute inset-0 overflow-hidden">
              <PixelGrid />
            </div>
          </main>
          <Footer />
        </div>
      )}
    </>
  );
}

export default function FHDPage() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <FHDPageContent />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
