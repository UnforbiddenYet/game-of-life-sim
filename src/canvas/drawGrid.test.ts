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
  it('draws each alive cell as a rounded fill inside its grid coordinate', () => {
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

    const cellShapes = ctx
      .__getEvents()
      .filter((e) => e.type === 'roundRect');
    expect(cellShapes).toHaveLength(1);
    const shape = cellShapes[0]!;
    expect(shape.props.x).toBeGreaterThanOrEqual(1);
    expect(shape.props.x).toBeLessThan(2);
    expect(shape.props.y).toBeGreaterThanOrEqual(1);
    expect(shape.props.y).toBeLessThan(2);
    expect(shape.props.width).toBeGreaterThan(0);
    expect(shape.props.width).toBeLessThanOrEqual(1);
  });

  it('draws grid lines when each cell is large enough to read them', () => {
    const ctx = makeCtx(60, 60);
    drawGrid(
      ctx,
      createGrid(3),
      { x: 0, y: 0, z: 20 },
      { width: 60, height: 60 },
      theme,
    );
    const strokes = ctx.__getEvents().filter((e) => e.type === 'stroke');
    expect(strokes.length).toBeGreaterThan(0);
  });

  it('omits grid lines when cells are below the readable threshold', () => {
    const ctx = makeCtx(12, 12);
    drawGrid(
      ctx,
      createGrid(3),
      { x: 0, y: 0, z: 4 },
      { width: 12, height: 12 },
      theme,
    );
    const strokes = ctx.__getEvents().filter((e) => e.type === 'stroke');
    expect(strokes).toEqual([]);
  });

  it('scales the transform by devicePixelRatio for hi-DPI buffers', () => {
    const ctx = makeCtx(60, 60);
    drawGrid(
      ctx,
      createGrid(3),
      { x: 0, y: 0, z: 5 },
      { width: 30, height: 30 },
      theme,
      2,
    );
    const transforms = ctx
      .__getEvents()
      .filter((e) => e.type === 'setTransform');
    // The camera transform must have scale z * dpr = 5 * 2 = 10
    const cameraTransform = transforms.find((t) => t.props.a === 10);
    expect(cameraTransform).toBeDefined();
  });
});
