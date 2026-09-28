// Prüft alle Lerninhalte: legale Züge, und mit Stockfish, ob Lösungen wirklich gut und Fehler wirklich schlecht sind.
import { Chess } from 'chess.js';
import { spawn } from 'child_process';
import { lessons, masters } from '../src/content/index';
import { walkLesson, stripSan } from '../src/content/walk';
import { PRACTICE } from '../src/content/practice';

const only = process.argv[2];
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
function evalFen(fen: string, depth = 16): Promise<{ score: number; best: string }> {
  return new Promise((r) => {
    res = (out) => {
      const m = [...out.matchAll(/score (cp|mate) (-?\d+)/g)].pop();
      let score = 0;
      if (m) score = m[1] === 'mate' ? (+m[2] > 0 ? 10000 - +m[2] : -10000 - +m[2]) : +m[2];
      if (out.includes('bestmove (none)')) score = new Chess(fen).isCheckmate() ? -100000 : 0;
      r({ score, best: /bestmove (\S+)/.exec(out)![1] });
    };
    if (process.env.DEBUG) process.stderr.write('eval ' + fen + '\n');
    sf.stdin.write(`position fen ${fen}\ngo depth ${depth}\n`);
  });
}
// Bewertung aus Sicht der Seite, die in fen gezogen hat
async function scoreAfter(fen: string, san: string) {
  const c = new Chess(fen);
  c.move(san);
  if (c.isCheckmate()) return 100000;
  if (c.isStalemate() || c.isDraw()) return 0;
  return -(await evalFen(c.fen())).score;
}

let problems = 0;
const warn = (s: string) => {
  problems++;
  console.log('⚠ ' + s);
};

for (const l of lessons) {
  if (only && !l.id.includes(only)) continue;
  let pos;
  try {
    pos = walkLesson(l);
  } catch (e) {
    warn(String(e));
    continue;
  }
  for (const [i, s] of l.steps.entries()) {
    // Stellung legal? Die Seite, die nicht am Zug ist, darf nicht im Schach stehen
    const f = pos[i].shown.split(' ');
    f[1] = f[1] === 'w' ? 'b' : 'w';
    f[3] = '-';
    try {
      if (new Chess(f.join(' ')).inCheck()) warn(`${l.id} #${i + 1}: illegale Stellung (König kann geschlagen werden)`);
    } catch (e) {
      warn(`${l.id} #${i + 1}: ${e}`);
    }
    if (s.kind !== 'move') continue;
    const fen = pos[i].shown;
    const tag = `${l.id} #${i + 1}`;
    const best = await evalFen(fen);
    for (const sol of s.solution) {
      try {
        new Chess(fen).move(sol);
      } catch {
        warn(`${tag}: Lösung ${sol} illegal`);
        continue;
      }
      const sc = await scoreAfter(fen, sol);
      const loss = Math.min(best.score, 3000) - Math.min(sc, 3000);
      const bestSan = new Chess(fen).move({ from: best.best.slice(0, 2), to: best.best.slice(2, 4), promotion: best.best[4] })?.san;
      if (loss > 80 && !(sc > 900)) warn(`${tag}: Lösung ${sol} = ${sc}, Engine-Bestzug ${bestSan} = ${best.score}`);
    }
    if (s.reply) {
      const c = new Chess(fen);
      c.move(s.solution[0]);
      try { c.move(s.reply); } catch { warn(`${tag}: Antwort ${s.reply} illegal`); }
    }
    const solSc = await scoreAfter(fen, s.solution[0]);
    for (const m of s.mistakes ?? []) {
      try {
        new Chess(fen).move(m.san);
      } catch {
        warn(`${tag}: Fehlerzug ${m.san} illegal`);
        continue;
      }
      if (s.solution.map(stripSan).includes(stripSan(m.san))) warn(`${tag}: Fehlerzug ${m.san} ist auch Lösung`);
      const sc = await scoreAfter(fen, m.san);
      if (!m.soft && Math.min(solSc, 3000) - Math.min(sc, 3000) < 60 && sc < 500) warn(`${tag}: Fehlerzug ${m.san} (${sc}) kaum schlechter als Lösung (${solSc})`);
    }
  }
  for (const d of l.drill ?? []) {
    const c = new Chess();
    try {
      d.moves.forEach((m) => c.move(m));
    } catch (e) {
      warn(`${l.id} Training ${d.name}: ${e}`);
    }
  }
  console.log(`✓ ${l.id}`);
}

for (const g of masters) {
  if (only && !g.id.includes(only) && only !== 'masters') continue;
  const c = new Chess();
  try {
    g.moves.forEach((m) => c.move(m));
  } catch (e) {
    warn(`${g.id}: ${e}`);
  }
  for (const m of g.moments) {
    const heroTurn = m.ply % 2 === 0 ? 'white' : 'black';
    if (heroTurn !== g.hero) warn(`${g.id}: Moment ply ${m.ply} ist kein Zug von ${g.hero}`);
  }
  console.log(`✓ ${g.id} (${g.moves.length} Halbzüge)`);
}

for (const p of PRACTICE) {
  if (only && !p.id.includes(only)) continue;
  try {
    new Chess(p.fen);
    const r = await fetch(`https://tablebase.lichess.ovh/standard?fen=${encodeURIComponent(p.fen)}`).then((r) => r.json());
    const want = p.goal === 'draw' ? ['draw'] : ['win'];
    if (!want.includes(r.category)) warn(`Praxis ${p.id}: Datenbank sagt ${r.category}`);
    else console.log(`✓ Praxis ${p.id}: ${r.category}${r.dtm ? ' DTM ' + r.dtm : ''}`);
  } catch (e) {
    warn(`Praxis ${p.id}: ${e}`);
  }
}

console.log(problems ? `\n${problems} Hinweise` : '\nAlles in Ordnung');
sf.kill();
process.exit(0);
