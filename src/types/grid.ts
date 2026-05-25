export interface Grid {
  readonly size: number;
  // row-major: cells[y * size + x] === 1 ⇔ (x, y) alive
  readonly cells: Uint8Array;
}
