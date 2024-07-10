// src/components/PixelAnimation.tsx

import React, { useEffect, useRef, useCallback } from 'react';
import { COLORS, PIXEL_SIZE, ANIMATION_DURATION, ROTATION_SPEED } from '@/constants/styles';

interface PixelAnimationProps {
  isAnimating: boolean;
  onAnimationComplete?: () => void;
}

type Pixel = [number, number, number];

/**
 * Generates a circular spiral of pixels.
 * @param centerX - The x-coordinate of the center.
 * @param centerY - The y-coordinate of the center.
 * @param maxRadius - The maximum radius of the spiral.
 * @returns An array of pixels representing the spiral.
 */
function generateCircularSpiral(centerX: number, centerY: number, maxRadius: number): Pixel[] {
  const pixels: Pixel[] = [];

  const addCirclePixels = (xc: number, yc: number, x: number, y: number, r: number): void => {
    pixels.push([xc+x, yc+y, r], [xc-x, yc+y, r], [xc+x, yc-y, r], [xc-x, yc-y, r],
                [xc+y, yc+x, r], [xc-y, yc+x, r], [xc+y, yc-x, r], [xc-y, yc-x, r]);
  };

  const drawCircle = (xc: number, yc: number, r: number): void => {
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
  };

  for (let r = 0; r <= maxRadius; r++) {
    drawCircle(centerX, centerY, r);
  }

  return pixels.sort((a, b) => a[2] - b[2]);
}

/**
 * Animates the pixels on the canvas.
 * @param ctx - The canvas rendering context.
 * @param pixels - The array of pixels to animate.
 * @param centerX - The x-coordinate of the center.
 * @param centerY - The y-coordinate of the center.
 * @param onComplete - Callback function to execute when animation completes.
 */
function animatePixels(ctx: CanvasRenderingContext2D, pixels: Pixel[], centerX: number, centerY: number, onComplete: () => void): void {
  const startTime = performance.now();

  const drawNextPixel = (currentTime: number): void => {
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
      ctx.fillStyle = COLORS[i % COLORS.length];
      ctx.fillRect(x * PIXEL_SIZE, y * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE);
    }

    ctx.restore();

    if (targetIndex < pixels.length && elapsedTime < ANIMATION_DURATION) {
      requestAnimationFrame(drawNextPixel);
    } else {
      onComplete();
    }
  };

  requestAnimationFrame(drawNextPixel);
}

/**
 * PixelAnimation component that displays an animated pixel spiral.
 * @param {PixelAnimationProps} props - The props for the PixelAnimation component.
 * @returns {JSX.Element} The rendered PixelAnimation component.
 */
export function PixelAnimation({ isAnimating, onAnimationComplete }: PixelAnimationProps): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const centerX = Math.floor(canvas.width / 2 / PIXEL_SIZE);
    const centerY = Math.floor(canvas.height / 2 / PIXEL_SIZE);
    const maxRadius = Math.ceil(Math.sqrt(centerX * centerX + centerY * centerY));

    const pixels = generateCircularSpiral(centerX, centerY, maxRadius);
    animatePixels(ctx, pixels, centerX, centerY, onAnimationComplete || (() => {}));
  }, [onAnimationComplete]);

  useEffect(() => {
    if (isAnimating) {
      animate();
    }
  }, [isAnimating, animate]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute top-0 left-0 w-full h-full ${isAnimating ? '' : 'hidden'}`}
    />
  );
}
