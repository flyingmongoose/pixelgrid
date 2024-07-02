import React, { useMemo } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { useContractData } from './useContractData';

interface Pixel {
  x: number;
  y: number;
  color: string;
}

export function PixelGrid() {
  const { pixels } = useContractData();

  const svgContent = useMemo(() => (
    <svg width="1920" height="1080" viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMid meet">
      <rect width="1920" height="1080" fill="#f0f0f0" />
      {pixels.map((pixel, index) => (
        <rect
          key={index}
          x={pixel.x}
          y={pixel.y}
          width="1"
          height="1"
          fill={pixel.color}
        />
      ))}
    </svg>
  ), [pixels]);

  return (
    <TransformWrapper
      initialScale={1}
      minScale={1}
      maxScale={3}
      centerOnInit={true}
      panning={{disabled: false}}
    >
      <TransformComponent wrapperStyle={{width: '100%', height: '100%'}}>
        {svgContent}
      </TransformComponent>
    </TransformWrapper>
  );
}
