import { lazy, Suspense, useMemo } from 'react';
import { CATEGORIES } from '../content/types';
import { LESSON_META as lessons, MASTER_COUNT } from '../content/meta';
import { useProgress, levelFromXp, today } from '../lib/progress';
import { questsFor, BADGES } from '../lib/game';
import { Bar, Ring } from '../components/Widgets';

// Tagesplan braucht die Motivnamen – eigener Chunk, damit die Startseite schlank bleibt
const DailyPlan = lazy(() => import('../components/DailyPlan'));

const TICKER = [
  '„Taktik ist, was man tut, wenn es etwas zu tun gibt. Strategie ist, was man tut, wenn es nichts zu tun gibt.“ – Tartakower',
  '„Bauern sind die Seele des Schachs.“ – Philidor',
  '„Du musst dein Pferd in den tiefen, dunklen Wald führen, wo 2 + 2 = 5 ist.“ – Tal',
  '„Ich glaube nicht an Psychologie. Ich glaube an gute Züge.“ – Fischer',
  '„Im Endspiel ist der König eine starke Figur.“ – Capablanca',
  '„Die Drohung ist stärker als ihre Ausführung.“ – Nimzowitsch',
];

export default function Home() {
  const p = useProgress();
  const next = useMemo(() => lessons.find((l) => !p.lessons[l.id]?.done), [p.lessons]);
  const due = p.review.filter((c) => c.due <= Date.now()).length;
  const { level, into, need } = levelFromXp(p.xp);

  return (
    <>
      <section className="hero">
        <div className="stack">
          <div className="kicker reveal">Kostenlos · Offline · Vom Einsteiger bis zum Meister</div>
          <h1 className="reveal reveal-2">
            Schach lernen.
            <br />
            <span className="strike">Auswendig</span> Verstehen.
          </h1>
          <p className="reveal reveal-3 muted" style={{ maxWidth: 560, fontSize: 18 }}>
            Jede Stellung erklärt in drei Tiefen – <b>Kurz</b>, <b>Warum?</b> und <b>Profi</b>. Mit Pfeilen, typischen
            Fehlern, Meisterpartien von Tal & Fischer, Bots und Partieanalyse.
          </p>
          <div className="row reveal reveal-4">
            {next && (
              <a className="btn primary" href={'#/lektion/' + next.id}>
                {Object.keys(p.lessons).length ? 'Weiterlernen' : 'Jetzt starten'} <span className="arrow">→</span>
              </a>
            )}
            <a className="btn" href="#/taktik">
              Taktik-Runde
            </a>
          </div>
        </div>
        <div className="card inverse reveal reveal-3">
          <div className="kicker">Tagesziel</div>
          <div className="daily">
            <Ring value={p.dailyXp} max={p.dailyGoal} label="Tagesziel" />
            <div>
              <h3 style={{ margin: 0 }}>
                {p.dailyXp} / {p.dailyGoal} XP
              </h3>
              <p className="muted" style={{ margin: 0 }}>
                Serie: {p.streak} {p.streak === 1 ? 'Tag' : 'Tage'}
              </p>
            </div>
          </div>
          <div style={{ marginTop: 18 }}>
            <div className="row" style={{ justifyContent: 'space-between', fontFamily: 'var(--mono)', fontSize: 12 }}>
              <span>STUFE {level}</span>
              <span>
                {into}/{need} XP
              </span>
            </div>
            <div className="bar" style={{ borderColor: 'var(--bg)' }}>
              <i style={{ width: `${(100 * into) / need}%`, background: 'var(--bg)' }} />
            </div>
          </div>
          {next && (
            <p style={{ marginTop: 16, marginBottom: 0 }}>
              Nächste Lektion: <b>{next.title}</b>
            </p>
          )}
          {due > 0 && (
            <a className="btn small" style={{ marginTop: 12 }} href="#/fehlerheft">
              {due} Stellung{due > 1 ? 'en' : ''} wiederholen
            </a>
          )}
        </div>
      </section>

      <Suspense fallback={null}>
        <DailyPlan />
      </Suspense>

      <section className="grid" style={{ marginBottom: 12 }}>
        <div className="card flat">
          <div className="kicker">Tagesquests · jeden Tag neu</div>
          <div className="stack">
            {questsFor(today()).map((q) => {
              const v = Math.min(q.target, q.value(p.day));
              const done = p.questsClaimed.includes(q.id);
              return (
                <div key={q.id}>
                  <div className="row" style={{ justifyContent: 'space-between', fontSize: 14 }}>
                    <span>{done ? '✓ ' : ''}{q.text}</span>
                    <span className="mono">{done ? `+${q.xp} XP` : `${v}/${q.target}`}</span>
                  </div>
                  <Bar value={v} max={q.target} />
                </div>
              );
            })}
          </div>
        </div>
        {!p.placementDone ? (
          <a className="card inverse" href="#/einstufung">
            <div className="kicker">2 Minuten · 10 Aufgaben</div>
            <h3>Einstufungstest</h3>
            <p className="muted">Du kannst schon Schach? Finde heraus, wo du stehst – passende Lektionen werden freigeschaltet.</p>
          </a>
        ) : (
          <a className="card" href="#/profil">
            <div className="kicker">Abzeichen</div>
            <h3>{Object.keys(p.badges).length} / {BADGES.length}</h3>
            <p className="muted" style={{ letterSpacing: 4 }}>
              {BADGES.filter((b) => p.badges[b.id]).slice(-8).map((b) => b.icon).join(' ') || 'Noch keins – leg los!'}
            </p>
          </a>
        )}
        <a className="card" href="#/training">
          <div className="kicker">Kurz & knackig</div>
          <h3>Trainer</h3>
          <p className="muted">Koordinaten, Feldfarben, Blindschach, Rechnen, „Was droht?“ und mehr.</p>
        </a>
        <a className="card" href="#/begriffe">
          <div className="kicker">Nachschlagen</div>
          <h3>Fachbegriffe-Heft</h3>
          <p className="muted">Über 100 Begriffe von Abzug bis Zugzwang – mit Diagramm.</p>
        </a>
      </section>

      <div className="ticker" aria-hidden>
        <div>
          {[...TICKER, ...TICKER].map((t, i) => (
            <span key={i}>{t} ◆</span>
          ))}
        </div>
      </div>

      <h2>Lernpfade</h2>
      <div className="grid">
        {CATEGORIES.map((c) => {
          const ls = lessons.filter((l) => l.category === c.id);
          const done = ls.filter((l) => p.lessons[l.id]?.done).length;
          return (
            <a className="card" key={c.id} href={'#/lernen/' + c.id}>
              <div className="kicker">{ls.length} Lektionen</div>
              <h3>{c.name}</h3>
              <p className="muted">{c.blurb}</p>
              <Bar value={done} max={ls.length} />
              <p className="mono" style={{ fontSize: 12, marginTop: 6, marginBottom: 0 }}>
                {done}/{ls.length} erledigt
              </p>
            </a>
          );
        })}
        <a className="card" href="#/meister">
          <div className="kicker">{MASTER_COUNT} Partien</div>
          <h3>Meisterpartien</h3>
          <p className="muted">Spiele wie Tal, Fischer, Morphy & Kasparov – finde ihre Züge.</p>
          <Bar value={Object.values(p.masters).filter((m) => m.done).length} max={MASTER_COUNT} />
        </a>
      </div>

      <h2 style={{ marginTop: 40 }}>Trainieren</h2>
      <div className="grid">
        <a className="card inverse" href="#/taktik">
          <div className="kicker">30 Motive · max. 10 pro Runde</div>
          <h3>Taktik-Training</h3>
          <p className="muted">Gabel, Fesselung, Abzug, Matt in 2 … sortiert nach Art und Stärke.</p>
        </a>
        <a className="card" href="#/spielen">
          <div className="kicker">6 Bots</div>
          <h3>Gegen Bots spielen</h3>
          <p className="muted">Vom Anfänger-Bot bis zur vollen Stockfish-Stärke – mit Tipps auf Wunsch.</p>
        </a>
        <a className="card" href="#/analyse">
          <div className="kicker">PGN einfügen</div>
          <h3>Partieanalyse</h3>
          <p className="muted">Deine Fehler, einfach erklärt – mit besserem Zug als Pfeil.</p>
        </a>
        <a className="card" href="#/fehlerheft">
          <div className="kicker">{p.review.length} Stellungen</div>
          <h3>Fehlerheft</h3>
          <p className="muted">Was du falsch gemacht hast, kommt klug verteilt wieder.</p>
        </a>
      </div>
    </>
  );
}
