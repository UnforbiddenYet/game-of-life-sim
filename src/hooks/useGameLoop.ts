import { useEffect, useRef } from 'react';

const MAX_FRAME_DELTA_MS = 250;

export interface UseGameLoopArgs {
  isPlaying: boolean;
  stepsPerSecond: number;
  onTick: () => void;
}

export function useGameLoop({
  isPlaying,
  stepsPerSecond,
  onTick,
}: UseGameLoopArgs): void {
  const onTickRef = useRef(onTick);

  useEffect(() => {
    onTickRef.current = onTick;
  }, [onTick]);

  useEffect(() => {
    if (!isPlaying) return;

    let frameId = 0;
    let previousTimestamp: number | null = null;
    let accumulator = 0;
    const stepMs = 1000 / stepsPerSecond;

    const loop = (timestamp: number) => {
      if (previousTimestamp !== null) {
        accumulator += Math.min(
          timestamp - previousTimestamp,
          MAX_FRAME_DELTA_MS,
        );
        while (accumulator >= stepMs) {
          accumulator -= stepMs;
          onTickRef.current();
        }
      }

      previousTimestamp = timestamp;
      frameId = requestAnimationFrame(loop);
    };

    frameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameId);
  }, [isPlaying, stepsPerSecond]);
}
