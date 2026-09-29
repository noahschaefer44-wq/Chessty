import { lessons } from '../content';
import { LEVELS } from '../content/types';
import { useProgress, update } from '../lib/progress';
import { Stars } from '../components/Widgets';

export default function Openings() {
  const p = useProgress();
  const ops = lessons.filter((l) => l.category === 'eroeffnungen');
  const groups: [string, (m: string) => boolean][] = [
    ['Prinzipien', (m) => m === ''],
    ['1.e4', (m) => m === 'e4'],
    ['1.d4 & andere', (m) => m !== '' && m !== 'e4'],
  ];
  return (
    <>
      <div className="page-head">
        <div className="kicker">Ideen statt Auswendiglernen</div>
        <h1>Eröffnungen</h1>
        <p className="muted">
          Jede Eröffnung als Lektion: Hauptideen mit Pfeilen, typische Fehler, Fallen und die Pläne im Mittelspiel. Danach
          trainierst du die Varianten Zug für Zug – Fehler kommen ins Fehlerheft.
        </p>
        <div className="row">
          <a className="btn" href="#/eroeffnungen/explorer">Eröffnungs-Explorer (3.800 Varianten) <span className="arrow">→</span></a>
          {p.repertoire.length > 0 && (
            <a className="btn primary" href="#/eroeffnungen/repertoire">Mein Repertoire trainieren ({p.repertoire.length})</a>
          )}
        </div>
        <p className="muted" style={{ fontSize: 13, marginTop: 8 }}>Tipp: Markiere mit ☆ die Eröffnungen, die du spielst – daraus wird dein persönliches Repertoire-Training.</p>
      </div>
      {groups.map(([name, f]) => {
        const list = ops.filter((l) => f(l.drill?.[0]?.moves[0] ?? ''));
        if (!list.length) return null;
        return (
          <section key={name} style={{ marginTop: 30 }}>
            <div className="path-head"><h2 style={{ margin: 0 }}>{name}</h2></div>
            <div className="grid wide">
              {list.map((l) => (
                <div className="card flat" key={l.id}>
                  <div className="row" style={{ justifyContent: 'space-between' }}>
                    <div className="kicker" style={{ margin: 0 }}>{LEVELS[l.level]}{l.drill?.[0] ? ` · spielst ${l.drill[0].color === 'white' ? 'Weiß' : 'Schwarz'}` : ''}</div>
                    {l.drill?.length ? (
                      <button className="star" aria-label="Zum Repertoire" title="Zu meinem Repertoire"
                        onClick={() => update((x) => ({ ...x, repertoire: x.repertoire.includes(l.id) ? x.repertoire.filter((r) => r !== l.id) : [...x.repertoire, l.id] }))}>
                        {p.repertoire.includes(l.id) ? '★' : '☆'}
                      </button>
                    ) : null}
                  </div>
                  <h3>{l.title}</h3>
                  <p className="muted" style={{ fontSize: 14 }}>{l.summary}</p>
                  {p.lessons[l.id]?.done && <p><Stars n={p.lessons[l.id].stars} /></p>}
                  <div className="row">
                    <a className="btn small primary" href={'#/lektion/' + l.id}>Lektion</a>
                    {l.drill?.map((d, i) => (
                      <a key={i} className="btn small" href={`#/eroeffnungen/training/${l.id}/${i}`}>
                        Training: {d.name}
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </>
  );
}
