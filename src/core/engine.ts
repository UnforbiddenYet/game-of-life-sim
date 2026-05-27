import type { HistoryFrame } from '../types/game';
import type { Grid } from '../types/grid';
import { cloneGrid, createGrid, setCell as gridSetCell } from './grid';
import { pushBounded } from './history';
import { stepInto } from './step';

export interface Engine {
  readonly current: Grid;
  readonly generation: number;
  readonly past: readonly HistoryFrame[];
  step(): void;
  setCell(x: number, y: number, alive: 0 | 1): void;
  clear(): void;
  randomize(density: number, rng?: () => number): void;
  checkpoint(): void;
  undo(): boolean;
  consumeDirty(): boolean;
}

export function createEngine(size: number): Engine {
  let front = createGrid(size);
  let back = createGrid(size);
  let generation = 0;
  let past: readonly HistoryFrame[] = [];
  let dirty = true;

  function snapshot(): HistoryFrame {
    return { grid: cloneGrid(front), generation };
  }

  return {
    get current() {
      return front;
    },
    get generation() {
      return generation;
    },
    get past() {
      return past;
    },
    step() {
      past = pushBounded(past, snapshot(), size);
      stepInto(front, back);
      const tmp = front;
      front = back;
      back = tmp;
      generation++;
      dirty = true;
    },
    setCell(x, y, alive) {
      gridSetCell(front, x, y, alive);
      dirty = true;
    },
    clear() {
      front.cells.fill(0);
      back.cells.fill(0);
      generation = 0;
      past = [];
      dirty = true;
    },
    randomize(density, rng = Math.random) {
      const cells = front.cells;
      for (let i = 0; i < cells.length; i++) {
        cells[i] = rng() < density ? 1 : 0;
      }
      back.cells.fill(0);
      generation = 0;
      past = [];
      dirty = true;
    },
    checkpoint() {
      past = pushBounded(past, snapshot(), size);
    },
    undo() {
      if (past.length === 0) return false;
      const frame = past[past.length - 1]!;
      front.cells.set(frame.grid.cells);
      generation = frame.generation;
      past = past.slice(0, -1);
      dirty = true;
      return true;
    },
    consumeDirty() {
      const d = dirty;
      dirty = false;
      return d;
    },
  };
}
