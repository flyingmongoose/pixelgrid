// src/app/fhd/page.tsx

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { CanvasPixelGrid, CanvasPixelGridProps } from '@/components/CanvasPixelGrid';
import { NavbarHeader } from '@/components/NavbarHeader';
import { Footer } from '@/components/layout/Footer';
import { LoadingOverlay } from '@/components/LoadingOverlay';
import { useContractData } from '@/hooks/useContractData';

var MINIMUM_LOADING_TIME = 2000; // 2 seconds
var LOADING_TIMEOUT = 30000; // 30 seconds

export default function FHDPage(): JSX.Element {
  var [dimensions, setDimensions] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  var [isLoading, setIsLoading] = useState<boolean>(true);
  var [selectedPixel, setSelectedPixel] = useState<{ x: number; y: number } | null>(null);
  var [displayProgress, setDisplayProgress] = useState<number>(0);
  var { pixels, isLoading: isContractDataLoading, progress } = useContractData();

  useEffect(function() {
    var updateDimensions = function() {
      var newDimensions = {
        width: window.innerWidth,
        height: window.innerHeight - 128, // Adjust for header and footer
      };
      setDimensions(newDimensions);
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);

    return function() {
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);

  useEffect(function() {
    var startTime = Date.now();
    var timeoutId: NodeJS.Timeout;

    var checkLoadingComplete = function() {
      var elapsedTime = Date.now() - startTime;
      var currentProgress = isNaN(progress) ? 0 : progress;
    
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

    return function() {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isContractDataLoading, progress]);

  var handleLoadingComplete = useCallback(function() {
    console.log('Loading complete called');
    setDisplayProgress(100);
    setIsLoading(false);
  }, []);

  var handlePixelClick = useCallback(function(x: number, y: number) {
    console.log('Pixel clicked:', x, y);
    setSelectedPixel({ x: x, y: y });
  }, []);

  var canvasPixelGridProps: CanvasPixelGridProps = {
    dimensions: dimensions,
    onPixelClick: handlePixelClick,
    selectedPixel: selectedPixel,
  };

  //console.log('Rendering FHDPage, isLoading:', isLoading, 'displayProgress:', displayProgress);

  return (
    <main className="flex flex-col min-h-screen">
      {isLoading ? (
        <LoadingOverlay onLoadingComplete={handleLoadingComplete} progress={displayProgress} />
      ) : (
        <React.Fragment>
          <NavbarHeader />
          <div className="flex-grow relative">
            <div className="absolute inset-0">
              <CanvasPixelGrid {...canvasPixelGridProps} />
            </div>
          </div>
          <Footer />
        </React.Fragment>
      )}
    </main>
  );
}
