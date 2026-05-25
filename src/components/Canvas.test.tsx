import { fireEvent, render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { GameProvider } from '../state/context';
import { Canvas } from './Canvas';

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
      <Canvas width={width} height={height} />
    </GameProvider>,
  );
  const canvas = result.container.querySelector('canvas');
  if (!canvas) throw new Error('canvas not rendered');
  // jsdom does not compute layout; pin the canvas box so client coords work
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
  ctx
    .__getEvents()
    .filter(
      (e) =>
        e.type === 'fillRect' &&
        e.props.width === 1 &&
        e.props.height === 1,
    ).length;

describe('Canvas', () => {
  it('renders a canvas element inside the provider', () => {
    const { canvas } = setup();
    expect(canvas).toBeInstanceOf(HTMLCanvasElement);
  });

  it('paints one cell on press+release over an empty grid', () => {
    const { canvas, ctx } = setup();
    ctx.__clearEvents();

    fireEvent.pointerDown(canvas, { clientX: 25, clientY: 25, pointerId: 1 });
    fireEvent.pointerUp(canvas, { clientX: 25, clientY: 25, pointerId: 1 });

    expect(aliveFillsOn(ctx)).toBe(1);
  });
});
