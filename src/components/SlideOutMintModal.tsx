// src/components/SlideOutMintModal.tsx

import React, { useState, useEffect } from 'react';
import { RgbaColor } from 'react-colorful';
import { base } from 'viem/chains';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useChainId, useSwitchChain, useAccount } from 'wagmi';
import { ColorPicker } from './ColorPicker';

interface SlideOutMintModalProps {
  isOpen: boolean;
  onClose: () => void;
  x: number;
  y: number;
}

const PositionInput = React.memo(({ label, value }: { label: string; value: number }) => (
  <div className="flex flex-col">
    <label className="text-sm font-medium text-gray-700 mb-1">
      {label} Position
    </label>
    <input
      type="number"
      value={value}
      readOnly
      className="border border-gray-300 p-2 rounded-lg w-full bg-gray-100"
    />
  </div>
));

PositionInput.displayName = 'PositionInput';

const MessageInput = React.memo(({ value, onChange }: { value: string; onChange: (value: string) => void }) => (
  <div>
    <label htmlFor="ownerMessage" className="block text-sm font-medium text-gray-700 mb-1">
      Message
    </label>
    <textarea
      id="ownerMessage"
      placeholder="Your message (optional)"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="border border-gray-300 p-2 rounded-lg w-full"
      rows={3}
    ></textarea>
  </div>
));

MessageInput.displayName = 'MessageInput';

export const SlideOutMintModal: React.FC<SlideOutMintModalProps> = ({ isOpen, onClose, x, y }) => {
  const [color, setColor] = useState<RgbaColor>({ r: 0, g: 0, b: 0, a: 1 });
  const [ownerMessage, setOwnerMessage] = useState('');
  const [showConnectPrompt, setShowConnectPrompt] = useState(false);

  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const { isConnected } = useAccount();

  useEffect(() => {
    setShowConnectPrompt(!isConnected || chainId !== base.id);
  }, [isConnected, chainId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (chainId !== base.id) {
      switchChain({ chainId: base.id });
    } else {
      console.log('Minting pixel:', { x, y, color, ownerMessage });
      // Implement minting logic here
      onClose();
    }
  };

  return (
    <div className={`fixed inset-y-0 left-0 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} overflow-y-auto z-10`}>
        <div className="p-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-0.5 rounded-full bg-gray-100 hover:bg-gray-200 border border-gray-200 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-gray-300"
          aria-label="Close"
        >
          <div className="p-1.5">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1.70711 0.292893C1.31658 -0.0976311 0.683417 -0.0976311 0.292893 0.292893C-0.0976311 0.683417 -0.0976311 1.31658 0.292893 1.70711L3.58579 5L0.292893 8.29289C-0.0976311 8.68342 -0.0976311 9.31658 0.292893 9.70711C0.683417 10.0976 1.31658 10.0976 1.70711 9.70711L5 6.41421L8.29289 9.70711C8.68342 10.0976 9.31658 10.0976 9.70711 9.70711C10.0976 9.31658 10.0976 8.68342 9.70711 8.29289L6.41421 5L9.70711 1.70711C10.0976 1.31658 10.0976 0.683417 9.70711 0.292893C9.31658 -0.0976311 8.68342 -0.0976311 8.29289 0.292893L5 3.58579L1.70711 0.292893Z" fill="#6B7280"/>
            </svg>
          </div>
        </button>
        <h2 className="text-xl font-semibold mb-4">Mint a Pixel</h2>
        {showConnectPrompt ? (
          <div className="text-center">
            <p className="mb-4 text-gray-600">Please connect your wallet to mint a pixel.</p>
            <div className="flex justify-center">
              <ConnectButton />
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <PositionInput label="X" value={x} />
              <PositionInput label="Y" value={y} />
            </div>
            <ColorPicker color={color} onChange={setColor} />
            <MessageInput value={ownerMessage} onChange={setOwnerMessage} />
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                {chainId !== base.id ? 'Switch to Base' : 'Mint (~$0.01 + Fees)'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

SlideOutMintModal.displayName = 'SlideOutMintModal';
