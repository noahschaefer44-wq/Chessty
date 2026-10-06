// Stellungen spiegeln, damit ein gelerntes Motiv in neuer Gestalt geübt werden kann.
// 'files'  = an der Mittellinie spiegeln (a↔h), nur ohne Rochaderechte gleichwertig
// 'colors' = Farben tauschen und Brett umdrehen (Weiß↔Schwarz), immer gleichwertig

export type Mirror = 'files' | 'colors';

const flipFile = (f: string) => String.fromCharCode(201 - f.charCodeAt(0)); // a(97) ↔ h(104)
const flipRank = (r: string) => String(9 - Number(r));

export function mirrorSquare(sq: string, how: Mirror): string {
  return how === 'files' ? flipFile(sq[0]) + sq[1] : sq[0] + flipRank(sq[1]);
}

export function mirrorUci(u: string, how: Mirror): string {
  return mirrorSquare(u.slice(0, 2), how) + mirrorSquare(u.slice(2, 4), how) + u.slice(4);
}

const swapCase = (s: string) => s.replace(/[a-zA-Z]/g, (c) => (c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase()));

export function mirrorFen(fen: string, how: Mirror): string {
  const [board, turn, castling, ep, half = '0', full = '1'] = fen.split(' ');
  const ranks = board.split('/');
  if (how === 'files') {
    const expand = (r: string) => r.replace(/\d/g, (d) => '1'.repeat(Number(d)));
    const pack = (r: string) => r.replace(/1+/g, (m) => String(m.length));
    const nb = ranks.map((r) => pack([...expand(r)].reverse().join(''))).join('/');
    return [nb, turn, '-', ep === '-' ? '-' : mirrorSquare(ep, how), half, full].join(' ');
  }
  const nb = [...ranks].reverse().map(swapCase).join('/');
  return [nb, turn === 'w' ? 'b' : 'w', castling === '-' ? '-' : normCastling(swapCase(castling)), ep === '-' ? '-' : mirrorSquare(ep, how), half, full].join(' ');
}

/** Rochade-Kürzel in der üblichen Reihenfolge KQkq. */
function normCastling(c: string): string {
  if (c === '-') return c;
  return ['K', 'Q', 'k', 'q'].filter((x) => c.includes(x)).join('') || '-';
}

/** Welche Spiegelung passt: ohne Rochaderechte beide, sonst nur Farbtausch. */
export function mirrorsFor(fen: string): Mirror[] {
  return fen.split(' ')[2] === '-' ? ['files', 'colors'] : ['colors'];
}

/** Feldnamen (und bei Farbtausch Farbwörter) in einem Erklärtext mitspiegeln. */
export function mirrorText(text: string, how: Mirror): string {
  let t = text.replace(/\b([a-h])([1-8])\b/g, (_, f: string, r: string) => mirrorSquare(f + r, how));
  if (how === 'colors') {
    const pairs: [string, string][] = [['Weiß', 'Schwarz'], ['weiße', 'schwarze'], ['weißen', 'schwarzen'], ['weißer', 'schwarzer'], ['weißes', 'schwarzes']];
    const map = new Map(pairs.flatMap(([a, b]) => [[a, b], [b, a]] as [string, string][]));
    t = t.replace(/(?<!\p{L})(Weiß|Schwarz|weißen|schwarzen|weißer|schwarzer|weißes|schwarzes|weiße|schwarze)(?!\p{L})/gu, (w) => map.get(w) ?? w);
  }
  return t;
}
