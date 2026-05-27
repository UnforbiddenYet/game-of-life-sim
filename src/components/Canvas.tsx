import { useRef } from "react";
import { useCamera } from "../hooks/useCamera";
import { useCanvasDraw } from "../hooks/useCanvasDraw";
import { useGridInteractions } from "../hooks/useGridInteractions";
import { useEngine, useGameUi } from "../state/hooks";
import type { CanvasTheme } from "../types/canvas";
import { DEFAULT_THEME } from "./consts";

export interface CanvasProps {
  width: number;
  height: number;
  theme?: CanvasTheme;
}

export function Canvas({ width, height, theme = DEFAULT_THEME }: CanvasProps) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const engine = useEngine();
  const { size } = useGameUi();
  const [camera, setCamera] = useCamera(size, { width, height });

  useCanvasDraw({ ref, engine, camera, width, height, theme });
  useGridInteractions({ ref, camera, setCamera });

  return <canvas ref={ref} style={{ width, height, touchAction: "none" }} />;
}
