// Eigene Regel-Engine für Schachvarianten (auch für selbst gebaute Varianten).
// Felder: 0 = a1 … 63 = h8. Figuren wie in FEN (Groß = Weiß), zusätzlich
// A/a = Amazone (Dame + Springer), C/c = Kanzler (Turm + Springer), H/h = Erzbischof (Läufer + Springer).
// Die Ente (Duck Chess) steht nicht im Brett-Array, sondern in pos.duck.

export type Color = 'w' | 'b';
export interface Move {
  from: number; // -1 bei Einsetzen
  to: number;
  promo?: string;
  drop?: string;
  castle?: number; // Feld des Rochadeturms
  duck?: number;
}

export interface Rules {
  id: string;
  name: string;
  /** Startstellung (Brett-Teil einer FEN, optional mit „ w“/„ b“) oder '960' */
  setup: string;
  /** true: eigener König darf nicht im Schach stehen (klassisch). false: König kann geschlagen werden. */
  kingSafety: boolean;
  forcedCapture: boolean;
  /** Schlagschach: wer alle Figuren verliert oder patt ist, gewinnt */
  antichess: boolean;
  atomic: boolean;
  drops: boolean;
  duck: boolean;
  fog: boolean;
  /** 0 = aus, sonst: so viele Schachgebote gewinnen */
  checksToWin: number;
  hill: boolean;
  race: boolean;
  castling: boolean;
  pawnDouble: boolean;
  /** Wer patt gesetzt ist, gewinnt */
  stalemateWins: boolean;
  promo: string[];
}

export interface Pos {
  b: (string | null)[];
  prom: boolean[];
  turn: Color;
  castle: { w: number[]; b: number[] };
  ep: number;
  pockets: { w: Record<string, number>; b: Record<string, number> };
  checks: { w: number; b: number };
  hadKing: { w: boolean; b: boolean };
  half: number;
  ply: number;
  duck: number;
}

export interface Outcome {
  winner: Color | 'draw';
  reason: string;
}

export const BASE_RULES: Rules = {
  id: 'standard',
  name: 'Klassisch',
  setup: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w',
  kingSafety: true,
  forcedCapture: false,
  antichess: false,
  atomic: false,
  drops: false,
  duck: false,
  fog: false,
  checksToWin: 0,
  hill: false,
  race: false,
  castling: true,
  pawnDouble: true,
  stalemateWins: false,
  promo: ['q', 'r', 'b', 'n'],
};

export const VALUES: Record<string, number> = { p: 100, n: 310, b: 330, r: 500, q: 900, k: 0, a: 1250, c: 880, h: 820 };
export const PIECE_NAMES: Record<string, string> = {
  p: 'Bauer', n: 'Springer', b: 'Läufer', r: 'Turm', q: 'Dame', k: 'König', a: 'Amazone', c: 'Kanzler', h: 'Erzbischof',
};

export const other = (c: Color): Color => (c === 'w' ? 'b' : 'w');
export const fileOf = (s: number) => s & 7;
export const rankOf = (s: number) => s >> 3;
export const sqName = (s: number) => String.fromCharCode(97 + fileOf(s)) + (rankOf(s) + 1);
export const sqIndex = (n: string) => (n.charCodeAt(0) - 97) + (Number(n[1]) - 1) * 8;
export const colorOf = (p: string): Color => (p === p.toUpperCase() ? 'w' : 'b');
const typeOf = (p: string) => p.toLowerCase();
const withColor = (t: string, c: Color) => (c === 'w' ? t.toUpperCase() : t.toLowerCase());

