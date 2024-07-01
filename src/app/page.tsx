'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

const PIXEL_SIZE = 5;
const ANIMATION_DURATION = 2000;
const ROTATION_SPEED = Math.PI / 4;

export default function Home() {
  const [isAnimating, setIsAnimating] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const router = useRouter();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsAnimating(true);
    setTimeout(() => {
      setIsAnimating(false);
      router.push('/fhd');
    }, ANIMATION_DURATION);
  };

  useEffect(() => {
    if (isAnimating && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      const centerX = Math.floor(canvas.width / 2 / PIXEL_SIZE);
      const centerY = Math.floor(canvas.height / 2 / PIXEL_SIZE);
      const maxRadius = Math.ceil(Math.sqrt(centerX * centerX + centerY * centerY));

      const pixels = generateCircularSpiral(centerX, centerY, maxRadius);
      animatePixels(ctx, pixels, centerX, centerY);
    }
  }, [isAnimating]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white relative overflow-hidden">
      <a href="/fhd" onClick={handleClick}>
        <h1 className="text-[20rem] font-bold relative z-10 chiseled-text" data-text="PixelGrid">
          PixelGrid
        </h1>
      </a>
      <canvas
        ref={canvasRef}
        className={`absolute top-0 left-0 w-full h-full ${isAnimating ? '' : 'hidden'}`}
      />
    </main>
  );
}

function generateCircularSpiral(centerX: number, centerY: number, maxRadius: number): [number, number, number][] {
  const pixels: [number, number, number][] = [];

  function addCirclePixels(xc: number, yc: number, x: number, y: number, r: number) {
    pixels.push([xc+x, yc+y, r]);
    pixels.push([xc-x, yc+y, r]);
    pixels.push([xc+x, yc-y, r]);
    pixels.push([xc-x, yc-y, r]);
    pixels.push([xc+y, yc+x, r]);
    pixels.push([xc-y, yc+x, r]);
    pixels.push([xc+y, yc-x, r]);
    pixels.push([xc-y, yc-x, r]);
  }

  function drawCircle(xc: number, yc: number, r: number) {
    let x = 0;
    let y = r;
    let d = 3 - 2 * r;
    addCirclePixels(xc, yc, x, y, r);
    while (y >= x) {
      x++;
      if (d > 0) {
        y--;
        d = d + 4 * (x - y) + 10;
      } else {
        d = d + 4 * x + 6;
      }
      addCirclePixels(xc, yc, x, y, r);
    }
  }

  for (let r = 0; r <= maxRadius; r++) {
    drawCircle(centerX, centerY, r);
  }

  // Sort pixels from center outwards
  pixels.sort((a, b) => a[2] - b[2]);

  return pixels;
}

function animatePixels(ctx: CanvasRenderingContext2D, pixels: [number, number, number][], centerX: number, centerY: number) {
  const colors = ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#8B00FF', '#FFFFFF', '#000000'];
  const startTime = performance.now();
  let index = 0;

  function drawNextPixel(currentTime: number) {
    const elapsedTime = currentTime - startTime;
    const progress = elapsedTime / ANIMATION_DURATION;
    const rotation = progress * ROTATION_SPEED;
    
    const targetIndex = Math.min(Math.floor(progress * pixels.length), pixels.length);
    
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.save();
    ctx.translate(centerX * PIXEL_SIZE, centerY * PIXEL_SIZE);
    ctx.rotate(rotation);
    ctx.translate(-centerX * PIXEL_SIZE, -centerY * PIXEL_SIZE);

    for (let i = 0; i < targetIndex; i++) {
      const [x, y] = pixels[i];
      ctx.fillStyle = colors[i % colors.length];
      ctx.fillRect(x * PIXEL_SIZE, y * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE);
    }

    ctx.restore();

    index = targetIndex;

    if (index < pixels.length) {
      requestAnimationFrame(drawNextPixel);
    }
  }

  requestAnimationFrame(drawNextPixel);
}
