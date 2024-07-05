// src/components/CanvasPixelGrid.tsx

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { SlideOutMintModal } from './SlideOutMintModal';

const MIN_ZOOM = 1;
const MAX_ZOOM = 50;
const INITIAL_ZOOM = 10;
const GRID_WIDTH = 1921;
const GRID_HEIGHT = 1081;
const EXTRA_PAN_FACTOR = 1;

// Define the Pixel type
interface Pixel {
  x: number;
  y: number;
  color: string;
  ownerMessage: string;
}

export interface CanvasPixelGridProps {
  dimensions: { width: number; height: number };
  onPixelClick: (x: number, y: number) => void;
  selectedPixel: { x: number, y: number } | null;
  pixels: Pixel[];
}

export function CanvasPixelGrid({ dimensions, onPixelClick, selectedPixel, pixels }: CanvasPixelGridProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [zoom, setZoom] = useState(INITIAL_ZOOM);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  const [hoveredPixel, setHoveredPixel] = useState<{ x: number, y: number } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const isPixelMinted = useCallback((x: number, y: number) => {
    return pixels.some(pixel => pixel.x === x && pixel.y === y);
  }, [pixels]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
  
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
  
    const totalGridWidth = GRID_WIDTH * zoom;
    const totalGridHeight = GRID_HEIGHT * zoom;
  
    const offsetX = Math.round((canvas.width - totalGridWidth) / 2 + panOffset.x * zoom);
    const offsetY = Math.round((canvas.height - totalGridHeight) / 2 + panOffset.y * zoom);
  
    ctx.translate(offsetX, offsetY);
  
    // Draw background grid
    ctx.beginPath();
    for (let x = 0; x <= GRID_WIDTH; x++) {
      ctx.moveTo(x * zoom, 0);
      ctx.lineTo(x * zoom, totalGridHeight);
    }
    for (let y = 0; y <= GRID_HEIGHT; y++) {
      ctx.moveTo(0, y * zoom);
      ctx.lineTo(totalGridWidth, y * zoom);
    }
    ctx.strokeStyle = '#eee';
    ctx.lineWidth = 1;
    ctx.stroke();
  
    // Draw minted pixels
    pixels.forEach(pixel => {
      ctx.fillStyle = pixel.color;
      ctx.fillRect(pixel.x * zoom, pixel.y * zoom, zoom, zoom);
    });
  
    // Draw hover effect
    if (hoveredPixel && !isPixelMinted(hoveredPixel.x, hoveredPixel.y)) {
      ctx.fillStyle = 'rgba(128, 128, 128, 0.5)';
      ctx.fillRect(hoveredPixel.x * zoom, hoveredPixel.y * zoom, zoom, zoom);
      ctx.strokeStyle = 'gold';
      ctx.lineWidth = 2;
      ctx.strokeRect(hoveredPixel.x * zoom, hoveredPixel.y * zoom, zoom, zoom);
    }
  
    // Draw selected pixel
    if (selectedPixel) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(selectedPixel.x * zoom, selectedPixel.y * zoom, zoom, zoom);
      ctx.strokeStyle = 'gold';
      ctx.lineWidth = 2;
      ctx.strokeRect(selectedPixel.x * zoom, selectedPixel.y * zoom, zoom, zoom);
    }
  
    ctx.restore();
}, [pixels, zoom, panOffset, hoveredPixel, selectedPixel, isPixelMinted]);
  

  useEffect(() => {
    draw();
  }, [draw, dimensions]);

  const clampPanOffset = useCallback((offset: { x: number; y: number }, currentZoom: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return offset;
  
    const totalGridWidth = GRID_WIDTH * currentZoom;
    const totalGridHeight = GRID_HEIGHT * currentZoom;
  
    const maxPanX = (totalGridWidth - canvas.width) / (2 * currentZoom);
    const maxPanY = (totalGridHeight - canvas.height) / (2 * currentZoom);
  
    return {
      x: Math.max(Math.min(offset.x, maxPanX), -maxPanX),
      y: Math.max(Math.min(offset.y, maxPanY), -maxPanY)
    };
  }, []);

  const handleZoom = useCallback((newZoom: number, mouseX: number, mouseY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    newZoom = Math.min(Math.max(newZoom, MIN_ZOOM), MAX_ZOOM);

    if (newZoom === zoom) return;

    const cellWidth = canvas.width / GRID_WIDTH;
    const cellHeight = canvas.height / GRID_HEIGHT;

    const gridStartX = (canvas.width - GRID_WIDTH * cellWidth * zoom) / 2 - panOffset.x * zoom;
    const gridStartY = (canvas.height - GRID_HEIGHT * cellHeight * zoom) / 2 - panOffset.y * zoom;

    const mouseGridX = (mouseX - gridStartX) / (cellWidth * zoom);
    const mouseGridY = (mouseY - gridStartY) / (cellHeight * zoom);

    const panX = mouseGridX * (1 - newZoom / zoom);
    const panY = mouseGridY * (1 - newZoom / zoom);

    const newPanOffset = clampPanOffset({
      x: panOffset.x + panX,
      y: panOffset.y + panY
    }, newZoom);

    setZoom(newZoom);
    setPanOffset(newPanOffset);
  }, [zoom, panOffset, clampPanOffset]);

  const handleWheel = useCallback((event: React.WheelEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    handleZoom(zoom * (event.deltaY < 0 ? 1.1 : 0.9), mouseX, mouseY);
  }, [handleZoom, zoom]);

  const handleMouseDown = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setLastMousePos({ x: event.clientX, y: event.clientY });
  }, []);

  const handleMouseMove = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
  
    if (isDragging) {
      const dx = event.clientX - lastMousePos.x;
      const dy = event.clientY - lastMousePos.y;
  
      setPanOffset(prev => clampPanOffset({
        x: prev.x - dx / zoom,
        y: prev.y - dy / zoom
      }, zoom));
  
      setLastMousePos({ x: event.clientX, y: event.clientY });
    } else {
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
  
      // Calculate the size of the entire grid in pixels
      const totalGridWidth = GRID_WIDTH * zoom;
      const totalGridHeight = GRID_HEIGHT * zoom;
  
      // Calculate the offset of the grid within the canvas
      const offsetX = (canvasWidth - totalGridWidth) / 2 + panOffset.x * zoom;
      const offsetY = (canvasHeight - totalGridHeight) / 2 + panOffset.y * zoom;
  
      // Calculate the grid coordinates
      const gridX = Math.floor((mouseX - offsetX) / zoom);
      const gridY = Math.floor((mouseY - offsetY) / zoom);
  
      if (gridX >= 0 && gridX < GRID_WIDTH && gridY >= 0 && gridY < GRID_HEIGHT) {
        setHoveredPixel({ x: gridX, y: gridY });
        canvas.style.cursor = !isPixelMinted(gridX, gridY) ? 'pointer' : 'default';
      } else {
        setHoveredPixel(null);
        canvas.style.cursor = 'default';
      }
  
      console.log('Mouse position:', { x: mouseX, y: mouseY });
      console.log('Calculated grid position:', { x: gridX, y: gridY });
      console.log('Pan offset:', panOffset);
      console.log('Zoom:', zoom);
      console.log('Canvas dimensions:', { width: canvasWidth, height: canvasHeight });
      console.log('Total grid dimensions:', { width: totalGridWidth, height: totalGridHeight });
      console.log('Grid offset:', { x: offsetX, y: offsetY });
    }
  
    draw();
  }, [isDragging, zoom, panOffset, isPixelMinted, draw]);
  

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsDragging(false);
    setHoveredPixel(null);
  }, []);

  const handleClick = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging && hoveredPixel && !isPixelMinted(hoveredPixel.x, hoveredPixel.y)) {
      onPixelClick(hoveredPixel.x, hoveredPixel.y);
      setIsModalOpen(true);
    }
  }, [hoveredPixel, isPixelMinted, isDragging, onPixelClick]);

  const handlePan = useCallback((direction: 'left' | 'right' | 'up' | 'down') => {
    const panAmount = 50 / zoom; // Adjust this value to change pan speed
    setPanOffset(prev => {
      const newOffset = { ...prev };
      switch (direction) {
        case 'left':
          newOffset.x -= panAmount;
          break;
        case 'right':
          newOffset.x += panAmount;
          break;
        case 'up':
          newOffset.y -= panAmount;
          break;
        case 'down':
          newOffset.y += panAmount;
          break;
      }
      return clampPanOffset(newOffset, zoom);
    });
  }, [zoom, clampPanOffset]);

  return (
    <div className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        className="w-full h-full block cursor-grab active:cursor-grabbing"
      />
      {selectedPixel && (
        <SlideOutMintModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          x={selectedPixel.x}
          y={selectedPixel.y}
          onMintSuccess={() => {/* Implement this if needed */}}
        />
      )}
      <div className="absolute top-2 left-1/2 transform -translate-x-1/2 flex items-center bg-white p-2 rounded-full shadow">
        <button
          onClick={() => handleZoom(zoom * 0.9, dimensions.width / 2, dimensions.height / 2)}
          className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-2"
        >
          -
        </button>
        <input
          type="range"
          min={MIN_ZOOM}
          max={MAX_ZOOM}
          value={zoom}
          onChange={(e) => handleZoom(Number(e.target.value), dimensions.width / 2, dimensions.height / 2)}
          className="w-96"
        />
        <button
          onClick={() => handleZoom(zoom * 1.1, dimensions.width / 2, dimensions.height / 2)}
          className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center ml-2"
        >
          +
        </button>
      </div>
      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex items-center bg-white p-2 rounded-full shadow">
        <button
          onClick={() => handlePan('left')}
          className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-2"
        >
          ←
        </button>
        <input
          type="range"
          min={0}
          max={100}
          value={((panOffset.x + GRID_WIDTH / 2) / GRID_WIDTH) * 100}
          onChange={(e) => setPanOffset(prev => clampPanOffset({ ...prev, x: (Number(e.target.value) / 100) * GRID_WIDTH - GRID_WIDTH / 2 }, zoom))}
          className="w-96"
        />
        <button
          onClick={() => handlePan('right')}
          className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center ml-2"
        >
          →
        </button>
      </div>
      <div className="absolute top-1/2 right-2 transform -translate-y-1/2 flex flex-col items-center bg-white p-2 rounded-full shadow">
        <button
          onClick={() => handlePan('up')}
          className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mb-2 z-10"
        >
          ↑
        </button>
        <div className="relative h-72 w-8 flex items-center justify-center">
          <input
            type="range"
            min={0}
            max={100}
            value={((panOffset.y + GRID_HEIGHT / 2) / GRID_HEIGHT) * 100}
            onChange={(e) => setPanOffset(prev => clampPanOffset({ ...prev, y: (Number(e.target.value) / 100) * GRID_HEIGHT - GRID_HEIGHT / 2 }, zoom))}
            className="absolute bottom-28 left-1/2 w-72 h-8 -translate-x-1/2 -translate-y-1/2 -rotate-90 origin-center"
          />
        </div>
        <button
          onClick={() => handlePan('down')}
          className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mt-2 z-10"
        >
          ↓
        </button>
      </div>
    </div>
  );
}