const KNIGHT: [number, number][] = [[1, 2], [2, 1], [2, -1], [1, -2], [-1, -2], [-2, -1], [-2, 1], [-1, 2]];
const KING: [number, number][] = [[1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1]];
const DIAG: [number, number][] = [[1, 1], [-1, 1], [-1, -1], [1, -1]];
const ORTHO: [number, number][] = [[1, 0], [0, 1], [-1, 0], [0, -1]];
const hasN = (t: string) => t === 'n' || t === 'a' || t === 'c' || t === 'h';
const hasDiag = (t: string) => t === 'b' || t === 'q' || t === 'a' || t === 'h';
const hasOrtho = (t: string) => t === 'r' || t === 'q' || t === 'a' || t === 'c';

function step(s: number, df: number, dr: number): number {
  const f = fileOf(s) + df;
  const r = rankOf(s) + dr;
  return f < 0 || f > 7 || r < 0 || r > 7 ? -1 : r * 8 + f;
}

// ---------- Aufbau ----------

/** Zufällige Chess960-Grundstellung (Brett-Teil der FEN) */
export function fen960(seed = Math.floor(Math.random() * 960)): string {
  const row: string[] = Array(8).fill('');
  let n = seed;
  row[(n % 4) * 2 + 1] = 'b';
  n = Math.floor(n / 4);
  row[(n % 4) * 2] = 'b';
  n = Math.floor(n / 4);
  const free = () => row.map((x, i) => (x ? -1 : i)).filter((i) => i >= 0);
  row[free()[n % 6]] = 'q';
  n = Math.floor(n / 6);
  const kn = [[0, 1], [0, 2], [0, 3], [0, 4], [1, 2], [1, 3], [1, 4], [2, 3], [2, 4], [3, 4]][n];
  const f1 = free();
  row[f1[kn[0]]] = 'n';
  row[f1[kn[1]]] = 'n';
  const f2 = free();
  row[f2[0]] = 'r';
  row[f2[1]] = 'k';
  row[f2[2]] = 'r';
  const black = row.join('');
  return `${black}/pppppppp/8/8/8/8/PPPPPPPP/${black.toUpperCase()} w`;
}

export function parseSetup(setup: string, rules: Rules): Pos {
  const fen = setup === '960' ? fen960() : setup;
  const [boardPart, turnPart] = fen.trim().split(/\s+/);
  const b: (string | null)[] = Array(64).fill(null);
  const rows = boardPart.split('/');
  rows.forEach((row, i) => {
    let f = 0;
    for (const ch of row) {
      if (/\d/.test(ch)) f += Number(ch);
      else {
        if (f < 8 && 7 - i >= 0) b[(7 - i) * 8 + f] = ch;
        f++;
      }
    }
  });
  const pos: Pos = {
    b,
    prom: Array(64).fill(false),
    turn: turnPart === 'b' ? 'b' : 'w',
    castle: { w: [], b: [] },
    ep: -1,
    pockets: { w: {}, b: {} },
    checks: { w: 0, b: 0 },
    hadKing: { w: b.includes('K'), b: b.includes('k') },
    half: 0,
    ply: 0,
    duck: -1,
  };
  if (rules.castling && !rules.antichess) {
    for (const c of ['w', 'b'] as Color[]) {
      const back = c === 'w' ? 0 : 7;
      const ks = kingSq(pos, c);
      if (ks < 0 || rankOf(ks) !== back) continue;
      const R = withColor('r', c);
      const row = Array.from({ length: 8 }, (_, f) => back * 8 + f);
      const left = row.filter((s) => s < ks && b[s] === R);
      const right = row.filter((s) => s > ks && b[s] === R);
      if (left.length) pos.castle[c].push(left[0]);
      if (right.length) pos.castle[c].push(right[right.length - 1]);
    }
  }
  return pos;
}

export function newGame(rules: Rules): Pos {
  return parseSetup(rules.setup, rules);
}

// ---------- Hilfsfunktionen ----------

export function kingSq(pos: Pos, c: Color): number {
  const K = c === 'w' ? 'K' : 'k';
  return pos.b.indexOf(K);
}

const blocked = (pos: Pos, s: number) => pos.b[s] !== null || s === pos.duck;

