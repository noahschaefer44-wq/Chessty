// Gamification: Abzeichen und Tagesquests. Nur Typ-Import von Progress, um Zyklen zu vermeiden.
import type { Progress } from './progress';
import { LESSON_META as lessons, MASTER_COUNT, GLOSSARY_COUNT } from '../content/meta';

export interface DayStats {
  date: string;
  puzzles: number;
  lessons: number;
  perfect: number;
  reviews: number;
  botGames: number;
  masters: number;
  trainers: number;
  xp: number;
}

export interface Badge {
  id: string;
  name: string;
  text: string;
  icon: string;
  check: (p: Progress) => boolean;
}

const doneIn = (p: Progress, cat: string) => lessons.filter((l) => l.category === cat).every((l) => p.lessons[l.id]?.done);
const doneCount = (p: Progress) => Object.values(p.lessons).filter((l) => l.done).length;
const themeSolved = (p: Progress, t: string) => p.themeStats[t]?.s ?? 0;
const mastersDone = (p: Progress) => Object.values(p.masters).filter((m) => m.done).length;
const botWin = (p: Progress, id: string) => (p.botResults[id]?.w ?? 0) > 0;
const lvl = (xp: number) => {
  let level = 1;
  let need = 100;
  let rest = xp;
  while (rest >= need) {
    rest -= need;
    level++;
    need = Math.round(need * 1.15);
  }
  return level;
};

