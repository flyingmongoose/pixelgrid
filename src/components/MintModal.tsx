import React, { useState, useEffect } from 'react';
import { RgbaColorPicker } from 'react-colorful';
import { useAccount, useChainId } from 'wagmi';
import { base } from 'viem/chains';
import { ConnectButton } from '@rainbow-me/rainbowkit';

interface MintModalProps {
  onClose: () => void;
  onMint: () => void;
}

export function MintModal({ onClose, onMint }: MintModalProps) {
  const [x, setX] = useState('');
  const [y, setY] = useState('');
  const [color, setColor] = useState({ r: 0, g: 0, b: 0, a: 1 });
  const [ownerMessage, setOwnerMessage] = useState('');
  const chainId = useChainId();
  const { isConnected } = useAccount();

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected) {
      alert('Please connect your wallet to mint.');
      return;
    }
    if (chainId !== base.id) {
      alert('Please switch to Base mainnet to mint.');
      return;
    }
    console.log('Minting pixel:', { x, y, color, ownerMessage });
    onMint();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-md w-full">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h2 className="text-2xl font-bold mb-4">Mint a Pixel</h2>
        {!isConnected ? (
          <div className="text-center">
            <p className="mb-4">Please connect your wallet to mint a pixel.</p>
            <ConnectButton />
          </div>
        ) : chainId !== base.id ? (
          <div className="text-center">
            <p className="mb-4">Please switch to Base mainnet to mint a pixel.</p>
            <ConnectButton />
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <input
                type="number"
                placeholder="X Position (0-1920)"
                value={x}
                onChange={(e) => setX(e.target.value)}
                className="border p-2 rounded"
                min="0"
                max="1920"
                required
              />
              <input
                type="number"
                placeholder="Y Position (0-1080)"
                value={y}
                onChange={(e) => setY(e.target.value)}
                className="border p-2 rounded"
                min="0"
                max="1080"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Color
              </label>
              <RgbaColorPicker color={color} onChange={setColor} />
            </div>
            <div className="mb-4">
              <label htmlFor="ownerMessage" className="block text-sm font-medium text-gray-700 mb-2">
                Message
              </label>
              <textarea
                id="ownerMessage"
                placeholder="Your message (optional)"
                value={ownerMessage}
                onChange={(e) => setOwnerMessage(e.target.value)}
                className="border p-2 rounded w-full"
                rows={3}
              ></textarea>
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="mr-2 px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#0052FF] text-white rounded hover:bg-[#0039B3] transition-colors"
              >
                Mint
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
