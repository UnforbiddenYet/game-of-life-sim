import { useGesture } from "@use-gesture/react";
import {
  useEffect,
  useRef,
  type Dispatch,
  type RefObject,
  type SetStateAction,
} from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { panCamera, screenToCell, zoomCamera } from "../core/camera";
import type { Engine } from "../core/engine";
import { getCell, inBounds } from "../core/grid";
import * as Actions from "../state/actions";
import { useEngine, useGameDispatch, useGameUi } from "../state/hooks";
import type { Camera } from "../types/camera";

const WHEEL_ZOOM_SENSITIVITY = 0.001;
const RANDOMIZE_DENSITY = 0.3;

interface Stroke {
  readonly paintValue: 0 | 1;
  readonly touched: Set<number>;
}

interface CursorEvent {
  clientX: number;
  clientY: number;
}

interface Args {
  ref: RefObject<HTMLCanvasElement | null>;
  camera: Camera;
  setCamera: Dispatch<SetStateAction<Camera>>;
}

export function useGridInteractions({ ref, camera, setCamera }: Args) {
  const engine = useEngine();
  const dispatch = useGameDispatch();
  const { mode, stepsPerSecond, size } = useGameUi();

  const stroke = useRef<Stroke | null>(null);
  const spacePressed = useRef(false);
  const engineRef = useRef<Engine>(engine);
  useEffect(() => {
    engineRef.current = engine;
  });

  useHotkeys(
    "space",
    (e) => {
      e.preventDefault();
      spacePressed.current = e.type === "keydown";
    },
    { keydown: true, keyup: true },
  );

  useHotkeys(
    "k",
    () => dispatch(mode === "playing" ? Actions.pause() : Actions.play()),
    [mode],
  );

  useHotkeys(
    "right",
    () => {
      if (mode === "playing") return;
      engineRef.current.step();
    },
    [mode],
  );

  useHotkeys(
    "left",
    () => {
      if (mode === "playing") return;
      engineRef.current.undo();
    },
    [mode],
  );

  useHotkeys("c", () => engineRef.current.clear());
  useHotkeys("r", () => engineRef.current.randomize(RANDOMIZE_DENSITY));

  useHotkeys(
    "bracketright",
    () => dispatch(Actions.setSpeed(stepsPerSecond + 1)),
    [stepsPerSecond],
  );
  useHotkeys(
    "bracketleft",
    () => dispatch(Actions.setSpeed(stepsPerSecond - 1)),
    [stepsPerSecond],
  );

  const cursorOf = (event: CursorEvent) => {
    const canvas = ref.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };

  useGesture(
    {
      onDrag: ({ event, delta: [dx, dy], first, last }) => {
        if (last) {
          stroke.current = null;
          return;
        }
        if (spacePressed.current) {
          setCamera((c) => panCamera(c, dx / c.z, dy / c.z));
          return;
        }
        const cursor = cursorOf(event as CursorEvent);
        if (!cursor) return;
        const cell = screenToCell(cursor, camera);
        if (!inBounds(size, cell.x, cell.y)) return;
        const idx = cell.y * size + cell.x;

        if (first) {
          const paintValue: 0 | 1 =
            getCell(engineRef.current.current, cell.x, cell.y) === 1 ? 0 : 1;
          stroke.current = { paintValue, touched: new Set([idx]) };
          engineRef.current.checkpoint();
          engineRef.current.setCell(cell.x, cell.y, paintValue);
          return;
        }

        if (!stroke.current || stroke.current.touched.has(idx)) return;
        stroke.current.touched.add(idx);
        engineRef.current.setCell(cell.x, cell.y, stroke.current.paintValue);
      },
      onWheel: ({ event }) => {
        const cursor = cursorOf(event as CursorEvent);
        if (!cursor) return;
        const wheel = event as WheelEvent;
        const dz = wheel.deltaY * WHEEL_ZOOM_SENSITIVITY;
        setCamera((c) => zoomCamera(c, cursor, dz));
      },
    },
    { target: ref, eventOptions: { passive: false } },
  );
}
