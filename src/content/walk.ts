import { Chess } from 'chess.js';
import type { Lesson } from './types';

export const START = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

export interface StepPositions {
  /** Stellung vor den automatisch gespielten Zügen */
  start: string;
  /** Stellung, in der der Text/die Aufgabe gezeigt wird */
  shown: string;
  /** Zuletzt gespielter Zug zur Hervorhebung */
  lastMove?: [string, string];
  /** Stellung nach Lösung (+ Antwort) */
  end: string;
  endLastMove?: [string, string];
}

/** Berechnet alle Stellungen einer Lektion vorab (wirft bei illegalen Zügen). */
export function walkLesson(lesson: Lesson): StepPositions[] {
  let pos = lesson.fen ?? START;
  let last: [string, string] | undefined;
  return lesson.steps.map((step, i) => {
    if (step.fen) {
      pos = step.fen;
      last = undefined;
    }
    const c = new Chess(pos);
    const start = pos;
    for (const san of step.play ?? []) {
      const m = c.move(san);
      if (!m) throw new Error(`${lesson.id} Schritt ${i + 1}: illegaler Zug ${san}`);
      last = [m.from, m.to];
    }
    const shown = c.fen();
    const shownLast = last;
    if (step.kind === 'move') {
      const m = c.move(step.solution[0]);
      last = [m.from, m.to];
      if (step.reply) {
        const r = c.move(step.reply);
        last = [r.from, r.to];
      }
    }
    pos = c.fen();
    return { start, shown, lastMove: shownLast, end: pos, endLastMove: last };
  });
}

export const stripSan = (san: string) => san.replace(/[+#!?]/g, '');
