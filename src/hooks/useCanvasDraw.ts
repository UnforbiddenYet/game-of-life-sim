import { useEffect, type RefObject } from 'react';
import { drawGrid } from '../canvas/drawGrid';
import { profile } from '../canvas/profile';
import type { Camera } from '../types/camera';
import type { CanvasTheme } from '../types/canvas';
import type { Grid } from '../types/grid';

interface Args {
  ref: RefObject<HTMLCanvasElement | null>;
  grid: Grid;
  camera: Camera;
  width: number;
  height: number;
  theme: CanvasTheme;
}

export function useCanvasDraw({
  ref,
  grid,
  camera,
  width,
  height,
  theme,
}: Args): void {
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    // Buffer at devicePixelRatio for retina sharpness; CSS size stays nominal.
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    profile('drawGrid', () =>
      drawGrid(ctx, grid, camera, { width, height }, theme, dpr),
    );
  }, [ref, grid, camera, width, height, theme]);
}
