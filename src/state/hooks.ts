import { createContext, useContext, type Dispatch } from 'react';
import type { Action, GameState } from '../types/game';

export const StateContext = createContext<GameState | null>(null);
export const DispatchContext = createContext<Dispatch<Action> | null>(null);

export function useGameState(): GameState {
  const state = useContext(StateContext);
  if (state === null) {
    throw new Error('useGameState must be used inside <GameProvider>');
  }
  return state;
}

export function useGameDispatch(): Dispatch<Action> {
  const dispatch = useContext(DispatchContext);
  if (dispatch === null) {
    throw new Error('useGameDispatch must be used inside <GameProvider>');
  }
  return dispatch;
}
