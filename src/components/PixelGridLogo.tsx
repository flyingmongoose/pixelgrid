import React from 'react';
import Link from 'next/link';
import { 
  COLORS, 
  LETTER_PIXEL_SIZE, 
  LETTER_WIDTH, 
  LETTER_HEIGHT, 
  LETTER_SPACING, 
  NARROW_LETTER_SPACING, 
  WIDE_LETTER_WIDTH, 
  NARROW_LETTER_WIDTH, 
  BORDER_SIZE, 
  SHADOW_COLOR 
} from '@/constants/styles';

function generatePixelatedLetter(letter: string) {
  const letterPatterns: { [key: string]: string[] } = {
    P: [
      '1111100',
      '1100011',
      '1100011',
      '1100011',
      '1100110',
      '1111100',
      '1100000',
      '1100000',
      '1100000',
      '1100000',
      '1100000',
      '1100000',
    ],
    i: [
      '00',
      '11',
      '11',
      '00',
      '11',
      '11',
      '11',
      '11',
      '11',
      '11',
      '11',
      '11',
    ],
    x: [
      '000000',
      '000000',
      '000000',
      '000000',
      '110011',
      '110011',
      '011110',
      '001100',
      '001100',
      '011110',
      '110011',
      '110011',
    ],
    e: [
      '000000',
      '000000',
      '000000',
      '011110',
      '110011',
      '110011',
      '111111',
      '110000',
      '110000',
      '110011',
      '110011',
      '011110',
    ],
    l: [
      '11',
      '11',
      '11',
      '11',
      '11',
      '11',
      '11',
      '11',
      '11',
      '11',
      '11',
      '11',
    ],
    G: [
      '00111100',
      '01100110',
      '11000011',
      '11000000',
      '11000000',
      '11000000',
      '11001111',
      '11000011',
      '11000011',
      '11000011',
      '01100110',
      '00111100',
    ],
    r: [
      '000000',
      '000000',
      '000000',
      '110110',
      '111011',
      '110011',
      '110000',
      '110000',
      '110000',
      '110000',
      '110000',
      '110000',
    ],
    d: [
      '000011',
      '000011',
      '000011',
      '011111',
      '110011',
      '110011',
      '110011',
      '110011',
      '110011',
      '110011',
      '011111',
      '011111',
    ],
  };

  const pattern = letterPatterns[letter] || [];
  const pixels = [];

  const letterWidth = letter === 'P' || letter === 'G' ? WIDE_LETTER_WIDTH :
                      letter === 'i' || letter === 'l' ? NARROW_LETTER_WIDTH : LETTER_WIDTH;

  for (let y = 0; y < LETTER_HEIGHT; y++) {
    for (let x = 0; x < letterWidth; x++) {
      if (pattern[y][x] === '1') {
        const color = COLORS[Math.floor(Math.random() * COLORS.length)];
        pixels.push(
          <div
            key={`${x}-${y}`}
            style={{
              position: 'absolute',
              left: `${x * LETTER_PIXEL_SIZE}px`,
              top: `${y * LETTER_PIXEL_SIZE}px`,
              width: `${LETTER_PIXEL_SIZE}px`,
              height: `${LETTER_PIXEL_SIZE}px`,
              backgroundColor: color,
              boxShadow: `0 0 0 ${BORDER_SIZE}px ${SHADOW_COLOR}`,
            }}
          />
        );
      }
    }
  }
  return pixels;
}

interface PixelGridLogoProps {
  className?: string;
  style?: React.CSSProperties;
}

export function PixelGridLogo({ className = '', style = {} }: PixelGridLogoProps) {
  const text = "PixelGrid";
  return (
    <Link href="/" passHref>
      <div 
        className={`flex items-end cursor-pointer ${className}`} 
        style={{ 
          height: `${LETTER_HEIGHT * LETTER_PIXEL_SIZE}px`,
          ...style 
        }}
      >
        {text.split('').map((letter, index) => {
          const letterWidth = letter === 'P' || letter === 'G' ? WIDE_LETTER_WIDTH :
                              letter === 'i' || letter === 'l' ? NARROW_LETTER_WIDTH : LETTER_WIDTH;
          const spacing = letter === 'i' || letter === 'l' ? NARROW_LETTER_SPACING : LETTER_SPACING;
          return (
            <div
              key={index}
              style={{
                position: 'relative',
                width: `${letterWidth * LETTER_PIXEL_SIZE}px`,
                height: `${LETTER_HEIGHT * LETTER_PIXEL_SIZE}px`,
                marginRight: `${spacing * LETTER_PIXEL_SIZE}px`,
              }}
            >
              {generatePixelatedLetter(letter)}
            </div>
          );
        })}
      </div>
    </Link>
  );
}
