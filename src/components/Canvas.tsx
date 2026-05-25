import { useEffect, useRef } from 'react';
import { drawGrid } from '../canvas/drawGrid';
import { fitCamera } from '../core/camera';
import { useGameState } from '../state/hooks';
import type { CanvasTheme } from '../types/canvas';

const DEFAULT_THEME: CanvasTheme = {
  background: '#0b0d10',
  grid: '#1f242b',
  alive: '#e8edf2',
};

export interface CanvasProps {
  width: number;
  height: number;
  theme?: CanvasTheme;
}

export function Canvas({ width, height, theme = DEFAULT_THEME }: CanvasProps) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const { grid, size } = useGameState();

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const camera = fitCamera(size, { width, height });
    drawGrid(ctx, grid, camera, { width, height }, theme);
  }, [grid, size, width, height, theme]);

  return <canvas ref={ref} width={width} height={height} />;
}
