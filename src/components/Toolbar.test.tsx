import { Theme } from '@radix-ui/themes';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ComponentProps, ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { TickContext } from '../state/hooks';
import { Toolbar } from './Toolbar';

afterEach(() => {
  cleanup();
});

function TickHarness({
  generation,
  alive,
  children,
}: {
  generation: number;
  alive: number;
  children: ReactNode;
}) {
  return (
    <TickContext.Provider value={{ generation, alive }}>
      <Theme>{children}</Theme>
    </TickContext.Provider>
  );
}

function renderToolbar(
  overrides: Partial<ComponentProps<typeof Toolbar>> = {},
  tick: { generation: number; alive: number } = { generation: 12, alive: 34 },
) {
  const props: ComponentProps<typeof Toolbar> = {
    mode: 'paused',
    stepsPerSecond: 10,
    onTogglePlayPause: vi.fn(),
    onStep: vi.fn(),
    onClear: vi.fn(),
    onRandomize: vi.fn(),
    onOpenNewGame: vi.fn(),
    onSetSpeed: vi.fn(),
    onExport: vi.fn(),
    onImport: vi.fn(),
    ...overrides,
  };

  render(
    <TickHarness generation={tick.generation} alive={tick.alive}>
      <Toolbar {...props} />
    </TickHarness>,
  );
  return props;
}

describe('Toolbar', () => {
  it('surfaces the main controls and simulation stats', () => {
    renderToolbar();
    const statsContainer = screen.getByLabelText(/simulation statistics/i);
    const toolbarMeta = screen.getByText(/simulation speed/i).closest('label');

    expect(
      screen.getByRole('button', { name: /play simulation/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /step simulation/i }),
    ).toBeInTheDocument();
    expect(statsContainer).toHaveTextContent(/generation\s*12/i);
    expect(statsContainer).toHaveTextContent(/alive\s*34/i);
    expect(toolbarMeta).toHaveTextContent(/speed\s*10\s*sps/i);
  });

  it('dispatches control callbacks from buttons and the speed slider', async () => {
    const props = renderToolbar({ stepsPerSecond: 17 });
    const user = userEvent.setup();

    fireEvent.click(screen.getByRole('button', { name: /play simulation/i }));
    fireEvent.click(screen.getByRole('button', { name: /step simulation/i }));
    fireEvent.click(screen.getByRole('button', { name: /randomize grid/i }));
    fireEvent.click(screen.getByRole('button', { name: /clear grid/i }));
    fireEvent.click(screen.getByRole('button', { name: /new game/i }));
    const slider = screen.getByRole('slider');
    slider.focus();
    await user.keyboard('{ArrowRight}');

    expect(props.onTogglePlayPause).toHaveBeenCalledTimes(1);
    expect(props.onStep).toHaveBeenCalledTimes(1);
    expect(props.onRandomize).toHaveBeenCalledTimes(1);
    expect(props.onClear).toHaveBeenCalledTimes(1);
    expect(props.onOpenNewGame).toHaveBeenCalledTimes(1);
    expect(props.onSetSpeed).toHaveBeenCalledWith(18);
  });

  it('Export button triggers onExport', () => {
    const props = renderToolbar();
    fireEvent.click(screen.getByRole('button', { name: /export grid/i }));
    expect(props.onExport).toHaveBeenCalledTimes(1);
  });

  it('selecting a file via Import calls onImport with that file', async () => {
    const props = renderToolbar();
    const user = userEvent.setup();

    const file = new File(['{"version":1}'], 'game.json', {
      type: 'application/json',
    });
    const fileInput = screen.getByLabelText(
      /import grid from json file/i,
    ) as HTMLInputElement;
    await user.upload(fileInput, file);

    expect(props.onImport).toHaveBeenCalledTimes(1);
    expect(props.onImport).toHaveBeenCalledWith(file);
  });
});
