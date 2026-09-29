import { useEffect, useRef, useState } from 'react';
import { Chess } from 'chess.js';
import { explainWrongMove, type WrongMoveInfo } from './wrongMove';
import { sanDe, tryMove } from './chess';
import { sound } from './sound';
import type { Explain } from '../content/types';

export interface WrongState {
  fen: string;
  uci: string;
  san: string;
  known?: Explain;
  info: WrongMoveInfo | null;
  loading: boolean;
}

/**
 * Gemeinsame Logik für falsche Züge: Stellung nach dem Fehler stehen lassen,
 * Engine-Erklärung holen, Widerlegung vorspielen, auf Wunsch zurücksetzen.
 * `view` überschreibt die Brettanzeige, solange ein Fehler angezeigt wird.
 */
export function useWrongMove() {
  const [wrong, setWrong] = useState<WrongState | null>(null);
  const [view, setView] = useState<{ fen: string; last?: [string, string]; arrows: string[] } | null>(null);
  const token = useRef(0);
  const timers = useRef<number[]>([]);
  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };
  useEffect(() => clearTimers, []);

  async function check(
    fen: string,
    uci: string,
    expected?: string,
    opts: { known?: Explain; openingMoves?: string[]; depth?: number } = {},
  ): Promise<WrongMoveInfo | null> {
    clearTimers();
    const c = new Chess(fen);
    const m = tryMove(c, uci);
    if (!m) return null;
    const t = ++token.current;
    setWrong({ fen, uci, san: sanDe(m.san), known: opts.known, info: null, loading: true });
    setView({ fen: c.fen(), last: [m.from, m.to], arrows: ['!' + uci.slice(0, 4)] });
    try {
      const info = await explainWrongMove(fen, uci, expected, { depth: opts.depth ?? 12, openingMoves: opts.openingMoves });
      if (t !== token.current) return null;
      setWrong({ fen, uci, san: sanDe(m.san), known: opts.known, info, loading: false });
      setView((v) => (v ? { ...v, arrows: info.arrows } : v));
      return info;
    } catch {
      if (t !== token.current) return null;
      setWrong((w) => (w ? { ...w, loading: false } : w));
      return null;
    }
  }

  function replay() {
    const info = wrong?.info;
    if (!info) return;
    clearTimers();
    setView({ fen: info.fens[0], last: [wrong!.uci.slice(0, 2), wrong!.uci.slice(2, 4)], arrows: ['!' + wrong!.uci.slice(0, 4)] });
    info.fens.slice(1).forEach((f, i) =>
      timers.current.push(
        window.setTimeout(() => {
          setView({ fen: f, last: info.moves[i], arrows: [] });
          sound.move();
        }, 800 * (i + 1)),
      ),
    );
  }

  function clear() {
    clearTimers();
    token.current++;
    setWrong(null);
    setView(null);
  }

  return { wrong, view, check, replay, clear };
}
