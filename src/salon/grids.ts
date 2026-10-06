// Gitter-Spiele für den Spielesalon: Vier gewinnt, Reversi und Fünf in einer Reihe.
import type { GameRules, Player } from './ai';

export interface GridState {
  w: number;
  h: number;
  b: (0 | Player)[];
  turn: Player;
  last: number;
}
const other = (p: Player): Player => (p === 1 ? 2 : 1);
const DIR4 = [[1, 0], [0, 1], [1, 1], [1, -1]];

/** Längste Reihe gleicher Steine durch Feld i (für Gewinnprüfung) */
function lineLen(s: GridState, i: number, dx: number, dy: number): number {
  const p = s.b[i];
  if (!p) return 0;
  const x0 = i % s.w;
  const y0 = Math.floor(i / s.w);
  let n = 1;
  for (const sg of [1, -1]) {
    let x = x0 + dx * sg;
    let y = y0 + dy * sg;
    while (x >= 0 && y >= 0 && x < s.w && y < s.h && s.b[y * s.w + x] === p) {
      n++;
      x += dx * sg;
      y += dy * sg;
    }
  }
  return n;
}
const wins = (s: GridState, i: number, k: number) => i >= 0 && DIR4.some(([dx, dy]) => lineLen(s, i, dx, dy) >= k);

/** Alle Fenster der Länge k (für Bewertung) */
function windows(w: number, h: number, k: number): number[][] {
  const out: number[][] = [];
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++)
      for (const [dx, dy] of DIR4) {
        const ex = x + dx * (k - 1);
        const ey = y + dy * (k - 1);
        if (ex < 0 || ex >= w || ey < 0 || ey >= h) continue;
        out.push(Array.from({ length: k }, (_, j) => (y + dy * j) * w + x + dx * j));
      }
  return out;
}

// ---------- Vier gewinnt (7 × 6, Zeile 0 unten) ----------
const C4_WIN = windows(7, 6, 4);
export const c4Init = (): GridState => ({ w: 7, h: 6, b: Array(42).fill(0), turn: 1, last: -1 });
export const VIER: GameRules<GridState, number> = {
  moves: (s) => (wins(s, s.last, 4) ? [] : [3, 2, 4, 1, 5, 0, 6].filter((c) => !s.b[35 + c])),
  play(s, c) {
    const b = s.b.slice();
    let i = c;
    while (b[i]) i += 7;
    b[i] = s.turn;
    return { ...s, b, turn: other(s.turn), last: i };
  },
  turn: (s) => s.turn,
  result: (s) => (wins(s, s.last, 4) ? s.b[s.last] as Player : s.b.every(Boolean) ? 'draw' : null),
  evaluate(s, p) {
    let v = 0;
    for (const win of C4_WIN) {
      let mine = 0;
      let theirs = 0;
      for (const i of win) {
        if (s.b[i] === p) mine++;
        else if (s.b[i]) theirs++;
      }
      if (mine && !theirs) v += mine === 3 ? 50 : mine === 2 ? 6 : 1;
      if (theirs && !mine) v -= theirs === 3 ? 60 : theirs === 2 ? 6 : 1;
    }
    return v;
  },
};

// ---------- Reversi (8 × 8) ----------
const DIR8 = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
export function reversiInit(): GridState {
  const b: (0 | Player)[] = Array(64).fill(0);
  b[27] = 2;
  b[28] = 1;
  b[35] = 1;
  b[36] = 2;
  return { w: 8, h: 8, b, turn: 1, last: -1 };
}
function flips(s: GridState, i: number, p: Player): number[] {
  if (s.b[i]) return [];
  const out: number[] = [];
  const x0 = i % 8;
  const y0 = i >> 3;
  for (const [dx, dy] of DIR8) {
    const run: number[] = [];
    let x = x0 + dx;
    let y = y0 + dy;
    while (x >= 0 && y >= 0 && x < 8 && y < 8 && s.b[y * 8 + x] === other(p)) {
      run.push(y * 8 + x);
      x += dx;
      y += dy;
    }
    if (run.length && x >= 0 && y >= 0 && x < 8 && y < 8 && s.b[y * 8 + x] === p) out.push(...run);
  }
  return out;
}
/** -1 = passen (nur wenn kein Zug möglich, der Gegner aber noch kann) */
export function reversiMoves(s: GridState): number[] {
  const ms: number[] = [];
  for (let i = 0; i < 64; i++) if (flips(s, i, s.turn).length) ms.push(i);
  if (ms.length) return ms;
  for (let i = 0; i < 64; i++) if (flips(s, i, other(s.turn)).length) return [-1];
  return [];
}
const CORNERS = [0, 7, 56, 63];
const XSQ = [9, 14, 49, 54];
export const REVERSI: GameRules<GridState, number> = {
  moves: reversiMoves,
  play(s, i) {
    if (i < 0) return { ...s, turn: other(s.turn), last: -1 };
    const b = s.b.slice();
    for (const f of flips(s, i, s.turn)) b[f] = s.turn;
    b[i] = s.turn;
    return { ...s, b, turn: other(s.turn), last: i };
  },
  turn: (s) => s.turn,
  result(s) {
    if (reversiMoves(s).length) return null;
    const a = s.b.filter((x) => x === 1).length;
    const c = s.b.filter((x) => x === 2).length;
    return a === c ? 'draw' : a > c ? 1 : 2;
  },
  evaluate(s, p) {
    let v = 0;
    for (let i = 0; i < 64; i++) {
      if (!s.b[i]) continue;
      const w = CORNERS.includes(i) ? 25 : XSQ.includes(i) ? -8 : i % 8 === 0 || i % 8 === 7 || i < 8 || i > 55 ? 4 : 1;
      v += s.b[i] === p ? w : -w;
    }
    const mob = (q: Player) => { let n = 0; for (let i = 0; i < 64; i++) if (flips(s, i, q).length) n++; return n; };
    return v + (mob(p) - mob(other(p))) * 3;
  },
  order: (_s, ms) => ms.slice().sort((a, b) => (CORNERS.includes(b) ? 1 : 0) - (CORNERS.includes(a) ? 1 : 0)),
};

