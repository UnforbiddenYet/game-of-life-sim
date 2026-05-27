import { useEffect, useRef, type RefObject } from 'react';
import { drawGrid } from '../canvas/drawGrid';
import { profile } from '../canvas/profile';
import type { Engine } from '../core/engine';
import type { Camera } from '../types/camera';
import type { CanvasTheme } from '../types/canvas';

interface Args {
  ref: RefObject<HTMLCanvasElement | null>;
  engine: Engine;
  camera: Camera;
  width: number;
  height: number;
  theme: CanvasTheme;
}

export function useCanvasDraw({
  ref,
  engine,
  camera,
  width,
  height,
  theme,
}: Args): void {
  const cameraRef = useRef(camera);
  const themeRef = useRef(theme);
  const viewportRef = useRef({ width, height });
  const externalDirty = useRef(true);

  useEffect(() => {
    cameraRef.current = camera;
    themeRef.current = theme;
    viewportRef.current = { width, height };
    externalDirty.current = true;
  }, [camera, width, height, theme]);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      const { width: w, height: h } = viewportRef.current;
      const dpr = window.devicePixelRatio || 1;
      if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
        canvas.width = w * dpr;
        canvas.height = h * dpr;
      }
      profile('drawGrid', () =>
        drawGrid(
          ctx,
          engine.current,
          cameraRef.current,
          { width: w, height: h },
          themeRef.current,
          dpr,
        ),
      );
    };

    const drawIfDirty = () => {
      if (externalDirty.current || engine.consumeDirty()) {
        externalDirty.current = false;
        draw();
      }
    };

    drawIfDirty();

    let rafId = 0;
    const loop = () => {
      drawIfDirty();
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, [engine, ref]);
}
