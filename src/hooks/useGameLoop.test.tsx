import { render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useGameLoop } from './useGameLoop';

interface ProbeProps {
  isPlaying: boolean;
  stepsPerSecond: number;
  onTick: () => void;
}

function Probe({ isPlaying, stepsPerSecond, onTick }: ProbeProps) {
  useGameLoop({ isPlaying, stepsPerSecond, onTick });
  return null;
}

describe('useGameLoop', () => {
  let now = 0;
  let nextFrameId = 1;
  let frames = new Map<number, FrameRequestCallback>();

  beforeEach(() => {
    now = 0;
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
    now = timestamp;
    const pending = [...frames.entries()];
    frames.clear();
    for (const [, callback] of pending) {
      callback(now);
    }
  }

  it('ticks at the requested steps per second while playing', () => {
    const onTick = vi.fn();
    render(<Probe isPlaying stepsPerSecond={2} onTick={onTick} />);

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
    const { rerender } = render(
      <Probe isPlaying stepsPerSecond={10} onTick={onTick} />,
    );

    advanceTo(0);
    advanceTo(100);
    expect(onTick).toHaveBeenCalledTimes(1);

    rerender(<Probe isPlaying={false} stepsPerSecond={10} onTick={onTick} />);
    advanceTo(200);
    advanceTo(300);

    expect(onTick).toHaveBeenCalledTimes(1);
  });
});
