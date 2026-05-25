import { useReducer, type ReactNode } from 'react';
import { DEFAULT_SIZE, DEFAULT_SPS, initialState, reducer } from './reducer';
import { DispatchContext, StateContext } from './hooks';

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
  return (
    <DispatchContext.Provider value={dispatch}>
      <StateContext.Provider value={state}>{children}</StateContext.Provider>
    </DispatchContext.Provider>
  );
}
