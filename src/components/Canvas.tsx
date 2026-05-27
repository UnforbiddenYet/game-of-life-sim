import { useRef, type Dispatch, type SetStateAction } from "react";
import { useCanvasDraw } from "../hooks/useCanvasDraw";
import { useGridInteractions } from "../hooks/useGridInteractions";
import { useEngine } from "../state/hooks";
import type { Camera } from "../types/camera";
import type { CanvasTheme } from "../types/canvas";
import { DEFAULT_THEME } from "./consts";

export interface CanvasProps {
  width: number;
  height: number;
  camera: Camera;
  setCamera: Dispatch<SetStateAction<Camera>>;
  theme?: CanvasTheme;
}

export function Canvas({
  width,
  height,
  camera,
  setCamera,
  theme = DEFAULT_THEME,
}: CanvasProps) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const engine = useEngine();

  useCanvasDraw({ ref, engine, camera, width, height, theme });
  useGridInteractions({ ref, camera, setCamera });

  return <canvas ref={ref} style={{ width, height, touchAction: "none" }} />;
}
