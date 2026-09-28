import { useEffect, useMemo, useState } from 'react';
import { Chess } from 'chess.js';
import Board from '../components/Board';
import { EvalBar } from '../components/Widgets';
import { engine } from '../lib/engine';
import { tryMove, sanDe, parseUci, material } from '../lib/chess';
import { useEngine } from '../lib/useEngine';
import { update, addXp, useProgress } from '../lib/progress';
import { sound } from '../lib/sound';
import { openingName } from '../lib/openings';

interface Bot {
  id: string;
  name: string;
  elo: string;
  desc: string;
  skill: number;
  depth: number;
  /** Wahrscheinlichkeit für einen Zufallszug (macht Anfänger-Bots menschlicher) */
  random: number;
}

const BOTS: Bot[] = [
  { id: 'bauer', name: 'Bauer Bruno', elo: '~400', desc: 'Zieht oft planlos und übersieht Figuren. Perfekt für die ersten Partien.', skill: 0, depth: 1, random: 0.45 },
  { id: 'springer', name: 'Springer Sina', elo: '~800', desc: 'Kennt die Regeln, aber hängt manchmal Figuren ein.', skill: 1, depth: 2, random: 0.2 },
  { id: 'laeufer', name: 'Läufer Leo', elo: '~1200', desc: 'Solider Vereinsanfänger. Bestraft grobe Fehler.', skill: 4, depth: 4, random: 0.05 },
  { id: 'turm', name: 'Turm Tara', elo: '~1600', desc: 'Starker Clubspieler mit gutem Taktikblick.', skill: 8, depth: 8, random: 0 },
  { id: 'dame', name: 'Dame Doris', elo: '~2000', desc: 'Experte. Spielt positionell und taktisch sauber.', skill: 13, depth: 12, random: 0 },
  { id: 'koenig', name: 'König Karl', elo: '2500+', desc: 'Großmeister-Niveau. Viel Glück.', skill: 20, depth: 16, random: 0 },
];

