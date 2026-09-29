import { useEffect, useRef, useState } from 'react';
import { useAdmin, registerAdminActions } from '../lib/admin';
import { Chess } from 'chess.js';
import Board from '../components/Board';
import Explain from '../components/Explain';
import { EvalBar } from '../components/Widgets';
import { themeById, themeName } from '../content/themes';
import { pickRound, BAND_NAMES, MAX_PER_ROUND, type Puzzle } from '../lib/puzzles';
import { addReview, addXp, recordPuzzle, useProgress, getProgress, loseHeart, bumpTotal, heartsNow } from '../lib/progress';
import { confetti } from '../lib/confetti';
import NoHearts from '../components/NoHearts';
import { parseUci, tryMove, sanDe, uciToSan } from '../lib/chess';
import { useEngine } from '../lib/useEngine';
import { sound } from '../lib/sound';
import { useWrongMove } from '../lib/useWrongMove';
import WrongMovePanel from '../components/WrongMovePanel';

type State = 'loading' | 'playing' | 'solved' | 'failed' | 'done';
const RUSH_TIME = 180;

export default function PuzzleSession({ theme, mode }: { theme: string; mode?: string }) {
  const rush = theme === 'rush';
  const band = Number(mode ?? 0);
  const p = useProgress();
  const [round, setRound] = useState<Puzzle[]>([]);
  const [i, setI] = useState(0);
  const [ply, setPly] = useState(1);
  const [fen, setFen] = useState('');
  const [last, setLast] = useState<[string, string] | undefined>();
  const [state, setState] = useState<State>('loading');
  const [results, setResults] = useState<boolean[]>([]);
  const [arrows, setArrows] = useState<string[]>([]);
  const [flash, setFlash] = useState('');
  const [explore, setExplore] = useState(false);
  const [time, setTime] = useState(RUSH_TIME);
  const failedThis = useRef(false);
  const wm = useWrongMove();

  const pz = round[i];
  const orientation = pz ? (new Chess(pz.fen).turn() === 'w' ? 'black' : 'white') : 'white';

  useEffect(() => {
    pickRound(theme, band, getProgress().puzzleSeen, rush).then((r) => {
      setRound(r);
      setState('playing');
    });
  }, [theme, band, rush]);

  // Puzzle starten: der erste Zug gehört dem Gegner
  useEffect(() => {
    if (!pz) return;
    failedThis.current = false;
    wm.clear();
    setExplore(false);
    setArrows([]);
    setPly(1);
    setFen(pz.fen);
    setLast(undefined);
    const t = setTimeout(() => {
      const c = new Chess(pz.fen);
      const m = c.move(parseUci(pz.moves[0]));
      setFen(c.fen());
      setLast([m.from, m.to]);
      sound.move();
    }, 500);
    setState('playing');
    return () => clearTimeout(t);
  }, [pz]);

  // Rush-Uhr
  useEffect(() => {
    if (!rush || state === 'done' || state === 'loading') return;
    const t = setInterval(() => setTime((x) => x - 1), 1000);
    return () => clearInterval(t);
  }, [rush, state]);
  useEffect(() => {
    if (rush && time <= 0 && state !== 'done') setState('done');
  }, [time, rush, state]);

  const { lines, loading } = useEngine(fen, explore);

  const blink = (k: string) => {
    setFlash('');
    requestAnimationFrame(() => setFlash(k));
    setTimeout(() => setFlash(''), 600);
  };

  function finishPuzzle(ok: boolean) {
    recordPuzzle(pz.id, pz.rating, pz.themes, ok);
    if (ok) addXp(rush ? 3 : 5);
    else loseHeart();
    setResults((r) => [...r, ok]);
    if (!ok)
      addReview({
        id: 'puzzle:' + pz.id,
        fen: pz.fen,
        solution: pz.moves,
        title: `Puzzle ${pz.id} · ${pz.themes.map(themeName).slice(0, 2).join(', ')}`,
        source: 'Taktik',
      });
  }

  function onMove(u: string) {
    if (!pz) return;
    if (explore) {
      const c = new Chess(fen);
      const m = tryMove(c, u);
      if (m) {
        setFen(c.fen());
        setLast([m.from, m.to]);
      }
      return;
    }
    if (state !== 'playing' || wm.wrong) return;
    const expected = pz.moves[ply];
    const c = new Chess(fen);
    const m = tryMove(c, u);
    if (!m) return;
    // Jedes Matt zählt als Lösung, auch wenn es nicht der Datenbankzug ist
    const ok = u === expected || c.isCheckmate();
    if (!ok) {
      sound.bad();
      blink('flash-bad');
      if (rush) {
        setArrows(['!' + u]);
        if (!failedThis.current) {
          failedThis.current = true;
          finishPuzzle(false);
        }
        setState('failed');
        return;
      }
      // Erklären statt überspringen: Stellung nach dem Fehler + Widerlegung zeigen
      wm.check(fen, u, expected).then((info) => {
        if (info?.verdict === 'ok') return; // gleichwertiger Zug zählt nicht als Fehler
        if (!failedThis.current) {
          failedThis.current = true;
          finishPuzzle(false);
        }
      });
      return;
    }
    setFen(c.fen());
    setLast([m.from, m.to]);
    sound.move();
    const nextPly = ply + 1;
    if (nextPly >= pz.moves.length || c.isCheckmate()) {
      sound.good();
      blink('flash-good');
      if (!failedThis.current) finishPuzzle(true);
      setState(failedThis.current ? 'failed' : 'solved');
      return;
    }
    // Antwort des Gegners
    setTimeout(() => {
      const r = c.move(parseUci(pz.moves[nextPly]));
      setFen(c.fen());
      setLast([r.from, r.to]);
      r.captured ? sound.capture() : sound.move();
      setPly(nextPly + 1);
    }, 450);
  }

  // Admin-Testmodus
  const adm = useAdmin();
  useEffect(() => {
    if (!adm.unlocked || !pz) return;
    return registerAdminActions('puzzle', [
      { label: 'Puzzle als gelöst werten', run: () => { if (state !== 'playing') return; wm.clear(); if (!failedThis.current) finishPuzzle(true); setState('solved'); } },
      { label: 'Puzzle als falsch werten', run: () => { if (state !== 'playing') return; wm.clear(); if (!failedThis.current) { failedThis.current = true; finishPuzzle(false); } setState('failed'); } },
      { label: 'Runde sofort beenden', run: () => setState('done') },
    ]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adm.unlocked, pz, state, ply]);
  const cheatArrow = adm.unlocked && adm.flags.solutionArrows && state === 'playing' && pz?.moves[ply] ? [pz.moves[ply].slice(0, 4)] : [];

  function showSolution() {
    wm.clear();
    if (!failedThis.current) {
      failedThis.current = true;
      finishPuzzle(false);
    }
    const u = pz.moves[ply];
    setArrows([u.slice(0, 4)]);
  }

  function next() {
    const mistakes = results.filter((r) => !r).length;
    if (i + 1 >= round.length || (rush && mistakes >= 3)) setState('done');
    else setI(i + 1);
  }

  useEffect(() => {
    if (rush && state === 'failed') {
      const t = setTimeout(next, 700);
      return () => clearTimeout(t);
    }
    if (rush && state === 'solved') {
      const t = setTimeout(next, 400);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  // Rundenende: Rush-Rekord speichern, bei starker Runde Konfetti
  useEffect(() => {
    if (state !== 'done') return;
    const solved = results.filter(Boolean).length;
    if (rush) bumpTotal('rushBest', solved);
    if (solved >= 8) confetti();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  if (p.heartsEnabled && heartsNow(p) === 0 && state !== 'done') return <NoHearts />;
  if (state === 'loading') return <p className="mono"><span className="spinner" /> Lade Puzzles …</p>;

  if (state === 'done' || !pz) {
    const solved = results.filter(Boolean).length;
    return (
      <div className="finish">
        <div className="stamp">{solved}/{Math.min(MAX_PER_ROUND, round.length)}</div>
        <h2>{rush ? 'Rush beendet' : 'Runde beendet'}</h2>
        <p className="xp-pop">Puzzle-Wertung: {p.puzzleRating}</p>
        <div className="row" style={{ justifyContent: 'center', marginTop: 20 }}>
          <button className="btn primary" onClick={() => location.reload()}>Neue Runde <span className="arrow">→</span></button>
          <a className="btn" href="#/taktik">Motiv wählen</a>
          {results.some((r) => !r) && <a className="btn" href="#/fehlerheft">Fehler wiederholen</a>}
        </div>
      </div>
    );
  }

  const th = themeById(theme);
  const movable = explore ? 'both' : state === 'playing' ? orientation : undefined;

  return (
    <>
      <a className="back" href="#/taktik">← Taktik</a>
      <div className="trainer">
        <div className="board-col">
          <Board fen={wm.view?.fen ?? fen} orientation={orientation} movable={wm.wrong ? undefined : movable} onMove={onMove}
            lastMove={wm.view ? wm.view.last : last}
            arrows={wm.view ? wm.view.arrows : explore && lines[0] ? [lines[0].pv[0].slice(0, 4)] : [...arrows, ...cheatArrow]} className={flash} />
          {explore && <EvalBar line={lines[0]} loading={loading} />}
        </div>
        <aside className="side">
          <div>
            <div className="kicker">
              {rush ? 'Puzzle-Rush' : `${th?.name ?? 'Gemischt'} · ${BAND_NAMES[band]}`} · {i + 1}/{round.length}
            </div>
            <div className="row" style={{ alignItems: 'baseline' }}>
              <h2 style={{ margin: 0 }}>{orientation === 'white' ? 'Weiß' : 'Schwarz'} am Zug</h2>
              <span className="spacer" />
              {rush && <span className={'timer' + (time < 30 ? ' low' : '')}>{Math.floor(time / 60)}:{String(time % 60).padStart(2, '0')}</span>}
            </div>
            <div className="steps-dots" style={{ marginTop: 10 }}>
              {round.map((_, k) => (
                <i key={k} className={k < results.length ? (results[k] ? 'on' : '') : ''}
                  style={k < results.length && !results[k] ? { background: 'repeating-linear-gradient(-45deg,var(--fg) 0 2px,transparent 2px 5px)' } : undefined} />
              ))}
            </div>
          </div>

          {state === 'solved' && <div className="feedback good"><b>✓ Gelöst!</b> Wertung des Puzzles: {pz.rating}</div>}
          {state === 'failed' && <div className="feedback bad"><b>✕ Nicht ganz.</b> Die Stellung landet im Fehlerheft.</div>}
          {wm.wrong && !rush && (
            <WrongMovePanel san={wm.wrong.san} info={wm.wrong.info} loading={wm.wrong.loading}
              onReplay={wm.replay} onRetry={() => { wm.clear(); setArrows([]); }}
              onAcceptAlt={() => { wm.clear(); setArrows([pz.moves[ply].slice(0, 4)]); }} />
          )}
          {state === 'playing' && failedThis.current && !rush && !wm.wrong && (
            <div className="feedback bad">Falscher Zug – versuch es weiter oder lass dir die Lösung zeigen.</div>
          )}

          {!rush && (state !== 'playing' || failedThis.current) && (
            <Explain
              title={'Motiv: ' + pz.themes.filter((t) => themeById(t)).map(themeName).join(', ')}
              text={themeById(pz.themes.find((t) => themeById(t) && t !== 'opening') ?? theme)?.text ?? { short: 'Suche forcierende Züge: Schachs, Schläge, Drohungen.' }}
            />
          )}
          {!rush && state === 'playing' && !failedThis.current && th && (
            <div className="panel"><div className="panel-body"><b>Tipp zum Motiv:</b> {th.text.short}</div></div>
          )}

          {explore && lines[0] && (
            <p className="mono">Engine: {sanDe(uciToSan(fen, lines[0].pv[0]))}</p>
          )}

          <div className="row">
            {state === 'playing' && !rush && <button className="btn small" onClick={showSolution}>Lösung zeigen</button>}
            {state !== 'playing' && !rush && (
              <button className="btn small" onClick={() => setExplore((e) => !e)}>
                {explore ? 'Engine aus' : 'Analysieren'}
              </button>
            )}
            <span className="spacer" />
            {!rush && state !== 'playing' && (
              <button className="btn primary" onClick={next}>
                {i + 1 < round.length ? 'Nächstes' : 'Auswertung'} <span className="arrow">→</span>
              </button>
            )}
            {rush && <button className="btn small" onClick={() => setState('done')}>Beenden</button>}
          </div>
          <a className="mono muted" style={{ fontSize: 12 }} href={`https://lichess.org/training/${pz.id}`} target="_blank" rel="noreferrer">
            Puzzle {pz.id} auf Lichess
          </a>
        </aside>
      </div>
    </>
  );
}
