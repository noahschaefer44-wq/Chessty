import { useEffect, useMemo, useRef, useState } from 'react';
import { Chess } from 'chess.js';
import Board from '../components/Board';
import Explain, { Rich } from '../components/Explain';
import { EvalBar, Legend } from '../components/Widgets';
import { lessonById, lessons } from '../content';
import { LEVELS, CATEGORIES, type Explain as ExplainT, type MoveStep } from '../content/types';
import { walkLesson, stripSan } from '../content/walk';
import { completeLesson, addReview, loseHeart, useProgress, heartsNow } from '../lib/progress';
import { confetti } from '../lib/confetti';
import NoHearts from '../components/NoHearts';
import { engine, formatEval } from '../lib/engine';
import { tryMove, uci, sanDe, uciToSan } from '../lib/chess';
import { useEngine } from '../lib/useEngine';
import { sound } from '../lib/sound';
import { useKeys } from '../lib/useKeys';

type Phase = 'show' | 'task' | 'solved';

export default function LessonPlayer({ id }: { id: string }) {
  const lesson = lessonById(id);
  const positions = useMemo(() => (lesson ? walkLesson(lesson) : []), [lesson]);
  const [idx, setIdx] = useState(0);
  const [fen, setFen] = useState(positions[0]?.start ?? '');
  const [last, setLast] = useState<[string, string] | undefined>();
  const [phase, setPhase] = useState<Phase>('show');
  const [feedback, setFeedback] = useState<{ good: boolean; text: ExplainT } | null>(null);
  const [extraArrows, setExtraArrows] = useState<string[]>([]);
  const [errors, setErrors] = useState(0);
  const [hint, setHint] = useState(false);
  const [explore, setExplore] = useState(false);
  const [flash, setFlash] = useState('');
  const [finished, setFinished] = useState(false);
  const timers = useRef<number[]>([]);

  const step = lesson?.steps[idx];
  const pos = positions[idx];

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };
  const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms));
  const blink = (k: string) => {
    setFlash('');
    requestAnimationFrame(() => setFlash(k));
    later(() => setFlash(''), 600);
  };

  // Schritt betreten: automatische Züge animiert vorspielen
  useEffect(() => {
    if (!step || !pos) return;
    clearTimers();
    setFeedback(null);
    setExtraArrows([]);
    setHint(false);
    setExplore(false);
    const moves = step.play ?? [];
    if (!moves.length) {
      setFen(pos.shown);
      setLast(pos.lastMove ?? (step.fen ? undefined : last));
      setPhase(step.kind === 'move' ? 'task' : 'show');
      return;
    }
    const c = new Chess(pos.start);
    setFen(pos.start);
    setPhase('show');
    moves.forEach((san, i) => {
      later(() => {
        const m = c.move(san);
        setFen(c.fen());
        setLast([m.from, m.to]);
        m.captured ? sound.capture() : sound.move();
        if (i === moves.length - 1) setPhase(step.kind === 'move' ? 'task' : 'show');
      }, 450 + i * 650);
    });
    return clearTimers;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, lesson]);

  const { lines, loading } = useEngine(fen, explore, 16);
  const prog = useProgress();
  useKeys({
    ' ': () => (phase === 'show' || phase === 'solved') && !(phase === 'show' && step?.kind === 'move') && next(),
    Enter: () => (phase === 'show' || phase === 'solved') && !(phase === 'show' && step?.kind === 'move') && next(),
    ArrowLeft: () => idx > 0 && setIdx(idx - 1),
  });

  if (prog.heartsEnabled && heartsNow(prog) === 0 && !finished) return <NoHearts />;

  if (!lesson || !step || !pos) {
    return (
      <div>
        <h2>Lektion nicht gefunden</h2>
        <a className="btn" href="#/">Zur Übersicht</a>
      </div>
    );
  }

  const orientation = lesson.orientation ?? 'white';
  const total = lesson.steps.length;
  const catName = CATEGORIES.find((c) => c.id === lesson.category)?.name;

  async function onUserMove(u: string) {
    if (explore) {
      const c = new Chess(fen);
      const m = tryMove(c, u);
      if (!m) return;
      setFen(c.fen());
      setLast([m.from, m.to]);
      sound.move();
      return;
    }
    if (!step || step.kind !== 'move' || phase !== 'task') return;
    const s = step as MoveStep;
    const c = new Chess(pos.shown);
    const m = tryMove(c, u);
    if (!m) return;
    const ok = s.solution.map(stripSan).includes(stripSan(m.san));
    if (ok) {
      sound.good();
      blink('flash-good');
      setFen(c.fen());
      setLast([m.from, m.to]);
      setPhase('solved');
      const isMain = stripSan(m.san) === stripSan(s.solution[0]);
      const mainSan = new Chess(pos.shown).move(s.solution[0]).san;
      setFeedback({
        good: true,
        text: isMain ? s.success : { ...s.success, short: `Auch gut! Die Lektion folgt der Hauptvariante ${sanDe(mainSan)}.\n\n` + s.success.short },
      });
      setExtraArrows(s.successArrows ?? []);
      // Bei Alternativzug auf die Hauptvariante umschalten, damit die folgenden Schritte passen
      const line = isMain ? c : new Chess(pos.shown);
      if (!isMain)
        later(() => {
          const mm = line.move(s.solution[0]);
          setFen(line.fen());
          setLast([mm.from, mm.to]);
        }, 900);
      if (s.reply) {
        later(() => {
          const r = line.move(s.reply!);
          setFen(line.fen());
          setLast([r.from, r.to]);
          r.captured ? sound.capture() : sound.move();
        }, isMain ? 700 : 1600);
      }
      return;
    }
    // Falscher Zug
    sound.bad();
    blink('flash-bad');
    setErrors((e) => e + 1);
    loseHeart();
    setFen(c.fen());
    setLast([m.from, m.to]);
    const known = s.mistakes?.find((x) => stripSan(x.san) === stripSan(m.san));
    if (errors === 0)
      addReview({
        id: `lesson:${lesson!.id}:${idx}`,
        fen: pos.shown,
        solution: [uci(new Chess(pos.shown).move(s.solution[0]))],
        title: `${lesson!.title} – ${s.title ?? 'Aufgabe'}`,
        note: s.success.short,
        source: 'Lektion',
      });
    if (known) {
      setFeedback({ good: false, text: known.text });
      setExtraArrows(['!' + u]);
    } else {
      setFeedback({ good: false, text: { short: `${sanDe(m.san)} ist hier nicht der gesuchte Zug. Die Engine prüft, was der Gegner darauf hätte …` } });
      setExtraArrows(['!' + u]);
      const r = await engine.analyse(c.fen(), { depth: 12 });
      const reply = r.best && r.best !== '(none)' ? tryMove(new Chess(c.fen()), r.best) : null;
      setFeedback({
        good: false,
        text: {
          short: reply
            ? `Nach ${sanDe(m.san)} hat der Gegner ${sanDe(reply.san)} (Bewertung ${formatEval(r.lines[0])}). Versuch es noch einmal!`
            : `${sanDe(m.san)} ist nicht der gesuchte Zug. Versuch es noch einmal!`,
          why: 'Denk an die Leitfragen: Welche Figuren stehen ungeschützt? Welche Schachgebote, Schlagzüge und Drohungen gibt es? Was will der Gegner?',
        },
      });
      if (reply) setExtraArrows(['!' + u, reply.from + reply.to]);
    }
    // Zurück in die Aufgabenstellung
    later(() => {
      setFen(pos.shown);
      setLast(pos.lastMove);
    }, 1400);
  }

  function next() {
    if (idx + 1 < total) {
      setIdx(idx + 1);
      return;
    }
    const stars = errors === 0 ? 3 : errors <= 2 ? 2 : 1;
    completeLesson(lesson!.id, stars, 10 + stars * 5);
    setFinished(true);
    confetti();
    sound.good();
  }

  function reveal() {
    const s = step as MoveStep;
    const m = new Chess(pos.shown).move(s.solution[0]);
    setErrors((e) => e + 1);
    setExtraArrows([m.from + m.to]);
    setHint(true);
  }

  if (finished) {
    const stars = errors === 0 ? 3 : errors <= 2 ? 2 : 1;
    const nextLesson = lessons[lessons.indexOf(lesson) + 1];
    return (
      <div className="finish">
        <div className="stamp">GESCHAFFT</div>
        <h2>{lesson.title}</h2>
        <div className="xp-pop">+{10 + stars * 5} XP · {'■'.repeat(stars)}{'□'.repeat(3 - stars)}</div>
        {!!lesson.takeaways?.length && (
          <div className="panel" style={{ maxWidth: 640, margin: '26px auto', textAlign: 'left' }}>
            <div className="panel-head"><b>Merke dir</b></div>
            <div className="panel-body">
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                {lesson.takeaways.map((t) => <li key={t}><Rich text={t} /></li>)}
              </ul>
            </div>
          </div>
        )}
        {!!lesson.pitfalls?.length && (
          <div className="panel" style={{ maxWidth: 640, margin: '0 auto 26px', textAlign: 'left' }}>
            <div className="panel-head"><b>Typische Fehler</b></div>
            <div className="panel-body">
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                {lesson.pitfalls.map((t) => <li key={t}><Rich text={t} /></li>)}
              </ul>
            </div>
          </div>
        )}
        <div className="row" style={{ justifyContent: 'center' }}>
          {nextLesson && (
            <a className="btn primary" href={'#/lektion/' + nextLesson.id}>
              Nächste: {nextLesson.title} <span className="arrow">→</span>
            </a>
          )}
          {lesson.drill?.length ? (
            <a className="btn" href={`#/eroeffnungen/training/${lesson.id}/0`}>Varianten trainieren</a>
          ) : null}
          <a className="btn" href={'#/lernen/' + lesson.category}>Zum Lernpfad</a>
        </div>
      </div>
    );
  }

  const text: ExplainT = step.kind === 'info' ? step.text : step.prompt;
  const arrows = explore
    ? lines[0]?.pv[0] ? [lines[0].pv[0].slice(0, 4)] : []
    : phase === 'solved'
      ? extraArrows
      : [...(phase === 'show' || step.kind === 'info' ? step.arrows ?? [] : step.arrows ?? []), ...extraArrows];

  return (
    <>
      <a className="back" href={'#/lernen/' + lesson.category}>← {catName}</a>
      <div className="trainer">
        <div className="board-col">
          <Board
            fen={fen}
            orientation={orientation}
            movable={explore ? 'both' : phase === 'task' ? (new Chess(pos.shown).turn() === 'w' ? 'white' : 'black') : undefined}
            onMove={onUserMove}
            lastMove={last}
            arrows={arrows}
            className={flash}
          />
          {explore && <EvalBar line={lines[0]} loading={loading} />}
        </div>
        <aside className="side">
          <div>
            <div className="kicker">
              {catName} · {LEVELS[lesson.level]} · Schritt {idx + 1}/{total}
            </div>
            <h2 style={{ marginBottom: 10 }}>{lesson.title}</h2>
            <div className="steps-dots">
              {lesson.steps.map((_, i) => <i key={i} className={i <= idx ? 'on' : ''} />)}
            </div>
          </div>

          {explore ? (
            <div className="panel">
              <div className="panel-head"><b>Ausprobieren</b></div>
              <div className="panel-body">
                <p>Zieh beliebige Züge für beide Seiten. Die Engine zeigt den besten Zug als Pfeil.</p>
                {lines[0] && (
                  <p className="mono">
                    Bewertung {formatEval(lines[0])} · bester Zug{' '}
                    {sanDe(uciToSan(fen, lines[0].pv[0]))}
                  </p>
                )}
                <div className="row">
                  <button className="btn small" onClick={() => { setExplore(false); setFen(phase === 'solved' ? pos.end : pos.shown); setLast(pos.lastMove); }}>
                    Zurück zur Lektion
                  </button>
                  <a className="btn small" href={'#/spielen/' + encodeURIComponent(fen)}>Gegen Bot ausspielen</a>
                </div>
              </div>
            </div>
          ) : (
            <Explain text={text} title={step.title ?? (step.kind === 'move' ? 'Deine Aufgabe' : undefined)} />
          )}

          {!explore && step.kind === 'move' && phase === 'task' && !feedback && (
            <p className="mono muted" style={{ fontSize: 13 }}>
              {new Chess(pos.shown).turn() === 'w' ? 'Weiß' : 'Schwarz'} am Zug – ziehe auf dem Brett.
            </p>
          )}

          {feedback && !explore && (
            <div className={'feedback ' + (feedback.good ? 'good' : 'bad')}>
              <b>{feedback.good ? '✓ Richtig! ' : '✕ '}</b>
              <Rich text={feedback.text.short} />
              {feedback.text.why && (
                <details>
                  <summary style={{ cursor: 'pointer' }}>Warum?</summary>
                  <Rich text={feedback.text.why} />
                </details>
              )}
              {feedback.text.pro && (
                <details>
                  <summary style={{ cursor: 'pointer' }}>Profi-Vertiefung</summary>
                  <Rich text={feedback.text.pro} />
                </details>
              )}
            </div>
          )}

          {hint && step.kind === 'move' && phase === 'task' && (
            <div className="feedback bad">{step.hint ?? 'Der schwarze Pfeil zeigt die Lösung.'}</div>
          )}

          <div className="row">
            {idx > 0 && (
              <button className="btn small ghost" onClick={() => setIdx(idx - 1)}>← Zurück</button>
            )}
            {step.kind === 'move' && phase === 'task' && (
              <>
                <button
                  className="btn small"
                  onClick={() => {
                    if (!hint && step.hint) setHint(true);
                    else reveal();
                  }}
                >
                  {hint || !step.hint ? 'Lösung zeigen' : 'Tipp'}
                </button>
              </>
            )}
            <button
              className="btn small"
              onClick={() => {
                // Ausstehende Animationen/Rücksetzer stoppen, damit die Stellung stabil bleibt
                clearTimers();
                if (explore) {
                  setFen(phase === 'solved' ? pos.end : pos.shown);
                  setLast(phase === 'solved' ? pos.endLastMove : pos.lastMove);
                } else if (phase === 'task') {
                  setFen(pos.shown);
                  setLast(pos.lastMove);
                }
                setExplore((e) => !e);
              }}
            >
              {explore ? 'Engine aus' : 'Warum nicht …? ausprobieren'}
            </button>
            <span className="spacer" />
            {(phase === 'show' || phase === 'solved') && (
              <button className="btn primary" onClick={next} disabled={phase === 'show' && step.kind === 'move'}>
                {idx + 1 < total ? 'Weiter' : 'Abschließen'} <span className="arrow">→</span>
              </button>
            )}
          </div>
          <Legend />
        </aside>
      </div>
    </>
  );
}
