import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useGameLoop, type UseGameLoopArgs } from './useGameLoop';

describe('useGameLoop', () => {
  let nextFrameId = 1;
  let frames = new Map<number, FrameRequestCallback>();

  beforeEach(() => {
    nextFrameId = 1;
    frames = new Map<number, FrameRequestCallback>();
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      const id = nextFrameId++;
      frames.set(id, callback);
      return id;
    });
    vi.stubGlobal('cancelAnimationFrame', (id: number) => {
      frames.delete(id);
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  function advanceTo(timestamp: number) {
    const pending = [...frames.entries()];
    frames.clear();
    for (const [, callback] of pending) {
      callback(timestamp);
    }
  }

  it('ticks at the requested steps per second while playing', () => {
    const onTick = vi.fn();
    renderHook((args: UseGameLoopArgs) => useGameLoop(args), {
      initialProps: { isPlaying: true, stepsPerSecond: 2, onTick },
    });

    advanceTo(0);
    advanceTo(0);
    advanceTo(250);
    expect(onTick).not.toHaveBeenCalled();

    advanceTo(500);
    expect(onTick).toHaveBeenCalledTimes(1);

    advanceTo(750);
    expect(onTick).toHaveBeenCalledTimes(1);

    advanceTo(1000);
    expect(onTick).toHaveBeenCalledTimes(2);
  });

  it('stops ticking when paused', () => {
    const onTick = vi.fn();
    const { rerender } = renderHook(
      (args: UseGameLoopArgs) => useGameLoop(args),
      {
        initialProps: { isPlaying: true, stepsPerSecond: 10, onTick },
      },
    );

    advanceTo(0);
    advanceTo(100);
    expect(onTick).toHaveBeenCalledTimes(1);

    rerender({ isPlaying: false, stepsPerSecond: 10, onTick });
    advanceTo(200);
    advanceTo(300);

    expect(onTick).toHaveBeenCalledTimes(1);
  });
});
