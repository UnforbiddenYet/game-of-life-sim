import { describe, expect, it } from 'vitest';
import {
  canvasToScreen,
  fitCamera,
  panCamera,
  screenToCanvas,
  zoomCamera,
} from './camera';
import type { Camera, Point } from '../types/camera';

const closeTo = (p: Point, q: Point): void => {
  expect(p.x).toBeCloseTo(q.x, 9);
  expect(p.y).toBeCloseTo(q.y, 9);
};

describe('screenToCanvas', () => {
  it('is the identity at the default camera (x:0, y:0, z:1)', () => {
    expect(screenToCanvas({ x: 10, y: 20 }, { x: 0, y: 0, z: 1 })).toEqual({
      x: 10,
      y: 20,
    });
  });
});

describe('canvasToScreen / screenToCanvas', () => {
  const cameras: Camera[] = [
    { x: 0, y: 0, z: 1 },
    { x: 50, y: -30, z: 2 },
    { x: -100, y: 75, z: 0.25 },
  ];
  const points: Point[] = [
    { x: 0, y: 0 },
    { x: 17, y: 42 },
    { x: -250, y: 300 },
  ];
  it.each(cameras)('round-trips canvas→screen→canvas at camera %j', (c) => {
    for (const p of points) {
      closeTo(screenToCanvas(canvasToScreen(p, c), c), p);
    }
  });
});

describe('panCamera', () => {
  it('shifts the camera position by the given canvas-space delta', () => {
    expect(panCamera({ x: 0, y: 0, z: 2 }, 5, 10)).toEqual({
      x: 5,
      y: 10,
      z: 2,
    });
  });
});

describe('zoomCamera', () => {
  const cursor: Point = { x: 100, y: 80 };
  const cameras: Camera[] = [
    { x: 0, y: 0, z: 1 },
    { x: 50, y: -30, z: 2 },
    { x: -100, y: 75, z: 0.25 },
  ];
  const deltas = [-0.25, -0.1, 0.1, 0.25];

  it.each(cameras)(
    'keeps the canvas point under the cursor stable at camera %j',
    (c0) => {
      for (const dz of deltas) {
        const before = screenToCanvas(cursor, c0);
        const c1 = zoomCamera(c0, cursor, dz);
        const after = canvasToScreen(before, c1);
        closeTo(after, cursor);
      }
    },
  );

  it('zooms in for negative dz and out for positive dz', () => {
    const c0: Camera = { x: 0, y: 0, z: 1 };
    expect(zoomCamera(c0, cursor, -0.5).z).toBeGreaterThan(1);
    expect(zoomCamera(c0, cursor, 0.5).z).toBeLessThan(1);
  });
});

describe('fitCamera', () => {
  it('with no margin, maps the grid corners exactly to a square viewport', () => {
    const cam = fitCamera(10, { width: 100, height: 100 }, 0);
    closeTo(canvasToScreen({ x: 0, y: 0 }, cam), { x: 0, y: 0 });
    closeTo(canvasToScreen({ x: 10, y: 10 }, cam), { x: 100, y: 100 });
  });

  it('letter-boxes a square grid centered in a wider viewport', () => {
    const cam = fitCamera(10, { width: 200, height: 100 }, 0);
    closeTo(canvasToScreen({ x: 0, y: 0 }, cam), { x: 50, y: 0 });
    closeTo(canvasToScreen({ x: 10, y: 10 }, cam), { x: 150, y: 100 });
  });

  it('shrinks the grid by the requested margin ratio on each side', () => {
    const cam = fitCamera(10, { width: 100, height: 100 }, 0.1);
    closeTo(canvasToScreen({ x: 0, y: 0 }, cam), { x: 10, y: 10 });
    closeTo(canvasToScreen({ x: 10, y: 10 }, cam), { x: 90, y: 90 });
  });
});
