import { useGesture } from '@use-gesture/react';
import { useRef, type Dispatch, type RefObject, type SetStateAction } from 'react';
import { screenToCell, zoomCamera } from '../core/camera';
import { getCell, inBounds } from '../core/grid';
import * as Actions from '../state/actions';
import type { Action } from '../types/game';
import type { Camera } from '../types/camera';
import type { Grid } from '../types/grid';

const WHEEL_ZOOM_SENSITIVITY = 0.001;

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
  grid: Grid;
  size: number;
  dispatch: Dispatch<Action>;
}

/**
 * Single home for every user input on the grid canvas:
 *  - drag-paint with paint-mode (down on dead → paint, down on alive → erase)
 *  - wheel-zoom toward the cursor
 * Returns a bind() to spread onto the canvas element.
 */
export function useGridInteractions({
  ref,
  camera,
  setCamera,
  grid,
  size,
  dispatch,
}: Args) {
  const stroke = useRef<Stroke | null>(null);

  const cursorOf = (event: CursorEvent) => {
    const canvas = ref.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };

  useGesture(
    {
      onDrag: ({ event, first, last }) => {
        if (last) {
          stroke.current = null;
          return;
        }
        const cursor = cursorOf(event as CursorEvent);
        if (!cursor) return;
        const cell = screenToCell(cursor, camera);
        if (!inBounds(size, cell.x, cell.y)) return;
        const idx = cell.y * size + cell.x;

        if (first) {
          const paintValue: 0 | 1 = getCell(grid, cell.x, cell.y) === 1 ? 0 : 1;
          stroke.current = { paintValue, touched: new Set([idx]) };
          dispatch(Actions.setCell(cell.x, cell.y, paintValue));
          return;
        }

        if (!stroke.current || stroke.current.touched.has(idx)) return;
        stroke.current.touched.add(idx);
        dispatch(Actions.setCell(cell.x, cell.y, stroke.current.paintValue));
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
