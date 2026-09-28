import { useState } from 'react';
import { Chess } from 'chess.js';
import MiniBoard from '../../components/MiniBoard';
import { Head, TrainerDone } from './common';
import { randomPositions, hangingPieces, type Pos } from '../../lib/trainerData';
import { sound } from '../../lib/sound';

const ROUNDS = 8;

/** „Zähl die Angreifer“: alle hängenden Figuren (beider Farben) antippen. */
export default function Hanging() {
  const [list, setList] = useState<Pos[]>([]);
  const [i, setI] = useState(-1);
  const [picks, setPicks] = useState<string[]>([]);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  async function start() {
    setList(await randomPositions(ROUNDS, (p) => hangingPieces(p.fen).length >= 1 && hangingPieces(p.fen).length <= 4, 800, 2000));
    setI(0);
    setPicks([]);
    setChecked(false);
    setScore(0);
    setDone(false);
  }
  if (done) return <TrainerDone id="haengend" score={score} max={ROUNDS} unit="Stellungen fehlerfrei" onAgain={start} />;
  const pos = list[i];
  const truth = pos ? hangingPieces(pos.fen) : [];
  const c = pos ? new Chess(pos.fen) : null;

  const toggle = (sq: string) => {
    if (!pos || checked || !c?.get(sq as never)) return;
    setPicks((p) => (p.includes(sq) ? p.filter((x) => x !== sq) : [...p, sq]));
  };
  const check = () => {
    const ok = truth.length === picks.length && truth.every((t) => picks.includes(t));
    setChecked(true);
    if (ok) {
      setScore((s) => s + 1);
      sound.good();
    } else sound.bad();
  };
  const marks = checked
    ? [...truth.map((sq) => ({ sq, kind: (picks.includes(sq) ? 'good' : 'bad') as 'good' | 'bad' })), ...picks.filter((p) => !truth.includes(p)).map((sq) => ({ sq, kind: 'bad' as const }))]
    : picks.map((sq) => ({ sq, kind: 'pick' as const }));

  return (
    <div className="trainer">
      <div className="board-col">
        <div className="trainer-board">
          {pos ? <MiniBoard fen={pos.fen} size={640} onSquare={toggle} marks={marks} flip={c?.turn() === 'b'} coords /> : <MiniBoard fen="8/8/8/8/8/8/8/8 w - - 0 1" size={640} />}
        </div>
      </div>
      <aside className="side">
        <Head kicker="Trainer · Hängende Figuren" title="Was hängt hier?">
          <p className="muted">Tippe alle Figuren an – egal welcher Farbe –, die angegriffen und nicht ausreichend gedeckt sind (ungedeckt oder von einer billigeren Figur angegriffen).</p>
        </Head>
        {i < 0 ? (
          <button className="btn primary" style={{ alignSelf: 'flex-start' }} onClick={start}>Start <span className="arrow">→</span></button>
        ) : (
          <>
            <p className="mono">Stellung {i + 1}/{ROUNDS} · {score} fehlerfrei · {c?.turn() === 'w' ? 'Weiß' : 'Schwarz'} am Zug</p>
            {checked && (
              <div className={'feedback ' + (truth.length === picks.length && truth.every((t) => picks.includes(t)) ? 'good' : 'bad')}>
                Hängend: {truth.join(', ')}. ✓ = gefunden, ✕ = übersehen oder falsch.
              </div>
            )}
            <div className="row">
              {!checked ? (
                <button className="btn primary" onClick={check}>Prüfen ({picks.length} gewählt)</button>
              ) : (
                <button className="btn primary" onClick={() => (i + 1 < ROUNDS ? (setI(i + 1), setPicks([]), setChecked(false)) : setDone(true))}>
                  {i + 1 < ROUNDS ? 'Weiter' : 'Auswertung'} <span className="arrow">→</span>
                </button>
              )}
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
