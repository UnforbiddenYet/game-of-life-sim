import { fireEvent, render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { useCamera } from '../hooks/useCamera';
import { GameProvider } from '../state/context';
import { Canvas } from './Canvas';

function CanvasHarness({
  size,
  width,
  height,
}: {
  size: number;
  width: number;
  height: number;
}) {
  const [camera, setCamera] = useCamera(size, { width, height });
  return (
    <Canvas
      width={width}
      height={height}
      camera={camera}
      setCamera={setCamera}
    />
  );
}

interface CanvasEvent {
  readonly type: string;
  readonly props: Record<string, unknown>;
}

interface RecordingContext extends CanvasRenderingContext2D {
  __getEvents(): CanvasEvent[];
  __clearEvents(): void;
}

function setup(size = 5, width = 50, height = 50) {
  const result = render(
    <GameProvider size={size}>
      <CanvasHarness size={size} width={width} height={height} />
    </GameProvider>,
  );
  const canvas = result.container.querySelector('canvas');
  if (!canvas) throw new Error('canvas not rendered');
  // jsdom defaults all layout sizes to 0 — pin the canvas box so @use-gesture
  // can compute displacements and our pointer math sees CSS pixels.
  canvas.getBoundingClientRect = () => ({
    left: 0,
    top: 0,
    right: width,
    bottom: height,
    width,
    height,
    x: 0,
    y: 0,
    toJSON() {
      return undefined;
    },
  });
  const ctx = canvas.getContext('2d') as RecordingContext;
  return { canvas, ctx };
}

const aliveFillsOn = (ctx: RecordingContext): number =>
  ctx.__getEvents().filter((e) => e.type === 'roundRect').length;

// Pump two animation frames so any pending dirty work flushes through the
// rAF draw loop and event counts settle before assertions read them.
const flushDraws = (): Promise<void> =>
  new Promise<void>((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });

function withDevicePixelRatio<T>(value: number, fn: () => T): T {
  const original = window.devicePixelRatio;
  Object.defineProperty(window, 'devicePixelRatio', {
    value,
    configurable: true,
  });
  try {
    return fn();
  } finally {
    Object.defineProperty(window, 'devicePixelRatio', {
      value: original,
      configurable: true,
    });
  }
}

describe('Canvas', () => {
  it('renders a canvas element inside the provider', () => {
    const { canvas } = setup();
    expect(canvas).toBeInstanceOf(HTMLCanvasElement);
  });

  it('sizes the buffer at devicePixelRatio while keeping CSS layout nominal', () => {
    withDevicePixelRatio(2, () => {
      const { canvas } = setup(5, 50, 50);
      expect(canvas.width).toBe(100);
      expect(canvas.height).toBe(100);
      expect(canvas.style.width).toBe('50px');
      expect(canvas.style.height).toBe('50px');
    });
  });

  it('paints one cell on press+release over an empty grid', async () => {
    const user = userEvent.setup();
    const { canvas, ctx } = setup();
    ctx.__clearEvents();

    await user.pointer([
      { keys: '[MouseLeft>]', target: canvas, coords: { clientX: 25, clientY: 25 } },
      { keys: '[/MouseLeft]', target: canvas, coords: { clientX: 25, clientY: 25 } },
    ]);
    await flushDraws();

    expect(aliveFillsOn(ctx)).toBe(1);
  });

  it('paints multiple cells along a horizontal drag', async () => {
    const user = userEvent.setup();
    const { canvas, ctx } = setup();
    ctx.__clearEvents();

    await user.pointer([
      { keys: '[MouseLeft>]', target: canvas, coords: { clientX: 5, clientY: 25 } },
      { target: canvas, coords: { clientX: 15, clientY: 25 } },
      { target: canvas, coords: { clientX: 25, clientY: 25 } },
      { target: canvas, coords: { clientX: 35, clientY: 25 } },
      { target: canvas, coords: { clientX: 45, clientY: 25 } },
      { keys: '[/MouseLeft]', target: canvas, coords: { clientX: 45, clientY: 25 } },
    ]);
    await flushDraws();

    expect(aliveFillsOn(ctx)).toBeGreaterThan(1);
  });

  it('pans without painting when the drag is held with Space', async () => {
    const user = userEvent.setup();
    const { canvas, ctx } = setup();
    ctx.__clearEvents();

    await user.keyboard('[Space>]'); // hold Space
    await user.pointer([
      { keys: '[MouseLeft>]', target: canvas, coords: { clientX: 5, clientY: 25 } },
      { target: canvas, coords: { clientX: 35, clientY: 25 } },
      { keys: '[/MouseLeft]', target: canvas, coords: { clientX: 35, clientY: 25 } },
    ]);
    await user.keyboard('[/Space]'); // release Space
    await flushDraws();

    expect(aliveFillsOn(ctx)).toBe(0);
  });

  it('undoes a whole drag stroke in one keypress, not cell-by-cell', async () => {
    const user = userEvent.setup();
    const { canvas, ctx } = setup();

    await user.pointer([
      { keys: '[MouseLeft>]', target: canvas, coords: { clientX: 5, clientY: 25 } },
      { target: canvas, coords: { clientX: 15, clientY: 25 } },
      { target: canvas, coords: { clientX: 25, clientY: 25 } },
      { target: canvas, coords: { clientX: 35, clientY: 25 } },
      { target: canvas, coords: { clientX: 45, clientY: 25 } },
      { keys: '[/MouseLeft]', target: canvas, coords: { clientX: 45, clientY: 25 } },
    ]);
    await flushDraws();
    expect(aliveFillsOn(ctx)).toBeGreaterThan(1);
    ctx.__clearEvents();

    await user.keyboard('{ArrowLeft}');
    await flushDraws();

    expect(aliveFillsOn(ctx)).toBe(0);
  });

  it('erases along the drag path when the drag starts on an alive cell', async () => {
    const user = userEvent.setup();
    const { canvas, ctx } = setup();

    await user.pointer([
      { keys: '[MouseLeft>]', target: canvas, coords: { clientX: 5, clientY: 25 } },
      { target: canvas, coords: { clientX: 15, clientY: 25 } },
      { target: canvas, coords: { clientX: 25, clientY: 25 } },
      { target: canvas, coords: { clientX: 35, clientY: 25 } },
      { target: canvas, coords: { clientX: 45, clientY: 25 } },
      { keys: '[/MouseLeft]', target: canvas, coords: { clientX: 45, clientY: 25 } },
    ]);
    await flushDraws();
    const aliveAfterPaint = aliveFillsOn(ctx);
    expect(aliveAfterPaint).toBeGreaterThan(1);
    ctx.__clearEvents();

    await user.pointer([
      { keys: '[MouseLeft>]', target: canvas, coords: { clientX: 5, clientY: 25 } },
      { target: canvas, coords: { clientX: 15, clientY: 25 } },
      { target: canvas, coords: { clientX: 25, clientY: 25 } },
      { target: canvas, coords: { clientX: 35, clientY: 25 } },
      { target: canvas, coords: { clientX: 45, clientY: 25 } },
      { keys: '[/MouseLeft]', target: canvas, coords: { clientX: 45, clientY: 25 } },
    ]);
    await flushDraws();

    expect(aliveFillsOn(ctx)).toBeLessThan(aliveAfterPaint);
  });

  it('zooms in on wheel up (deltaY < 0), increasing the draw transform scale', async () => {
    const { canvas, ctx } = setup();
    const scaleOf = (c: RecordingContext) =>
      c
        .__getEvents()
        .filter((e) => e.type === 'setTransform')
        .map((e) => e.props.a as number)
        .reduce((max, a) => Math.max(max, a), 0);

    const scaleBefore = scaleOf(ctx);
    expect(scaleBefore).toBeGreaterThan(0);
    ctx.__clearEvents();

    fireEvent.wheel(canvas, { deltaY: -100, clientX: 25, clientY: 25 });

    await waitFor(() => expect(scaleOf(ctx)).toBeGreaterThan(scaleBefore));
  });
});