/** Wird Feld s von Farbe `by` angegriffen? */
export function attacked(pos: Pos, s: number, by: Color, rules: Rules): boolean {
  const b = pos.b;
  // Bauern
  const dir = by === 'w' ? -1 : 1; // Richtung vom Zielfeld zum angreifenden Bauern
  for (const df of [-1, 1]) {
    const t = step(s, df, dir);
    if (t >= 0 && b[t] === withColor('p', by)) return true;
  }
  for (const [df, dr] of KNIGHT) {
    const t = step(s, df, dr);
    if (t >= 0 && b[t] && colorOf(b[t]!) === by && hasN(typeOf(b[t]!))) return true;
  }
  if (!rules.atomic)
    for (const [df, dr] of KING) {
      const t = step(s, df, dr);
      if (t >= 0 && b[t] === withColor('k', by)) return true;
    }
  for (const [dirs, test] of [[DIAG, hasDiag], [ORTHO, hasOrtho]] as const) {
    for (const [df, dr] of dirs) {
      let t = step(s, df, dr);
      while (t >= 0) {
        if (t === pos.duck) break;
        const p = b[t];
        if (p) {
          if (colorOf(p) === by && test(typeOf(p))) return true;
          break;
        }
        t = step(t, df, dr);
      }
    }
  }
  return false;
}

export function inCheck(pos: Pos, c: Color, rules: Rules): boolean {
  const k = kingSq(pos, c);
  if (k < 0) return false;
  if (rules.atomic) {
    const ek = kingSq(pos, other(c));
    if (ek >= 0 && Math.max(Math.abs(fileOf(ek) - fileOf(k)), Math.abs(rankOf(ek) - rankOf(k))) === 1) return false;
  }
  return attacked(pos, k, other(c), rules);
}

export function isCapture(pos: Pos, m: Move): boolean {
  if (m.drop || m.castle !== undefined) return false;
  if (pos.b[m.to]) return true;
  const p = pos.b[m.from];
  return !!p && typeOf(p) === 'p' && m.to === pos.ep && fileOf(m.from) !== fileOf(m.to);
}

// ---------- Zuggenerierung ----------

