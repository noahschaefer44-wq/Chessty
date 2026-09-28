import { Chess } from 'chess.js';
import { lessons } from './index';
import { walkLesson } from './walk';
import type { Category, Explain, Level } from './types';

export interface ExamItem {
  fen: string;
  solution: string[];
  prompt: Explain;
  success: Explain;
  from: string;
  lessonId: string;
}

/** Alle Aufgaben (Zug-Schritte) aus den gegebenen Lektionen als Prüfungsfragen. */
export function itemsFrom(ids: string[]): ExamItem[] {
  const out: ExamItem[] = [];
  for (const id of ids) {
    const l = lessons.find((x) => x.id === id);
    if (!l) continue;
    const pos = walkLesson(l);
    l.steps.forEach((s, i) => {
      if (s.kind !== 'move') return;
      // Nur Aufgaben mit eindeutiger Stellung (keine reinen Folgezüge ohne Text)
      out.push({ fen: pos[i].shown, solution: s.solution, prompt: s.prompt, success: s.success, from: l.title, lessonId: l.id });
    });
  }
  return out;
}

export function chapterIds(cat: Category, level: Level): string[] {
  return lessons.filter((l) => l.category === cat && l.level === level).map((l) => l.id);
}

export function pick<T>(arr: T[], n: number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a.slice(0, n);
}

export const sideToMove = (fen: string) => (new Chess(fen).turn() === 'w' ? 'white' : 'black');
