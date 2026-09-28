import { useMemo, useState } from 'react';
import { Chess } from 'chess.js';
import Board from '../../components/Board';
import { Head, TrainerDone } from './common';
import { masters } from '../../content';
import { engine, evalNumber } from '../../lib/engine';
import { tryMove, sanDe, uci } from '../../lib/chess';
import { sound } from '../../lib/sound';

/** „Rate den Meisterzug“: jeden Zug der Meisterseite raten, Punkte je nach Engine-Nähe. */
export default function GuessMove() {
  const [gid, setGid] = useState<string | null>(null);
  const g = masters.find((m) => m.id === gid);
  const positions = useMemo(() => {
    if (!g) return [];
    const c = new Chess();
    return g.moves.map((m) => {
      const fen = c.fen();
      const mv = c.move(m);
      return { fen, uci: uci(mv), san: mv.san };
    });
  }, [g]);
  const heroParity = g?.hero === 'white' ? 0 : 1;
  const [ply, setPly] = useState(0);
  const [total, setTotal] = useState(0);
  const [count, setCount] = useState(0);
  const [last, setLast] = useState<{ pts: number; mine: string; master: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  if (!g)
    return (
      <div className="stack">
        <Head kicker="Trainer · Rate den Meisterzug" title="Welche Partie?">
          <p className="muted">Du spielst die Seite des Meisters. Für jeden Zug bekommst du bis zu 10 Punkte – volle Punktzahl für den Meisterzug, sonst je nachdem, wie nah dein Zug laut Stockfish herankommt.</p>
        </Head>
        <div className="grid">
          {masters.map((m) => (
            <button key={m.id} className="card" onClick={() => { setGid(m.id); setPly(m.hero === 'white' ? 0 : 1); }}>
              <div className="kicker">{m.event} {m.year}</div>
              <h3>{m.title}</h3>
              <p className="mono" style={{ fontSize: 12 }}>{m.white} – {m.black}</p>
            </button>
          ))}
        </div>
      </div>
    );
  if (done) return <TrainerDone id={'raten-' + g.id} score={total} max={count * 10} unit={`Punkte in „${g.title}“`} onAgain={() => { setPly(heroParity); setTotal(0); setCount(0); setLast(null); setDone(false); }} />;

  const pos = positions[ply];
  const side = g.hero;

  async function onMove(u: string) {
    if (!pos || busy) return;
    const c = new Chess(pos.fen);
    const m = tryMove(c, u);
    if (!m) return;
    setBusy(true);
    let pts = 10;
    if (uci(m) !== pos.uci) {
      // Bewertung nach eigenem Zug vs. nach Meisterzug (aus Sicht des Meisters)
      const sign = side === 'white' ? 1 : -1;
      const a = await engine.analyse(c.fen(), { depth: 11 });
      const mc = new Chess(pos.fen);
      mc.move(pos.san);
      const b = await engine.analyse(mc.fen(), { depth: 11 });
      const loss = (evalNumber(b.lines[0]) - evalNumber(a.lines[0])) * sign;
      pts = Math.max(0, Math.min(9, Math.round(9 - loss * 3)));
    }
    setTotal((t) => t + pts);
    setCount((n) => n + 1);
    setLast({ pts, mine: m.san, master: pos.san });
    pts >= 8 ? sound.good() : pts <= 3 && sound.bad();
    setBusy(false);
    const next = ply + 2;
    if (next >= positions.length) setDone(true);
    else setPly(next);
  }

  const shownFen = pos ? pos.fen : positions[positions.length - 1].fen;
  const prev = positions[ply - 1];
  return (
    <div className="trainer">
      <div className="board-col">
        <Board fen={shownFen} orientation={side} movable={busy ? undefined : side} onMove={onMove}
          lastMove={prev ? [prev.uci.slice(0, 2), prev.uci.slice(2, 4)] : undefined} />
      </div>
      <aside className="side">
        <Head kicker={`Rate den Meisterzug · ${g.white} – ${g.black}`} title={g.title} />
        <div className="kpis">
          <div className="kpi"><span>Punkte</span><b>{total}</b></div>
          <div className="kpi"><span>Züge</span><b>{count}</b></div>
          <div className="kpi"><span>Schnitt</span><b>{count ? (total / count).toFixed(1) : '–'}</b></div>
        </div>
        {prev && <p className="mono">Gegner spielte: {sanDe(prev.san)}</p>}
        {busy && <p className="mono"><span className="spinner" /> Engine vergleicht …</p>}
        {last && (
          <div className={'feedback ' + (last.pts >= 8 ? 'good' : 'bad')}>
            <b>+{last.pts}</b> · Du: {sanDe(last.mine)} · Meister: {sanDe(last.master)}
          </div>
        )}
        <button className="btn small" style={{ alignSelf: 'flex-start' }} onClick={() => setDone(true)}>Beenden</button>
      </aside>
    </div>
  );
}
