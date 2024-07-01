import React, { useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { PixelGridLogo } from '@/components/PixelGridLogo';
import { MintModal } from '@/components/MintModal';
import '@/styles/gradientBorders.css';

interface NavbarHeaderProps {
  onMintClick: () => void;
}

export function NavbarHeader({ onMintClick }: NavbarHeaderProps) {
  const [showModal, setShowModal] = useState(false);

  const handleMintClick = (connected: boolean | undefined) => {
    if (connected === true) {
      onMintClick();
    } else {
      setShowModal(true);
    }
  };

  const handleMint = () => {
    // This function will be passed to MintModal
    console.log('Minting...');
    // Implement actual minting logic here
    setShowModal(false);
  };

  return (
    <header className="p-4 border-b flex justify-between items-center navbar-gradient-border">
      <PixelGridLogo />
      <div className="flex-grow flex justify-center">
        <ConnectButton.Custom>
          {({ account, chain, openAccountModal, openChainModal, openConnectModal, authenticationStatus, mounted }) => {
            const ready = mounted && authenticationStatus !== 'loading';
            const connected =
              ready &&
              account &&
              chain &&
              (!authenticationStatus || authenticationStatus === 'authenticated');

            return (
              <div className="flex items-center space-x-4">
                <span className="text-[#000] underline">Non-Functional WIP</span><br />
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handleMintClick(connected);
                  }}
                  className="font-bold text-[#0052FF] hover:underline transition-all text-[1.7rem]"
                >
                  Mint
                </a>
                <br/><span className="text-[#000] underline">Non-Functional WIP</span>
              </div>
            );
          }}
        </ConnectButton.Custom>
      </div>
      <div>
        <ConnectButton.Custom>
          {({ account, chain, openAccountModal, openChainModal, openConnectModal, authenticationStatus, mounted }) => {
            const ready = mounted && authenticationStatus !== 'loading';
            const connected =
              ready &&
              account &&
              chain &&
              (!authenticationStatus || authenticationStatus === 'authenticated');

            if (!connected) {
              return (
                <button onClick={openConnectModal} type="button" className="px-4 py-2 bg-[#0052FF] text-white rounded hover:bg-[#0039B3] transition-colors">
                  Connect Wallet
                </button>
              );
            }

            if (chain.unsupported) {
              return (
                <button onClick={openChainModal} type="button" className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors">
                  Wrong network
                </button>
              );
            }

            return (
              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  onClick={openChainModal}
                  style={{ display: 'flex', alignItems: 'center' }}
                  type="button"
                  className="px-4 py-2 bg-[#0052FF] text-white rounded hover:bg-[#0039B3] transition-colors"
                >
                  {chain.hasIcon && (
                    <div
                      style={{
                        background: chain.iconBackground,
                        width: 12,
                        height: 12,
                        borderRadius: 999,
                        overflow: 'hidden',
                        marginRight: 4,
                      }}
                    >
                      {chain.iconUrl && (
                        <img
                          alt={chain.name ?? 'Chain icon'}
                          src={chain.iconUrl}
                          style={{ width: 12, height: 12 }}
                        />
                      )}
                    </div>
                  )}
                  {chain.name}
                </button>

                <button onClick={openAccountModal} type="button" className="px-4 py-2 bg-[#0052FF] text-white rounded hover:bg-[#0039B3] transition-colors">
                  {account.displayName}
                  {account.displayBalance
                    ? ` (${account.displayBalance})`
                    : ''}
                </button>
              </div>
            );
          }}
        </ConnectButton.Custom>
      </div>
      {showModal && <MintModal onClose={() => setShowModal(false)} onMint={handleMint} />}
    </header>
  );
}
