import React, { useState, useCallback } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { PixelGridLogo } from '@/components/PixelGridLogo';
import { MintModal } from '@/components/MintModal';
import { base } from 'viem/chains';
import { useAccount, useChainId } from 'wagmi';

export function NavbarHeader() {
  const [showMintModal, setShowMintModal] = useState(false);
  const { isConnected } = useAccount();
  const chainId = useChainId();

  const handleMintClick = useCallback(() => {
    setShowMintModal(true);
  }, []);

  const handleCloseMintModal = useCallback(() => {
    setShowMintModal(false);
  }, []);

  const handleMint = () => {
    // Implement actual minting logic here
    console.log('Minting...');
    setShowMintModal(false);
  };

  return (
    <header className="p-4 border-b flex justify-between items-center">
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
          isConnected={isConnected}
          chainId={chainId}
          onClose={handleCloseMintModal}
          onMint={handleMint}
        />
      )}
    </header>
  );
}
