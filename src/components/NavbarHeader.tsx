// src/components/NavbarHeader.tsx

import React, { useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { PixelGridLogo } from '@/components/PixelGridLogo';
import { PixelGridIcon } from '@/components/PixelGridIcon';
import Link from 'next/link';

export function NavbarHeader() {
  const [isPixelGridHovered, setIsPixelGridHovered] = useState(false);
  const [isWhitepaperHovered, setIsWhitepaperHovered] = useState(false);
  const [isDevfolioHovered, setIsDevfolioHovered] = useState(false);
  const [isTwitterHovered, setIsTwitterHovered] = useState(false);
  const [isTelegramHovered, setIsTelegramHovered] = useState(false);
  const [isGithubHovered, setIsGithubHovered] = useState(false);

  return (
    <>
      <header className="flex-shrink-0 sticky top-0 z-50 p-4 border-b flex justify-between items-center bg-white">
        <PixelGridLogo />
        <div className="flex items-center space-x-4">
          <Link
            href="/fhd"
            className="text-black hover:text-[#0052FF] transition-colors"
            onMouseEnter={() => setIsPixelGridHovered(true)}
            onMouseLeave={() => setIsPixelGridHovered(false)}
          >
            <PixelGridIcon
              size={24}
              gridSize={4}
              borderWidth={1}
              isHovered={isPixelGridHovered}
            />
          </Link>
          <Link
            href="/whitepaper"
            className={`text-black hover:text-[#0052FF] transition-colors`}
            onMouseEnter={() => setIsWhitepaperHovered(true)}
            onMouseLeave={() => setIsWhitepaperHovered(false)}
          >
            <span
              className={`text-2xl filter ${isWhitepaperHovered ? 'brightness-75' : 'brightness-90'}`}
              role="img"
              aria-label="Whitepaper"
              style={{ display: 'inline-block' }}
            >
              {isWhitepaperHovered ? '📄' : '📃'}
            </span>
          </Link>
          <a
            href="https://devfolio.co/projects/pixelgrid-1c75"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#3770FF] hover:text-[#273339] transition-colors"
            onMouseEnter={() => setIsDevfolioHovered(true)}
            onMouseLeave={() => setIsDevfolioHovered(false)}
          >
            <svg 
              viewBox="0 0 118 129" 
              xmlns="http://www.w3.org/2000/svg" 
              height="24" 
              className={`transition-transform duration-300 ${isDevfolioHovered ? 'scale-110' : 'scale-100'}`}
            >
              <g fill="currentColor">
                <path d="m118 70.7c.26 29.53-21.71 54.87-50.95 58.2a16.34 16.34 0 0 1 -1.86.1c-5.82 0-37.28 0-48.9-.47a12.9 12.9 0 0 1 -10.36-7.81 15.81 15.81 0 0 0 5.5 1.32c4 .36 11.06 0 20.69 0 10.25 0 21.33.09 26.64.14a46.78 46.78 0 0 0 8.46-.65 60.65 60.65 0 0 0 34.78-19.3 63.6 63.6 0 0 0 16-35.07z"></path>
                <path d="m113.34 58a58 58 0 0 1 -52.34 58h-49a14 14 0 0 1 -12-14v-88c0-7 5-14 12-14h50a57 57 0 0 1 51.34 58z"></path>
              </g>
            </svg>
          </a>
          <a
            href="https://x.com/PixelGridOnBase"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-600 hover:text-blue-400 transition-colors"
            onMouseEnter={() => setIsTwitterHovered(true)}
            onMouseLeave={() => setIsTwitterHovered(false)}
          >
            {isTwitterHovered ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            )}
          </a>
          <a
            href="https://t.me/PixelGridOnBase"
            target="_blank"
            rel="noopener noreferrer"
            className={`text-black hover:text-[#0088cc] transition-colors`}
            onMouseEnter={() => setIsTelegramHovered(true)}
            onMouseLeave={() => setIsTelegramHovered(false)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 512 512" fill={isTelegramHovered ? "#0088cc" : "currentColor"}>
              <path d="m470.4354553 45.4225006-453.6081524 175.8265381c-18.253809 8.1874695-24.4278889 24.5854034-4.4127407 33.4840851l116.3710175 37.1726685 281.3674316-174.789505c15.3625488-10.9733887 31.0910339-8.0470886 17.5573425 4.023468l-241.6571311 219.9348907-7.5913849 93.0762329c7.0313721 14.3716125 19.9055786 14.4378967 28.1172485 7.2952881l66.8582916-63.5891418 114.5050659 86.1867065c26.5942688 15.8265076 41.0652466 5.6130371 46.7870789-23.3935242l75.1055603-357.4697647c7.7979126-35.7059288-5.5005798-51.437891-39.3996277-37.7579422z"/>
            </svg>
          </a>
          <a
            href="https://github.com/flyingmongoose/pixelgrid"
            target="_blank"
            rel="noopener noreferrer"
            className="text-black hover:text-[#0052FF] transition-colors"
            onMouseEnter={() => setIsGithubHovered(true)}
            onMouseLeave={() => setIsGithubHovered(false)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
          </a>
          <ConnectButton />
        </div>
      </header>
    </>
  );
}
