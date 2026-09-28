import { useState } from 'react';
import { Chess } from 'chess.js';
import Board from '../../components/Board';
import { Head, TrainerDone } from './common';
import { randomPositions, nullMove, type Pos } from '../../lib/trainerData';
import { engine } from '../../lib/engine';
import { uciToSan, sanDe, tryMove } from '../../lib/chess';
import { sound } from '../../lib/sound';

const ROUNDS = 8;

/** „Was droht?“ – Zieh den stärksten Zug des Gegners, als wärst du nicht am Zug. */
export default function Threat() {
  const [list, setList] = useState<(Pos & { nm: string })[]>([]);
  const [i, setI] = useState(-1);
  const [loading, setLoading] = useState(false);
  const [res, setRes] = useState<{ ok: boolean; mine: string; best: string } | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  async function start() {
    const ps = await randomPositions(ROUNDS, (p) => !!nullMove(p.fen), 900, 2000);
    setList(ps.map((p) => ({ ...p, nm: nullMove(p.fen)! })));
    setI(0);
    setScore(0);
    setRes(null);
    setDone(false);
  }
  if (done) return <TrainerDone id="droht" score={score} max={ROUNDS} unit="Drohungen erkannt" onAgain={start} />;
  const pos = list[i];
  const threatSide = pos ? (new Chess(pos.nm).turn() === 'w' ? 'white' : 'black') : 'white';
  const mySide = threatSide === 'white' ? 'black' : 'white';

  async function onMove(u: string) {
    if (!pos || res || loading) return;
    const c = new Chess(pos.nm);
    if (!tryMove(c, u)) return;
    setLoading(true);
    // Engine vergleicht: Ist der Zug so stark wie die beste Drohung?
    const r = await engine.analyse(pos.nm, { depth: 12, multipv: 3 });
    const bestScore = r.lines[0];
    const mine = r.lines.find((l) => l.pv[0] === u);
    const ok = u === r.best || (!!mine && Math.abs((mine.cp ?? (mine.mate ?? 0) * 100) - (bestScore.cp ?? (bestScore.mate ?? 0) * 100)) < 0.6);
    setRes({ ok, mine: u, best: r.best });
    setLoading(false);
    if (ok) {
      setScore((s) => s + 1);
      sound.good();
    } else sound.bad();
  }

  return (
    <div className="trainer">
      <div className="board-col">
        {pos ? (
          <Board fen={res ? pos.nm : pos.nm} orientation={mySide} movable={res ? undefined : threatSide} onMove={onMove}
            arrows={res ? [res.best.slice(0, 4), ...(res.ok ? [] : ['!' + res.mine])] : []} />
        ) : <Board fen="8/8/8/8/8/8/8/8 w - - 0 1" />}
      </div>
      <aside className="side">
        <Head kicker="Trainer · Was droht?" title="Denk wie dein Gegner">
          <p className="muted">Stell dir vor, du passt. Was wäre der stärkste Zug deines Gegners? Zieh ihn mit den gegnerischen Figuren. Diese Frage vor jedem Zug verhindert die meisten Patzer.</p>
        </Head>
        {i < 0 ? <button className="btn primary" style={{ alignSelf: 'flex-start' }} onClick={start}>Start <span className="arrow">→</span></button> : pos && (
          <>
            <p className="mono">Stellung {i + 1}/{ROUNDS} · {score} erkannt · du spielst {mySide === 'white' ? 'Weiß' : 'Schwarz'}</p>
            {loading && <p className="mono"><span className="spinner" /> Engine prüft …</p>}
            {res && (
              <div className={'feedback ' + (res.ok ? 'good' : 'bad')}>
                {res.ok ? '✓ Genau das droht!' : `✕ Die größte Drohung ist ${sanDe(uciToSan(pos.nm, res.best))}.`}
              </div>
            )}
            {res && (
              <button className="btn primary" style={{ alignSelf: 'flex-start' }} onClick={() => (i + 1 < ROUNDS ? (setI(i + 1), setRes(null)) : setDone(true))}>
                {i + 1 < ROUNDS ? 'Weiter' : 'Auswertung'} <span className="arrow">→</span>
              </button>
            )}
          </>
        )}
      </aside>
    </div>
  );
}
