import { useEffect, useState } from 'react';
import { Chess } from 'chess.js';
import MiniBoard from '../../components/MiniBoard';
import { Head, TrainerDone } from './common';
import { loadOpenings } from '../../lib/openings';
import { sanDe, pieceName } from '../../lib/chess';
import { sound } from '../../lib/sound';

interface Q {
  moves: string[];
  question: string;
  answer: string;
  fen: string;
}

const ROUNDS = 5;

/** Blindschach: Züge nur lesen, im Kopf mitspielen, dann ein Feld nennen. */
export default function Blind() {
  const [len, setLen] = useState(6);
  const [qs, setQs] = useState<Q[]>([]);
  const [i, setI] = useState(-1);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  async function start() {
    const rows = (await loadOpenings()).filter((r) => r.moves.length >= len);
    const out: Q[] = [];
    while (out.length < ROUNDS) {
      const r = rows[Math.floor(Math.random() * rows.length)];
      const c = new Chess();
      const moves = r.moves.slice(0, len);
      if (moves.some((m) => m.startsWith('O-O'))) continue;
      const hist = moves.map((m) => c.move(m));
      // Eine Figur (kein Bauer) wählen, die gezogen hat, und ihre Reise verfolgen
      const movers = hist.filter((m) => m.piece !== 'p');
      if (!movers.length) continue;
      const pickMove = movers[Math.floor(Math.random() * movers.length)];
      let sq: string = pickMove.from;
      let origin = '';
      // Ursprungsfeld zurückverfolgen
      for (let k = hist.indexOf(pickMove); k >= 0; k--) if (hist[k].to === sq && hist[k].piece === pickMove.piece && hist[k].color === pickMove.color) sq = hist[k].from;
      origin = sq;
      // Endfeld vorwärts verfolgen
      let cur = origin;
      for (const m of hist) if (m.from === cur && m.color === pickMove.color) cur = m.to;
      if (hist.some((m) => m.to === cur && m.color !== pickMove.color && m.captured)) continue;
      const color = pickMove.color === 'w' ? 'weiße' : 'schwarze';
      out.push({
        moves,
        question: `Wo steht jetzt der ${color} ${pieceName[pickMove.piece]}, der auf ${origin} begann?`,
        answer: cur,
        fen: c.fen(),
      });
    }
    setQs(out);
    setI(0);
    setScore(0);
    setPicked(null);
    setDone(false);
  }

  useEffect(() => setI(-1), [len]);

  if (done) return <TrainerDone id={'blind-' + len} score={score} max={ROUNDS} unit={`richtig bei ${len} Halbzügen`} onAgain={start} />;

  const q = qs[i];
  const click = (sq: string) => {
    if (!q || picked) return;
    setPicked(sq);
    if (sq === q.answer) {
      setScore((s) => s + 1);
      sound.good();
    } else sound.bad();
  };

  return (
    <div className="trainer">
      <div className="board-col">
        <div className="trainer-board">
          <MiniBoard fen={picked && q ? q.fen : '8/8/8/8/8/8/8/8 w - - 0 1'} size={640} onSquare={click} coords
            marks={picked && q ? [{ sq: q.answer, kind: 'good' }, ...(picked !== q.answer ? [{ sq: picked, kind: 'bad' as const }] : [])] : []} />
        </div>
      </div>
      <aside className="side">
        <Head kicker="Trainer · Blindschach" title="Spiel im Kopf mit">
          <p className="muted">Lies die Züge ab der Grundstellung, stell sie dir vor und tippe dann auf das gesuchte Feld. Das Brett bleibt leer, bis du geantwortet hast.</p>
        </Head>
        <div className="row">
          <span>Länge:</span>
          <div className="seg">
            {[4, 6, 8, 10, 12].map((n) => <button key={n} className={len === n ? 'on' : ''} onClick={() => setLen(n)}>{n}</button>)}
          </div>
        </div>
        {i < 0 ? (
          <button className="btn primary" style={{ alignSelf: 'flex-start' }} onClick={start}>Start <span className="arrow">→</span></button>
        ) : q && (
          <>
            <div className="panel">
              <div className="panel-head"><b>Aufgabe {i + 1}/{ROUNDS}</b></div>
              <div className="panel-body">
                <p className="mono" style={{ fontSize: 17, lineHeight: 1.8 }}>
                  {q.moves.map((m, k) => (k % 2 === 0 ? `${k / 2 + 1}. ` : '') + sanDe(m)).join(' ')}
                </p>
                <p><b>{q.question}</b></p>
              </div>
            </div>
            {picked && (
              <div className={'feedback ' + (picked === q.answer ? 'good' : 'bad')}>
                {picked === q.answer ? '✓ Richtig!' : `✕ Richtig ist ${q.answer}. Das Brett zeigt jetzt die Stellung.`}
              </div>
            )}
            {picked && (
              <button className="btn primary" style={{ alignSelf: 'flex-start' }} onClick={() => (i + 1 < ROUNDS ? (setI(i + 1), setPicked(null)) : setDone(true))}>
                {i + 1 < ROUNDS ? 'Weiter' : 'Auswertung'} <span className="arrow">→</span>
              </button>
            )}
          </>
        )}
      </aside>
    </div>
  );
}
