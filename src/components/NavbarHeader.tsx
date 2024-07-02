// src/components/NavbarHeader.tsx

import React, { useState, useCallback } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { PixelGridLogo } from '@/components/PixelGridLogo';
import { MintModal } from '@/components/MintModal';
import { base } from 'viem/chains';
import { useAccount, useChainId, useSwitchChain } from 'wagmi';

export function NavbarHeader() {
  const [showMintModal, setShowMintModal] = useState(false);
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  const handleMintClick = useCallback(() => {
    if (!isConnected) {
      setShowMintModal(true);
    } else if (chainId !== base.id) {
      switchChain({ chainId: base.id });
    } else {
      setShowMintModal(true);
    }
  }, [isConnected, chainId, switchChain]);

  const handleCloseMintModal = useCallback(() => {
    setShowMintModal(false);
  }, []);

  const handleMint = () => {
    // Implement actual minting logic here
    console.log('Minting...');
    setShowMintModal(false);
  };

  return (
    <>
      <div className="flex-shrink-0 bg-red-600 text-white text-center py-2 font-bold text-lg">
        <p>
          ⚠️ <span className="underline">Non-Functional Work In Progress</span> ⚠️
        </p>
      </div>
      <header className="flex-shrink-0 sticky top-0 z-50 p-4 border-b flex justify-between items-center bg-white">
        <PixelGridLogo />
        <div className="flex-grow flex justify-center">
          <button
            onClick={handleMintClick}
            className="font-bold text-[#0052FF] hover:underline transition-all text-[1.7rem] bg-transparent border-none cursor-pointer"
          >
            Mint Pixel
          </button>
        </div>
        <ConnectButton />
        {showMintModal && (
          <MintModal
            initialX="0"
            initialY="0"
            isConnected={isConnected}
            chainId={chainId}
            onClose={handleCloseMintModal}
            onMint={handleMint}
          />
        )}
      </header>
    </>
  );
}
