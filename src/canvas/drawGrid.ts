import type { Camera, Viewport } from '../types/camera';
import type { CanvasTheme } from '../types/canvas';
import type { Grid } from '../types/grid';

// Below this many screen pixels per cell, grid lines obscure cells more than help.
const GRID_LINE_MIN_CELL_PX = 8;

export function drawGrid(
  ctx: CanvasRenderingContext2D,
  grid: Grid,
  camera: Camera,
  viewport: Viewport,
  theme: CanvasTheme,
  devicePixelRatio: number = 1,
): void {
  const dpr = devicePixelRatio;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.fillStyle = theme.background;
  ctx.fillRect(0, 0, viewport.width, viewport.height);

  ctx.setTransform(
    camera.z * dpr,
    0,
    0,
    camera.z * dpr,
    camera.x * camera.z * dpr,
    camera.y * camera.z * dpr,
  );

  if (camera.z >= GRID_LINE_MIN_CELL_PX) {
    drawGridLines(ctx, grid.size, camera.z, theme.grid);
  }

  ctx.fillStyle = theme.alive;
  for (let y = 0; y < grid.size; y++) {
    for (let x = 0; x < grid.size; x++) {
      if (grid.cells[y * grid.size + x] === 1) {
        ctx.fillRect(x, y, 1, 1);
      }
    }
  }
}

function drawGridLines(
  ctx: CanvasRenderingContext2D,
  size: number,
  zoom: number,
  color: string,
): void {
  ctx.strokeStyle = color;
  ctx.lineWidth = 1 / zoom; // 1 screen-pixel regardless of zoom
  ctx.beginPath();
  for (let i = 0; i <= size; i++) {
    ctx.moveTo(i, 0);
    ctx.lineTo(i, size);
    ctx.moveTo(0, i);
    ctx.lineTo(size, i);
  }
  ctx.stroke();
}
