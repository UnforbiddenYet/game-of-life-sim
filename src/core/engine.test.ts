import { describe, expect, it } from 'vitest';
import { createEngine } from './engine';
import { setCell } from './grid';

describe('createEngine', () => {
  it('starts with an empty grid at generation 0', () => {
    const engine = createEngine(5);
    expect(engine.current.size).toBe(5);
    expect(Array.from(engine.current.cells)).toEqual(new Array(25).fill(0));
    expect(engine.generation).toBe(0);
  });

  it('step() reuses two grid buffers instead of allocating each tick', () => {
    const engine = createEngine(5);
    const a = engine.current;
    engine.step();
    const b = engine.current;
    engine.step();
    const c = engine.current;
    expect(b).not.toBe(a);
    expect(c).toBe(a);
  });

  it('setCell writes to the current grid', () => {
    const engine = createEngine(5);
    engine.setCell(2, 3, 1);
    expect(engine.current.cells[3 * 5 + 2]).toBe(1);
    engine.setCell(2, 3, 0);
    expect(engine.current.cells[3 * 5 + 2]).toBe(0);
  });

  it('clear resets the grid and generation', () => {
    const engine = createEngine(5);
    engine.setCell(2, 2, 1);
    engine.step();
    engine.clear();
    expect(engine.generation).toBe(0);
    expect(Array.from(engine.current.cells).every((c) => c === 0)).toBe(true);
  });

  it('randomize fills the grid using the rng and resets generation', () => {
    const engine = createEngine(4);
    engine.step();
    expect(engine.generation).toBe(1);

    const seq = [0.1, 0.9, 0.4, 0.6, 0.05, 0.7, 0.2, 0.8, 0.3, 0.95, 0.4, 0.6, 0.5, 0.49, 0.51, 0.45];
    let i = 0;
    const rng = () => seq[i++]!;

    engine.randomize(0.5, rng);

    expect(engine.generation).toBe(0);
    expect(Array.from(engine.current.cells)).toEqual([
      1, 0, 1, 0,
      1, 0, 1, 0,
      1, 0, 1, 0,
      0, 1, 0, 1,
    ]);
  });

  it('step() snapshots the prior state into past', () => {
    const engine = createEngine(5);
    engine.setCell(2, 2, 1);
    engine.step();
    expect(engine.past).toHaveLength(1);
    expect(engine.past[0]!.generation).toBe(0);
    expect(engine.past[0]!.grid.cells[2 * 5 + 2]).toBe(1);
  });

  it('undo restores the previous frame and pops past', () => {
    const engine = createEngine(5);
    engine.setCell(2, 1, 1);
    engine.setCell(2, 2, 1);
    engine.setCell(2, 3, 1);
    engine.step();

    expect(engine.undo()).toBe(true);
    expect(engine.generation).toBe(0);
    expect(engine.past).toHaveLength(0);
    expect(engine.current.cells[1 * 5 + 2]).toBe(1);
    expect(engine.current.cells[2 * 5 + 2]).toBe(1);
    expect(engine.current.cells[3 * 5 + 2]).toBe(1);
  });

  it('undo returns false when past is empty', () => {
    const engine = createEngine(5);
    expect(engine.undo()).toBe(false);
  });

  it('checkpoint pushes the current state onto past', () => {
    const engine = createEngine(5);
    engine.setCell(0, 0, 1);
    engine.checkpoint();
    engine.setCell(0, 0, 0);
    engine.undo();
    expect(engine.current.cells[0]).toBe(1);
  });

  it('clear and randomize wipe past', () => {
    const engine = createEngine(5);
    engine.setCell(2, 2, 1);
    engine.step();
    engine.clear();
    expect(engine.past).toHaveLength(0);

    engine.setCell(2, 2, 1);
    engine.step();
    engine.randomize(0, () => 1);
    expect(engine.past).toHaveLength(0);
  });

  it('mutations mark the engine dirty; consumeDirty resets the flag', () => {
    const engine = createEngine(5);
    expect(engine.consumeDirty()).toBe(true);
    expect(engine.consumeDirty()).toBe(false);

    engine.setCell(0, 0, 1);
    expect(engine.consumeDirty()).toBe(true);

    engine.step();
    expect(engine.consumeDirty()).toBe(true);

    engine.clear();
    expect(engine.consumeDirty()).toBe(true);

    engine.randomize(0.5, () => 0);
    expect(engine.consumeDirty()).toBe(true);

    engine.undo();
    expect(engine.consumeDirty()).toBe(false);
  });

  it('step() turns a vertical blinker on its side', () => {
    const engine = createEngine(5);
    setCell(engine.current, 2, 1, 1);
    setCell(engine.current, 2, 2, 1);
    setCell(engine.current, 2, 3, 1);

    engine.step();

    expect(engine.generation).toBe(1);
    const live = Array.from(engine.current.cells)
      .map((v, i) => (v === 1 ? [i % 5, Math.floor(i / 5)] : null))
      .filter((p): p is number[] => p !== null);
    expect(live).toEqual([
      [1, 2],
      [2, 2],
      [3, 2],
    ]);
  });
});
