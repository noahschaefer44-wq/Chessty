import { useProgress } from '../lib/progress';

const TRAINERS = [
  { id: 'koordinaten', path: 'koordinaten', name: 'Koordinaten', text: 'Feld antippen, dessen Namen du siehst – 30 Sekunden.', kicker: 'Grundlage' },
  { id: 'feldfarben', path: 'feldfarben', name: 'Feldfarben', text: 'Hell oder dunkel? Ohne aufs Brett zu schauen.', kicker: 'Grundlage' },
  { id: 'blind-6', path: 'blind', name: 'Blindschach', text: 'Züge lesen, im Kopf mitspielen, dann das Feld nennen.', kicker: 'Visualisierung' },
  { id: 'nachbauen', path: 'nachbauen', name: 'Stellung nachbauen', text: '10 Sekunden einprägen, dann aus dem Gedächtnis aufstellen.', kicker: 'Gedächtnis' },
  { id: 'haengend', path: 'haengend', name: 'Hängende Figuren', text: 'Alle ungedeckten oder zu schwach gedeckten Figuren finden.', kicker: 'Taktik-Blick' },
  { id: 'droht', path: 'droht', name: 'Was droht?', text: 'Finde den stärksten Zug des Gegners – die wichtigste Frage im Schach.', kicker: 'Verteidigung' },
  { id: 'kandidaten', path: 'kandidaten', name: 'Kandidatenzüge', text: 'Drei Kandidaten wählen, dann zeigt die Engine, ob der beste dabei war.', kicker: 'Denkmethode' },
  { id: 'rechnen-2', path: 'rechnen', name: 'Rechnen', text: 'Züge nur im Kopf ausführen und dann weiterspielen.', kicker: 'Berechnung' },
  { id: 'bewertung', path: 'bewertung', name: 'Bewertung schätzen', text: 'Wer steht besser? Vergleiche deine Einschätzung mit Stockfish.', kicker: 'Positionsgefühl' },
  { id: 'fallen', path: 'fallen', name: 'Fallen erkennen', text: 'Eröffnungsfallen bestrafen – oder selbst nicht hineintappen.', kicker: 'Eröffnungen' },
  { id: 'raten', path: 'raten', name: 'Rate den Meisterzug', text: 'Spiele Fischer, Tal & Co. Zug für Zug – mit Punkten.', kicker: 'Meisterpartien' },
];

export default function Training() {
  const p = useProgress();
  return (
    <>
      <div className="page-head">
        <div className="kicker">Kurz & knackig · ohne Herzen</div>
        <h1>Trainer</h1>
        <p className="muted">Zehn Übungen für die Fähigkeiten hinter dem Schach: sehen, merken, rechnen, bewerten. Puzzle-Runden haben höchstens 10 Aufgaben.</p>
      </div>
      <div className="grid">
        {TRAINERS.map((t, i) => {
          const best = Object.entries(p.trainerBest).filter(([k]) => k === t.id || k.startsWith(t.path === 'raten' ? 'raten-' : t.id + '-')).map(([, v]) => v);
          return (
            <a key={t.id} className={'card' + (i === 0 ? ' inverse' : '')} href={'#/training/' + t.path}>
              <div className="kicker">{t.kicker}</div>
              <h3>{t.name}</h3>
              <p className="muted" style={{ fontSize: 14 }}>{t.text}</p>
              {best.length > 0 && <span className="tag">Bestwert {Math.max(...best)}</span>}
            </a>
          );
        })}
        <a className="card" href="#/begriffe">
          <div className="kicker">Nachschlagen</div>
          <h3>Fachbegriffe-Heft</h3>
          <p className="muted" style={{ fontSize: 14 }}>Über 100 Begriffe mit Diagramm.</p>
        </a>
        <a className="card" href="#/editor">
          <div className="kicker">Werkzeug</div>
          <h3>Brett-Editor</h3>
          <p className="muted" style={{ fontSize: 14 }}>Eigene Stellungen aufbauen, analysieren, gegen den Bot ausspielen.</p>
        </a>
      </div>
    </>
  );
}
