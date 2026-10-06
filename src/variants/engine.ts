// Eigene Regel-Engine für Schachvarianten (auch für selbst gebaute Varianten).
// Brett beliebiger Größe (Breite × Höhe aus der Startstellung): Feld = Reihe * Breite + Linie, 0 = a1.
// Figuren wie in FEN (Groß = Weiß). Neben den klassischen Figuren gibt es Märchenfiguren
// (siehe BUILTIN) und bis zu drei selbst definierte Figuren (Buchstaben x, y, j) über `rules.pieces`.
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

/** Gangart einer Figur. Vektoren [Linie, Reihe] werden symmetrisch ergänzt (alle Richtungen). */
export interface PieceDef {
  name: string;
  /** Grundbild für die Anzeige: n, b, r, q, k oder p */
  look: string;
  /** Kleines Abzeichen auf dem Bild (ein Zeichen) */
  badge?: string;
  /** Sprünge (über andere Figuren hinweg) */
  leaps: [number, number][];
  /** Gleitende Richtungen (bis zur ersten Figur) */
  slides: [number, number][];
  /** Höchstzahl Schritte beim Gleiten (0 = unbegrenzt) */
  range?: number;
  /** Nur nach vorne (aus Sicht der eigenen Farbe) */
  forward?: boolean;
  /** Wert in Centipawns (für die KI) */
  value: number;
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
  /** Eigene Figuren (Buchstabe → Gangart) */
  pieces?: Record<string, PieceDef>;
  /** Wer diese Figurenart des Gegners (alle Exemplare) schlägt, gewinnt, z. B. 'q' */
  captureWin?: string;
  /** Wer zuerst einen Bauern umwandelt, gewinnt */
  promoteWins?: boolean;
  /** Nach so vielen Zügen (je Seite) gewinnt, wer mehr Material hat (0/leer = aus) */
  moveLimit?: number;
  /** Wer keinen Zug mehr hat, verliert (z. B. im Bauernkrieg) */
  noMovesLoses?: boolean;
}

