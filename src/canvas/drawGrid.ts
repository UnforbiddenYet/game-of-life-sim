import type { Camera, Viewport } from '../types/camera';
import type { CanvasTheme } from '../types/canvas';
import type { Grid } from '../types/grid';

export function drawGrid(
  ctx: CanvasRenderingContext2D,
  grid: Grid,
  camera: Camera,
  viewport: Viewport,
  theme: CanvasTheme,
): void {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = theme.background;
  ctx.fillRect(0, 0, viewport.width, viewport.height);

  ctx.setTransform(camera.z, 0, 0, camera.z, camera.x * camera.z, camera.y * camera.z);
  ctx.fillStyle = theme.alive;
  for (let y = 0; y < grid.size; y++) {
    for (let x = 0; x < grid.size; x++) {
      if (grid.cells[y * grid.size + x] === 1) {
        ctx.fillRect(x, y, 1, 1);
      }
    }
  }
}
