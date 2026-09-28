import type { Lesson } from '../content/types';
import { LEVELS } from '../content/types';
import { useProgress } from '../lib/progress';
import { Stars } from './Widgets';

const ICON: Record<string, string> = {
  grundlagen: '♙',
  taktik: '⚔',
  strategie: '♜',
  eroeffnungen: '♞',
  endspiele: '♔',
};

/** Duolingo-artiger Lernpfad: Rauten im Zickzack, erledigt = schwarz, nächste pulsiert. */
export default function Path({ lessons }: { lessons: Lesson[] }) {
  const p = useProgress();
  const nextIdx = lessons.findIndex((l) => !p.lessons[l.id]?.done);
  return (
    <div className="path">
      {lessons.map((l, i) => {
        const done = !!p.lessons[l.id]?.done;
        // Freigeschaltet: erledigt, die nächste – oder alles bis 2 Lektionen voraus (Profis dürfen springen)
        const locked = !done && nextIdx !== -1 && i > nextIdx + 2;
        const cls = ['node', done ? 'done' : '', i === nextIdx ? 'next' : '', locked ? 'locked' : ''].join(' ');
        return (
          <div className="node-wrap" key={l.id}>
            <a
              className={cls}
              href={'#/lektion/' + l.id}
              aria-label={l.title}
              onClick={(e) => {
                if (locked && !confirm('Diese Lektion ist noch gesperrt. Trotzdem vorspringen?')) e.preventDefault();
              }}
            >
              <span>{done ? '✓' : locked ? '·' : ICON[l.category]}</span>
            </a>
            <div className="node-label">
              <small>{LEVELS[l.level]}</small>
              <b>{l.title}</b>
              {done && <Stars n={p.lessons[l.id].stars} />}
            </div>
          </div>
        );
      })}
    </div>
  );
}
