import { profile } from "../canvas/profile";
import type { Grid } from "../types/grid";
import { createGrid } from "./grid";

export function step(prev: Grid): Grid {
  return profile("step", () => {
    const out = createGrid(prev.size);
    stepInto(prev, out);
    return out;
  });
}

export function stepInto(prev: Grid, out: Grid): void {
  const size = prev.size;
  const cells = prev.cells;
  const outCells = out.cells;
  const last = size - 1;

  for (let y = 0; y < size; y++) {
    const above = y > 0 ? (y - 1) * size : -1;
    const here = y * size;
    const below = y < last ? (y + 1) * size : -1;
    for (let x = 0; x < size; x++) {
      const hasLeft = x > 0;
      const hasRight = x < last;
      const xL = x - 1;
      const xR = x + 1;
      let n = 0;
      if (above >= 0) {
        if (hasLeft) n += cells[above + xL] ?? 0;
        n += cells[above + x] ?? 0;
        if (hasRight) n += cells[above + xR] ?? 0;
      }
      if (hasLeft) n += cells[here + xL] ?? 0;
      if (hasRight) n += cells[here + xR] ?? 0;
      if (below >= 0) {
        if (hasLeft) n += cells[below + xL] ?? 0;
        n += cells[below + x] ?? 0;
        if (hasRight) n += cells[below + xR] ?? 0;
      }
      const idx = here + x;
      const alive = cells[idx] === 1;
      outCells[idx] = (alive ? n === 2 || n === 3 : n === 3) ? 1 : 0;
    }
  }
}
