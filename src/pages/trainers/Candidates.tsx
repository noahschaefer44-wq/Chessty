import { useState } from 'react';
import { Chess } from 'chess.js';
import Board from '../../components/Board';
import { Head, TrainerDone } from './common';
import { randomPositions, type Pos } from '../../lib/trainerData';
import { engine, formatEval, type EngineLine } from '../../lib/engine';
import { uciToSan, sanDe, tryMove } from '../../lib/chess';
import { sound } from '../../lib/sound';

const ROUNDS = 6;

/** Kandidatenzüge: erst 3 Kandidaten wählen, dann zeigt die Engine, ob der beste dabei war. */
export default function Candidates() {
  const [list, setList] = useState<Pos[]>([]);
  const [i, setI] = useState(-1);
  const [cands, setCands] = useState<string[]>([]);
  const [lines, setLines] = useState<EngineLine[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  async function start() {
    setList(await randomPositions(ROUNDS, () => true, 1000, 2100));
    setI(0);
    setScore(0);
    setCands([]);
    setLines(null);
    setDone(false);
  }
  if (done) return <TrainerDone id="kandidaten" score={score} max={ROUNDS} unit="Mal war der beste Zug dabei" onAgain={start} />;
  const pos = list[i];
  const side = pos ? (new Chess(pos.fen).turn() === 'w' ? 'white' : 'black') : 'white';

  function onMove(u: string) {
    if (!pos || lines || cands.length >= 3) return;
    if (!tryMove(new Chess(pos.fen), u) || cands.includes(u)) return;
    setCands((c) => [...c, u]);
    sound.move();
  }
  async function evaluate() {
    if (!pos) return;
    setLoading(true);
    const r = await engine.analyse(pos.fen, { depth: 14, multipv: 3 });
    setLines(r.lines);
    setLoading(false);
    const hit = cands.includes(r.lines[0].pv[0]) || cands.includes(pos.line[0]);
    if (hit) {
      setScore((s) => s + 1);
      sound.good();
    } else sound.bad();
  }

  return (
    <div className="trainer">
      <div className="board-col">
        {pos ? <Board fen={pos.fen} orientation={side} movable={lines || cands.length >= 3 ? undefined : side} onMove={onMove}
          arrows={lines ? [lines[0].pv[0].slice(0, 4), ...cands.filter((c) => c !== lines[0].pv[0]).map((c) => '!' + c)] : cands.map((c) => '?' + c)} /> : <Board fen="8/8/8/8/8/8/8/8 w - - 0 1" />}
      </div>
      <aside className="side">
        <Head kicker="Trainer · Kandidatenzüge" title="Erst sammeln, dann rechnen">
          <p className="muted">Zieh bis zu drei Züge, die du ernsthaft prüfen würdest (Schachs, Schläge, Drohungen!). Das Brett springt nach jedem Zug zurück. Dann verrät die Engine die besten drei.</p>
        </Head>
        {i < 0 ? <button className="btn primary" style={{ alignSelf: 'flex-start' }} onClick={start}>Start <span className="arrow">→</span></button> : pos && (
          <>
            <p className="mono">Stellung {i + 1}/{ROUNDS} · Treffer {score} · {side === 'white' ? 'Weiß' : 'Schwarz'} am Zug</p>
            <div className="list">
              {cands.map((c, k) => <div key={c}><b className="mono">K{k + 1}</b> {sanDe(uciToSan(pos.fen, c))}</div>)}
              {!cands.length && <div className="muted">Noch keine Kandidaten.</div>}
            </div>
            {lines && (
              <div className="panel">
                <div className="panel-head"><b>Engine</b></div>
                <div className="list" style={{ border: 0 }}>
                  {lines.map((l, k) => <div key={k}><b className="mono">{k + 1}.</b> {sanDe(uciToSan(pos.fen, l.pv[0]))} <span className="mono muted">{formatEval(l)}</span>{cands.includes(l.pv[0]) && ' ✓'}</div>)}
                </div>
              </div>
            )}
            <div className="row">
              {!lines && <button className="btn small" onClick={() => setCands([])} disabled={!cands.length}>Zurücksetzen</button>}
              {!lines && <button className="btn primary" onClick={evaluate} disabled={!cands.length || loading}>{loading ? 'Rechne …' : 'Auswerten'}</button>}
              {lines && <button className="btn primary" onClick={() => (i + 1 < ROUNDS ? (setI(i + 1), setCands([]), setLines(null)) : setDone(true))}>{i + 1 < ROUNDS ? 'Weiter' : 'Auswertung'} <span className="arrow">→</span></button>}
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
