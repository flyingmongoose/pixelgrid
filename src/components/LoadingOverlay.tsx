import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { VT323 } from 'next/font/google'
import { COLORS, LOADING_BOX_SIZE, LOADING_PIXEL_SIZE, LOADING_TOTAL_PIXELS } from '@/constants/styles';

const vt323 = VT323({ 
  weight: '400',
  subsets: ['latin'],
})

export function LoadingOverlay() {
  const [filledPixels, setFilledPixels] = useState(0);
  const [loadingDots, setLoadingDots] = useState('');
  const [pixels, setPixels] = useState<string[]>(Array(LOADING_TOTAL_PIXELS).fill(''));

  // Memoize the pixel generation function
  const generatePixel = useCallback(() => {
    const emptyIndices = pixels.reduce((acc, pixel, index) => {
      if (pixel === '') acc.push(index);
      return acc;
    }, [] as number[]);

    if (emptyIndices.length > 0) {
      const randomIndex = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
      const newColor = COLORS[Math.floor(Math.random() * COLORS.length)];
      return { index: randomIndex, color: newColor };
    }
    return null;
  }, [pixels]);

  useEffect(() => {
    const pixelIntervalId = setInterval(() => {
      if (filledPixels < LOADING_TOTAL_PIXELS) {
        const newPixel = generatePixel();
        if (newPixel) {
          setPixels(prev => {
            const newPixels = [...prev];
            newPixels[newPixel.index] = newPixel.color;
            return newPixels;
          });
          setFilledPixels(prev => prev + 1);
        }
      }
    }, 50);

    const textIntervalId = setInterval(() => {
      setLoadingDots(prev => {
        switch (prev) {
          case '': return '.';
          case '.': return '..';
          case '..': return '...';
          case '...': return '';
          default: return '';
        }
      });
    }, 50);

    return () => {
      clearInterval(pixelIntervalId);
      clearInterval(textIntervalId);
    };
  }, [filledPixels, generatePixel]);

  // Memoize the pixel grid
  const pixelGrid = useMemo(() => (
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
  ), [pixels]);

  // Memoize the loading text
  const loadingText = useMemo(() => (
    <p className={`text-black text-2xl text-left ${vt323.className}`} style={{ width: '100px' }}>
      Loading{loadingDots}
    </p>
  ), [loadingDots]);

  return (
    <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
      <div className="text-center">
        {pixelGrid}
        <div className="flex justify-center">
          {loadingText}
        </div>
      </div>
    </div>
  );
}
