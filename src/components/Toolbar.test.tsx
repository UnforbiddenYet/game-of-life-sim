import userEvent from "@testing-library/user-event";
import { Theme } from "@radix-ui/themes";
import type { ComponentProps } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Toolbar } from "./Toolbar";

afterEach(() => {
  cleanup();
});

function renderToolbar(
  overrides: Partial<ComponentProps<typeof Toolbar>> = {},
) {
  const props: ComponentProps<typeof Toolbar> = {
    mode: "paused",
    generation: 12,
    alive: 34,
    size: 50,
    stepsPerSecond: 10,
    onTogglePlayPause: vi.fn(),
    onStep: vi.fn(),
    onClear: vi.fn(),
    onRandomize: vi.fn(),
    onOpenNewGame: vi.fn(),
    onSetSpeed: vi.fn(),
    ...overrides,
  };

  render(
    <Theme>
      <Toolbar {...props} />
    </Theme>,
  );
  return props;
}

describe("Toolbar", () => {
  it("surfaces the main controls and simulation stats", () => {
    renderToolbar();
    const statsContainer = screen.getByLabelText(/simulation statistics/i);
    const toolbarMeta = screen.getByText(/simulation speed/i).closest("label");

    expect(
      screen.getByRole("button", { name: /play simulation/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /step simulation/i }),
    ).toBeInTheDocument();
    expect(statsContainer).toHaveTextContent(/generation\s*12/i);
    expect(statsContainer).toHaveTextContent(/alive\s*34/i);
    expect(toolbarMeta).toHaveTextContent(/speed\s*10\s*sps/i);
  });

  it("dispatches control callbacks from buttons and the speed slider", async () => {
    const props = renderToolbar({ stepsPerSecond: 17 });
    const user = userEvent.setup();

    fireEvent.click(screen.getByRole("button", { name: /play simulation/i }));
    fireEvent.click(screen.getByRole("button", { name: /step simulation/i }));
    fireEvent.click(screen.getByRole("button", { name: /randomize grid/i }));
    fireEvent.click(screen.getByRole("button", { name: /clear grid/i }));
    fireEvent.click(screen.getByRole("button", { name: /new game/i }));
    const slider = screen.getByRole("slider");
    slider.focus();
    await user.keyboard("{ArrowRight}");

    expect(props.onTogglePlayPause).toHaveBeenCalledTimes(1);
    expect(props.onStep).toHaveBeenCalledTimes(1);
    expect(props.onRandomize).toHaveBeenCalledTimes(1);
    expect(props.onClear).toHaveBeenCalledTimes(1);
    expect(props.onOpenNewGame).toHaveBeenCalledTimes(1);
    expect(props.onSetSpeed).toHaveBeenCalledWith(18);
  });
});
