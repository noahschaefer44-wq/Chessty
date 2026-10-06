// Variante des Tages: aus dem Datum wird eine zufällige, aber spielbare Kombination von Regel-Bausteinen gemischt.
import { emptyDesign, designRules, type Design, type Base } from './assistant';
import { newGame, legalMoves } from './engine';

/** Kleiner, deterministischer Zufallsgenerator (mulberry32) */
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const seedOf = (date: string) => [...date].reduce((h, c) => Math.imul(h ^ c.charCodeAt(0), 16777619), 2166136261);

const BLOCKS: { name: string; apply: (d: Design) => void }[] = [
  { name: 'Einsetzen', apply: (d) => (d.rules.drops = true) },
  { name: 'Explosionen', apply: (d) => (d.rules.atomic = true) },
  { name: '3 Schachs', apply: (d) => (d.rules.checksToWin = 3) },
  { name: 'Hügel', apply: (d) => (d.rules.hill = true) },
  { name: 'Schlagzwang', apply: (d) => (d.rules.forcedCapture = true) },
  { name: 'Damenjagd', apply: (d) => (d.rules.captureWin = 'q') },
  { name: 'Materialschlacht', apply: (d) => (d.rules.moveLimit = 25) },
  { name: 'Ente', apply: (d) => Object.assign(d.rules, { duck: true, kingSafety: false, stalemateWins: true }) },
  { name: 'Umwandlung gewinnt', apply: (d) => (d.rules.promoteWins = true) },
  { name: 'Doppelzug', apply: (d) => (d.rules.doubleMove = true) },
];
const SWAPS = ['a', 'c', 'h', 'l', 'z', 'm'];
const NAMES1 = ['Wirbel', 'Sturm', 'Rätsel', 'Funken', 'Nebel', 'Donner', 'Glanz', 'Echo', 'Zauber'];
const NAMES2 = ['schach', 'partie', 'duell', 'gefecht', 'spiel'];

/** Entwurf der Tagesvariante für ein Datum (YYYY-MM-DD) */
export function dailyDesign(date: string): Design {
  const r = rng(seedOf(date));
  const pick = <T,>(a: T[]) => a[Math.floor(r() * a.length)];
  for (let attempt = 0; attempt < 20; attempt++) {
    const d = emptyDesign();
    const bases: Base[] = ['standard', 'standard', 'standard', '960', 'losalamos', 'capablanca'];
    d.base = pick(bases);
    if (d.base === 'losalamos') Object.assign(d.rules, { castling: false, pawnDouble: false });
    const blocks = [...BLOCKS].sort(() => r() - 0.5).slice(0, 1 + Math.floor(r() * 2));
    // Ente und Explosionen bzw. Hügel zusammen werden schnell unübersichtlich – dann nur ein Baustein
    blocks.slice(0, blocks.some((b) => b.name === 'Ente') ? 1 : 2).forEach((b) => b.apply(d));
    if (r() < 0.6) {
      const from = pick(['n', 'b', 'r']);
      const to = pick(SWAPS);
      if (!(d.base === 'losalamos' && from === 'b')) d.swap[from] = to;
    }
    d.name = `${pick(NAMES1)}${pick(NAMES2)} (${date.slice(8, 10)}.${date.slice(5, 7)}.)`;
    d.rules.name = d.name;
    try {
      const rules = designRules(d);
      const p = newGame(rules);
      if (legalMoves(p, rules).length >= 5) return d;
    } catch {
      /* nächster Versuch */
    }
  }
  return emptyDesign();
}
