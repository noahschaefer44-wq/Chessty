import { useState } from 'react';
import { THEMES } from '../content/themes';
import { useProgress } from '../lib/progress';
import { BAND_NAMES, bandFor, MAX_PER_ROUND } from '../lib/puzzles';

export default function Puzzles() {
  const p = useProgress();
  const [band, setBand] = useState(bandFor(p.puzzleRating));
  const groups = [...new Set(THEMES.map((t) => t.group))];
  return (
    <>
      <div className="page-head">
        <div className="kicker">Taktik-Training · höchstens {MAX_PER_ROUND} Puzzles pro Runde</div>
        <h1>Taktik</h1>
        <p className="muted">
          Wähle ein Motiv und deine Stufe. Jede Runde hat maximal {MAX_PER_ROUND} Aufgaben aus der Lichess-Datenbank – mit
          Erklärung des Motivs in drei Tiefen. Deine Puzzle-Wertung: <b className="mono">{p.puzzleRating}</b>
        </p>
        <div className="seg" style={{ marginTop: 8 }}>
          {BAND_NAMES.map((n, i) => (
            <button key={n} className={band === i ? 'on' : ''} onClick={() => setBand(i)}>
              {n}
            </button>
          ))}
        </div>
      </div>

      <div className="grid">
        <a className="card inverse" href={`#/taktik/mix/${band}`}>
          <div className="kicker">Alle Motive</div>
          <h3>Gemischte Runde</h3>
          <p className="muted">{MAX_PER_ROUND} zufällige Aufgaben deiner Stufe – wie in einer echten Partie weißt du nicht, was kommt.</p>
        </a>
        <a className="card" href="#/taktik/rush/rush">
          <div className="kicker">3 Minuten · 3 Fehler</div>
          <h3>Puzzle-Rush</h3>
          <p className="muted">{MAX_PER_ROUND} Aufgaben mit steigender Schwierigkeit gegen die Uhr.</p>
        </a>
      </div>

      {groups.map((g) => (
        <section key={g} style={{ marginTop: 36 }}>
          <div className="path-head">
            <h2 style={{ margin: 0 }}>{g}</h2>
          </div>
          <div className="grid">
            {THEMES.filter((t) => t.group === g).map((t) => {
              const s = p.themeStats[t.id];
              return (
                <a className="card" key={t.id} href={`#/taktik/${t.id}/${band}`}>
                  <h3>{t.name}</h3>
                  <p className="muted" style={{ fontSize: 14 }}>{t.text.short}</p>
                  {s && (
                    <span className="mono" style={{ fontSize: 12 }}>
                      {s.s} gelöst · {Math.round((100 * s.s) / Math.max(1, s.s + s.f))}%
                    </span>
                  )}
                </a>
              );
            })}
          </div>
        </section>
      ))}
    </>
  );
}
