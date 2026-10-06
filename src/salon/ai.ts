// Gemeinsame Spiel-KI für den Spielesalon: Alpha-Beta mit iterativer Vertiefung und Zeitlimit.
// Jedes Spiel liefert seine Regeln über das Interface `GameRules`.

export type Player = 1 | 2;

export interface GameRules<S, M> {
  moves(s: S): M[];
  play(s: S, m: M): S;
  /** Spielende: Gewinner, 'draw' oder null (läuft noch) */
  result(s: S): Player | 'draw' | null;
  turn(s: S): Player;
  /** Bewertung aus Sicht von Spieler p (größer = besser) */
  evaluate(s: S, p: Player): number;
  /** Optional: Züge für die Suche vorsortieren (beste zuerst) */
  order?(s: S, ms: M[]): M[];
}

export interface Level {
  name: string;
  desc: string;
  depth: number;
  ms: number;
  /** Wahrscheinlichkeit für einen Zufallszug */
  random: number;
}

export const LEVELS: Level[] = [
  { name: 'Leicht', desc: 'Spielt locker und übersieht einiges.', depth: 1, ms: 200, random: 0.3 },
  { name: 'Mittel', desc: 'Rechnet ein paar Züge voraus.', depth: 4, ms: 700, random: 0.05 },
  { name: 'Stark', desc: 'Sucht so tief, wie die Zeit reicht.', depth: 12, ms: 1800, random: 0 },
];

const WIN = 1_000_000;
class Timeout extends Error {}

export function bestMove<S, M>(g: GameRules<S, M>, s: S, level: Level): M | null {
  const root = g.moves(s);
  if (!root.length) return null;
  if (root.length === 1) return root[0];
  if (Math.random() < level.random) return root[Math.floor(Math.random() * root.length)];
  const me = g.turn(s);
  const deadline = Date.now() + level.ms;
  let nodes = 0;
  const search = (st: S, depth: number, alpha: number, beta: number, ply: number): number => {
    if ((++nodes & 255) === 0 && Date.now() > deadline) throw new Timeout();
    const r = g.result(st);
    const p = g.turn(st);
    if (r === 'draw') return 0;
    if (r) return r === p ? WIN - ply : -(WIN - ply);
    if (depth <= 0) return g.evaluate(st, p);
    let ms = g.moves(st);
    if (!ms.length) return g.evaluate(st, p);
    if (g.order) ms = g.order(st, ms);
    let best = -Infinity;
    for (const m of ms) {
      const n = g.play(st, m);
      // Gleicher Spieler bleibt am Zug (z. B. Reversi-Passen gibt es nicht als Zug) → kein Vorzeichenwechsel
      const v = g.turn(n) === p ? search(n, depth - 1, alpha, beta, ply + 1) : -search(n, depth - 1, -beta, -alpha, ply + 1);
      if (v > best) best = v;
      if (v > alpha) alpha = v;
      if (alpha >= beta) break;
    }
    return best;
  };
  let order = g.order ? g.order(s, root) : root.slice();
  let bestM = order[0];
  try {
    for (let d = 1; d <= level.depth; d++) {
      const scored = order.map((m) => {
        const n = g.play(s, m);
        const v = g.turn(n) === me ? search(n, d - 1, -Infinity, Infinity, 1) : -search(n, d - 1, -Infinity, Infinity, 1);
        return { m, v: v + Math.random() * 0.01 };
      });
      scored.sort((a, b) => b.v - a.v);
      order = scored.map((x) => x.m);
      bestM = order[0];
      if (scored[0].v > WIN - 1000) break;
    }
  } catch (e) {
    if (!(e instanceof Timeout)) throw e;
  }
  return bestM;
}

/** Bot-Zug ohne die Oberfläche einzufrieren (kurz warten, dann rechnen) */
export function botMoveAsync<S, M>(g: GameRules<S, M>, s: S, level: Level): Promise<M | null> {
  return new Promise((res) => setTimeout(() => res(bestMove(g, s, level)), 30));
}
