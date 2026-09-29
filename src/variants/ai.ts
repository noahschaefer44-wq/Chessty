// Einfache, aber variantenfähige Schach-KI: Alpha-Beta mit Ruhesuche und Varianten-Bewertung.
import {
  VALUES, colorOf, fileOf, rankOf, kingSq, isCapture, legalMoves, legalCaptures, makeMove,
  outcome, quickOutcome, duckSquares, type Move, type Pos, type Rules, type Outcome, type Color,
} from './engine';

export interface BotLevel {
  id: number;
  name: string;
  desc: string;
  depth: number;
  ms: number;
  noise: number;
  random: number;
}

export const BOTS: BotLevel[] = [
  { id: 0, name: 'Küken', desc: 'Kennt die Regeln, zieht oft planlos.', depth: 1, ms: 300, noise: 180, random: 0.35 },
  { id: 1, name: 'Lehrling', desc: 'Schlägt, was hängt – übersieht aber viel.', depth: 2, ms: 600, noise: 70, random: 0.08 },
  { id: 2, name: 'Vereinsspieler', desc: 'Rechnet drei Halbzüge und spielt solide.', depth: 3, ms: 1200, noise: 20, random: 0 },
  { id: 3, name: 'Experte', desc: 'Sucht tiefer und nutzt die Varianten-Ziele.', depth: 5, ms: 2000, noise: 0, random: 0 },
  { id: 4, name: 'Meister', desc: 'Die stärkste Stufe – rechnet so tief, wie die Zeit reicht.', depth: 9, ms: 3500, noise: 0, random: 0 },
];

const MATE = 1_000_000;
const INF = 10_000_000;

function center(s: number) {
  return 3 - Math.floor(Math.max(Math.abs(fileOf(s) - 3.5), Math.abs(rankOf(s) - 3.5)));
}

/** Bewertung aus Sicht von Weiß (Centipawns) */
export function evaluate(pos: Pos, rules: Rules): number {
  let mat = 0;
  let posi = 0;
  const horde = !pos.hadKing.w || !pos.hadKing.b;
  for (let s = 0; s < 64; s++) {
    const p = pos.b[s];
    if (!p) continue;
    const c = colorOf(p);
    const sign = c === 'w' ? 1 : -1;
    const t = p.toLowerCase();
    const v = rules.antichess && t === 'k' ? 250 : VALUES[t];
    mat += sign * v;
    const adv = c === 'w' ? rankOf(s) : 7 - rankOf(s);
    if (t === 'p') posi += sign * adv * (horde ? 10 : 5) + sign * (center(s) >= 2 ? 8 : 0);
    else if (t === 'k') {
      if (rules.hill) posi += sign * center(s) * 140;
      else if (rules.race) posi += sign * rankOf(s) * 160;
      else if (!rules.antichess) posi += sign * (adv === 0 ? 15 : -adv * 6);
    } else posi += sign * center(s) * (t === 'q' || t === 'a' ? 3 : 9);
  }
  if (rules.drops)
    for (const c of ['w', 'b'] as Color[])
      for (const [t, n] of Object.entries(pos.pockets[c])) mat += (c === 'w' ? 1 : -1) * n * VALUES[t] * 0.9;
  if (rules.antichess) return -mat + posi * 0.2;
  let score = mat + posi;
  if (rules.checksToWin) score += (pos.checks.w ** 2 - pos.checks.b ** 2) * (600 / Math.max(1, rules.checksToWin - 1));
  if (rules.race) score = score * 0.4 + posi;
  return score;
}

const side = (pos: Pos, rules: Rules) => (pos.turn === 'w' ? 1 : -1) * evaluate(pos, rules);
const term = (o: Outcome, turn: Color, ply: number) => (o.winner === 'draw' ? 0 : o.winner === turn ? MATE - ply : -(MATE - ply));

class Timeout extends Error {}

export function chooseMove(pos: Pos, rules: Rules, level: BotLevel): Move | null {
  const moves = legalMoves(pos, rules);
  if (!moves.length) return null;
  let best: Move;
  if (Math.random() < level.random) best = moves[Math.floor(Math.random() * moves.length)];
  else best = search(pos, rules, level, moves);
  if (rules.duck) {
    const after = makeMove(pos, best, rules);
    best = { ...best, duck: placeDuck(after, rules, pos.duck, level) };
  }
  return best;
}

function orderScore(pos: Pos, m: Move): number {
  let s = 0;
  if (isCapture(pos, m)) {
    const victim = pos.b[m.to]?.toLowerCase() ?? 'p';
    const attacker = pos.b[m.from]?.toLowerCase() ?? 'p';
    s += 10_000 + VALUES[victim] * 10 - VALUES[attacker];
  }
  if (m.promo) s += 8000 + VALUES[m.promo];
  if (m.castle !== undefined) s += 300;
  if (m.drop) s -= 50;
  return s;
}

