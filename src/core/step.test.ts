import { describe, expect, it } from 'vitest';
import type { Grid } from '../types/grid';
import { createGrid, setCell } from './grid';
import { step } from './step';

/** Build a grid by listing the live cell coordinates. */
function pattern(size: number, alive: Array<[x: number, y: number]>): Grid {
  const g = createGrid(size);
  for (const [x, y] of alive) setCell(g, x, y, 1);
  return g;
}

describe('step (B3/S23)', () => {
  it('turns a vertical blinker into a horizontal blinker', () => {
    const vertical = pattern(5, [
      [2, 1],
      [2, 2],
      [2, 3],
    ]);
    const horizontal = pattern(5, [
      [1, 2],
      [2, 2],
      [3, 2],
    ]);
    expect(step(vertical).cells).toEqual(horizontal.cells);
  });

  it('leaves a 2×2 block unchanged (still life)', () => {
    const block = pattern(5, [
      [1, 1],
      [2, 1],
      [1, 2],
      [2, 2],
    ]);
    expect(step(block).cells).toEqual(block.cells);
  });

  it('handles the 3×3 boundary: full-width blinker oscillates', () => {
    const horizontal = pattern(3, [
      [0, 1],
      [1, 1],
      [2, 1],
    ]);
    const vertical = pattern(3, [
      [1, 0],
      [1, 1],
      [1, 2],
    ]);
    expect(step(horizontal).cells).toEqual(vertical.cells);
    expect(step(vertical).cells).toEqual(horizontal.cells);
  });

  it('leaves an all-dead grid unchanged', () => {
    const empty = createGrid(10);
    expect(step(empty).cells).toEqual(empty.cells);
  });

  it('translates a glider by (+1, +1) every 4 generations', () => {
    let g = pattern(8, [
      [1, 0],
      [2, 1],
      [0, 2],
      [1, 2],
      [2, 2],
    ]);
    for (let i = 0; i < 4; i++) g = step(g);
    const shifted = pattern(8, [
      [2, 1],
      [3, 2],
      [1, 3],
      [2, 3],
      [3, 3],
    ]);
    expect(g.cells).toEqual(shifted.cells);
  });
});
