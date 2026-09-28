import { Chess, type Square } from 'chess.js';
import { loadDb } from './puzzles';
import { PIECE_VALUE, parseUci } from './chess';

export interface Pos {
  id: string;
  /** Stellung nach dem ersten (gegnerischen) Puzzlezug */
  fen: string;
  /** Lösungszüge ab fen (UCI) */
  line: string[];
  rating: number;
}

/** Zufällige Stellungen aus der Puzzle-Datenbank (Stellung nach dem Gegnerzug). */
export async function randomPositions(n: number, filter: (p: Pos) => boolean = () => true, lo = 0, hi = 3500): Promise<Pos[]> {
  const db = await loadDb();
  const out: Pos[] = [];
  let guard = 0;
  while (out.length < n && guard++ < 5000) {
    const p = db.puzzles[Math.floor(Math.random() * db.puzzles.length)];
    if (p[3] < lo || p[3] > hi) continue;
    const c = new Chess(p[1]);
    const mv = p[2].split(' ');
    c.move(parseUci(mv[0]));
    const pos = { id: p[0], fen: c.fen(), line: mv.slice(1), rating: p[3] };
    if (!out.some((o) => o.id === pos.id) && filter(pos)) out.push(pos);
  }
  return out;
}

/** Hängende Figuren: angegriffen und entweder ungedeckt oder von einer billigeren Figur angegriffen. */
export function hangingPieces(fen: string): string[] {
  const c = new Chess(fen);
  const out: string[] = [];
  for (const row of c.board())
    for (const sq of row) {
      if (!sq || sq.type === 'k') continue;
      const enemy = sq.color === 'w' ? 'b' : 'w';
      const attackers = c.attackers(sq.square as Square, enemy);
      if (!attackers.length) continue;
      const defenders = c.attackers(sq.square as Square, sq.color);
      const cheapest = Math.min(...attackers.map((a) => PIECE_VALUE[c.get(a as Square)!.type] || 100));
      if (!defenders.length || cheapest < PIECE_VALUE[sq.type]) out.push(sq.square);
    }
  return out;
}

/** Stellung mit vertauschtem Zugrecht (für „Was droht?“). null, wenn illegal. */
export function nullMove(fen: string): string | null {
  const f = fen.split(' ');
  f[1] = f[1] === 'w' ? 'b' : 'w';
  f[3] = '-';
  const out = f.join(' ');
  try {
    const c = new Chess(fen);
    if (c.inCheck()) return null;
    new Chess(out);
    return out;
  } catch {
    return null;
  }
}
