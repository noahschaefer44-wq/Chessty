import { useEffect, useMemo, useRef, useState } from 'react';
import { useAdmin, registerAdminActions } from '../lib/admin';
import VariantBoard, { PieceSvg } from './VariantBoard';
import {
  newGame, legalMoves, makeMove, outcome, duckSquares, inCheck, kingSq, moveText, posKey, colorOf, PIECE_NAMES,
  type Color, type Move, type Outcome, type Pos, type Rules,
} from './engine';
import { BOTS } from './ai';
import { botMove, cancelBot } from './bot';
import { sound } from '../lib/sound';
import { addXp } from '../lib/progress';
import { Rich } from '../components/Explain';

interface Ply {
  pos: Pos; // Stellung vor dem Zug
  move: Move;
  text: string;
}

export default function VariantPlay({ rules, ruleText, tip }: { rules: Rules; ruleText: string[]; tip?: string }) {
  const [level, setLevel] = useState<number | null>(null);
  const [human, setHuman] = useState<Color>('w');
  const [pos, setPos] = useState<Pos>(() => newGame(rules));
  const [hist, setHist] = useState<Ply[]>([]);
  const [sel, setSel] = useState<number | null>(null);
  const [drop, setDrop] = useState<string | null>(null);
  const [promo, setPromo] = useState<Move[] | null>(null);
  const [duckFor, setDuckFor] = useState<{ move: Move; after: Pos } | null>(null);
  const [thinking, setThinking] = useState(false);
  const [over, setOver] = useState<Outcome | null>(null);
  const [hint, setHint] = useState<Move | null>(null);
  const game = useRef(0);
  const [reveal, setReveal] = useState(false);

  const moves = useMemo(() => (over ? [] : legalMoves(pos, rules)), [pos, rules, over]);

  function start(lv: number, color: Color | 'r') {
    cancelBot();
    game.current++;
    setLevel(lv);
    setHuman(color === 'r' ? (Math.random() < 0.5 ? 'w' : 'b') : color);
    setPos(newGame(rules));
    setHist([]);
    setSel(null);
    setDrop(null);
    setPromo(null);
    setDuckFor(null);
    setOver(null);
    setHint(null);
    setThinking(false);
  }

  function commit(m: Move) {
    const next = makeMove(pos, m, rules);
    const text = moveText(pos, m);
    const nh = [...hist, { pos, move: m, text }];
    m.drop || !pos.b[m.to] ? sound.move() : sound.capture();
    setHist(nh);
    setPos(next);
    setSel(null);
    setDrop(null);
    setPromo(null);
    setDuckFor(null);
    setHint(null);
    // Dreifache Stellungswiederholung
    const key = posKey(next);
    const reps = nh.filter((h) => posKey(h.pos) === key).length + 1;
    const o = reps >= 3 ? { winner: 'draw' as const, reason: 'Dreifache Stellungswiederholung' } : outcome(next, rules);
    if (o) finish(o);
  }

  function finish(o: Outcome) {
    setOver(o);
    if (o.winner === human) {
      sound.good();
      addXp(5 + (level ?? 0) * 3);
    } else if (o.winner !== 'draw') sound.bad();
  }

  function play(m: Move) {
    if (rules.duck) {
      const after = makeMove(pos, m, rules);
      // Endet die Partie schon durch den Figurenzug (König geschlagen), braucht es keine Ente mehr
      if (outcome(after, rules)?.reason === 'König geschlagen') return commit(m);
      setDuckFor({ move: m, after });
      setSel(null);
      return;
    }
    commit(m);
  }

  // Bot am Zug
  useEffect(() => {
    if (level === null || over || pos.turn === human) return;
    const g = game.current;
    setThinking(true);
    const t = setTimeout(() => {
      botMove(pos, rules, level).then((m) => {
        if (g !== game.current) return;
        setThinking(false);
        if (!m) {
          const o = outcome(pos, rules);
          if (o) finish(o);
          return;
        }
        commit(m);
      });
    }, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pos, level, human, over]);

  useEffect(() => () => cancelBot(), []);

  // Admin-Testmodus
  const adm = useAdmin();
  useEffect(() => {
    if (!adm.unlocked || level === null) return;
    return registerAdminActions('variant', [
      { label: 'Sofort gewinnen', run: () => { cancelBot(); game.current++; setThinking(false); finish({ winner: human, reason: 'Sieg (Testmodus)' }); } },
      { label: 'Sofort verlieren', run: () => { cancelBot(); game.current++; setThinking(false); finish({ winner: human === 'w' ? 'b' : 'w', reason: 'Niederlage (Testmodus)' }); } },
      { label: 'Remis', run: () => { cancelBot(); game.current++; setThinking(false); finish({ winner: 'draw', reason: 'Remis (Testmodus)' }); } },
      { label: 'Nebel lüften / Brett aufdecken', run: () => setReveal(true) },
    ]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adm.unlocked, level, human, pos]);

  function onSquare(s: number) {
    if (over || level === null || pos.turn !== human || thinking) return;
    if (duckFor) {
      if (duckSquares(duckFor.after, pos.duck).includes(s)) commit({ ...duckFor.move, duck: s });
      return;
    }
    if (drop) {
      const m = moves.find((x) => x.drop === drop && x.to === s);
      setDrop(null);
      if (m) return play(m);
    }
    if (sel !== null) {
      const cands = moves.filter((x) => x.from === sel && (x.to === s || x.castle === s));
      if (cands.length > 1 && cands.every((c) => c.promo)) {
        setPromo(cands);
        return;
      }
      if (cands.length) return play(cands[0]);
    }
    const p = pos.b[s];
    if (p && colorOf(p) === human && moves.some((x) => x.from === s)) setSel(s);
    else setSel(null);
  }

  function undo() {
    if (thinking) return;
    // bis zum letzten eigenen Zug zurück
    let i = hist.length - 1;
    while (i >= 0 && hist[i].pos.turn !== human) i--;
    if (i < 0) return;
    cancelBot();
    game.current++;
    setPos(hist[i].pos);
    setHist(hist.slice(0, i));
    setOver(null);
    setSel(null);
    setDuckFor(null);
    setHint(null);
  }

  async function showHint() {
    if (pos.turn !== human || over) return;
    setThinking(true);
    const g = game.current;
    const m = await botMove(pos, rules, 3);
    if (g !== game.current) return;
    setThinking(false);
    setHint(m);
  }

  // Nebel: nur Felder sichtbar, die eigene Figuren erreichen können
  const hidden = useMemo(() => {
    if (!rules.fog || over || reveal) return undefined;
    const vis = new Set<number>();
    pos.b.forEach((p, s) => p && colorOf(p) === human && vis.add(s));
    for (const m of legalMoves({ ...pos, turn: human }, { ...rules, forcedCapture: false })) if (m.from >= 0) vis.add(m.to);
    return new Set(Array.from({ length: 64 }, (_, s) => s).filter((s) => !vis.has(s)));
  }, [pos, rules, human, over, reveal]);

  if (level === null) {
    return (
      <div className="panel">
        <div className="panel-head"><b>Gegner wählen</b></div>
        <div className="panel-body">
          <BotPicker onStart={start} />
        </div>
      </div>
    );
  }

  const shown = duckFor ? duckFor.after : pos;
  const last = hist.length ? hist[hist.length - 1].move : null;
  const targets = duckFor
    ? duckSquares(duckFor.after, pos.duck)
    : drop
      ? moves.filter((m) => m.drop === drop).map((m) => m.to)
      : sel !== null
        ? moves.filter((m) => m.from === sel).map((m) => m.to)
        : [];
  const lastSquares: [number, number] | null = duckFor
    ? [duckFor.move.from, duckFor.move.to]
    : hint
      ? [hint.from, hint.to]
      : last
        ? [last.from, last.to]
        : null;
  const checkSq = rules.kingSafety && inCheck(shown, shown.turn, rules) ? kingSq(shown, shown.turn) : -1;
  const bot = BOTS[level];
  const pocket = (c: Color) => Object.entries(pos.pockets[c]).filter(([, n]) => n > 0);

  return (
    <div className="trainer">
      <div className="board-col">
        {rules.drops && <Pocket items={pocket(human === 'w' ? 'b' : 'w')} color={human === 'w' ? 'b' : 'w'} />}
        <div className={'vboard-wrap' + (thinking ? ' thinking' : '')}>
          <VariantBoard pos={shown} flip={human === 'b'} selected={sel} targets={targets} last={lastSquares}
            hidden={hidden} check={checkSq} duckMode={!!duckFor} onSquare={onSquare} />
        </div>
        {rules.drops && (
          <Pocket items={pocket(human)} color={human} active={drop} onPick={(t) => { setSel(null); setDrop(drop === t ? null : t); }}
            disabled={pos.turn !== human || !!over} />
        )}
      </div>
      <aside className="side">
        <div>
          <div className="kicker">{rules.name} · gegen {bot.name}</div>
          <h2 style={{ margin: 0 }}>
            {over ? (over.winner === 'draw' ? 'Remis' : over.winner === human ? 'Gewonnen!' : 'Verloren') : pos.turn === human ? 'Du bist am Zug' : `${bot.name} denkt …`}
          </h2>
          {rules.checksToWin > 0 && (
            <p className="mono" style={{ margin: '6px 0 0' }}>
              Schachs – du: {pos.checks[human]}/{rules.checksToWin} · Bot: {pos.checks[human === 'w' ? 'b' : 'w']}/{rules.checksToWin}
            </p>
          )}
        </div>
        {over && (
          <div className={'feedback ' + (over.winner === human ? 'good' : 'bad')}>
            <b>{over.reason}.</b> {over.winner === human ? `+${5 + level * 3} XP` : over.winner === 'draw' ? 'Unentschieden.' : 'Versuch es nochmal oder wähle einen leichteren Bot.'}
          </div>
        )}
        {duckFor && <div className="feedback good"><b>Setze jetzt die Ente</b> auf ein leeres Feld (nicht auf dasselbe Feld wie vorher).</div>}
        {promo && (
          <div className="panel">
            <div className="panel-head"><b>Umwandeln in …</b></div>
            <div className="panel-body row">
              {promo.map((m) => (
                <button key={m.promo} className="btn small" onClick={() => play(m)}>{PIECE_NAMES[m.promo!]}</button>
              ))}
            </div>
          </div>
        )}
        {hint && !over && <p className="mono muted" style={{ fontSize: 13 }}>Tipp: {moveText(pos, hint)}</p>}
        <div className="row">
          <button className="btn small" onClick={undo} disabled={!hist.length || thinking}>Zug zurück</button>
          <button className="btn small" onClick={showHint} disabled={pos.turn !== human || !!over || thinking}>Tipp</button>
          <button className="btn small" onClick={() => start(level, human)}>Neue Partie</button>
          <button className="btn small ghost" onClick={() => { cancelBot(); setLevel(null); }}>Anderer Bot</button>
        </div>
        <div className="panel">
          <div className="panel-head"><b>Züge</b></div>
          <div className="movelist">
            {hist.map((h, i) => (
              <span key={i}>{i % 2 === 0 && <span className="n">{i / 2 + 1}.</span>} {rules.fog && !over && h.pos.turn !== human ? '???' : h.text}</span>
            ))}
          </div>
        </div>
        <details className="panel">
          <summary className="panel-head" style={{ cursor: 'pointer' }}><b>Regeln</b></summary>
          <div className="panel-body">
            <ul style={{ margin: 0, paddingLeft: 18 }}>{ruleText.map((r) => <li key={r}><Rich text={r} /></li>)}</ul>
            {tip && <p style={{ marginBottom: 0 }}><b>Tipp:</b> {tip}</p>}
          </div>
        </details>
      </aside>
    </div>
  );
}

function Pocket({ items, color, active, onPick, disabled }: { items: [string, number][]; color: Color; active?: string | null; onPick?: (t: string) => void; disabled?: boolean }) {
  return (
    <div className="pocket" aria-label="Reserve">
      {items.length === 0 && <span className="mono muted" style={{ fontSize: 12 }}>Reserve leer</span>}
      {items.map(([t, n]) => (
        <button key={t} className={'pocket-piece' + (active === t ? ' on' : '')} disabled={disabled || !onPick} onClick={() => onPick?.(t)}
          aria-label={`${PIECE_NAMES[t]} einsetzen (${n})`}>
          <svg viewBox="0 0 1 1" width="34" height="34"><PieceSvg p={color === 'w' ? t.toUpperCase() : t} x={0} y={0} /></svg>
          <span className="mono">{n}</span>
        </button>
      ))}
    </div>
  );
}

export function BotPicker({ onStart }: { onStart: (level: number, color: Color | 'r') => void }) {
  const [color, setColor] = useState<Color | 'r'>('w');
  return (
    <>
      <div className="row" style={{ marginBottom: 12 }}>
        {([['w', 'Weiß'], ['b', 'Schwarz'], ['r', 'Zufall']] as const).map(([c, n]) => (
          <button key={c} className={'btn small' + (color === c ? ' primary' : '')} onClick={() => setColor(c)}>{n}</button>
        ))}
      </div>
      <div className="bot-grid">
        {BOTS.map((b) => (
          <button key={b.id} className="card bot-card" onClick={() => onStart(b.id, color)}>
            <span className="mono" style={{ fontSize: 12 }}>Stufe {b.id + 1}/5</span>
            <b>{b.name}</b>
            <span className="muted" style={{ fontSize: 13 }}>{b.desc}</span>
          </button>
        ))}
      </div>
    </>
  );
}
