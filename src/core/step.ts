import { profile } from '../canvas/profile';
import type { Grid } from '../types/grid';
import { createGrid } from './grid';

function countNeighbours(g: Grid, x: number, y: number): number {
  const { size, cells } = g;
  let n = 0;
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (dx === 0 && dy === 0) continue;
      const nx = x + dx;
      const ny = y + dy;
      if (nx >= 0 && nx < size && ny >= 0 && ny < size) {
        if (cells[ny * size + nx] === 1) n++;
      }
    }
  }
  return n;
}

export function step(prev: Grid): Grid {
  return profile('step', () => stepImpl(prev));
}

function stepImpl(prev: Grid): Grid {
  const { size, cells } = prev;
  const out = createGrid(size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const n = countNeighbours(prev, x, y);
      const alive = cells[y * size + x] === 1;
      out.cells[y * size + x] = (alive ? n === 2 || n === 3 : n === 3) ? 1 : 0;
    }
  }
  return out;
}
