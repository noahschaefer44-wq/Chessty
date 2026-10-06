import { useMemo, useState } from 'react';
import Shell from '../salon/Shell';
import { DAME, dameInit } from '../salon/dame';
import { MUEHLE, muehleInit } from '../salon/muehle';
import { VIER, c4Init, REVERSI, reversiInit, GOMOKU, gomokuInit } from '../salon/grids';
import { DameView, MuehleView, VierView, ReversiView, GomokuView } from '../salon/views';
import { PIECE_IMG } from '../components/pieceImages';
import { useProgress, recordTrainer, addXp } from '../lib/progress';
import { sound } from '../lib/sound';
import { confetti } from '../lib/confetti';

const GAMES = [
  { id: 'dame', name: 'Dame', kicker: 'Brettspiel-Klassiker', text: 'Deutsche Regeln: Schlagzwang, Mehrfachsprünge, fliegende Damen.' },
  { id: 'muehle', name: 'Mühle', kicker: 'Seit über 3000 Jahren', text: 'Setzen, ziehen, springen – drei in einer Reihe nehmen einen Stein.' },
  { id: 'vier', name: 'Vier gewinnt', kicker: 'Schnell & taktisch', text: 'Steine fallen nach unten. Wer zuerst vier in einer Reihe hat, gewinnt.' },
  { id: 'reversi', name: 'Reversi', kicker: 'Eine Minute zu lernen …', text: '… ein Leben zu meistern. Umschließe gegnerische Steine und dreh sie um.' },
  { id: 'gomoku', name: 'Fünf in einer Reihe', kicker: 'Gomoku', text: 'Auf 15×15 Feldern: Wer zuerst fünf Steine in einer Reihe hat, gewinnt.' },
  { id: 'springer', name: 'Springerrundgang', kicker: 'Schach-Knobelei', text: 'Besuche mit dem Springer jedes Feld genau einmal.' },
  { id: 'damen', name: 'Acht Damen', kicker: 'Schach-Knobelei', text: 'Stelle acht Damen auf, ohne dass sich zwei bedrohen. Es gibt 92 Lösungen.' },
];

/** Spielesalon: versteckte Kategorie mit Brettspielen jenseits des Schachs */
export default function Salon({ id }: { id?: string }) {
  const p = useProgress();
  switch (id) {
    case 'dame':
      return <Shell id="dame" title="Dame" rules={DAME} init={dameInit} View={DameView} names={['Weiß', 'Schwarz']} help={[
        'Gespielt wird nur auf den dunklen Feldern. Steine ziehen ein Feld schräg nach vorne.',
        'Schlagen ist Pflicht – auch rückwärts. Kann nach einem Sprung weiter geschlagen werden, muss weitergesprungen werden.',
        'Erreicht ein Stein die gegnerische Grundreihe, wird er zur Dame: Sie zieht und schlägt schräg über beliebig viele Felder.',
        'Wer keinen Zug mehr hat (oder keine Steine), verliert.',
      ]} />;
    case 'muehle':
      return <Shell id="muehle" title="Mühle" rules={MUEHLE} init={muehleInit} View={MuehleView} names={['Weiß', 'Schwarz']} help={[
        'Jeder setzt abwechselnd seine 9 Steine auf freie Punkte, danach wird entlang der Linien gezogen.',
        'Drei eigene Steine in einer Linie sind eine Mühle: Dann darfst du einen gegnerischen Stein entfernen (nicht aus einer Mühle, solange es andere gibt).',
        'Hast du nur noch drei Steine, darfst du springen – auf jeden freien Punkt.',
        'Wer weniger als drei Steine hat oder nicht mehr ziehen kann, verliert.',
      ]} />;
    case 'vier':
      return <Shell id="vier" title="Vier gewinnt" rules={VIER} init={c4Init} View={VierView} names={['Weiß', 'Schwarz']} help={[
        'Tippe eine Spalte an – der Stein fällt bis ganz nach unten.',
        'Vier eigene Steine in einer Reihe (waagrecht, senkrecht oder schräg) gewinnen.',
        'Tipp: Die mittlere Spalte ist die stärkste.',
      ]} />;
    case 'reversi':
      return <Shell id="reversi" title="Reversi" rules={REVERSI} init={reversiInit} View={ReversiView} names={['Weiß', 'Schwarz']} help={[
        'Setze einen Stein so, dass du gegnerische Steine zwischen zwei eigenen einschließt – sie werden umgedreht.',
        'Kannst du nicht setzen, musst du passen.',
        'Wer am Ende mehr Steine hat, gewinnt. Ecken kann man nie verlieren!',
      ]} />;
    case 'gomoku':
      return <Shell id="gomoku" title="Fünf in einer Reihe" rules={GOMOKU} init={gomokuInit} View={GomokuView} names={['Weiß', 'Schwarz']} help={[
        'Setzt abwechselnd Steine auf freie Kreuzungen.',
        'Fünf in einer Reihe (auch schräg) gewinnen.',
        'Achte auf offene Dreier und Vierer des Gegners – sie müssen sofort blockiert werden.',
      ]} />;
    case 'springer':
      return <KnightTour />;
    case 'damen':
      return <EightQueens />;
  }
  return (
    <>
      <div className="page-head">
        <div className="kicker">Geheimtür gefunden</div>
        <h1>Spielesalon</h1>
        <p className="muted">Andere Brettspiele gegen den Computer und zwei Schach-Knobeleien. Gewinne werden als Bestwert gespeichert.</p>
      </div>
      <div className="grid">
        {GAMES.map((g) => (
          <a key={g.id} className="card" href={'#/salon/' + g.id}>
            <div className="kicker">{g.kicker}</div>
            <h3>{g.name}</h3>
            <p className="muted" style={{ fontSize: 14 }}>{g.text}</p>
            {(p.trainerBest['salon-' + g.id] ?? 0) > 0 && <span className="tag solid">{g.id === 'springer' || g.id === 'damen' ? `Bestwert ${p.trainerBest['salon-' + g.id]}` : `besiegt: Stufe ${p.trainerBest['salon-' + g.id]}`}</span>}
          </a>
        ))}
      </div>
    </>
  );
}

