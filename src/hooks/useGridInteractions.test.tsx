import { renderHook } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRef, type RefObject } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createGrid } from '../core/grid';
import type { Mode } from '../types/game';
import { useGridInteractions } from './useGridInteractions';

interface SetupArgs {
  mode?: Mode;
  stepsPerSecond?: number;
}

function setup({ mode = 'paused', stepsPerSecond = 10 }: SetupArgs = {}) {
  const dispatch = vi.fn();
  const setCamera = vi.fn();
  renderHook(() => {
    const ref = useRef<HTMLCanvasElement | null>(null);
    useGridInteractions({
      ref: ref as RefObject<HTMLCanvasElement | null>,
      camera: { x: 0, y: 0, z: 1 },
      setCamera,
      grid: createGrid(10),
      size: 10,
      dispatch,
      mode,
      stepsPerSecond,
    });
  });
  return { dispatch, setCamera };
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('useGridInteractions keyboard shortcuts', () => {
  it('K dispatches PLAY when paused', async () => {
    const { dispatch } = setup({ mode: 'paused' });
    await userEvent.keyboard('k');
    expect(dispatch).toHaveBeenCalledWith({ type: 'PLAY' });
  });

  it('K dispatches PAUSE when playing', async () => {
    const { dispatch } = setup({ mode: 'playing' });
    await userEvent.keyboard('k');
    expect(dispatch).toHaveBeenCalledWith({ type: 'PAUSE' });
  });

  it('ArrowRight dispatches STEP when paused', async () => {
    const { dispatch } = setup({ mode: 'paused' });
    await userEvent.keyboard('{ArrowRight}');
    expect(dispatch).toHaveBeenCalledWith({ type: 'STEP' });
  });

  it('ArrowRight is ignored while playing', async () => {
    const { dispatch } = setup({ mode: 'playing' });
    await userEvent.keyboard('{ArrowRight}');
    expect(dispatch).not.toHaveBeenCalledWith({ type: 'STEP' });
  });

  it('C dispatches CLEAR', async () => {
    const { dispatch } = setup();
    await userEvent.keyboard('c');
    expect(dispatch).toHaveBeenCalledWith({ type: 'CLEAR' });
  });

  it('R dispatches RANDOMIZE', async () => {
    const { dispatch } = setup();
    await userEvent.keyboard('r');
    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'RANDOMIZE' }),
    );
  });

  it('] dispatches SET_SPEED with sps + 1', async () => {
    const { dispatch } = setup({ stepsPerSecond: 10 });
    await userEvent.keyboard(']]');
    expect(dispatch).toHaveBeenCalledWith({
      type: 'SET_SPEED',
      stepsPerSecond: 11,
    });
  });

  it('[ dispatches SET_SPEED with sps - 1', async () => {
    const { dispatch } = setup({ stepsPerSecond: 10 });
    await userEvent.keyboard('[[');
    expect(dispatch).toHaveBeenCalledWith({
      type: 'SET_SPEED',
      stepsPerSecond: 9,
    });
  });
});
