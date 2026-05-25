import { describe, expect, it } from 'vitest';
import { createGrid, setCell } from '../core/grid';
import type { CanvasTheme } from '../types/canvas';
import { drawGrid } from './drawGrid';

const theme: CanvasTheme = {
  background: '#000',
  grid: '#222',
  alive: '#fff',
};

interface CanvasEvent {
  readonly type: string;
  readonly props: Record<string, unknown>;
}

interface RecordingContext extends CanvasRenderingContext2D {
  __getEvents(): CanvasEvent[];
}

function makeCtx(width = 30, height = 30): RecordingContext {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('canvas 2d context unavailable');
  return ctx as RecordingContext;
}

describe('drawGrid', () => {
  it('draws each alive cell as a 1×1 fill at its canvas coordinates', () => {
    const ctx = makeCtx();
    const grid = createGrid(3);
    setCell(grid, 1, 1, 1);

    drawGrid(
      ctx,
      grid,
      { x: 0, y: 0, z: 10 },
      { width: 30, height: 30 },
      theme,
    );

    const cellFills = ctx
      .__getEvents()
      .filter(
        (e) =>
          e.type === 'fillRect' &&
          e.props.width === 1 &&
          e.props.height === 1,
      )
      .map((e) => [e.props.x, e.props.y]);
    expect(cellFills).toEqual([[1, 1]]);
  });
});
