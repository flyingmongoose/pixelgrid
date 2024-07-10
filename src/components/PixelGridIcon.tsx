import React, { useCallback } from 'react';
import { COLORS } from '@/constants/styles';

interface PixelGridIconProps {
  size?: number;
  gridSize?: number;
  borderWidth?: number;
  isHovered?: boolean;
}

export function PixelGridIcon({ size = 24, gridSize = 4, borderWidth = 1, isHovered = false }: PixelGridIconProps) {
  const generatePixels = useCallback(() => {
    const pixels = [];
    for (let i = 0; i < gridSize * gridSize; i++) {
      pixels.push(COLORS[Math.floor(Math.random() * COLORS.length)]);
    }
    return pixels;
  }, [gridSize]);

  const pixels = generatePixels();

  const innerSize = size - 2 * borderWidth;
  const pixelSize = innerSize / gridSize;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <rect x="0" y="0" width={size} height={size} fill="none" stroke="black" strokeWidth={borderWidth} />
      <g transform={`translate(${borderWidth}, ${borderWidth})`}>
        {pixels.map((color, index) => {
          const x = (index % gridSize) * pixelSize;
          const y = Math.floor(index / gridSize) * pixelSize;
          return (
            <rect
              key={index}
              x={x}
              y={y}
              width={pixelSize}
              height={pixelSize}
              fill={color}
            />
          );
        })}
      </g>
    </svg>
  );
}
