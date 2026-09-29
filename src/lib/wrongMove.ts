// Gemeinsame Erklärung für falsche Züge: Was ist schlecht daran, was antwortet der Gegner, war der Zug vielleicht auch gut?
import { Chess } from 'chess.js';
import { engine, formatEval, evalNumber, type EngineLine } from './engine';
import { judgeMove } from './explainMove';
import { sanDe, parseUci, tryMove, pieceName } from './chess';
import { openingName } from './openings';

export interface WrongMoveInfo {
  /** 'ok' = laut Engine gleichwertig, 'playable' = spielbar, 'bad' = schlecht */
  verdict: 'ok' | 'playable' | 'bad';
  headline: string;
  text: string;
  /** Widerlegung ab der Stellung nach dem falschen Zug (SAN, deutsche Notation) */
  line: string[];
  /** Pfeile: eigener Zug (grau), Antwort des Gegners (schwarz) */
  arrows: string[];
  /** FENs der Widerlegung zum Nachspielen: [nach deinem Zug, nach Antwort, …] */
  fens: string[];
  /** Züge der Widerlegung als [von, nach] passend zu fens[1..] */
  moves: [string, string][];
  evalMine?: EngineLine;
  evalBest?: EngineLine;
}

const pawns = (l?: EngineLine, white = true) => evalNumber(l) * (white ? 1 : -1);

/** Beschreibt, was der gegnerische Antwortzug konkret tut. */
function describeReply(fen: string, uci: string): string {
  const c = new Chess(fen);
  const m = tryMove(c, uci);
  if (!m) return '';
  if (c.isCheckmate()) return `**${sanDe(m.san)}** ist sofort Matt.`;
  const parts: string[] = [];
  if (m.captured) parts.push(`schlägt deinen ${pieceName[m.captured]} auf ${m.to}`);
  if (c.inCheck()) parts.push('gibt Schach');
  // Doppelangriff erkennen: Wie viele eigene (ungeschützte oder wertvollere) Figuren greift die gezogene Figur jetzt an?
  const targets = c
    .moves({ square: m.to, verbose: true })
    .filter((x) => x.captured && x.captured !== 'p')
    .map((x) => pieceName[x.captured!]);
  if (targets.length >= 2) parts.push(`greift gleichzeitig ${targets.slice(0, 3).join(' und ')} an (Doppelangriff)`);
  else if (targets.length === 1 && !m.captured) parts.push(`greift deinen ${targets[0]} an`);
  return parts.length ? `**${sanDe(m.san)}** ${parts.join(', ')}.` : `Stark ist **${sanDe(m.san)}**.`;
}

/**
 * Erklärt einen Zug, der nicht der gesuchte war.
 * @param fen Stellung vor dem Zug
 * @param uci gespielter Zug
 * @param expected gesuchter Zug (UCI oder SAN), optional
 */
export async function explainWrongMove(fen: string, uci: string, expected?: string, opts: { depth?: number; openingMoves?: string[] } = {}): Promise<WrongMoveInfo> {
  const depth = opts.depth ?? 13;
  const white = fen.split(' ')[1] === 'w';
  const before = await engine.analyse(fen, { depth });
  const c = new Chess(fen);
  const mv = tryMove(c, uci)!;
  const afterFen = c.fen();
  let after: { best: string; lines: EngineLine[] };
  if (c.isGameOver()) after = { best: '', lines: [{ depth: 0, multipv: 1, pv: [], cp: c.isCheckmate() ? (c.turn() === 'w' ? -100 : 100) : 0 }] };
  else after = await engine.analyse(afterFen, { depth });
  const j = judgeMove(fen, uci, before.lines[0], after.lines[0], before.best);
  const expSan = expected ? new Chess(fen).move(/^[a-h][1-8][a-h][1-8]/.test(expected) ? parseUci(expected) : expected)?.san : undefined;
  const loss = pawns(before.lines[0], white) - pawns(after.lines[0], white);

  // Widerlegung zum Nachspielen (bis zu 4 Halbzüge)
  const line: string[] = [];
  const fens = [afterFen];
  const moves: [string, string][] = [];
  const arrows = ['!' + uci.slice(0, 4)];
  const pc = new Chess(afterFen);
  for (const u of (after.lines[0]?.pv ?? []).slice(0, 4)) {
    const m = tryMove(pc, u);
    if (!m) break;
    line.push(sanDe(m.san));
    fens.push(pc.fen());
    moves.push([m.from, m.to]);
  }
  if (after.lines[0]?.pv[0]) arrows.push(after.lines[0].pv[0].slice(0, 4));

  // Benannte Eröffnung nach dem Zug (für Eröffnungstraining)
  let opening = '';
  if (opts.openingMoves) opening = await openingName([...opts.openingMoves, mv.san]);

  const evalTxt = `Bewertung nach deinem Zug: ${formatEval(after.lines[0])} (bester Zug: ${formatEval(before.lines[0])}).`;
  const reply = after.lines[0]?.pv[0] ? describeReply(afterFen, after.lines[0].pv[0]) : '';
  const expTxt = expSan ? ` Gesucht war **${sanDe(expSan)}**.` : '';

  if (j.quality === 'best' || j.quality === 'good' || loss < 0.3) {
    return {
      verdict: 'ok',
      headline: `${sanDe(mv.san)} ist laut Engine auch gut!`,
      text: `Dein Zug ist fast genauso stark.${opening ? ` Er führt zu: ${opening}.` : ''}${expTxt} Hier geht es aber um die Idee hinter einem bestimmten Zug – such ihn noch einmal. ${evalTxt}`,
      line,
      arrows,
      fens,
      moves,
      evalMine: after.lines[0],
      evalBest: before.lines[0],
    };
  }
  if (loss < 1) {
    return {
      verdict: 'playable',
      headline: `${sanDe(mv.san)} ist spielbar, aber ungenau.`,
      text: `${reply ? 'Der Gegner antwortet: ' + reply + ' ' : ''}${j.text ? j.text + ' ' : ''}${opening ? `(Führt zu: ${opening}.) ` : ''}${expTxt} ${evalTxt}`,
      line,
      arrows,
      fens,
      moves,
      evalMine: after.lines[0],
      evalBest: before.lines[0],
    };
  }
  return {
    verdict: 'bad',
    headline: j.quality === 'blunder' ? `${sanDe(mv.san)} ist ein Patzer.` : `${sanDe(mv.san)} ist ein Fehler.`,
    text: `${reply ? 'Der Gegner antwortet: ' + reply + ' ' : ''}${j.text ?? ''}${expTxt} ${evalTxt}`,
    line,
    arrows,
    fens,
    moves,
    evalMine: after.lines[0],
    evalBest: before.lines[0],
  };
}
