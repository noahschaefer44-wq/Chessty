import { useProgress, type Progress } from '../lib/progress';
import { LESSON_META } from '../content/meta';
import { themeName } from '../content/themes';

/** Trainer, die im Tagesplan reihum vorkommen (Route unter #/training/…) */
const TRAINERS: [string, string][] = [
  ['droht', '„Was droht?“'],
  ['haengend', 'Hängende Figuren'],
  ['kandidaten', 'Kandidatenzüge'],
  ['rechnen', 'Rechnen'],
  ['koordinaten', 'Koordinaten'],
  ['bewertung', 'Stellung bewerten'],
  ['blind', 'Blindschach'],
  ['nachbauen', 'Stellung nachbauen'],
  ['raten', 'Meisterzug raten'],
  ['fallen', 'Fallen erkennen'],
];

export interface PlanTask {
  id: string;
  title: string;
  why: string;
  href: string;
  min: number;
  done: boolean;
}

const dayIndex = () => Math.floor(Date.now() / 86400000);

/** Schwächstes Motiv: geringste Lösungsquote (ab 3 Versuchen), sonst ein Grundmotiv. */
export function weakestTheme(p: Progress): string | null {
  const rows = Object.entries(p.themeStats)
    .filter(([t, s]) => t !== 'opening' && s.s + s.f >= 3)
    .map(([t, s]) => [t, s.s / (s.s + s.f)] as const)
    .sort((a, b) => a[1] - b[1]);
  return rows[0]?.[0] ?? null;
}

/** Persönlicher Plan für heute (≈ 10 Minuten), aus Fehlerheft, Puzzle-Statistik und Lernstand. */
export function planFor(p: Progress): PlanTask[] {
  const tasks: PlanTask[] = [];
  const d = p.day;
  const due = p.review.filter((c) => c.due <= Date.now()).length;
  if (due > 0 || d.reviews > 0)
    tasks.push({
      id: 'review', title: `Wiederholen: ${Math.min(5, Math.max(due, d.reviews))} Stellungen aus dem Fehlerheft`,
      why: 'Fehler, die nach ein paar Tagen wiederkommen, bleiben hängen (verteilte Wiederholung).',
      href: '#/fehlerheft', min: 3, done: d.reviews >= Math.min(5, due + d.reviews),
    });
  const weak = weakestTheme(p);
  const theme = weak ?? ['hangingPiece', 'fork', 'pin', 'mateIn1', 'skewer'][dayIndex() % 5];
  tasks.push({
    id: 'theme', title: `Taktik: 5 Puzzles „${themeName(theme)}“`,
    why: weak ? 'Bei diesem Motiv liegt deine Lösungsquote am niedrigsten.' : 'Grundmotive in echten Partiestellungen.',
    href: '#/taktik/' + theme, min: 3, done: d.puzzles >= 5,
  });
  const nextLesson = LESSON_META.find((l) => !p.lessons[l.id]?.done);
  const noPractice = LESSON_META.find((l) => p.lessons[l.id]?.done && !p.lessons['praxis:' + l.id]?.done);
  if (noPractice && dayIndex() % 2 === 0)
    tasks.push({ id: 'praxis', title: `Anwenden: Praxis zu „${noPractice.title}“`, why: 'Gelerntes in neuen Stellungen festigen.', href: '#/praxis/' + noPractice.id, min: 3, done: d.lessons >= 1 });
  else if (nextLesson)
    tasks.push({ id: 'lesson', title: `Lernen: „${nextLesson.title}“`, why: 'Der nächste Schritt auf deinem Lernpfad.', href: '#/lektion/' + nextLesson.id, min: 4, done: d.lessons >= 1 });
  const [tid, tname] = TRAINERS[dayIndex() % TRAINERS.length];
  tasks.push({ id: 'trainer', title: `Trainer: ${tname}`, why: 'Kurze Übung für den Schachblick.', href: '#/training/' + tid, min: 2, done: d.trainers >= 1 });
  return tasks;
}

/** Tagesplan als Karte (Startseite) oder ausführlich (#/plan). */
export default function DailyPlan({ full = false }: { full?: boolean }) {
  const p = useProgress();
  const tasks = planFor(p);
  const open = tasks.filter((t) => !t.done);
  const mins = tasks.reduce((s, t) => s + t.min, 0);
  return (
    <div className="card flat plan">
      <div className="kicker">Dein Plan heute · ca. {mins} Minuten</div>
      {!open.length && <p style={{ marginTop: 6 }}><b>✓ Alles erledigt.</b> Stark – morgen gibt es einen neuen Plan.</p>}
      <ol className="plan-list">
        {tasks.map((t) => (
          <li key={t.id} className={t.done ? 'done' : ''}>
            <a href={t.href}>
              <span className="plan-check" aria-hidden="true">{t.done ? '✓' : ''}</span>
              <span>
                <b>{t.title}</b>
                {full && <small className="muted" style={{ display: 'block' }}>{t.why}</small>}
              </span>
              <span className="mono muted" style={{ marginLeft: 'auto', fontSize: 12 }}>{t.min}′</span>
            </a>
          </li>
        ))}
      </ol>
      {!full && <a className="mono" style={{ fontSize: 12 }} href="#/plan">Warum diese Aufgaben? →</a>}
    </div>
  );
}
