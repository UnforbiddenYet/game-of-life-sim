import { Theme } from '@radix-ui/themes';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { GameProvider } from '../state/context';
import { CanvasStatus } from './CanvasStatus';
import { PlaybackDock } from './PlaybackDock';

afterEach(() => {
  cleanup();
});

function renderDock() {
  render(
    <GameProvider size={5} stepsPerSecond={12}>
      <Theme>
        <CanvasStatus />
        <PlaybackDock />
      </Theme>
    </GameProvider>,
  );
}

describe('PlaybackDock', () => {
  it('starts paused with Play visible and Undo disabled', () => {
    renderDock();
    expect(screen.getByText(/simulation paused/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /play simulation/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /undo last step/i }),
    ).toBeDisabled();
  });

  it('Step enables Undo after one tick while paused', async () => {
    renderDock();
    expect(
      screen.getByRole('button', { name: /undo last step/i }),
    ).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: /step simulation/i }));
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: /undo last step/i }),
      ).not.toBeDisabled(),
    );
  });

  it('Clear after Step puts Undo back in the disabled state', async () => {
    renderDock();
    fireEvent.click(screen.getByRole('button', { name: /step simulation/i }));
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: /undo last step/i }),
      ).not.toBeDisabled(),
    );
    fireEvent.click(screen.getByRole('button', { name: /clear grid/i }));
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: /undo last step/i }),
      ).toBeDisabled(),
    );
  });

  it('clicking Play swaps the pill to running with the current speed', () => {
    renderDock();
    fireEvent.click(screen.getByRole('button', { name: /play simulation/i }));
    expect(screen.getByRole('status')).toHaveTextContent(
      /simulation running at 12 steps\/sec/i,
    );
    expect(
      screen.getByRole('button', { name: /pause simulation/i }),
    ).toBeInTheDocument();
  });
});
