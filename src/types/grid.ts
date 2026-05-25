/**
 * A square Game-of-Life grid backed by a flat row-major `Uint8Array`.
 * `cells[y * size + x] === 1` means the cell at (x, y) is alive.
 *
 * Flat typed-array storage keeps 1000×1000 grids tractable: cheap to clone,
 * cache-friendly to iterate, no per-cell object allocation.
 */
export interface Grid {
  readonly size: number;
  readonly cells: Uint8Array;
}
