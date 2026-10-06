import { LESSON_META as lessons } from '../content/meta';
import { PRACTICE } from '../content/practice';
import { LEVELS } from '../content/types';
import { useProgress } from '../lib/progress';
import { Bar } from '../components/Widgets';
import Path from '../components/Path';

/** Endspiel-Kurs in Stufen: erst die Lektion, dann der Beweis gegen perfekte Verteidigung. */
const COURSE: { name: string; text: string; lessons: string[]; practice: string[] }[] = [
  {
    name: 'Stufe 1 · Grundmatts',
    text: 'Ohne diese Technik verschenkst du gewonnene Partien. Ziel: Matt mit Dame und mit Turm in unter 20 Zügen.',
    lessons: ['e-dame-matt', 'e-turm-matt'],
    practice: ['kq-k', 'kr-k'],
  },
  {
    name: 'Stufe 2 · Bauernendspiele',
    text: 'Quadratregel, Opposition, Schlüsselfelder – die Grundlage für jedes Endspiel.',
    lessons: ['e-quadrat', 'e-opposition', 'e-koenig-vor-bauer', 'e-reti'],
    practice: ['kp-k-opp', 'kpk-abstand', 'kp-k-draw', 'kpk-def2'],
  },
  {
    name: 'Stufe 3 · Turmendspiele',
    text: 'Die häufigsten Endspiele überhaupt. Lucena gewinnt, Philidor und Vancura halten Remis.',
    lessons: ['e-turm-bauer', 'e-lucena', 'e-philidor', 'e-vancura'],
    practice: ['lucena', 'philidor', 'vancura'],
  },
  {
    name: 'Stufe 4 · Meisterklasse',
    text: 'Läuferendspiele, Rettungsanker und die schwersten Grundmatts.',
    lessons: ['e-falscher-laeufer', 'e-ungleiche-laeufer'],
    practice: ['falscher-laeufer', 'kbb-k', 'kq-kp7', 'kbn-k', 'kq-kr'],
  },
];

const GOAL = { mate: 'Mattsetzen', promote: 'Umwandeln', draw: 'Remis halten' } as const;

export default function Endgames() {
  const p = useProgress();
  const ls = lessons.filter((l) => l.category === 'endspiele');
  const inCourse = new Set(COURSE.flatMap((c) => c.lessons));
  const extra = ls.filter((l) => !inCourse.has(l.id));
  const stageDone = COURSE.map((c) => {
    const parts = [...c.lessons.map((id) => !!p.lessons[id]?.done), ...c.practice.map((id) => !!p.lessons['practice:' + id]?.done)];
    return { n: parts.filter(Boolean).length, of: parts.length };
  });
  return (
    <>
      <div className="page-head">
        <div className="kicker">Technik, die jeder braucht</div>
        <h1>Endspiel-Kurs</h1>
        <p className="muted">
          Vier Stufen vom Grundmatt bis Dame gegen Turm. In jeder Stufe lernst du die Theorie in Lektionen und beweist sie dann in der
          Praxis gegen perfekte Verteidigung (Lichess-Endspieldatenbank; offline übernimmt Stockfish).
        </p>
      </div>
      {COURSE.map((c, k) => {
        const st = stageDone[k];
        const prevOpen = k > 0 && stageDone[k - 1].n < stageDone[k - 1].of;
        return (
          <section key={c.name} style={{ marginTop: 34 }}>
            <div className="path-head">
              <h2 style={{ margin: 0 }}>{c.name}</h2>
              <span className="mono muted" style={{ fontSize: 13 }}>{st.n}/{st.of}{st.n === st.of ? ' · abgeschlossen ✓' : ''}</span>
            </div>
            <Bar value={st.n} max={st.of} />
            <p className="muted">{c.text}{prevOpen ? ' Tipp: Schließe zuerst die vorige Stufe ab.' : ''}</p>
            <Path lessons={c.lessons.map((id) => ls.find((l) => l.id === id)).filter((l): l is (typeof ls)[number] => !!l)} />
            <div className="grid">
              {c.practice.map((id) => PRACTICE.find((x) => x.id === id)).filter((x) => !!x).map((x) => (
                <a key={x!.id} className="card" href={'#/endspiele/praxis/' + x!.id}>
                  <div className="kicker">{LEVELS[x!.level]} · {GOAL[x!.goal]}</div>
                  <h3>{x!.title}</h3>
                  <p className="muted" style={{ fontSize: 14 }}>{x!.text.short}</p>
                  {p.lessons['practice:' + x!.id]?.done && <span className="tag solid">geschafft</span>}
                </a>
              ))}
            </div>
          </section>
        );
      })}
      {extra.length > 0 && (
        <section style={{ marginTop: 40 }}>
          <div className="path-head"><h2 style={{ margin: 0 }}>Weitere Lektionen</h2></div>
          <Path lessons={extra} />
        </section>
      )}
    </>
  );
}
