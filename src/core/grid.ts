import type { Grid } from '../types/grid';

export const MIN_SIZE = 3;
export const MAX_SIZE = 1000;

export function createGrid(size: number): Grid {
  if (!Number.isInteger(size) || size < MIN_SIZE || size > MAX_SIZE) {
    throw new RangeError(
      `Grid size must be an integer in [${MIN_SIZE}, ${MAX_SIZE}], got ${size}`,
    );
  }
  return { size, cells: new Uint8Array(size * size) };
}

export function cloneGrid(g: Grid): Grid {
  return { size: g.size, cells: new Uint8Array(g.cells) };
}

export function randomGrid(
  size: number,
  density: number,
  rng: () => number = Math.random,
): Grid {
  const g = createGrid(size);
  for (let i = 0; i < g.cells.length; i++) {
    g.cells[i] = rng() < density ? 1 : 0;
  }
  return g;
}

export function inBounds(size: number, x: number, y: number): boolean {
  return x >= 0 && x < size && y >= 0 && y < size;
}

export function setCell(g: Grid, x: number, y: number, alive: 0 | 1): void {
  if (inBounds(g.size, x, y)) {
    g.cells[y * g.size + x] = alive;
  }
}

export function getCell(g: Grid, x: number, y: number): 0 | 1 {
  if (!inBounds(g.size, x, y)) return 0;
  return g.cells[y * g.size + x] === 1 ? 1 : 0;
}

export function aliveCount(g: Grid): number {
  let n = 0;
  for (let i = 0; i < g.cells.length; i++) {
    if (g.cells[i] === 1) n++;
  }
  return n;
}
