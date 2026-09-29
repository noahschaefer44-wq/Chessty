// Hilfsskript: zeigt Puzzle-Kandidaten lesbar an (Stellung nach dem Gegnerzug + Lösung in SAN)
import { Chess } from 'chess.js';
import fs from 'fs';
const lines = fs.readFileSync(process.argv[2], 'utf8').split('\n');
for (const l of lines) {
  if (!l.startsWith('{')) { console.log(l); continue; }
  const p = JSON.parse(l);
  const c = new Chess(p.fen);
  const mv = p.moves.split(' ');
  const first = c.move({ from: mv[0].slice(0, 2), to: mv[0].slice(2, 4), promotion: mv[0][4] });
  const fen = c.fen();
  const sans = mv.slice(1).map((u: string) => c.move({ from: u.slice(0, 2), to: u.slice(2, 4), promotion: u[4] }).san);
  console.log(`${p.id} r${p.rating} [${p.themes}] Gegner: ${first.san}  → ${fen.split(' ')[1] === 'w' ? 'Weiß' : 'Schwarz'}: ${sans.join(' ')}`);
  console.log('   FEN ' + fen);
  console.log(new Chess(fen).ascii().split('\n').map((x) => '   ' + x).join('\n'));
}
