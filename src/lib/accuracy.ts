// Genauigkeit wie auf Lichess: Gewinnwahrscheinlichkeit pro Zug, dann Mittel aus
// volatilitätsgewichtetem und harmonischem Mittel (Patzer ziehen den Wert stark nach unten).
// Quelle der Formeln: lichess.org/page/accuracy

/** Gewinnchance (0–100) aus Sicht von Weiß, Eingabe in Centipawns (Matt = ±10000). */
export function winPct(cp: number): number {
  const c = Math.max(-1000, Math.min(1000, cp));
  return 50 + 50 * (2 / (1 + Math.exp(-0.00368208 * c)) - 1);
}

/** Genauigkeit eines einzelnen Zuges aus Gewinnchance vorher/nachher (aus Sicht des Ziehenden). */
export function moveAccuracy(winBefore: number, winAfter: number): number {
  if (winAfter >= winBefore) return 100;
  const diff = winBefore - winAfter;
  const raw = 103.1668 * Math.exp(-0.04354 * diff) - 3.1669 + 1;
  return Math.max(0, Math.min(100, raw));
}

const std = (a: number[]) => {
  const m = a.reduce((x, y) => x + y, 0) / a.length;
  return Math.sqrt(a.reduce((x, y) => x + (y - m) ** 2, 0) / a.length);
};

/**
 * cps: Bewertungen aus Sicht von Weiß in Centipawns, Länge = Züge + 1 (Startstellung zuerst).
 * Zug i wird von Weiß gespielt, wenn i gerade ist (bzw. `whiteStarts` = false bei Start mit Schwarz).
 */
export function gameAccuracy(cps: number[], whiteStarts = true): { white: number; black: number; perMove: number[] } {
  const wins = cps.map(winPct);
  const n = cps.length - 1;
  const windowSize = Math.max(2, Math.min(8, Math.floor(n / 10)));
  // Volatilität: Standardabweichung der Gewinnchance in einem gleitenden Fenster
  const windows: number[][] = [];
  for (let i = 0; i < n; i++) {
    const start = Math.max(0, Math.min(i - Math.floor(windowSize / 2), wins.length - windowSize));
    windows.push(wins.slice(start, start + windowSize));
  }
  const weights = windows.map((w) => Math.max(0.5, Math.min(12, std(w))));
  const perMove: number[] = [];
  const acc = { w: [] as { a: number; wt: number }[], b: [] as { a: number; wt: number }[] };
  for (let i = 0; i < n; i++) {
    const whiteMove = (i % 2 === 0) === whiteStarts;
    const before = whiteMove ? wins[i] : 100 - wins[i];
    const after = whiteMove ? wins[i + 1] : 100 - wins[i + 1];
    const a = moveAccuracy(before, after);
    perMove.push(a);
    (whiteMove ? acc.w : acc.b).push({ a, wt: weights[i] });
  }
  const combine = (list: { a: number; wt: number }[]) => {
    if (!list.length) return 0;
    const weighted = list.reduce((s, x) => s + x.a * x.wt, 0) / list.reduce((s, x) => s + x.wt, 0);
    const harmonic = list.length / list.reduce((s, x) => s + 1 / Math.max(x.a, 1), 0);
    return (weighted + harmonic) / 2;
  };
  return { white: combine(acc.w), black: combine(acc.b), perMove };
}