function pseudo(pos: Pos, rules: Rules): Move[] {
  const out: Move[] = [];
  const me = pos.turn;
  const b = pos.b;
  const promos = rules.promo.length ? rules.promo : ['q'];
  const addPawn = (from: number, to: number) => {
    const last = me === 'w' ? 7 : 0;
    if (rankOf(to) === last) for (const p of promos) out.push({ from, to, promo: p });
    else out.push({ from, to });
  };
  for (let s = 0; s < 64; s++) {
    const p = b[s];
    if (!p || colorOf(p) !== me) continue;
    const t = typeOf(p);
    if (t === 'p') {
      const dir = me === 'w' ? 1 : -1;
      const one = step(s, 0, dir);
      if (one >= 0 && !blocked(pos, one)) {
        addPawn(s, one);
        const r = rankOf(s);
        const home = me === 'w' ? r <= 1 : r >= 6;
        const two = step(one, 0, dir);
        if (rules.pawnDouble && home && two >= 0 && !blocked(pos, two)) out.push({ from: s, to: two });
      }
      for (const df of [-1, 1]) {
        const c = step(s, df, dir);
        if (c < 0 || c === pos.duck) continue;
        if ((b[c] && colorOf(b[c]!) !== me) || (c === pos.ep && !b[c])) addPawn(s, c);
      }
      continue;
    }
    const target = (to: number) => {
      if (to < 0 || to === pos.duck) return;
      const q = b[to];
      if (q && colorOf(q) === me) return;
      if (q && rules.atomic && t === 'k') return; // König darf im Atomschach nicht schlagen
      out.push({ from: s, to });
    };
    if (hasN(t)) for (const [df, dr] of KNIGHT) target(step(s, df, dr));
    if (t === 'k') for (const [df, dr] of KING) target(step(s, df, dr));
    const rays = [...(hasDiag(t) ? DIAG : []), ...(hasOrtho(t) ? ORTHO : [])];
    for (const [df, dr] of rays) {
      let to = step(s, df, dr);
      while (to >= 0 && to !== pos.duck) {
        const q = b[to];
        if (q) {
          if (colorOf(q) !== me) out.push({ from: s, to });
          break;
        }
        out.push({ from: s, to });
        to = step(to, df, dr);
      }
    }
  }
  // Rochade (auch Chess960)
  if (rules.castling && !rules.antichess && pos.castle[me].length) {
    const ks = kingSq(pos, me);
    const back = me === 'w' ? 0 : 7;
    if (ks >= 0 && rankOf(ks) === back && !(rules.kingSafety && inCheck(pos, me, rules))) {
      for (const rs of pos.castle[me]) {
        if (b[rs] !== withColor('r', me)) continue;
        const kingSide = rs > ks;
        const kd = back * 8 + (kingSide ? 6 : 2);
        const rd = back * 8 + (kingSide ? 5 : 3);
        const lo = Math.min(ks, rs, kd, rd);
        const hi = Math.max(ks, rs, kd, rd);
        let ok = true;
        for (let x = lo; x <= hi && ok; x++) if (x !== ks && x !== rs && blocked(pos, x)) ok = false;
        if (ok && (kd === pos.duck || rd === pos.duck)) ok = false;
        if (ok && rules.kingSafety) {
          const a = Math.min(ks, kd);
          const z = Math.max(ks, kd);
          for (let x = a; x <= z && ok; x++) if (attacked(pos, x, other(me), rules)) ok = false;
        }
        if (ok) out.push({ from: ks, to: kd, castle: rs });
      }
    }
  }
  // Einsetzen (Crazyhouse)
  if (rules.drops) {
    for (const [t, n] of Object.entries(pos.pockets[me])) {
      if (!n) continue;
      for (let s = 0; s < 64; s++) {
        if (blocked(pos, s)) continue;
        if (t === 'p' && (rankOf(s) === 0 || rankOf(s) === 7)) continue;
        out.push({ from: -1, to: s, drop: t });
      }
    }
  }
  return out;
}

export function makeMove(pos: Pos, m: Move, rules: Rules): Pos {
  const b = pos.b.slice();
  const prom = pos.prom.slice();
  const me = pos.turn;
  const them = other(me);
  const pockets = { w: { ...pos.pockets.w }, b: { ...pos.pockets.b } };
  const castle = { w: pos.castle.w.slice(), b: pos.castle.b.slice() };
  let captured: string | null = null;
  let capturedProm = false;
  let ep = -1;
  let half = pos.half + 1;
  if (m.drop) {
    b[m.to] = withColor(m.drop, me);
    prom[m.to] = false;
    pockets[me][m.drop] = (pockets[me][m.drop] ?? 0) - 1;
  } else {
    const pc = b[m.from]!;
    const t = typeOf(pc);
    if (m.castle !== undefined) {
      const rook = b[m.castle];
      const back = rankOf(m.from);
      const rd = back * 8 + (m.castle > m.from ? 5 : 3);
      b[m.from] = null;
      b[m.castle] = null;
      b[m.to] = pc;
      b[rd] = rook;
      castle[me] = [];
    } else {
      const dir = me === 'w' ? 1 : -1;
      if (t === 'p' && m.to === pos.ep && !b[m.to] && fileOf(m.from) !== fileOf(m.to)) {
        const cs = m.to - 8 * dir;
        captured = b[cs];
        capturedProm = prom[cs];
        b[cs] = null;
      } else if (b[m.to]) {
        captured = b[m.to];
        capturedProm = prom[m.to];
      }
      b[m.to] = m.promo ? withColor(m.promo, me) : pc;
      prom[m.to] = m.promo ? true : prom[m.from];
      b[m.from] = null;
      prom[m.from] = false;
      if (t === 'p') {
        half = 0;
        if (Math.abs(m.to - m.from) === 16) ep = (m.to + m.from) / 2;
      }
      if (t === 'k') castle[me] = [];
      castle.w = castle.w.filter((s) => s !== m.from && s !== m.to);
      castle.b = castle.b.filter((s) => s !== m.from && s !== m.to);
    }
  }
  if (captured) {
    half = 0;
    if (rules.drops) {
      const ct = capturedProm ? 'p' : typeOf(captured);
      if (ct !== 'k') pockets[me][ct] = (pockets[me][ct] ?? 0) + 1;
    }
    if (rules.atomic) {
      b[m.to] = null;
      prom[m.to] = false;
      for (const [df, dr] of KING) {
        const s = step(m.to, df, dr);
        if (s >= 0 && b[s] && typeOf(b[s]!) !== 'p') {
          b[s] = null;
          prom[s] = false;
        }
      }
      castle.w = castle.w.filter((s) => b[s] === 'R');
      castle.b = castle.b.filter((s) => b[s] === 'r');
    }
  }
  const next: Pos = {
    b,
    prom,
    turn: them,
    castle,
    ep,
    pockets,
    checks: { ...pos.checks },
    hadKing: pos.hadKing,
    half,
    ply: pos.ply + 1,
    duck: m.duck !== undefined ? m.duck : pos.duck,
  };
  if (rules.checksToWin && inCheck(next, them, rules)) next.checks[me]++;
  return next;
}

