'use client';

import { useRef, useEffect } from 'react';

// Define props types for TypeScript
interface NoiseProps {
  patternSize?: number;
  patternScaleX?: number;
  patternScaleY?: number;
  patternRefreshInterval?: number;
  patternAlpha?: number;
  tint?: string; // <-- 1. Added tint prop
}

// Helper to parse the tint color
const parseColor = (color: string): [number, number, number] => {
  if (color.startsWith('rgba')) {
    const [r, g, b] = color.match(/\d+/g)?.map(Number) || [0, 0, 0];
    return [r, g, b];
  }
  // Basic hex parsing (incomplete, but fine for this_
  if (color.startsWith('#')) {
    const r = parseInt(color.substring(1, 3), 16);
    const g = parseInt(color.substring(3, 5), 16);
    const b = parseInt(color.substring(5, 7), 16);
    return [r, g, b];
  }
  // Default to black
  return [0, 0, 0];
};


const Noise = ({
  patternSize = 250,
  patternScaleX = 1,
  patternScaleY = 1,
  patternRefreshInterval = 2,
  patternAlpha = 15,
  tint = 'rgba(0,0,0,0.1)', // Default tint
}: NoiseProps) => {
  const grainRef = useRef<HTMLCanvasElement>(null);
  const tintRGB = parseColor(tint); // Parse the tint color once

  useEffect(() => {
    const canvas = grainRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let frame = 0;
    let animationId: number;
    const canvasSize = 250;

    const resize = () => {
      if (!canvas) return;
      canvas.width = canvasSize;
      canvas.height = canvasSize;
      canvas.style.width = '100vw';
      canvas.style.height = '100vh';
    };

    const drawGrain = () => {
      const imageData = ctx.createImageData(canvasSize, canvasSize);
      const data = imageData.data;
      const [r, g, b] = tintRGB; // <-- 2. Use the parsed tint color

      for (let i = 0; i < data.length; i += 4) {
        const value = (Math.random() * 255) / 255; // Noise value 0-1
        
        // --- 3. Apply tint instead of just greyscale ---
        data[i] = value * r;     // Red
        data[i + 1] = value * g; // Green
        data[i + 2] = value * b; // Blue
        data[i + 3] = patternAlpha; // Alpha
      }

      ctx.putImageData(imageData, 0, 0);
    };

    const loop = () => {
      if (frame % patternRefreshInterval === 0) {
        drawGrain();
      }
      frame++;
      animationId = window.requestAnimationFrame(loop);
    };

    window.addEventListener('resize', resize);
    resize();
    loop();

    return () => {
      window.removeEventListener('resize', resize);
      window.cancelAnimationFrame(animationId);
    };
    // Re-run effect if tint changes
  }, [patternSize, patternScaleX, patternScaleY, patternRefreshInterval, patternAlpha, tintRGB]); 

  return (
    <canvas
      className="pointer-events-none absolute inset-0 w-full h-full"
      ref={grainRef}
      style={{ imageRendering: 'pixelated' }}
    />
  );
};

export default Noise;

