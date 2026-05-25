import { useEffect, useRef, type PointerEvent as ReactPointerEvent } from 'react';
import { drawGrid } from '../canvas/drawGrid';
import { fitCamera, screenToCell } from '../core/camera';
import { getCell, inBounds } from '../core/grid';
import * as Actions from '../state/actions';
import { useGameDispatch, useGameState } from '../state/hooks';
import type { CanvasTheme } from '../types/canvas';

const DEFAULT_THEME: CanvasTheme = {
  background: '#0b0d10',
  grid: '#1f242b',
  alive: '#e8edf2',
};

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

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const camera = fitCamera(size, { width, height });
    drawGrid(ctx, grid, camera, { width, height }, theme);
  }, [grid, size, width, height, theme]);

  const eventToCell = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    const canvas = ref.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const camera = fitCamera(size, { width, height });
    const cell = screenToCell(
      { x: e.clientX - rect.left, y: e.clientY - rect.top },
      camera,
    );
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

  return (
    <canvas
      ref={ref}
      width={width}
      height={height}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      style={{ touchAction: 'none' }}
    />
  );
}
