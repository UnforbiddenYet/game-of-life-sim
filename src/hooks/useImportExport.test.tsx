import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { SerializedGame } from '../types/serialize';
import { GameProvider } from '../state/context';
import { useGameUi } from '../state/hooks';
import { useImportExport } from './useImportExport';

function wrapper({ children }: { children: ReactNode }) {
  return <GameProvider size={10}>{children}</GameProvider>;
}

function jsonFile(payload: SerializedGame): File {
  return new File([JSON.stringify(payload)], 'game.json', {
    type: 'application/json',
  });
}

describe('useImportExport', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('importGame replaces the game with the file contents', async () => {
    const { result } = renderHook(
      () => ({ io: useImportExport(), ui: useGameUi() }),
      { wrapper },
    );

    expect(result.current.ui.size).toBe(10);

    const payload: SerializedGame = {
      version: 1,
      size: 7,
      generation: 99,
      colorized: false,
      cells: [[0, 0], [6, 6]],
    };

    await act(async () => {
      await result.current.io.importGame(jsonFile(payload));
    });

    expect(result.current.ui.size).toBe(7);
    expect(result.current.io.importError).toBeNull();
  });

  it('importGame on malformed JSON exposes an importError without changing state', async () => {
    const { result } = renderHook(
      () => ({ io: useImportExport(), ui: useGameUi() }),
      { wrapper },
    );
    const garbage = new File(['not json'], 'bad.json', {
      type: 'application/json',
    });

    await act(async () => {
      await result.current.io.importGame(garbage);
    });

    expect(result.current.io.importError).toMatch(/import failed/i);
    expect(result.current.ui.size).toBe(10);
  });

  it('importGame on a wrong-version payload reports the version mismatch', async () => {
    const { result } = renderHook(() => useImportExport(), { wrapper });
    const file = new File([JSON.stringify({ version: 99 })], 'old.json');

    await act(async () => {
      await result.current.importGame(file);
    });

    expect(result.current.importError).toMatch(/version/i);
  });

  it('dismissError clears a pending importError', async () => {
    const { result } = renderHook(() => useImportExport(), { wrapper });
    await act(async () => {
      await result.current.importGame(new File(['nope'], 'bad.json'));
    });
    expect(result.current.importError).not.toBeNull();

    act(() => result.current.dismissError());
    expect(result.current.importError).toBeNull();
  });

  it('importError auto-dismisses after the timeout elapses', async () => {
    const { result } = renderHook(() => useImportExport(), { wrapper });
    await act(async () => {
      await result.current.importGame(new File(['nope'], 'bad.json'));
    });
    expect(result.current.importError).not.toBeNull();

    act(() => {
      vi.advanceTimersByTime(6000);
    });
    expect(result.current.importError).toBeNull();
  });
});
