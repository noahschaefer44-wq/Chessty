// Prüft die Genauigkeitsberechnung gegen Lichess-Werte (Stockfish im Node-Prozess).
import { Chess } from 'chess.js';
import { spawn } from 'child_process';
import { gameAccuracy } from '../src/lib/accuracy';

const moves = process.argv[2].split(' ');
const depth = +(process.argv[3] ?? 12);
const sf = spawn('node', ['node_modules/stockfish/bin/stockfish-19-lite-single.js']);
let buf = '';
let res: ((s: string) => void) | null = null;
sf.stdout.on('data', (d) => {
  buf += d;
  if (buf.includes('bestmove')) {
    const b = buf;
    buf = '';
    res?.(b);
  }
});
const ev = (fen: string) =>
  new Promise<number>((r) => {
    res = (out) => {
      const m = [...out.matchAll(/score (cp|mate) (-?\d+)/g)].pop();
      const white = fen.split(' ')[1] === 'w';
      let cp = m ? (m[1] === 'mate' ? (+m[2] > 0 ? 10000 : -10000) : +m[2]) : 0;
      if (!m) cp = new Chess(fen).isCheckmate() ? -10000 : 0;
      r(white ? cp : -cp);
    };
    sf.stdin.write(`position fen ${fen}\ngo depth ${depth}\n`);
  });
const c = new Chess();
const cps: number[] = [await ev(c.fen())];
for (const m of moves) {
  c.move(m);
  cps.push(c.isCheckmate() ? (c.turn() === 'w' ? -10000 : 10000) : await ev(c.fen()));
}
// alte Formel
const wc = (cp: number) => 1 / (1 + Math.exp(-0.368 * Math.max(-10, Math.min(10, cp / 100))));
const old = { w: [0, 0], b: [0, 0] };
for (let i = 0; i < moves.length; i++) {
  const w = i % 2 === 0;
  const drop = Math.max(0, w ? wc(cps[i]) - wc(cps[i + 1]) : wc(cps[i + 1]) - wc(cps[i]));
  const s = w ? old.w : old.b;
  s[0] += Math.max(0, 100 - drop * 250);
  s[1]++;
}
console.log('alt: Weiß', (old.w[0] / old.w[1]).toFixed(0), 'Schwarz', (old.b[0] / old.b[1]).toFixed(0));
const acc = gameAccuracy(cps);
console.log('neu: Weiß', acc.white.toFixed(0), 'Schwarz', acc.black.toFixed(0));
sf.kill();
process.exit(0);
