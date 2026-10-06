import { useEffect, useRef, useState } from 'react';
import { Chess } from 'chess.js';
import Board from './Board';
import Explain from './Explain';
import { probe, tbLabel } from '../lib/tablebase';
import { engine, evalNumber } from '../lib/engine';
import { tryMove, sanDe } from '../lib/chess';
import { sound } from '../lib/sound';
import type { Explain as ExplainT } from '../content/types';

/**
 * Ziel einer Ausspiel-Aufgabe gegen den Computer:
 *  mate    – mattsetzen
 *  promote – sicher umwandeln
 *  draw    – Remis halten (Zuglimit überstehen)
 *  hold    – Vorteil bzw. Stellung halten: nach `limit` eigenen Zügen höchstens 1,2 Bauern schlechter als am Anfang
 */
export type ScenarioGoal = 'mate' | 'promote' | 'draw' | 'hold';

export interface Scenario {
  fen: string;
  goal: ScenarioGoal;
  limit: number;
  title: string;
  text: ExplainT;
  /** Eigene Farbe; ist der Gegner am Zug, zieht der Computer zuerst */
  side?: 'w' | 'b';
}

export const GOAL_LABEL: Record<ScenarioGoal, string> = {
  mate: 'Setze matt',
  promote: 'Wandle sicher um',
  draw: 'Halte Remis',
  hold: 'Halte die Stellung',
};

type Status = 'play' | 'won' | 'lost' | 'thinking';

const pieces = (c: Chess) => c.board().flat().filter(Boolean).length;
/** Bewertung (Bauern) aus Sicht der Farbe `side` */
async function evalFor(fen: string, side: 'w' | 'b', depth = 14) {
  const r = await engine.analyse(fen, { depth });
  const v = evalNumber(r.lines[0]);
  return side === 'w' ? v : -v;
}