// ---------- Springerrundgang ----------
const KN = [[1, 2], [2, 1], [2, -1], [1, -2], [-1, -2], [-2, -1], [-2, 1], [-1, 2]];
function KnightTour() {
  const [size, setSize] = useState(6);
  const [path, setPath] = useState<number[]>([]);
  const [hint, setHint] = useState(false);
  const n = size * size;
  const nbrs = (s: number) => KN.map(([dx, dy]) => [(s % size) + dx, Math.floor(s / size) + dy]).filter(([x, y]) => x >= 0 && y >= 0 && x < size && y < size).map(([x, y]) => y * size + x);
  const cur = path[path.length - 1];
  const options = path.length ? nbrs(cur).filter((s) => !path.includes(s)) : Array.from({ length: n }, (_, i) => i);
  // Warnsdorff-Regel: Feld mit den wenigsten Weiterzügen
  const warn = path.length ? [...options].sort((a, b) => nbrs(a).filter((s) => !path.includes(s) && s !== a).length - nbrs(b).filter((s) => !path.includes(s) && s !== b).length)[0] : undefined;
  const won = path.length === n;
  const stuck = !won && path.length > 0 && !options.length;
  function click(s: number) {
    if (won || !options.includes(s)) return;
    const np = [...path, s];
    setPath(np);
    sound.move();
    if (np.length === n) {
      sound.good();
      confetti(80);
      recordTrainer('salon-springer', size);
      addXp(10 + size * 2);
    } else if (!nbrs(s).some((x) => !np.includes(x))) sound.bad();
  }
  return (
    <>
      <a className="back" href="#/salon">← Spielesalon</a>
      <div className="trainer">
        <div className="board-col">
          <svg viewBox={`0 0 ${size} ${size}`} className="salon-svg" role="img" aria-label="Springerrundgang">
            {Array.from({ length: n }, (_, s) => {
              const x = s % size;
              const y = size - 1 - Math.floor(s / size);
              const k = path.indexOf(s);
              return (
                <g key={s} onClick={() => click(s)} style={{ cursor: 'pointer' }}>
                  <rect x={x} y={y} width={1} height={1} fill={(x + y) % 2 ? 'var(--sq-dark)' : 'var(--sq-light)'} />
                  {k >= 0 && s !== cur && <text x={x + 0.5} y={y + 0.62} fontSize={0.34} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fill="var(--fg)">{k + 1}</text>}
                  {s === cur && <image href={PIECE_IMG.N} x={x} y={y} width={1} height={1} />}
                  {!won && path.length > 0 && options.includes(s) && <circle cx={x + 0.5} cy={y + 0.5} r={hint && s === warn ? 0.22 : 0.12} fill="rgba(0,0,0,.45)" />}
                </g>
              );
            })}
          </svg>
        </div>
        <aside className="side">
          <div><div className="kicker">Schach-Knobelei</div><h2>Springerrundgang</h2></div>
          <div className="panel"><div className="panel-body">
            <p style={{ marginTop: 0 }}>Wähle ein Startfeld und ziehe mit dem Springer so, dass du jedes Feld genau einmal besuchst. Die Zahlen zeigen deinen Weg.</p>
            <p className="mono">{path.length}/{n} Felder</p>
          </div></div>
          {won && <div className="feedback good"><b>Geschafft!</b> Ein vollständiger Rundgang auf {size}×{size}.</div>}
          {stuck && <div className="feedback bad">Sackgasse – kein freies Feld mehr erreichbar. Nimm Züge zurück oder starte neu.</div>}
          <div className="row">
            <div className="seg">{[5, 6, 8].map((k) => <button key={k} className={size === k ? 'on' : ''} onClick={() => { setSize(k); setPath([]); }}>{k}×{k}</button>)}</div>
          </div>
          <div className="row">
            <button className="btn small" onClick={() => setPath(path.slice(0, -1))} disabled={!path.length}>Zurück</button>
            <button className="btn small" onClick={() => setPath([])}>Neu</button>
            <button className="btn small" onClick={() => setHint((h) => !h)}>{hint ? 'Tipp aus' : 'Tipp: Warnsdorff-Regel'}</button>
          </div>
          {hint && <p className="muted" style={{ fontSize: 13 }}>Warnsdorff-Regel: Zieh immer auf das Feld, von dem aus es die wenigsten Weiterzüge gibt. Das große Kreuzchen zeigt es.</p>}
        </aside>
      </div>
    </>
  );
}

