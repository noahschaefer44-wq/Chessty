import { Chess } from 'chess.js';
import { ARTICLES, type Article } from '../content/knowledge';
import MiniBoard from '../components/MiniBoard';
import { Rich, speak } from '../components/Explain';

const fenOf = (a: Article) => {
  const c = new Chess(a.fen);
  for (const m of a.moves ?? []) c.move(m);
  return c.fen();
};

/** Wissen: Schachgeschichte und Regeln in kurzen Kapiteln. */
export default function Knowledge({ id }: { id?: string }) {
  const a = ARTICLES.find((x) => x.id === id);
  if (a) {
    const i = ARTICLES.indexOf(a);
    const next = ARTICLES[i + 1];
    const prev = ARTICLES[i - 1];
    return (
      <article className="stack" style={{ maxWidth: 820 }}>
        <a className="back" href="#/wissen">← Wissen</a>
        <div className="kicker">{a.section} · {a.kicker}</div>
        <h1>{a.title}</h1>
        <div className="knowledge-body">
          {(a.fen || a.moves) && (
            <figure className="knowledge-fig">
              <MiniBoard fen={fenOf(a)} arrows={a.arrows} size={300} />
              {a.caption && <figcaption className="muted">{a.caption}</figcaption>}
            </figure>
          )}
          {a.paragraphs.map((p, k) => <Rich key={k} text={p} />)}
        </div>
        <div className="row">
          {'speechSynthesis' in window && <button className="btn small" onClick={() => speak(a.paragraphs.join(' '))}>🔊 Vorlesen</button>}
          <span className="spacer" />
          {prev && <a className="btn small ghost" href={'#/wissen/' + prev.id}>← {prev.title}</a>}
          {next && <a className="btn small" href={'#/wissen/' + next.id}>{next.title} →</a>}
        </div>
      </article>
    );
  }
  return (
    <>
      <div className="page-head">
        <div className="kicker">Kurz & verständlich</div>
        <h1>Wissen</h1>
        <p className="muted">Wie das Schach entstanden ist, wer es geprägt hat – und die Regeln, die man im Verein und im Turnier kennen muss.</p>
      </div>
      {(['Geschichte', 'Regeln'] as const).map((sec) => (
        <section key={sec} style={{ marginBottom: 36 }}>
          <div className="path-head"><h2 style={{ margin: 0 }}>{sec}</h2></div>
          <div className={sec === 'Geschichte' ? 'timeline' : 'grid'}>
            {ARTICLES.filter((x) => x.section === sec).map((x) => (
              <a key={x.id} className="card" href={'#/wissen/' + x.id}>
                <div className="kicker">{x.kicker}</div>
                <h3>{x.title}</h3>
                <p className="muted" style={{ fontSize: 14, margin: 0 }}>{x.paragraphs[0].replace(/\*\*/g, '').slice(0, 120)}…</p>
              </a>
            ))}
          </div>
        </section>
      ))}
    </>
  );
}
