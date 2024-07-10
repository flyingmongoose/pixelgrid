// src/components/PixelGrid/index.tsx
import React from 'react';
import { useContractData, Pixel } from '../../hooks/useContractData';
import { GRID_WIDTH, GRID_HEIGHT, PIXEL_SIZE } from '../../constants/styles';

export const PixelGrid: React.FC = (): JSX.Element => {
  const { pixels } = useContractData();

  return (
    <div className="relative" style={{ width: GRID_WIDTH, height: GRID_HEIGHT }}>
      {pixels.map((pixel: Pixel, index: number) => (
        <div
          key={index}
          className="absolute"
          style={{
            left: pixel.x * PIXEL_SIZE,
            top: pixel.y * PIXEL_SIZE,
            width: PIXEL_SIZE,
            height: PIXEL_SIZE,
            backgroundColor: pixel.color,
          }}
          title={pixel.ownerMessage}
        />
      ))}
    </div>
  );
};
