'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PixelAnimation } from '@/components/PixelAnimation';

export default function Home() {
  const [isAnimating, setIsAnimating] = useState(false);
  const router = useRouter();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsAnimating(true);
  };

  const handleAnimationComplete = () => {
    router.push('/fhd');
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white relative overflow-hidden">
      <a href="/fhd" onClick={handleClick}>
        <h1 className="text-[20rem] font-bold relative z-10 chiseled-text" data-text="PixelGrid">
          PixelGrid
        </h1>
      </a>
      <PixelAnimation isAnimating={isAnimating} onAnimationComplete={handleAnimationComplete} />
    </main>
  );
}
