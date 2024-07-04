import React from 'react';
import { useContractData } from '../../hooks/useContractData';
import { GRID_WIDTH, GRID_HEIGHT, PIXEL_SIZE } from '../../constants/styles';

export const PixelGrid: React.FC = () => {
  const { pixels } = useContractData();

  return (
    <div className="relative" style={{ width: GRID_WIDTH, height: GRID_HEIGHT }}>
      {pixels.map((pixel, index) => (
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
