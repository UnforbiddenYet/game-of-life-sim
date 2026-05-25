import { describe, expect, it } from "vitest";
import { aliveCount, getCell, setCell } from "../core/grid";
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
