import { Chess } from 'chess.js';

export interface OpeningRow {
  eco: string;
  name: string;
  moves: string[];
}

let cache: Promise<OpeningRow[]> | null = null;
export function loadOpenings(): Promise<OpeningRow[]> {
  cache ??= fetch(new URL('data/openings.json', document.baseURI))
    .then((r) => r.json())
    .then((rows: [string, string, string][]) =>
      rows.map(([eco, name, pgn]) => ({ eco, name, moves: pgn.replace(/\d+\.\s*/g, '').split(/\s+/).filter(Boolean) })),
    );
  return cache;
}

/** Name der längsten passenden Eröffnung für eine Zugfolge. */
export async function openingName(moves: string[]): Promise<string> {
  const rows = await loadOpenings();
  let best: OpeningRow | null = null;
  for (const r of rows) {
    if (r.moves.length <= moves.length && r.moves.every((m, i) => m === moves[i]) && (!best || r.moves.length > best.moves.length)) best = r;
  }
  return best ? `${best.eco} ${best.name}` : '';
}

export function fenAfter(moves: string[]): string {
  const c = new Chess();
  for (const m of moves) c.move(m);
  return c.fen();
}
