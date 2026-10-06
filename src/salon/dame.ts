// Dame (deutsche Regeln, 8×8): Steine ziehen schräg vorwärts, schlagen vorwärts und rückwärts,
// Schlagzwang mit Mehrfachsprung, Damen ziehen und schlagen über beliebige Entfernung („fliegende Dame“).
import type { GameRules, Player } from './ai';

/** 0 leer, 1/2 Stein von Spieler 1/2, 3/4 Dame von Spieler 1/2. Feld = Reihe * 8 + Linie, Reihe 0 unten (Spieler 1). */
export interface DameState {
  b: number[];
  turn: Player;
  /** Züge ohne Schlag und ohne Steinzug (für Remis) */
  quiet: number;
}
export interface DameMove {
  path: number[];
  caps: number[];
}

const owner = (v: number): Player | 0 => (v === 1 || v === 3 ? 1 : v === 2 || v === 4 ? 2 : 0);
const isKing = (v: number) => v >= 3;
const rc = (s: number) => [s >> 3, s & 7] as const;
const at = (r: number, c: number) => (r < 0 || r > 7 || c < 0 || c > 7 ? -1 : r * 8 + c);
const DIRS = [[1, 1], [1, -1], [-1, 1], [-1, -1]];

export function dameInit(): DameState {
  const b = Array(64).fill(0);
  for (let r = 0; r < 8; r++)
    for (let c = 0; c < 8; c++) {
      if ((r + c) % 2 !== 0) continue; // dunkle Felder: a1 ist dunkel
      if (r < 3) b[r * 8 + c] = 1;
      if (r > 4) b[r * 8 + c] = 2;
    }
  return { b, turn: 1, quiet: 0 };
}

/** Alle Schlagfolgen ab Feld s (Mehrfachsprung, bereits geschlagene Steine bleiben bis Zugende liegen) */
function captures(b: number[], s: number, p: Player, king: boolean, path: number[], caps: number[], out: DameMove[]) {
  const [r, c] = rc(s);
  let found = false;
  for (const [dr, dc] of DIRS) {
    if (king) {
      // fliegende Dame: über leere Felder bis zum gegnerischen Stein, dahinter beliebig weit landen
      let k = 1;
      while (at(r + dr * k, c + dc * k) >= 0 && b[at(r + dr * k, c + dc * k)] === 0) k++;
      const over = at(r + dr * k, c + dc * k);
      if (over < 0 || owner(b[over]) === p || owner(b[over]) === 0 || caps.includes(over)) continue;
      let j = k + 1;
      while (at(r + dr * j, c + dc * j) >= 0 && b[at(r + dr * j, c + dc * j)] === 0) {
        const land = at(r + dr * j, c + dc * j);
        found = true;
        const nb = b.slice();
        nb[land] = nb[s];
        nb[s] = 0;
        captures(nb, land, p, true, [...path, land], [...caps, over], out);
        j++;
      }
    } else {
      const over = at(r + dr, c + dc);
      const land = at(r + 2 * dr, c + 2 * dc);
      if (over < 0 || land < 0 || b[land] !== 0 || owner(b[over]) === p || owner(b[over]) === 0 || caps.includes(over)) continue;
      found = true;
      const nb = b.slice();
      nb[land] = nb[s];
      nb[s] = 0;
      captures(nb, land, p, false, [...path, land], [...caps, over], out);
    }
  }
  if (!found && caps.length) out.push({ path, caps });
}

export function dameMoves(st: DameState): DameMove[] {
  const p = st.turn;
  const caps: DameMove[] = [];
  const quiet: DameMove[] = [];
  const fwd = p === 1 ? 1 : -1;
  for (let s = 0; s < 64; s++) {
    if (owner(st.b[s]) !== p) continue;
    const king = isKing(st.b[s]);
    captures(st.b, s, p, king, [s], [], caps);
    const [r, c] = rc(s);
    for (const [dr, dc] of DIRS) {
      if (!king && dr !== fwd) continue;
      let k = 1;
      while (true) {
        const t = at(r + dr * k, c + dc * k);
        if (t < 0 || st.b[t] !== 0) break;
        quiet.push({ path: [s, t], caps: [] });
        if (!king) break;
        k++;
      }
    }
  }
  return caps.length ? caps : quiet;
}

export function damePlay(st: DameState, m: DameMove): DameState {
  const b = st.b.slice();
  const from = m.path[0];
  const to = m.path[m.path.length - 1];
  const v = b[from];
  b[from] = 0;
  for (const c of m.caps) b[c] = 0;
  const p = owner(v) as Player;
  const lastRow = p === 1 ? 7 : 0;
  b[to] = !isKing(v) && to >> 3 === lastRow ? v + 2 : v;
  const manMove = !isKing(v);
  return { b, turn: p === 1 ? 2 : 1, quiet: m.caps.length || manMove ? 0 : st.quiet + 1 };
}

export const DAME: GameRules<DameState, DameMove> = {
  moves: dameMoves,
  play: damePlay,
  turn: (s) => s.turn,
  result(s) {
    if (s.quiet >= 30) return 'draw';
    if (!dameMoves(s).length) return s.turn === 1 ? 2 : 1;
    return null;
  },
  evaluate(s, p) {
    let v = 0;
    for (let i = 0; i < 64; i++) {
      const x = s.b[i];
      if (!x) continue;
      const o = owner(x);
      const r = i >> 3;
      const adv = o === 1 ? r : 7 - r;
      const val = isKing(x) ? 330 : 100 + adv * 6 + ((i & 7) > 1 && (i & 7) < 6 ? 4 : 0);
      v += o === p ? val : -val;
    }
    return v;
  },
  order: (_s, ms) => ms.slice().sort((a, b) => b.caps.length - a.caps.length),
};
