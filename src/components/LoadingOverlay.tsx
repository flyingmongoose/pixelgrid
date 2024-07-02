import React, { useState, useEffect } from 'react';

const COLORS = ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#8B00FF'];
const BOX_SIZE = 100;
const PIXEL_SIZE = 5;
const TOTAL_PIXELS = (BOX_SIZE / PIXEL_SIZE) ** 2;

export function LoadingOverlay() {
  const [pixels, setPixels] = useState<string[]>(Array(TOTAL_PIXELS).fill(''));
  const [loadingDots, setLoadingDots] = useState('');
  const [filledPixels, setFilledPixels] = useState(0);

  useEffect(() => {
    const pixelIntervalId = setInterval(() => {
      if (filledPixels < TOTAL_PIXELS) {
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
    }, 55); // Cycle every 100ms

    return () => {
      clearInterval(pixelIntervalId);
      clearInterval(textIntervalId);
    };
  }, [filledPixels]);

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="text-center">
        <div 
          className="w-[100px] h-[100px] border-2 border-black mb-4 mx-auto grid"
          style={{
            gridTemplateColumns: `repeat(${BOX_SIZE / PIXEL_SIZE}, 1fr)`,
            gridTemplateRows: `repeat(${BOX_SIZE / PIXEL_SIZE}, 1fr)`,
          }}
        >
          {pixels.map((color, index) => (
            <div key={index} style={{ backgroundColor: color }} />
          ))}
        </div>
        <div className="flex justify-center">
          <p className="text-white text-2xl font-mono text-left" style={{ width: '120px' }}>
            Loading{loadingDots}
          </p>
        </div>
      </div>
    </div>
  );
}
