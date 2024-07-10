// src/app/whitepaper/page.tsx

'use client';

import React from 'react';
import { Whitepaper } from '@/components/Whitepaper';
import { NavbarHeader } from '@/components/NavbarHeader';
import { Footer } from '@/components/layout/Footer';

/**
 * WhitepaperPage component that displays the project's whitepaper.
 * @returns {JSX.Element} The rendered WhitepaperPage component.
 */
export default function WhitepaperPage(): JSX.Element {
  return (
    <div className="flex flex-col min-h-screen">
      <NavbarHeader />
      <main className="flex-grow">
        <Whitepaper />
      </main>
      <Footer />
    </div>
  );
}
