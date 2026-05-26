import '@testing-library/jest-dom/vitest';
import 'vitest-canvas-mock';

// jsdom does not implement pointer capture — shim as no-ops so production
// code can call setPointerCapture / releasePointerCapture without guards.
if (!HTMLElement.prototype.setPointerCapture) {
  HTMLElement.prototype.setPointerCapture = () => {};
  HTMLElement.prototype.releasePointerCapture = () => {};
  HTMLElement.prototype.hasPointerCapture = () => false;
}

// jsdom does not implement ResizeObserver — stub as a no-op. Tests that need
// a real size pass width/height explicitly instead of relying on measurement.
if (typeof globalThis.ResizeObserver === 'undefined') {
  globalThis.ResizeObserver = class {
    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
  };
}
