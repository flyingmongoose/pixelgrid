import React from 'react';
import Image from 'next/image';

export function Footer() {
  return (
    <footer className="p-4 border-t">
      <div className="flex flex-col items-center justify-center">
        <p className='text-sm text-gray-600 mb-2'>0x4821011E135edcaE76fD2Ff857a45ECa9154a378</p>
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
