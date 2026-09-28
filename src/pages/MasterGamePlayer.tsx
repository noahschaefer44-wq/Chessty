import { useEffect, useMemo, useState } from 'react';
import { Chess } from 'chess.js';
import Board from '../components/Board';
import Explain from '../components/Explain';
import { EvalBar } from '../components/Widgets';
import { masterById } from '../content';
import { addXp, update, bump } from '../lib/progress';
import { confetti } from '../lib/confetti';
import { tryMove, sanDe } from '../lib/chess';
import { stripSan } from '../content/walk';
import { useEngine } from '../lib/useEngine';
import { sound } from '../lib/sound';
import { useKeys } from '../lib/useKeys';

export default function MasterGamePlayer({ id }: { id: string }) {
  const g = masterById(id);
  const positions = useMemo(() => {
    const c = new Chess();
    const out = [{ fen: c.fen(), last: undefined as [string, string] | undefined, san: '' }];
    for (const s of g?.moves ?? []) {
      const m = c.move(s);
      out.push({ fen: c.fen(), last: [m.from, m.to], san: m.san });
    }
    return out;
  }, [g]);
  const [ply, setPly] = useState(0);
  const [started, setStarted] = useState(false);
  const [guessing, setGuessing] = useState<number | null>(null);
  const [tries, setTries] = useState(0);
  const [found, setFound] = useState<Record<number, boolean>>({});
  const [reveal, setReveal] = useState<number | null>(null);
  const [wrong, setWrong] = useState<string[]>([]);
  const [auto, setAuto] = useState(false);
  const [engineOn, setEngineOn] = useState(false);
  const [finished, setFinished] = useState(false);

  const moment = g?.moments.find((m) => m.ply === ply);
  const total = g?.moves.length ?? 0;
  const { lines, loading } = useEngine(positions[ply]?.fen ?? '', engineOn && guessing === null);

  // Beim Erreichen eines Schlüsselmoments anhalten und raten lassen
  useEffect(() => {
    if (!started || !g) return;
    if (moment && found[ply] === undefined && reveal !== ply) {
      setGuessing(ply);
      setAuto(false);
      setTries(0);
      return;
    }
    if (auto && ply < total) {
      const t = setTimeout(() => step(1), 900);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ply, started, auto]);

  useKeys({
    ArrowRight: () => started && guessing === null && (reveal === ply ? (setReveal(null), setWrong([]), setPly(ply + 1)) : step(1)),
    ArrowLeft: () => started && guessing === null && step(-1),
  });
  const endReached = !!g && started && (reveal === ply ? ply + 1 : ply) >= total;
  useEffect(() => {
    if (endReached && !finished) finish();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endReached]);

  if (!g) return <p>Partie nicht gefunden.</p>;

  function step(d: number) {
    const n = Math.max(0, Math.min(total, ply + d));
    if (d > 0 && n > ply) {
      const mv = g!.moves[ply];
      mv.includes('x') ? sound.capture() : sound.move();
    }
    setReveal(null);
    setWrong([]);
    setPly(n);
  }

  function finish() {
    setFinished(true);
    const f = Object.values(found).filter(Boolean).length;
    update((p) => ({ ...p, masters: { ...p.masters, [g!.id]: { done: true, found: f, total: g!.moments.length } } }));
    addXp(10 + f * 5);
    bump('masters');
    confetti();
  }

  function onMove(u: string) {
    if (guessing === null || !moment) return;
    const c = new Chess(positions[ply].fen);
    const m = tryMove(c, u);
    if (!m) return;
    const accepted = [g!.moves[ply], ...(moment.accept ?? [])].map(stripSan);
    if (accepted.includes(stripSan(m.san))) {
      sound.good();
      setFound((f) => ({ ...f, [ply]: tries === 0 }));
      setGuessing(null);
      setReveal(ply);
      setWrong([]);
      return;
    }
    sound.bad();
    setWrong(['!' + u]);
    setTries((t) => t + 1);
    if (tries >= 2) giveUp();
  }

  function giveUp() {
    setFound((f) => ({ ...f, [ply]: false }));
    setGuessing(null);
    setReveal(ply);
  }

  const heroName = g.hero === 'white' ? g.white : g.black;
  const shownPly = reveal === ply ? ply + 1 : ply;
  const pos = positions[shownPly];
  const note = g.notes?.[shownPly - 1];

  if (!started) {
    return (
      <>
        <a className="back" href="#/meister">← Meisterpartien</a>
        <div className="trainer">
          <div className="board-col"><Board fen={positions[0].fen} orientation={g.hero} /></div>
          <aside className="side">
            <div>
              <div className="kicker">{g.event} {g.year}</div>
              <h2>{g.title}</h2>
              <p className="mono">{g.white} – {g.black} · {g.result}</p>
            </div>
            <Explain text={g.intro} title="Worum es geht" />
            <p>Du spielst die Partie aus Sicht von <b>{heroName}</b>. {g.moments.length} Mal musst du den Meisterzug finden (3 Versuche).</p>
            <button className="btn primary" onClick={() => { setStarted(true); setAuto(true); }}>Partie starten <span className="arrow">→</span></button>
          </aside>
        </div>
      </>
    );
  }

  const moveNo = (p: number) => `${Math.floor(p / 2) + 1}${p % 2 ? '…' : '.'}`;
  const done = finished || shownPly >= total;

  return (
    <>
      <a className="back" href="#/meister">← Meisterpartien</a>
      <div className="trainer">
        <div className="board-col">
          <Board fen={pos.fen} lastMove={pos.last} orientation={g.hero}
            movable={guessing !== null ? g.hero : undefined} onMove={onMove}
            arrows={guessing !== null ? [...(moment?.arrows ?? []), ...wrong] : reveal === ply && moment?.arrows ? moment.arrows : engineOn && lines[0] ? [lines[0].pv[0].slice(0, 4)] : []} />
          {engineOn && <EvalBar line={lines[0]} loading={loading} />}
        </div>
        <aside className="side">
          <div>
            <div className="kicker">{g.white} – {g.black} · Zug {moveNo(Math.max(0, shownPly - 1))}</div>
            <h2 style={{ marginBottom: 8 }}>{g.title}</h2>
            <div className="steps-dots">
              {g.moments.map((m) => <i key={m.ply} className={found[m.ply] ? 'on' : ''} style={found[m.ply] === false ? { background: 'var(--g4)' } : undefined} />)}
            </div>
          </div>

          {guessing !== null && moment && (
            <>
              <Explain text={moment.prompt} title={`Finde den Zug von ${heroName} (${3 - tries} Versuche)`} />
              {wrong.length > 0 && <div className="feedback bad">Nicht der Meisterzug. Denk an die Frage oben!</div>}
              <div className="row">
                <button className="btn small" onClick={giveUp}>Auflösen</button>
              </div>
            </>
          )}

          {reveal === ply && moment && (
            <>
              <div className={'feedback ' + (found[ply] ? 'good' : 'bad')}>
                <b>{found[ply] ? '✓ Gefunden! ' : 'Der Meisterzug: '}</b>
                {moveNo(ply)} {sanDe(g.moves[ply])}
              </div>
              <Explain text={moment.explain} title="Die Idee" />
            </>
          )}

          {guessing === null && reveal !== ply && note && (
            <div className="panel"><div className="panel-body"><b className="mono">{moveNo(shownPly - 1)} {sanDe(positions[shownPly].san)}</b> — {note}</div></div>
          )}

          {done && (
            <>
              <div className="feedback good">
                <b>Partie beendet ({g.result}).</b> Gefunden: {Object.values(found).filter(Boolean).length}/{g.moments.length}
              </div>
              <Explain text={g.outro} title="Was wir lernen" />
            </>
          )}

          {guessing === null && (
            <div className="row">
              <button className="btn small" onClick={() => step(-1)} disabled={ply === 0}>←</button>
              <button className="btn small" onClick={() => (reveal === ply ? (setReveal(null), setWrong([]), setPly(ply + 1)) : step(1))} disabled={done}>→</button>
              <button className="btn small" onClick={() => setAuto((a) => !a)} disabled={done}>{auto ? 'Pause' : 'Abspielen'}</button>
              <button className="btn small" onClick={() => setEngineOn((e) => !e)}>{engineOn ? 'Engine aus' : 'Engine'}</button>
              <a className="btn small" href={'#/spielen/' + encodeURIComponent(pos.fen)}>Ab hier gegen Bot</a>
            </div>
          )}

          <div className="panel">
            <div className="panel-head"><b>Partie</b></div>
            <div className="movelist">
              {g.moves.slice(0, shownPly).map((s, i) => (
                <span key={i} className={g.moments.some((m) => m.ply === i) ? 'q-mistake' : ''}>
                  {i % 2 === 0 && <span className="n">{i / 2 + 1}.</span>} {sanDe(s)}
                </span>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
