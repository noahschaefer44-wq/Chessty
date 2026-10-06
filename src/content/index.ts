import type { Lesson, MasterGame } from './types';
import { grundlagen } from './lessons/grundlagen';
import { taktik } from './lessons/taktik';
import { taktik2 } from './lessons/taktik2';
import { strategie } from './lessons/strategie';
import { strategie2 } from './lessons/strategie2';
import { eroeffnungen } from './lessons/eroeffnungen';
import { eroeffnungen2 } from './lessons/eroeffnungen2';
import { endspiele } from './lessons/endspiele';
import { endspiele2 } from './lessons/endspiele2';
import { MASTERS } from './masters';
import { fallen } from './traps';

const byLevel = (a: Lesson, b: Lesson) => a.level - b.level;

export const lessons: Lesson[] = [
  ...grundlagen.sort(byLevel),
  ...[...taktik, ...taktik2].sort(byLevel),
  ...[...strategie, ...strategie2].sort(byLevel),
  ...[...eroeffnungen, ...eroeffnungen2].sort(byLevel),
  ...fallen.sort(byLevel),
  ...[...endspiele, ...endspiele2].sort(byLevel),
];
export const masters: MasterGame[] = MASTERS;

export const lessonById = (id: string) => lessons.find((l) => l.id === id);
export const masterById = (id: string) => masters.find((m) => m.id === id);
