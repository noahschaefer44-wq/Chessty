import { useSyncExternalStore } from 'react';
import { load, save } from './storage';

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
};

let state: Progress = load(KEY, initial);
const listeners = new Set<() => void>();

export const today = () => new Date().toISOString().slice(0, 10);
const dayDiff = (a: string, b: string) =>
  Math.round((Date.parse(b) - Date.parse(a)) / 86400000);

function rollDay(p: Progress): Progress {
  const t = today();
  if (p.lastActiveDay === t) return p;
  return { ...p, dailyXp: 0 };
}
state = rollDay(state);

export function getProgress(): Progress {
  return state;
}

export function update(fn: (p: Progress) => Progress): void {
  state = fn(rollDay(state));
  save(KEY, state);
  listeners.forEach((l) => l());
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
    if (p.lastActiveDay !== t) {
      streak = p.lastActiveDay && dayDiff(p.lastActiveDay, t) === 1 ? p.streak + 1 : 1;
    }
    return { ...p, xp: p.xp + amount, dailyXp: p.dailyXp + amount, streak, lastActiveDay: t };
  });
}

export function completeLesson(id: string, stars: number, xp: number): void {
  update((p) => {
    const prev = p.lessons[id];
    return {
      ...p,
      lessons: { ...p.lessons, [id]: { done: true, stars: Math.max(stars, prev?.stars ?? 0) } },
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
