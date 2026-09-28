import { useEffect, useState } from 'react';
import { Chess } from 'chess.js';
import PuzzleBoard from '../components/PuzzleBoard';
import { loadDb, MAX_PER_ROUND, type Puzzle } from '../lib/puzzles';
import { update } from '../lib/progress';
import { LEVELS, type Level } from '../content/types';
import { confetti } from '../lib/confetti';

// Adaptiver Einstufungstest: 10 Puzzles, Schwierigkeit passt sich an.
const TARGETS = [900, 1100, 1300, 1500, 1700, 1900, 2100, 2300];

export default function Placement() {
  const [pool, setPool] = useState<Puzzle[]>([]);
  const [step, setStep] = useState(0);
  const [tier, setTier] = useState(2);
  const [cur, setCur] = useState<Puzzle | null>(null);
  const [answered, setAnswered] = useState<boolean | null>(null);
  const [history, setHistory] = useState<{ r: number; ok: boolean }[]>([]);
  const [result, setResult] = useState<{ rating: number; level: Level } | null>(null);

  useEffect(() => {
    loadDb().then((db) => setPool(db.puzzles.map((p) => ({ id: p[0], fen: p[1], moves: p[2].split(' '), rating: p[3], themes: p[4] }))));
  }, []);

  useEffect(() => {
    if (!pool.length || result) return;
    const target = TARGETS[tier];
    const cands = pool.filter((p) => Math.abs(p.rating - target) < 80 && p.moves.length <= 6 && !history.some((h) => h.r === p.rating));
    setCur(cands[Math.floor(Math.random() * cands.length)] ?? pool[0]);
    setAnswered(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pool, step]);

  function onResult(ok: boolean) {
    setAnswered(ok);
    setHistory((h) => [...h, { r: cur!.rating, ok }]);
  }

  function next() {
    const ok = answered;
    const nt = Math.max(0, Math.min(TARGETS.length - 1, tier + (ok ? 1 : -1)));
    if (step + 1 >= MAX_PER_ROUND) {
      // Schätzung: Mittel der schwersten gelösten und leichtesten verfehlten Aufgabe
      const solved = history.filter((h) => h.ok).map((h) => h.r);
      const failed = history.filter((h) => !h.ok).map((h) => h.r);
      const hi = solved.length ? Math.max(...solved) : 700;
      const lo = failed.length ? Math.min(...failed) : hi + 300;
      const rating = Math.round((hi + Math.min(lo, hi + 300)) / 2 / 10) * 10;
      const level = (rating < 1100 ? 1 : rating < 1500 ? 2 : rating < 1900 ? 3 : 4) as Level;
      setResult({ rating, level });
      update((p) => ({ ...p, placementDone: true, placementLevel: level, puzzleRating: rating }));
      confetti();
      return;
    }
    setTier(nt);
    setStep(step + 1);
  }

  if (result)
    return (
      <div className="finish">
        <div className="stamp">≈ {result.rating}</div>
        <h2>Deine Einstufung: {LEVELS[result.level]}</h2>
        <p className="muted">Alle Lektionen bis zu dieser Stufe sind jetzt freigeschaltet. Deine Puzzle-Wertung startet bei {result.rating}.</p>
        <div className="row" style={{ justifyContent: 'center' }}>
          <a className="btn primary" href="#/">Zum Lernpfad <span className="arrow">→</span></a>
          <a className="btn" href="#/taktik">Taktik trainieren</a>
        </div>
      </div>
    );
  if (!cur) return <p className="mono"><span className="spinner" /> Lade Einstufungstest …</p>;

  return (
    <div className="trainer">
      <div className="board-col"><PuzzleBoard puzzle={cur} onResult={onResult} /></div>
      <aside className="side">
        <div>
          <div className="kicker">Einstufungstest · Aufgabe {step + 1}/{MAX_PER_ROUND}</div>
          <h2>{new Chess(cur.fen).turn() === 'w' ? 'Schwarz' : 'Weiß'} am Zug</h2>
          <div className="steps-dots">{Array.from({ length: MAX_PER_ROUND }, (_, k) => <i key={k} className={k < step ? 'on' : ''} />)}</div>
        </div>
        <p className="muted">Finde den besten Zug. Die Aufgaben werden schwerer, wenn du richtig liegst, und leichter, wenn nicht. Ein Versuch pro Aufgabe.</p>
        {answered !== null && <div className={'feedback ' + (answered ? 'good' : 'bad')}>{answered ? '✓ Richtig!' : '✕ Nicht ganz – der schwarze Pfeil zeigt die Lösung.'}</div>}
        <div className="row">
          <span className="spacer" />
          {answered !== null && <button className="btn primary" onClick={next}>{step + 1 < MAX_PER_ROUND ? 'Weiter' : 'Ergebnis'} <span className="arrow">→</span></button>}
          {answered === null && <button className="btn small ghost" onClick={() => onResult(false)}>Weiß ich nicht</button>}
        </div>
      </aside>
    </div>
  );
}
