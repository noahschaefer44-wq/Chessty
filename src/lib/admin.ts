// Admin-Panel des Eigentümers: Cheats, Zeitreise, Optik- und Debug-Werkzeuge mit vollem Zugriff.
// Alles läuft lokal im Browser. Vor dem ersten Eingriff wird der Fortschritt einmalig gesichert
// (wiederherstellbar im Panel); Server-Zugriffe bleiben unverändert erlaubt.
import { useSyncExternalStore } from 'react';

const KEY = 'chessty.admin';
const SNAP = 'chessty.admin.snapshot';
const PROGRESS_KEY = 'chessty.progress.v1';
// SHA-256 von "chessty-admin:" + Passphrase (die Passphrase selbst steht nicht im Code)
const PASS_HASH = '5cfc0d917695957160dab1f6255f17c7e8720490a557845b21d5f40d366b7fad';

export const FLAGS = {
  // Spiel
  freeMoves: { group: 'Spiel', label: 'Illegale Züge (gegen Bots)', desc: 'Eigene Figuren beliebig ziehen, auch Gegner schlagen oder König schlagen.' },
  clairvoyance: { group: 'Spiel', label: 'Hellsehen', desc: 'Immer den besten Engine-Zug als Pfeil zeigen.' },
  freezeClock: { group: 'Spiel', label: 'Uhr einfrieren', desc: 'Deine Schachuhr läuft nicht ab.' },
  weakBot: { group: 'Spiel', label: 'Bot sabotieren', desc: 'Bots ziehen zufällig.' },
  solutionArrows: { group: 'Spiel', label: 'Lösungspfeile', desc: 'In Puzzles und Lektionen die Lösung anzeigen.' },
  infiniteHearts: { group: 'Spiel', label: 'Unendlich Herzen', desc: 'Fehler kosten keine Herzen.' },
  xpBoost: { group: 'Spiel', label: 'XP ×10', desc: 'Jede XP-Gutschrift zählt zehnfach.' },
  unlockAll: { group: 'Spiel', label: 'Alles offen', desc: 'Keine gesperrten Lektionen im Lernpfad.' },
  perfectStars: { group: 'Spiel', label: 'Immer 3 Sterne', desc: 'Lektionen zählen immer als fehlerfrei.' },
  showEval: { group: 'Spiel', label: 'Bewertung immer sichtbar', desc: 'Bewertungsbalken in Bot-Partien und Puzzles.' },
  botBlunder: { group: 'Spiel', label: 'Bot stellt Figuren ein', desc: 'Bots spielen absichtlich den schlechtesten Schlagzug.' },
  freeUndo: { group: 'Spiel', label: 'Zurücknehmen immer', desc: 'Zug zurück auch mit Schachuhr und nach Partieende.' },
  // Optik
  flip: { group: 'Optik', label: 'Kopfstand', desc: 'Ganze Seite um 180° drehen.' },
  mirror: { group: 'Optik', label: 'Spiegel', desc: 'Seite horizontal spiegeln.' },
  invert: { group: 'Optik', label: 'Negativ', desc: 'Farben umkehren.' },
  giant: { group: 'Optik', label: 'Riesenfiguren', desc: 'Figuren doppelt so groß.' },
  wobble: { group: 'Optik', label: 'Wackelfiguren', desc: 'Figuren wackeln ständig.' },
  disco: { group: 'Optik', label: 'Disco', desc: 'Brett blinkt im Takt.' },
  tilt: { group: 'Optik', label: '3D-Brett', desc: 'Varianten-Bretter und Diagramme perspektivisch kippen.' },
  terminal: { group: 'Optik', label: 'Terminal', desc: 'Alles in Monospace mit grünem Leuchten.' },
  slowmo: { group: 'Optik', label: 'Zeitlupe', desc: 'Alle Animationen 5× langsamer.' },
  confetti: { group: 'Optik', label: 'Konfetti-Regen', desc: 'Konfetti bei jedem Klick aufs Brett.' },
  // Debug
  outline: { group: 'Debug', label: 'Layout-Rahmen', desc: 'Umrisse aller Elemente zeigen.' },
  squareNames: { group: 'Debug', label: 'Feldnamen', desc: 'Jedes Feld mit Namen beschriften.' },
  fenBar: { group: 'Debug', label: 'FEN-Leiste', desc: 'Aktuelle Brettstellung (FEN) unten einblenden.' },
} as const;
export type Flag = keyof typeof FLAGS;

/** Flags, die das Spiel beeinflussen (vorher wird der Fortschritt einmal gesichert) */
const GAMEPLAY: Flag[] = ['freeMoves', 'clairvoyance', 'freezeClock', 'weakBot', 'solutionArrows', 'infiniteHearts', 'xpBoost', 'perfectStars', 'botBlunder'];

interface State {
  unlocked: boolean;
  open: boolean;
  flags: Partial<Record<Flag, boolean>>;
  /** Veraltet (früherer Testmodus) – wird ignoriert */
  tainted: boolean;
  timeOffsetDays: number;
}

