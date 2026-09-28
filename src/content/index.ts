import type { Lesson, MasterGame } from './types';
import { grundlagen } from './lessons/grundlagen';
import { taktik } from './lessons/taktik';
import { strategie } from './lessons/strategie';
import { eroeffnungen } from './lessons/eroeffnungen';
import { endspiele } from './lessons/endspiele';
import { MASTERS } from './masters';

const byLevel = (a: Lesson, b: Lesson) => a.level - b.level;

export const lessons: Lesson[] = [
  ...grundlagen.sort(byLevel),
  ...taktik.sort(byLevel),
  ...strategie.sort(byLevel),
  ...eroeffnungen.sort(byLevel),
  ...endspiele.sort(byLevel),
];
export const masters: MasterGame[] = MASTERS;

export const lessonById = (id: string) => lessons.find((l) => l.id === id);
export const masterById = (id: string) => masters.find((m) => m.id === id);
