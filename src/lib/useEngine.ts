import { useEffect, useState } from 'react';
import { engine, type EngineLine } from './engine';

/** Live-Analyse einer Stellung (nur wenn aktiviert). */
export function useEngine(fen: string, enabled: boolean, depth = 16, multipv = 1) {
  const [state, setState] = useState<{ fen: string; lines: EngineLine[] }>({ fen: '', lines: [] });
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (!enabled) return;
    let alive = true;
    setLoading(true);
    engine
      .analyse(fen, {
        depth,
        multipv,
        onInfo: (l) => alive && l[0]?.depth >= 6 && setState({ fen, lines: [...l] }),
      })
      .then((r) => {
        if (!alive) return;
        setState({ fen, lines: r.lines });
        setLoading(false);
      })
      .catch(() => setLoading(false));
    return () => {
      alive = false;
    };
  }, [fen, enabled, depth, multipv]);
  // Nur Analysen der aktuell gezeigten Stellung zurückgeben – veraltete Züge wären dort illegal
  const lines = enabled && state.fen === fen ? state.lines : [];
  return { lines, loading };
}
