import { Chess } from 'chess.js';
import { formatEval, winChance, type EngineLine } from './engine';
import { sanDe, parseUci, material, pieceName, uciToSan } from './chess';

export type Quality = 'best' | 'good' | 'inaccuracy' | 'mistake' | 'blunder';
export type Pattern = 'missedMate' | 'allowedMate' | 'hanging' | 'tactic' | 'positional';

export const Q_LABEL: Record<Quality, string> = { best: 'Bester Zug', good: 'Gut', inaccuracy: 'Ungenauigkeit ?!', mistake: 'Fehler ?', blunder: 'Patzer ??' };

export const PATTERN_INFO: Record<Pattern, { name: string; tip: string; link: string; linkText: string }> = {
  missedMate: { name: 'Matt übersehen', tip: 'Prüfe in jeder Stellung zuerst alle Schachgebote.', link: '#/lektion/g-mattbilder', linkText: 'Mattbilder lernen' },
  allowedMate: { name: 'Matt zugelassen', tip: 'Frage vor jedem Zug: Was droht mein Gegner?', link: '#/training/droht', linkText: 'Trainer „Was droht?“' },
  hanging: { name: 'Figur eingestellt', tip: 'Zähle vor jedem Zug Angreifer und Verteidiger.', link: '#/training/haengend', linkText: 'Trainer „Hängende Figuren“' },
  tactic: { name: 'Taktik des Gegners übersehen', tip: 'Achte auf Gabeln, Fesselungen und Abzüge.', link: '#/taktik', linkText: 'Taktik-Training' },
  positional: { name: 'Ungenauer Plan', tip: 'Verbessere deine schlechteste Figur, bevor du angreifst.', link: '#/lernen/strategie', linkText: 'Strategie-Lektionen' },
};

export interface Judged {
  quality: Quality;
  pattern?: Pattern;
  text?: string;
  bestSan?: string;
}

/** Bewertet einen Zug anhand der Engine-Bewertungen vor und nach dem Zug. */
export function judgeMove(fenBefore: string, moveUci: string, before: EngineLine | undefined, after: EngineLine | undefined, best?: string): Judged {
  const c = new Chess(fenBefore);
  const color = c.turn();
  const mv = c.move(parseUci(moveUci));
  const me = color === 'w';
  const wcB = me ? winChance(before) : 1 - winChance(before);
  const wcA = me ? winChance(after) : 1 - winChance(after);
  const drop = wcB - wcA;
  const bestSan = best ? uciToSan(fenBefore, best) : undefined;
  // Schwellen wie Lichess: 10 / 20 / 30 Prozentpunkte Gewinnchance
  const quality: Quality = best === moveUci ? 'best' : drop >= 0.3 ? 'blunder' : drop >= 0.2 ? 'mistake' : drop >= 0.1 ? 'inaccuracy' : 'good';
  if (quality === 'best' || quality === 'good') return { quality, bestSan };
  const sign = me ? 1 : -1;
  const san = mv.san;
  if (before?.mate !== undefined && before.mate * sign > 0 && !(after?.mate !== undefined && after.mate * sign > 0))
    return { quality, bestSan, pattern: 'missedMate', text: `Du hattest ein **Matt in ${Math.abs(before.mate)}** – beginnend mit **${sanDe(bestSan ?? '')}**. Suche immer zuerst nach Schachgeboten!` };
  if (after?.mate !== undefined && after.mate * sign < 0)
    return { quality, bestSan, pattern: 'allowedMate', text: `Nach ${sanDe(san)} kann der Gegner **in ${Math.abs(after.mate)} Zügen mattsetzen**. Prüfe vor jedem Zug: Welche Schachs und Drohungen hat der Gegner?` };
  const reply = after?.pv[0];
  if (reply) {
    const d = new Chess(c.fen());
    const matBefore = material(new Chess(fenBefore));
    const r = d.move(parseUci(reply));
    if (r?.captured) {
      const matAfter = material(d);
      const lost = me ? matBefore.white - matAfter.white : matBefore.black - matAfter.black;
      if (lost >= 2)
        return { quality, bestSan, pattern: 'hanging', text: `Nach ${sanDe(san)} schlägt der Gegner mit **${sanDe(r.san)}** deinen ${pieceName[r.captured]} auf ${r.to}. Stand die Figur ungedeckt? Besser war **${sanDe(bestSan ?? '')}**.` };
    }
    if (r)
      return {
        quality,
        bestSan,
        pattern: quality === 'inaccuracy' ? 'positional' : 'tactic',
        text: `Der Gegner antwortet stark mit **${sanDe(r.san)}**. Besser war **${sanDe(bestSan ?? '')}** (Bewertung ${formatEval(before)} statt ${formatEval(after)}).`,
      };
  }
  return { quality, bestSan, pattern: 'positional', text: `Besser war **${sanDe(bestSan ?? '')}**.` };
}
