import type { Action } from '../types/game';
import type { GameSnapshot } from '../types/serialize';

export const step = (): Action => ({ type: 'STEP' });
export const stepBack = (): Action => ({ type: 'STEP_BACK' });
export const stepForward = (): Action => ({ type: 'STEP_FORWARD' });
export const play = (): Action => ({ type: 'PLAY' });
export const pause = (): Action => ({ type: 'PAUSE' });
export const setCell = (x: number, y: number, alive: 0 | 1): Action => ({
  type: 'SET_CELL',
  x,
  y,
  alive,
});
export const clear = (): Action => ({ type: 'CLEAR' });
export const randomize = (density: number): Action => ({
  type: 'RANDOMIZE',
  density,
});
export const setSpeed = (stepsPerSecond: number): Action => ({
  type: 'SET_SPEED',
  stepsPerSecond,
});
export const newGame = (size: number): Action => ({ type: 'NEW_GAME', size });
export const importSnapshot = (snapshot: GameSnapshot): Action => ({
  type: 'IMPORT',
  snapshot,
});
