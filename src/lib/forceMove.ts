// Admin-Panel: einen beliebigen (auch illegalen) Zug auf einer FEN ausführen.
import { validateFen } from 'chess.js';

export interface ForcedMove {
  fen: string;
  label: string;
  capturedKing: boolean;
  /** Kann chess.js/Stockfish mit der neuen Stellung weiterspielen? */
  valid: boolean;
}

const idx = (sq: string) => ({ f: sq.charCodeAt(0) - 97, r: Number(sq[1]) - 1 });

export function forceMove(fen: string, uci: string): ForcedMove | null {
  const [boardPart, turn, castling, , , full] = fen.split(' ');
  const board: (string | null)[][] = boardPart.split('/').map((row) => {
    const out: (string | null)[] = [];
    for (const ch of row) {
      if (/\d/.test(ch)) for (let i = 0; i < Number(ch); i++) out.push(null);
      else out.push(ch);
    }
    return out;
  }); // board[0] = 8. Reihe
  const a = idx(uci.slice(0, 2));
  const b = idx(uci.slice(2, 4));
  if (a.f === b.f && a.r === b.r) return null;
  const piece = board[7 - a.r][a.f];
  if (!piece) return null;
  const target = board[7 - b.r][b.f];
  const capturedKing = target === 'K' || target === 'k';
  const white = piece === piece.toUpperCase();
  let placed = piece;
  // Bauer auf der letzten (oder ersten) Reihe wird zur Dame, damit die Stellung gültig bleibt
  if (piece.toLowerCase() === 'p' && (b.r === 7 || b.r === 0)) placed = white ? 'Q' : 'q';
  board[7 - a.r][a.f] = null;
  board[7 - b.r][b.f] = placed;

  const rows = board.map((row) => {
    let s = '';
    let n = 0;
    for (const x of row) {
      if (!x) n++;
      else {
        if (n) s += n;
        n = 0;
        s += x;
      }
    }
    return s + (n ? n : '');
  });
  // Rochaderechte entfernen, wenn König oder Turm beteiligt sind
  let cr = castling === '-' ? '' : castling;
  const touched = [uci.slice(0, 2), uci.slice(2, 4)];
  const drop = (sq: string, rights: string) => touched.includes(sq) && (cr = cr.replace(new RegExp(`[${rights}]`, 'g'), ''));
  drop('e1', 'KQ');
  drop('h1', 'K');
  drop('a1', 'Q');
  drop('e8', 'kq');
  drop('h8', 'k');
  drop('a8', 'q');
  const nextTurn = turn === 'w' ? 'b' : 'w';
  const fullmove = Number(full || 1) + (turn === 'b' ? 1 : 0);
  const out = `${rows.join('/')} ${nextTurn} ${cr || '-'} - 0 ${fullmove}`;
  const label = `${uci.slice(0, 2)}–${uci.slice(2, 4)}!?`;
  let valid = false;
  try {
    valid = validateFen(out).ok;
  } catch {
    valid = false;
  }
  // Rochaderechte, die chess.js nicht akzeptiert, verwerfen und erneut prüfen
  if (!valid && cr) {
    const alt = `${rows.join('/')} ${nextTurn} - - 0 ${fullmove}`;
    if (validateFen(alt).ok) return { fen: alt, label, capturedKing, valid: true };
  }
  return { fen: out, label, capturedKing, valid };
}
