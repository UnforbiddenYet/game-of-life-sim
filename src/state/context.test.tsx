import { act, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import * as Actions from './actions';
import { GameProvider } from './context';
import { useGameDispatch, useGameState } from './hooks';

function Probe() {
  const state = useGameState();
  const dispatch = useGameDispatch();
  return (
    <button onClick={() => dispatch(Actions.play())}>{state.mode}</button>
  );
}

describe('GameProvider', () => {
  it('exposes state and propagates dispatched actions back through the hook', () => {
    render(
      <GameProvider size={5}>
        <Probe />
      </GameProvider>,
    );
    const btn = screen.getByRole('button');
    expect(btn.textContent).toBe('paused');
    act(() => btn.click());
    expect(btn.textContent).toBe('playing');
  });

  it('throws a useful error when hooks are used outside the provider', () => {
    const silenced = vi.spyOn(console, 'error').mockImplementation(() => {});
    try {
      expect(() => render(<Probe />)).toThrow(/GameProvider/);
    } finally {
      silenced.mockRestore();
    }
  });
});
