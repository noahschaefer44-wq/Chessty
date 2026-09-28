import { masters } from '../content';
import { LEVELS } from '../content/types';
import { useProgress } from '../lib/progress';

export default function Masters() {
  const p = useProgress();
  return (
    <>
      <div className="page-head">
        <div className="kicker">Geführte Partien · „Finde den Zug“</div>
        <h1>Meisterpartien</h1>
        <p className="muted">
          Spiele die berühmtesten Partien der Schachgeschichte aus Sicht des Meisters nach. An den Schlüsselmomenten musst du
          den Zug selbst finden – danach erklären wir die Idee in drei Tiefen.
        </p>
      </div>
      <div className="grid wide">
        {masters.map((g) => {
          const r = p.masters[g.id];
          return (
            <a key={g.id} className="card" href={'#/meister/' + g.id}>
              <div className="kicker">{g.event} {g.year} · {LEVELS[g.level]}</div>
              <h3>{g.title}</h3>
              <p className="mono" style={{ fontSize: 13 }}>{g.white} – {g.black} · {g.result}</p>
              <p className="muted" style={{ fontSize: 14 }}>{g.intro.short}</p>
              <div className="row">
                <span className="tag">{g.moments.length} Schlüsselmomente</span>
                <span className="tag">Du spielst {g.hero === 'white' ? 'Weiß' : 'Schwarz'}</span>
                {r?.done && <span className="tag solid">{r.found}/{r.total} gefunden</span>}
              </div>
            </a>
          );
        })}
      </div>
    </>
  );
}
