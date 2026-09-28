import { useEffect, useState } from 'react';
import MiniBoard from '../../components/MiniBoard';
import { Head, TrainerDone } from './common';
import { GLOSSARY } from '../../content/glossary';
import { glossaryFen } from '../../content/glossaryFen';
import { PIECE_IMG } from '../../components/pieceImages';
import { sound } from '../../lib/sound';

const ROUNDS = 5;

const toMap = (fen: string) => {
  const m: Record<string, string> = {};
  fen.split(' ')[0].split('/').forEach((row, i) => {
    let f = 0;
    for (const ch of row) {
      if (/\d/.test(ch)) f += +ch;
      else m['abcdefgh'[f++] + (8 - i)] = ch;
    }
  });
  return m;
};
const toFen = (m: Record<string, string>) => {
  const rows: string[] = [];
  for (let r = 8; r >= 1; r--) {
    let row = '';
    let e = 0;
    for (const f of 'abcdefgh') {
      const p = m[f + r];
      if (p) {
        if (e) row += e;
        e = 0;
        row += p;
      } else e++;
    }
    if (e) row += e;
    rows.push(row);
  }
  return rows.join('/') + ' w - - 0 1';
};

/** Stellung aus dem Gedächtnis nachbauen. */
export default function Rebuild() {
  const [items, setItems] = useState<string[]>([]);
  const [i, setI] = useState(-1);
  const [phase, setPhase] = useState<'look' | 'build' | 'check'>('look');
  const [left, setLeft] = useState(10);
  const [tool, setTool] = useState('K');
  const [mine, setMine] = useState<Record<string, string>>({});
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  function start() {
    // Endspiel-/Übersichtsstellungen mit 4–9 Figuren aus dem Fachbegriffe-Heft
    const pool = GLOSSARY.map(glossaryFen).filter((f) => Object.keys(toMap(f)).length >= 4 && Object.keys(toMap(f)).length <= 9);
    setItems([...pool].sort(() => Math.random() - 0.5).slice(0, ROUNDS));
    setI(0);
    setScore(0);
    setDone(false);
    setPhase('look');
    setMine({});
    setLeft(10);
  }
  useEffect(() => {
    if (phase !== 'look' || i < 0) return;
    const t = setInterval(() => setLeft((l) => (l <= 1 ? (clearInterval(t), setPhase('build'), 0) : l - 1)), 1000);
    return () => clearInterval(t);
  }, [phase, i]);

  if (done) return <TrainerDone id="nachbauen" score={score} unit="Punkte (richtige minus falsche Felder)" onAgain={start} />;
  const target = items[i] ? toMap(items[i]) : {};

  const click = (sq: string) => {
    if (phase !== 'build') return;
    setMine((m) => {
      const n = { ...m };
      if (tool === 'x' || n[sq] === tool) delete n[sq];
      else n[sq] = tool;
      return n;
    });
  };
  const check = () => {
    const allSq = new Set([...Object.keys(target), ...Object.keys(mine)]);
    let pts = 0;
    for (const sq of allSq) pts += target[sq] && mine[sq] === target[sq] ? 1 : mine[sq] ? -1 : 0;
    setScore((s) => s + Math.max(0, pts));
    setPhase('check');
    pts === Object.keys(target).length ? sound.good() : sound.bad();
  };
  const marks =
    phase === 'check'
      ? [...new Set([...Object.keys(target), ...Object.keys(mine)])].map((sq) => ({ sq, kind: (target[sq] && mine[sq] === target[sq] ? 'good' : 'bad') as 'good' | 'bad' }))
      : [];

  return (
    <div className="trainer">
      <div className="board-col">
        <div className="trainer-board">
          <MiniBoard fen={phase === 'look' || phase === 'check' ? items[i] ?? '8/8/8/8/8/8/8/8 w - - 0 1' : toFen(mine)} size={640}
            onSquare={phase === 'build' ? click : undefined} marks={marks} coords />
        </div>
        {phase === 'build' && (
          <div className="palette">
            {['K', 'Q', 'R', 'B', 'N', 'P', 'k', 'q', 'r', 'b', 'n', 'p'].map((p) => (
              <button key={p} className={'palette-btn' + (tool === p ? ' on' : '')} onClick={() => setTool(p)}><img src={PIECE_IMG[p]} alt={p} /></button>
            ))}
            <button className={'palette-btn' + (tool === 'x' ? ' on' : '')} onClick={() => setTool('x')} aria-label="Löschen">✕</button>
          </div>
        )}
      </div>
      <aside className="side">
        <Head kicker="Trainer · Gedächtnis" title="Stellung nachbauen">
          <p className="muted">Präge dir die Stellung 10 Sekunden ein. Dann ist das Brett leer – stell alle Figuren wieder auf. Starke Spieler merken sich Muster, nicht einzelne Figuren.</p>
        </Head>
        {i < 0 ? <button className="btn primary" style={{ alignSelf: 'flex-start' }} onClick={start}>Start <span className="arrow">→</span></button> : (
          <>
            <p className="mono">Stellung {i + 1}/{ROUNDS} · {score} Punkte</p>
            {phase === 'look' && <div className="big-question">{left}</div>}
            {phase === 'build' && <button className="btn primary" style={{ alignSelf: 'flex-start' }} onClick={check}>Fertig – prüfen</button>}
            {phase === 'check' && (
              <button className="btn primary" style={{ alignSelf: 'flex-start' }} onClick={() => (i + 1 < ROUNDS ? (setI(i + 1), setMine({}), setPhase('look'), setLeft(10)) : setDone(true))}>
                {i + 1 < ROUNDS ? 'Nächste Stellung' : 'Auswertung'} <span className="arrow">→</span>
              </button>
            )}
          </>
        )}
      </aside>
    </div>
  );
}