// ---------- Fünf in einer Reihe (15 × 15) ----------
const N = 15;
export const gomokuInit = (): GridState => ({ w: N, h: N, b: Array(N * N).fill(0), turn: 1, last: -1 });
const G_WIN = windows(N, N, 5);
const G_BY_CELL: number[][] = Array.from({ length: N * N }, () => []);
G_WIN.forEach((w, k) => w.forEach((i) => G_BY_CELL[i].push(k)));
function windowScore(s: GridState, k: number, p: Player): number {
  let mine = 0;
  let theirs = 0;
  for (const i of G_WIN[k]) {
    if (s.b[i] === p) mine++;
    else if (s.b[i]) theirs++;
  }
  if (mine && theirs) return 0;
  const sc = [0, 1, 8, 60, 900, 100000];
  return mine ? sc[mine] : -sc[theirs] * 1.2;
}
/** Kandidaten: leere Felder höchstens 2 Felder neben vorhandenen Steinen, nach Wichtigkeit sortiert */
function gomokuCandidates(s: GridState, limit: number): number[] {
  if (s.b.every((x) => !x)) return [7 * N + 7];
  const near = new Set<number>();
  s.b.forEach((x, i) => {
    if (!x) return;
    const cx = i % N;
    const cy = Math.floor(i / N);
    for (let dy = -2; dy <= 2; dy++)
      for (let dx = -2; dx <= 2; dx++) {
        const x2 = cx + dx;
        const y2 = cy + dy;
        if (x2 >= 0 && y2 >= 0 && x2 < N && y2 < N && !s.b[y2 * N + x2]) near.add(y2 * N + x2);
      }
  });
  const p = s.turn;
  const heat = (i: number) => {
    let h = 0;
    for (const k of G_BY_CELL[i]) {
      let a = 0;
      let o = 0;
      for (const j of G_WIN[k]) {
        if (s.b[j] === p) a++;
        else if (s.b[j]) o++;
      }
      if (!o) h += [0, 2, 12, 120, 5000][a] ?? 0;
      if (!a) h += [0, 1, 10, 100, 4000][o] ?? 0;
    }
    return h;
  };
  return [...near].map((i) => ({ i, h: heat(i) })).sort((a, b) => b.h - a.h).slice(0, limit).map((x) => x.i);
}
export const GOMOKU: GameRules<GridState, number> = {
  moves: (s) => (wins(s, s.last, 5) ? [] : gomokuCandidates(s, 12)),
  play(s, i) {
    const b = s.b.slice();
    b[i] = s.turn;
    return { ...s, b, turn: other(s.turn), last: i };
  },
  turn: (s) => s.turn,
  result: (s) => (wins(s, s.last, 5) ? s.b[s.last] as Player : s.b.every(Boolean) ? 'draw' : null),
  evaluate(s, p) {
    let v = 0;
    const seen = new Set<number>();
    s.b.forEach((x, i) => x && G_BY_CELL[i].forEach((k) => seen.add(k)));
    for (const k of seen) v += windowScore(s, k, p);
    return v;
  },
};
/** Für die Oberfläche: alle freien Felder sind erlaubt (die KI betrachtet nur Kandidaten) */
export const gomokuLegal = (s: GridState, i: number) => !s.b[i] && !wins(s, s.last, 5);
