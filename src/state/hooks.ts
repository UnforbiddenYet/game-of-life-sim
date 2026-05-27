import { createContext, useContext, type Dispatch } from 'react';
import type { Engine } from '../core/engine';
import type { GameTick, GameUi } from '../types/game';
import type { UiAction } from './uiReducer';

export const EngineContext = createContext<Engine | null>(null);
export const DispatchContext = createContext<Dispatch<UiAction> | null>(null);
export const UiContext = createContext<GameUi | null>(null);
export const TickContext = createContext<GameTick | null>(null);

export function useEngine(): Engine {
  const engine = useContext(EngineContext);
  if (engine === null) {
    throw new Error('useEngine must be used inside <GameProvider>');
  }
  return engine;
}

export function useGameDispatch(): Dispatch<UiAction> {
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