// ---------- Acht Damen ----------
function EightQueens() {
  const [qs, setQs] = useState<number[]>([]);
  const [fresh, setFresh] = useState(false);
  const [found, setFound] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('chessty.salon.damen') ?? '[]');
    } catch {
      return [];
    }
  });
  const attacks = (a: number, b: number) => {
    const [ax, ay, bx, by] = [a % 8, a >> 3, b % 8, b >> 3];
    return ax === bx || ay === by || Math.abs(ax - bx) === Math.abs(ay - by);
  };
  const bad = useMemo(() => new Set(qs.filter((a) => qs.some((b) => a !== b && attacks(a, b)))), [qs]);
  const solved = qs.length === 8 && bad.size === 0;
  function click(s: number) {
    const next = qs.includes(s) ? qs.filter((x) => x !== s) : qs.length < 8 ? [...qs, s] : qs;
    setQs(next);
    setFresh(false);
    const k = [...next].sort((a, b) => a - b).join(',');
    if (next.length === 8 && !next.some((a) => next.some((b) => a !== b && attacks(a, b))) && !found.includes(k)) {
      const f = [...found, k];
      setFound(f);
      setFresh(true);
      try {
        localStorage.setItem('chessty.salon.damen', JSON.stringify(f));
      } catch {
        /* egal */
      }
      recordTrainer('salon-damen', f.length);
      addXp(8);
      sound.good();
      confetti(50);
    }
  }
  return (
    <>
      <a className="back" href="#/salon">← Spielesalon</a>
      <div className="trainer">
        <div className="board-col">
          <svg viewBox="0 0 8 8" className="salon-svg" role="img" aria-label="Acht-Damen-Problem">
            {Array.from({ length: 64 }, (_, s) => {
              const x = s % 8;
              const y = 7 - (s >> 3);
              const threatened = !qs.includes(s) && qs.some((q) => attacks(q, s));
              return (
                <g key={s} onClick={() => click(s)} style={{ cursor: 'pointer' }}>
                  <rect x={x} y={y} width={1} height={1} fill={(x + y) % 2 ? 'var(--sq-dark)' : 'var(--sq-light)'} />
                  {threatened && <rect x={x} y={y} width={1} height={1} fill="rgba(0,0,0,.12)" />}
                  {qs.includes(s) && <image href={PIECE_IMG.Q} x={x} y={y} width={1} height={1} opacity={bad.has(s) ? 0.45 : 1} />}
                  {bad.has(s) && <line x1={x + 0.15} y1={y + 0.15} x2={x + 0.85} y2={y + 0.85} stroke="var(--fg)" strokeWidth={0.07} />}
                </g>
              );
            })}
          </svg>
        </div>
        <aside className="side">
          <div><div className="kicker">Schach-Knobelei</div><h2>Acht Damen</h2></div>
          <div className="panel"><div className="panel-body">
            <p style={{ marginTop: 0 }}>Stelle acht Damen so auf, dass keine eine andere angreift. Bedrohte Felder sind grau, Damen im Konflikt durchgestrichen.</p>
            <p className="mono">{qs.length}/8 Damen · {found.length}/92 Lösungen gefunden</p>
          </div></div>
          {solved && <div className="feedback good"><b>Lösung!</b> {fresh ? 'Neue Lösung gespeichert.' : 'Diese hattest du schon – findest du eine andere?'}</div>}
          <div className="row"><button className="btn small" onClick={() => setQs([])}>Brett leeren</button></div>
        </aside>
      </div>
    </>
  );
}