export interface Pos {
  b: (string | null)[];
  prom: boolean[];
  /** Brettbreite und -höhe */
  w: number;
  h: number;
  turn: Color;
  castle: { w: number[]; b: number[] };
  ep: number;
  pockets: { w: Record<string, number>; b: Record<string, number> };
  checks: { w: number; b: number };
  hadKing: { w: boolean; b: boolean };
  /** Hatte die Seite zu Beginn die Ziel-Figur (rules.captureWin)? */
  hadTarget?: { w: boolean; b: boolean };
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

const KN: [number, number][] = [[1, 2]];
const ORTH: [number, number][] = [[1, 0]];
const DIA: [number, number][] = [[1, 1]];

/** Eingebaute Figuren (außer Bauer). Märchenfiguren erscheinen in der Werkstatt und in Varianten. */
export const BUILTIN: Record<string, PieceDef> = {
  n: { name: 'Springer', look: 'n', leaps: KN, slides: [], value: 310 },
  b: { name: 'Läufer', look: 'b', leaps: [], slides: DIA, value: 330 },
  r: { name: 'Turm', look: 'r', leaps: [], slides: ORTH, value: 500 },
  q: { name: 'Dame', look: 'q', leaps: [], slides: [...ORTH, ...DIA], value: 900 },
  k: { name: 'König', look: 'k', leaps: [...ORTH, ...DIA], slides: [], value: 0 },
  a: { name: 'Amazone', look: 'q', badge: 'S', leaps: KN, slides: [...ORTH, ...DIA], value: 1250 },
  c: { name: 'Kanzler', look: 'r', badge: 'S', leaps: KN, slides: ORTH, value: 880 },
  h: { name: 'Erzbischof', look: 'b', badge: 'S', leaps: KN, slides: DIA, value: 820 },
  m: { name: 'Mann', look: 'k', badge: 'M', leaps: [...ORTH, ...DIA], slides: [], value: 320 },
  l: { name: 'Kamel', look: 'n', badge: '3', leaps: [[1, 3]], slides: [], value: 250 },
  z: { name: 'Zebra', look: 'n', badge: 'Z', leaps: [[2, 3]], slides: [], value: 240 },
  f: { name: 'Ferz', look: 'b', badge: 'F', leaps: DIA, slides: [], value: 150 },
  e: { name: 'Elefant', look: 'b', badge: 'E', leaps: [[2, 2]], slides: [], value: 140 },
  u: { name: 'Wesir', look: 'r', badge: 'W', leaps: ORTH, slides: [], value: 160 },
};

/** Buchstaben für selbst definierte Figuren */
export const CUSTOM_LETTERS = ['x', 'y', 'j'];

export const PIECE_NAMES: Record<string, string> = {
  p: 'Bauer',
  ...Object.fromEntries(Object.entries(BUILTIN).map(([k, d]) => [k, d.name])),
};
/** Klassische Werte (für ältere Aufrufer); eigene Figuren über valueOf */
export const VALUES: Record<string, number> = { p: 100, ...Object.fromEntries(Object.entries(BUILTIN).map(([k, d]) => [k, d.value])) };

export const pieceDef = (t: string, rules?: Rules): PieceDef | undefined => rules?.pieces?.[t] ?? BUILTIN[t];
export const pieceName = (t: string, rules?: Rules) => (t === 'p' ? 'Bauer' : pieceDef(t, rules)?.name ?? t.toUpperCase());
export const valueOf = (t: string, rules?: Rules) => (t === 'p' ? 100 : pieceDef(t, rules)?.value ?? 300);

export const other = (c: Color): Color => (c === 'w' ? 'b' : 'w');
export const fileOf = (s: number, w = 8) => s % w;
export const rankOf = (s: number, w = 8) => Math.floor(s / w);
export const sqName = (s: number, w = 8) => String.fromCharCode(97 + (s % w)) + (Math.floor(s / w) + 1);
export const sqIndex = (n: string, w = 8) => n.charCodeAt(0) - 97 + (Number(n.slice(1)) - 1) * w;
export const colorOf = (p: string): Color => (p === p.toUpperCase() ? 'w' : 'b');
const typeOf = (p: string) => p.toLowerCase();
const withColor = (t: string, c: Color) => (c === 'w' ? t.toUpperCase() : t.toLowerCase());

function step(pos: Pos, s: number, df: number, dr: number): number {
  const f = (s % pos.w) + df;
  const r = Math.floor(s / pos.w) + dr;
  return f < 0 || f >= pos.w || r < 0 || r >= pos.h ? -1 : r * pos.w + f;
}

// ---------- Gangarten-Tabelle (pro Regelsatz zwischengespeichert) ----------

interface Slide { df: number; dr: number; range: number }
interface Mover { leaps: [number, number][]; slides: Slide[] }
interface Table {
  movers: Record<string, Mover>;
  /** Rückwärtssuche für Angriffe: Sprungvektor → Figurenarten */
  leapIdx: { df: number; dr: number; types: Set<string> }[];
  slideIdx: { df: number; dr: number; types: Map<string, number> }[];
}

/** Alle Spiegelungen eines Vektors; bei „nur vorwärts“ nur die mit positiver Reihenrichtung. */
function expand(vs: [number, number][], forward?: boolean): [number, number][] {
  const out = new Map<string, [number, number]>();
  for (const [a, b] of vs)
    for (const [x, y] of [[a, b], [b, a]])
      for (const sx of [1, -1])
        for (const sy of [1, -1]) {
          const v: [number, number] = [x * sx, y * sy];
          if (forward && v[1] <= 0) continue;
          if (v[0] === 0 && v[1] === 0) continue;
          out.set(v.join(','), v);
        }
  return [...out.values()];
}

const tables = new WeakMap<Rules, Table>();
function table(rules: Rules): Table {
  let t = tables.get(rules);
  if (t) return t;
  // Nur Figurenarten, die vorkommen können (Startstellung, Umwandlung, eigene) – hält die Angriffsprüfung schnell
  const present = new Set([...(rules.setup === '960' ? 'kqrbn' : rules.setup.split(' ')[0].toLowerCase().replace(/[^a-z]/g, '')), ...rules.promo, 'k']);
  const defs = Object.fromEntries(
    Object.entries({ ...BUILTIN, ...(rules.pieces ?? {}) }).filter(([k]) => present.has(k) || !!rules.pieces?.[k]),
  );
  const movers: Record<string, Mover> = {};
  const leapIdx = new Map<string, { df: number; dr: number; types: Set<string> }>();
  const slideIdx = new Map<string, { df: number; dr: number; types: Map<string, number> }>();
  for (const [k, d] of Object.entries(defs)) {
    const leaps = expand(d.leaps, d.forward);
    const slides = expand(d.slides, d.forward).map(([df, dr]) => ({ df, dr, range: d.range || 99 }));
    movers[k] = { leaps, slides };
    for (const [df, dr] of leaps) {
      const key = df + ',' + dr;
      if (!leapIdx.has(key)) leapIdx.set(key, { df, dr, types: new Set() });
      leapIdx.get(key)!.types.add(k);
    }
    for (const sl of slides) {
      const key = sl.df + ',' + sl.dr;
      if (!slideIdx.has(key)) slideIdx.set(key, { df: sl.df, dr: sl.dr, types: new Map() });
      slideIdx.get(key)!.types.set(k, sl.range);
    }
  }
  t = { movers, leapIdx: [...leapIdx.values()], slideIdx: [...slideIdx.values()] };
  tables.set(rules, t);
  return t;
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

/** Eine FEN-Reihe in Felder zerlegen (mehrstellige Zahlen erlaubt, z. B. „10“) */
function rowCells(row: string): (string | null)[] {
  const out: (string | null)[] = [];
  for (const tok of row.match(/\d+|[a-zA-Z]/g) ?? []) {
    if (/\d/.test(tok)) for (let i = 0; i < Number(tok); i++) out.push(null);
    else out.push(tok);
  }
  return out;
}

/** Brettmaße einer Stellung (Breite = längste Reihe, Höhe = Anzahl Reihen) */
export function setupSize(setup: string): { w: number; h: number } {
  const rows = (setup === '960' ? '8/8/8/8/8/8/8/8' : setup.trim().split(/\s+/)[0]).split('/');
  return { w: Math.max(...rows.map((r) => rowCells(r).length)), h: rows.length };
}

export function parseSetup(setup: string, rules: Rules): Pos {
  const fen = setup === '960' ? fen960() : setup;
  const [boardPart, turnPart] = fen.trim().split(/\s+/);
  const rows = boardPart.split('/');
  const { w, h } = setupSize(fen);
  const b: (string | null)[] = Array(w * h).fill(null);
  rows.forEach((row, i) => {
    rowCells(row).forEach((ch, f) => {
      if (ch && f < w) b[(h - 1 - i) * w + f] = ch;
    });
  });
  const pos: Pos = {
    b,
    prom: Array(w * h).fill(false),
    w,
    h,
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
  if (rules.captureWin) pos.hadTarget = { w: b.includes(rules.captureWin.toUpperCase()), b: b.includes(rules.captureWin) };
  if (rules.castling && !rules.antichess) {
    for (const c of ['w', 'b'] as Color[]) {
      const back = c === 'w' ? 0 : h - 1;
      const ks = kingSq(pos, c);
      if (ks < 0 || Math.floor(ks / w) !== back) continue;
      const R = withColor('r', c);
      const row = Array.from({ length: w }, (_, f) => back * w + f);
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
  const sg = by === 'w' ? 1 : -1;
  // Bauern
  for (const df of [-1, 1]) {
    const t = step(pos, s, df, -sg);
    if (t >= 0 && b[t] === withColor('p', by)) return true;
  }
  const tb = table(rules);
  for (const L of tb.leapIdx) {
    const t = step(pos, s, -L.df, -L.dr * sg);
    if (t < 0) continue;
    const p = b[t];
    if (!p || colorOf(p) !== by) continue;
    const k = typeOf(p);
    if (rules.atomic && k === 'k') continue; // Könige schlagen im Atomschach nicht
    if (L.types.has(k)) return true;
  }
  for (const S of tb.slideIdx) {
    let t = step(pos, s, -S.df, -S.dr * sg);
    let dist = 1;
    while (t >= 0) {
      if (t === pos.duck) break;
      const p = b[t];
      if (p) {
        if (colorOf(p) === by) {
          const range = S.types.get(typeOf(p));
          if (range !== undefined && dist <= range) return true;
        }
        break;
      }
      t = step(pos, t, -S.df, -S.dr * sg);
      dist++;
    }
  }
  return false;
}

export function inCheck(pos: Pos, c: Color, rules: Rules): boolean {
  const k = kingSq(pos, c);
  if (k < 0) return false;
  if (rules.atomic) {
    const ek = kingSq(pos, other(c));
    const W = pos.w;
    if (ek >= 0 && Math.max(Math.abs((ek % W) - (k % W)), Math.abs(Math.floor(ek / W) - Math.floor(k / W))) === 1) return false;
  }
  return attacked(pos, k, other(c), rules);
}

export function isCapture(pos: Pos, m: Move): boolean {
  if (m.drop || m.castle !== undefined) return false;
  if (pos.b[m.to]) return true;
  const p = pos.b[m.from];
  return !!p && typeOf(p) === 'p' && m.to === pos.ep && m.from % pos.w !== m.to % pos.w;
}

// ---------- Zuggenerierung ----------

function pseudo(pos: Pos, rules: Rules): Move[] {
  const out: Move[] = [];
  const me = pos.turn;
  const b = pos.b;
  const W = pos.w;
  const H = pos.h;
  const sg = me === 'w' ? 1 : -1;
  const tb = table(rules);
  const promos = rules.promo.length ? rules.promo : ['q'];
  const homeRows = H >= 10 ? 2 : 1;
  const addPawn = (from: number, to: number) => {
    const last = me === 'w' ? H - 1 : 0;
    if (Math.floor(to / W) === last) for (const p of promos) out.push({ from, to, promo: p });
    else out.push({ from, to });
  };
  for (let s = 0; s < b.length; s++) {
    const p = b[s];
    if (!p || colorOf(p) !== me) continue;
    const t = typeOf(p);
    if (t === 'p') {
      const one = step(pos, s, 0, sg);
      if (one >= 0 && !blocked(pos, one)) {
        addPawn(s, one);
        const r = Math.floor(s / W);
        const home = me === 'w' ? r <= homeRows : r >= H - 1 - homeRows;
        const two = step(pos, one, 0, sg);
        if (rules.pawnDouble && home && two >= 0 && !blocked(pos, two)) out.push({ from: s, to: two });
      }
      for (const df of [-1, 1]) {
        const c = step(pos, s, df, sg);
        if (c < 0 || c === pos.duck) continue;
        if ((b[c] && colorOf(b[c]!) !== me) || (c === pos.ep && !b[c])) addPawn(s, c);
      }
      continue;
    }
    const mv = tb.movers[t];
    if (!mv) continue;
    const target = (to: number) => {
      if (to < 0 || to === pos.duck) return;
      const q = b[to];
      if (q && colorOf(q) === me) return;
      if (q && rules.atomic && t === 'k') return; // König darf im Atomschach nicht schlagen
      out.push({ from: s, to });
    };
    for (const [df, dr] of mv.leaps) target(step(pos, s, df, dr * sg));
    for (const sl of mv.slides) {
      let to = step(pos, s, sl.df, sl.dr * sg);
      let n = 1;
      while (to >= 0 && to !== pos.duck && n <= sl.range) {
        const q = b[to];
        if (q) {
          if (colorOf(q) !== me && !(rules.atomic && t === 'k')) out.push({ from: s, to });
          break;
        }
        out.push({ from: s, to });
        to = step(pos, to, sl.df, sl.dr * sg);
        n++;
      }
    }
  }
  // Rochade (auch Chess960 und breite Bretter)
  if (rules.castling && !rules.antichess && pos.castle[me].length) {
    const ks = kingSq(pos, me);
    const back = me === 'w' ? 0 : H - 1;
    if (ks >= 0 && Math.floor(ks / W) === back && !(rules.kingSafety && inCheck(pos, me, rules))) {
      for (const rs of pos.castle[me]) {
        if (b[rs] !== withColor('r', me)) continue;
        const kingSide = rs > ks;
        const kd = back * W + (kingSide ? W - 2 : 2);
        const rd = back * W + (kingSide ? W - 3 : 3);
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
      for (let s = 0; s < b.length; s++) {
        if (blocked(pos, s)) continue;
        const r = Math.floor(s / W);
        if (t === 'p' && (r === 0 || r === H - 1)) continue;
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
  const W = pos.w;
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
      const back = Math.floor(m.from / W);
      const rd = back * W + (m.castle > m.from ? W - 3 : 3);
      b[m.from] = null;
      b[m.castle] = null;
      b[m.to] = pc;
      b[rd] = rook;
      castle[me] = [];
    } else {
      const dir = me === 'w' ? 1 : -1;
      if (t === 'p' && m.to === pos.ep && !b[m.to] && m.from % W !== m.to % W) {
        const cs = m.to - W * dir;
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
        if (Math.abs(m.to - m.from) === 2 * W) ep = (m.to + m.from) / 2;
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
      for (const [df, dr] of [[1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1]]) {
        const s = step(pos, m.to, df, dr);
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
    ...pos,
    b,
    prom,
    turn: them,
    castle,
    ep,
    pockets,
    checks: { ...pos.checks },
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
  for (let s = 0; s < pos.b.length; s++) if (!pos.b[s] && s !== prevDuck) out.push(s);
  return out;
}

const count = (pos: Pos, c: Color) => pos.b.reduce((n, p) => n + (p && colorOf(p) === c ? 1 : 0), 0);

/** Die (bis zu vier) Zentrumsfelder für „König der Hügel“ */
export function hillSquares(pos: Pos): number[] {
  const mid = (n: number) => (n % 2 ? [(n - 1) / 2] : [n / 2 - 1, n / 2]);
  return mid(pos.h).flatMap((r) => mid(pos.w).map((f) => r * pos.w + f));
}

/** Material einer Seite (für Zuglimit-Varianten) */
export function materialOf(pos: Pos, c: Color, rules: Rules): number {
  let m = 0;
  for (const p of pos.b) if (p && colorOf(p) === c && typeOf(p) !== 'k') m += valueOf(typeOf(p), rules);
  for (const [t, n] of Object.entries(pos.pockets[c])) m += n * valueOf(t, rules);
  return m;
}

/** Spielende ohne Zuggenerierung (schnell, für die Suche) */
export function quickOutcome(pos: Pos, rules: Rules): Outcome | null {
  if (!rules.antichess) {
    for (const c of ['w', 'b'] as Color[]) {
      if (pos.hadKing[c] && kingSq(pos, c) < 0)
        return { winner: other(c), reason: rules.atomic ? 'König explodiert' : 'König geschlagen' };
    }
  }
  if (rules.captureWin && pos.hadTarget) {
    const t = rules.captureWin;
    for (const c of ['w', 'b'] as Color[])
      if (pos.hadTarget[c] && !pos.b.includes(withColor(t, c))) return { winner: other(c), reason: `${pieceName(t, rules)} geschlagen` };
  }
  if (rules.promoteWins) {
    for (let s = 0; s < pos.b.length; s++)
      if (pos.prom[s] && pos.b[s]) return { winner: colorOf(pos.b[s]!), reason: 'Bauer umgewandelt' };
  }
  if (rules.checksToWin) {
    for (const c of ['w', 'b'] as Color[])
      if (pos.checks[c] >= rules.checksToWin) return { winner: c, reason: `${rules.checksToWin} Schachgebote` };
  }
  if (rules.hill) {
    const hill = hillSquares(pos);
    for (const c of ['w', 'b'] as Color[]) if (hill.includes(kingSq(pos, c))) return { winner: c, reason: 'König auf dem Hügel' };
  }
  if (rules.race) {
    const w = kingSq(pos, 'w');
    const bk = kingSq(pos, 'b');
    const top = pos.h - 1;
    const w8 = w >= 0 && Math.floor(w / pos.w) === top;
    const b8 = bk >= 0 && Math.floor(bk / pos.w) === top;
    if (w8 && b8) return { winner: 'draw', reason: 'Beide Könige im Ziel' };
    if (b8) return { winner: 'b', reason: 'König im Ziel' };
    if (w8 && pos.turn === 'w') return { winner: 'w', reason: 'König im Ziel' };
  }
  if (rules.antichess) {
    if (count(pos, pos.turn) === 0) return { winner: pos.turn, reason: 'Alle Figuren verloren' };
  } else {
    for (const c of ['w', 'b'] as Color[]) if (count(pos, c) === 0) return { winner: other(c), reason: 'Alle Figuren geschlagen' };
  }
  if (rules.moveLimit && pos.ply >= rules.moveLimit * 2) {
    const mw = materialOf(pos, 'w', rules);
    const mb = materialOf(pos, 'b', rules);
    return mw === mb ? { winner: 'draw', reason: 'Zuglimit – Material gleich' } : { winner: mw > mb ? 'w' : 'b', reason: 'Zuglimit – mehr Material' };
  }
  if (pos.half >= 100) return { winner: 'draw', reason: '50-Züge-Regel' };
  return null;
}

export function outcome(pos: Pos, rules: Rules, moves = legalMoves(pos, rules)): Outcome | null {
  const q = quickOutcome(pos, rules);
  if (q) return q;
  if (rules.race) {
    const w = kingSq(pos, 'w');
    if (w >= 0 && Math.floor(w / pos.w) === pos.h - 1 && pos.turn === 'b') {
      const bk = kingSq(pos, 'b');
      if (!moves.some((m) => m.from === bk && Math.floor(m.to / pos.w) === pos.h - 1)) return { winner: 'w', reason: 'König im Ziel' };
    }
  }
  if (!moves.length) {
    if (rules.antichess || rules.stalemateWins) return { winner: pos.turn, reason: 'Patt – der Pattgesetzte gewinnt' };
    if (inCheck(pos, pos.turn, rules)) return { winner: other(pos.turn), reason: 'Schachmatt' };
    if (rules.noMovesLoses) return { winner: other(pos.turn), reason: 'Kein Zug mehr möglich' };
    return { winner: 'draw', reason: 'Patt' };
  }
  return null;
}

export function posKey(pos: Pos): string {
  return pos.b.map((p) => p ?? '.').join('') + pos.turn + pos.duck + JSON.stringify(pos.pockets) + pos.castle.w.join() + '|' + pos.castle.b.join() + pos.ep;
}

const DE: Record<string, string> = { n: 'S', b: 'L', r: 'T', q: 'D', k: 'K', a: 'A', c: 'C', h: 'E', p: '' };

/** Zug in lesbarer (deutscher) Notation */
export function moveText(pos: Pos, m: Move, rules?: Rules): string {
  const letter = (t: string) => DE[t] ?? (pieceDef(t, rules)?.badge ?? t).toUpperCase();
  const name = (s: number) => sqName(s, pos.w);
  let s: string;
  if (m.drop) s = `${letter(m.drop) || 'B'}@${name(m.to)}`;
  else if (m.castle !== undefined) s = m.castle > m.from ? 'O-O' : 'O-O-O';
  else {
    const p = pos.b[m.from]!;
    const t = typeOf(p);
    const cap = isCapture(pos, m);
    s = (t === 'p' ? (cap ? name(m.from)[0] : '') : letter(t)) + (cap ? 'x' : '') + name(m.to) + (m.promo ? '=' + letter(m.promo) : '');
  }
  if (m.duck !== undefined) s += ` Ente ${name(m.duck)}`;
  return s;
}

export function sameMove(a: Move, b: Move) {
  return a.from === b.from && a.to === b.to && (a.promo ?? '') === (b.promo ?? '') && (a.drop ?? '') === (b.drop ?? '');
}
