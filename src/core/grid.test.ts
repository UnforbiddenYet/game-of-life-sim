import { describe, expect, it } from 'vitest';
import {
  cloneGrid,
  createGrid,
  aliveCount,
  getCell,
  randomGrid,
  setCell,
} from './grid';

describe('createGrid', () => {
  it('creates an N×N grid with every cell dead', () => {
    const g = createGrid(10);
    expect(g.size).toBe(10);
    expect(g.cells.length).toBe(100);
    expect(aliveCount(g)).toBe(0);
  });

  it.each([2, 1001, 0, -5, 3.5, NaN])(
    'rejects size %s as outside [3, 1000] or non-integer',
    (size) => {
      expect(() => createGrid(size)).toThrow(RangeError);
    },
  );

  it.each([3, 1000])('accepts the boundary size %s', (size) => {
    expect(() => createGrid(size)).not.toThrow();
  });
});

describe('setCell / getCell', () => {
  it('round-trips a written value', () => {
    const g = createGrid(5);
    setCell(g, 3, 4, 1);
    expect(getCell(g, 3, 4)).toBe(1);
  });

  it.each([
    [-1, 0],
    [5, 0],
    [0, -1],
    [0, 5],
    [-1, -1],
    [99, 99],
  ])('treats out-of-bounds (%i, %i) reads as dead', (x, y) => {
    const g = createGrid(5);
    // fill the grid so a wrap-around bug would surface
    g.cells.fill(1);
    expect(getCell(g, x, y)).toBe(0);
  });

  it('silently ignores out-of-bounds writes', () => {
    const g = createGrid(5);
    setCell(g, -1, 0, 1);
    setCell(g, 5, 0, 1);
    setCell(g, 0, -1, 1);
    setCell(g, 0, 5, 1);
    expect(aliveCount(g)).toBe(0);
  });
});

describe('cloneGrid', () => {
  it('produces an independent copy: mutating the clone does not affect the original', () => {
    const original = createGrid(5);
    setCell(original, 1, 1, 1);
    const copy = cloneGrid(original);
    setCell(copy, 2, 2, 1);
    expect(getCell(original, 2, 2)).toBe(0);
    expect(getCell(copy, 1, 1)).toBe(1);
  });
});

describe('randomGrid', () => {
  it('produces an all-dead grid at density 0', () => {
    expect(aliveCount(randomGrid(10, 0))).toBe(0);
  });

  it('produces an all-alive grid at density 1', () => {
    expect(aliveCount(randomGrid(10, 1))).toBe(100);
  });

  it('uses the supplied RNG so results are reproducible in tests', () => {
    const constant = (): number => 0.1;
    expect(aliveCount(randomGrid(5, 0.5, constant))).toBe(25);
    expect(aliveCount(randomGrid(5, 0.05, constant))).toBe(0);
  });
});
