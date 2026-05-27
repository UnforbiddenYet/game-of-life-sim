import type { Grid } from './grid';

export type Mode = 'paused' | 'playing';

export interface HistoryFrame {
  readonly grid: Grid;
  readonly generation: number;
}

export interface GameUi {
  readonly size: number;
  readonly mode: Mode;
  readonly stepsPerSecond: number;
  readonly canUndo: boolean;
}

export interface GameTick {
  readonly generation: number;
  readonly alive: number;
}
