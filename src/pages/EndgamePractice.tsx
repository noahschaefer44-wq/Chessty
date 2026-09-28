import { useEffect, useState } from 'react';
import { Chess } from 'chess.js';
import Board from '../components/Board';
import Explain from '../components/Explain';
import { practiceById } from '../content/practice';
import { probe, tbLabel } from '../lib/tablebase';
import { engine } from '../lib/engine';
import { tryMove, sanDe } from '../lib/chess';
import { completeLesson } from '../lib/progress';
import { sound } from '../lib/sound';

type Status = 'play' | 'won' | 'lost' | 'thinking';

export default function EndgamePractice({ id }: { id: string }) {
  const pr = practiceById(id);
  const [fen, setFen] = useState(pr?.fen ?? '');
  const [last, setLast] = useState<[string, string] | undefined>();
  const [status, setStatus] = useState<Status>('play');
  const [msg, setMsg] = useState('');
  const [myMoves, setMyMoves] = useState(0);
  const [tb, setTb] = useState('');
  const [hint, setHint] = useState<string[]>([]);
  const side = pr ? (new Chess(pr.fen).turn() === 'w' ? 'white' : 'black') : 'white';

  useEffect(() => {
    probe(fen).then((r) => setTb(r ? tbLabel[r.category] ?? r.category : navigator.onLine ? '' : 'offline'));
  }, [fen]);

  if (!pr) return <p>Übung nicht gefunden.</p>;

  function end(ok: boolean, text: string) {
    setStatus(ok ? 'won' : 'lost');
    setMsg(text);
    if (ok) {
      sound.good();
      completeLesson('practice:' + pr!.id, 3, 20);
    } else sound.bad();
  }

  async function reply(c: Chess) {
    setStatus('thinking');
    let u: string | null = null;
    const r = await probe(c.fen());
    if (r?.moves.length) u = r.moves[0].uci;
    else {
      const e = await engine.analyse(c.fen(), { depth: 18 });
      u = e.best;
    }
    const m = u ? tryMove(c, u) : null;
    if (m) {
      setFen(c.fen());
      setLast([m.from, m.to]);
      m.captured ? sound.capture() : sound.move();
    }
    return m;
  }

  async function onMove(u: string) {
    if (status !== 'play' || !pr) return;
    setHint([]);
    const c = new Chess(fen);
    const m = tryMove(c, u);
    if (!m) return;
    setFen(c.fen());
    setLast([m.from, m.to]);
    sound.move();
    const n = myMoves + 1;
    setMyMoves(n);

    if (c.isCheckmate()) return end(true, 'Matt! Sauber gelöst.');
    if (c.isStalemate()) return end(pr.goal === 'draw', pr.goal === 'draw' ? 'Patt – Remis gehalten!' : 'Patt! Das ist nur Remis. Achte darauf, dem König ein Feld zu lassen.');
    if (c.isDraw()) return end(pr.goal === 'draw', pr.goal === 'draw' ? 'Remis erreicht!' : 'Remis – der Vorteil ist weg.');
    if (pr.goal === 'promote' && m.promotion) {
      const r = await probe(c.fen());
      const lost = r && r.category !== 'loss' && r.category !== 'blessed-loss';
      if (!lost) return end(true, 'Umgewandelt – und die Stellung ist gewonnen!');
    }
    // Prüfen, ob der Vorteil verspielt wurde (nur mit Datenbank sicher möglich)
    const t = await probe(c.fen());
    if (t) {
      if (pr.goal !== 'draw' && !['loss', 'blessed-loss'].includes(t.category)) {
        setMsg(`Achtung: Nach ${sanDe(m.san)} ist die Stellung laut Datenbank nur noch „${tbLabel[t.category]}“. Versuch es neu.`);
        setStatus('lost');
        sound.bad();
        return;
      }
      if (pr.goal === 'draw' && ['win', 'cursed-win'].includes(t.category)) {
        setMsg(`Nach ${sanDe(m.san)} gewinnt der Gegner bei bestem Spiel. Versuch es neu.`);
        setStatus('lost');
        sound.bad();
        return;
      }
    }
    if (n >= pr.limit) {
      if (pr.goal === 'draw') return end(true, `${pr.limit} Züge gehalten – Remis!`);
      return end(false, `Zuglimit (${pr.limit}) erreicht. Versuch es effizienter.`);
    }
    const r = await reply(c);
    if (c.isCheckmate()) return end(false, 'Du wurdest mattgesetzt.');
    if (c.isDraw()) return end(pr.goal === 'draw', pr.goal === 'draw' ? 'Remis erreicht!' : 'Remis.');
    if (r?.captured && pr.goal !== 'draw' && c.board().flat().filter(Boolean).length <= 2) return end(false, 'Material weg – nur noch Remis.');
    setStatus('play');
  }

  async function getHint() {
    const r = await probe(fen);
    let u = r?.moves[0]?.uci;
    if (!u) u = (await engine.analyse(fen, { depth: 18 })).best;
    if (u) setHint([u.slice(0, 4)]);
  }

  const reset = () => {
    setFen(pr.fen);
    setLast(undefined);
    setStatus('play');
    setMsg('');
    setMyMoves(0);
    setHint([]);
  };

  return (
    <>
      <a className="back" href="#/endspiele">← Endspiele</a>
      <div className="trainer">
        <div className="board-col">
          <Board fen={fen} orientation={side} lastMove={last} movable={status === 'play' ? side : undefined} onMove={onMove}
            arrows={hint} />
        </div>
        <aside className="side">
          <div>
            <div className="kicker">Praxis · {pr.goal === 'mate' ? 'Setze matt' : pr.goal === 'promote' ? 'Wandle sicher um' : 'Halte Remis'} · max. {pr.limit} Züge</div>
            <h2>{pr.title}</h2>
            <p className="mono" style={{ fontSize: 13 }}>
              Züge: {myMoves}/{pr.limit}
              {tb && ` · Datenbank: ${tb}`}
              {status === 'thinking' && <> · <span className="spinner" /></>}
            </p>
          </div>
          <Explain text={pr.text} title="So geht's" />
          {msg && <div className={'feedback ' + (status === 'won' ? 'good' : 'bad')}>{msg}</div>}
          <div className="row">
            <button className="btn small" onClick={reset}>Neu starten</button>
            {status === 'play' && <button className="btn small" onClick={getHint}>Tipp</button>}
            <span className="spacer" />
            {status === 'won' && <a className="btn primary" href="#/endspiele">Weiter <span className="arrow">→</span></a>}
          </div>
        </aside>
      </div>
    </>
  );
}
