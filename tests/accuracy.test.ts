import { describe, expect, it } from 'vitest';
import { winPct, moveAccuracy, gameAccuracy } from '../src/lib/accuracy';

describe('Genauigkeit (Lichess-Formel)', () => {
  it('Gewinnchance ist symmetrisch um 50 %', () => {
    expect(winPct(0)).toBeCloseTo(50, 5);
    expect(winPct(300) + winPct(-300)).toBeCloseTo(100, 5);
  });
  it('Zug ohne Verlust ist ~100 %', () => expect(moveAccuracy(60, 60)).toBeGreaterThan(99));
  it('großer Patzer liegt unter 20 %', () => expect(moveAccuracy(80, 10)).toBeLessThan(20));
  it('Partie liefert Werte für beide Seiten', () => {
    const r = gameAccuracy([20, 30, 25, -250, -240, -230, -235]);
    expect(r.white).toBeGreaterThanOrEqual(0);
    expect(r.white).toBeLessThanOrEqual(100);
    expect(r.black).toBeGreaterThan(r.white);
  });
});