function read(): State {
  try {
    const s = JSON.parse(localStorage.getItem(KEY) ?? 'null');
    if (s) return { unlocked: !!s.unlocked, open: false, flags: s.flags ?? {}, tainted: !!s.tainted, timeOffsetDays: Number(s.timeOffsetDays) || 0 };
  } catch {
    /* egal */
  }
  return { unlocked: false, open: false, flags: {}, tainted: false, timeOffsetDays: 0 };
}

let state = read();
const listeners = new Set<() => void>();
function set(patch: Partial<State>) {
  state = { ...state, ...patch };
  try {
    localStorage.setItem(KEY, JSON.stringify({ ...state, open: false }));
  } catch {
    /* egal */
  }
  applyBodyClasses();
  listeners.forEach((l) => l());
}

export const getAdmin = () => state;
export const useAdmin = () =>
  useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => state,
  );
export const flag = (f: Flag) => state.unlocked && !!state.flags[f];
/** Server-Schreibzugriffe blockieren? Nein – der Admin hat vollen Zugriff. */
export const serverBlocked = () => false;

/** Vor der ersten Manipulation den echten Fortschritt einmalig sichern (ohne Einschränkungen) */
export function taint() {
  try {
    const p = localStorage.getItem(PROGRESS_KEY);
    if (p && !localStorage.getItem(SNAP)) localStorage.setItem(SNAP, p);
  } catch {
    /* egal */
  }
}
export const hasBackup = () => {
  try {
    return !!localStorage.getItem(SNAP);
  } catch {
    return false;
  }
};
/** Sicherung verwerfen (aktueller Stand bleibt) */
export function dropBackup() {
  try {
    localStorage.removeItem(SNAP);
  } catch {
    /* egal */
  }
  listeners.forEach((l) => l());
}

export async function unlock(pass: string): Promise<boolean> {
  const data = new TextEncoder().encode('chessty-admin:' + pass.trim());
  const buf = await crypto.subtle.digest('SHA-256', data);
  const hex = [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
  if (hex !== PASS_HASH) return false;
  set({ unlocked: true, open: true });
  return true;
}

export const setOpen = (open: boolean) => set({ open: state.unlocked && open });
export const toggleOpen = () => set({ open: !state.open });

export function setFlag(f: Flag, on: boolean) {
  if (on && GAMEPLAY.includes(f)) taint();
  set({ flags: { ...state.flags, [f]: on } });
}

/** Gesicherten Fortschritt (vor dem ersten Cheat) wiederherstellen, alle Flags aus */
export function restoreBackup() {
  try {
    const snap = localStorage.getItem(SNAP);
    if (snap) localStorage.setItem(PROGRESS_KEY, snap);
    localStorage.removeItem(SNAP);
  } catch {
    /* egal */
  }
  set({ flags: {}, tainted: false, timeOffsetDays: 0, open: false });
  location.reload();
}

export function lock() {
  set({ unlocked: false, open: false });
}

export function setTimeOffset(days: number) {
  taint();
  set({ timeOffsetDays: days });
  location.reload();
}

// ---------- Aktionen der aktuellen Seite (z. B. „Sofort gewinnen“) ----------
export interface AdminAction {
  label: string;
  run: () => void;
}
let actions: { scope: string; list: AdminAction[] } | null = null;
const actionListeners = new Set<() => void>();
export function registerAdminActions(scope: string, list: AdminAction[]) {
  actions = { scope, list };
  actionListeners.forEach((l) => l());
  return () => {
    if (actions?.scope === scope) {
      actions = null;
      actionListeners.forEach((l) => l());
    }
  };
}
export const useAdminActions = () =>
  useSyncExternalStore(
    (l) => {
      actionListeners.add(l);
      return () => actionListeners.delete(l);
    },
    () => actions,
  );
/** Aktion ausführen und Fortschritt als Test markieren */
export function runAction(a: AdminAction) {
  taint();
  a.run();
}

// ---------- Aktuelle Brettstellung für die FEN-Leiste ----------
let currentFen = '';
const fenListeners = new Set<() => void>();
export function reportFen(fen: string) {
  if (fen === currentFen) return;
  currentFen = fen;
  fenListeners.forEach((l) => l());
}
export const useCurrentFen = () =>
  useSyncExternalStore(
    (l) => {
      fenListeners.add(l);
      return () => fenListeners.delete(l);
    },
    () => currentFen,
  );

// ---------- Optik: Klassen am <html>-Element ----------
function applyBodyClasses() {
  if (typeof document === 'undefined') return;
  const el = document.documentElement;
  for (const f of Object.keys(FLAGS) as Flag[]) el.classList.toggle('adm-' + f, flag(f));
}

// ---------- Zeitreise: Datum verschieben (wirkt nach Neuladen) ----------
export function installTimeTravel() {
  applyBodyClasses();
  const days = state.unlocked ? state.timeOffsetDays : 0;
  if (!days) return;
  const off = days * 86_400_000;
  const Real = Date;
  class Shifted extends Real {
    constructor(...a: unknown[]) {
      if (a.length === 0) super(Real.now() + off);
      else super(...(a as [string]));
    }
    static now() {
      return Real.now() + off;
    }
  }
  (globalThis as unknown as { Date: DateConstructor }).Date = Shifted as unknown as DateConstructor;
}
