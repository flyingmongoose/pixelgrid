// src/components/NavbarHeader.tsx

import React, { useState, useCallback } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { PixelGridLogo } from '@/components/PixelGridLogo';
import { MintModal } from '@/components/MintModal';
import { base } from 'viem/chains';
import { useAccount, useChainId, useSwitchChain } from 'wagmi';

export function NavbarHeader() {
  const [showMintModal, setShowMintModal] = useState(false);
  const [isTwitterHovered, setIsTwitterHovered] = useState(false);
  const [isTelegramHovered, setIsTelegramHovered] = useState(false);
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
        <div className="flex items-center space-x-4">
          <a
            href="https://x.com/PixelGridOnBase"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-600 hover:text-blue-400 transition-colors"
            onMouseEnter={() => setIsTwitterHovered(true)}
            onMouseLeave={() => setIsTwitterHovered(false)}
          >
            {isTwitterHovered ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            )}
          </a>
          <a
            href="https://t.me/PixelGridOnBase"
            target="_blank"
            rel="noopener noreferrer"
            className={`text-black hover:text-[#0088cc] transition-colors`}
            onMouseEnter={() => setIsTelegramHovered(true)}
            onMouseLeave={() => setIsTelegramHovered(false)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 512 512" fill={isTelegramHovered ? "#0088cc" : "currentColor"}>
              <path d="m470.4354553 45.4225006-453.6081524 175.8265381c-18.253809 8.1874695-24.4278889 24.5854034-4.4127407 33.4840851l116.3710175 37.1726685 281.3674316-174.789505c15.3625488-10.9733887 31.0910339-8.0470886 17.5573425 4.023468l-241.6571311 219.9348907-7.5913849 93.0762329c7.0313721 14.3716125 19.9055786 14.4378967 28.1172485 7.2952881l66.8582916-63.5891418 114.5050659 86.1867065c26.5942688 15.8265076 41.0652466 5.6130371 46.7870789-23.3935242l75.1055603-357.4697647c7.7979126-35.7059288-5.5005798-51.437891-39.3996277-37.7579422z"/>
            </svg>
          </a>
          <ConnectButton />
        </div>
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
