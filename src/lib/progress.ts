import { useSyncExternalStore } from 'react';
import { load, save } from './storage';
import { BADGES, questsFor, type DayStats } from './game';

export interface ReviewCard {
  id: string;
  fen: string;
  /** Lösung als UCI-Züge; ungerade Indizes sind Antworten des Gegners */
  solution: string[];
  title: string;
  note?: string;
  source: string;
  due: number;
  interval: number;
  ease: number;
  reps: number;
}

export interface Progress {
  xp: number;
  streak: number;
  lastActiveDay: string;
  dailyXp: number;
  dailyGoal: number;
  lessons: Record<string, { done: boolean; stars: number }>;
  masters: Record<string, { done: boolean; found: number; total: number }>;
  puzzleRating: number;
  puzzlesSolved: number;
  puzzlesFailed: number;
  puzzleSeen: string[];
  themeStats: Record<string, { s: number; f: number }>;
  review: ReviewCard[];
  botResults: Record<string, { w: number; d: number; l: number }>;
  showCoords: boolean;
  sound: boolean;
  boardTheme: 'grau' | 'kontrast' | 'papier' | 'schiefer';
  animSpeed: number;
  // Gamification
  heartsEnabled: boolean;
  hearts: number;
  heartsAt: number;
  streakFreezes: number;
  bestStreak: number;
  badges: Record<string, string>;
  day: DayStats;
  questsClaimed: string[];
  placementDone: boolean;
  placementLevel: number;
  exams: Record<string, { best: number; passed: boolean }>;
  trainerBest: Record<string, number>;
  patterns: Record<string, number>;
  weekXp: { week: string; xp: number };
  repertoire: string[];
  totals: { perfectLessons: number; botWins: number; reviews: number; analyses: number; mastersFound: number; rushBest: number };
}

const KEY = 'chessty.progress.v1';
const initial: Progress = {
  xp: 0,
  streak: 0,
  lastActiveDay: '',
  dailyXp: 0,
  dailyGoal: 50,
  lessons: {},
  masters: {},
  puzzleRating: 1200,
  puzzlesSolved: 0,
  puzzlesFailed: 0,
  puzzleSeen: [],
  themeStats: {},
  review: [],
  botResults: {},
  showCoords: true,
  sound: true,
  boardTheme: 'grau',
  animSpeed: 220,
  heartsEnabled: false,
  hearts: 5,
  heartsAt: 0,
  streakFreezes: 0,
  bestStreak: 0,
  badges: {},
  day: { date: '', puzzles: 0, lessons: 0, perfect: 0, reviews: 0, botGames: 0, masters: 0, trainers: 0, xp: 0 },
  questsClaimed: [],
  placementDone: false,
  placementLevel: 1,
  exams: {},
  trainerBest: {},
  patterns: {},
  weekXp: { week: '', xp: 0 },
  repertoire: [],
  totals: { perfectLessons: 0, botWins: 0, reviews: 0, analyses: 0, mastersFound: 0, rushBest: 0 },
};

let state: Progress = load(KEY, initial);
// Ältere Speicherstände um neue Unterobjekte ergänzen
state = { ...state, totals: { ...initial.totals, ...state.totals }, day: { ...initial.day, ...state.day } };
const listeners = new Set<() => void>();

export const today = () => new Date().toISOString().slice(0, 10);

/** ISO-Kalenderwoche, z. B. 2026-W40 (wie auf dem Server). */
export function isoWeek(d = new Date()): string {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - day);
  const y0 = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  const w = Math.ceil(((t.getTime() - y0.getTime()) / 86400000 + 1) / 7);
  return `${t.getUTCFullYear()}-W${String(w).padStart(2, '0')}`;
}
const dayDiff = (a: string, b: string) =>
  Math.round((Date.parse(b) - Date.parse(a)) / 86400000);

function rollDay(p: Progress): Progress {
  const t = today();
  let out = p;
  if (p.lastActiveDay !== t && p.dailyXp) out = { ...out, dailyXp: 0 };
  if (p.day.date !== t) out = { ...out, day: { ...initial.day, date: t }, questsClaimed: [] };
  return out;
}

