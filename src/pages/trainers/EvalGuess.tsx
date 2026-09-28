import { useState } from 'react';
import { Chess } from 'chess.js';
import MiniBoard from '../../components/MiniBoard';
import { Head, TrainerDone } from './common';
import { randomPositions, type Pos } from '../../lib/trainerData';
import { engine, formatEval, evalNumber, type EngineLine } from '../../lib/engine';
import { sound } from '../../lib/sound';

const ROUNDS = 8;
const OPTS = [
  { k: 2, t: 'Weiß gewinnt' },
  { k: 1, t: 'Weiß besser' },
  { k: 0, t: 'Ausgeglichen' },
  { k: -1, t: 'Schwarz besser' },
  { k: -2, t: 'Schwarz gewinnt' },
];
const bucket = (l: EngineLine) => {
  const v = evalNumber(l);
  return v >= 3 ? 2 : v >= 0.8 ? 1 : v > -0.8 ? 0 : v > -3 ? -1 : -2;
};

/** Stellungsbewertung schätzen – und mit Stockfish vergleichen. */
export default function EvalGuess() {
  const [list, setList] = useState<Pos[]>([]);
  const [i, setI] = useState(-1);
  const [res, setRes] = useState<{ guess: number; line: EngineLine } | null>(null);
  const [loading, setLoading] = useState(false);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  async function start() {
    // Stellung VOR dem Gegnerzug: dort ist der Vorteil oft noch nicht offensichtlich
    setList(await randomPositions(ROUNDS, () => true, 800, 2200));
    setI(0);
    setScore(0);
    setRes(null);
    setDone(false);
  }
  if (done) return <TrainerDone id="bewertung" score={score} max={ROUNDS * 2} unit="Punkte (2 = exakt, 1 = knapp daneben)" onAgain={start} />;
  const pos = list[i];

  async function guess(k: number) {
    if (!pos || res) return;
    setLoading(true);
    const r = await engine.analyse(pos.fen, { depth: 14 });
    setLoading(false);
    const b = bucket(r.lines[0]);
    const pts = b === k ? 2 : Math.abs(b - k) === 1 ? 1 : 0;
    setScore((s) => s + pts);
    setRes({ guess: k, line: r.lines[0] });
    pts === 2 ? sound.good() : pts === 0 && sound.bad();
  }

  return (
    <div className="trainer">
      <div className="board-col">
        <div className="trainer-board">
          <MiniBoard fen={pos?.fen ?? '8/8/8/8/8/8/8/8 w - - 0 1'} size={640} coords />
        </div>
      </div>
      <aside className="side">
        <Head kicker="Trainer · Bewertung" title="Wer steht besser?">
          <p className="muted">Schau auf Material, Königssicherheit, Aktivität und Drohungen – und wer am Zug ist.</p>
        </Head>
        {i < 0 ? <button className="btn primary" style={{ alignSelf: 'flex-start' }} onClick={start}>Start <span className="arrow">→</span></button> : pos && (
          <>
            <p className="mono">Stellung {i + 1}/{ROUNDS} · {score} Punkte · {new Chess(pos.fen).turn() === 'w' ? 'Weiß' : 'Schwarz'} am Zug</p>
            <div className="stack">
              {OPTS.map((o) => (
                <button key={o.k} className={'btn' + (res && bucket(res.line) === o.k ? ' primary' : '')} onClick={() => guess(o.k)} disabled={!!res || loading}>
                  {o.t}{res?.guess === o.k ? ' ← dein Tipp' : ''}
                </button>
              ))}
            </div>
            {loading && <p className="mono"><span className="spinner" /> Engine rechnet …</p>}
            {res && <div className="feedback good">Stockfish: {formatEval(res.line)} ({OPTS.find((o) => o.k === bucket(res.line))!.t})</div>}
            {res && <button className="btn primary" style={{ alignSelf: 'flex-start' }} onClick={() => (i + 1 < ROUNDS ? (setI(i + 1), setRes(null)) : setDone(true))}>{i + 1 < ROUNDS ? 'Weiter' : 'Auswertung'} <span className="arrow">→</span></button>}
          </>
        )}
      </aside>
    </div>
  );
}
