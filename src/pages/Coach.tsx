import { useEffect, useState } from 'react';
import { Chess } from 'chess.js';
import Board from '../components/Board';
import WrongMovePanel from '../components/WrongMovePanel';
import AutoNext from '../components/AutoNext';
import { engine, evalNumber } from '../lib/engine';
import { winPct } from '../lib/accuracy';
import { sanDe, tryMove, uci, uciToSan } from '../lib/chess';
import { useWrongMove } from '../lib/useWrongMove';
import { addReview, addXp } from '../lib/progress';
import { sound } from '../lib/sound';
import { COACH_KEY as KEY, type CoachGame } from '../lib/coach';

interface Mistake {
  ply: number;
  fen: string;
  played: string;
  best: string;
  bestSan: string;
  drop: number;
  before: number;
  after: number;
}

/** Gewinnchance (0–100) aus Sicht von `me` */
const winFor = (v: number, me: 'w' | 'b') => (me === 'w' ? winPct(v * 100) : 100 - winPct(v * 100));

/** Die größten eigenen Fehler einer Partie finden (Rückgang der Gewinnchance). */
async function findMistakes(g: CoachGame, onProgress: (k: number, n: number) => void): Promise<Mistake[]> {
  const c = new Chess(g.fen);
  const fens = [c.fen()];
  for (const m of g.moves) {
    if (!c.move(m)) break;
    fens.push(c.fen());
  }
  const out: Mistake[] = [];
  const mine = fens.slice(0, -1).map((f, i) => ({ f, i })).filter(({ f }) => f.split(' ')[1] === g.me);
  for (let k = 0; k < mine.length; k++) {
    onProgress(k, mine.length);
    const { f, i } = mine[k];
    const a = await engine.analyse(f, { depth: 12 });
    const b = await engine.analyse(fens[i + 1], { depth: 11 });
    const before = winFor(evalNumber(a.lines[0]), g.me);
    const after = winFor(evalNumber(b.lines[0]), g.me);
    const played = uci(new Chess(f).move(g.moves[i]));
    if (played === a.best) continue;
    out.push({ ply: i, fen: f, played, best: a.best, bestSan: uciToSan(f, a.best), drop: before - after, before, after });
  }
  return out
    .filter((m) => m.drop >= 8)
    .sort((x, y) => y.drop - x.drop)
    .slice(0, 3)
    .sort((x, y) => x.ply - y.ply);
}

