import { useMemo, useState } from 'react';
import { Chess } from 'chess.js';
import Board from '../components/Board';
import { useProgress, gradeReview, removeReview, type ReviewCard } from '../lib/progress';
import { tryMove, parseUci, sanDe, uciToSan } from '../lib/chess';
import { sound } from '../lib/sound';
import { useWrongMove } from '../lib/useWrongMove';
import WrongMovePanel from '../components/WrongMovePanel';

/** Fehlerheft: Stellungen, die du falsch hattest, kommen per Spaced Repetition wieder. */
export default function Review() {
  const p = useProgress();
  const due = useMemo(() => p.review.filter((c) => c.due <= Date.now()), [p.review]);
  const [card, setCard] = useState<ReviewCard | null>(null);
  const [fen, setFen] = useState('');
  const [ply, setPly] = useState(0);
  const [state, setState] = useState<'play' | 'ok' | 'bad'>('play');
  const [arrows, setArrows] = useState<string[]>([]);
  const wm = useWrongMove();
  const [retried, setRetried] = useState(false);

  function start(c: ReviewCard) {
    wm.clear();
    setRetried(false);
    setCard(c);
    setState('play');
    setArrows([]);
    // Puzzles beginnen mit dem Gegnerzug, andere direkt mit der Aufgabe
    const isPuzzle = c.source === 'Taktik';
    const g = new Chess(c.fen);
    if (isPuzzle) g.move(parseUci(c.solution[0]));
    setFen(g.fen());
    setPly(isPuzzle ? 1 : 0);
  }

  function onMove(u: string) {
    if (!card || state !== 'play') return;
    const g = new Chess(fen);
    const m = tryMove(g, u);
    if (!m) return;
    if (u !== card.solution[ply] && !g.isCheckmate()) {
      sound.bad();
      setState('bad');
      setArrows(['!' + u, card.solution[ply].slice(0, 4)]);
      gradeReview(card.id, false);
      wm.check(fen, u, card.solution[ply]);
      return;
    }
    setFen(g.fen());
    const n = ply + 1;
    if (n >= card.solution.length || g.isCheckmate()) {
      sound.good();
      setState('ok');
      if (!retried) gradeReview(card.id, true);
      return;
    }
    setTimeout(() => {
      g.move(parseUci(card.solution[n]));
      setFen(g.fen());
      setPly(n + 1);
    }, 400);
  }

  if (card) {
    const color = new Chess(fen).turn() === 'w' ? 'white' : 'black';
    const orientation = card.source === 'Taktik' ? (new Chess(card.fen).turn() === 'w' ? 'black' : 'white') : (new Chess(card.fen).turn() === 'w' ? 'white' : 'black');
    const nextDue = due.find((c) => c.id !== card.id);
    return (
      <>
        <button className="back" style={{ background: 'none', border: 0, cursor: 'pointer', padding: 0 }} onClick={() => setCard(null)}>← Fehlerheft</button>
        <div className="trainer">
          <div className="board-col"><Board fen={wm.view?.fen ?? fen} lastMove={wm.view?.last} orientation={orientation} movable={state === 'play' ? color : undefined} onMove={onMove} arrows={wm.view ? wm.view.arrows : arrows} /></div>
          <aside className="side">
            <div>
              <div className="kicker">{card.source} · Wiederholung</div>
              <h2>{card.title}</h2>
              <p className="mono">{orientation === 'white' ? 'Weiß' : 'Schwarz'} am Zug – finde den besten Zug.</p>
            </div>
            {state === 'ok' && <div className="feedback good"><b>✓ Richtig!</b> {retried ? 'Im zweiten Anlauf – die Stellung kommt bald wieder.' : 'Nächste Wiederholung in einigen Tagen.'}</div>}
            {state === 'bad' && (
              <div className="feedback bad">
                <b>Noch nicht sicher.</b> Richtig war {sanDe(uciToSan(fen, card.solution[ply]))}. Kommt bald wieder.
                {card.note && <p style={{ marginTop: 8 }}>{card.note}</p>}
              </div>
            )}
            {state === 'bad' && wm.wrong && (
              <WrongMovePanel san={wm.wrong.san} info={wm.wrong.info} loading={wm.wrong.loading} onReplay={wm.replay}
                onRetry={() => { wm.clear(); setArrows([]); setRetried(true); setState('play'); }} />
            )}
            <div className="row">
              {state !== 'play' && nextDue && <button className="btn primary" onClick={() => start(nextDue)}>Nächste <span className="arrow">→</span></button>}
              {state !== 'play' && !nextDue && <button className="btn primary" onClick={() => setCard(null)}>Fertig</button>}
            </div>
          </aside>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="page-head">
        <div className="kicker">Spaced Repetition</div>
        <h1>Fehlerheft</h1>
        <p className="muted">
          Jede Stellung, bei der du danebenlagst – aus Lektionen, Taktik, Eröffnungstraining und deinen analysierten Partien –
          landet hier. Richtig gelöst? Dann kommt sie seltener. Nach sechs sicheren Wiederholungen gilt sie als gelernt.
        </p>
        <div className="row">
          <button className="btn primary" disabled={!due.length} onClick={() => due[0] && start(due[0])}>
            {due.length ? `${due.length} fällige wiederholen` : 'Nichts fällig'} <span className="arrow">→</span>
          </button>
        </div>
      </div>
      {p.review.length === 0 ? (
        <p className="muted">Noch leer. Fehler sind hier willkommen – aus ihnen lernt man am meisten.</p>
      ) : (
        <div className="list">
          {[...p.review].sort((a, b) => a.due - b.due).map((c) => (
            <div key={c.id}>
              <span className="tag">{c.source}</span>
              <span style={{ flex: 1 }}>{c.title}</span>
              <span className="mono" style={{ fontSize: 12 }}>
                {c.due <= Date.now() ? 'fällig' : `in ${Math.ceil((c.due - Date.now()) / 86400000)} T.`}
              </span>
              <button className="btn small" onClick={() => start(c)}>Üben</button>
              <button className="btn small ghost" onClick={() => removeReview(c.id)} aria-label="Entfernen">✕</button>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
