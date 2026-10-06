import type { LessonMeta as Lesson } from '../content/types';
import { LEVELS } from '../content/types';
import { useProgress } from '../lib/progress';
import { Stars } from './Widgets';
import { flag } from '../lib/admin';

const ICON: Record<string, string> = {
  grundlagen: '♙',
  taktik: '⚔',
  strategie: '♜',
  eroeffnungen: '♞',
  fallen: '⚠',
  endspiele: '♔',
};

type Node =
  | { type: 'lesson'; lesson: Lesson; index: number }
  | { type: 'review'; ids: string[] }
  | { type: 'exam'; cat: string; level: number };

/** Duolingo-artiger Lernpfad mit Lektionen, Wiederholungs-Knoten und Kapitelprüfungen. */
export default function Path({ lessons }: { lessons: Lesson[] }) {
  const p = useProgress();
  const nextIdx = lessons.findIndex((l) => !p.lessons[l.id]?.done);
  const nodes: Node[] = [];
  let sinceReview: string[] = [];
  lessons.forEach((l, i) => {
    nodes.push({ type: 'lesson', lesson: l, index: i });
    sinceReview.push(l.id);
    const nextL = lessons[i + 1];
    const chapterEnd = !nextL || nextL.level !== l.level || nextL.category !== l.category;
    if (chapterEnd) {
      nodes.push({ type: 'exam', cat: l.category, level: l.level });
      sinceReview = [];
    } else if (sinceReview.length === 3) {
      nodes.push({ type: 'review', ids: sinceReview });
      sinceReview = [];
    }
  });

  return (
    <div className="path">
      {nodes.map((n, k) => {
        if (n.type === 'lesson') {
          const { lesson: l, index: i } = n;
          const done = !!p.lessons[l.id]?.done;
          // Frei: erledigt, bis 2 Lektionen voraus, oder durch Einstufung / bestandene Prüfung freigeschaltet
          const unlockedByLevel = l.level <= p.placementLevel || !!p.exams[`${l.category}-${l.level - 1}`]?.passed;
          const locked = !done && nextIdx !== -1 && i > nextIdx + 2 && !unlockedByLevel && !flag('unlockAll');
          const cls = ['node', done ? 'done' : '', i === nextIdx ? 'next' : '', locked ? 'locked' : ''].join(' ');
          return (
            <div className="node-wrap" key={l.id}>
              <a className={cls} href={'#/lektion/' + l.id} aria-label={l.title}
                onClick={(e) => { if (locked && !confirm('Diese Lektion ist noch gesperrt. Trotzdem vorspringen?')) e.preventDefault(); }}>
                <span>{done ? '✓' : locked ? '·' : ICON[l.category]}</span>
              </a>
              <div className="node-label">
                <small>{LEVELS[l.level]}</small>
                <b>{l.title}</b>
                {done && <Stars n={p.lessons[l.id].stars} />}
                {done && (p.lessons['praxis:' + l.id]?.done
                  ? <small>Praxis ✓</small>
                  : <a className="mono" style={{ fontSize: 12 }} href={'#/praxis/' + l.id}>Praxis →</a>)}
              </div>
            </div>
          );
        }
        if (n.type === 'review') {
          const ready = n.ids.every((id) => p.lessons[id]?.done);
          return (
            <div className="node-wrap" key={'r' + k}>
              <a className={'node small-node' + (ready ? '' : ' locked')} href={'#/pruefung/wdh/' + n.ids.join(',')} aria-label="Wiederholung">
                <span>↻</span>
              </a>
              <div className="node-label"><small>Wiederholung</small><b>Kurz auffrischen</b></div>
            </div>
          );
        }
        const key = `${n.cat}-${n.level}`;
        const ex = p.exams[key];
        return (
          <div className="node-wrap" key={'e' + key}>
            <a className={'node exam-node' + (ex?.passed ? ' done' : '')} href={'#/pruefung/kapitel/' + key} aria-label="Kapitelprüfung">
              <span>{ex?.passed ? '✓' : '♛'}</span>
            </a>
            <div className="node-label">
              <small>Kapitelprüfung · {LEVELS[n.level as 1]}</small>
              <b>{ex?.passed ? 'Bestanden' : 'Prüfung ablegen'}</b>
              {ex && <span className="mono" style={{ fontSize: 12 }}> Bestwert {Math.round(ex.best * 100)} %</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
