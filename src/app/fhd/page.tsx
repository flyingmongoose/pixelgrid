// src/app/fhd/page.tsx

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { CanvasPixelGrid, CanvasPixelGridProps } from '@/components/CanvasPixelGrid';
import { NavbarHeader } from '@/components/NavbarHeader';
import { Footer } from '@/components/layout/Footer';
import { LoadingOverlay } from '@/components/LoadingOverlay';
import { useContractData } from '@/hooks/useContractData';

const MINIMUM_LOADING_TIME = 2000; // 2 seconds
const LOADING_TIMEOUT = 30000; // 30 seconds

/**
 * FHDPage component for displaying the full HD pixel grid.
 * @returns {JSX.Element} The rendered FHDPage component.
 */
export default function FHDPage(): JSX.Element {
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedPixel, setSelectedPixel] = useState<{ x: number; y: number } | null>(null);
  const [displayProgress, setDisplayProgress] = useState<number>(0);
  const { isLoading: isContractDataLoading, progress } = useContractData();

  /**
   * Effect hook to update dimensions on window resize.
   */
  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight - 128, // Adjust for header and footer
      });
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);

    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);

  /**
   * Effect hook to handle loading state and progress.
   */
  useEffect(() => {
    const startTime = Date.now();
    let timeoutId: NodeJS.Timeout;

    const checkLoadingComplete = () => {
      const elapsedTime = Date.now() - startTime;
      const currentProgress = isNaN(progress) ? 0 : progress;
    
      if (!isContractDataLoading && elapsedTime >= MINIMUM_LOADING_TIME) {
        setDisplayProgress(100);
        setIsLoading(false);
      } else if (elapsedTime >= LOADING_TIMEOUT) {
        setDisplayProgress(100);
        setIsLoading(false);
      } else {
        setDisplayProgress(currentProgress);
        timeoutId = setTimeout(checkLoadingComplete, 1000); // Check every second
      }
    };

    checkLoadingComplete();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isContractDataLoading, progress]);

  /**
   * Callback function to handle loading completion.
   */
  const handleLoadingComplete = useCallback(() => {
    setDisplayProgress(100);
    setIsLoading(false);
  }, []);

  /**
   * Callback function to handle pixel click events.
   * @param {number} x - The x-coordinate of the clicked pixel.
   * @param {number} y - The y-coordinate of the clicked pixel.
   */
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
      {isLoading ? (
        <LoadingOverlay onLoadingComplete={handleLoadingComplete} progress={displayProgress} />
      ) : (
        <>
          <NavbarHeader />
          <div className="flex-grow relative">
            <div className="absolute inset-0">
              <CanvasPixelGrid {...canvasPixelGridProps} />
            </div>
          </div>
          <Footer />
        </>
      )}
    </main>
  );
}