export default function Play() {
  const p = useProgress();
  const [bot, setBot] = useState<Bot | null>(null);
  const [color, setColor] = useState<'white' | 'black'>('white');
  const [history, setHistory] = useState<string[]>([]);
  const [thinking, setThinking] = useState(false);
  const [helper, setHelper] = useState(false);
  const [result, setResult] = useState('');
  const [name, setName] = useState('');

  const game = useMemo(() => {
    const c = new Chess();
    for (const m of history) c.move(m);
    return c;
  }, [history]);
  const fen = game.fen();
  const lastMv = game.history({ verbose: true }).at(-1);
  const myTurn = (game.turn() === 'w' ? 'white' : 'black') === color;
  const { lines, loading } = useEngine(fen, helper && !!bot && myTurn && !result, 14);

  useEffect(() => {
    openingName(history.slice(0, 16)).then(setName);
  }, [history]);

  function checkEnd(c: Chess) {
    if (!c.isGameOver()) return false;
    let r = 'Remis';
    let key: 'w' | 'd' | 'l' = 'd';
    if (c.isCheckmate()) {
      const winner = c.turn() === 'w' ? 'black' : 'white';
      r = winner === color ? 'Du gewinnst durch Matt!' : `${bot?.name} gewinnt durch Matt.`;
      key = winner === color ? 'w' : 'l';
    } else if (c.isStalemate()) r = 'Patt – Remis.';
    else if (c.isThreefoldRepetition()) r = 'Dreifache Wiederholung – Remis.';
    else if (c.isInsufficientMaterial()) r = 'Zu wenig Material – Remis.';
    finishGame(r, key);
    return true;
  }

  function finishGame(r: string, key: 'w' | 'd' | 'l') {
    setResult(r);
    if (!bot) return;
    key === 'w' ? sound.good() : key === 'l' && sound.bad();
    update((pr) => {
      const b = pr.botResults[bot.id] ?? { w: 0, d: 0, l: 0 };
      return { ...pr, botResults: { ...pr.botResults, [bot.id]: { ...b, [key]: b[key] + 1 } } };
    });
    addXp(key === 'w' ? 15 + BOTS.indexOf(bot) * 5 : key === 'd' ? 8 : 3);
  }

  // Bot zieht
  useEffect(() => {
    if (!bot || myTurn || result || game.isGameOver()) return;
    let alive = true;
    setThinking(true);
    (async () => {
      let u: string;
      const legal = game.moves({ verbose: true });
      if (Math.random() < bot.random) {
        const mv = legal[Math.floor(Math.random() * legal.length)];
        u = mv.from + mv.to + (mv.promotion ?? '');
        await new Promise((r) => setTimeout(r, 400));
      } else {
        const r = await engine.analyse(fen, { depth: bot.depth, skill: bot.skill });
        u = r.best;
        await new Promise((r) => setTimeout(r, 250));
      }
      if (!alive) return;
      const c = new Chess(fen);
      const m = tryMove(c, u);
      setThinking(false);
      if (!m) return;
      m.captured ? sound.capture() : sound.move();
      setHistory((h) => [...h, m.san]);
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fen, bot, myTurn, result]);

  useEffect(() => {
    if (bot && history.length) checkEnd(game);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history]);

  function onMove(u: string) {
    if (!myTurn || result) return;
    const c = new Chess(fen);
    const m = tryMove(c, u);
    if (!m) return;
    m.captured ? sound.capture() : sound.move();
    setHistory([...history, m.san]);
  }

  if (!bot) {
    return (
      <>
        <div className="page-head">
          <div className="kicker">Übung macht den Meister</div>
          <h1>Gegen Bots spielen</h1>
          <p className="muted">Sechs Stufen, vom Anfänger bis zum Großmeister. Mit Tipp-Modus und anschließender Analyse.</p>
          <div className="seg">
            <button className={color === 'white' ? 'on' : ''} onClick={() => setColor('white')}>Mit Weiß</button>
            <button className={color === 'black' ? 'on' : ''} onClick={() => setColor('black')}>Mit Schwarz</button>
          </div>
        </div>
        <div className="grid">
          {BOTS.map((b, i) => {
            const r = p.botResults[b.id];
            return (
              <button key={b.id} className={'card' + (i === 5 ? ' inverse' : '')} onClick={() => { setBot(b); setHistory([]); setResult(''); }}>
                <div className="kicker">Elo {b.elo}</div>
                <h3>{b.name}</h3>
                <p className="muted" style={{ fontSize: 14 }}>{b.desc}</p>
                {r && <span className="mono" style={{ fontSize: 12 }}>S {r.w} · R {r.d} · N {r.l}</span>}
              </button>
            );
          })}
        </div>
      </>
    );
  }

  const mat = material(game);
  const diff = mat.white - mat.black;
  const pgn = game.pgn();
  const best = lines[0]?.pv[0];

  return (
    <>
      <button className="back" style={{ background: 'none', border: 0, cursor: 'pointer', padding: 0 }} onClick={() => setBot(null)}>← Bot wählen</button>
      <div className="trainer">
        <div className="board-col">
          <Board fen={fen} orientation={color} movable={!result && myTurn ? color : undefined} onMove={onMove}
            lastMove={lastMv ? [lastMv.from, lastMv.to] : undefined} arrows={helper && best && myTurn ? [best.slice(0, 4)] : []} />
          {helper && <EvalBar line={lines[0]} loading={loading} />}
        </div>
        <aside className="side">
          <div>
            <div className="kicker">Gegner · Elo {bot.elo}</div>
            <h2>{bot.name}</h2>
            <p className="mono" style={{ fontSize: 13, margin: 0 }}>
              {thinking ? <><span className="spinner" /> denkt …</> : result ? 'Partie beendet' : myTurn ? 'Du bist am Zug' : ''}
              {diff !== 0 && ` · Material ${diff > 0 ? 'Weiß' : 'Schwarz'} +${Math.abs(diff)}`}
            </p>
            {name && <p className="muted" style={{ fontSize: 13 }}>{name}</p>}
          </div>
          {result && <div className="feedback good"><b>{result}</b></div>}
          {helper && best && myTurn && !result && (
            <div className="panel"><div className="panel-body">Tipp: <b>{sanDe(new Chess(fen).move(parseUci(best))?.san ?? '')}</b> – der Pfeil zeigt den Zug der Engine.</div></div>
          )}
          <div className="panel">
            <div className="panel-head"><b>Züge</b></div>
            <div className="movelist">
              {history.map((s, i) => <span key={i}>{i % 2 === 0 && <span className="n">{i / 2 + 1}.</span>} {sanDe(s)}</span>)}
            </div>
          </div>
          <div className="row">
            <button className="btn small" onClick={() => setHelper((h) => !h)}>{helper ? 'Tipps aus' : 'Tipps an'}</button>
            <button className="btn small" disabled={history.length < 2 || !!result} onClick={() => setHistory(history.slice(0, myTurn ? -2 : -1))}>Zug zurück</button>
            {!result && <button className="btn small" onClick={() => finishGame('Du hast aufgegeben.', 'l')}>Aufgeben</button>}
            <span className="spacer" />
            {result && (
              <>
                <button className="btn small" onClick={() => { setHistory([]); setResult(''); }}>Revanche</button>
                <button className="btn primary small" onClick={() => {
                  try { sessionStorage.setItem('chessty.analyse', pgn); } catch { /* egal */ }
                  location.hash = '#/analyse';
                }}>Analysieren <span className="arrow">→</span></button>
              </>
            )}
          </div>
        </aside>
      </div>
    </>
  );
}
