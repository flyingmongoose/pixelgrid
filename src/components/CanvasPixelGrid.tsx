import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useContractData } from '@/hooks/useContractData';

const MIN_ZOOM = 1;
const MAX_ZOOM = 10;
const GRID_WIDTH = 1920;
const GRID_HEIGHT = 1080;
const EXTRA_PAN_FACTOR = 0.5; // Allows 50% extra panning space on each side

interface CanvasPixelGridProps {
  dimensions: { width: number; height: number };
}

export function CanvasPixelGrid({ dimensions }: CanvasPixelGridProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { pixels } = useContractData();
  const [zoom, setZoom] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();

    // Calculate the scale to fit the 1920x1080 grid into the canvas
    const scaleX = canvas.width / GRID_WIDTH;
    const scaleY = canvas.height / GRID_HEIGHT;
    const scale = Math.min(scaleX, scaleY);

    // Center the grid in the canvas
    const translateX = (canvas.width - GRID_WIDTH * scale * zoom) / 2;
    const translateY = (canvas.height - GRID_HEIGHT * scale * zoom) / 2;

    ctx.translate(translateX, translateY);
    ctx.scale(scale * zoom, scale * zoom);
    ctx.translate(panOffset.x, panOffset.y);

    // Draw background grid
    ctx.beginPath();
    for (let x = 0; x <= GRID_WIDTH; x += 10) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, GRID_HEIGHT);
    }
    for (let y = 0; y <= GRID_HEIGHT; y += 10) {
      ctx.moveTo(0, y);
      ctx.lineTo(GRID_WIDTH, y);
    }
    ctx.strokeStyle = '#eee';
    ctx.stroke();

    // Draw pixels
    pixels.forEach(pixel => {
      ctx.fillStyle = pixel.color;
      ctx.fillRect(pixel.x, pixel.y, 1, 1);
    });

    ctx.restore();
  }, [pixels, zoom, panOffset]);

  useEffect(() => {
    draw();
  }, [draw, dimensions]);

  const clampPanOffset = useCallback((offset: { x: number; y: number }, currentZoom: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return offset;

    const scaleX = canvas.width / GRID_WIDTH;
    const scaleY = canvas.height / GRID_HEIGHT;
    const scale = Math.min(scaleX, scaleY);

    // Calculate the size of the viewport in grid coordinates
    const viewportWidth = canvas.width / (scale * currentZoom);
    const viewportHeight = canvas.height / (scale * currentZoom);

    // Calculate the maximum pan offset, including extra space (adjusted for zoom)
    const extraPanX = GRID_WIDTH * EXTRA_PAN_FACTOR / currentZoom;
    const extraPanY = GRID_HEIGHT * EXTRA_PAN_FACTOR / currentZoom;
    const maxPanX = Math.max(0, (GRID_WIDTH - viewportWidth) / 2 + extraPanX);
    const maxPanY = Math.max(0, (GRID_HEIGHT - viewportHeight) / 2 + extraPanY);

    // Clamp the offset to allow extra panning space
    return {
      x: Math.max(Math.min(offset.x, maxPanX), -maxPanX),
      y: Math.max(Math.min(offset.y, maxPanY), -maxPanY)
    };
  }, []);

  const handleZoom = useCallback((zoomIn: boolean, mouseX: number, mouseY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const zoomFactor = zoomIn ? 1.1 : 0.9;
    const newZoom = Math.min(Math.max(zoom * zoomFactor, MIN_ZOOM), MAX_ZOOM);

    if (newZoom === zoom) return; // No change in zoom

    const scaleX = canvas.width / GRID_WIDTH;
    const scaleY = canvas.height / GRID_HEIGHT;
    const scale = Math.min(scaleX, scaleY);

    const translateX = (canvas.width - GRID_WIDTH * scale * zoom) / 2;
    const translateY = (canvas.height - GRID_HEIGHT * scale * zoom) / 2;

    // Calculate mouse position relative to the grid
    const mouseGridX = (mouseX - translateX) / (scale * zoom) - panOffset.x;
    const mouseGridY = (mouseY - translateY) / (scale * zoom) - panOffset.y;

    // Calculate new pan offset
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

    handleZoom(event.deltaY < 0, mouseX, mouseY);
  }, [handleZoom]);

  const handleMouseDown = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setLastMousePos({ x: event.clientX, y: event.clientY });
  }, []);

  const handleMouseMove = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;

    const dx = event.clientX - lastMousePos.x;
    const dy = event.clientY - lastMousePos.y;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const scaleX = canvas.width / GRID_WIDTH;
    const scaleY = canvas.height / GRID_HEIGHT;
    const scale = Math.min(scaleX, scaleY);

    setPanOffset(prev => clampPanOffset({
      x: prev.x - dx / (scale * zoom),
      y: prev.y - dy / (scale * zoom)
    }, zoom));

    setLastMousePos({ x: event.clientX, y: event.clientY });
  }, [isDragging, lastMousePos, zoom, clampPanOffset]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLCanvasElement>) => {
    if (event.key === '+' || event.key === '-') {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const mouseX = rect.width / 2;
      const mouseY = rect.height / 2;

      handleZoom(event.key === '+', mouseX, mouseY);
    }
  }, [handleZoom]);

  return (
    <canvas
      ref={canvasRef}
      width={dimensions.width}
      height={dimensions.height}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      className="w-full h-full block cursor-grab active:cursor-grabbing"
    />
  );
}