/** Alle regelkonformen Züge (ohne Entenplatzierung) */
export function legalMoves(pos: Pos, rules: Rules): Move[] {
  const me = pos.turn;
  const them = other(me);
  let ms = pseudo(pos, rules);
  if (rules.kingSafety || rules.race) {
    ms = ms.filter((m) => {
      const n = makeMove(pos, m, rules);
      if (rules.atomic) {
        if (pos.hadKing[me] && kingSq(n, me) < 0) return false;
        if (pos.hadKing[them] && kingSq(n, them) < 0) return true;
      }
      if (rules.race && inCheck(n, them, rules)) return false;
      return !inCheck(n, me, rules);
    });
  }
  if (rules.forcedCapture) {
    const caps = ms.filter((m) => isCapture(pos, m));
    if (caps.length) ms = caps;
  }
  return ms;
}

/** Nur Schlagzüge (für die Ruhesuche der KI) – billiger als alle Züge zu prüfen */
export function legalCaptures(pos: Pos, rules: Rules): Move[] {
  const me = pos.turn;
  const them = other(me);
  let ms = pseudo({ ...pos, pockets: { w: {}, b: {} } }, { ...rules, castling: false }).filter((m) => isCapture(pos, m));
  if (rules.kingSafety || rules.race)
    ms = ms.filter((m) => {
      const n = makeMove(pos, m, rules);
      if (rules.atomic) {
        if (pos.hadKing[me] && kingSq(n, me) < 0) return false;
        if (pos.hadKing[them] && kingSq(n, them) < 0) return true;
      }
      if (rules.race && inCheck(n, them, rules)) return false;
      return !inCheck(n, me, rules);
    });
  return ms;
}

/** Leere Felder, auf die die Ente gesetzt werden darf (nach dem Figurenzug) */
export function duckSquares(pos: Pos, prevDuck: number): number[] {
  const out: number[] = [];
  for (let s = 0; s < 64; s++) if (!pos.b[s] && s !== prevDuck) out.push(s);
  return out;
}

const count = (pos: Pos, c: Color) => pos.b.reduce((n, p) => n + (p && colorOf(p) === c ? 1 : 0), 0);
const HILL = [27, 28, 35, 36];

