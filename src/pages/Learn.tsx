import { useState } from 'react';
import { CATEGORIES, LEVELS, type Level } from '../content/types';
import { lessons } from '../content';
import { useProgress } from '../lib/progress';
import Path from '../components/Path';

export default function Learn({ category }: { category?: string }) {
  const cat = CATEGORIES.find((c) => c.id === category) ?? CATEGORIES[0];
  const [lvl, setLvl] = useState<Level | 0>(0);
  const p = useProgress();
  const all = lessons.filter((l) => l.category === cat.id);
  const shown = all.filter((l) => !lvl || l.level === lvl);
  return (
    <>
      <a className="back" href="#/">← Übersicht</a>
      <div className="page-head">
        <div className="kicker">Lernpfad</div>
        <h1>{cat.name}</h1>
        <p className="muted">{cat.blurb}</p>
        <div className="row" style={{ marginTop: 12 }}>
          <div className="seg">
            <button className={lvl === 0 ? 'on' : ''} onClick={() => setLvl(0)}>Alle</button>
            {([1, 2, 3, 4] as Level[]).map((l) => (
              <button key={l} className={lvl === l ? 'on' : ''} onClick={() => setLvl(l)}>
                {LEVELS[l]}
              </button>
            ))}
          </div>
          <span className="mono muted" style={{ fontSize: 13 }}>
            {all.filter((l) => p.lessons[l.id]?.done).length}/{all.length} erledigt
          </span>
        </div>
      </div>
      <div className="row" style={{ marginBottom: 12 }}>
        {CATEGORIES.filter((c) => c.id !== cat.id).map((c) => (
          <a key={c.id} className="btn small ghost" href={'#/lernen/' + c.id}>
            {c.name}
          </a>
        ))}
      </div>
      {shown.length ? <Path lessons={shown} /> : <p className="muted">Für diese Stufe gibt es hier noch keine Lektion.</p>}
    </>
  );
}
