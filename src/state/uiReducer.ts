import type { Mode } from '../types/game';

export interface UiState {
  readonly size: number;
  readonly mode: Mode;
  readonly stepsPerSecond: number;
}

export type UiAction =
  | { type: 'PLAY' }
  | { type: 'PAUSE' }
  | { type: 'SET_SPEED'; stepsPerSecond: number }
  | { type: 'NEW_GAME'; size: number }
  | { type: 'SET_SIZE'; size: number };

export const DEFAULT_SIZE = 50;
export const DEFAULT_SPS = 10;
export const MIN_SPS = 1;
export const MAX_SPS = 60;

const clampSps = (sps: number): number =>
  Math.max(MIN_SPS, Math.min(MAX_SPS, Math.floor(sps)));

export function initialUi(
  size: number = DEFAULT_SIZE,
  stepsPerSecond: number = DEFAULT_SPS,
): UiState {
  return { size, mode: 'paused', stepsPerSecond };
}

export function uiReducer(state: UiState, action: UiAction): UiState {
  switch (action.type) {
    case 'PLAY':
      return state.mode === 'playing' ? state : { ...state, mode: 'playing' };
    case 'PAUSE':
      return state.mode === 'paused' ? state : { ...state, mode: 'paused' };
    case 'SET_SPEED':
      return { ...state, stepsPerSecond: clampSps(action.stepsPerSecond) };
    case 'NEW_GAME':
      return { ...state, size: action.size, mode: 'paused' };
    case 'SET_SIZE':
      return state.size === action.size ? state : { ...state, size: action.size };
  }
}
