// Varianten-Engine: Perft-Referenzwerte (klassisch und Lichess/Fairy-Stockfish).
import { describe, expect, it } from 'vitest';
import { BASE_RULES, newGame, legalMoves, makeMove, type Pos, type Rules } from '../src/variants/engine';
import { VARIANTS } from '../src/variants/list';

function perft(p: Pos, r: Rules, d: number): number {
  if (d === 0) return 1;
  let n = 0;
  for (const m of legalMoves(p, r)) n += perft(makeMove(p, m, r), r, d - 1);
  return n;
}
const v = (id: string) => VARIANTS.find((x) => x.rules.id === id)!.rules;

describe('Perft', () => {
  it('Grundstellung', () => expect(perft(newGame(BASE_RULES), BASE_RULES, 3)).toBe(8902));
  it('Kiwipete', () => {
    const r = { ...BASE_RULES, setup: 'r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w' };
    expect(perft(newGame(r), r, 2)).toBe(2039);
  });
  it('Stellung 3', () => {
    const r = { ...BASE_RULES, setup: '8/2p5/3p4/KP5r/1R3p1k/8/4P1P1/8 w', castling: false };
    expect(perft(newGame(r), r, 4)).toBe(43238);
  });
  it('Crazyhouse', () => expect(perft(newGame(v('crazyhouse')), v('crazyhouse'), 3)).toBe(8902));
  it('Schlagschach', () => expect(perft(newGame(v('antichess')), v('antichess'), 3)).toBe(8067));
  it('Atomschach', () => expect(perft(newGame(v('atomic')), v('atomic'), 3)).toBe(8902));
  it('Horde', () => expect(perft(newGame(v('horde')), v('horde'), 3)).toBe(1274));
  it('Königsrennen', () => expect(perft(newGame(v('racingkings')), v('racingkings'), 3)).toBe(11264));
});
