import { useEffect, useMemo, useState } from 'react';
import { Chess } from 'chess.js';
import Board from '../components/Board';
import { lessonById } from '../content';
import { addReview, addXp, useProgress } from '../lib/progress';
import { tryMove, sanDe, uci } from '../lib/chess';
import { stripSan } from '../content/walk';
import { sound } from '../lib/sound';
import { openingName } from '../lib/openings';
import { useWrongMove } from '../lib/useWrongMove';
import WrongMovePanel from '../components/WrongMovePanel';

export default function OpeningDrill({ id, line }: { id: string; line: number }) {
  const lesson = lessonById(id);
  const drill = lesson?.drill?.[line];
  const [ply, setPly] = useState(0);
  const [errors, setErrors] = useState(0);
  const [arrows, setArrows] = useState<string[]>([]);
  const [msg, setMsg] = useState<string>('');
  const [flash, setFlash] = useState('');
  const [name, setName] = useState('');
  const [round, setRound] = useState(0);
  const prog = useProgress();
  const wm = useWrongMove();
  const retry = () => {
    const exp = new Chess(positions[ply].fen).move(drill!.moves[ply]);
    wm.clear();
    setArrows([exp.from + exp.to]);
    setMsg(`Zieh jetzt ${sanDe(exp.san)} selbst.`);
  };

  const positions = useMemo(() => {
    const c = new Chess();
    const out = [{ fen: c.fen(), last: undefined as [string, string] | undefined }];
    for (const san of drill?.moves ?? []) {
      const m = c.move(san);
      out.push({ fen: c.fen(), last: [m.from, m.to] });
    }
    return out;
  }, [drill]);

  const myTurn = (p: number) => (p % 2 === 0 ? 'white' : 'black') === drill?.color;
  const done = !!drill && ply >= drill.moves.length;

  // Gegnerzüge automatisch spielen
  useEffect(() => {
    if (!drill || done || myTurn(ply)) return;
    const t = setTimeout(() => {
      setPly((p) => p + 1);
      sound.move();
    }, ply === 0 ? 500 : 450);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ply, drill, round]);

  useEffect(() => {
    if (!drill) return;
    openingName(drill.moves.slice(0, ply)).then((n) => n && setName(n));
  }, [ply, drill]);

  useEffect(() => {
    if (done) {
      addXp(Math.max(4, 12 - errors * 2));
      sound.good();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  if (!lesson || !drill) return <p>Training nicht gefunden.</p>;

  function onMove(u: string) {
    if (!drill || done || !myTurn(ply) || wm.wrong) return;
    const c = new Chess(positions[ply].fen);
    const m = tryMove(c, u);
    if (!m) return;
    const expected = drill.moves[ply];
    if (stripSan(m.san) === stripSan(expected)) {
      setArrows([]);
      setMsg('');
      setPly(ply + 1);
      sound.move();
      return;
    }
    sound.bad();
    setFlash('');
    requestAnimationFrame(() => setFlash('flash-bad'));
    const exp = new Chess(positions[ply].fen).move(expected);
    setArrows([]);
    setMsg('');
    // Erklären: Ist der Zug spielbar (andere Eröffnung) oder ein echter Fehler?
    wm.check(positions[ply].fen, u, expected, { openingMoves: drill.moves.slice(0, ply) }).then((info) => {
      if (info?.verdict !== 'ok') setErrors((e) => e + 1);
    });
    setMsg(`In dieser Variante spielt man ${sanDe(exp.san)}.`);
    addReview({
      id: `drill:${id}:${line}:${ply}`,
      fen: positions[ply].fen,
      solution: [uci(exp)],
      title: `${lesson!.title}: ${drill.name} – Zug ${Math.floor(ply / 2) + 1}`,
      source: 'Eröffnung',
    });
  }

  const moveText = drill.moves.map((s, i) => (i % 2 === 0 ? `${i / 2 + 1}. ` : '') + sanDe(s));

  return (
    <>
      <a className="back" href="#/eroeffnungen">← Eröffnungen</a>
      <div className="trainer">
        <div className="board-col">
          <Board fen={wm.view?.fen ?? positions[ply].fen} lastMove={wm.view ? wm.view.last : positions[ply].last} orientation={drill.color}
            movable={!done && myTurn(ply) && !wm.wrong ? drill.color : undefined} onMove={onMove}
            arrows={wm.view ? wm.view.arrows : arrows} className={flash} />
        </div>
        <aside className="side">
          <div>
            <div className="kicker">Varianten-Training · du spielst {drill.color === 'white' ? 'Weiß' : 'Schwarz'}</div>
            <h2>{lesson.title}</h2>
            <p className="mono" style={{ margin: 0 }}>{drill.name}</p>
            {name && <p className="muted" style={{ fontSize: 13 }}>Aktuell: {name}</p>}
          </div>
          <div className="panel">
            <div className="panel-head"><b>Zugfolge</b><span className="spacer" /><span className="mono">{ply}/{drill.moves.length}</span></div>
            <div className="movelist">
              {moveText.map((t, i) => (
                <span key={i} style={{ opacity: i < ply ? 1 : 0.15, transition: 'opacity .3s' }}>{i < ply ? t : '···'}</span>
              ))}
            </div>
          </div>
          {wm.wrong ? (
            <WrongMovePanel san={wm.wrong.san} info={wm.wrong.info} loading={wm.wrong.loading}
              onReplay={wm.replay} onRetry={retry} onAcceptAlt={retry} />
          ) : null}
          {msg && <div className="feedback bad">{msg}</div>}
          {done ? (
            <div className="feedback good">
              <b>✓ Variante komplett!</b> {errors === 0 ? 'Fehlerfrei – stark.' : `${errors} Fehler – diese Züge kommen ins Fehlerheft.`}
            </div>
          ) : (
            !myTurn(ply) ? <p className="mono muted">Gegner zieht …</p> : <p className="mono muted">Dein Zug.</p>
          )}
          <div className="row">
            <button className="btn small" onClick={() => { wm.clear(); setPly(0); setErrors(0); setArrows([]); setMsg(''); setRound((r) => r + 1); }}>Neu starten</button>
            <a className="btn small ghost" href={'#/lektion/' + lesson.id}>Zur Lektion</a>
            <span className="spacer" />
            {done && prog.repertoire.length > 0 && (
              <a className="btn small" href="#/eroeffnungen/repertoire">Nächste aus meinem Repertoire</a>
            )}
            {done && lesson.drill && line + 1 < lesson.drill.length && (
              <a className="btn primary" href={`#/eroeffnungen/training/${id}/${line + 1}`}>Nächste Variante <span className="arrow">→</span></a>
            )}
          </div>
        </aside>
      </div>
    </>
  );
}
