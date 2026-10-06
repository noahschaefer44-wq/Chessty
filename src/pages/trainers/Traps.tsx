import { useState } from 'react';
import { Chess } from 'chess.js';
import Board from '../../components/Board';
import WrongMovePanel from '../../components/WrongMovePanel';
import { Rich } from '../../components/Explain';
import AutoNext from '../../components/AutoNext';
import { Head, TrainerDone } from './common';
import { TRAPS, type Trap } from '../../content/traps';
import { tryMove, sanDe } from '../../lib/chess';
import { useWrongMove } from '../../lib/useWrongMove';
import { engine, evalNumber } from '../../lib/engine';
import { addReview } from '../../lib/progress';
import { sound } from '../../lib/sound';

const ROUNDS = 8;

interface Q {
  trap: Trap;
  /** 'bestrafen': der Gegner ist hineingetappt; 'vermeiden': du stehst vor der Falle */
  mode: 'bestrafen' | 'vermeiden';
  fen: string;
}

function makeRound(): Q[] {
  const pool = [...TRAPS].sort(() => Math.random() - 0.5).slice(0, ROUNDS);
  return pool.map((trap) => {
    const mode = Math.random() < 0.5 ? 'bestrafen' : 'vermeiden';
    const c = new Chess();
    trap.line.slice(0, mode === 'bestrafen' ? trap.blunder + 1 : trap.blunder).forEach((m) => c.move(m));
    return { trap, mode, fen: c.fen() };
  });
}

/** Fallen-Trainer: gemischte Stellungen aus den Fallen-Lektionen – bestrafen oder vermeiden? */
export default function Traps() {
  const [qs, setQs] = useState<Q[]>([]);
  const [i, setI] = useState(-1);
  const [score, setScore] = useState(0);
  const [res, setRes] = useState<boolean | null>(null);
  const [fen, setFen] = useState('');
  const [checking, setChecking] = useState(false);
  const wm = useWrongMove();

  const start = () => {
    const r = makeRound();
    setQs(r);
    setI(0);
    setScore(0);
    setRes(null);
    setFen(r[0].fen);
    wm.clear();
  };
  const next = () => {
    if (i + 1 >= qs.length) {
      setI(qs.length);
      return;
    }
    setI(i + 1);
    setRes(null);
    setFen(qs[i + 1].fen);
    wm.clear();
  };

  if (i >= 0 && i >= qs.length) return <TrainerDone id="fallen" score={score} max={qs.length} unit="Fallen durchschaut" onAgain={start} />;
  const q = qs[i];

  async function onMove(u: string) {
    if (!q || res !== null || wm.wrong || checking) return;
    const c = new Chess(fen);
    const m = tryMove(c, u);
    if (!m) return;
    const t = q.trap;
    let ok: boolean;
    if (q.mode === 'bestrafen') {
      const want = [t.line[t.blunder + 1], ...(t.punish[0].alt ?? [])];
      ok = want.includes(m.san);
    } else if (m.san === t.line[t.blunder]) ok = false;
    else if (t.avoid.includes(m.san)) ok = true;
    else {
      // Anderer Zug: gut, solange er nicht deutlich schlechter als der empfohlene ist
      setChecking(true);
      const [a, b] = await Promise.all([engine.analyse(fen, { depth: 12 }), engine.analyse(c.fen(), { depth: 12 })]);
      setChecking(false);
      const me = new Chess(fen).turn() === 'w' ? 1 : -1;
      ok = evalNumber(b.lines[0]) * me >= evalNumber(a.lines[0]) * me - 0.8;
    }
    if (ok) {
      setFen(c.fen());
      setScore((s) => s + 1);
      setRes(true);
      sound.good();
      return;
    }
    setRes(false);
    sound.bad();
    addReview({ id: `falle:${t.id}:${q.mode}`, fen, solution: [new Chess(fen).move(q.mode === 'bestrafen' ? t.line[t.blunder + 1] : t.avoid[0]).lan], title: `Falle: ${t.name}`, source: 'Fallen-Trainer' });
    void wm.check(fen, u, undefined, { known: q.mode === 'vermeiden' && m.san === t.line[t.blunder] ? t.blunderWhy : undefined });
  }

  const side = q ? (new Chess(q.fen).turn() === 'w' ? 'white' : 'black') : 'white';
  const solutionSan = q ? (q.mode === 'bestrafen' ? q.trap.line[q.trap.blunder + 1] : q.trap.avoid[0]) : '';

  return (
    <div className="trainer">
      <div className="board-col">
        <Board fen={wm.view?.fen ?? (fen || '8/8/8/8/8/8/8/8 w - - 0 1')} lastMove={wm.view?.last} orientation={side}
          movable={q && res === null && !wm.wrong ? side : undefined} onMove={onMove} arrows={wm.view?.arrows ?? []} />
      </div>
      <aside className="side">
        <Head kicker={`Trainer · Fallen${q ? ` · ${i + 1}/${qs.length} · ${score} richtig` : ''}`} title={q ? (q.mode === 'bestrafen' ? 'Bestrafe den Fehler!' : 'Tappe nicht in die Falle!') : 'Fallen erkennen'}>
          {!q && <p className="muted">Stellungen aus {TRAPS.length} berühmten Eröffnungsfallen. Mal ist der Gegner hineingetappt und du musst zuschlagen, mal stehst du selbst davor und musst den sicheren Zug finden.</p>}
          {q && <p className="muted">{q.trap.opening}. {q.mode === 'bestrafen' ? 'Der Gegner hat gerade einen Fehler gemacht.' : 'Ein Zug sieht verlockend aus – aber Vorsicht.'}</p>}
        </Head>
        {!q && <button className="btn primary" style={{ alignSelf: 'flex-start' }} onClick={start}>Start <span className="arrow">→</span></button>}
        {checking && <p className="mono"><span className="spinner" /> prüfe Zug …</p>}
        {wm.wrong && <WrongMovePanel san={wm.wrong.san} known={wm.wrong.known} info={wm.wrong.info} loading={wm.wrong.loading} onReplay={wm.replay} />}
        {res === true && q && (
          <div className="feedback good">
            <b>✓ Richtig! </b>
            <Rich text={q.mode === 'bestrafen' ? q.trap.punish[0].success.short : q.trap.avoidWhy.short} />
            <p className="muted" style={{ fontSize: 13, marginBottom: 0 }}>Das war die {q.trap.name}.</p>
          </div>
        )}
        {res === false && q && (
          <>
            <div className="feedback bad"><b>✕ </b>Richtig wäre {sanDe(solutionSan)} gewesen. <a href={`#/lektion/${q.mode === 'bestrafen' ? 'f-' : 'fa-'}${q.trap.id}`}>Zur Lektion „{q.trap.name}“</a></div>
            <div className="row"><span className="spacer" /><button className="btn primary" onClick={next}>Weiter <span className="arrow">→</span></button></div>
          </>
        )}
        <AutoNext active={res === true} ms={3000} onNext={next} resetKey={i} label={i + 1 < qs.length ? 'Weiter' : 'Auswertung'} />
      </aside>
    </div>
  );
}
