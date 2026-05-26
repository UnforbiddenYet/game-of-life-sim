import type { Grid } from './grid';
import type { GameSnapshot } from './serialize';

export type Mode = 'paused' | 'playing';

export interface GameState {
  readonly size: number;
  readonly grid: Grid;
  readonly generation: number;
  readonly mode: Mode;
  readonly stepsPerSecond: number;
}

export interface GameUi {
  readonly size: number;
  readonly mode: Mode;
  readonly stepsPerSecond: number;
}

export interface GameTick {
  readonly generation: number;
  readonly alive: number;
}

export type Action =
  | { type: 'STEP' }
  | { type: 'PLAY' }
  | { type: 'PAUSE' }
  | { type: 'SET_CELL'; x: number; y: number; alive: 0 | 1 }
  | { type: 'CLEAR' }
  | { type: 'RANDOMIZE'; density: number }
  | { type: 'SET_SPEED'; stepsPerSecond: number }
  | { type: 'NEW_GAME'; size: number }
  | { type: 'IMPORT'; snapshot: GameSnapshot };
