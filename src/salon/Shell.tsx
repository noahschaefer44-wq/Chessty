import { useEffect, useRef, useState, type ReactNode } from 'react';
import { LEVELS, botMoveAsync, type GameRules, type Player } from './ai';
import { registerAdminActions, useAdmin } from '../lib/admin';
import { addXp, recordTrainer } from '../lib/progress';
import { sound } from '../lib/sound';
import { confetti } from '../lib/confetti';

export interface ViewProps<S, M> {
  state: S;
  legal: M[];
  /** Nutzer ist am Zug und darf ziehen */
  active: boolean;
  onMove: (m: M) => void;
  /** Spieler-Nummer des Menschen (für Ausrichtung) */
  human: Player;
}

/** Rahmen für alle Salon-Spiele: Gegnerwahl, Bot-Züge, Rücknahme, Ergebnis, Admin-Aktionen */
export default function Shell<S, M>({
  id, title, rules, init, View, names, help,
}: {
  id: string;
  title: string;
  rules: GameRules<S, M>;
  init: () => S;
  View: (p: ViewProps<S, M>) => ReactNode;
  /** Namen der Seiten, z. B. ['Weiß', 'Schwarz'] */
  names: [string, string];
  help: string[];
}) {
  const [level, setLevel] = useState<number | null>(null);
  const [human, setHuman] = useState<Player>(1);
  const [hist, setHist] = useState<S[]>(() => [init()]);
  const [thinking, setThinking] = useState(false);
  const [forced, setForced] = useState<Player | 'draw' | null>(null);
  const game = useRef(0);
  const state = hist[hist.length - 1];
  const res = forced ?? rules.result(state);
  const turn = rules.turn(state);
  const legal = res ? [] : rules.moves(state);

  function start(lv: number, side: Player | 0) {
    game.current++;
    setLevel(lv);
    setHuman(side === 0 ? (Math.random() < 0.5 ? 1 : 2) : side);
    setHist([init()]);
    setForced(null);
    setThinking(false);
  }
  function play(m: M) {
    setHist((h) => [...h, rules.play(h[h.length - 1], m)]);
    sound.move();
  }

  // Bot am Zug
  useEffect(() => {
    if (level === null || res || turn === human) return;
    const g = game.current;
    setThinking(true);
    botMoveAsync(rules, state, LEVELS[level]).then((m) => {
      if (g !== game.current) return;
      setThinking(false);
      if (m !== null) play(m);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, level, human]);

  // Ergebnis verbuchen
  const done = useRef(false);
  useEffect(() => {
    if (!res || level === null || done.current) return;
    done.current = true;
    if (res === human) {
      sound.good();
      confetti(60);
      addXp(5 + level * 5);
      recordTrainer('salon-' + id, level + 1);
    } else if (res !== 'draw') sound.bad();
  }, [res, human, level, id]);
  useEffect(() => {
    if (!res) done.current = false;
  }, [res]);

  // Admin-Aktionen
  const adm = useAdmin();
  useEffect(() => {
    if (!adm.unlocked || level === null) return;
    return registerAdminActions('salon', [
      { label: 'Sofort gewinnen', run: () => { game.current++; setThinking(false); setForced(human); } },
      { label: 'Sofort verlieren', run: () => { game.current++; setThinking(false); setForced(human === 1 ? 2 : 1); } },
      { label: 'Remis', run: () => { game.current++; setThinking(false); setForced('draw'); } },
      { label: 'Für mich ziehen (bester Zug)', run: () => { if (turn === human) void botMoveAsync(rules, state, LEVELS[2]).then((m) => m !== null && play(m)); } },
      { label: 'Bot setzt aus', run: () => { if (turn !== human) { game.current++; setThinking(false); const ms = rules.moves(state); if (ms.length) play(ms[ms.length - 1]); } } },
      { label: 'Gegner auf Leicht', run: () => setLevel(0) },
      { label: 'Gegner auf Stark', run: () => setLevel(2) },
    ]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adm.unlocked, level, human, state]);

  function undo() {
    game.current++;
    setThinking(false);
    setForced(null);
    setHist((h) => {
      let k = h.length - 1;
      while (k > 0 && rules.turn(h[k]) !== human) k--;
      if (k === h.length - 1 && k > 0) k--;
      while (k > 0 && rules.turn(h[k]) !== human) k--;
      return h.slice(0, Math.max(1, k + 1));
    });
  }

  if (level === null)
    return (
      <>
        <a className="back" href="#/salon">← Spielesalon</a>
        <div className="page-head"><div className="kicker">Spielesalon</div><h1>{title}</h1></div>
        <div className="panel" style={{ maxWidth: 760 }}>
          <div className="panel-head"><b>Regeln</b></div>
          <div className="panel-body"><ul style={{ margin: 0, paddingLeft: 18 }}>{help.map((h) => <li key={h}>{h}</li>)}</ul></div>
        </div>
        <Picker names={names} onStart={start} />
      </>
    );

  const status = res
    ? res === 'draw' ? 'Unentschieden' : res === human ? 'Gewonnen!' : 'Verloren'
    : turn === human ? 'Du bist am Zug' : 'Gegner denkt …';
  return (
    <>
      <a className="back" href="#/salon">← Spielesalon</a>
      <div className="trainer">
        <div className="board-col">
          <div className={'salon-board' + (thinking ? ' thinking' : '')}>
            <View state={state} legal={legal} active={!res && turn === human && !thinking} onMove={play} human={human} />
          </div>
        </div>
        <aside className="side">
          <div>
            <div className="kicker">{title} · {LEVELS[level].name} · du spielst {names[human - 1]}</div>
            <h2 style={{ margin: 0 }}>{status}</h2>
          </div>
          {res && <div className={'feedback ' + (res === human ? 'good' : 'bad')}>{res === human ? `+${5 + level * 5} XP` : res === 'draw' ? 'Remis.' : 'Nochmal? Oder probier eine leichtere Stufe.'}</div>}
          <div className="row">
            <button className="btn small" onClick={undo} disabled={hist.length < 2}>Zug zurück</button>
            <button className="btn small" onClick={() => start(level, human)}>Neue Partie</button>
            <button className="btn small ghost" onClick={() => setLevel(null)}>Gegner wählen</button>
          </div>
          <details className="panel">
            <summary className="panel-head" style={{ cursor: 'pointer' }}><b>Regeln</b></summary>
            <div className="panel-body"><ul style={{ margin: 0, paddingLeft: 18 }}>{help.map((h) => <li key={h}>{h}</li>)}</ul></div>
          </details>
        </aside>
      </div>
    </>
  );
}

function Picker({ names, onStart }: { names: [string, string]; onStart: (lv: number, side: Player | 0) => void }) {
  const [side, setSide] = useState<Player | 0>(1);
  return (
    <div className="panel" style={{ maxWidth: 760 }}>
      <div className="panel-head"><b>Gegner wählen</b></div>
      <div className="panel-body">
        <div className="row" style={{ marginBottom: 12 }}>
          {([[1, names[0] + ' (beginnt)'], [2, names[1]], [0, 'Zufall']] as const).map(([v, n]) => (
            <button key={v} className={'btn small' + (side === v ? ' primary' : '')} onClick={() => setSide(v)}>{n}</button>
          ))}
        </div>
        <div className="bot-grid">
          {LEVELS.map((l, i) => (
            <button key={l.name} className="card bot-card" onClick={() => onStart(i, side)}>
              <span className="mono" style={{ fontSize: 12 }}>Stufe {i + 1}/3</span>
              <b>{l.name}</b>
              <span className="muted" style={{ fontSize: 13 }}>{l.desc}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
