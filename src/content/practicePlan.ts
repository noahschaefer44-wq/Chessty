// Praxisteil nach jeder Lektion: dasselbe Motiv in neuen Stellungen anwenden.
// Bausteine: (1) eigene Lektionsaufgaben gespiegelt (andere Brettseite / andere Farbe),
// (2) echte Lichess-Puzzles zum Motiv, (3) eine Stellung gegen den Computer ausspielen.
import { Chess } from 'chess.js';
import type { Lesson, MoveStep, Level } from './types';
import { walkLesson } from './walk';
import { PRACTICE } from './practice';
import { mirrorFen, mirrorUci, mirrorsFor, type Mirror } from '../lib/transform';
import { sanToUci } from '../lib/chess';
import type { Scenario } from '../components/ScenarioPlay';

export interface PracticeSpec {
  /** Lichess-Puzzle-Motive (siehe public/data/puzzles.json) */
  themes?: string[];
  /** Ausspielen gegen den Computer; 'auto' = Schlussstellung der Lektion halten */
  scenario?: Partial<Scenario> | 'auto' | false;
  /** Endspiel-Übung aus practice.ts */
  endgame?: string;
}

/** Zuordnung der bestehenden Lektionen. Neue Lektionen können `practice` direkt im Lektionsobjekt setzen. */
const PLAN: Record<string, PracticeSpec> = {
  'g-figuren': { themes: ['hangingPiece'] },
  'g-schach-matt': { themes: ['mateIn1'] },
  'g-sonderzuege': { themes: ['promotion'] },
  'g-prinzipien': { themes: ['opening', 'hangingPiece'], scenario: 'auto' },
  'g-schaefermatt': { themes: ['mateIn1', 'opening'] },
  'g-tauschbilanz': { themes: ['hangingPiece', 'capturingDefender'] },
  'g-mattbilder': { themes: ['mateIn1', 'backRankMate', 'smotheredMate'] },
  't-gabel': { themes: ['fork'] },
  't-fesselung': { themes: ['pin'] },
  't-spiess': { themes: ['skewer'] },
  't-abzug': { themes: ['discoveredAttack', 'doubleCheck'] },
  't-mattbilder-2': { themes: ['mateIn2', 'mateIn3'] },
  't-ablenkung': { themes: ['deflection', 'capturingDefender'] },
  't-philidor': { themes: ['attraction', 'smotheredMate'] },
  't-zwischenzug': { themes: ['intermezzo'] },
  't-roentgen': { themes: ['xRayAttack', 'backRankMate'] },
  't-raeumung': { themes: ['clearance', 'interference'] },
  't-griechisches-geschenk': { themes: ['kingsideAttack', 'sacrifice'] },
  't-stiller-zug': { themes: ['quietMove'] },
  's-offene-linie': { themes: ['rookEndgame'], scenario: 'auto' },
  's-bauernkette': { scenario: 'auto' },
  's-schlechteste-figur': { themes: ['quietMove'], scenario: 'auto' },
  's-initiative': { themes: ['kingsideAttack'], scenario: 'auto' },
  's-vorposten': { scenario: 'auto' },
  's-isolani': { scenario: 'auto' },
  's-freibauer': { themes: ['advancedPawn', 'pawnEndgame'], scenario: 'auto' },
  's-prophylaxe': { themes: ['defensiveMove'], scenario: 'auto' },
  's-raum-plaene': { scenario: 'auto' },
  's-minoritaetsangriff': { scenario: 'auto' },
  's-zwei-schwaechen': { themes: ['zugzwang'], scenario: 'auto' },
  'e-dame-matt': { endgame: 'kq-k' },
  'e-turm-matt': { endgame: 'kr-k' },
  'e-quadrat': { themes: ['pawnEndgame'], endgame: 'kp-k-draw' },
  'e-opposition': { themes: ['pawnEndgame'], endgame: 'kp-k-opp' },
  'e-koenig-vor-bauer': { themes: ['pawnEndgame'], scenario: 'auto' },
  'e-falscher-laeufer': { themes: ['advancedPawn'], scenario: 'auto' },
  'e-lucena': { themes: ['rookEndgame'], endgame: 'lucena' },
  'e-philidor': { themes: ['rookEndgame'], endgame: 'philidor' },
  'e-ungleiche-laeufer': { scenario: 'auto' },
  'e-vancura': { themes: ['rookEndgame'], scenario: 'auto' },
};

export type PracticeItem =
  | { kind: 'task'; fen: string; solution: string[]; how: Mirror; from: string; idea: string }
  | { kind: 'puzzles'; themes: string[]; bands: number[]; count: number }
  | { kind: 'scenario'; sc: Scenario };

