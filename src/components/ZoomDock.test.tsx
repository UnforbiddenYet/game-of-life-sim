import { Theme } from "@radix-ui/themes";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { fitCamera } from "../core/camera";
import { GameProvider } from "../state/context";
import type { Camera, Viewport } from "../types/camera";
import { ZoomDock } from "./ZoomDock";

function renderDock({
  viewport = { width: 200, height: 200 } as Viewport,
  size = 50,
} = {}) {
  const setCamera = vi.fn();
  render(
    <GameProvider size={size}>
      <Theme>
        <ZoomDock viewport={viewport} setCamera={setCamera} />
      </Theme>
    </GameProvider>,
  );
  return { setCamera };
}

const applyUpdater = (
  setCamera: ReturnType<typeof vi.fn>,
  prev: Camera,
): Camera => {
  const [arg] = setCamera.mock.calls[0] ?? [];
  return typeof arg === "function" ? arg(prev) : arg;
};

afterEach(() => cleanup());

describe("ZoomDock", () => {
  it("Zoom in produces a camera with larger zoom", async () => {
    const { setCamera } = renderDock();
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: /zoom in/i }));
    const next = applyUpdater(setCamera, { x: 0, y: 0, z: 10 });
    expect(next.z).toBeGreaterThan(10);
  });

  it("Zoom out produces a camera with smaller zoom", async () => {
    const { setCamera } = renderDock();
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: /zoom out/i }));
    const next = applyUpdater(setCamera, { x: 0, y: 0, z: 10 });
    expect(next.z).toBeLessThan(10);
  });

  it("Reset zoom returns the fit camera for the current grid + viewport", async () => {
    const viewport: Viewport = { width: 240, height: 160 };
    const size = 32;
    const { setCamera } = renderDock({ viewport, size });
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: /reset zoom/i }));
    const [arg] = setCamera.mock.calls[0] ?? [];
    expect(arg).toEqual(fitCamera(size, viewport));
  });
});
