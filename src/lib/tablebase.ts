// Lichess-Endspieldatenbank (bis 7 Steine). Nur online – offline übernimmt Stockfish.
export interface TbMove {
  uci: string;
  san: string;
  category: 'win' | 'loss' | 'draw' | 'cursed-win' | 'blessed-loss' | 'unknown' | 'maybe-win' | 'maybe-loss';
  dtm: number | null;
  dtz: number | null;
}
export interface TbResult {
  category: string;
  dtm: number | null;
  moves: TbMove[];
}

const cache = new Map<string, TbResult>();

export async function probe(fen: string): Promise<TbResult | null> {
  const pieces = fen.split(' ')[0].replace(/[^a-zA-Z]/g, '').length;
  if (pieces > 7 || !navigator.onLine) return null;
  if (cache.has(fen)) return cache.get(fen)!;
  try {
    const r = await fetch(`https://tablebase.lichess.ovh/standard?fen=${encodeURIComponent(fen)}`);
    if (!r.ok) return null;
    const data = (await r.json()) as TbResult;
    cache.set(fen, data);
    return data;
  } catch {
    return null;
  }
}

/** Bester Zug aus der Datenbank: gewinnt am schnellsten bzw. verliert am langsamsten. */
export function bestTbMove(r: TbResult): TbMove | null {
  // Die API sortiert bereits vom besten Zug aus Sicht der Seite am Zug
  return r.moves[0] ?? null;
}

export const tbLabel: Record<string, string> = {
  win: 'Gewinn',
  loss: 'Verlust',
  draw: 'Remis',
  'cursed-win': 'Gewinn (50-Züge-Regel → Remis)',
  'blessed-loss': 'Verlust (50-Züge-Regel → Remis)',
  unknown: 'Unbekannt',
};
