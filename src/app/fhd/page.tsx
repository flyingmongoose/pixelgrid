// src/app/fhd/page.tsx

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { CanvasPixelGrid, CanvasPixelGridProps } from '@/components/CanvasPixelGrid';
import { NavbarHeader } from '@/components/NavbarHeader';
import { Footer } from '@/components/layout/Footer';
import { LoadingOverlay } from '@/components/LoadingOverlay';

export default function FHDPage() {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPixel, setSelectedPixel] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight - 128, // Adjust for header and footer
      });
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);

    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const handleLoadingComplete = useCallback(() => {
    setIsLoading(false);
  }, []);

  const handlePixelClick = useCallback((x: number, y: number) => {
    setSelectedPixel({ x, y });
  }, []);

  const canvasPixelGridProps: CanvasPixelGridProps = {
    dimensions,
    onPixelClick: handlePixelClick,
    selectedPixel,
  };

  return (
    <main className="flex flex-col min-h-screen">
      {isLoading && <LoadingOverlay onLoadingComplete={handleLoadingComplete} />}
      <NavbarHeader />
      <div className="flex-grow relative">
        <div className="absolute inset-0">
          <CanvasPixelGrid {...canvasPixelGridProps} />
        </div>
      </div>
      <Footer />
    </main>
  );
}
