import { useMemo } from 'react';
import { lessons } from '../content';
import { useProgress } from '../lib/progress';

/** Wählt eine zufällige Variante aus dem eigenen Repertoire – bevorzugt die, in denen zuletzt Fehler passierten. */
export default function RepertoireDrill() {
  const p = useProgress();
  const target = useMemo(() => {
    const options = lessons
      .filter((l) => p.repertoire.includes(l.id))
      .flatMap((l) => (l.drill ?? []).map((d, i) => ({ l, d, i })));
    if (!options.length) return null;
    // Varianten mit offenen Fehlerheft-Karten bekommen mehr Gewicht
    const weight = (o: (typeof options)[number]) => 1 + p.review.filter((c) => c.id.startsWith(`drill:${o.l.id}:${o.i}:`)).length * 3;
    const total = options.reduce((a, o) => a + weight(o), 0);
    let r = Math.random() * total;
    for (const o of options) {
      r -= weight(o);
      if (r <= 0) return o;
    }
    return options[0];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!target)
    return (
      <div className="stack">
        <h2>Noch kein Repertoire</h2>
        <p className="muted">Markiere auf der Eröffnungsseite mit ☆ die Eröffnungen, die du spielst.</p>
        <a className="btn" href="#/eroeffnungen">Zu den Eröffnungen</a>
      </div>
    );
  // Direkt ins Varianten-Training weiterleiten
  location.replace(`#/eroeffnungen/training/${target.l.id}/${target.i}`);
  return <p className="mono"><span className="spinner" /> Wähle Variante …</p>;
}
