// src/components/MintModal.tsx
import React, { useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';

interface MintModalProps {
  onClose: () => void;
  onMint: () => void;
}

export function MintModal({ onClose, onMint }: MintModalProps) {
  const [showMintForm, setShowMintForm] = useState(false);

  const handleMint = () => {
    onMint();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg relative w-96 max-w-full">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <ConnectButton.Custom>
          {({ account, chain, openConnectModal, mounted }) => {
            const ready = mounted;
            const connected = ready && account && chain;

            if (!connected) {
              return (
                <div className="flex flex-col items-center justify-center h-64">
                  <h2 className="text-xl font-bold mb-4 text-center">Connect Wallet Required</h2>
                  <p className="mb-4 text-center">Please connect your wallet to use the Mint feature.</p>
                  <button
                    onClick={openConnectModal}
                    className="px-4 py-2 bg-[#0052FF] text-white rounded hover:bg-[#0039B3] transition-colors font-bold"
                  >
                    Connect Wallet
                  </button>
                </div>
              );
            }

            if (connected && !showMintForm) {
              setShowMintForm(true);
            }

            return showMintForm ? (
              <>
                <h2 className="text-xl font-bold mb-4">Mint Your Pixel</h2>
                {/* Add your mint form fields here */}
                <button
                  onClick={handleMint}
                  className="px-4 py-2 bg-[#0052FF] text-white rounded hover:bg-[#0039B3] transition-colors font-bold"
                >
                  Mint
                </button>
              </>
            ) : null;
          }}
        </ConnectButton.Custom>
      </div>
    </div>
  );
}
