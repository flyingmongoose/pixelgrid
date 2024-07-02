import React, { useState, useEffect, useRef } from 'react';
import { RgbaColorPicker, RgbaColor } from 'react-colorful';
import { base } from 'viem/chains';
import { ConnectButton } from '@rainbow-me/rainbowkit';

interface MintModalProps {
  isConnected: boolean;
  chainId: number | undefined;
  onClose: () => void;
  onMint: () => void;
}

export function MintModal({ isConnected, chainId, onClose, onMint }: MintModalProps) {
  const [x, setX] = useState('');
  const [y, setY] = useState('');
  const [color, setColor] = useState<RgbaColor>({ r: 0, g: 0, b: 0, a: 1 });
  const [ownerMessage, setOwnerMessage] = useState('');
  const modalRef = useRef<HTMLDivElement>(null);
  const [showConnectPrompt, setShowConnectPrompt] = useState(!isConnected || chainId !== base.id);
  const [isRainbowModalOpen, setIsRainbowModalOpen] = useState(false);
  const [connectionConfirmed, setConnectionConfirmed] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isConnected && chainId === base.id) {
      timer = setTimeout(() => {
        setConnectionConfirmed(true);
        setShowConnectPrompt(false);
        setIsRainbowModalOpen(false);
      }, 1000); // Delay to ensure wallet is fully connected
    } else {
      setConnectionConfirmed(false);
      setShowConnectPrompt(true);
    }
    return () => clearTimeout(timer);
  }, [isConnected, chainId]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isRainbowModalOpen) {
        onClose();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node) && !isRainbowModalOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    if (connectionConfirmed) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose, isRainbowModalOpen, connectionConfirmed]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Minting pixel:', { x, y, color, ownerMessage });
    onMint();
    onClose();
  };

  const handleColorInputChange = (e: React.ChangeEvent<HTMLInputElement>, key: keyof RgbaColor) => {
    let value = parseFloat(e.target.value);
    if (key === 'a') {
      value = Math.min(1, Math.max(0, value));
    } else {
      value = Math.min(255, Math.max(0, Math.round(value)));
    }
    setColor({ ...color, [key]: value });
  };

  const colorPreviewStyle = {
    backgroundColor: `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`,
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div ref={modalRef} className="bg-white p-6 rounded-lg max-w-md w-full text-black relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Close"
        >
          <svg aria-hidden="true" fill="none" height="10" viewBox="0 0 10 10" width="10" xmlns="http://www.w3.org/2000/svg">
            <path d="M1.70711 0.292893C1.31658 -0.0976311 0.683417 -0.0976311 0.292893 0.292893C-0.0976311 0.683417 -0.0976311 1.31658 0.292893 1.70711L3.58579 5L0.292893 8.29289C-0.0976311 8.68342 -0.0976311 9.31658 0.292893 9.70711C0.683417 10.0976 1.31658 10.0976 1.70711 9.70711L5 6.41421L8.29289 9.70711C8.68342 10.0976 9.31658 10.0976 9.70711 9.70711C10.0976 9.31658 10.0976 8.68342 9.70711 8.29289L6.41421 5L9.70711 1.70711C10.0976 1.31658 10.0976 0.683417 9.70711 0.292893C9.31658 -0.0976311 8.68342 -0.0976311 8.29289 0.292893L5 3.58579L1.70711 0.292893Z" fill="currentColor"></path>
          </svg>
        </button>
        <h2 className="text-2xl font-bold mb-4 text-center">Mint a Pixel</h2>
        {showConnectPrompt ? (
          <div className="text-center">
            <p className="mb-4 text-black">Please connect your wallet to mint a pixel.</p>
            <div className="flex justify-center">
              <ConnectButton.Custom>
                {({ openConnectModal }) => (
                  <button
                    onClick={() => {
                      setIsRainbowModalOpen(true);
                      openConnectModal();
                    }}
                    className="px-4 py-2 bg-[#0052FF] text-white rounded hover:bg-[#0039B3] transition-colors"
                  >
                    Connect Wallet
                  </button>
                )}
              </ConnectButton.Custom>
            </div>
          </div>
        ) : connectionConfirmed ? (
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
              <div className="w-full mb-4" style={{ height: '200px' }}>
                <RgbaColorPicker 
                  color={color} 
                  onChange={setColor} 
                  style={{ width: '100%', height: '100%' }}
                />
              </div>
              <div className="flex space-x-2">
                <input
                  type="number"
                  value={color.r}
                  onChange={(e) => handleColorInputChange(e, 'r')}
                  className="border p-1 rounded w-1/4"
                  min="0"
                  max="255"
                  placeholder="R"
                />
                <input
                  type="number"
                  value={color.g}
                  onChange={(e) => handleColorInputChange(e, 'g')}
                  className="border p-1 rounded w-1/4"
                  min="0"
                  max="255"
                  placeholder="G"
                />
                <input
                  type="number"
                  value={color.b}
                  onChange={(e) => handleColorInputChange(e, 'b')}
                  className="border p-1 rounded w-1/4"
                  min="0"
                  max="255"
                  placeholder="B"
                />
                <input
                  type="number"
                  value={color.a}
                  onChange={(e) => handleColorInputChange(e, 'a')}
                  className="border p-1 rounded w-1/4"
                  min="0"
                  max="1"
                  step="0.01"
                  placeholder="A"
                />
              </div>
              <div 
                className="w-full h-8 rounded mt-4"
                style={colorPreviewStyle}
              ></div>
            </div>
            <div className="mb-4">
              <label htmlFor="ownerMessage" className="block text-sm font-medium mb-2">
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
            <div className="flex justify-center">
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
        ) : (
          <div className="text-center">
            <p className="mb-4 text-black">Connecting to wallet...</p>
          </div>
        )}
      </div>
    </div>
  );
}
