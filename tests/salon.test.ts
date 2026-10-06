// Spielesalon: Regeln und KI laufen ohne Fehler bis zum Spielende.
import { describe, expect, it } from 'vitest';
import { bestMove, type GameRules, type Level } from '../src/salon/ai';
import { DAME, dameInit, dameMoves } from '../src/salon/dame';
import { MUEHLE, muehleInit } from '../src/salon/muehle';
import { VIER, c4Init, REVERSI, reversiInit, GOMOKU, gomokuInit } from '../src/salon/grids';

const FAST: Level = { name: 't', desc: '', depth: 2, ms: 40, random: 0.1 };
function selfPlay<S, M>(g: GameRules<S, M>, s: S, max = 400) {
  for (let i = 0; i < max; i++) {
    if (g.result(s)) return g.result(s);
    const m = bestMove(g, s, FAST);
    if (m === null) return g.result(s);
    s = g.play(s, m);
  }
  return 'offen';
}

describe('Spielesalon', () => {
  it('Dame: 7 Eröffnungszüge, Schlagzwang', () => {
    expect(dameMoves(dameInit()).length).toBe(7);
    const b = Array(64).fill(0);
    b[2 * 8 + 2] = 1; // c3
    b[3 * 8 + 3] = 2; // d4
    b[7 * 8 + 7] = 2;
    const ms = dameMoves({ b, turn: 1, quiet: 0 });
    expect(ms.every((m) => m.caps.length === 1)).toBe(true);
  });
  it('Dame bis zum Ende', () => expect(['1', '2', 'draw']).toContain(String(selfPlay(DAME, dameInit()))));
  it('Mühle bis zum Ende', () => expect(['1', '2', 'draw', 'offen']).toContain(String(selfPlay(MUEHLE, muehleInit()))));
  it('Vier gewinnt bis zum Ende', () => expect(selfPlay(VIER, c4Init())).not.toBe('offen'));
  it('Reversi bis zum Ende', () => expect(selfPlay(REVERSI, reversiInit())).not.toBe('offen'));
  it('Fünf in einer Reihe: KI blockt Vierer', () => {
    const s = gomokuInit();
    const b = s.b.slice();
    for (const x of [3, 4, 5, 6]) b[7 * 15 + x] = 1;
    b[7 * 15 + 2] = 2; b[0] = 2; // geschlossener Vierer: nur ein Feld rettet
    const m = bestMove(GOMOKU, { ...s, b, turn: 2, last: 7 * 15 + 6 }, { ...FAST, random: 0, depth: 2, ms: 300 });
    expect(m).toBe(7 * 15 + 7);
  });
});
