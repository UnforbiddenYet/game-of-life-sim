import type { Grid } from '../types/grid';
import type { GameSnapshot, SerializedGame } from '../types/serialize';
import { MAX_SIZE, MIN_SIZE, createGrid, setCell } from './grid';

export function toJSON(grid: Grid, generation: number): SerializedGame {
  const { size } = grid;
  const cells: Array<[number, number]> = [];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (grid.cells[y * size + x] === 1) cells.push([x, y]);
    }
  }
  return {
    version: 1,
    size,
    generation,
    colorized: false,
    cells,
  };
}

export function fromJSON(raw: unknown): GameSnapshot {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
    throw new Error('Expected a JSON object');
  }
  const data = raw as Record<string, unknown>;

  if (data.version !== 1) {
    throw new Error(
      `Unsupported or missing version (expected 1, got ${String(data.version)})`,
    );
  }

  const size = data.size;
  if (
    typeof size !== 'number' ||
    !Number.isInteger(size) ||
    size < MIN_SIZE ||
    size > MAX_SIZE
  ) {
    throw new Error(
      `size must be an integer in [${MIN_SIZE}, ${MAX_SIZE}], got ${String(size)}`,
    );
  }

  const generation = data.generation;
  if (
    typeof generation !== 'number' ||
    !Number.isInteger(generation) ||
    generation < 0
  ) {
    throw new Error(`generation must be a non-negative integer, got ${String(generation)}`);
  }

  const cells = data.cells;
  if (!Array.isArray(cells)) {
    throw new Error('cells must be an array');
  }

  const grid = createGrid(size);
  for (let i = 0; i < cells.length; i++) {
    const entry = cells[i];
    if (!Array.isArray(entry) || entry.length < 2) {
      throw new Error(`cells[${i}] must be a [x, y] tuple`);
    }
    const [x, y] = entry;
    if (
      typeof x !== 'number' ||
      typeof y !== 'number' ||
      !Number.isInteger(x) ||
      !Number.isInteger(y) ||
      x < 0 ||
      x >= size ||
      y < 0 ||
      y >= size
    ) {
      throw new Error(
        `cells[${i}] = (${String(x)}, ${String(y)}) is out of range for size ${size}`,
      );
    }
    setCell(grid, x, y, 1);
  }

  return { size, generation, grid };
}
