// Prüft die Varianten-Engine: Perft-Werte (klassisch + Lichess-Referenzen) und ein Bot-Duell je Variante.
import { BASE_RULES, newGame, legalMoves, makeMove, outcome, type Pos, type Rules } from '../src/variants/engine';
import { VARIANTS } from '../src/variants/list';
import { chooseMove, BOTS } from '../src/variants/ai';
import { parseIdea, designRules, describeRules, IDEAS } from '../src/variants/assistant';

function perft(p: Pos, r: Rules, d: number): number {
  if (d === 0) return 1;
  let n = 0;
  for (const m of legalMoves(p, r)) n += perft(makeMove(p, m, r), r, d - 1);
  return n;
}

let bad = 0;
const check = (name: string, got: number, exp: number) => {
  const ok = got === exp;
  if (!ok) bad++;
  console.log(`${ok ? 'OK ' : 'FEHLER'} ${name}: ${got} (erwartet ${exp})`);
};

const R = BASE_RULES;
check('Grundstellung d4', perft(newGame(R), R, 4), 197281);
const kiwi = { ...R, setup: 'r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w' };
check('Kiwipete d3', perft(newGame(kiwi), kiwi, 3), 97862);
const p3 = { ...R, setup: '8/2p5/3p4/KP5r/1R3p1k/8/4P1P1/8 w', castling: false };
check('Stellung 3 d4', perft(newGame(p3), p3, 4), 43238);

const v = (id: string) => VARIANTS.find((x) => x.rules.id === id)!.rules;
// Referenzwerte aus Lichess/Fairy-Stockfish-Tests
check('Crazyhouse d4', perft(newGame(v('crazyhouse')), v('crazyhouse'), 4), 197281);
check('Antichess d3', perft(newGame(v('antichess')), v('antichess'), 3), 8067);
check('Atomic d3', perft(newGame(v('atomic')), v('atomic'), 3), 8902);
check('Horde d3', perft(newGame(v('horde')), v('horde'), 3), 1274);
check('Racing Kings d3', perft(newGame(v('racingkings')), v('racingkings'), 3), 11264);

// Bot gegen Bot: jede Variante muss ohne Absturz zu Ende laufen
for (const info of VARIANTS) {
  const rules = info.rules;
  let pos = newGame(rules);
  let res = null;
  const t = Date.now();
  let plies = 0;
  for (; plies < 160 && !res; plies++) {
    const m = chooseMove(pos, rules, { ...BOTS[1], ms: 150 });
    if (!m) break;
    pos = makeMove(pos, m, rules);
    res = outcome(pos, rules);
  }
  console.log(`Duell ${rules.name}: ${plies} Halbzüge, ${res ? res.reason + ' → ' + res.winner : 'kein Ende'} (${Date.now() - t} ms)`);
}

for (const idea of IDEAS) {
  const r = parseIdea(idea);
  const rules = designRules(r.design);
  const moves = legalMoves(newGame(rules), rules).length;
  console.log(`Idee: ${idea}\n  → ${describeRules(rules, r.design).join(' | ')} (${moves} Startzüge)${r.unknown.length ? ' UNBEKANNT: ' + r.unknown.join(' / ') : ''}`);
}
process.exit(bad ? 1 : 0);
