// src/components/CanvasPixelGrid.tsx

import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { useContractData } from '@/hooks/useContractData';
import { SlideOutMintModal } from './SlideOutMintModal';

const MIN_ZOOM = 1;
const MAX_ZOOM = 50;
const INITIAL_ZOOM = 10;
const GRID_WIDTH = 1921;
const GRID_HEIGHT = 1081;
const EXTRA_PAN_FACTOR = 1;

export interface CanvasPixelGridProps {
  dimensions: { width: number; height: number };
  onPixelClick: (x: number, y: number) => void;
  selectedPixel: { x: number, y: number } | null;
}

export function CanvasPixelGrid({ dimensions, onPixelClick, selectedPixel }: CanvasPixelGridProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { pixels, isLoading, progress } = useContractData();
  const [zoom, setZoom] = useState(INITIAL_ZOOM);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  const [hoveredPixel, setHoveredPixel] = useState<{ x: number, y: number } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mouseDownCell, setMouseDownCell] = useState<{ x: number, y: number } | null>(null);

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

    const scaleX = canvas.width / GRID_WIDTH;
    const scaleY = canvas.height / GRID_HEIGHT;
    const scale = Math.min(scaleX, scaleY);

    const translateX = (canvas.width - GRID_WIDTH * scale * zoom) / 2;
    const translateY = (canvas.height - GRID_HEIGHT * scale * zoom) / 2;

    ctx.translate(translateX, translateY);
    ctx.scale(scale * zoom, scale * zoom);
    ctx.translate(panOffset.x, panOffset.y);

    // Draw background grid
    ctx.beginPath();
    for (let x = 0; x <= GRID_WIDTH; x++) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, GRID_HEIGHT);
    }
    for (let y = 0; y <= GRID_HEIGHT; y++) {
      ctx.moveTo(0, y);
      ctx.lineTo(GRID_WIDTH, y);
    }
    ctx.strokeStyle = '#eee';
    ctx.lineWidth = 1 / (scale * zoom);
    ctx.stroke();

    // Draw minted pixels
    pixels.forEach(pixel => {
      ctx.fillStyle = pixel.color;
      ctx.fillRect(pixel.x, pixel.y, 1, 1);
    });

    // Draw hover effect
    if (hoveredPixel && !isPixelMinted(hoveredPixel.x, hoveredPixel.y)) {
      ctx.fillStyle = 'rgba(128, 128, 128, 0.5)';
      ctx.fillRect(hoveredPixel.x, hoveredPixel.y, 1, 1);
      ctx.strokeStyle = 'gold';
      ctx.lineWidth = 2 / (scale * zoom);
      ctx.strokeRect(hoveredPixel.x, hoveredPixel.y, 1, 1);
    }

    // Draw selected pixel
    if (selectedPixel) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(selectedPixel.x, selectedPixel.y, 1, 1);
      ctx.strokeStyle = 'gold';
      ctx.lineWidth = 2 / (scale * zoom);
      ctx.strokeRect(selectedPixel.x, selectedPixel.y, 1, 1);
    }

    ctx.restore();
  }, [pixels, zoom, panOffset, hoveredPixel, isPixelMinted, selectedPixel]);

  useEffect(() => {
    draw();
  }, [draw, dimensions]);

  const clampPanOffset = useCallback((offset: { x: number; y: number }, currentZoom: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return offset;

    const scaleX = canvas.width / GRID_WIDTH;
    const scaleY = canvas.height / GRID_HEIGHT;
    const scale = Math.min(scaleX, scaleY);

    const viewportWidth = canvas.width / (scale * currentZoom);
    const viewportHeight = canvas.height / (scale * currentZoom);

    const extraPanX = GRID_WIDTH * EXTRA_PAN_FACTOR / currentZoom;
    const extraPanY = GRID_HEIGHT * EXTRA_PAN_FACTOR / currentZoom;
    const maxPanX = Math.max(0, (GRID_WIDTH - viewportWidth) / 2 + extraPanX);
    const maxPanY = Math.max(0, (GRID_HEIGHT - viewportHeight) / 2 + extraPanY);

    return {
      x: Math.max(Math.min(offset.x, maxPanX), -maxPanX),
      y: Math.max(Math.min(offset.y, maxPanY), -maxPanY)
    };
  }, []);

  const getGridCellFromMouse = useCallback((mouseX: number, mouseY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
  
    const rect = canvas.getBoundingClientRect();
    const canvasX = mouseX - rect.left;
    const canvasY = mouseY - rect.top;
  
    const scaleX = canvas.width / GRID_WIDTH;
    const scaleY = canvas.height / GRID_HEIGHT;
    const scale = Math.min(scaleX, scaleY);
  
    const translateX = (canvas.width - GRID_WIDTH * scale * zoom) / 2;
    const translateY = (canvas.height - GRID_HEIGHT * scale * zoom) / 2;
  
    const gridX = Math.floor((canvasX - translateX) / (scale * zoom) - panOffset.x);
    let gridY = Math.floor((canvasY - translateY) / (scale * zoom) - panOffset.y);
  
    // Adjust Y coordinate: +1 for every 10 pixels (adjusted for zoom)
    const yAdjustment = Math.floor(canvasY / (7.5 * zoom)); // set to 5 to make aggressive movement adjustment, 10 should be fine
    gridY += yAdjustment;
  
    if (gridX >= 0 && gridX < GRID_WIDTH && gridY >= 0 && gridY < GRID_HEIGHT) {
      return { x: gridX, y: gridY };
    }
  
    return null;
  }, [zoom, panOffset]);
  

  const handleZoom = useCallback((newZoom: number, mouseX: number, mouseY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    newZoom = Math.min(Math.max(newZoom, MIN_ZOOM), MAX_ZOOM);
    if (newZoom === zoom) return;

    const cellBefore = getGridCellFromMouse(mouseX, mouseY);
    if (!cellBefore) return;

    setZoom(newZoom);

    const cellAfter = getGridCellFromMouse(mouseX, mouseY);
    if (!cellAfter) return;

    setPanOffset(prev => clampPanOffset({
      x: prev.x + (cellAfter.x - cellBefore.x),
      y: prev.y + (cellAfter.y - cellBefore.y)
    }, newZoom));

    draw();
  }, [zoom, clampPanOffset, draw, getGridCellFromMouse]);

  const handleWheel = useCallback((event: React.WheelEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    handleZoom(zoom * (event.deltaY < 0 ? 1.1 : 0.9), event.clientX, event.clientY);
  }, [handleZoom, zoom]);

  const handleMouseDown = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    const cell = getGridCellFromMouse(event.clientX, event.clientY);
    if (cell && !isPixelMinted(cell.x, cell.y)) {
      setMouseDownCell(cell);
    }
    setIsDragging(true);
    setLastMousePos({ x: event.clientX, y: event.clientY });
  }, [getGridCellFromMouse, isPixelMinted]);

  const handleMouseMove = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (isDragging) {
      const dx = event.clientX - lastMousePos.x;
      const dy = event.clientY - lastMousePos.y;

      const scaleX = canvas.width / GRID_WIDTH;
      const scaleY = canvas.height / GRID_HEIGHT;
      const scale = Math.min(scaleX, scaleY);

      setPanOffset(prev => clampPanOffset({
        x: prev.x + dx / (scale * zoom),
        y: prev.y + dy / (scale * zoom)
      }, zoom));

      setLastMousePos({ x: event.clientX, y: event.clientY });
      setMouseDownCell(null); // Reset mouseDownCell if dragging
    } else {
      const cell = getGridCellFromMouse(event.clientX, event.clientY);
      if (cell) {
        setHoveredPixel(cell);
        canvas.style.cursor = !isPixelMinted(cell.x, cell.y) ? 'pointer' : 'default';
      } else {
        setHoveredPixel(null);
        canvas.style.cursor = 'default';
      }
    }

    draw();
  }, [isDragging, lastMousePos, zoom, clampPanOffset, isPixelMinted, draw, getGridCellFromMouse]);

  const handleMouseUp = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(false);
    const cell = getGridCellFromMouse(event.clientX, event.clientY);
    if (cell && mouseDownCell && cell.x === mouseDownCell.x && cell.y === mouseDownCell.y && !isPixelMinted(cell.x, cell.y)) {
      onPixelClick(cell.x, cell.y);
      setIsModalOpen(true);
    }
    setMouseDownCell(null);
  }, [getGridCellFromMouse, mouseDownCell, isPixelMinted, onPixelClick]);

  const handleMouseLeave = useCallback(() => {
    setIsDragging(false);
    setHoveredPixel(null);
    setMouseDownCell(null);
  }, []);

  const handlePan = useCallback((direction: 'left' | 'right' | 'up' | 'down') => {
    const panAmount = 50 / zoom; // Adjust this value to change pan speed
    setPanOffset(prev => {
      const newOffset = { ...prev };
      switch (direction) {
        case 'left':
          newOffset.x += panAmount;
          break;
        case 'right':
          newOffset.x -= panAmount;
          break;
        case 'up':
          newOffset.y += panAmount;
          break;
        case 'down':
          newOffset.y -= panAmount;
          break;
      }
      return clampPanOffset(newOffset, zoom);
    });
  }, [zoom, clampPanOffset]);

  useEffect(() => {
    draw();
  }, [panOffset, draw]);

  if (isLoading) {
    return <div>Loading... {progress.toFixed(2)}%</div>;
  }

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
          onClick={(e) => {
            const rect = canvasRef.current?.getBoundingClientRect();
            if (rect) {
              handleZoom(zoom * 0.9, e.clientX, e.clientY);
            }
          }}
          className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-2"
        >
          -
        </button>
        <input
          type="range"
          min={MIN_ZOOM}
          max={MAX_ZOOM}
          value={zoom}
          onChange={(e) => {
            const rect = canvasRef.current?.getBoundingClientRect();
            if (rect) {
              handleZoom(Number(e.target.value), rect.width / 2, rect.height / 2);
            }
          }}
          className="w-96"
        />
        <button
          onClick={(e) => {
            const rect = canvasRef.current?.getBoundingClientRect();
            if (rect) {
              handleZoom(zoom * 1.1, e.clientX, e.clientY);
            }
          }}
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
          value={100 - ((panOffset.x + GRID_WIDTH / 2) / GRID_WIDTH) * 100}
          onChange={(e) => setPanOffset(prev => clampPanOffset({ ...prev, x: (GRID_WIDTH / 2 - (Number(e.target.value) / 100) * GRID_WIDTH) }, zoom))}
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
