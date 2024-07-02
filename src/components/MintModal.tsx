// src/components/MintModal.tsx

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { RgbaColor } from 'react-colorful';
import { base } from 'viem/chains';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useChainId, useSwitchChain, useAccount } from 'wagmi';
import { ColorPicker } from './ColorPicker';

interface MintModalProps {
  isConnected: boolean;
  chainId: number | undefined;
  onClose: () => void;
  onMint: () => void;
  initialX: string;
  initialY: string;
}

const PositionInput = React.memo(({ label, value, onChange, max }: { label: string; value: string; onChange: (value: string) => void; max: string }) => (
  <div className="flex flex-col">
    <label htmlFor={`position-${label.toLowerCase()}`} className="text-sm font-medium text-gray-700 mb-1">
      {label} Position
    </label>
    <input
      id={`position-${label.toLowerCase()}`}
      type="number"
      placeholder={`${label} (0-${max})`}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="border border-gray-300 p-2 rounded-lg w-full"
      min="0"
      max={max}
      required
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

export const MintModal = React.memo(({ isConnected, chainId, onClose, onMint, initialX, initialY }: MintModalProps) => {
  const [x, setX] = useState(initialX);
  const [y, setY] = useState(initialY);
  const [color, setColor] = useState<RgbaColor>({ r: 0, g: 0, b: 0, a: 1 });
  const [ownerMessage, setOwnerMessage] = useState('');
  const modalRef = useRef<HTMLDivElement>(null);
  const [showConnectPrompt, setShowConnectPrompt] = useState(!isConnected || chainId !== base.id);
  const [modalState, setModalState] = useState(0); // 0: MintModal, 1: RainbowModal
  const [escapeCounter, setEscapeCounter] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const { switchChain } = useSwitchChain();
  const { isConnected: wagmiIsConnected } = useAccount();

  const handleClose = useCallback(() => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  }, [onClose]);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    if (wagmiIsConnected && chainId === base.id) {
      setShowConnectPrompt(false);
    } else {
      setShowConnectPrompt(true);
    }
  }, [wagmiIsConnected, chainId]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setEscapeCounter(prev => prev + 1);
        if (modalState === 1) {
          setModalState(0);
        } else if (modalState === 0) {
          handleClose();
        }
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        if (modalState === 1) {
          setModalState(0);
        } else if (modalState === 0) {
          handleClose();
        }
      }
    };

    const observerCallback = (mutations: MutationRecord[]) => {
      for (let mutation of mutations) {
        if (mutation.type === 'childList') {
          const addedNodes = Array.from(mutation.addedNodes);
          const removedNodes = Array.from(mutation.removedNodes);
          if (addedNodes.some(node => (node as Element).classList?.contains('rainbow-kit_modal'))) {
            setModalState(1);
          }
          if (removedNodes.some(node => (node as Element).classList?.contains('rainbow-kit_modal'))) {
            setModalState(0);
          }
        }
      }
    };

    const observer = new MutationObserver(observerCallback);

    observer.observe(document.body, { childList: true, subtree: true });

    document.addEventListener('keydown', handleEscape);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
      observer.disconnect();
    };
  }, [handleClose, modalState]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (chainId !== base.id) {
      switchChain({ chainId: base.id });
    } else {
      console.log('Minting pixel:', { x, y, color, ownerMessage });
      onMint();
      handleClose();
    }
  }, [chainId, switchChain, x, y, color, ownerMessage, onMint, handleClose]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div 
        ref={modalRef} 
        className={`bg-white p-6 rounded-2xl max-w-md w-full text-black relative shadow-xl transform transition-all duration-300 ease-in-out ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        }`}
      >
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-0.5 rounded-full bg-gray-100 hover:bg-gray-200 border border-gray-200 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-gray-300"
          aria-label="Close"
        >
          <div className="p-1.5">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1.70711 0.292893C1.31658 -0.0976311 0.683417 -0.0976311 0.292893 0.292893C-0.0976311 0.683417 -0.0976311 1.31658 0.292893 1.70711L3.58579 5L0.292893 8.29289C-0.0976311 8.68342 -0.0976311 9.31658 0.292893 9.70711C0.683417 10.0976 1.31658 10.0976 1.70711 9.70711L5 6.41421L8.29289 9.70711C8.68342 10.0976 9.31658 10.0976 9.70711 9.70711C10.0976 9.31658 10.0976 8.68342 9.70711 8.29289L6.41421 5L9.70711 1.70711C10.0976 1.31658 10.0976 0.683417 9.70711 0.292893C9.31658 -0.0976311 8.68342 -0.0976311 8.29289 0.292893L5 3.58579L1.70711 0.292893Z" fill="#6B7280"/>
            </svg>
          </div>
        </button>
        <h2 className="text-xl font-semibold mb-4 text-center">Mint a Pixel</h2>
        {showConnectPrompt ? (
          <div className="text-center">
            <p className="mb-4 text-gray-600">Please connect your wallet to mint a pixel.</p>
            <div className="flex justify-center">
              <ConnectButton.Custom>
                {({ openConnectModal }) => (
                  <button
                    onClick={() => {
                      setModalState(1);
                      openConnectModal();
                    }}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Connect Wallet
                  </button>
                )}
              </ConnectButton.Custom>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <PositionInput label="X" value={x} onChange={setX} max="1920" />
              <PositionInput label="Y" value={y} onChange={setY} max="1080" />
            </div>
            <ColorPicker color={color} onChange={setColor} />
            <MessageInput value={ownerMessage} onChange={setOwnerMessage} />
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={handleClose}
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
});

MintModal.displayName = 'MintModal';