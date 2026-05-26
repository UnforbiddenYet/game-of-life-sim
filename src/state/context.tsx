import {
  useLayoutEffect,
  useMemo,
  useReducer,
  useRef,
  type ReactNode,
} from 'react';
import { aliveCount } from '../core/grid';
import { DEFAULT_SIZE, DEFAULT_SPS, initialState, reducer } from './reducer';
import {
  DispatchContext,
  StateContext,
  StateRefContext,
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

  // Kept in sync with the latest committed state so handlers can read on
  // demand without forcing a tick-rate re-render on subscribers.
  const stateRef = useRef(state);
  useLayoutEffect(() => {
    stateRef.current = state;
  }, [state]);

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
        <StateRefContext.Provider value={stateRef}>
          <UiContext.Provider value={ui}>
            <TickContext.Provider value={tick}>{children}</TickContext.Provider>
          </UiContext.Provider>
        </StateRefContext.Provider>
      </StateContext.Provider>
    </DispatchContext.Provider>
  );
}
