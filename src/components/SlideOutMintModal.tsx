'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { RgbaColor } from 'react-colorful';
import { base } from 'viem/chains';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useChainId, useSwitchChain, useAccount, useSignMessage, useWriteContract, useBalance, useReadContract, usePublicClient } from 'wagmi';
import { ColorPicker } from './ColorPicker';
import { parseEther, formatEther, encodeAbiParameters, keccak256, formatUnits, toHex, concat, encodePacked } from 'viem';
import { CONTRACT_ADDRESS, ABI } from '../config/publicClient';

interface SlideOutMintModalProps {
  isOpen: boolean;
  onClose: () => void;
  x: number;
  y: number;
  onMintSuccess: (x: number, y: number) => Promise<void>;
  isEditing: boolean;
  currentColor?: RgbaColor;
  currentMessage?: string;
  isOwner: boolean;
  transactionHash?: string;
}

/**
 * PositionInput component for displaying a read-only position input.
 */
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

/**
 * MessageInput component for entering or displaying a message.
 */
const MessageInput: React.FC<{ value: string; onChange: (value: string) => void; readOnly: boolean }> = React.memo(({ value, onChange, readOnly }) => (
  <div>
    <label htmlFor="ownerMessage" className="block text-sm font-medium text-gray-700 mb-1">
      Message
    </label>
    <textarea
      id="ownerMessage"
      placeholder="Your message (optional)"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`border border-gray-300 p-2 rounded-lg w-full ${readOnly ? 'bg-gray-100' : ''}`}
      rows={3}
      maxLength={100}
      readOnly={readOnly}
    ></textarea>
  </div>
));

MessageInput.displayName = 'MessageInput';

/**
 * ColorDisplay component for showing the selected color.
 */
const ColorDisplay: React.FC<{ color: RgbaColor }> = React.memo(({ color }) => (
  <div className="space-y-2">
    <div className="h-8 rounded" style={{ backgroundColor: `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})` }}></div>
    <div className="grid grid-cols-4 gap-2">
      <div className="text-sm">R: {color.r}</div>
      <div className="text-sm">G: {color.g}</div>
      <div className="text-sm">B: {color.b}</div>
      <div className="text-sm">A: {color.a.toFixed(2)}</div>
    </div>
  </div>
));

ColorDisplay.displayName = 'ColorDisplay';

/**
 * SlideOutMintModal component for minting or editing pixels.
 */
