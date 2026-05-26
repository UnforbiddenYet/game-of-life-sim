import { describe, expect, it } from 'vitest';
import { getCell, setCell } from './grid';
import { fromJSON, toJSON } from './serialize';
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

describe('fromJSON', () => {
  it('round-trips a serialized game back to the same alive cells', () => {
    const s = initialState(7);
    setCell(s.grid, 0, 0, 1);
    setCell(s.grid, 6, 6, 1);
    setCell(s.grid, 3, 4, 1);

    const decoded = fromJSON(JSON.parse(JSON.stringify(toJSON(s))));

    expect(decoded.size).toBe(7);
    expect(decoded.generation).toBe(0);
    expect(getCell(decoded.grid, 0, 0)).toBe(1);
    expect(getCell(decoded.grid, 6, 6)).toBe(1);
    expect(getCell(decoded.grid, 3, 4)).toBe(1);
    expect(getCell(decoded.grid, 1, 1)).toBe(0);
  });

  it('rejects payloads missing the version field', () => {
    expect(() =>
      fromJSON({ size: 5, generation: 0, cells: [] }),
    ).toThrow(/version/);
  });

  it('rejects payloads with an unsupported version', () => {
    expect(() =>
      fromJSON({ version: 2, size: 5, generation: 0, cells: [] }),
    ).toThrow(/version/);
  });

  it('rejects non-object payloads (string, number, null)', () => {
    expect(() => fromJSON('not an object')).toThrow();
    expect(() => fromJSON(42)).toThrow();
    expect(() => fromJSON(null)).toThrow();
  });

  it('rejects sizes outside [3, 1000] or non-integer', () => {
    const base = { version: 1, generation: 0, cells: [] as const };
    expect(() => fromJSON({ ...base, size: 2 })).toThrow();
    expect(() => fromJSON({ ...base, size: 1001 })).toThrow();
    expect(() => fromJSON({ ...base, size: 3.5 })).toThrow();
  });

  it('rejects cells with out-of-range or non-integer coordinates', () => {
    const base = { version: 1, size: 5, generation: 0 };
    expect(() => fromJSON({ ...base, cells: [[5, 0]] })).toThrow();
    expect(() => fromJSON({ ...base, cells: [[-1, 0]] })).toThrow();
    expect(() => fromJSON({ ...base, cells: [[0, 1.5]] })).toThrow();
  });

  it('rejects non-integer or negative generation', () => {
    const base = { version: 1, size: 5, cells: [] as const };
    expect(() => fromJSON({ ...base, generation: -1 })).toThrow();
    expect(() => fromJSON({ ...base, generation: 1.5 })).toThrow();
  });

  it('rejects a non-array cells field', () => {
    expect(() =>
      fromJSON({ version: 1, size: 5, generation: 0, cells: 'nope' }),
    ).toThrow();
  });
});
