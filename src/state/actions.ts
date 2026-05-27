import type { UiAction } from './uiReducer';

export const play = (): UiAction => ({ type: 'PLAY' });
export const pause = (): UiAction => ({ type: 'PAUSE' });
export const setSpeed = (stepsPerSecond: number): UiAction => ({
  type: 'SET_SPEED',
  stepsPerSecond,
});
export const newGame = (size: number): UiAction => ({ type: 'NEW_GAME', size });
export const setSize = (size: number): UiAction => ({ type: 'SET_SIZE', size });