const HEART_MS = 3 * 3600 * 1000;
/** Herzen regenerieren sich: eins alle 3 Stunden. */
export function heartsNow(p: Progress): number {
  if (p.hearts >= 5) return 5;
  return Math.min(5, p.hearts + Math.floor((Date.now() - p.heartsAt) / HEART_MS));
}

/** Nach jeder Änderung: neue Abzeichen und erledigte Tagesquests gutschreiben. */
function reward(p: Progress): Progress {
  let out = p;
  const newBadges = BADGES.filter((b) => !out.badges[b.id] && b.check(out));
  if (newBadges.length) {
    const badges = { ...out.badges };
    for (const b of newBadges) badges[b.id] = today();
    out = { ...out, badges };
    setTimeout(() => window.dispatchEvent(new CustomEvent('chessty-badge', { detail: newBadges.map((b) => b.id) })), 0);
  }
  for (const q of questsFor(today())) {
    if (!out.questsClaimed.includes(q.id) && q.done(out.day)) {
      out = { ...out, questsClaimed: [...out.questsClaimed, q.id], xp: out.xp + q.xp, dailyXp: out.dailyXp + q.xp };
      setTimeout(() => window.dispatchEvent(new CustomEvent('chessty-quest', { detail: q.id })), 0);
    }
  }
  return out;
}
state = rollDay(state);

export function getProgress(): Progress {
  return state;
}

export function update(fn: (p: Progress) => Progress): void {
  state = reward(fn(rollDay(state)));
  save(KEY, state);
  listeners.forEach((l) => l());
}

export function subscribeProgress(l: () => void): () => void {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useProgress(): Progress {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => state,
  );
}

/** XP gutschreiben und Serie (Streak) pflegen. */
export function addXp(amount: number): void {
  update((p) => {
    const t = today();
    let streak = p.streak;
    let freezes = p.streakFreezes;
    if (p.lastActiveDay !== t) {
      const gap = p.lastActiveDay ? dayDiff(p.lastActiveDay, t) : 99;
      if (gap === 1) streak = p.streak + 1;
      // Serienschutz: ein verpasster Tag wird automatisch überbrückt
      else if (gap === 2 && freezes > 0) {
        streak = p.streak + 1;
        freezes--;
      } else streak = 1;
      // Alle 7 Tage gibt es einen Serienschutz (max. 2)
      if (streak % 7 === 0) freezes = Math.min(2, freezes + 1);
    }
    return {
      ...p,
      xp: p.xp + amount,
      dailyXp: p.dailyXp + amount,
      streak,
      bestStreak: Math.max(p.bestStreak, streak),
      streakFreezes: freezes,
      lastActiveDay: t,
      day: { ...p.day, xp: p.day.xp + amount },
      weekXp: { week: isoWeek(), xp: (p.weekXp?.week === isoWeek() ? p.weekXp.xp : 0) + amount },
    };
  });
}

export function completeLesson(id: string, stars: number, xp: number): void {
  update((p) => {
    const prev = p.lessons[id];
    return {
      ...p,
      lessons: { ...p.lessons, [id]: { done: true, stars: Math.max(stars, prev?.stars ?? 0) } },
      day: { ...p.day, lessons: p.day.lessons + 1, perfect: p.day.perfect + (stars === 3 ? 1 : 0) },
      totals: { ...p.totals, perfectLessons: p.totals.perfectLessons + (stars === 3 && !prev ? 1 : 0) },
    };
  });
  addXp(xp);
}

export function recordPuzzle(id: string, rating: number, themes: string[], solved: boolean): void {
  update((p) => {
    // Elo-artige Anpassung der Puzzle-Wertung
    const expected = 1 / (1 + 10 ** ((rating - p.puzzleRating) / 400));
    const delta = Math.round(32 * ((solved ? 1 : 0) - expected));
    const themeStats = { ...p.themeStats };
    for (const t of themes) {
      const s = themeStats[t] ?? { s: 0, f: 0 };
      themeStats[t] = solved ? { ...s, s: s.s + 1 } : { ...s, f: s.f + 1 };
    }
    return {
      ...p,
      puzzleRating: Math.max(400, p.puzzleRating + delta),
      puzzlesSolved: p.puzzlesSolved + (solved ? 1 : 0),
      puzzlesFailed: p.puzzlesFailed + (solved ? 0 : 1),
      puzzleSeen: [...p.puzzleSeen.slice(-3000), id],
      themeStats,
      day: { ...p.day, puzzles: p.day.puzzles + (solved ? 1 : 0) },
    };
  });
}

