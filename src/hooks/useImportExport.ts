import { useCallback, useEffect, useState } from 'react';
import type { Engine } from '../core/engine';
import { fromJSON, toJSON } from '../core/serialize';
import * as Actions from '../state/actions';
import { useEngine, useGameDispatch } from '../state/hooks';

export interface UseImportExport {
  exportGame: () => void;
  importGame: (file: File) => Promise<void>;
  importError: string | null;
  dismissError: () => void;
}

const ERROR_TIMEOUT_MS = 6000;

export function useImportExport(): UseImportExport {
  const engine = useEngine();
  const dispatch = useGameDispatch();
  const [importError, setImportError] = useState<string | null>(null);

  useEffect(() => {
    if (importError === null) return;
    const id = window.setTimeout(() => setImportError(null), ERROR_TIMEOUT_MS);
    return () => window.clearTimeout(id);
  }, [importError]);

  const exportGame = useCallback(() => {
    downloadGame(engine);
  }, [engine]);

  const importGame = useCallback(
    async (file: File): Promise<void> => {
      try {
        const text = await file.text();
        const parsed: unknown = JSON.parse(text);
        const snapshot = fromJSON(parsed);
        engine.importSnapshot(snapshot.grid, snapshot.generation);
        dispatch(Actions.setSize(snapshot.size));
        setImportError(null);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        setImportError(`Import failed: ${message}`);
      }
    },
    [engine, dispatch],
  );

  const dismissError = useCallback(() => setImportError(null), []);

  return { exportGame, importGame, importError, dismissError };
}

function downloadGame(engine: Engine): void {
  const json = toJSON(engine.current, engine.generation);
  const blob = new Blob([JSON.stringify(json)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `game-of-life-${json.size}x${json.size}-gen${json.generation}.json`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
