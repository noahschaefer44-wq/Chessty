import { Chess, type Move, type Square } from 'chess.js';
import type { Key } from 'chessground/types';

export const START_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

export type Color = 'white' | 'black';

export const turnColor = (c: Chess): Color => (c.turn() === 'w' ? 'white' : 'black');

/** Legale Züge im Chessground-Format. */
export function dests(c: Chess): Map<Key, Key[]> {
  const map = new Map<Key, Key[]>();
  for (const m of c.moves({ verbose: true })) {
    const list = map.get(m.from as Key) ?? [];
    list.push(m.to as Key);
    map.set(m.from as Key, list);
  }
  return map;
}

export const uci = (m: Pick<Move, 'from' | 'to' | 'promotion'>) => m.from + m.to + (m.promotion ?? '');

export function parseUci(u: string) {
  return { from: u.slice(0, 2) as Square, to: u.slice(2, 4) as Square, promotion: u[4] };
}

/** Zug in UCI oder SAN ausführen; gibt null zurück, wenn illegal. */
export function tryMove(c: Chess, move: string): Move | null {
  try {
    if (/^[a-h][1-8][a-h][1-8][qrbn]?$/.test(move)) return c.move(parseUci(move));
    return c.move(move);
  } catch {
    return null;
  }
}

export function isPromotion(c: Chess, from: string, to: string): boolean {
  const p = c.get(from as Square);
  return !!p && p.type === 'p' && (to[1] === '8' || to[1] === '1');
}

export function sanToUci(fen: string, san: string): string | null {
  const c = new Chess(fen);
  const m = tryMove(c, san);
  return m ? uci(m) : null;
}

export function uciToSan(fen: string, u: string): string {
  const c = new Chess(fen);
  const m = tryMove(c, u);
  return m ? m.san : u;
}

/** Zugnummer-Präfix für Anzeige, z. B. "12." oder "12…" */
export function moveLabel(fen: string, san: string): string {
  const parts = fen.split(' ');
  const n = parts[5] ?? '1';
  return parts[1] === 'w' ? `${n}. ${san}` : `${n}… ${san}`;
}

export const PIECE_VALUE: Record<string, number> = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };

export function material(c: Chess): { white: number; black: number } {
  let white = 0;
  let black = 0;
  for (const row of c.board())
    for (const sq of row)
      if (sq) {
        if (sq.color === 'w') white += PIECE_VALUE[sq.type];
        else black += PIECE_VALUE[sq.type];
      }
  return { white, black };
}

export const pieceName: Record<string, string> = {
  p: 'Bauer',
  n: 'Springer',
  b: 'Läufer',
  r: 'Turm',
  q: 'Dame',
  k: 'König',
};

/** Deutsche Notation für Anzeige (K, D, T, L, S). */
export function sanDe(san: string): string {
  return san.replace(/[KQRBN]/g, (ch) => ({ K: 'K', Q: 'D', R: 'T', B: 'L', N: 'S' })[ch]!);
}
