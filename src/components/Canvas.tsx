import { useRef } from "react";
import { useCamera } from "../hooks/useCamera";
import { useCanvasDraw } from "../hooks/useCanvasDraw";
import { useGridInteractions } from "../hooks/useGridInteractions";
import { useGameDispatch, useGameState } from "../state/hooks";
import type { CanvasTheme } from "../types/canvas";
import { DEFAULT_THEME } from "./consts";
export interface CanvasProps {
  width: number;
  height: number;
  theme?: CanvasTheme;
}

export function Canvas({ width, height, theme = DEFAULT_THEME }: CanvasProps) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const { grid, size, mode, stepsPerSecond, past, future } = useGameState();
  const dispatch = useGameDispatch();
  const [camera, setCamera] = useCamera(size, { width, height });

  useCanvasDraw({ ref, grid, camera, width, height, theme });
  useGridInteractions({
    ref,
    camera,
    setCamera,
    grid,
    size,
    mode,
    stepsPerSecond,
    canUndo: past.length > 0,
    canRedo: future.length > 0,
    dispatch,
  });

  return <canvas ref={ref} style={{ width, height, touchAction: "none" }} />;
}