/** Fehler-Coach: die drei größten Fehler einer Bot-Partie als Mini-Lektion nachspielen. */
export default function Coach() {
  const [g] = useState<CoachGame | null>(() => {
    try {
      return JSON.parse(sessionStorage.getItem(KEY) ?? 'null');
    } catch {
      return null;
    }
  });
  const [list, setList] = useState<Mistake[] | null>(null);
  const [prog, setProg] = useState('');
  const [i, setI] = useState(0);
  const [solved, setSolved] = useState<boolean[]>([]);
  const [fen, setFen] = useState('');
  const [last, setLast] = useState<[string, string] | undefined>();
  const [flash, setFlash] = useState('');
  const [checking, setChecking] = useState(false);
  const wm = useWrongMove();

  useEffect(() => {
    if (!g) return;
    let alive = true;
    findMistakes(g, (k, n) => alive && setProg(`${k + 1}/${n}`)).then((l) => {
      if (!alive) return;
      setList(l);
      for (const m of l)
        addReview({ id: `coach:${m.fen}`, fen: m.fen, solution: [m.best], title: `Eigene Partie gegen ${g.bot}`, note: `Gespielt: ${sanDe(uciToSan(m.fen, m.played))}`, source: 'Fehler-Coach' });
    });
    return () => {
      alive = false;
    };
  }, [g]);

  const m = list?.[i];
  useEffect(() => {
    if (!m) return;
    setFen(m.fen);
    setLast(undefined);
    wm.clear();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [m]);

  if (!g) return <><h1>Fehler-Coach</h1><p>Spiele zuerst eine Partie gegen einen Bot – danach zeigt dir der Coach deine größten Fehler.</p><a className="btn" href="#/spielen">Zu den Bots</a></>;
  if (!list) return <p className="mono"><span className="spinner" /> Coach schaut deine Partie durch … {prog}</p>;
  if (!list.length)
    return (
      <div className="finish">
        <div className="stamp">SAUBER</div>
        <h2>Keine großen Fehler gefunden</h2>
        <p className="muted">Kein Zug hat deine Gewinnchance deutlich verschlechtert. Spiel gegen einen stärkeren Bot!</p>
        <div className="row" style={{ justifyContent: 'center' }}><a className="btn primary" href="#/spielen">Nächste Partie <span className="arrow">→</span></a></div>
      </div>
    );

  if (i >= list.length) {
    const ok = solved.filter(Boolean).length;
    return (
      <div className="finish">
        <div className="stamp">GELERNT</div>
        <h2>{ok}/{list.length} Fehler selbst korrigiert</h2>
        <p className="muted" style={{ maxWidth: 560, margin: '16px auto' }}>Alle Stellungen liegen im Fehlerheft und kommen in den nächsten Tagen wieder. So wird aus einem Fehler ein Muster, das du nicht mehr vergisst.</p>
        <div className="row" style={{ justifyContent: 'center' }}>
          <a className="btn primary" href="#/spielen">Nächste Partie <span className="arrow">→</span></a>
          <a className="btn" href="#/fehlerheft">Zum Fehlerheft</a>
        </div>
      </div>
    );
  }

  const cur = list[i];
  const side = g.me === 'w' ? 'white' : 'black';
  const moveNo = cur.fen.split(' ')[5] ?? '';
  const done = solved[i] !== undefined;

  async function onMove(u: string) {
    if (done || wm.wrong || checking) return;
    const c = new Chess(cur.fen);
    const mv = tryMove(c, u);
    if (!mv) return;
    setFlash('');
    let good = u.slice(0, 4) === cur.best.slice(0, 4);
    if (!good && u !== cur.played) {
      // Anderer Zug: gut genug, wenn er die Gewinnchance (fast) hält
      setChecking(true);
      const r = await engine.analyse(c.fen(), { depth: 11 });
      setChecking(false);
      good = winFor(evalNumber(r.lines[0]), g!.me) >= cur.before - 4;
    }
    if (good) {
      setFen(c.fen());
      setLast([mv.from, mv.to]);
      setSolved((s) => Object.assign([...s], { [i]: true }));
      sound.good();
      requestAnimationFrame(() => setFlash('flash-good'));
      addXp(10);
      return;
    }
    sound.bad();
    requestAnimationFrame(() => setFlash('flash-bad'));
    void wm.check(cur.fen, u, cur.best);
  }

  return (
    <>
      <a className="back" href="#/spielen">← Spielen</a>
      <div className="trainer">
        <div className="board-col">
          <Board fen={wm.view?.fen ?? fen} lastMove={wm.view?.last ?? last} orientation={side} movable={done || wm.wrong ? undefined : side}
            onMove={onMove} arrows={wm.view?.arrows ?? (done ? [cur.best.slice(0, 4)] : [])} className={flash} />
        </div>
        <aside className="side">
          <div>
            <div className="kicker">Fehler-Coach · Fehler {i + 1}/{list.length}</div>
            <h2>Zug {moveNo}: Finde den besseren Zug</h2>
            <div className="steps-dots">{list.map((_, k) => <i key={k} className={k < i || solved[k] ? 'on' : ''} />)}</div>
          </div>
          <div className="panel">
            <div className="panel-body">
              <p style={{ marginTop: 0 }}>
                In der Partie hast du <b>{sanDe(uciToSan(cur.fen, cur.played))}</b> gespielt. Deine Gewinnchance fiel dadurch von <b>{Math.round(cur.before)} %</b> auf <b>{Math.round(cur.after)} %</b>.
              </p>
              <p className="muted" style={{ marginBottom: 0 }}>Schau dir die Stellung in Ruhe an: Was droht? Welche Figur steht ungeschützt? Gibt es Schachs oder Schläge?</p>
            </div>
          </div>
          {checking && <p className="mono"><span className="spinner" /> prüfe Zug …</p>}
          {wm.wrong && (
            <WrongMovePanel san={wm.wrong.san} info={wm.wrong.info} loading={wm.wrong.loading} onReplay={wm.replay}
              onRetry={() => wm.clear()}
              onAcceptAlt={() => { wm.clear(); setSolved((s) => Object.assign([...s], { [i]: true })); }} />
          )}
          {done && <div className="feedback good"><b>✓ Richtig!</b> Bester Zug laut Engine: <b>{sanDe(cur.bestSan)}</b>.</div>}
          {!done && !wm.wrong && (
            <div className="row">
              <button className="btn small" onClick={() => { setSolved((s) => Object.assign([...s], { [i]: false })); const c = new Chess(cur.fen); const mv = tryMove(c, cur.best); if (mv) { setFen(c.fen()); setLast([mv.from, mv.to]); } }}>Lösung zeigen</button>
            </div>
          )}
          {solved[i] === false && <div className="feedback bad">Der Pfeil zeigt den besseren Zug: <b>{sanDe(cur.bestSan)}</b>. Die Stellung kommt ins Fehlerheft.</div>}
          {solved[i] === false && <div className="row"><span className="spacer" /><button className="btn primary" onClick={() => setI(i + 1)}>Weiter <span className="arrow">→</span></button></div>}
          <AutoNext active={solved[i] === true} ms={2500} onNext={() => setI(i + 1)} resetKey={i} label={i + 1 < list.length ? 'Nächster Fehler' : 'Auswertung'} />
        </aside>
      </div>
    </>
  );
}
