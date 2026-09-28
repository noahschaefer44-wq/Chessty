import { useState } from 'react';
import { Head, TrainerDone, randomSquare, useCountdown, isLight } from './common';
import { sound } from '../../lib/sound';
import { useKeys } from '../../lib/useKeys';

/** Feldfarben-Trainer: Hell oder dunkel – ohne aufs Brett zu schauen. */
export default function Colors() {
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [sq, setSq] = useState(randomSquare());
  const [score, setScore] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [fb, setFb] = useState('');
  const left = useCountdown(30, running, () => { setRunning(false); setDone(true); });

  const answer = (light: boolean) => {
    if (!running) return;
    const ok = isLight(sq) === light;
    setFb(ok ? '✓' : `✕ ${sq} ist ${isLight(sq) ? 'hell' : 'dunkel'}`);
    ok ? (setScore((s) => s + 1), sound.move()) : (setWrong((w) => w + 1), sound.bad());
    setSq(randomSquare());
  };
  useKeys({ ArrowLeft: () => answer(true), ArrowRight: () => answer(false) });

  if (done) return <TrainerDone id="feldfarben" score={Math.max(0, score - wrong)} unit={`Punkte (${score} richtig, ${wrong} falsch)`} onAgain={() => { setDone(false); setScore(0); setWrong(0); setRunning(true); }} />;

  return (
    <div className="stack" style={{ maxWidth: 640, margin: '0 auto' }}>
      <Head kicker="Trainer · Feldfarben" title="Hell oder dunkel?">
        <p className="muted">Trick: a1 ist dunkel. Ist die Summe aus Linie (a=1 … h=8) und Reihe gerade, ist das Feld dunkel. Tastatur: ← hell, → dunkel.</p>
      </Head>
      {running ? (
        <>
          <div className="big-question" key={sq + score + wrong}>{sq}</div>
          <div className="choice-row">
            <button className="btn" onClick={() => answer(true)}>□ Hell</button>
            <button className="btn primary" onClick={() => answer(false)}>■ Dunkel</button>
          </div>
          <p className="mono">Zeit: {left}s · richtig {score} · falsch {wrong} {fb && `· ${fb}`}</p>
        </>
      ) : (
        <button className="btn primary" style={{ alignSelf: 'flex-start' }} onClick={() => setRunning(true)}>Start <span className="arrow">→</span></button>
      )}
    </div>
  );
}
