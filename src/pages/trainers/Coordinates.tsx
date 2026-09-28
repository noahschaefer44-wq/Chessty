import { useState } from 'react';
import MiniBoard from '../../components/MiniBoard';
import { Head, TrainerDone, randomSquare, useCountdown } from './common';
import { sound } from '../../lib/sound';

/** Koordinaten-Trainer: Feld anklicken, dessen Namen du siehst – 30 Sekunden. */
export default function Coordinates() {
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [target, setTarget] = useState(randomSquare());
  const [score, setScore] = useState(0);
  const [flip, setFlip] = useState(false);
  const [marks, setMarks] = useState<{ sq: string; kind: 'good' | 'bad' }[]>([]);
  const left = useCountdown(30, running, () => { setRunning(false); setDone(true); });

  if (done) return <TrainerDone id="koordinaten" score={score} unit="Felder in 30 Sekunden" onAgain={() => { setDone(false); setScore(0); setRunning(true); }} />;

  const click = (sq: string) => {
    if (!running) return;
    const ok = sq === target;
    setMarks([{ sq, kind: ok ? 'good' : 'bad' }]);
    if (ok) {
      setScore((s) => s + 1);
      sound.move();
    } else sound.bad();
    let n = randomSquare();
    while (n === target) n = randomSquare();
    setTarget(n);
  };

  return (
    <div className="trainer">
      <div className="board-col">
        <div className="trainer-board"><MiniBoard fen="8/8/8/8/8/8/8/8 w - - 0 1" size={640} onSquare={click} marks={marks} flip={flip} /></div>
      </div>
      <aside className="side">
        <Head kicker="Trainer · Koordinaten" title="Finde das Feld">
          <p className="muted">Tippe so schnell wie möglich auf das angezeigte Feld. Wer Koordinaten blind kennt, liest und rechnet Varianten viel leichter.</p>
        </Head>
        {running ? (
          <>
            <div className="big-question" key={target}>{target}</div>
            <p className="mono">Zeit: {left}s · Treffer: {score}</p>
          </>
        ) : (
          <div className="row">
            <button className="btn primary" onClick={() => setRunning(true)}>Start <span className="arrow">→</span></button>
            <button className="btn" onClick={() => setFlip((f) => !f)}>Als {flip ? 'Weiß' : 'Schwarz'} üben</button>
          </div>
        )}
      </aside>
    </div>
  );
}