export const BADGES: Badge[] = [
  // Lernen
  { id: 'erste-lektion', name: 'Erster Schritt', text: 'Die erste Lektion abgeschlossen.', icon: '♙', check: (p) => doneCount(p) >= 1 },
  { id: 'lektionen-10', name: 'Fleißig', text: '10 Lektionen abgeschlossen.', icon: '♘', check: (p) => doneCount(p) >= 10 },
  { id: 'lektionen-25', name: 'Wissbegierig', text: '25 Lektionen abgeschlossen.', icon: '♗', check: (p) => doneCount(p) >= 25 },
  { id: 'lektionen-alle', name: 'Enzyklopädie', text: 'Alle Lektionen abgeschlossen.', icon: '♕', check: (p) => doneCount(p) >= lessons.length },
  { id: 'perfekt-1', name: 'Fehlerlos', text: 'Eine Lektion ohne Fehler geschafft.', icon: '■', check: (p) => p.totals.perfectLessons >= 1 },
  { id: 'perfekt-10', name: 'Präzision', text: '10 Lektionen ohne Fehler.', icon: '▣', check: (p) => p.totals.perfectLessons >= 10 },
  { id: 'kat-grundlagen', name: 'Fundament', text: 'Alle Grundlagen-Lektionen.', icon: '◧', check: (p) => doneIn(p, 'grundlagen') },
  { id: 'kat-taktik', name: 'Taktiker', text: 'Alle Taktik-Lektionen.', icon: '⚔', check: (p) => doneIn(p, 'taktik') },
  { id: 'kat-strategie', name: 'Stratege', text: 'Alle Strategie-Lektionen.', icon: '♜', check: (p) => doneIn(p, 'strategie') },
  { id: 'kat-eroeffnungen', name: 'Theoretiker', text: 'Alle Eröffnungs-Lektionen.', icon: '♞', check: (p) => doneIn(p, 'eroeffnungen') },
  { id: 'kat-endspiele', name: 'Techniker', text: 'Alle Endspiel-Lektionen.', icon: '♔', check: (p) => doneIn(p, 'endspiele') },
  // Taktik
  { id: 'puzzle-1', name: 'Erstes Puzzle', text: 'Ein Puzzle gelöst.', icon: '◆', check: (p) => p.puzzlesSolved >= 1 },
  { id: 'puzzle-50', name: 'Rätselfreund', text: '50 Puzzles gelöst.', icon: '◈', check: (p) => p.puzzlesSolved >= 50 },
  { id: 'puzzle-250', name: 'Rätselmeister', text: '250 Puzzles gelöst.', icon: '❖', check: (p) => p.puzzlesSolved >= 250 },
  { id: 'puzzle-1000', name: 'Tausendsassa', text: '1000 Puzzles gelöst.', icon: '✦', check: (p) => p.puzzlesSolved >= 1000 },
  { id: 'wertung-1500', name: 'Klubspieler', text: 'Puzzle-Wertung 1500 erreicht.', icon: '1500', check: (p) => p.puzzleRating >= 1500 },
  { id: 'wertung-1800', name: 'Experte', text: 'Puzzle-Wertung 1800 erreicht.', icon: '1800', check: (p) => p.puzzleRating >= 1800 },
  { id: 'wertung-2100', name: 'Meisterblick', text: 'Puzzle-Wertung 2100 erreicht.', icon: '2100', check: (p) => p.puzzleRating >= 2100 },
  { id: 'gabel-20', name: 'Gabelstapler', text: '20 Gabel-Puzzles gelöst.', icon: '⑂', check: (p) => themeSolved(p, 'fork') >= 20 },
  { id: 'fesselung-20', name: 'Fesselkünstler', text: '20 Fesselungs-Puzzles gelöst.', icon: '⛓', check: (p) => themeSolved(p, 'pin') >= 20 },
  { id: 'matt-30', name: 'Mattsetzer', text: '30 Matt-Puzzles gelöst.', icon: '#', check: (p) => ['mateIn1', 'mateIn2', 'mateIn3'].reduce((a, t) => a + themeSolved(p, t), 0) >= 30 },
  { id: 'opfer-20', name: 'Tal-Jünger', text: '20 Opfer-Puzzles gelöst.', icon: '☄', check: (p) => themeSolved(p, 'sacrifice') >= 20 },
  { id: 'rush-8', name: 'Blitzdenker', text: 'Im Puzzle-Rush 8 von 10 gelöst.', icon: '⚡', check: (p) => p.totals.rushBest >= 8 },
  // Serie & Fleiß
  { id: 'serie-3', name: 'Dranbleiben', text: '3 Tage Serie.', icon: '▲', check: (p) => p.bestStreak >= 3 },
  { id: 'serie-7', name: 'Eine Woche', text: '7 Tage Serie.', icon: '▲▲', check: (p) => p.bestStreak >= 7 },
  { id: 'serie-30', name: 'Ein Monat', text: '30 Tage Serie.', icon: '▲▲▲', check: (p) => p.bestStreak >= 30 },
  { id: 'serie-100', name: 'Hundert', text: '100 Tage Serie.', icon: '100', check: (p) => p.bestStreak >= 100 },
  { id: 'stufe-5', name: 'Stufe 5', text: 'Stufe 5 erreicht.', icon: 'V', check: (p) => lvl(p.xp) >= 5 },
  { id: 'stufe-15', name: 'Stufe 15', text: 'Stufe 15 erreicht.', icon: 'XV', check: (p) => lvl(p.xp) >= 15 },
  { id: 'wiederholung-25', name: 'Aus Fehlern lernen', text: '25 Stellungen im Fehlerheft wiederholt.', icon: '↻', check: (p) => p.totals.reviews >= 25 },
  // Spielen
  { id: 'bot-bauer', name: 'Erster Sieg', text: 'Bauer Bruno besiegt.', icon: '♟', check: (p) => botWin(p, 'bauer') },
  { id: 'bot-laeufer', name: 'Läuferjagd', text: 'Läufer Leo besiegt.', icon: '♝', check: (p) => botWin(p, 'laeufer') },
  { id: 'bot-turm', name: 'Turmbezwinger', text: 'Turm Tara besiegt.', icon: '♜', check: (p) => botWin(p, 'turm') },
  { id: 'bot-dame', name: 'Königinnenmörder', text: 'Dame Doris besiegt.', icon: '♛', check: (p) => botWin(p, 'dame') },
  { id: 'bot-koenig', name: 'Unmöglich', text: 'König Karl besiegt.', icon: '♚', check: (p) => botWin(p, 'koenig') },
  { id: 'analyse-1', name: 'Selbstkritik', text: 'Eine Partie analysiert.', icon: '⌕', check: (p) => p.totals.analyses >= 1 },
  // Meister & Wissen
  { id: 'meister-1', name: 'Schüler der Meister', text: 'Eine Meisterpartie nachgespielt.', icon: '★', check: (p) => mastersDone(p) >= 1 },
  { id: 'meister-alle', name: 'Schachhistoriker', text: 'Alle Meisterpartien nachgespielt.', icon: '★★', check: (p) => mastersDone(p) >= MASTER_COUNT },
  { id: 'einstufung', name: 'Standortbestimmung', text: 'Den Einstufungstest gemacht.', icon: '◎', check: (p) => p.placementDone },
  { id: 'pruefung-1', name: 'Bestanden', text: 'Eine Kapitelprüfung bestanden.', icon: '✓', check: (p) => Object.values(p.exams).some((e) => e.passed) },
  { id: 'trainer-5', name: 'Allrounder', text: '5 verschiedene Trainer ausprobiert.', icon: '✚', check: (p) => Object.keys(p.trainerBest).length >= 5 },
  { id: 'glossar', name: 'Fachsprache', text: `Das Fachbegriffe-Heft mit ${GLOSSARY_COUNT} Begriffen entdeckt.`, icon: '≡', check: (p) => (p.trainerBest['glossar'] ?? 0) > 0 },
];

