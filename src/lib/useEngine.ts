import { useEffect, useState } from 'react';
import { engine, type EngineLine } from './engine';

/** Live-Analyse einer Stellung (nur wenn aktiviert). */
export function useEngine(fen: string, enabled: boolean, depth = 16, multipv = 1) {
  const [lines, setLines] = useState<EngineLine[]>([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (!enabled) {
      setLines([]);
      return;
    }
    let alive = true;
    setLines([]);
    setLoading(true);
    engine
      .analyse(fen, {
        depth,
        multipv,
        onInfo: (l) => alive && l[0]?.depth >= 6 && setLines([...l]),
      })
      .then((r) => {
        if (!alive) return;
        setLines(r.lines);
        setLoading(false);
      })
      .catch(() => setLoading(false));
    return () => {
      alive = false;
    };
  }, [fen, enabled, depth, multipv]);
  return { lines, loading };
}
