import { useState } from 'react';
import { Chess } from 'chess.js';
import MiniBoard from '../../components/MiniBoard';
import { Head, TrainerDone } from './common';
import { randomPositions, type Pos } from '../../lib/trainerData';
import { uciToSan, sanDe, parseUci } from '../../lib/chess';
import { sound } from '../../lib/sound';

const ROUNDS = 8;

/** Rechentraining: Züge im Kopf ausführen, dann den nächsten Zug auf dem „alten“ Brett angeben. */
export default function Calc() {
  const [depth, setDepth] = useState(2);
  const [list, setList] = useState<Pos[]>([]);
  const [i, setI] = useState(-1);
  const [from, setFrom] = useState<string | null>(null);
  const [answer, setAnswer] = useState<{ ok: boolean; uci: string } | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  async function start() {
    setList(await randomPositions(ROUNDS, (p) => p.line.length >= depth + 1, 1000, 2200));
    setI(0);
    setScore(0);
    setDone(false);
    setAnswer(null);
    setFrom(null);
  }
  if (done) return <TrainerDone id={'rechnen-' + depth} score={score} max={ROUNDS} unit={`richtig bei ${depth} Halbzügen Vorausrechnen`} onAgain={start} />;

  const pos = list[i];
  // Die vorzustellende Zugfolge in deutscher Notation
  const shown: string[] = [];
  let after = pos?.fen ?? '';
  if (pos) {
    const c = new Chess(pos.fen);
    for (const u of pos.line.slice(0, depth)) {
      shown.push(sanDe(uciToSan(c.fen(), u)));
      c.move(parseUci(u));
    }
    after = c.fen();
  }
  const target = pos?.line[depth];
  const flip = pos ? new Chess(pos.fen).turn() === 'b' : false;

  const click = (sq: string) => {
    if (!pos || answer) return;
    if (!from) {
      setFrom(sq);
      return;
    }
    const uci = from + sq;
    const ok = !!target && uci === target.slice(0, 4);
    setAnswer({ ok, uci });
    setFrom(null);
    if (ok) {
      setScore((s) => s + 1);
      sound.good();
    } else sound.bad();
  };

  return (
    <div className="trainer">
      <div className="board-col">
        <div className="trainer-board">
          <MiniBoard fen={answer ? after : pos?.fen ?? '8/8/8/8/8/8/8/8 w - - 0 1'} size={640} onSquare={click} flip={flip} coords
            arrows={answer && target ? [target.slice(0, 4), ...(answer.ok ? [] : ['!' + answer.uci])] : []}
            marks={from ? [{ sq: from, kind: 'pick' }] : []} />
        </div>
      </div>
      <aside className="side">
        <Head kicker="Trainer · Rechnen" title="Im Kopf weiterspielen">
          <p className="muted">Die Züge unten werden NICHT auf dem Brett ausgeführt. Stell sie dir vor und gib dann den besten nächsten Zug an: erst Startfeld, dann Zielfeld antippen.</p>
        </Head>
        <div className="row">
          <span>Tiefe:</span>
          <div className="seg">
            {[2, 4].map((n) => <button key={n} className={depth === n ? 'on' : ''} onClick={() => { setDepth(n); setI(-1); }}>{n} Halbzüge</button>)}
          </div>
        </div>
        {i < 0 ? (
          <button className="btn primary" style={{ alignSelf: 'flex-start' }} onClick={start}>Start <span className="arrow">→</span></button>
        ) : pos && (
          <>
            <div className="panel">
              <div className="panel-head"><b>Aufgabe {i + 1}/{ROUNDS}</b><span className="spacer" /><span className="mono">{score} richtig</span></div>
              <div className="panel-body">
                <p>Stell dir vor, es geschieht:</p>
                <p className="mono" style={{ fontSize: 20 }}>{shown.join('  ')}</p>
                <p><b>Welcher Zug folgt jetzt für {new Chess(after).turn() === 'w' ? 'Weiß' : 'Schwarz'}?</b></p>
              </div>
            </div>
            {answer && (
              <div className={'feedback ' + (answer.ok ? 'good' : 'bad')}>
                {answer.ok ? '✓ Genau gerechnet!' : `✕ Richtig war ${sanDe(uciToSan(after, target!))}.`} Das Brett zeigt jetzt die Stellung nach den Zügen.
              </div>
            )}
            {answer && (
              <button className="btn primary" style={{ alignSelf: 'flex-start' }} onClick={() => (i + 1 < ROUNDS ? (setI(i + 1), setAnswer(null)) : setDone(true))}>
                {i + 1 < ROUNDS ? 'Weiter' : 'Auswertung'} <span className="arrow">→</span>
              </button>
            )}
          </>
        )}
      </aside>
    </div>
  );
}