export interface Quest {
  id: string;
  text: string;
  xp: number;
  target: number;
  value: (d: DayStats) => number;
  done: (d: DayStats) => boolean;
}

const POOL: (Omit<Quest, 'done' | 'id'> & { kind: string })[] = [
  { kind: 'puzzles', text: 'Löse 5 Puzzles', xp: 15, target: 5, value: (d) => d.puzzles },
  { kind: 'puzzles', text: 'Löse 10 Puzzles', xp: 25, target: 10, value: (d) => d.puzzles },
  { kind: 'lessons', text: 'Schließe 1 Lektion ab', xp: 15, target: 1, value: (d) => d.lessons },
  { kind: 'lessons', text: 'Schließe 2 Lektionen ab', xp: 25, target: 2, value: (d) => d.lessons },
  { kind: 'perfect', text: 'Eine Lektion ohne Fehler', xp: 20, target: 1, value: (d) => d.perfect },
  { kind: 'reviews', text: 'Wiederhole 3 Stellungen im Fehlerheft', xp: 15, target: 3, value: (d) => d.reviews },
  { kind: 'bot', text: 'Spiele eine Partie gegen einen Bot', xp: 15, target: 1, value: (d) => d.botGames },
  { kind: 'masters', text: 'Spiele eine Meisterpartie nach', xp: 20, target: 1, value: (d) => d.masters },
  { kind: 'trainers', text: 'Absolviere 2 Trainer-Runden', xp: 15, target: 2, value: (d) => d.trainers },
  { kind: 'xp', text: 'Sammle 60 XP', xp: 10, target: 60, value: (d) => d.xp },
];

/** Drei Quests pro Tag – für alle gleich, aus dem Datum abgeleitet. */
export function questsFor(date: string): Quest[] {
  let h = 0;
  for (const ch of date) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const idx: number[] = [];
  while (idx.length < 3) {
    h = (h * 1103515245 + 12345) >>> 0;
    const i = h % POOL.length;
    // keine zwei Quests derselben Art
    if (!idx.some((j) => POOL[j].kind === POOL[i].kind)) idx.push(i);
  }
  return idx.map((i) => ({ ...POOL[i], id: `${date}:${i}`, done: (d: DayStats) => POOL[i].value(d) >= POOL[i].target }));
}
