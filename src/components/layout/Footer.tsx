// src/components/layout/Footer.tsx

import React, { useState } from 'react';
import Image from 'next/image';

const CONTRACT_ADDRESS = '0x4821011E135edcaE76fD2Ff857a45ECa9154a378';

/**
 * Footer component for the PixelGrid application.
 * @returns {JSX.Element} The rendered Footer component.
 */
export function Footer(): JSX.Element {
  const [showTooltip, setShowTooltip] = useState<boolean>(false);

  /**
   * Copies the contract address to the clipboard and shows a tooltip.
   */
  const copyToClipboard = (): void => {
    navigator.clipboard.writeText(CONTRACT_ADDRESS).then(() => {
      setShowTooltip(true);
      setTimeout(() => setShowTooltip(false), 2000); // Hide tooltip after 2 seconds
    }).catch(err => {
      console.error('Failed to copy:', err);
    });
  };

  return (
    <footer className="flex-shrink-0 sticky bottom-0 z-50 p-4 border-t bg-white">
      <div className="flex flex-col items-center justify-center">
        <div className="flex items-center mb-2 relative">
          <a
            href={`https://basescan.org/address/${CONTRACT_ADDRESS}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
          >
            {CONTRACT_ADDRESS}
          </a>
          <button
            onClick={copyToClipboard}
            className="ml-2 text-gray-500 hover:text-gray-700 focus:outline-none relative"
            title="Copy to clipboard"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            {showTooltip && (
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 text-xs font-medium text-white bg-gray-900 rounded-lg shadow-sm transition-opacity duration-300">
                Copied!
                <svg className="absolute text-gray-900 h-2 w-full left-0 top-full" x="0px" y="0px" viewBox="0 0 255 255" xmlSpace="preserve"><polygon className="fill-current" points="0,0 127.5,127.5 255,0"/></svg>
              </div>
            )}
          </button>
        </div>
        <p className="text-sm text-gray-600 mb-2">Developed for</p>
        <a
          href="https://base.org/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center space-x-2 text-[#0052FF] hover:text-[#0039B3] transition-colors"
        >
          <Image src="/base-logo.svg" alt="Base Logo" width={24} height={24} />
          <span className="font-semibold">Base Chain</span>
        </a>
      </div>
    </footer>
  );
}
