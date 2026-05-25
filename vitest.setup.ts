import '@testing-library/jest-dom/vitest';
import 'vitest-canvas-mock';

// jsdom does not implement pointer capture — shim as no-ops so production
// code can call setPointerCapture / releasePointerCapture without guards.
if (!HTMLElement.prototype.setPointerCapture) {
  HTMLElement.prototype.setPointerCapture = () => {};
  HTMLElement.prototype.releasePointerCapture = () => {};
  HTMLElement.prototype.hasPointerCapture = () => false;
}
