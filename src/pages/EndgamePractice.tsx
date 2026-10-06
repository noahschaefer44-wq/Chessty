import ScenarioPlay from '../components/ScenarioPlay';
import { practiceById } from '../content/practice';
import { completeLesson } from '../lib/progress';

/** Endspiel-Praxis gegen perfekte Verteidigung (Datenbank) bzw. Stockfish. */
export default function EndgamePractice({ id }: { id: string }) {
  const pr = practiceById(id);
  if (!pr) return <p>Übung nicht gefunden.</p>;
  return (
    <>
      <a className="back" href="#/endspiele">← Endspiele</a>
      <ScenarioPlay
        key={pr.id}
        sc={pr}
        onDone={(ok) => ok && completeLesson('practice:' + pr.id, 3, 20)}
      />
    </>
  );
}