/** Puzzle-Stärkestufen passend zur Lektion (0 = <1200 … 3 = 2000+) */
export const bandsFor = (level: Level): number[] => (level === 1 ? [0] : level === 2 ? [0, 1] : level === 3 ? [1, 2] : [2, 3]);

export function specFor(lesson: Lesson): PracticeSpec {
  if (lesson.practice) return lesson.practice;
  if (PLAN[lesson.id]) return PLAN[lesson.id];
  // Neue Lektionen ohne Angabe: nach Kategorie
  if (lesson.category === 'eroeffnungen') return { themes: ['opening'], scenario: 'auto' };
  if (lesson.category === 'endspiele') return { scenario: 'auto' };
  if (lesson.category === 'strategie') return { scenario: 'auto' };
  return { themes: lesson.category === 'taktik' ? ['fork', 'pin'] : ['hangingPiece'] };
}

/** Stellungen, aus denen eine Lektion „ausgespielt“ werden kann (Nutzer am Zug). */
function autoScenario(lesson: Lesson): Scenario | null {
  const me = (lesson.orientation ?? 'white') === 'white' ? 'w' : 'b';
  // Eröffnungen: Stellung nach der Trainingsvariante
  const line = lesson.drill?.[0];
  if (line) {
    const c = new Chess();
    for (const san of line.moves) if (!c.move(san)) return null;
    return {
      fen: c.fen(),
      side: line.color === 'white' ? 'w' : 'b',
      goal: 'hold',
      limit: 8,
      title: `${lesson.title}: weiterspielen`,
      text: {
        short: `Die Eröffnung steht. Spiele ${line.color === 'white' ? 'mit Weiß' : 'mit Schwarz'} 8 Züge nach den Ideen der Lektion weiter, ohne Material oder Stellung zu verlieren.`,
        why: 'Hier zeigt sich, ob du den Plan hinter den Zügen verstanden hast: Entwicklung abschließen, König in Sicherheit, Figuren auf die typischen Felder.',
      },
    };
  }
  let ps: ReturnType<typeof walkLesson>;
  try {
    ps = walkLesson(lesson);
  } catch {
    return null;
  }
  for (let i = lesson.steps.length - 1; i >= 0; i--) {
    const st = lesson.steps[i];
    if (st.kind !== 'move') continue;
    const fen = st.reply ? ps[i].end : ps[i].shown;
    const c = new Chess(fen);
    if (c.isGameOver() || c.turn() !== me) continue;
    return {
      fen,
      goal: 'hold',
      limit: lesson.category === 'endspiele' ? 12 : 8,
      title: `${lesson.title}: selbst weiterspielen`,
      text: {
        short: 'Spiele die Stellung aus der Lektion gegen den Computer weiter. Ziel: Halte deinen Vorteil, ohne Material zu verschenken.',
        why: 'Wissen wird erst zu Können, wenn du es gegen Widerstand anwendest. Der Computer verteidigt sich mit voller Stärke.',
      },
    };
  }
  return null;
}

/** Bis zu zwei Lektionsaufgaben gespiegelt: gleiche Idee, andere Gestalt. */
function mirroredTasks(lesson: Lesson): PracticeItem[] {
  let ps: ReturnType<typeof walkLesson>;
  try {
    ps = walkLesson(lesson);
  } catch {
    return [];
  }
  const out: PracticeItem[] = [];
  const steps = lesson.steps.map((s, i) => [s, i] as const).filter(([s]) => s.kind === 'move');
  // Die letzten Aufgaben sind meist die anspruchsvollsten
  for (const [s, i] of steps.reverse()) {
    if (out.length >= 2) break;
    const st = s as MoveStep;
    const fen = ps[i].shown;
    const hows = mirrorsFor(fen);
    const how = hows[out.length % hows.length];
    const sol = st.solution.map((san) => sanToUci(fen, san)).filter((u): u is string => !!u);
    if (!sol.length) continue;
    out.push({ kind: 'task', fen: mirrorFen(fen, how), solution: sol.map((u) => mirrorUci(u, how)), how, from: st.title ?? lesson.title, idea: st.success.short });
  }
  return out;
}

export function buildPractice(lesson: Lesson): PracticeItem[] {
  const spec = specFor(lesson);
  const items: PracticeItem[] = [...mirroredTasks(lesson)];
  if (spec.themes?.length) items.push({ kind: 'puzzles', themes: spec.themes, bands: bandsFor(lesson.level), count: 3 });
  const eg = spec.endgame && PRACTICE.find((p) => p.id === spec.endgame);
  if (eg) items.push({ kind: 'scenario', sc: eg });
  else if (spec.scenario) {
    const base = autoScenario(lesson);
    const sc = spec.scenario === 'auto' ? base : base ? { ...base, ...spec.scenario } : null;
    if (sc && sc.fen) items.push({ kind: 'scenario', sc: sc as Scenario });
  }
  return items;
}
