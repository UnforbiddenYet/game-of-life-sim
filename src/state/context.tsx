import {
  useEffect,
  useMemo,
  useReducer,
  useState,
  type ReactNode,
} from "react";
import { createEngine } from "../core/engine";
import { aliveCount } from "../core/grid";
import type { GameTick, GameUi } from "../types/game";
import { DEFAULT_SIZE, DEFAULT_SPS, initialUi, uiReducer } from "./uiReducer";
import {
  DispatchContext,
  EngineContext,
  TickContext,
  UiContext,
} from "./hooks";

const PULSE_MS = 100;

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
  const [ui, dispatch] = useReducer(uiReducer, undefined, () =>
    initialUi(size, stepsPerSecond),
  );

  const [engine] = useState(() => createEngine(ui.size));

  useEffect(() => {
    if (engine.current.size !== ui.size) {
      engine.reset(ui.size);
    }
  }, [engine, ui.size]);

  const [tick, setTick] = useState<GameTick>({ generation: 0, alive: 0 });
  const [canUndo, setCanUndo] = useState(false);

  useEffect(() => {
    const sample = () => {
      const generation = engine.generation;
      const alive = aliveCount(engine.current);
      setTick((prev) =>
        prev.generation === generation && prev.alive === alive
          ? prev
          : { generation, alive },
      );
      const undoable = engine.past.length > 0;
      setCanUndo((prev) => (prev === undoable ? prev : undoable));
    };
    sample();
    const id = window.setInterval(sample, PULSE_MS);
    return () => window.clearInterval(id);
  }, [engine]);

  const uiValue: GameUi = useMemo(() => ({ ...ui, canUndo }), [ui, canUndo]);

  return (
    <DispatchContext.Provider value={dispatch}>
      <EngineContext.Provider value={engine}>
        <UiContext.Provider value={uiValue}>
          <TickContext.Provider value={tick}>{children}</TickContext.Provider>
        </UiContext.Provider>
      </EngineContext.Provider>
    </DispatchContext.Provider>
  );
}
