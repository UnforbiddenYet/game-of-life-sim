import type { Camera, Viewport } from "../types/camera";
import type { CanvasTheme } from "../types/canvas";
import type { Grid } from "../types/grid";

// Below this many screen pixels per cell, grid lines obscure cells more than help.
const GRID_LINE_MIN_CELL_PX = 8;
// Below this many screen pixels per cell, rounded corners are invisible.
const ROUNDED_CELL_MIN_PX = 8;

interface OffscreenCache {
  size: number;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  data: ImageData;
  buf32: Uint32Array;
}

let cache: OffscreenCache | null = null;

function ensureOffscreen(size: number): OffscreenCache {
  if (cache && cache.size === size) return cache;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("offscreen 2d context unavailable");
  const data = ctx.createImageData(size, size);
  const buf32 = new Uint32Array(data.data.buffer);
  cache = { size, canvas, ctx, data, buf32 };
  return cache;
}

function hexToPackedRgba(hex: string): number {
  let h = hex.startsWith("#") ? hex.slice(1) : hex;
  if (h.length === 3) {
    h =
      h.charAt(0) +
      h.charAt(0) +
      h.charAt(1) +
      h.charAt(1) +
      h.charAt(2) +
      h.charAt(2);
  }
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  const a = h.length === 8 ? parseInt(h.slice(6, 8), 16) : 255;
  return (
    ((a & 0xff) << 24) | ((b & 0xff) << 16) | ((g & 0xff) << 8) | (r & 0xff)
  );
}

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

  if (camera.z >= ROUNDED_CELL_MIN_PX) {
    drawRoundedCells(ctx, grid, camera, viewport, theme);
  } else {
    drawCellsViaImageData(ctx, grid, theme);
  }
}

function drawRoundedCells(
  ctx: CanvasRenderingContext2D,
  grid: Grid,
  camera: Camera,
  viewport: Viewport,
  theme: CanvasTheme,
): void {
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
  ctx.fillStyle = theme.alive;
  const inset = 0.08;
  const size = 1 - inset * 2;
  const radius = 0.2;
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

function drawCellsViaImageData(
  ctx: CanvasRenderingContext2D,
  grid: Grid,
  theme: CanvasTheme,
): void {
  const off = ensureOffscreen(grid.size);
  const bgPacked = hexToPackedRgba(theme.background);
  const alivePacked = hexToPackedRgba(theme.alive);
  off.buf32.fill(bgPacked);
  const cells = grid.cells;
  for (let i = 0; i < cells.length; i++) {
    if (cells[i] === 1) off.buf32[i] = alivePacked;
  }
  off.ctx.putImageData(off.data, 0, 0);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(off.canvas, 0, 0);
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
