import { useMemo, useReducer, type ReactNode } from 'react';
import { aliveCount } from '../core/grid';
import { DEFAULT_SIZE, DEFAULT_SPS, initialState, reducer } from './reducer';
import {
  DispatchContext,
  StateContext,
  TickContext,
  UiContext,
} from './hooks';

export interface GameProviderProps {
  size?: number;
  stepsPerSecond?: number;
  children: ReactNode;
}

export function GameProvider({
  size = DEFAULT_SIZE,
  stepsPerSecond = DEFAULT_SPS,
  children,
}: GameProviderProps) {
  const [state, dispatch] = useReducer(reducer, undefined, () =>
    initialState(size, stepsPerSecond),
  );

  const ui = useMemo(
    () => ({
      size: state.size,
      mode: state.mode,
      stepsPerSecond: state.stepsPerSecond,
    }),
    [state.size, state.mode, state.stepsPerSecond],
  );

  const tick = useMemo(
    () => ({ generation: state.generation, alive: aliveCount(state.grid) }),
    [state.generation, state.grid],
  );

  return (
    <DispatchContext.Provider value={dispatch}>
      <StateContext.Provider value={state}>
        <UiContext.Provider value={ui}>
          <TickContext.Provider value={tick}>{children}</TickContext.Provider>
        </UiContext.Provider>
      </StateContext.Provider>
    </DispatchContext.Provider>
  );
}
