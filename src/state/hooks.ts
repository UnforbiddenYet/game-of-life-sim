import { createContext, useContext, type Dispatch } from 'react';
import type { Action, GameState, GameTick, GameUi } from '../types/game';

export const StateContext = createContext<GameState | null>(null);
export const DispatchContext = createContext<Dispatch<Action> | null>(null);
export const UiContext = createContext<GameUi | null>(null);
export const TickContext = createContext<GameTick | null>(null);

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

export function useGameUi(): GameUi {
  const ui = useContext(UiContext);
  if (ui === null) {
    throw new Error('useGameUi must be used inside <GameProvider>');
  }
  return ui;
}

export function useGameTick(): GameTick {
  const tick = useContext(TickContext);
  if (tick === null) {
    throw new Error('useGameTick must be used inside <GameProvider>');
  }
  return tick;
}
