import { LESSON_META as lessons } from '../content/meta';
import { PRACTICE } from '../content/practice';
import { LEVELS } from '../content/types';
import { useProgress } from '../lib/progress';
import Path from '../components/Path';

export default function Endgames() {
  const p = useProgress();
  const ls = lessons.filter((l) => l.category === 'endspiele');
  return (
    <>
      <div className="page-head">
        <div className="kicker">Technik, die jeder braucht</div>
        <h1>Endspiele</h1>
        <p className="muted">
          Lerne die Theorie in den Lektionen, dann beweise sie in der Praxis gegen perfekte Verteidigung
          (Lichess-Endspieldatenbank; offline übernimmt Stockfish).
        </p>
      </div>
      <div className="path-head"><h2 style={{ margin: 0 }}>Praxis gegen die Datenbank</h2></div>
      <div className="grid">
        {PRACTICE.map((x) => (
          <a key={x.id} className="card" href={'#/endspiele/praxis/' + x.id}>
            <div className="kicker">{LEVELS[x.level]} · {x.goal === 'mate' ? 'Mattsetzen' : x.goal === 'promote' ? 'Umwandeln' : 'Remis halten'}</div>
            <h3>{x.title}</h3>
            <p className="muted" style={{ fontSize: 14 }}>{x.text.short}</p>
            {p.lessons['practice:' + x.id]?.done && <span className="tag solid">geschafft</span>}
          </a>
        ))}
      </div>
      <div className="path-head" style={{ marginTop: 40 }}><h2 style={{ margin: 0 }}>Lektionen</h2></div>
      <Path lessons={ls} />
    </>
  );
}
