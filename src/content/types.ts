export type Level = 1 | 2 | 3 | 4;
export const LEVELS: Record<Level, string> = {
  1: 'Einsteiger',
  2: 'Fortgeschritten',
  3: 'Experte',
  4: 'Meister',
};

export type Category = 'grundlagen' | 'taktik' | 'strategie' | 'eroeffnungen' | 'endspiele';
export const CATEGORIES: { id: Category; name: string; blurb: string }[] = [
  { id: 'grundlagen', name: 'Grundlagen', blurb: 'Regeln, Figuren, Mattbilder, erste Prinzipien' },
  { id: 'taktik', name: 'Taktik', blurb: 'Gabel, Fesselung, Opfer – Motive erkennen und berechnen' },
  { id: 'strategie', name: 'Strategie', blurb: 'Bauernstrukturen, Figurenqualität, Pläne' },
  { id: 'eroeffnungen', name: 'Eröffnungen', blurb: 'Ideen, Hauptvarianten, Fallen, typische Fehler' },
  { id: 'endspiele', name: 'Endspiele', blurb: 'Grundmatts, Bauern- und Turmendspiele' },
];

/**
 * Erklärung in drei Tiefen:
 *  short – ein, zwei Sätze, das Wichtigste
 *  why   – die Idee dahinter (optional)
 *  pro   – Vertiefung: Varianten, Feinheiten, Geschichte (optional)
 */
export interface Explain {
  short: string;
  why?: string;
  pro?: string;
}

export interface InfoStep {
  kind: 'info';
  /** Neue Ausgangsstellung (FEN) für diesen Schritt */
  fen?: string;
  /** Züge (SAN), die vor dem Text automatisch gespielt werden */
  play?: string[];
  text: Explain;
  /** Pfeile/Kreise: "e2e4" Pfeil, "e4" Kreis, "!" = Fehler, "?" = Alternative */
  arrows?: string[];
  title?: string;
}

export interface MoveStep {
  kind: 'move';
  fen?: string;
  play?: string[];
  title?: string;
  /** Aufgabe */
  prompt: Explain;
  /** Akzeptierte Züge in SAN (der erste ist die Hauptlösung) */
  solution: string[];
  /** Automatische Antwort des Gegners nach richtigem Zug (SAN) */
  reply?: string;
  /** Erklärung nach dem richtigen Zug */
  success: Explain;
  /** Typische Fehler mit Erklärung */
  /** Typische Fehler; soft = prinzipieller statt taktischer Fehler (Engine-Unterschied klein) */
  mistakes?: { san: string; text: Explain; soft?: boolean }[];
  hint?: string;
  arrows?: string[];
  /** Pfeile, die nach dem richtigen Zug gezeigt werden */
  successArrows?: string[];
}

export type Step = InfoStep | MoveStep;

export interface Lesson {
  id: string;
  title: string;
  category: Category;
  level: Level;
  summary: string;
  orientation?: 'white' | 'black';
  /** Startstellung; Standard ist die Grundstellung */
  fen?: string;
  steps: Step[];
  /** Zusammenfassung typischer Fehler für die Abschlusskarte */
  pitfalls?: string[];
  /** Kernaussagen zum Merken */
  takeaways?: string[];
  /** Eröffnungslektionen: Variante für das Training (SAN, ab Grundstellung) */
  drill?: { name: string; moves: string[]; color: 'white' | 'black' }[];
}

export interface MasterGame {
  id: string;
  title: string;
  white: string;
  black: string;
  event: string;
  year: number;
  result: string;
  hero: 'white' | 'black';
  level: Level;
  intro: Explain;
  moves: string[];
  /** Schlüsselmomente: Index des Halbzugs (0 = 1. Zug von Weiß), den der Lernende finden soll */
  moments: { ply: number; prompt: Explain; explain: Explain; accept?: string[]; arrows?: string[] }[];
  /** Kurze Kommentare zu anderen Halbzügen */
  notes?: Record<number, string>;
  outro: Explain;
}

/** Schlanke Lektions-Übersicht (ohne Schritte) für Lernpfad und Startseite, siehe meta.ts */
export type LessonMeta = Pick<Lesson, 'id' | 'title' | 'category' | 'level' | 'summary'>;
