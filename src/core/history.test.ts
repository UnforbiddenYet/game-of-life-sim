import { describe, expect, it } from 'vitest';
import { createGrid } from './grid';
import { historyCap, pushBounded } from './history';
import type { HistoryFrame } from '../types/game';

function frame(generation: number): HistoryFrame {
  return { generation, grid: createGrid(3) };
}

describe('historyCap', () => {
  it.each([
    [3, 500],
    [100, 500],
    [101, 100],
    [300, 100],
    [301, 20],
    [1000, 20],
  ])('size %i → cap %i', (size, cap) => {
    expect(historyCap(size)).toBe(cap);
  });
});

describe('pushBounded', () => {
  it('appends when below the cap', () => {
    const out = pushBounded([frame(1), frame(2)], frame(3), 1000);
    expect(out.map((f) => f.generation)).toEqual([1, 2, 3]);
  });

  it('evicts the oldest frame when pushing at the cap', () => {
    const initial: HistoryFrame[] = Array.from({ length: 20 }, (_, i) =>
      frame(i),
    );
    const out = pushBounded(initial, frame(99), 1000);

    expect(out).toHaveLength(20);
    expect(out[0]?.generation).toBe(1);
    expect(out[out.length - 1]?.generation).toBe(99);
  });
});
