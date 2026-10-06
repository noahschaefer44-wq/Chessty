// Jede Varianten-Einführung: Stellung gültig, akzeptierte Züge legal, Gewinnaufgaben wirklich gewonnen.
import { describe, expect, it } from 'vitest';
import { VARIANT_LESSONS } from '../src/variants/lessons';
import { variantById } from '../src/variants/list';
import { legalMoves, makeMove, outcome } from '../src/variants/engine';
import { moveCode, stepStart } from '../src/variants/VariantLesson';
import { dailyDesign } from '../src/variants/daily';
import { designRules, parseIdea, IDEAS } from '../src/variants/assistant';
import { newGame } from '../src/variants/engine';

describe('Varianten-Einführungen', () => {
  for (const l of VARIANT_LESSONS)
    for (const [k, s] of l.steps.entries())
      it(`${l.id} #${k + 1}`, () => {
        const v = variantById(l.variant);
        expect(v, 'Variante ' + l.variant).toBeTruthy();
        const { r, p } = stepStart(v!.rules, s);
        const moves = legalMoves(p, r);
        const codes = moves.map((m) => moveCode(p, m));
        for (const a of s.accept) expect(codes, `${a} legal`).toContain(a);
        if (s.goal === 'win') {
          const winners = moves.filter((m) => outcome(makeMove(p, m, r), r)?.winner === p.turn);
          expect(winners.length, 'gewinnender Zug vorhanden').toBeGreaterThan(0);
          for (const a of s.accept) {
            const m = moves[codes.indexOf(a)];
            expect(outcome(makeMove(p, m, r), r)?.winner, `${a} gewinnt`).toBe(p.turn);
          }
        }
      });
});

describe('Werkstatt', () => {
  it('Tagesvarianten eines Jahres sind spielbar', () => {
    for (let d = 0; d < 365; d += 7) {
      const date = new Date(Date.UTC(2026, 0, 1 + d)).toISOString().slice(0, 10);
      const r = designRules(dailyDesign(date));
      expect(legalMoves(newGame(r), r).length, date).toBeGreaterThan(0);
    }
  });
  it('Beispiel-Ideen ergeben gültige Regeln', () => {
    for (const idea of IDEAS) {
      const res = parseIdea(idea);
      const r = designRules(res.design);
      expect(legalMoves(newGame(r), r).length, idea).toBeGreaterThan(0);
      expect(res.unknown, idea).toEqual([]);
    }
  });
});
