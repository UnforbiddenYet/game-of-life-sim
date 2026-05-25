export interface Point {
  readonly x: number;
  readonly y: number;
}

export interface Camera {
  // camera translation, in canvas (world) units
  readonly x: number;
  readonly y: number;
  // zoom factor; 1 = 100%, > 1 zooms in, < 1 zooms out
  readonly z: number;
}

export interface Viewport {
  readonly width: number;
  readonly height: number;
}
