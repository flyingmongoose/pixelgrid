// src/components/LoadingOverlay.tsx

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { VT323 } from 'next/font/google'
import { COLORS, LOADING_BOX_SIZE, LOADING_PIXEL_SIZE, LOADING_TOTAL_PIXELS } from '@/constants/styles';

const vt323 = VT323({
  weight: '400',
  subsets: ['latin'],
})

interface LoadingOverlayProps {
  onLoadingComplete: () => void;
  progress: number;
}

interface PixelData {
  index: number;
  color: string;
}

/**
 * LoadingOverlay component that displays an animated loading screen.
 * @param {LoadingOverlayProps} props - The props for the LoadingOverlay component.
 * @returns {JSX.Element} The rendered LoadingOverlay component.
 */
export function LoadingOverlay({ onLoadingComplete, progress }: LoadingOverlayProps): JSX.Element {
  const [filledPixels, setFilledPixels] = useState<number>(0);
  const [loadingDots, setLoadingDots] = useState<string>('');
  const [pixels, setPixels] = useState<string[]>(Array(LOADING_TOTAL_PIXELS).fill(''));
  const [displayPercentage, setDisplayPercentage] = useState<number>(0);

  const generatePixel = useCallback((): PixelData | null => {
    const emptyIndices = pixels.reduce<number[]>((acc, pixel, index) => {
      if (pixel === '') acc.push(index);
      return acc;
    }, []);

    if (emptyIndices.length > 0) {
      const randomIndex = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
      const newColor = COLORS[Math.floor(Math.random() * COLORS.length)];
      return { index: randomIndex, color: newColor };
    }
    return null;
  }, [pixels]);

  useEffect(() => {
    let pixelIntervalId: NodeJS.Timeout;
    let textIntervalId: NodeJS.Timeout;
    let percentageIntervalId: NodeJS.Timeout;

    const animateLoading = () => {
      pixelIntervalId = setInterval(() => {
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

      textIntervalId = setInterval(() => {
        setLoadingDots(prev => {
          switch (prev) {
            case '': return '.';
            case '.': return '..';
            case '..': return '...';
            case '...': return '';
            default: return '';
          }
        });
      }, 500);

      percentageIntervalId = setInterval(() => {
        setDisplayPercentage(prev => {
          const actualPercentage = Math.min(progress, 100);
          const newPercentage = Math.min(prev + 1, Math.max(actualPercentage, prev));
          if (newPercentage >= 100) {
            clearInterval(percentageIntervalId);
            clearInterval(pixelIntervalId);
            clearInterval(textIntervalId);
            console.log('Loading complete, calling onLoadingComplete');
            onLoadingComplete();
          }
          return newPercentage;
        });
      }, 50);
    };

    animateLoading();

    return () => {
      clearInterval(pixelIntervalId);
      clearInterval(textIntervalId);
      clearInterval(percentageIntervalId);
    };
  }, [filledPixels, generatePixel, progress, onLoadingComplete]);

  const pixelGrid = useMemo(() => (
    <div
      className="w-[100px] h-[100px] border-2 border-black mb-0 mx-auto grid"
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

  const loadingText = useMemo(() => (
    <p className={`text-black text-2xl text-left ${vt323.className}`} style={{ width: '100px' }}>
      Loading{loadingDots}
    </p>
  ), [loadingDots]);

  const percentageText = useMemo(() => (
    <p className={`text-black text-xl mt-0 ${vt323.className} percentage-text`}>
      {Math.round(displayPercentage)}%
    </p>
  ), [displayPercentage]);

  return (
    <div className="fixed inset-0 bg-white flex items-center justify-center z-50 loading-overlay">
      <div className="text-center">
        {pixelGrid}
        <div className="flex flex-col items-center">
          {percentageText}
          {loadingText}
        </div>
      </div>
    </div>
  );
}
