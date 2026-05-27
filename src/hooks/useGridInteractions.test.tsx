import { act, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRef, type RefObject } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Engine } from '../core/engine';
import { GameProvider } from '../state/context';
import { useEngine, useGameUi } from '../state/hooks';
import type { GameUi } from '../types/game';
import { useGridInteractions } from './useGridInteractions';

interface Harness {
  engine: Engine;
  ui: GameUi;
}

function setup({ canUndo = false, stepsPerSecond = 10 } = {}) {
  const captured: Harness = { engine: null as never, ui: null as never };

  function HarnessInner() {
    const ref = useRef<HTMLCanvasElement | null>(null);
    captured.engine = useEngine();
    captured.ui = useGameUi();
    useGridInteractions({
      ref: ref as RefObject<HTMLCanvasElement | null>,
      camera: { x: 0, y: 0, z: 1 },
      setCamera: vi.fn(),
    });
    return <canvas ref={ref} />;
  }

  render(
    <GameProvider size={10} stepsPerSecond={stepsPerSecond}>
      <HarnessInner />
    </GameProvider>,
  );

  if (canUndo) {
    act(() => captured.engine.checkpoint());
  }
  return captured;
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('useGridInteractions keyboard shortcuts', () => {
  it('K toggles playing mode', async () => {
    const captured = setup();
    expect(captured.ui.mode).toBe('paused');
    await userEvent.keyboard('k');
    expect(captured.ui.mode).toBe('playing');
    await userEvent.keyboard('k');
    expect(captured.ui.mode).toBe('paused');
  });

  it('ArrowRight steps the simulation when paused', async () => {
    const captured = setup();
    const startGeneration = captured.engine.generation;
    await userEvent.keyboard('{ArrowRight}');
    expect(captured.engine.generation).toBe(startGeneration + 1);
  });

  it('ArrowRight is ignored while playing', async () => {
    const captured = setup();
    await userEvent.keyboard('k');
    const startGeneration = captured.engine.generation;
    await userEvent.keyboard('{ArrowRight}');
    expect(captured.engine.generation).toBe(startGeneration);
  });

  it('ArrowLeft undoes when past is non-empty and paused', async () => {
    const captured = setup({ canUndo: true });
    expect(captured.engine.past).toHaveLength(1);
    await userEvent.keyboard('{ArrowLeft}');
    expect(captured.engine.past).toHaveLength(0);
  });

  it('ArrowLeft is a no-op when past is empty', async () => {
    const captured = setup();
    await userEvent.keyboard('{ArrowLeft}');
    expect(captured.engine.past).toHaveLength(0);
  });

  it('C clears the grid', async () => {
    const captured = setup();
    act(() => captured.engine.setCell(2, 2, 1));
    await userEvent.keyboard('c');
    expect(captured.engine.current.cells.every((v) => v === 0)).toBe(true);
  });

  it('R randomizes the grid', async () => {
    const captured = setup();
    await userEvent.keyboard('r');
    const aliveCount = captured.engine.current.cells.reduce(
      (n, v) => n + v,
      0,
    );
    expect(aliveCount).toBeGreaterThan(0);
  });

  it('] increments stepsPerSecond', async () => {
    const captured = setup({ stepsPerSecond: 10 });
    await userEvent.keyboard(']');
    expect(captured.ui.stepsPerSecond).toBe(11);
  });

  it('[ decrements stepsPerSecond', async () => {
    const captured = setup({ stepsPerSecond: 10 });
    await userEvent.keyboard('[BracketLeft]');
    expect(captured.ui.stepsPerSecond).toBe(9);
  });
});
