import { Theme } from '@radix-ui/themes';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import { vi } from 'vitest';
import { GameProvider } from '../state/context';
import { Header } from './Header';
import { SidePanel } from './SidePanel';

afterEach(() => {
  cleanup();
});

function renderPanel({ size = 50, stepsPerSecond = 10 } = {}) {
  render(
    <GameProvider size={size} stepsPerSecond={stepsPerSecond}>
      <Theme>
        <Header onExport={vi.fn()} onImport={vi.fn()} />
        <SidePanel />
      </Theme>
    </GameProvider>,
  );
}

describe('SidePanel — Simulation speed', () => {
  it('renders the speed slider seeded with the current speed', () => {
    renderPanel({ stepsPerSecond: 24 });
    const slider = screen.getByRole('slider');
    expect(slider).toHaveAttribute('aria-valuenow', '24');
  });

  it('arrow-keying the slider updates the speed in state', async () => {
    renderPanel({ stepsPerSecond: 10 });
    const user = userEvent.setup();
    const slider = screen.getByRole('slider');
    slider.focus();
    await user.keyboard('{ArrowRight}');
    expect(slider).toHaveAttribute('aria-valuenow', '11');
  });
});

describe('SidePanel — Grid configuration', () => {
  it('seeds the Grid size input with the current size', () => {
    renderPanel({ size: 42 });
    expect(screen.getByLabelText(/grid size/i)).toHaveValue(42);
  });

  it('Apply Resize starts a new game at the typed size', async () => {
    renderPanel({ size: 20 });
    const user = userEvent.setup();
    const input = screen.getByLabelText(/grid size/i);
    await user.clear(input);
    await user.type(input, '7');
    await user.click(screen.getByRole('button', { name: /apply resize/i }));
    expect(screen.getByLabelText(/grid size/i)).toHaveValue(7);
  });
});

describe('SidePanel — Generation', () => {
  it('Randomize Cells fills the grid with live cells', async () => {
    renderPanel({ size: 30 });
    expect(screen.getByText(/^alive/i)).toHaveTextContent('Alive 0');
    fireEvent.click(
      screen.getByRole('button', { name: /randomize cells/i }),
    );
    await waitFor(() => {
      const aliveText =
        screen.getByText(/^alive/i).textContent?.replace(/\D/g, '') ?? '0';
      expect(Number(aliveText)).toBeGreaterThan(0);
    });
  });
});

describe('SidePanel — Cell rules', () => {
  it('lists Conway survival and birth rules', () => {
    renderPanel();
    expect(screen.getByText(/survival:.*2 or 3 neighbors/i)).toBeInTheDocument();
    expect(screen.getByText(/birth:.*exactly 3 neighbors/i)).toBeInTheDocument();
  });
});
