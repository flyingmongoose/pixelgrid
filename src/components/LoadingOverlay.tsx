import React, { useState, useEffect } from 'react';
import { VT323 } from 'next/font/google'
import { COLORS, LOADING_BOX_SIZE, LOADING_PIXEL_SIZE, LOADING_TOTAL_PIXELS } from '@/constants/styles';

const vt323 = VT323({ 
  weight: '400',
  subsets: ['latin'],
})

export function LoadingOverlay() {
  const [pixels, setPixels] = useState<string[]>(Array(LOADING_TOTAL_PIXELS).fill(''));
  const [loadingDots, setLoadingDots] = useState('');
  const [filledPixels, setFilledPixels] = useState(0);

  useEffect(() => {
    const pixelIntervalId = setInterval(() => {
      if (filledPixels < LOADING_TOTAL_PIXELS) {
        setPixels(prev => {
          const emptyIndices = prev.reduce((acc, pixel, index) => {
            if (pixel === '') acc.push(index);
            return acc;
          }, [] as number[]);

          if (emptyIndices.length > 0) {
            const randomIndex = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
            const newPixels = [...prev];
            newPixels[randomIndex] = COLORS[Math.floor(Math.random() * COLORS.length)];
            return newPixels;
          }
          return prev;
        });

        setFilledPixels(prev => prev + 1);
      }
    }, 50);

    const textIntervalId = setInterval(() => {
      setLoadingDots(prev => {
        switch (prev) {
          case '':
            return '.';
          case '.':
            return '..';
          case '..':
            return '...';
          case '...':
            return '';
          default:
            return '';
        }
      });
    }, 50);

    return () => {
      clearInterval(pixelIntervalId);
      clearInterval(textIntervalId);
    };
  }, [filledPixels]);

  return (
    <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
      <div className="text-center">
        <div 
          className="w-[100px] h-[100px] border-2 border-black mb-4 mx-auto grid"
          style={{
            gridTemplateColumns: `repeat(${LOADING_BOX_SIZE / LOADING_PIXEL_SIZE}, 1fr)`,
            gridTemplateRows: `repeat(${LOADING_BOX_SIZE / LOADING_PIXEL_SIZE}, 1fr)`,
          }}
        >
          {pixels.map((color, index) => (
            <div key={index} style={{ backgroundColor: color }} />
          ))}
        </div>
        <div className="flex justify-center">
          <p className={`text-black text-2xl text-left ${vt323.className}`} style={{ width: '100px' }}>
            Loading{loadingDots}
          </p>
        </div>
      </div>
    </div>
  );
}
