import { useEffect, useMemo, useState } from 'react';
import { Chess } from 'chess.js';
import Board from '../components/Board';
import PuzzleBoard from '../components/PuzzleBoard';
import ScenarioPlay from '../components/ScenarioPlay';
import WrongMovePanel from '../components/WrongMovePanel';
import AutoNext from '../components/AutoNext';
import { Rich } from '../components/Explain';
import { lessonById, lessons } from '../content';
import { buildPractice, type PracticeItem } from '../content/practicePlan';
import { pickThemed, type Puzzle } from '../lib/puzzles';
import { tryMove, sanDe, uciToSan } from '../lib/chess';
import { useWrongMove } from '../lib/useWrongMove';
import { addReview, completeLesson, recordPuzzle, useProgress } from '../lib/progress';
import { themeName } from '../content/themes';
import { sound } from '../lib/sound';
import { confetti } from '../lib/confetti';
import type { Scenario } from '../components/ScenarioPlay';
import { mirrorText } from '../lib/transform';

/** Ein Schritt der Praxis-Runde (Puzzles sind schon aufgelöst). */
type Item =
  | Extract<PracticeItem, { kind: 'task' }>
  | { kind: 'puzzle'; pz: Puzzle }
  | { kind: 'scenario'; sc: Scenario };

const HOW_TEXT = { files: 'gespiegelt auf die andere Brettseite', colors: 'mit vertauschten Farben' };

/** Praxisteil einer Lektion: gelerntes Motiv in neuen Stellungen anwenden. */
export default function LessonPractice({ id }: { id: string }) {
  const lesson = lessonById(id);
  const prog = useProgress();
  const plan = useMemo(() => (lesson ? buildPractice(lesson) : []), [lesson]);
  const [items, setItems] = useState<Item[] | null>(null);
  const [i, setI] = useState(0);
  const [results, setResults] = useState<(boolean | null)[]>([]);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      const out: Item[] = [];
      for (const it of plan) {
        if (it.kind === 'puzzles') {
          const pz = await pickThemed(it.themes, it.bands, it.count, prog.puzzleSeen).catch(() => []);
          out.push(...pz.map((p) => ({ kind: 'puzzle' as const, pz: p })));
        } else out.push(it as Item);
      }
      if (alive) setItems(out);
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plan]);

  if (!lesson) return <p>Lektion nicht gefunden.</p>;
  if (!items) return <p className="mono"><span className="spinner" /> Stelle neue Aufgaben zusammen …</p>;
  if (!items.length) return <p>Für diese Lektion gibt es noch keinen Praxisteil.</p>;

  const item = items[i];
  const answered = results[i] !== undefined && results[i] !== null;
  const record = (ok: boolean) => setResults((r) => (r[i] !== undefined && r[i] !== null ? r : Object.assign([...r], { [i]: ok })));
  const next = () => {
    if (i + 1 < items.length) setI(i + 1);
    else finish();
  };
  function finish() {
    const ok = results.filter(Boolean).length;
    const stars = ok === items!.length ? 3 : ok >= items!.length * 0.6 ? 2 : 1;
    completeLesson('praxis:' + lesson!.id, stars, 10 + ok * 4);
    setDone(true);
    if (stars === 3) confetti();
    sound.good();
  }

  if (done) {
    const ok = results.filter(Boolean).length;
    const nextLesson = lessons[lessons.indexOf(lesson) + 1];
    return (
      <div className="finish">
        <div className="stamp">ANGEWENDET</div>
        <h2>{lesson.title}</h2>
        <div className="xp-pop">{ok}/{items.length} gelöst · +{10 + ok * 4} XP</div>
        <p className="muted" style={{ maxWidth: 560, margin: '16px auto' }}>
          {ok === items.length
            ? 'Stark! Du erkennst das Motiv auch, wenn es anders aussieht.'
            : 'Die verpassten Stellungen liegen im Fehlerheft und kommen in ein paar Tagen wieder – so festigt sich das Muster.'}
        </p>
        <div className="row" style={{ justifyContent: 'center' }}>
          {nextLesson && <a className="btn primary" href={'#/lektion/' + nextLesson.id}>Nächste: {nextLesson.title} <span className="arrow">→</span></a>}
          <button className="btn" onClick={() => { setDone(false); setResults([]); setI(0); setItems(null); }}>Neue Runde</button>
          <a className="btn" href={'#/lernen/' + lesson.category}>Zum Lernpfad</a>
        </div>
      </div>
    );
  }

  const label = i + 1 < items.length ? 'Weiter' : 'Auswertung';
  const head = (
    <div>
      <a className="back" href={'#/lektion/' + lesson.id}>← {lesson.title}</a>
      <div className="kicker">Praxis · Aufgabe {i + 1}/{items.length}</div>
      <div className="steps-dots" style={{ marginBottom: 14 }}>
        {items.map((_, k) => <i key={k} className={results[k] ? 'on' : ''} style={results[k] === false ? { background: 'var(--g4)' } : undefined} />)}
      </div>
    </div>
  );

  if (item.kind === 'scenario')
    return (
      <>
        {head}
        <ScenarioPlay key={i} sc={item.sc} compact onDone={(ok) => record(ok)} />
        <div className="row">
          <span className="spacer" />
          {answered || <button className="btn small ghost" onClick={() => { record(false); next(); }}>Überspringen</button>}
          {answered && <button className="btn primary" onClick={next}>{label} <span className="arrow">→</span></button>}
        </div>
      </>
    );

  if (item.kind === 'puzzle')
    return (
      <>
        {head}
        <div className="trainer">
          <div className="board-col">
            <PuzzleBoard key={item.pz.id} puzzle={item.pz} onResult={(ok) => {
              record(ok);
              recordPuzzle(item.pz.id, item.pz.rating, item.pz.themes, ok);
              if (!ok) addReview({ id: 'pz:' + item.pz.id, fen: item.pz.fen, solution: item.pz.moves, title: 'Praxis: ' + lesson.title, source: 'Praxis' });
            }} />
          </div>
          <aside className="side">
            <div className="panel">
              <div className="panel-head"><b>Echte Partiestellung</b></div>
              <div className="panel-body">
                <p>Gleiches Motiv, echte Partie (Lichess, Wertung {item.pz.rating}). Der Gegner hat gerade gezogen – finde die Antwort.</p>
                <p className="muted" style={{ fontSize: 13 }}>Motive: {item.pz.themes.map(themeName).join(', ')}</p>
              </div>
            </div>
            {results[i] === false && <div className="feedback bad">Nicht ganz – der Pfeil zeigt den richtigen Zug. Die Stellung kommt ins Fehlerheft.</div>}
            {results[i] === false && <div className="row"><span className="spacer" /><button className="btn primary" onClick={next}>{label} <span className="arrow">→</span></button></div>}
            <AutoNext active={results[i] === true} ms={2200} onNext={next} resetKey={i} label={label} />
          </aside>
        </div>
      </>
    );

  return (
    <>
      {head}
      <TaskView key={i} item={item} lessonTitle={lesson.title} onResult={record} result={results[i]} onNext={next} label={label} />
    </>
  );
}

