'use client';

import React, { useState, useEffect } from 'react';

const COLORS = ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#8B00FF', '#FFFFFF'];
const PIXEL_SIZE = 20;
const G_WIDTH = 18; // 3/4 of previous width (24)
const P_WIDTH = 16;
const P_HEIGHT = 30;
const G_HEIGHT = 32;
const BORDER_SIZE = 2;
const SHADOW_COLOR = 'rgba(0,0,0,0.3)';

function generatePixelatedLetter(letter: string, width: number, height: number, yOffset: number = 0) {
  const pixels = [];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (shouldDrawPixel(letter, x, y, width, height)) {
        const color = COLORS[Math.floor(Math.random() * COLORS.length)];
        pixels.push(
          <div
            key={`${x}-${y}`}
            style={{
              position: 'absolute',
              left: `${x * PIXEL_SIZE}px`,
              top: `${(y + yOffset) * PIXEL_SIZE}px`,
              width: `${PIXEL_SIZE}px`,
              height: `${PIXEL_SIZE}px`,
              backgroundColor: color,
              boxShadow: `
                ${BORDER_SIZE}px 0 0 0 ${SHADOW_COLOR},
                0 ${BORDER_SIZE}px 0 0 ${SHADOW_COLOR},
                ${BORDER_SIZE}px ${BORDER_SIZE}px 0 0 ${SHADOW_COLOR},
                ${BORDER_SIZE}px 0 0 0 ${SHADOW_COLOR} inset,
                0 ${BORDER_SIZE}px 0 0 ${SHADOW_COLOR} inset
              `,
            }}
          />
        );
      }
    }
  }
  return pixels;
}

function shouldDrawPixel(letter: string, x: number, y: number, width: number, height: number) {
  // Adjusted pixel art representations of 'P' and 'G'
  const P = [
    '1111111111111',
    '1111111111111',
    '1110000000111',
    '1110000000111',
    '1110000000111',
    '1110000000111',
    '1110000000111',
    '1110000000111',
    '1111111111111',
    '1111111111111',
    '1110000000000',
    '1110000000000',
    '1110000000000',
    '1110000000000',
    '1110000000000',
    '1110000000000',
    '1110000000000',
    '1110000000000',
  ];
  const G = [
    '00111111111100',
    '01111111111110',
    '11100000001111',
    '11000000000111',
    '11000000000111',
    '11000000000000',
    '11000000000000',
    '11000000000000',
    '11000000000000',
    '11000011111111',
    '11000011111111',
    '11000000001111',
    '11000000001111',
    '11000000001111',
    '11100000001111',
    '01111111111110',
    '00111111111100',
    '00111111111100',
  ];
  
  const pattern = letter === 'P' ? P : G;
  const startY = Math.floor((height - pattern.length) / 2);
  const startX = Math.floor((width - pattern[0].length) / 2);
  
  if (y >= startY && y < startY + pattern.length &&
      x >= startX && x < startX + pattern[0].length) {
    return pattern[y - startY][x - startX] === '1';
  }
  return false;
}

export default function PGPage() {
  const [key, setKey] = useState(0);

  useEffect(() => {
    const handleKeyPress = () => setKey(prev => prev + 1);
    window.addEventListener('keypress', handleKeyPress);
    return () => window.removeEventListener('keypress', handleKeyPress);
  }, []);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="flex" style={{ gap: '20px' }}>
        <div style={{ position: 'relative', width: P_WIDTH * PIXEL_SIZE, height: (P_HEIGHT + 1) * PIXEL_SIZE }}>
          {generatePixelatedLetter('P', P_WIDTH, P_HEIGHT, 1)} {/* Moved down by 1 row */}
        </div>
        <div style={{ position: 'relative', width: G_WIDTH * PIXEL_SIZE, height: G_HEIGHT * PIXEL_SIZE }}>
          {generatePixelatedLetter('G', G_WIDTH, G_HEIGHT)}
        </div>
      </div>
    </div>
  );
}