function search(root: Pos, rules: Rules, level: BotLevel, rootMoves: Move[]): Move {
  const deadline = Date.now() + level.ms;
  let nodes = 0;
  const tick = () => {
    if ((++nodes & 511) === 0 && Date.now() > deadline) throw new Timeout();
  };

  function quies(pos: Pos, alpha: number, beta: number, ply: number, qd: number): number {
    tick();
    const q = quickOutcome(pos, rules);
    if (q) return term(q, pos.turn, ply);
    const stand = side(pos, rules);
    if (qd >= 5) return stand;
    if (stand >= beta) return stand;
    if (stand > alpha) alpha = stand;
    const caps = legalCaptures(pos, rules).sort((a, b) => orderScore(pos, b) - orderScore(pos, a));
    let best = stand;
    for (const m of caps) {
      const v = -quies(makeMove(pos, m, rules), -beta, -alpha, ply + 1, qd + 1);
      if (v > best) best = v;
      if (v > alpha) alpha = v;
      if (alpha >= beta) break;
    }
    return best;
  }

  function neg(pos: Pos, depth: number, alpha: number, beta: number, ply: number): number {
    tick();
    const q = quickOutcome(pos, rules);
    if (q) return term(q, pos.turn, ply);
    if (depth <= 0) return quies(pos, alpha, beta, ply, 0);
    const moves = legalMoves(pos, rules);
    const o = outcome(pos, rules, moves);
    if (o) return term(o, pos.turn, ply);
    moves.sort((a, b) => orderScore(pos, b) - orderScore(pos, a));
    let best = -INF;
    for (const m of moves) {
      const v = -neg(makeMove(pos, m, rules), depth - 1, -beta, -alpha, ply + 1);
      if (v > best) best = v;
      if (v > alpha) alpha = v;
      if (alpha >= beta) break;
    }
    return best;
  }

  let order = rootMoves.slice().sort((a, b) => orderScore(root, b) - orderScore(root, a));
  let bestMove = order[0];
  const exact = level.noise > 0; // mit Rauschen: jeden Wurzelzug exakt bewerten
  try {
    for (let d = 1; d <= level.depth; d++) {
      const scored: { m: Move; v: number }[] = [];
      let alpha = -INF;
      for (const m of order) {
        const v = -neg(makeMove(root, m, rules), d - 1, -INF, exact ? INF : -alpha, 1) + (level.noise ? (Math.random() - 0.5) * 2 * level.noise : 0);
        scored.push({ m, v });
        if (v > alpha) alpha = v;
      }
      scored.sort((a, b) => b.v - a.v);
      order = scored.map((x) => x.m);
      bestMove = order[0];
      if (scored[0].v > MATE - 1000) break; // Gewinn gefunden
    }
  } catch (e) {
    if (!(e instanceof Timeout)) throw e;
  }
  return bestMove;
}

/** Ente so setzen, dass der Gegner möglichst wenig davon hat */
function placeDuck(after: Pos, rules: Rules, prevDuck: number, level: BotLevel): number {
  const squares = duckSquares(after, prevDuck);
  if (level.random > 0.2 && Math.random() < 0.5) return squares[Math.floor(Math.random() * squares.length)];
  const me = after.turn === 'w' ? 'b' : 'w';
  // Kandidaten: Felder nahe dem eigenen König und Felder, die gegnerische Schlagzüge blockieren
  const myK = kingSq(after, me);
  let bestSq = squares[0];
  let bestV = INF;
  const deadline = Date.now() + 800;
  for (const d of squares) {
    if (Date.now() > deadline) break;
    const p2 = { ...after, duck: d };
    const replies = legalMoves(p2, rules);
    const o = outcome(p2, rules, replies);
    let worst = -INF;
    if (o) worst = o.winner === 'draw' ? 0 : o.winner === p2.turn ? MATE : -MATE;
    else
      for (const r of replies) {
        const n = makeMove(p2, r, rules);
        const q = quickOutcome(n, rules);
        const v = q ? (q.winner === 'draw' ? 0 : q.winner === p2.turn ? MATE : -MATE) : -side(n, rules);
        if (v > worst) worst = v;
      }
    const near = myK >= 0 ? Math.max(Math.abs(fileOf(d) - fileOf(myK)), Math.abs(rankOf(d) - rankOf(myK))) : 4;
    const v = worst + near + Math.random() * 3;
    if (v < bestV) {
      bestV = v;
      bestSq = d;
    }
  }
  return bestSq;
}
