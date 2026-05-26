import {
  useRef,
  type PointerEvent as ReactPointerEvent,
  type WheelEvent as ReactWheelEvent,
} from 'react';
import { screenToCell, zoomCamera } from '../core/camera';
import { getCell, inBounds } from '../core/grid';
import { useCamera } from '../hooks/useCamera';
import { useCanvasDraw } from '../hooks/useCanvasDraw';
import * as Actions from '../state/actions';
import { useGameDispatch, useGameState } from '../state/hooks';
import type { CanvasTheme } from '../types/canvas';

const DEFAULT_THEME: CanvasTheme = {
  background: '#0b0d10',
  grid: '#1f242b',
  alive: '#e8edf2',
};

// Tuned for natural feel with both mouse wheels and trackpad pinch.
const WHEEL_ZOOM_SENSITIVITY = 0.001;

export interface CanvasProps {
  width: number;
  height: number;
  theme?: CanvasTheme;
}

interface Stroke {
  readonly paintValue: 0 | 1;
  readonly touched: Set<number>;
}

export function Canvas({ width, height, theme = DEFAULT_THEME }: CanvasProps) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const stroke = useRef<Stroke | null>(null);
  const dispatch = useGameDispatch();
  const { grid, size } = useGameState();
  const [camera, setCamera] = useCamera(size, { width, height });

  useCanvasDraw({ ref, grid, camera, width, height, theme });

  const cursorOf = (e: { clientX: number; clientY: number }) => {
    const canvas = ref.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const eventToCell = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    const cursor = cursorOf(e);
    if (!cursor) return null;
    const cell = screenToCell(cursor, camera);
    if (!inBounds(size, cell.x, cell.y)) return null;
    return cell;
  };

  const onPointerDown = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    const cell = eventToCell(e);
    if (!cell) return;
    const paintValue: 0 | 1 = getCell(grid, cell.x, cell.y) === 1 ? 0 : 1;
    stroke.current = {
      paintValue,
      touched: new Set([cell.y * size + cell.x]),
    };
    e.currentTarget.setPointerCapture(e.pointerId);
    dispatch(Actions.setCell(cell.x, cell.y, paintValue));
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!stroke.current) return;
    const cell = eventToCell(e);
    if (!cell) return;
    const idx = cell.y * size + cell.x;
    if (stroke.current.touched.has(idx)) return;
    stroke.current.touched.add(idx);
    dispatch(Actions.setCell(cell.x, cell.y, stroke.current.paintValue));
  };

  const onPointerUp = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    stroke.current = null;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  const onWheel = (e: ReactWheelEvent<HTMLCanvasElement>) => {
    const cursor = cursorOf(e);
    if (!cursor) return;
    const dz = e.deltaY * WHEEL_ZOOM_SENSITIVITY;
    setCamera((c) => zoomCamera(c, cursor, dz));
  };

  return (
    <canvas
      ref={ref}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onWheel={onWheel}
      style={{ width, height, touchAction: 'none' }}
    />
  );
}
