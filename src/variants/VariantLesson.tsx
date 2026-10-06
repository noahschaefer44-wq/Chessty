import { useMemo, useState } from 'react';
import VariantBoard, { PieceSvg } from './VariantBoard';
import AutoNext from '../components/AutoNext';
import { VARIANT_LESSONS } from './lessons';
import { variantById } from './list';
import { newGame, legalMoves, makeMove, outcome, sqName, pieceName, colorOf, type Move, type Pos, type Rules } from './engine';
import { sound } from '../lib/sound';
import { addXp, completeLesson } from '../lib/progress';

/** Kurzform eines Zuges: „e2e4“, „e7e8q“, „N@f7“ */
export function moveCode(pos: Pos, m: Move): string {
  if (m.drop) return `${m.drop.toUpperCase()}@${sqName(m.to, pos.w)}`;
  return sqName(m.from, pos.w) + sqName(m.to, pos.w) + (m.promo && m.promo !== 'q' ? m.promo : '');
}

/** Ausgangsstellung eines Lektionsschritts inklusive Reserve und Schachzähler */
export function stepStart(rules: Rules, step: { setup: string; pocket?: Record<string, number>; checks?: { w: number; b: number } }) {
  const r: Rules = { ...rules, setup: step.setup };
  const p = newGame(r);
  if (step.pocket) p.pockets = { ...p.pockets, [p.turn]: { ...step.pocket } };
  if (step.checks) p.checks = { ...step.checks };
  return { r, p };
}

/** Geführte Einführung in eine Variante */
export default function VariantLesson({ id }: { id: string }) {
  const lesson = VARIANT_LESSONS.find((l) => l.id === id);
  const info = lesson ? variantById(lesson.variant) : undefined;
  const [i, setI] = useState(0);
  const [sel, setSel] = useState<number | null>(null);
  const [drop, setDrop] = useState<string | null>(null);
  const [state, setState] = useState<'play' | 'ok' | 'bad'>('play');
  const [shown, setShown] = useState<Pos | null>(null);
  const [hint, setHint] = useState(false);
  const step = lesson?.steps[i];
  const start = useMemo(() => (info && step ? stepStart(info.rules, step) : null), [info, step]);
  if (!lesson || !info || !step || !start) return <p>Einführung nicht gefunden.</p>;
  const { r, p } = start;
  const pos = shown ?? p;
  const moves = state === 'play' ? legalMoves(p, r) : [];
  const me = p.turn;

  function finish() {
    if (i + 1 < lesson!.steps.length) {
      setI(i + 1);
      setShown(null);
      setState('play');
      setSel(null);
      setDrop(null);
      setHint(false);
      return;
    }
    completeLesson('variante:' + lesson!.id, 3, 10);
    location.hash = '#/varianten/' + lesson!.variant;
  }

  function play(m: Move) {
    const after = makeMove(p, m, r);
    const code = moveCode(p, m);
    const o = outcome(after, r);
    const ok = step!.accept.includes(code) || (step!.goal === 'win' && o?.winner === me);
    setShown(after);
    setSel(null);
    setDrop(null);
    if (ok) {
      setState('ok');
      sound.good();
      addXp(3);
    } else {
      setState('bad');
      sound.bad();
    }
  }

  function onSquare(s: number) {
    if (state !== 'play') return;
    if (drop) {
      const m = moves.find((x) => x.drop === drop && x.to === s);
      if (m) return play(m);
      setDrop(null);
      return;
    }
    if (sel !== null) {
      const cands = moves.filter((x) => x.from === sel && (x.to === s || x.castle === s));
      if (cands.length) return play(cands.find((c) => !c.promo || c.promo === 'q') ?? cands[0]);
    }
    const pc = p.b[s];
    if (pc && colorOf(pc) === me && moves.some((x) => x.from === s)) setSel(s);
    else setSel(null);
  }

  const targets = drop ? moves.filter((m) => m.drop === drop).map((m) => m.to) : sel !== null ? moves.filter((m) => m.from === sel).map((m) => m.to) : [];
  const pocket = Object.entries(p.pockets[me]).filter(([, n]) => n > 0);

  return (
    <>
      <a className="back" href={'#/varianten/' + lesson.variant}>← {info.rules.name}</a>
      <div className="trainer">
        <div className="board-col">
          <div className="vboard-wrap">
            <VariantBoard pos={pos} rules={r} flip={me === 'b'} selected={sel} targets={targets} onSquare={onSquare} />
          </div>
          {pocket.length > 0 && state === 'play' && (
            <div className="pocket" aria-label="Reserve">
              {pocket.map(([t, n]) => (
                <button key={t} className={'pocket-piece' + (drop === t ? ' on' : '')} onClick={() => { setSel(null); setDrop(drop === t ? null : t); }}
                  aria-label={`${pieceName(t, r)} einsetzen (${n})`}>
                  <svg viewBox="0 0 1 1" width="34" height="34"><PieceSvg p={me === 'w' ? t.toUpperCase() : t} x={0} y={0} rules={r} /></svg>
                  <span className="mono">{n}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        <aside className="side">
          <div>
            <div className="kicker">{lesson.title} · {i + 1}/{lesson.steps.length}</div>
            <h2>{step.title}</h2>
            <div className="steps-dots">{lesson.steps.map((_, k) => <i key={k} className={k < i || (k === i && state === 'ok') ? 'on' : ''} />)}</div>
          </div>
          <div className="panel"><div className="panel-body"><p style={{ margin: 0 }}>{step.text}</p></div></div>
          {state === 'play' && <p className="mono muted" style={{ fontSize: 13 }}>{me === 'w' ? 'Weiß' : 'Schwarz'} am Zug{pocket.length ? ' – tippe eine Reservefigur an, um sie einzusetzen' : ''}.</p>}
          {hint && state === 'play' && <div className="feedback bad">{step.hint}</div>}
          {state === 'ok' && <div className="feedback good"><b>✓ </b>{step.success}</div>}
          {state === 'bad' && <div className="feedback bad"><b>✕ Nicht ganz.</b> {step.hint}</div>}
          <div className="row">
            {state === 'play' && !hint && <button className="btn small" onClick={() => setHint(true)}>Tipp</button>}
            {state === 'bad' && <button className="btn small primary" onClick={() => { setShown(null); setState('play'); }}>Nochmal</button>}
          </div>
          <AutoNext active={state === 'ok'} ms={3500} onNext={finish} resetKey={i} label={i + 1 < lesson.steps.length ? 'Weiter' : 'Jetzt selbst spielen'} />
        </aside>
      </div>
    </>
  );
}
