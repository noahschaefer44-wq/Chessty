import { useEffect, useMemo, useState } from 'react';
import { getProgress, update } from '../lib/progress';
import { GLOSSARY, type GlossaryCat } from '../content/glossary';
import { glossaryFen } from '../content/glossaryFen';
import MiniBoard from '../components/MiniBoard';
import { lessonById } from '../content';

const CATS: GlossaryCat[] = ['Regeln & Grundbegriffe', 'Taktik', 'Mattbilder', 'Bauernstruktur', 'Strategie', 'Eröffnung', 'Endspiel'];

/** Das Fachbegriffe-Heft: alle Begriffe mit knapper Erklärung und Diagramm. */
export default function Glossary({ id }: { id?: string }) {
  const [q, setQ] = useState('');
  useEffect(() => {
    if (!getProgress().trainerBest.glossar) update((p) => ({ ...p, trainerBest: { ...p.trainerBest, glossar: 1 } }));
  }, []);
  const [cat, setCat] = useState<GlossaryCat | ''>('');
  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return GLOSSARY.filter((g) => (!cat || g.cat === cat) && (!s || (g.term + ' ' + g.text).toLowerCase().includes(s))).sort((a, b) =>
      a.term.localeCompare(b.term, 'de'),
    );
  }, [q, cat]);

  if (id) {
    const g = GLOSSARY.find((x) => x.id === id);
    if (!g) return <p>Begriff nicht gefunden.</p>;
    const fen = glossaryFen(g);
    const lesson = g.lesson ? lessonById(g.lesson) : undefined;
    return (
      <>
        <a className="back" href="#/begriffe">← Fachbegriffe</a>
        <div className="trainer">
          <div className="board-col">
            <div className="glossary-big">
              <MiniBoard fen={fen} arrows={g.arrows} highlight={g.hl} flip={g.flip} size={560} />
            </div>
          </div>
          <aside className="side">
            <div>
              <div className="kicker">{g.cat}</div>
              <h1 style={{ fontSize: 44 }}>{g.term}</h1>
            </div>
            <div className="panel"><div className="panel-body"><p style={{ fontSize: 18 }}>{g.text}</p>{g.ex && <p className="muted">Im Bild: {g.ex}</p>}</div></div>
            <div className="row">
              {lesson && <a className="btn primary" href={'#/lektion/' + lesson.id}>Lektion: {lesson.title} <span className="arrow">→</span></a>}
              <a className="btn" href={'#/editor/' + encodeURIComponent(fen)}>Auf dem Brett ausprobieren</a>
            </div>
            {!!g.see?.length && (
              <div>
                <div className="kicker">Siehe auch</div>
                <div className="row">
                  {g.see.map((s) => {
                    const t = GLOSSARY.find((x) => x.id === s);
                    return t ? <a key={s} className="tag" href={'#/begriffe/' + s} style={{ textDecoration: 'none' }}>{t.term}</a> : null;
                  })}
                </div>
              </div>
            )}
          </aside>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="page-head">
        <div className="kicker">Das Heft · {GLOSSARY.length} Begriffe</div>
        <h1>Fachbegriffe</h1>
        <p className="muted">Von „Abzug“ bis „Zugzwang“ – jeder Begriff kurz erklärt und mit einem Diagramm.</p>
        <input type="search" placeholder="Begriff suchen …" value={q} onChange={(e) => setQ(e.target.value)} style={{ maxWidth: 480 }} />
        <div className="seg" style={{ marginTop: 12 }}>
          <button className={!cat ? 'on' : ''} onClick={() => setCat('')}>Alle</button>
          {CATS.map((c) => (
            <button key={c} className={cat === c ? 'on' : ''} onClick={() => setCat(c)}>{c}</button>
          ))}
        </div>
      </div>
      <div className="grid glossary-grid">
        {list.map((g) => (
          <a key={g.id} className="card glossary-card" href={'#/begriffe/' + g.id}>
            <MiniBoard fen={glossaryFen(g)} arrows={g.arrows} highlight={g.hl} flip={g.flip} size={200} />
            <div className="kicker" style={{ marginTop: 12 }}>{g.cat}</div>
            <h3>{g.term}</h3>
            <p className="muted" style={{ fontSize: 14, margin: 0 }}>{g.text}</p>
          </a>
        ))}
      </div>
      {!list.length && <p className="muted">Kein Begriff gefunden.</p>}
    </>
  );
}
