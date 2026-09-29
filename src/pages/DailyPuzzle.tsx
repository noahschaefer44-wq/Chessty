import { useEffect, useRef, useState } from 'react';
import { Chess } from 'chess.js';
import PuzzleBoard from '../components/PuzzleBoard';
import { loadDb, type Puzzle } from '../lib/puzzles';
import { today, addXp, recordPuzzle } from '../lib/progress';
import { dailySubmit, dailyBoard } from '../lib/cloud';
import { useAccount } from '../lib/useAccount';
import { themeName } from '../content/themes';

const KEY = 'chessty.daily';

/** Ein Puzzle pro Tag – für alle gleich, ein Versuch, auf Zeit. */
export default function DailyPuzzle() {
  const a = useAccount();
  const day = today();
  const [pz, setPz] = useState<Puzzle | null>(null);
  const [res, setRes] = useState<{ solved: boolean; ms: number } | null>(() => {
    try {
      const d = JSON.parse(localStorage.getItem(KEY) ?? '{}');
      return d.day === day ? d.res : null;
    } catch {
      return null;
    }
  });
  const [board, setBoard] = useState<{ name: string; solved: boolean; ms: number }[] | null>(null);
  const t0 = useRef(0);

  useEffect(() => {
    loadDb().then((db) => {
      // Aus dem Datum abgeleitet: alle bekommen dasselbe Puzzle (Wertung 1300–1900)
      const pool = db.puzzles.filter((p) => p[3] >= 1300 && p[3] <= 1900);
      let h = 0;
      for (const ch of day) h = (h * 131 + ch.charCodeAt(0)) >>> 0;
      const p = pool[h % pool.length];
      setPz({ id: p[0], fen: p[1], moves: p[2].split(' '), rating: p[3], themes: p[4] });
      t0.current = Date.now();
    });
  }, [day]);

  const loadBoard = () => dailyBoard(day).then(setBoard).catch(() => setBoard([]));
  useEffect(() => {
    if (res) void loadBoard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [res]);

  function onResult(ok: boolean) {
    const r = { solved: ok, ms: Date.now() - t0.current };
    setRes(r);
    try {
      localStorage.setItem(KEY, JSON.stringify({ day, res: r }));
    } catch { /* egal */ }
    if (pz) recordPuzzle(pz.id, pz.rating, pz.themes, ok);
    if (ok) addXp(15);
    void dailySubmit(day, ok, r.ms).then(loadBoard).catch(() => undefined);
  }

  if (!pz) return <p className="mono"><span className="spinner" /> Lade Tagespuzzle …</p>;
  const side = new Chess(pz.fen).turn() === 'w' ? 'Schwarz' : 'Weiß';

  return (
    <div className="trainer">
      <div className="board-col">
        {res ? <PuzzleBoard puzzle={pz} onResult={() => undefined} key="done" /> : <PuzzleBoard puzzle={pz} onResult={onResult} />}
      </div>
      <aside className="side">
        <div>
          <a className="back" href="#/community">← Community</a>
          <div className="kicker">Tagespuzzle · {new Date().toLocaleDateString('de-DE')}</div>
          <h2>{side} am Zug</h2>
          <p className="muted">Ein Versuch. Die Zeit läuft ab dem ersten Zug des Gegners.{!a && ' Für die Rangliste brauchst du ein (kostenloses) Konto.'}</p>
        </div>
        {res && (
          <div className={'feedback ' + (res.solved ? 'good' : 'bad')}>
            {res.solved ? `✓ Gelöst in ${(res.ms / 1000).toFixed(1)} s!` : '✕ Leider nicht. Morgen gibt es ein neues Puzzle.'} Motiv: {pz.themes.map(themeName).slice(0, 3).join(', ')}
          </div>
        )}
        {res && (
          <div className="panel">
            <div className="panel-head"><b>Rangliste heute</b></div>
            <div className="list" style={{ border: 0 }}>
              {(board ?? []).map((r, i) => (
                <div key={i}>
                  <b className="mono" style={{ width: 30 }}>{i + 1}.</b>
                  <span style={{ flex: 1 }}>{r.name}</span>
                  <span className="mono">{r.solved ? `${(r.ms / 1000).toFixed(1)} s` : '✕'}</span>
                </div>
              ))}
              {board && !board.length && <div className="muted">Noch keine Einträge (oder offline).</div>}
              {!board && <div className="mono"><span className="spinner" /></div>}
            </div>
          </div>
        )}
        {res && !a && <a className="btn" href="#/community">Konto anlegen</a>}
      </aside>
    </div>
  );
}
