import type { Camera, Viewport } from "../types/camera";
import type { CanvasTheme } from "../types/canvas";
import type { Grid } from "../types/grid";

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
  const inset = 0.08;
  const size = 1 - inset * 2;
  const radius = 0.2;
  const xMin = Math.max(0, Math.floor(-camera.x));
  const yMin = Math.max(0, Math.floor(-camera.y));
  const xMax = Math.min(
    grid.size - 1,
    Math.ceil(-camera.x + viewport.width / camera.z) - 1,
  );
  const yMax = Math.min(
    grid.size - 1,
    Math.ceil(-camera.y + viewport.height / camera.z) - 1,
  );
  ctx.beginPath();
  for (let y = yMin; y <= yMax; y++) {
    const row = y * grid.size;
    for (let x = xMin; x <= xMax; x++) {
      if (grid.cells[row + x] === 1) {
        ctx.roundRect(x + inset, y + inset, size, size, radius);
      }
    }
  }
  ctx.fill();
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
