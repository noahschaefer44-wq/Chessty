import { useEffect, useMemo, useState } from 'react';
import { Chess } from 'chess.js';
import Board from '../components/Board';
import { loadOpenings, type OpeningRow } from '../lib/openings';
import { tryMove, sanDe } from '../lib/chess';
import { EvalBar } from '../components/Widgets';
import { useEngine } from '../lib/useEngine';

export default function Explorer() {
  const [rows, setRows] = useState<OpeningRow[]>([]);
  const [moves, setMoves] = useState<string[]>([]);
  const [q, setQ] = useState('');
  const [engineOn, setEngineOn] = useState(false);
  useEffect(() => void loadOpenings().then(setRows), []);

  const { fen, last } = useMemo(() => {
    const c = new Chess();
    let last: [string, string] | undefined;
    for (const m of moves) {
      const r = c.move(m);
      last = [r.from, r.to];
    }
    return { fen: c.fen(), last };
  }, [moves]);
  const { lines, loading } = useEngine(fen, engineOn);

  const prefix = (r: OpeningRow) => moves.every((m, i) => r.moves[i] === m);
  const current = rows.filter((r) => r.moves.length === moves.length && prefix(r));
  const continuations = useMemo(() => {
    const map = new Map<string, OpeningRow[]>();
    for (const r of rows) if (r.moves.length > moves.length && prefix(r)) {
      const k = r.moves[moves.length];
      map.set(k, [...(map.get(k) ?? []), r]);
    }
    return [...map.entries()].sort((a, b) => b[1].length - a[1].length);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, moves]);
  const results = q.length >= 2 ? rows.filter((r) => (r.eco + ' ' + r.name).toLowerCase().includes(q.toLowerCase())).slice(0, 40) : [];

  function onMove(u: string) {
    const c = new Chess(fen);
    const m = tryMove(c, u);
    if (m) setMoves([...moves, m.san]);
  }

  return (
    <>
      <a className="back" href="#/eroeffnungen">← Eröffnungen</a>
      <div className="trainer">
        <div className="board-col">
          <Board fen={fen} lastMove={last} movable="both" onMove={onMove}
            arrows={[...continuations.slice(0, 4).map(([san]) => { const m = new Chess(fen).move(san); return '?' + m.from + m.to; }),
              ...(engineOn && lines[0] ? [lines[0].pv[0].slice(0, 4)] : [])]} />
          {engineOn && <EvalBar line={lines[0]} loading={loading} />}
        </div>
        <aside className="side">
          <div>
            <div className="kicker">Explorer · {rows.length} benannte Varianten (Lichess, CC0)</div>
            <h2>{current[0] ? current[0].name : moves.length ? 'Abseits der Theorie' : 'Grundstellung'}</h2>
            {current[0] && <span className="tag solid">{current[0].eco}</span>}
          </div>
          <input type="search" placeholder="Suche: Najdorf, Caro-Kann, B90 …" value={q} onChange={(e) => setQ(e.target.value)} />
          {results.length > 0 && (
            <div className="list" style={{ maxHeight: 300, overflow: 'auto' }}>
              {results.map((r) => (
                <button key={r.eco + r.name + r.moves.join()} onClick={() => { setMoves(r.moves); setQ(''); }}>
                  <span className="mono" style={{ width: 40 }}>{r.eco}</span>
                  <span>{r.name}</span>
                </button>
              ))}
            </div>
          )}
          <div className="panel">
            <div className="panel-head"><b>Zugfolge</b></div>
            <div className="movelist">
              {moves.length === 0 && <span className="muted">Zieh auf dem Brett oder suche eine Eröffnung.</span>}
              {moves.map((m, i) => (
                <button key={i} onClick={() => setMoves(moves.slice(0, i + 1))} className={i === moves.length - 1 ? 'cur' : ''}>
                  {i % 2 === 0 ? `${i / 2 + 1}. ` : ''}{sanDe(m)}
                </button>
              ))}
            </div>
          </div>
          <div className="panel">
            <div className="panel-head"><b>Fortsetzungen</b><span className="spacer" /><span className="mono" style={{ fontSize: 12 }}>Varianten</span></div>
            <div className="list" style={{ border: 0, maxHeight: 280, overflow: 'auto' }}>
              {continuations.map(([san, rs]) => (
                <button key={san} onClick={() => setMoves([...moves, san])}>
                  <b className="mono" style={{ width: 60 }}>{sanDe(san)}</b>
                  <span style={{ flex: 1, fontSize: 13 }}>{rs.sort((a, b) => a.moves.length - b.moves.length)[0].name}</span>
                  <span className="mono">{rs.length}</span>
                </button>
              ))}
              {!continuations.length && <p className="muted" style={{ padding: 12 }}>Keine weiteren benannten Varianten.</p>}
            </div>
          </div>
          <div className="row">
            <button className="btn small" onClick={() => setMoves(moves.slice(0, -1))} disabled={!moves.length}>← Zurück</button>
            <button className="btn small" onClick={() => setMoves([])}>Grundstellung</button>
            <button className="btn small" onClick={() => setEngineOn((e) => !e)}>{engineOn ? 'Engine aus' : 'Engine an'}</button>
          </div>
        </aside>
      </div>
    </>
  );
}
