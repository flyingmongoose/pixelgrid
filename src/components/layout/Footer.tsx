// src/components/layout/Footer.tsx

import React, { useState } from 'react';
import Image from 'next/image';

const CONTRACT_ADDRESS = '0x4821011E135edcaE76fD2Ff857a45ECa9154a378';
const GITHUB_REPO_URL = 'https://github.com/flyingmongoose/pixelgrid';

export function Footer(): JSX.Element {
  const [showTooltip, setShowTooltip] = useState<boolean>(false);

  const copyToClipboard = (): void => {
    navigator.clipboard.writeText(CONTRACT_ADDRESS).then(() => {
      setShowTooltip(true);
      setTimeout(() => setShowTooltip(false), 2000);
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
        <div className="flex items-center space-x-4">
          <p className="text-sm text-gray-600">Developed for</p>
          <a
            href="https://base.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 text-[#0052FF] hover:text-[#0039B3] transition-colors"
          >
            <Image src="/base-logo.svg" alt="Base Logo" width={24} height={24} />
            <span className="font-semibold">Base Chain</span>
          </a>
          <a
            href={GITHUB_REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 text-gray-700 hover:text-[#0052FF] transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            <span className="font-semibold">View on GitHub</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
