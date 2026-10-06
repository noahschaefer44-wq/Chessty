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

describe('Große und kleine Bretter', () => {
  it('Capablanca 10×8 (Perft-Referenz)', () => {
    const r = v('capablanca');
    const p = newGame(r);
    expect([p.w, p.h]).toEqual([10, 8]);
    expect(perft(p, r, 1)).toBe(28);
    expect(perft(p, r, 2)).toBe(784);
    expect(perft(p, r, 3)).toBe(25228);
  });
  it('Los Alamos 6×6: 10 Startzüge', () => {
    const r = v('losalamos');
    expect(perft(newGame(r), r, 1)).toBe(10);
  });
  it('Grand 10×10 baut sich auf', () => {
    const r = v('grand');
    const p = newGame(r);
    expect([p.w, p.h]).toEqual([10, 10]);
    expect(legalMoves(p, r).length).toBeGreaterThan(20);
  });
  it('Bauernkrieg: Umwandlung gewinnt', async () => {
    const { outcome } = await import('../src/variants/engine');
    const r = { ...v('bauernkrieg'), setup: '8/P7/8/8/8/8/7p/8 w' };
    const p = newGame(r);
    const m = legalMoves(p, r).find((x) => x.promo === 'q')!;
    expect(outcome(makeMove(p, m, r), r)?.winner).toBe('w');
  });
  it('Kamel springt (3,1)', () => {
    const r = { ...BASE_RULES, setup: '8/8/8/8/3L4/8/8/k6K w', castling: false };
    const p = newGame(r);
    const from = 3 * 8 + 3;
    expect(legalMoves(p, r).filter((m) => m.from === from).length).toBe(8);
  });
});
