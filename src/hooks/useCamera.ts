import { useState, type Dispatch, type SetStateAction } from 'react';
import { fitCamera } from '../core/camera';
import type { Camera, Viewport } from '../types/camera';

/**
 * Camera state that resets to a fit-camera when the grid size or viewport
 * changes. Returns the current camera and a setter for user-driven updates
 * (wheel zoom, pan, keyboard).
 */
export function useCamera(
  gridSize: number,
  viewport: Viewport,
): [Camera, Dispatch<SetStateAction<Camera>>] {
  const [camera, setCamera] = useState<Camera>(() =>
    fitCamera(gridSize, viewport),
  );
  // React 19 "reset on prop change": set state during render, gated by a
  // signature so the reset only fires when the inputs actually change.
  const [sig, setSig] = useState(signatureOf(gridSize, viewport));
  const next = signatureOf(gridSize, viewport);
  if (next !== sig) {
    setSig(next);
    setCamera(fitCamera(gridSize, viewport));
  }
  return [camera, setCamera];
}

const signatureOf = (size: number, v: Viewport): string =>
  `${size}:${v.width}x${v.height}`;