/** Spielende ohne Zuggenerierung (schnell, für die Suche) */
export function quickOutcome(pos: Pos, rules: Rules): Outcome | null {
  if (!rules.antichess) {
    for (const c of ['w', 'b'] as Color[]) {
      if (pos.hadKing[c] && kingSq(pos, c) < 0)
        return { winner: other(c), reason: rules.atomic ? 'König explodiert' : 'König geschlagen' };
    }
  }
  if (rules.checksToWin) {
    for (const c of ['w', 'b'] as Color[])
      if (pos.checks[c] >= rules.checksToWin) return { winner: c, reason: `${rules.checksToWin} Schachgebote` };
  }
  if (rules.hill) {
    for (const c of ['w', 'b'] as Color[]) if (HILL.includes(kingSq(pos, c))) return { winner: c, reason: 'König auf dem Hügel' };
  }
  if (rules.race) {
    const w = kingSq(pos, 'w');
    const bk = kingSq(pos, 'b');
    const w8 = w >= 0 && rankOf(w) === 7;
    const b8 = bk >= 0 && rankOf(bk) === 7;
    if (w8 && b8) return { winner: 'draw', reason: 'Beide Könige im Ziel' };
    if (b8) return { winner: 'b', reason: 'König im Ziel' };
    if (w8 && pos.turn === 'w') return { winner: 'w', reason: 'König im Ziel' };
  }
  if (rules.antichess) {
    if (count(pos, pos.turn) === 0) return { winner: pos.turn, reason: 'Alle Figuren verloren' };
  } else {
    for (const c of ['w', 'b'] as Color[]) if (count(pos, c) === 0) return { winner: other(c), reason: 'Alle Figuren geschlagen' };
  }
  if (pos.half >= 100) return { winner: 'draw', reason: '50-Züge-Regel' };
  return null;
}

export function outcome(pos: Pos, rules: Rules, moves = legalMoves(pos, rules)): Outcome | null {
  const q = quickOutcome(pos, rules);
  if (q) return q;
  if (rules.race) {
    const w = kingSq(pos, 'w');
    if (w >= 0 && rankOf(w) === 7 && pos.turn === 'b') {
      const bk = kingSq(pos, 'b');
      if (!moves.some((m) => m.from === bk && rankOf(m.to) === 7)) return { winner: 'w', reason: 'König im Ziel' };
    }
  }
  if (!moves.length) {
    if (rules.antichess || rules.stalemateWins) return { winner: pos.turn, reason: 'Patt – der Pattgesetzte gewinnt' };
    if (inCheck(pos, pos.turn, rules)) return { winner: other(pos.turn), reason: 'Schachmatt' };
    return { winner: 'draw', reason: 'Patt' };
  }
  return null;
}

export function posKey(pos: Pos): string {
  return pos.b.map((p) => p ?? '.').join('') + pos.turn + pos.duck + JSON.stringify(pos.pockets) + pos.castle.w.join() + '|' + pos.castle.b.join() + pos.ep;
}

/** Zug in lesbarer (deutscher) Notation */
export function moveText(pos: Pos, m: Move): string {
  const DE: Record<string, string> = { n: 'S', b: 'L', r: 'T', q: 'D', k: 'K', a: 'A', c: 'C', h: 'E', p: '' };
  let s: string;
  if (m.drop) s = `${DE[m.drop] || 'B'}@${sqName(m.to)}`;
  else if (m.castle !== undefined) s = m.castle > m.from ? 'O-O' : 'O-O-O';
  else {
    const p = pos.b[m.from]!;
    const t = typeOf(p);
    const cap = isCapture(pos, m);
    s = (t === 'p' ? (cap ? sqName(m.from)[0] : '') : DE[t]) + (cap ? 'x' : '') + sqName(m.to) + (m.promo ? '=' + DE[m.promo] : '');
  }
  if (m.duck !== undefined) s += ` Ente ${sqName(m.duck)}`;
  return s;
}

export function sameMove(a: Move, b: Move) {
  return a.from === b.from && a.to === b.to && (a.promo ?? '') === (b.promo ?? '') && (a.drop ?? '') === (b.drop ?? '');
}
