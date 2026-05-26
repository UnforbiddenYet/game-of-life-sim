import type { GameState } from '../types/game';
import type { SerializedGame } from '../types/serialize';

export function toJSON(state: GameState): SerializedGame {
  const { grid, size, generation } = state;
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
