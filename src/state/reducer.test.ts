import { describe, expect, it } from "vitest";
import { aliveCount, createGrid, getCell, setCell } from "../core/grid";
import * as Actions from "./actions";
import { initialState, reducer } from "./reducer";

describe("initialState", () => {
  it("produces a paused, generation-0 game at the requested size with an empty grid", () => {
    const s = initialState(20);
    expect(s.size).toBe(20);
    expect(s.grid.size).toBe(20);
    expect(aliveCount(s.grid)).toBe(0);
    expect(s.mode).toBe("paused");
    expect(s.generation).toBe(0);
  });
});

describe("reducer", () => {
  it("starts with empty history", () => {
    const s = initialState(5);
    expect(s.past).toEqual([]);
  });

  it("STEP pushes the prior frame onto past", () => {
    const s0 = initialState(5);
    setCell(s0.grid, 2, 1, 1);
    setCell(s0.grid, 2, 2, 1);
    setCell(s0.grid, 2, 3, 1);

    const s1 = reducer(s0, Actions.step());

    expect(s1.past).toHaveLength(1);
    expect(s1.past[0]?.generation).toBe(0);
    expect(s1.past[0]?.grid.cells).toEqual(s0.grid.cells);
  });

  it("STEP advances one generation and rewrites the grid", () => {
    const s0 = initialState(5);
    // vertical blinker
    setCell(s0.grid, 2, 1, 1);
    setCell(s0.grid, 2, 2, 1);
    setCell(s0.grid, 2, 3, 1);

    const s1 = reducer(s0, Actions.step());

    expect(s1.generation).toBe(1);
    // now horizontal blinker
    expect(getCell(s1.grid, 1, 2)).toBe(1);
    expect(getCell(s1.grid, 2, 2)).toBe(1);
    expect(getCell(s1.grid, 3, 2)).toBe(1);
    expect(aliveCount(s1.grid)).toBe(3);
  });

  it("UNDO on empty past is a no-op", () => {
    const s0 = initialState(5);
    const s1 = reducer(s0, Actions.undo());
    expect(s1).toBe(s0);
  });

  it("UNDO after STEP restores the prior grid and generation", () => {
    let s = initialState(5);
    setCell(s.grid, 2, 1, 1);
    setCell(s.grid, 2, 2, 1);
    setCell(s.grid, 2, 3, 1);
    const before = new Uint8Array(s.grid.cells);

    s = reducer(s, Actions.step());
    s = reducer(s, Actions.undo());

    expect(s.generation).toBe(0);
    expect(s.grid.cells).toEqual(before);
    expect(s.past).toHaveLength(0);
  });

  it("STEP then UNDO then STEP recomputes the next gen byte-identically", () => {
    let s = initialState(5);
    setCell(s.grid, 2, 1, 1);
    setCell(s.grid, 2, 2, 1);
    setCell(s.grid, 2, 3, 1);
    s = reducer(s, Actions.step());
    const afterStep = new Uint8Array(s.grid.cells);
    const afterGen = s.generation;

    s = reducer(s, Actions.undo());
    s = reducer(s, Actions.step());

    expect(s.generation).toBe(afterGen);
    expect(s.grid.cells).toEqual(afterStep);
  });

  it("SET_CELL does not touch history", () => {
    let s = initialState(5);
    s = reducer(s, Actions.step());
    const pastLen = s.past.length;

    s = reducer(s, Actions.setCell(2, 2, 1));

    expect(s.past).toHaveLength(pastLen);
  });

  it("CLEAR clears history", () => {
    let s = initialState(5);
    s = reducer(s, Actions.step());
    expect(s.past.length).toBeGreaterThan(0);

    s = reducer(s, Actions.clear());
    expect(s.past).toEqual([]);
  });

  it("RANDOMIZE clears history", () => {
    let s = initialState(5);
    s = reducer(s, Actions.step());

    s = reducer(s, Actions.randomize(0));
    expect(s.past).toEqual([]);
  });

  it("IMPORT clears history", () => {
    let s = initialState(5);
    s = reducer(s, Actions.step());

    s = reducer(
      s,
      Actions.importSnapshot({ size: 5, generation: 0, grid: s.grid }),
    );
    expect(s.past).toEqual([]);
  });

  it("PLAY transitions mode to playing", () => {
    const s = reducer(initialState(5), Actions.play());
    expect(s.mode).toBe("playing");
  });

  it("PAUSE transitions mode back to paused", () => {
    const playing = reducer(initialState(5), Actions.play());
    const paused = reducer(playing, Actions.pause());
    expect(paused.mode).toBe("paused");
  });

  it("SET_CELL writes the given alive value at (x, y)", () => {
    const s0 = initialState(5);
    const s1 = reducer(s0, Actions.setCell(2, 3, 1));
    expect(getCell(s1.grid, 2, 3)).toBe(1);
    const s2 = reducer(s1, Actions.setCell(2, 3, 0));
    expect(getCell(s2.grid, 2, 3)).toBe(0);
  });

  it("CLEAR zeroes the grid and resets generation", () => {
    let s = initialState(5);
    s = reducer(s, Actions.setCell(1, 1, 1));
    s = reducer(s, Actions.step());
    expect(s.generation).toBe(1);

    const cleared = reducer(s, Actions.clear());
    expect(aliveCount(cleared.grid)).toBe(0);
    expect(cleared.generation).toBe(0);
    expect(cleared.size).toBe(5);
  });

  it("RANDOMIZE fills the grid by density and resets generation", () => {
    let s = initialState(10);
    s = reducer(s, Actions.step());
    expect(s.generation).toBe(1);
    const full = reducer(s, Actions.randomize(1));
    expect(aliveCount(full.grid)).toBe(100);
    expect(full.generation).toBe(0);
  });

  it("SET_SPEED clamps to [1, 60]", () => {
    const s0 = initialState(5);
    expect(reducer(s0, Actions.setSpeed(25)).stepsPerSecond).toBe(25);
    expect(reducer(s0, Actions.setSpeed(0)).stepsPerSecond).toBe(1);
    expect(reducer(s0, Actions.setSpeed(999)).stepsPerSecond).toBe(60);
  });

  it("IMPORT replaces grid, size, generation; pauses; preserves speed", () => {
    let s = initialState(5);
    s = reducer(s, Actions.setSpeed(20));
    s = reducer(s, Actions.play());

    const snapshotGrid = createGrid(8);
    setCell(snapshotGrid, 1, 1, 1);
    setCell(snapshotGrid, 7, 7, 1);
    const next = reducer(
      s,
      Actions.importSnapshot({ size: 8, generation: 42, grid: snapshotGrid }),
    );

    expect(next.size).toBe(8);
    expect(next.grid.size).toBe(8);
    expect(next.generation).toBe(42);
    expect(next.mode).toBe("paused");
    expect(next.stepsPerSecond).toBe(20);
    expect(getCell(next.grid, 1, 1)).toBe(1);
    expect(getCell(next.grid, 7, 7)).toBe(1);
    expect(aliveCount(next.grid)).toBe(2);
  });

  it("IMPORT does not mutate the prior state's grid", () => {
    const s = initialState(5);
    setCell(s.grid, 2, 2, 1);
    const before = new Uint8Array(s.grid.cells);

    const snapshotGrid = createGrid(5);
    reducer(s, Actions.importSnapshot({ size: 5, generation: 0, grid: snapshotGrid }));

    expect(s.grid.cells).toEqual(before);
  });

  it("NEW_GAME resets to a fresh paused state at the new size and preserves speed", () => {
    let s = initialState(5);
    s = reducer(s, Actions.setSpeed(30));
    s = reducer(s, Actions.setCell(1, 1, 1));
    s = reducer(s, Actions.step());
    s = reducer(s, Actions.play());

    const fresh = reducer(s, Actions.newGame(8));
    expect(fresh.size).toBe(8);
    expect(fresh.grid.size).toBe(8);
    expect(aliveCount(fresh.grid)).toBe(0);
    expect(fresh.generation).toBe(0);
    expect(fresh.mode).toBe("paused");
    expect(fresh.stepsPerSecond).toBe(30);
  });
});
