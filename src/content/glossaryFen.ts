import { Chess } from 'chess.js';
import type { GlossaryEntry } from './glossary';

const START = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

/** Stellung eines Eintrags: FEN, optional mit Zügen danach. */
export function glossaryFen(g: GlossaryEntry): string {
  const c = new Chess(g.fen ?? START);
  for (const m of g.moves ?? []) c.move(m);
  return c.fen();
}