function TaskView({ item, lessonTitle, onResult, result, onNext, label }: {
  item: Extract<PracticeItem, { kind: 'task' }>;
  lessonTitle: string;
  onResult: (ok: boolean) => void;
  result: boolean | null | undefined;
  onNext: () => void;
  label: string;
}) {
  const [fen, setFen] = useState(item.fen);
  const [last, setLast] = useState<[string, string] | undefined>();
  const [solved, setSolved] = useState(false);
  const [flash, setFlash] = useState('');
  const wm = useWrongMove();
  const side = new Chess(item.fen).turn() === 'w' ? 'white' : 'black';

  function showSolution() {
    const c = new Chess(item.fen);
    const m = tryMove(c, item.solution[0]);
    if (!m) return;
    wm.clear();
    setFen(c.fen());
    setLast([m.from, m.to]);
    setSolved(true);
  }

  function onMove(u: string) {
    if (solved || wm.wrong) return;
    const c = new Chess(fen);
    const m = tryMove(c, u);
    if (!m) return;
    setFlash('');
    if (item.solution.some((s) => s.slice(0, 4) === u.slice(0, 4))) {
      setFen(c.fen());
      setLast([m.from, m.to]);
      setSolved(true);
      sound.good();
      requestAnimationFrame(() => setFlash('flash-good'));
      onResult(result !== false);
      return;
    }
    sound.bad();
    requestAnimationFrame(() => setFlash('flash-bad'));
    if (result === undefined) {
      onResult(false);
      addReview({ id: `praxis:${item.fen}`, fen: item.fen, solution: [item.solution[0]], title: 'Praxis: ' + lessonTitle, note: item.idea, source: 'Praxis' });
    }
    void wm.check(item.fen, u, item.solution[0]);
  }

  return (
    <div className="trainer">
      <div className="board-col">
        <Board fen={wm.view?.fen ?? fen} lastMove={wm.view?.last ?? last} orientation={side} movable={solved || wm.wrong ? undefined : side}
          onMove={onMove} arrows={wm.view?.arrows ?? []} className={flash} />
      </div>
      <aside className="side">
        <div className="panel">
          <div className="panel-head"><b>Gleiche Idee, neue Stellung</b></div>
          <div className="panel-body">
            <p>Diese Aufgabe kennst du aus „{item.from}“ – aber {HOW_TEXT[item.how]}. {side === 'white' ? 'Weiß' : 'Schwarz'} am Zug: Finde den besten Zug.</p>
          </div>
        </div>
        {wm.wrong && (
          <WrongMovePanel san={wm.wrong.san} info={wm.wrong.info} loading={wm.wrong.loading} onReplay={wm.replay}
            onRetry={() => wm.clear()} onAcceptAlt={() => { wm.clear(); setSolved(true); }} />
        )}
        {solved && (
          <div className="feedback good">
            <b>✓ {sanDe(uciToSan(item.fen, item.solution[0]))}! </b>
            <Rich text={mirrorText(item.idea, item.how)} />
          </div>
        )}
        {!solved && !wm.wrong && result === false && (
          <div className="row">
            <button className="btn small" onClick={showSolution}>Lösung zeigen</button>
          </div>
        )}
        {solved && result === false && <div className="row"><span className="spacer" /><button className="btn primary" onClick={onNext}>{label} <span className="arrow">→</span></button></div>}
        <AutoNext active={solved && result === true} ms={3200} onNext={onNext} resetKey={item.fen} label={label} />
      </aside>
    </div>
  );
}
