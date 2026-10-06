import { describe, expect, it } from 'vitest';
import { Chess } from 'chess.js';
import { mirrorFen, mirrorUci } from '../src/lib/transform';

describe('Spiegeln', () => {
  it('Farbtausch der Grundstellung nach 1.e4', () => {
    const c = new Chess();
    c.move('e4');
    const m = mirrorFen(c.fen(), 'colors');
    expect(m.split(' ').slice(0, 3).join(' ')).toBe('rnbqkbnr/pppp1ppp/8/4p3/8/8/PPPPPPPP/RNBQKBNR w KQkq');
  });
  it('a↔h-Spiegelung behält legale Züge bei', () => {
    const fen = '6k1/5ppp/8/8/8/8/5PPP/R5K1 w - - 0 1';
    const m = mirrorFen(fen, 'files');
    expect(m.startsWith('1k6/ppp5/8/8/8/8/PPP5/1K5R w')).toBe(true);
    const c = new Chess(m);
    expect(c.move({ from: mirrorUci('a1a8', 'files').slice(0, 2), to: mirrorUci('a1a8', 'files').slice(2, 4) }).san).toBe('Rh8#');
  });
  it('Farbtausch erhält die Lösung', () => {
    const fen = '6k1/5ppp/8/8/8/8/5PPP/R5K1 w - - 0 1';
    const m = mirrorFen(fen, 'colors');
    const c = new Chess(m);
    const u = mirrorUci('a1a8', 'colors');
    expect(c.move({ from: u.slice(0, 2), to: u.slice(2, 4) }).san).toBe('Ra1#');
  });
});
