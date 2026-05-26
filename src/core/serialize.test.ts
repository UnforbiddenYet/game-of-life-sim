import { describe, expect, it } from 'vitest';
import { setCell } from './grid';
import { toJSON } from './serialize';
import { initialState } from '../state/reducer';

describe('toJSON', () => {
  it('encodes a paused empty game with no alive cells', () => {
    const s = initialState(5);
    expect(toJSON(s)).toEqual({
      version: 1,
      size: 5,
      generation: 0,
      colorized: false,
      cells: [],
    });
  });

  it('lists only alive cells, sparsely', () => {
    const s = initialState(5);
    setCell(s.grid, 0, 0, 1);
    setCell(s.grid, 4, 4, 1);
    setCell(s.grid, 2, 3, 1);

    const json = toJSON(s);
    expect(json.cells).toHaveLength(3);
    expect(new Set(json.cells.map(([x, y]) => `${x},${y}`))).toEqual(
      new Set(['0,0', '4,4', '2,3']),
    );
  });
});
