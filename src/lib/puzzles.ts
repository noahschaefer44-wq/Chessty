export interface Puzzle {
  id: string;
  fen: string;
  moves: string[];
  rating: number;
  themes: string[];
}
interface Db {
  bands: [number, number][];
  puzzles: [string, string, string, number, string[]][];
  themes: Record<string, number[][]>;
}

let dbPromise: Promise<Db> | null = null;
export function loadDb(): Promise<Db> {
  dbPromise ??= fetch(new URL('data/puzzles.json', document.baseURI)).then((r) => r.json());
  return dbPromise;
}

export const BAND_NAMES = ['Einsteiger (<1200)', 'Fortgeschritten (1200–1600)', 'Experte (1600–2000)', 'Meister (2000+)'];
export const bandFor = (rating: number) => (rating < 1200 ? 0 : rating < 1600 ? 1 : rating < 2000 ? 2 : 3);

/** Höchstens 10 Puzzles pro Runde – egal welcher Modus. */
export const MAX_PER_ROUND = 10;

const shuffle = <T,>(a: T[]) => {
  const b = [...a];
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
};

const toPuzzle = (p: Db['puzzles'][number]): Puzzle => ({
  id: p[0],
  fen: p[1],
  moves: p[2].split(' '),
  rating: p[3],
  themes: p[4],
});

export async function pickRound(theme: string, band: number, seen: string[], rush = false): Promise<Puzzle[]> {
  const db = await loadDb();
  const seenSet = new Set(seen);
  let pool: number[];
  if (rush) {
    // Rush: aufsteigende Schwierigkeit über alle Motive und Stufen
    const all = Object.values(db.themes).flatMap((b) => b.flat());
    const uniq = [...new Set(all)].map((i) => db.puzzles[i]).sort((a, b) => a[3] - b[3]);
    const out: Puzzle[] = [];
    for (let k = 0; k < MAX_PER_ROUND; k++) {
      const lo = Math.floor((k / MAX_PER_ROUND) * uniq.length * 0.9);
      const slice = uniq.slice(lo, lo + 60).filter((p) => !out.some((o) => o.id === p[0]));
      out.push(toPuzzle(slice[Math.floor(Math.random() * slice.length)]));
    }
    return out;
  }
  if (theme === 'mix') pool = [...new Set(Object.values(db.themes).flatMap((b) => b[band]))];
  else pool = db.themes[theme]?.[band] ?? [];
  const fresh = pool.filter((i) => !seenSet.has(db.puzzles[i][0]));
  const chosen = shuffle(fresh.length >= MAX_PER_ROUND ? fresh : pool).slice(0, MAX_PER_ROUND);
  return chosen.map((i) => toPuzzle(db.puzzles[i])).sort((a, b) => a.rating - b.rating);
}

/** Puzzles zu bestimmten Motiven und Stärkestufen (für Praxisteile und den Tagesplan). */
export async function pickThemed(themes: string[], bands: number[], n: number, seen: string[] = []): Promise<Puzzle[]> {
  const db = await loadDb();
  const seenSet = new Set(seen);
  const pool = [...new Set(themes.flatMap((t) => bands.flatMap((b) => db.themes[t]?.[b] ?? [])))];
  const fresh = pool.filter((i) => !seenSet.has(db.puzzles[i][0]));
  return shuffle(fresh.length >= n ? fresh : pool)
    .slice(0, Math.min(n, MAX_PER_ROUND))
    .map((i) => toPuzzle(db.puzzles[i]))
    .sort((a, b) => a.rating - b.rating);
}
