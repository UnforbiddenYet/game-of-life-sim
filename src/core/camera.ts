import type { Camera, Point, Viewport } from '../types/camera';

const DEFAULT_MARGIN_RATIO = 0.04;

export function screenToCanvas(p: Point, c: Camera): Point {
  return { x: p.x / c.z - c.x, y: p.y / c.z - c.y };
}

export function canvasToScreen(p: Point, c: Camera): Point {
  return { x: (p.x + c.x) * c.z, y: (p.y + c.y) * c.z };
}

export function panCamera(c: Camera, dx: number, dy: number): Camera {
  return { x: c.x + dx, y: c.y + dy, z: c.z };
}

export function zoomCamera(c: Camera, cursor: Point, dz: number): Camera {
  const z = c.z - dz * c.z;
  const p1 = screenToCanvas(cursor, c);
  const p2 = screenToCanvas(cursor, { x: c.x, y: c.y, z });
  return { x: c.x + (p2.x - p1.x), y: c.y + (p2.y - p1.y), z };
}

export function fitCamera(
  gridSize: number,
  viewport: Viewport,
  marginRatio: number = DEFAULT_MARGIN_RATIO,
): Camera {
  const z = pickZoomThatFits(gridSize, viewport, marginRatio);
  return centerGridInViewport(gridSize, viewport, z);
}

function pickZoomThatFits(
  gridSize: number,
  viewport: Viewport,
  marginRatio: number,
): number {
  const tightFit = Math.min(
    viewport.width / gridSize,
    viewport.height / gridSize,
  );
  return tightFit * (1 - 2 * marginRatio);
}

function centerGridInViewport(
  gridSize: number,
  viewport: Viewport,
  z: number,
): Camera {
  const gridScreenSize = gridSize * z;
  const padX = (viewport.width - gridScreenSize) / 2;
  const padY = (viewport.height - gridScreenSize) / 2;
  // canvasToScreen((0,0), c) = (c.x*z, c.y*z), so to place the grid's
  // top-left at (padX, padY) on screen we need c.x = padX/z, c.y = padY/z.
  return { x: padX / z, y: padY / z, z };
}
