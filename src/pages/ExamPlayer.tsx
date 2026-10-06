import { useMemo, useState } from 'react';
import { Chess } from 'chess.js';
import Board from '../components/Board';
import { Rich } from '../components/Explain';
import { itemsFrom, chapterIds, pick, sideToMove } from '../content/exam';
import { CATEGORIES, LEVELS, type Category, type Level } from '../content/types';
import { stripSan } from '../content/walk';
import { tryMove, sanDe } from '../lib/chess';
import { addXp, update, bump } from '../lib/progress';
import { sound } from '../lib/sound';
import { confetti } from '../lib/confetti';
import { useWrongMove } from '../lib/useWrongMove';
import WrongMovePanel from '../components/WrongMovePanel';
import AutoNext, { readingMs } from '../components/AutoNext';
import { useProgress } from '../lib/progress';

/** Kapitelprüfung (kind = 'kapitel', arg = 'taktik-2') oder Wiederholung (kind = 'wdh', arg = Lektions-ids). */
export default function ExamPlayer({ kind, arg }: { kind: string; arg: string }) {
  const chapter = kind === 'kapitel';
  const [cat, lvlStr] = chapter ? arg.split('-') : ['', ''];
  const ids = chapter ? chapterIds(cat as Category, Number(lvlStr) as Level) : arg.split(',');
  const { pace } = useProgress();
  const items = useMemo(() => pick(itemsFrom(ids), chapter ? 8 : 6), [arg]); // eslint-disable-line react-hooks/exhaustive-deps
  const [i, setI] = useState(0);
  const [fen, setFen] = useState(items[0]?.fen ?? '');
  const [answer, setAnswer] = useState<null | { ok: boolean; san: string }>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [flash, setFlash] = useState('');
  const item = items[i];
  const wm = useWrongMove();

  if (!items.length) return <p>Für dieses Kapitel gibt es noch keine Aufgaben.</p>;

  const title = chapter
    ? `Prüfung: ${CATEGORIES.find((c) => c.id === cat)?.name} · ${LEVELS[Number(lvlStr) as Level]}`
    : 'Wiederholung';
  const key = chapter ? arg : 'wdh:' + arg;

  function onMove(u: string) {
    if (answer || !item) return;
    const c = new Chess(item.fen);
    const m = tryMove(c, u);
    if (!m) return;
    const ok = item.solution.map(stripSan).includes(stripSan(m.san));
    setFen(c.fen());
    setAnswer({ ok, san: m.san });
    setFlash('');
    requestAnimationFrame(() => setFlash(ok ? 'flash-good' : 'flash-bad'));
    if (ok) {
      sound.good();
      setScore((s) => s + 1);
    } else {
      sound.bad();
      wm.check(item.fen, u, item.solution[0]);
    }
  }

  function next() {
    if (i + 1 < items.length) {
      setI(i + 1);
      setFen(items[i + 1].fen);
      setAnswer(null);
      wm.clear();
      return;
    }
    const final = score;
    const pct = final / items.length;
    const passed = pct >= 0.75;
    setDone(true);
    addXp(final * 3 + (passed ? 20 : 0));
    bump('trainers');
    if (chapter)
      update((p) => {
        const prev = p.exams[key];
        return { ...p, exams: { ...p.exams, [key]: { best: Math.max(pct, prev?.best ?? 0), passed: passed || !!prev?.passed } } };
      });
    if (passed) confetti();
  }

  if (done) {
    const pct = Math.round((100 * score) / items.length);
    const passed = pct >= 75;
    return (
      <div className="finish">
        <div className="stamp">{chapter ? (passed ? 'BESTANDEN' : 'NOCH NICHT') : `${score}/${items.length}`}</div>
        <h2>{title}</h2>
        <p className="xp-pop">{score} von {items.length} richtig ({pct}%)</p>
        {chapter && !passed && <p className="muted">Zum Bestehen brauchst du 75 %. Wiederhole die Lektionen und versuch es erneut.</p>}
        <div className="row" style={{ justifyContent: 'center' }}>
          <button className="btn primary" onClick={() => location.reload()}>Nochmal</button>
          <a className="btn" href={chapter ? '#/lernen/' + cat : '#/'}>Zum Lernpfad</a>
        </div>
      </div>
    );
  }

  const correctSan = new Chess(item.fen).move(item.solution[0]);
  return (
    <>
      <a className="back" href={chapter ? '#/lernen/' + cat : '#/'}>← Lernpfad</a>
      <div className="trainer">
        <div className="board-col">
          <Board fen={wm.view?.fen ?? fen} lastMove={wm.view?.last} orientation={sideToMove(item.fen)} movable={answer ? undefined : sideToMove(item.fen)} onMove={onMove}
            arrows={wm.view ? wm.view.arrows : answer && !answer.ok ? [correctSan.from + correctSan.to] : []} className={flash} />
        </div>
        <aside className="side">
          <div>
            <div className="kicker">{title} · Frage {i + 1}/{items.length} · {score} richtig</div>
            <h2>{sideToMove(item.fen) === 'white' ? 'Weiß' : 'Schwarz'} am Zug</h2>
            <div className="steps-dots">{items.map((_, k) => <i key={k} className={k < i ? 'on' : ''} />)}</div>
          </div>
          <div className="panel">
            <div className="panel-head"><b>Aus: {item.from}</b></div>
            <div className="panel-body"><Rich text={item.prompt.short} /></div>
          </div>
          {answer && (
            <div className={'feedback ' + (answer.ok ? 'good' : 'bad')}>
              <b>{answer.ok ? '✓ Richtig! ' : `✕ ${sanDe(answer.san)} – richtig war ${sanDe(correctSan.san)}. `}</b>
              <Rich text={item.success.short} />
            </div>
          )}
          {answer && !answer.ok && wm.wrong && (
            <WrongMovePanel san={wm.wrong.san} info={wm.wrong.info} loading={wm.wrong.loading} onReplay={wm.replay} />
          )}
          {answer && !answer.ok && (
            <div className="row">
              <span className="spacer" />
              <button className="btn primary" onClick={next}>{i + 1 < items.length ? 'Weiter' : 'Auswertung'} <span className="arrow">→</span></button>
            </div>
          )}
          <AutoNext active={!!answer?.ok} ms={readingMs(item.success.short, pace)} onNext={next} resetKey={i}
            label={i + 1 < items.length ? 'Weiter' : 'Auswertung'} />
          <p className="muted" style={{ fontSize: 13 }}>{chapter ? 'Nur ein Versuch pro Frage. Bestehen ab 75 %.' : 'Kurze Wiederholung der letzten Lektionen.'}</p>
        </aside>
      </div>
    </>
  );
}
