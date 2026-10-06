import { useMemo, useState } from 'react';
import ScenarioPlay from '../components/ScenarioPlay';
import { practiceById } from '../content/practice';
import { completeLesson } from '../lib/progress';
import { mirrorFen, mirrorText } from '../lib/transform';

/** Endspiel-Praxis gegen perfekte Verteidigung (Datenbank) bzw. Stockfish – auch gespiegelt. */
export default function EndgamePractice({ id }: { id: string }) {
  const pr = practiceById(id);
  // 0 = Original, 1 = andere Brettseite, 2 = vertauschte Farben
  const [variant, setVariant] = useState(0);
  const sc = useMemo(() => {
    if (!pr || variant === 0) return pr;
    const how = variant === 1 ? 'files' : 'colors';
    return {
      ...pr,
      fen: mirrorFen(pr.fen, how),
      title: pr.title + (variant === 1 ? ' (gespiegelt)' : ' (Farben getauscht)'),
      text: { short: mirrorText(pr.text.short, how), why: pr.text.why && mirrorText(pr.text.why, how), pro: pr.text.pro && mirrorText(pr.text.pro, how) },
    };
  }, [pr, variant]);
  if (!pr || !sc) return <p>Übung nicht gefunden.</p>;
  return (
    <>
      <a className="back" href="#/endspiele">← Endspiel-Kurs</a>
      <div className="seg" style={{ marginBottom: 14 }} role="group" aria-label="Stellung">
        {['Original', 'Andere Brettseite', 'Farben getauscht'].map((l, k) => (
          <button key={l} className={variant === k ? 'on' : ''} onClick={() => setVariant(k)}>{l}</button>
        ))}
      </div>
      <ScenarioPlay
        key={pr.id + variant}
        sc={sc}
        onDone={(ok) => ok && completeLesson('practice:' + pr.id, 3, 20)}
      />
    </>
  );
}
