import { useEffect, useState } from 'react';
import { recordTrainer, useProgress, addXp } from '../../lib/progress';
import { confetti } from '../../lib/confetti';

/** Abschlussbildschirm für alle Trainer. */
export function TrainerDone({ id, score, max, unit = 'Punkte', onAgain }: { id: string; score: number; max?: number; unit?: string; onAgain: () => void }) {
  const p = useProgress();
  const best = p.trainerBest[id] ?? 0;
  const [record] = useState(score > best);
  useEffect(() => {
    recordTrainer(id, score);
    addXp(Math.min(20, Math.max(2, Math.round(score / (max ? max / 10 : 2)))));
    if (score > best && score > 0) confetti(50);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div className="finish">
      <div className="stamp">{score}{max ? `/${max}` : ''}</div>
      <h2>{unit}{record && score > 0 ? ' – neuer Rekord!' : ''}</h2>
      <p className="muted">Bisheriger Bestwert: {best}</p>
      <div className="row" style={{ justifyContent: 'center' }}>
        <button className="btn primary" onClick={onAgain}>Nochmal <span className="arrow">→</span></button>
        <a className="btn" href="#/training">Alle Trainer</a>
      </div>
    </div>
  );
}

/** Countdown in Sekunden; ruft onEnd auf. */
export function useCountdown(seconds: number, running: boolean, onEnd: () => void) {
  const [left, setLeft] = useState(seconds);
  useEffect(() => {
    if (!running) return;
    setLeft(seconds);
    const t0 = Date.now();
    const iv = setInterval(() => {
      const l = seconds - Math.floor((Date.now() - t0) / 1000);
      setLeft(Math.max(0, l));
      if (l <= 0) {
        clearInterval(iv);
        onEnd();
      }
    }, 200);
    return () => clearInterval(iv);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);
  return left;
}

export function Head({ kicker, title, children }: { kicker: string; title: string; children?: React.ReactNode }) {
  return (
    <div>
      <a className="back" href="#/training">← Trainer</a>
      <div className="kicker">{kicker}</div>
      <h2>{title}</h2>
      {children}
    </div>
  );
}

export const FILES = 'abcdefgh';
export const randomSquare = () => FILES[Math.floor(Math.random() * 8)] + (1 + Math.floor(Math.random() * 8));
export const isLight = (sq: string) => (sq.charCodeAt(0) - 96 + +sq[1]) % 2 === 1;
