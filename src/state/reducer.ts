import type { Action, GameState, HistoryFrame } from '../types/game';
import { cloneGrid, createGrid, randomGrid, setCell } from '../core/grid';
import { pushBounded } from '../core/history';
import { step } from '../core/step';

function snapshot(state: GameState): HistoryFrame {
  return { grid: cloneGrid(state.grid), generation: state.generation };
}

export const DEFAULT_SIZE = 50;
export const DEFAULT_SPS = 10;
export const MIN_SPS = 1;
export const MAX_SPS = 60;

const clampSps = (sps: number): number =>
  Math.max(MIN_SPS, Math.min(MAX_SPS, Math.floor(sps)));

export function initialState(
  size: number = DEFAULT_SIZE,
  stepsPerSecond: number = DEFAULT_SPS,
): GameState {
  return {
    size,
    grid: createGrid(size),
    generation: 0,
    mode: 'paused',
    stepsPerSecond,
    past: [],
  };
}

export function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'STEP':
      return {
        ...state,
        grid: step(state.grid),
        generation: state.generation + 1,
        past: pushBounded(state.past, snapshot(state), state.size),
      };
    case 'CHECKPOINT':
      return {
        ...state,
        past: pushBounded(state.past, snapshot(state), state.size),
      };
    case 'UNDO': {
      if (state.past.length === 0) return state;
      const prev = state.past[state.past.length - 1] as HistoryFrame;
      return {
        ...state,
        grid: cloneGrid(prev.grid),
        generation: prev.generation,
        past: state.past.slice(0, -1),
      };
    }
    case 'PLAY':
      return state.mode === 'playing' ? state : { ...state, mode: 'playing' };
    case 'PAUSE':
      return state.mode === 'paused' ? state : { ...state, mode: 'paused' };
    case 'SET_CELL': {
      const grid = cloneGrid(state.grid);
      setCell(grid, action.x, action.y, action.alive);
      return { ...state, grid };
    }
    case 'CLEAR':
      return {
        ...state,
        grid: createGrid(state.size),
        generation: 0,
        past: [],
      };
    case 'RANDOMIZE':
      return {
        ...state,
        grid: randomGrid(state.size, action.density),
        generation: 0,
        past: [],
      };
    case 'SET_SPEED':
      return { ...state, stepsPerSecond: clampSps(action.stepsPerSecond) };
    case 'NEW_GAME':
      return initialState(action.size, state.stepsPerSecond);
    case 'IMPORT': {
      const { snapshot: snap } = action;
      return {
        ...state,
        size: snap.size,
        grid: cloneGrid(snap.grid),
        generation: snap.generation,
        mode: 'paused',
        past: [],
      };
    }
  }
}
