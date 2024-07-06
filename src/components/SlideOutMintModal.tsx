// src/components/SlideOutMintModal.tsx

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { RgbaColor } from 'react-colorful';
import { base } from 'viem/chains';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useChainId, useSwitchChain, useAccount, useSignMessage, useWriteContract, useBalance, useReadContract } from 'wagmi';
import { ColorPicker } from './ColorPicker';
import { parseEther, formatEther, encodeAbiParameters, keccak256 } from 'viem';
import { CONTRACT_ADDRESS, ABI, publicClient } from '../config/publicClient';

interface SlideOutMintModalProps {
  isOpen: boolean;
  onClose: () => void;
  x: number;
  y: number;
  onMintSuccess: () => void;
}

const PositionInput: React.FC<{ label: string; value: number }> = React.memo(({ label, value }) => (
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

const MessageInput: React.FC<{ value: string; onChange: (value: string) => void }> = React.memo(({ value, onChange }) => (
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
      maxLength={100}
    ></textarea>
  </div>
));

MessageInput.displayName = 'MessageInput';

export const SlideOutMintModal: React.FC<SlideOutMintModalProps> = ({ isOpen, onClose, x, y, onMintSuccess }) => {
  const [color, setColor] = useState<RgbaColor>({ r: 0, g: 0, b: 0, a: 1 });
  const [ownerMessage, setOwnerMessage] = useState<string>('');
  const [showConnectPrompt, setShowConnectPrompt] = useState<boolean>(false);
  const [isMinting, setIsMinting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [modalState, setModalState] = useState(0); // 0: SlideOutMintModal, 1: RainbowModal
  const [escapeCounter, setEscapeCounter] = useState(0);
  const modalRef = useRef<HTMLDivElement>(null);

  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const { isConnected, address } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { data: balance } = useBalance({ address });

  const { data: pixelPriceUSDC } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ABI,
    functionName: 'PIXEL_PRICE_USDC',
  });

  const { data: ethUsdPrice } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ABI,
    functionName: 'getLatestPrice',
  });

  const pixelPriceETH = pixelPriceUSDC && ethUsdPrice
    ? parseEther((Number(pixelPriceUSDC) / Number(ethUsdPrice)).toString())
    : parseEther('0.01'); // fallback price

  const { writeContractAsync } = useWriteContract();

  const isBalanceSufficient = balance && balance.value >= pixelPriceETH;

  useEffect(() => {
    setShowConnectPrompt(!isConnected || chainId !== base.id);
  }, [isConnected, chainId]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setEscapeCounter(prev => prev + 1);
        if (modalState === 1) {
          setModalState(0);
        } else if (modalState === 0) {
          onClose();
        }
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        if (modalState === 1) {
          setModalState(0);
        } else if (modalState === 0) {
          onClose();
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
  }, [onClose, modalState]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!CONTRACT_ADDRESS) {
      setError('Contract address is not defined');
      return;
    }

    if (chainId !== base.id) {
      switchChain({ chainId: base.id });
    } else {
      setIsMinting(true);
      try {
        const message = keccak256(encodeAbiParameters(
          [{ type: 'address' }, { type: 'uint16' }, { type: 'uint16' }],
          [address!, x, y]
        ));
        const signature = await signMessageAsync({ message });

        const result = await writeContractAsync({
          address: CONTRACT_ADDRESS,
          abi: ABI,
          functionName: 'mintPixel',
          args: [
            color.r,
            color.g,
            color.b,
            Math.floor(color.a * 255),
            x,
            y,
            ownerMessage,
            signature,
          ],
          value: pixelPriceETH,
        });

        if (!result) {
          throw new Error('Failed to get transaction hash');
        }

        const receipt = await publicClient.waitForTransactionReceipt({ hash: result });
        if (receipt.status === 'success') {
          onMintSuccess();
          onClose();
        } else {
          throw new Error('Transaction failed');
        }
      } catch (error) {
        console.error('Error minting pixel:', error);
        setError('Failed to mint pixel. Please try again.');
      } finally {
        setIsMinting(false);
      }
    }
  }, [chainId, switchChain, signMessageAsync, writeContractAsync, color, x, y, ownerMessage, pixelPriceETH, onClose, onMintSuccess, address]);

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onClose}></div>
      )}
      <div
        ref={modalRef}
        className={`fixed left-0 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} overflow-y-auto z-50`}
        style={{
          top: 'calc(73px)', // Adjust for header height (73px) and warning div height (44px)
          bottom: '113px', // Adjust for footer height
          maxHeight: 'calc(100vh - 73px - 113px)', // Viewport height minus header, warning div, and footer
        }}
      >
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
                <PositionInput label="X" value={x} />
                <PositionInput label="Y" value={y} />
              </div>
              <ColorPicker color={color} onChange={setColor} />
              <MessageInput value={ownerMessage} onChange={setOwnerMessage} />
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                  disabled={isMinting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  disabled={isMinting || !isBalanceSufficient}
                >
                  {isMinting ? 'Minting...' : chainId !== base.id ? 'Switch to Base' : `Mint (${formatEther(pixelPriceETH)} ETH)`}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
};

SlideOutMintModal.displayName = 'SlideOutMintModal';