/** Eine Stellung gegen den Computer ausspielen; Endspiele mit ≤ 7 Steinen gegen die Lichess-Datenbank. */
export default function ScenarioPlay({ sc, onDone, compact = false }: { sc: Scenario; onDone?: (ok: boolean) => void; compact?: boolean }) {
  const [fen, setFen] = useState(sc.fen);
  const [last, setLast] = useState<[string, string] | undefined>();
  const [status, setStatus] = useState<Status>('play');
  const [msg, setMsg] = useState('');
  const [myMoves, setMyMoves] = useState(0);
  const [tb, setTb] = useState('');
  const [hint, setHint] = useState<string[]>([]);
  const me = sc.side ?? new Chess(sc.fen).turn();
  const side = me === 'w' ? 'white' : 'black';
  const startEval = useRef<Promise<number> | null>(null);
  const alive = useRef(true);
  useEffect(() => () => void (alive.current = false), []);

  useEffect(() => {
    setFen(sc.fen);
    setLast(undefined);
    setStatus('play');
    setMsg('');
    setMyMoves(0);
    setHint([]);
    startEval.current = sc.goal === 'hold' ? evalFor(sc.fen, me) : null;
    const c = new Chess(sc.fen);
    if (c.turn() !== me) void reply(c).then(() => alive.current && setStatus('play'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sc]);

  useEffect(() => {
    if (pieces(new Chess(fen)) > 7) return setTb('');
    probe(fen).then((r) => alive.current && setTb(r ? tbLabel[r.category] ?? r.category : ''));
  }, [fen]);

  function end(ok: boolean, text: string) {
    if (!alive.current) return;
    setStatus(ok ? 'won' : 'lost');
    setMsg(text);
    if (ok) sound.good();
    else sound.bad();
    onDone?.(ok);
  }

  async function reply(c: Chess) {
    setStatus('thinking');
    let u: string | null = null;
    const r = pieces(c) <= 7 ? await probe(c.fen()) : null;
    if (r?.moves.length) u = r.moves[0].uci;
    else u = (await engine.analyse(c.fen(), { depth: sc.goal === 'hold' ? 12 : 18 })).best;
    const m = u ? tryMove(c, u) : null;
    if (m && alive.current) {
      setFen(c.fen());
      setLast([m.from, m.to]);
      m.captured ? sound.capture() : sound.move();
    }
    return m;
  }

  async function onMove(u: string) {
    if (status !== 'play') return;
    setHint([]);
    const c = new Chess(fen);
    const m = tryMove(c, u);
    if (!m) return;
    setFen(c.fen());
    setLast([m.from, m.to]);
    sound.move();
    const n = myMoves + 1;
    setMyMoves(n);
    const g = sc.goal;

    if (c.isCheckmate()) return end(true, 'Matt! Sauber gelöst.');
    if (c.isStalemate()) return end(g === 'draw', g === 'draw' ? 'Patt – Remis gehalten!' : 'Patt! Das ist nur Remis. Lass dem König immer ein Feld.');
    if (c.isDraw()) return end(g === 'draw', g === 'draw' ? 'Remis erreicht!' : 'Remis – der Vorteil ist weg.');
    if (g === 'promote' && m.promotion) {
      const r = await probe(c.fen());
      // Kategorie aus Sicht des Gegners (am Zug): „loss“ heißt, wir gewinnen
      if (!r || ['loss', 'blessed-loss'].includes(r.category)) return end(true, 'Umgewandelt – und die Stellung ist gewonnen!');
    }
    // Datenbank: verspielter Gewinn bzw. verlorenes Remis sofort melden
    const t = pieces(c) <= 7 ? await probe(c.fen()) : null;
    if (t && g !== 'hold') {
      if (g !== 'draw' && !['loss', 'blessed-loss'].includes(t.category))
        return end(false, `Nach ${sanDe(m.san)} ist die Stellung laut Datenbank nur noch „${tbLabel[t.category]}“. Versuch es neu.`);
      if (g === 'draw' && ['win', 'cursed-win'].includes(t.category)) return end(false, `Nach ${sanDe(m.san)} gewinnt der Gegner bei bestem Spiel. Versuch es neu.`);
    }
    if (n >= sc.limit) {
      if (g === 'draw') return end(true, `${sc.limit} Züge gehalten – Remis!`);
      if (g === 'hold') {
        setStatus('thinking');
        const [a, b] = await Promise.all([startEval.current ?? Promise.resolve(0), evalFor(c.fen(), me)]);
        const ok = b >= a - 1.2 || b >= 3;
        return end(ok, ok ? `Geschafft! Bewertung am Anfang ${fmt(a)}, jetzt ${fmt(b)} – du hast die Stellung gehalten.` : `Bewertung am Anfang ${fmt(a)}, jetzt ${fmt(b)}. Da ist unterwegs etwas verloren gegangen – schau dir die Partie mit „Analysieren“ an.`);
      }
      return end(false, `Zuglimit (${sc.limit}) erreicht. Versuch es effizienter.`);
    }
    await reply(c);
    if (!alive.current) return;
    if (c.isCheckmate()) return end(false, 'Du wurdest mattgesetzt.');
    if (c.isDraw()) return end(g === 'draw', g === 'draw' ? 'Remis erreicht!' : 'Remis.');
    if (g !== 'draw' && g !== 'hold' && pieces(c) <= 2) return end(false, 'Material weg – nur noch Remis.');
    setStatus('play');
  }

  async function getHint() {
    const r = pieces(new Chess(fen)) <= 7 ? await probe(fen) : null;
    let u = r?.moves[0]?.uci;
    if (!u) u = (await engine.analyse(fen, { depth: 16 })).best;
    if (u && alive.current) setHint([u.slice(0, 4)]);
  }

  const reset = () => {
    setFen(sc.fen);
    setLast(undefined);
    setStatus('play');
    setMsg('');
    setMyMoves(0);
    setHint([]);
    const c = new Chess(sc.fen);
    if (c.turn() !== me) void reply(c).then(() => alive.current && setStatus('play'));
  };

  return (
    <div className="trainer">
      <div className="board-col">
        <Board fen={fen} orientation={side} lastMove={last} movable={status === 'play' ? side : undefined} onMove={onMove} arrows={hint} />
      </div>
      <aside className="side">
        <div>
          <div className="kicker">Ausspielen · {GOAL_LABEL[sc.goal]} · {sc.goal === 'hold' || sc.goal === 'draw' ? '' : 'max. '}{sc.limit} Züge</div>
          {!compact && <h2>{sc.title}</h2>}
          <p className="mono" style={{ fontSize: 13 }}>
            {side === 'white' ? 'Du spielst Weiß' : 'Du spielst Schwarz'} · Züge: {myMoves}/{sc.limit}
            {tb && ` · Datenbank: ${tb}`}
            {status === 'thinking' && <> · <span className="spinner" /></>}
          </p>
        </div>
        <Explain text={sc.text} title={compact ? sc.title : "So geht's"} />
        {msg && <div className={'feedback ' + (status === 'won' ? 'good' : 'bad')}>{msg}</div>}
        <div className="row">
          <button className="btn small" onClick={reset}>Neu starten</button>
          {status === 'play' && <button className="btn small" onClick={getHint}>Tipp</button>}
          {status === 'lost' && <a className="btn small" href={'#/spielen/' + encodeURIComponent(fen)}>Analysieren / weiterspielen</a>}
        </div>
      </aside>
    </div>
  );
}

const fmt = (v: number) => (Math.abs(v) >= 50 ? (v > 0 ? 'Matt für dich' : 'Matt gegen dich') : (v > 0 ? '+' : '') + v.toFixed(1));