/** Stellung ins Fehler-Heft legen (Spaced Repetition). */
export function addReview(card: Omit<ReviewCard, 'due' | 'interval' | 'ease' | 'reps'>): void {
  update((p) => {
    if (p.review.some((c) => c.id === card.id)) return p;
    const c: ReviewCard = { ...card, due: Date.now(), interval: 0, ease: 2.3, reps: 0 };
    return { ...p, review: [...p.review, c] };
  });
}

/** SM-2-ähnliche Planung: richtig → Abstand wächst, falsch → morgen wieder. */
export function gradeReview(id: string, correct: boolean): void {
  update((p) => ({
    ...p,
    day: { ...p.day, reviews: p.day.reviews + 1 },
    totals: { ...p.totals, reviews: p.totals.reviews + 1 },
    // Richtige Wiederholungen füllen ein Herz auf
    hearts: correct ? Math.min(5, heartsNow(p) + 1) : heartsNow(p),
    heartsAt: Date.now(),
    review: p.review
      .map((c) => {
        if (c.id !== id) return c;
        if (!correct) return { ...c, interval: 1, reps: 0, ease: Math.max(1.3, c.ease - 0.2), due: Date.now() + 86400000 / 2 };
        const interval = c.reps === 0 ? 1 : c.reps === 1 ? 3 : Math.round(c.interval * c.ease);
        return { ...c, interval, reps: c.reps + 1, ease: c.ease + 0.05, due: Date.now() + interval * 86400000 };
      })
      // Nach 5 sicheren Wiederholungen gilt die Stellung als gelernt
      .filter((c) => c.reps < 6),
  }));
}

export function removeReview(id: string): void {
  update((p) => ({ ...p, review: p.review.filter((c) => c.id !== id) }));
}

/** Fortschritt als JSON-Datei sichern. */
export function exportProgress(): void {
  const blob = new Blob([JSON.stringify({ app: 'chessty', version: 1, data: state }, null, 1)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `chessty-fortschritt-${today()}.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

/** Gesicherten Fortschritt wieder einlesen. */
export async function importProgress(file: File): Promise<boolean> {
  try {
    const json = JSON.parse(await file.text());
    if (json.app !== 'chessty' || typeof json.data !== 'object') return false;
    update(() => ({ ...initial, ...json.data }));
    return true;
  } catch {
    return false;
  }
}

/** Herz verlieren (nur wenn Herzen aktiviert sind). */
export function loseHeart(): void {
  update((p) => (p.heartsEnabled ? { ...p, hearts: Math.max(0, heartsNow(p) - 1), heartsAt: Date.now() } : p));
}

/** Zähler für Tagesquests und Statistik erhöhen. */
export function bump(key: keyof Omit<DayStats, 'date'>, n = 1): void {
  update((p) => ({ ...p, day: { ...p.day, [key]: p.day[key] + n } }));
}

export function bumpTotal(key: keyof Progress['totals'], n = 1): void {
  update((p) => ({ ...p, totals: { ...p.totals, [key]: key === 'rushBest' ? Math.max(p.totals.rushBest, n) : p.totals[key] + n } }));
}

/** Fehlermuster aus analysierten eigenen Partien zählen. */
export function addPatterns(list: string[]): void {
  update((p) => {
    const patterns = { ...p.patterns };
    for (const k of list) patterns[k] = (patterns[k] ?? 0) + 1;
    return { ...p, patterns, totals: { ...p.totals, analyses: p.totals.analyses + 1 } };
  });
}

export function recordTrainer(id: string, score: number): void {
  update((p) => ({
    ...p,
    trainerBest: { ...p.trainerBest, [id]: Math.max(score, p.trainerBest[id] ?? 0) },
    day: { ...p.day, trainers: p.day.trainers + 1 },
  }));
}

export function resetProgress(): void {
  update(() => ({ ...initial }));
}

export const levelFromXp = (xp: number) => {
  // Jede Stufe braucht etwas mehr XP als die vorige
  let level = 1;
  let need = 100;
  let rest = xp;
  while (rest >= need) {
    rest -= need;
    level++;
    need = Math.round(need * 1.15);
  }
  return { level, into: rest, need };
};