export const SlideOutMintModal: React.FC<SlideOutMintModalProps> = ({
  isOpen,
  onClose,
  x,
  y,
  onMintSuccess,
  isEditing,
  currentColor,
  currentMessage,
  isOwner,
  transactionHash
}) => {
  const [color, setColor] = useState<RgbaColor>(currentColor || { r: 0, g: 0, b: 0, a: 1 });
  const [ownerMessage, setOwnerMessage] = useState<string>(currentMessage || '');
  const [showConnectPrompt, setShowConnectPrompt] = useState<boolean>(false);
  const [isMinting, setIsMinting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [modalState, setModalState] = useState<number>(0); // 0: SlideOutMintModal, 1: RainbowModal
  const [escapeCounter, setEscapeCounter] = useState<number>(0);
  const [debugInfo, setDebugInfo] = useState<string>('');
  const [fallbackEthPrice, setFallbackEthPrice] = useState<bigint | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const { isConnected, address } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { data: balance } = useBalance({ address });
  const publicClient = usePublicClient();

  const { data: pixelPriceUSDC, isLoading: isLoadingUSDC, isError: isErrorUSDC } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ABI,
    functionName: 'PIXEL_PRICE_USDC',
  });

  const { data: ethUsdPrice, isLoading: isLoadingETHPrice, isError: isErrorETHPrice } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ABI,
    functionName: 'getLatestPrice',
  });

  useEffect(() => {
    const fetchFallbackPrice = async (): Promise<void> => {
      if (isErrorETHPrice || (ethUsdPrice === null && !isLoadingETHPrice)) {
        try {
          if (publicClient) {
            const latestBlock = await publicClient.getBlock({ blockTag: 'latest' });
            if (latestBlock.timestamp) {
              const timestamp = Number(latestBlock.timestamp);
              const oneDayAgo = timestamp - 24 * 60 * 60;
              const response = await fetch(`https://api.coingecko.com/api/v3/coins/ethereum/market_chart/range?vs_currency=usd&from=${oneDayAgo}&to=${timestamp}`);
              const data = await response.json();
              const latestPrice = data.prices[data.prices.length - 1][1];
              setDebugInfo(prev => `${prev}, Fallback ETH price: ${latestPrice}`);
              setFallbackEthPrice(BigInt(Math.round(latestPrice * 100000000))); // Convert to 8 decimal places
            }
          }
        } catch (error) {
          console.error('Error fetching fallback ETH price:', error);
          setDebugInfo(prev => `${prev}, Fallback ETH price fetch failed`);
        }
      }
    };

    fetchFallbackPrice();
  }, [isErrorETHPrice, ethUsdPrice, isLoadingETHPrice, publicClient]);

  const pixelPriceETH = useMemo((): bigint | null => {
    const usdcPrice = pixelPriceUSDC ? BigInt(pixelPriceUSDC.toString()) : null;
    const ethPrice = ethUsdPrice ? BigInt(ethUsdPrice.toString()) : fallbackEthPrice;
    
    setDebugInfo(`USDC: ${usdcPrice}, ETH/USD: ${ethPrice}`);
    
    if (usdcPrice && ethPrice) {
      if (ethPrice === BigInt(0)) {
        setDebugInfo(prev => `${prev}, ETH price is zero`);
        return null;
      }
      // USDC has 6 decimals, ETH has 18 decimals, price feed has 8 decimals
      const ethAmount = (usdcPrice * BigInt(1e20)) / ethPrice;
      setDebugInfo(prev => `${prev}, Calculated ETH: ${formatUnits(ethAmount, 18)}`);
      return ethAmount;
    }
    return null;
  }, [pixelPriceUSDC, ethUsdPrice, fallbackEthPrice]);

  const { writeContractAsync } = useWriteContract();

  const isBalanceSufficient = balance && pixelPriceETH ? balance.value >= pixelPriceETH : false;

  useEffect(() => {
    setShowConnectPrompt(!isConnected || chainId !== base.id);
  }, [isConnected, chainId]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        setEscapeCounter(prev => prev + 1);
        if (modalState === 1) {
          setModalState(0);
        } else if (modalState === 0) {
          onClose();
        }
      }
    };

    const handleClickOutside = (e: MouseEvent): void => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        if (modalState === 1) {
          setModalState(0);
        } else if (modalState === 0) {
          onClose();
        }
      }
    };

    const observerCallback = (mutations: MutationRecord[]): void => {
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

  const handleSubmit = useCallback(async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setError(null);

    if (!CONTRACT_ADDRESS) {
      setError('Contract address is not defined');
      return;
    }

    if (chainId !== base.id) {
      switchChain({ chainId: base.id });
    } else if (address) {
      setIsMinting(true);
      try {
        if (isEditing) {
          // Update existing pixel
          const tokenId = BigInt((x << 16) | y);
          await writeContractAsync({
            address: CONTRACT_ADDRESS,
            abi: ABI,
            functionName: 'updatePixel',
            args: [
              tokenId,
              color.r,
              color.g,
              color.b,
              Math.floor(color.a * 255),
              ownerMessage,
            ],
          });
        } else {
          // Mint new pixel
          const messageToSign = encodePacked(
            ['address', 'uint16', 'uint16'],
            [address, x, y]
          );
          console.log('Message to sign:', messageToSign);
          
          const messageHash = keccak256(messageToSign);
          console.log('Message hash:', messageHash);
          
          const signature = await signMessageAsync({ message: { raw: messageHash } });
          console.log('Signature:', signature);

          await writeContractAsync({
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
            value: pixelPriceETH || BigInt(0),
          });
        }

        await onMintSuccess(x, y);
        onClose();
      } catch (error) {
        console.error('Error minting/updating pixel:', error);
        setError(`Failed to ${isEditing ? 'update' : 'mint'} pixel: ${(error as Error).message}`);
      } finally {
        setIsMinting(false);
      }
    }
  }, [chainId, switchChain, signMessageAsync, writeContractAsync, color, x, y, ownerMessage, pixelPriceETH, onClose, onMintSuccess, address, isEditing]);

  // Flag to enable/disable debug info
  const showDebugInfo = false;

  const isFetchingPrice = isLoadingUSDC || isLoadingETHPrice;
  const isPriceError = isErrorUSDC || (isErrorETHPrice && fallbackEthPrice === null) || pixelPriceETH === null;

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onClose}></div>
      )}
      <div
        ref={modalRef}
        className={`fixed left-0 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} overflow-y-auto z-[60]`}
        style={{
          top: 'calc(73px)', // Adjust for header height (73px) and warning div height (44px)
          bottom: '0', // Adjust for footer height
          maxHeight: 'calc(100vh - 73px)', // Viewport height minus header, warning div, and footer
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
                <path d="M1.70711 0.292893C1.31658 -0.0976311 0.683417 -0.0976311 0.292893C-0.0976311 0.683417 -0.0976311 1.31658 0.292893 1.70711L3.58579 5L0.292893 8.29289C-0.0976311 8.68342 -0.0976311 9.31658 0.292893 9.70711C0.683417 10.0976 1.31658 10.0976 1.70711 9.70711L5 6.41421L8.29289 9.70711C8.68342 10.0976 9.31658 10.0976 9.70711 9.70711C10.0976 9.31658 10.0976 8.68342 9.70711 8.29289L6.41421 5L9.70711 1.70711C10.0976 1.31658 10.0976 0.683417 9.70711 0.292893C9.31658 -0.0976311 8.68342 -0.0976311 8.29289 0.292893L5 3.58579L1.70711 0.292893Z" fill="#6B7280"/>
              </svg>
            </div>
          </button>
          <h3 className="text-xl font-semibold mb-4">
            {isOwner ? (isEditing ? 'Edit Pixel' : 'Mint a Pixel') : 'View Pixel'}
          </h3>
          {showConnectPrompt ? (
            <div className="text-center">
              <p className="mb-4 text-gray-600">Please connect your wallet to {isEditing ? 'edit' : 'mint'} a pixel.</p>
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
              {isOwner || !isEditing ? (
                <ColorPicker color={color} onChange={setColor} />
              ) : (
                <ColorDisplay color={color} />
              )}
              <MessageInput value={ownerMessage} onChange={setOwnerMessage} readOnly={!isOwner} />
              {transactionHash && (
                <div className="mb-4">
                  <a
                    href={`https://basescan.org/tx/${transactionHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:text-blue-600 underline"
                  >
                    View on Basescan
                  </a>
                </div>
              )}
              {!isEditing && (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Price per pixel:</span>
                    <span className="text-sm font-bold text-green-600">$0.01 USD</span>
                  </div>
                  <div className="flex flex-col mb-0 pb-0">
                    <span className="text-sm font-medium text-gray-700">Estimated ETH price:</span>
                    <div className="text-right">
                      <span className="text-sm font-medium text-gray-700">
                        {isFetchingPrice ? 'Fetching Price...' :
                         isErrorUSDC ? 'Error: Unable to fetch USDC price' :
                         isErrorETHPrice && fallbackEthPrice === null ? 'Error: Unable to fetch ETH price' :
                         pixelPriceETH === null ? 'Error calculating price' :
                         `${formatEther(pixelPriceETH)} ETH`}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-medium text-gray-700">+ Network Fees</span>
                    </div>
                  </div>
                </>
              )}
              {showDebugInfo && debugInfo && <p className="text-xs text-gray-500">Debug: {debugInfo}</p>}
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <div className="flex justify-center space-x-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                  disabled={isMinting}
                >
                  Close
                </button>
                {(isOwner || !isEditing) && (
                  <button
                    type="submit"
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      isFetchingPrice || isPriceError || (!isBalanceSufficient && !isEditing) || isMinting
                        ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                        : 'bg-blue-500 text-white hover:bg-blue-600'
                    }`}
                    disabled={isFetchingPrice || isPriceError || (!isBalanceSufficient && !isEditing) || isMinting}
                  >
                    {isMinting ? `${isEditing ? 'Updating' : 'Minting'}...` :
                     chainId !== base.id ? 'Switch to Base' :
                     isFetchingPrice ? 'Fetching Price...' :
                     isPriceError ? 'Price Error' :
                     isEditing ? 'Update' : 'Mint'}
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
};

SlideOutMintModal.displayName = 'SlideOutMintModal';
