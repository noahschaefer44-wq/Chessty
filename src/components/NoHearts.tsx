import { useProgress } from '../lib/progress';

/** Anzeige, wenn alle Herzen verbraucht sind. */
export default function NoHearts() {
  const p = useProgress();
  const due = p.review.filter((c) => c.due <= Date.now()).length;
  return (
    <div className="finish">
      <div className="stamp">♡ 0</div>
      <h2>Keine Herzen mehr</h2>
      <p className="muted">Alle 3 Stunden kommt ein Herz zurück. Oder: Jede richtig gelöste Stellung im Fehlerheft gibt sofort ein Herz.</p>
      <div className="row" style={{ justifyContent: 'center' }}>
        <a className="btn primary" href="#/fehlerheft">Fehlerheft üben{due ? ` (${due})` : ''}</a>
        <a className="btn" href="#/training">Trainer (ohne Herzen)</a>
        <a className="btn ghost" href="#/profil">Herzen abschalten</a>
      </div>
    </div>
  );
}
