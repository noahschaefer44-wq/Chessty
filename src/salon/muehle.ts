// Mühle (Neunermühle): Setzen, Ziehen, Springen (mit 3 Steinen). Mühle → gegnerischen Stein entfernen.
import type { GameRules, Player } from './ai';

/** 24 Punkte: Ring 0 außen, 1 Mitte, 2 innen; je 8 Punkte im Uhrzeigersinn ab links oben */
export const POINTS: [number, number][] = [];
for (let ring = 0; ring < 3; ring++) {
  const lo = ring;
  const hi = 6 - ring;
  const mid = 3;
  POINTS.push([lo, lo], [mid, lo], [hi, lo], [hi, mid], [hi, hi], [mid, hi], [lo, hi], [lo, mid]);
}
const idx = (ring: number, k: number) => ring * 8 + (k % 8);
/** Nachbarn */
export const ADJ: number[][] = Array.from({ length: 24 }, () => []);
for (let ring = 0; ring < 3; ring++)
  for (let k = 0; k < 8; k++) {
    const a = idx(ring, k);
    ADJ[a].push(idx(ring, k + 1), idx(ring, k + 7));
    if (k % 2 === 1) {
      if (ring > 0) ADJ[a].push(idx(ring - 1, k));
      if (ring < 2) ADJ[a].push(idx(ring + 1, k));
    }
  }
/** Alle 16 Mühlen */
export const MILLS: number[][] = [];
for (let ring = 0; ring < 3; ring++) for (const k of [0, 2, 4, 6]) MILLS.push([idx(ring, k), idx(ring, k + 1), idx(ring, k + 2)]);
for (const k of [1, 3, 5, 7]) MILLS.push([idx(0, k), idx(1, k), idx(2, k)]);

export interface MuehleState {
  b: (0 | Player)[];
  turn: Player;
  /** noch zu setzende Steine */
  hand: [number, number];
  ply: number;
  sinceMill: number;
}
export interface MuehleMove {
  from: number; // -1 = setzen
  to: number;
  remove: number; // -1 = keine Mühle
}

export const muehleInit = (): MuehleState => ({ b: Array(24).fill(0), turn: 1, hand: [9, 9], ply: 0, sinceMill: 0 });

const count = (s: MuehleState, p: Player) => s.b.filter((x) => x === p).length;
const inMill = (b: (0 | Player)[], i: number) => MILLS.some((m) => m.includes(i) && m.every((x) => b[x] === b[i] && b[i] !== 0));

function removable(b: (0 | Player)[], opp: Player): number[] {
  const all = b.map((x, i) => (x === opp ? i : -1)).filter((i) => i >= 0);
  const free = all.filter((i) => !inMill(b, i));
  return free.length ? free : all;
}

export function muehleMoves(s: MuehleState): MuehleMove[] {
  const p = s.turn;
  const opp: Player = p === 1 ? 2 : 1;
  const base: { from: number; to: number }[] = [];
  if (s.hand[p - 1] > 0) {
    for (let i = 0; i < 24; i++) if (!s.b[i]) base.push({ from: -1, to: i });
  } else {
    const fly = count(s, p) === 3;
    for (let i = 0; i < 24; i++) {
      if (s.b[i] !== p) continue;
      const targets = fly ? s.b.map((x, j) => (x ? -1 : j)).filter((j) => j >= 0) : ADJ[i].filter((j) => !s.b[j]);
      for (const t of targets) base.push({ from: i, to: t });
    }
  }
  const out: MuehleMove[] = [];
  for (const m of base) {
    const b = s.b.slice();
    if (m.from >= 0) b[m.from] = 0;
    b[m.to] = p;
    if (inMill(b, m.to)) for (const r of removable(b, opp)) out.push({ ...m, remove: r });
    else out.push({ ...m, remove: -1 });
  }
  return out;
}

export function muehlePlay(s: MuehleState, m: MuehleMove): MuehleState {
  const b = s.b.slice();
  const p = s.turn;
  if (m.from >= 0) b[m.from] = 0;
  b[m.to] = p;
  if (m.remove >= 0) b[m.remove] = 0;
  const hand: [number, number] = [...s.hand];
  if (m.from < 0) hand[p - 1]--;
  return { b, turn: p === 1 ? 2 : 1, hand, ply: s.ply + 1, sinceMill: m.remove >= 0 ? 0 : s.sinceMill + 1 };
}

export const MUEHLE: GameRules<MuehleState, MuehleMove> = {
  moves: muehleMoves,
  play: muehlePlay,
  turn: (s) => s.turn,
  result(s) {
    for (const p of [1, 2] as Player[]) if (s.hand[p - 1] === 0 && count(s, p) < 3) return p === 1 ? 2 : 1;
    if (!muehleMoves(s).length) return s.turn === 1 ? 2 : 1;
    if (s.sinceMill >= 60) return 'draw';
    return null;
  },
  evaluate(s, p) {
    const o: Player = p === 1 ? 2 : 1;
    const stones = (q: Player) => count(s, q) + s.hand[q - 1];
    let v = (stones(p) - stones(o)) * 100;
    // fast fertige Mühlen und Beweglichkeit
    for (const m of MILLS) {
      const mine = m.filter((x) => s.b[x] === p).length;
      const theirs = m.filter((x) => s.b[x] === o).length;
      if (mine === 2 && theirs === 0) v += 14;
      if (theirs === 2 && mine === 0) v -= 14;
    }
    for (let i = 0; i < 24; i++) {
      if (!s.b[i]) continue;
      const free = ADJ[i].filter((j) => !s.b[j]).length;
      v += (s.b[i] === p ? 1 : -1) * free * 3;
    }
    return v;
  },
  order: (_s, ms) => ms.slice().sort((a, b) => (b.remove >= 0 ? 1 : 0) - (a.remove >= 0 ? 1 : 0)),
};
