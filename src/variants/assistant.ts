// Regel-Assistent: wandelt eine deutsche Beschreibung in Varianten-Regeln um.
// 1. Wenn der Browser eine eingebaute, kostenlose KI hat (Chrome „Prompt API“ / Gemini Nano, läuft lokal), wird sie genutzt.
// 2. Sonst (und als Absicherung) ein eigener Regel-Parser mit Schlüsselwörtern – kostenlos, offline, ohne Server.
import { BASE_RULES, fen960, pieceName, setupSize, type PieceDef, type Rules } from './engine';

export interface Design {
  name: string;
  base: Base;
  customFen: string;
  /** Figurentausch: n/b/r/q → neue Figur oder '' (entfernen) */
  swap: Record<string, string>;
  /** Nur für eine Farbe entfernen/tauschen? */
  swapSide: 'both' | 'w' | 'b';
  rules: Rules;
  /** Selbst definierte Figuren (Buchstaben x, y, j) */
  customPieces?: Record<string, PieceDef>;
}

export type Base = 'standard' | '960' | 'horde' | 'racing' | 'losalamos' | 'capablanca' | 'grand' | 'pawns' | 'custom';

/** Startaufstellungen der Werkstatt (Brett-Teil + Zugrecht) */
export const BASES: Record<Exclude<Base, 'custom' | '960'>, { label: string; fen: string }> = {
  standard: { label: 'Normale Grundstellung (8×8)', fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w' },
  horde: { label: 'Horde (36 Bauern gegen Armee)', fen: 'rnbqkbnr/pppppppp/8/1PP2PP1/PPPPPPPP/PPPPPPPP/PPPPPPPP/PPPPPPPP w' },
  racing: { label: 'Königsrennen', fen: '8/8/8/8/8/8/krbnNBRK/qrbnNBRQ w' },
  losalamos: { label: 'Kleines Brett 6×6 (Los Alamos)', fen: 'rnqknr/pppppp/6/6/PPPPPP/RNQKNR w' },
  capablanca: { label: 'Breites Brett 10×8 (Capablanca)', fen: 'rnhbqkbcnr/pppppppppp/10/10/10/10/PPPPPPPPPP/RNHBQKBCNR w' },
  grand: { label: 'Großes Brett 10×10 (Grand Chess)', fen: 'r8r/1nbqkchbn1/pppppppppp/10/10/10/10/PPPPPPPPPP/1NBQKCHBN1/R8R w' },
  pawns: { label: 'Nur Bauern (Bauernkrieg)', fen: '8/pppppppp/8/8/8/8/PPPPPPPP/8 w' },
};

export const START = BASES.standard.fen;

export const emptyDesign = (): Design => ({
  name: 'Meine Variante',
  base: 'standard',
  customFen: START,
  swap: {},
  swapSide: 'both',
  rules: { ...BASE_RULES, id: 'custom', name: 'Meine Variante' },
});

/** Startstellung aus dem Entwurf berechnen */
export function designSetup(d: Design): string {
  if (d.base === '960' && !Object.keys(d.swap).length) return '960';
  const fen = d.base === 'custom' ? d.customFen : d.base === '960' ? fen960() : (BASES[d.base] ?? BASES.standard).fen;
  if (!Object.keys(d.swap).length) return fen;
  const [board, turn = 'w'] = fen.split(' ');
  const out = board.replace(/[a-zA-Z]/g, (ch) => {
    const t = ch.toLowerCase();
    const white = ch !== t;
    if (d.swapSide === 'w' && !white) return ch;
    if (d.swapSide === 'b' && white) return ch;
    if (!(t in d.swap)) return ch;
    const n = d.swap[t];
    if (!n) return '1';
    return white ? n.toUpperCase() : n;
  });
  // Ziffern zusammenfassen („11“ → „2“)
  const norm = out.split('/').map((row) => row.replace(/\d+/g, (m) => String([...m].reduce((s, c) => s + Number(c), 0)))).join('/');
  return `${norm} ${turn}`;
}

export function designRules(d: Design): Rules {
  const setup = designSetup(d);
  // Märchen- und eigene Figuren aus der Startstellung dürfen auch durch Umwandlung entstehen
  const board = setup === '960' ? '' : setup.split(' ')[0].toLowerCase();
  const extra = new Set([...Object.values(d.swap), ...board].filter((x) => x && /[a-z]/.test(x) && !'pnbrqk'.includes(x)));
  const promo = [...d.rules.promo];
  for (const x of extra) if (!promo.includes(x)) promo.unshift(x);
  const pieces = d.customPieces && Object.keys(d.customPieces).length ? d.customPieces : undefined;
  return { ...d.rules, id: 'custom', name: d.name || 'Eigene Variante', setup, promo, pieces };
}

/** Bauchgefühl-Wert einer Figur: Anzahl erreichbarer Felder aus der Mitte eines leeren 8×8-Bretts */
export function autoValue(p: Omit<PieceDef, 'value'>): number {
  let n = 0;
  const sym = (vs: [number, number][]) => {
    const out = new Set<string>();
    for (const [a, b] of vs)
      for (const [x, y] of [[a, b], [b, a]])
        for (const sx of [1, -1]) for (const sy of [1, -1]) if (!p.forward || y * sy > 0) out.add(x * sx + ',' + y * sy);
    return [...out].map((k) => k.split(',').map(Number));
  };
  for (const [df, dr] of sym(p.leaps)) if (Math.abs(df) <= 3 && Math.abs(dr) <= 3) n++;
  for (const [df, dr] of sym(p.slides)) for (let k = 1; k <= (p.range || 7); k++) if (Math.abs(df * k) <= 3.5 && Math.abs(dr * k) <= 3.5) n++;
  return Math.max(80, Math.round(n * 38));
}

const DATIV_: Record<string, string> = { n: 'Springern', b: 'Läufern', r: 'Türmen', q: 'Damen', a: 'Amazonen', c: 'Kanzlern', h: 'Erzbischöfen', m: 'Männern', l: 'Kamelen', z: 'Zebras', f: 'Ferzen', e: 'Elefanten', u: 'Wesiren' };
const NAMES_: Record<string, string> = { n: 'Springer', b: 'Läufer', r: 'Türme', q: 'Damen', a: 'Amazonen', c: 'Kanzler', h: 'Erzbischöfe', p: 'Bauern', k: 'Könige', m: 'Männer', l: 'Kamele', z: 'Zebras', f: 'Ferzen', e: 'Elefanten', u: 'Wesire' };
// Eigene Figuren (x, y, j) haben keine festen Namen – dann der Buchstabe
const DATIV: Record<string, string> = new Proxy(DATIV_, { get: (o, k: string) => o[k] ?? k.toUpperCase() });
const NAMES: Record<string, string> = new Proxy(NAMES_, { get: (o, k: string) => o[k] ?? k.toUpperCase() });

/** Gangart in Worten (für eigene Figuren) */
export function describePiece(p: PieceDef): string {
  const parts: string[] = [];
  const has = (vs: [number, number][], a: number, b: number) => vs.some(([x, y]) => (x === a && y === b) || (x === b && y === a));
  if (p.slides.length) {
    const dirs = [has(p.slides, 1, 0) && 'gerade', has(p.slides, 1, 1) && 'schräg'].filter(Boolean).join(' und ');
    parts.push(`gleitet ${dirs}${p.range ? ` bis zu ${p.range} Felder` : ''}`);
  }
  const L: [number, number, string][] = [[1, 0, 'ein Feld gerade'], [1, 1, 'ein Feld schräg'], [1, 2, 'springt wie ein Springer'], [1, 3, 'springt wie ein Kamel (3,1)'], [2, 3, 'springt wie ein Zebra (3,2)'], [2, 0, 'springt zwei Felder gerade'], [2, 2, 'springt zwei Felder schräg']];
  for (const [a, b, t] of L) if (has(p.leaps, a, b)) parts.push(t);
  return (parts.join(', ') || 'kann nicht ziehen') + (p.forward ? ' – nur vorwärts' : '');
}

/** Regeln in deutschen Sätzen beschreiben */
export function describeRules(r: Rules, d?: Design): string[] {
  const out: string[] = [];
  if (d) {
    if (d.base === '960') out.push('Die Grundreihe wird zufällig gemischt (Chess960).');
    if (d.base === 'horde') out.push('Horde-Aufstellung: Weiß hat 36 Bauern und keinen König.');
    if (d.base === 'losalamos') out.push('Kleines 6×6-Brett ohne Läufer (Los Alamos).');
    if (d.base === 'capablanca') out.push('Breites 10×8-Brett mit Kanzler und Erzbischof (Capablanca).');
    if (d.base === 'grand') out.push('Großes 10×10-Brett (Grand Chess).');
    if (d.base === 'pawns') out.push('Nur Bauern.');
    for (const [k, p] of Object.entries(d.customPieces ?? {})) out.push(`Eigene Figur „${p.name}“ (${k.toUpperCase()}): ${describePiece(p)}.`);
    if (d.base === 'racing') out.push('Königsrennen-Aufstellung: alle Figuren auf den ersten beiden Reihen, keine Bauern.');
    if (d.base === 'custom') {
      const { w, h } = setupSize(d.customFen);
      out.push(`Eigene Startstellung (${w}×${h}).`);
    }
    const side = d.swapSide === 'w' ? ' (nur Weiß)' : d.swapSide === 'b' ? ' (nur Schwarz)' : '';
    for (const [from, to] of Object.entries(d.swap)) out.push(to ? `${NAMES[from]} werden zu ${DATIV[to]}${side}.` : `Ohne ${NAMES[from]}${side}.`);
  }
  if (r.antichess) out.push('Schlagschach: Wer alle Figuren verliert oder patt ist, gewinnt.');
  if (r.forcedCapture) out.push('Schlagzwang: Wer schlagen kann, muss schlagen.');
  if (!r.kingSafety && !r.antichess) out.push('Kein Schach: Der König darf geschlagen werden – wer ihn schlägt, gewinnt.');
  if (r.atomic) out.push('Atom: Schlagzüge explodieren und zerstören alle Nicht-Bauern ringsum.');
  if (r.drops) out.push('Geschlagene Figuren kommen in die eigene Reserve und dürfen eingesetzt werden.');
  if (r.duck) out.push('Nach jedem Zug wird die Ente auf ein leeres Feld gesetzt; sie blockiert für beide.');
  if (r.fog) out.push('Nebel: Man sieht nur Felder, die die eigenen Figuren erreichen.');
  if (r.checksToWin) out.push(`Wer ${r.checksToWin}-mal Schach gibt, gewinnt.`);
  if (r.hill) out.push('Wer den König ins Zentrum (d4, e4, d5, e5) bringt, gewinnt.');
  if (r.race) out.push('Wer den König zuerst auf die letzte Reihe bringt, gewinnt; Schachgebote sind verboten.');
  if (r.captureWin) out.push(`Wer ${r.captureWin === 'k' ? 'den König' : 'alle ' + (NAMES_[r.captureWin] ?? pieceName(r.captureWin, r))} des Gegners schlägt, gewinnt.`);
  if (r.promoteWins) out.push('Wer zuerst einen Bauern umwandelt, gewinnt.');
  if (r.moveLimit) out.push(`Nach ${r.moveLimit} Zügen gewinnt, wer mehr Material hat.`);
  if (r.noMovesLoses) out.push('Wer keinen Zug mehr hat, verliert.');
  if (r.doubleMove) out.push('Doppelzug: Jede Seite zieht zweimal (der allererste Zug ist einfach, ein Schach beendet die Runde).');
  const holes = (r.setup.split(' ')[0].match(/\*/g) ?? []).length;
  if (holes) out.push(`${holes} Löcher im Brett: gesperrte Felder, die niemand betreten oder überqueren kann.`);
  if (r.stalemateWins && !r.antichess) out.push('Wer patt gesetzt ist, gewinnt.');
  if (!r.castling) out.push('Keine Rochade.');
  if (!r.pawnDouble) out.push('Bauern ziehen immer nur ein Feld.');
  if (r.promo.length === 1) out.push(`Umwandlung nur in ${NAMES[r.promo[0]].replace(/n$|e$/, '') || r.promo[0]}.`);
  if (!out.length) out.push('Normale Schachregeln.');
  return out;
}

const NUM: Record<string, number> = { ein: 1, eins: 1, einmal: 1, zwei: 2, drei: 3, vier: 4, fünf: 5, sechs: 6, sieben: 7, acht: 8, neun: 9, zehn: 10 };
const PIECE_WORDS: [RegExp, string][] = [
  [/kamel/, 'l'],
  [/zebra/, 'z'],
  [/ferz|berater/, 'f'],
  [/elefant/, 'e'],
  [/wesir/, 'u'],
  [/amazone/, 'a'],
  [/kanzler/, 'c'],
  [/erzbisch|kardinal/, 'h'],
  [/springer|pferd/, 'n'],
  [/läufer/, 'b'],
  [/türme|turm/, 'r'],
  [/dame|königin/, 'q'],
];
const pieceIn = (s: string): string[] => {
  const found: { i: number; t: string }[] = [];
  for (const [re, t] of PIECE_WORDS) {
    const m = s.match(re);
    if (m && m.index !== undefined) found.push({ i: m.index, t });
  }
  return found.sort((a, b) => a.i - b.i).map((x) => x.t);
};

export interface ParseResult {
  design: Design;
  understood: string[];
  unknown: string[];
  engine: 'regeln' | 'browser-ki';
}

/** Regelbasierter Parser (immer verfügbar) */
export function parseIdea(text: string, start: Design = emptyDesign()): ParseResult {
  const d: Design = JSON.parse(JSON.stringify(start));
  const r = d.rules;
  const understood: string[] = [];
  const unknown: string[] = [];
  const sentences = text
    .split(/[.!?\n;]+|,\s*(?=und\s|außerdem|zusätzlich)/i)
    .map((s) => s.trim())
    .filter(Boolean);
  for (const raw of sentences) {
    const s = raw.toLowerCase();
    const before = JSON.stringify(d);
    const hit = (msg: string) => understood.push(`„${raw}“ → ${msg}`);
    if (/crazyhouse|einsetz|reserve|wieder (ins spiel|aufs brett|einbringen)|zurück aufs brett|die seite wechseln/.test(s)) {
      r.drops = true;
      hit('Geschlagene Figuren dürfen wieder eingesetzt werden');
    }
    if (/explod|atom|bombe|sprengt/.test(s)) {
      r.atomic = true;
      hit('Schlagzüge explodieren (Atomschach)');
    }
    if (/hügel|king of the hill|(könig.*(zentrum|mitte))|((zentrum|mitte).*könig)/.test(s)) {
      r.hill = true;
      hit('König im Zentrum gewinnt');
    }
    if (/(^|[^a-zäöüß])(ente|duck)/.test(s)) {
      r.duck = true;
      r.kingSafety = false;
      r.stalemateWins = true;
      hit('Ente als blockierende Figur (Entenschach)');
    }
    if (/nebel|unsichtbar|nicht sehen|verdeckt|fog/.test(s)) {
      r.fog = true;
      r.kingSafety = false;
      hit('Nebel: nur sichtbare Felder');
    }
    const chk = s.match(/(\d+|ein|eins|einmal|zwei|drei|vier|fünf|sechs|sieben|acht|neun|zehn)\s*(-|\s)?(mal|fach)?\s*(schach|schachgebot)/);
    if (chk && /gewinn|sieg|gewonnen/.test(s)) {
      const n = /\d/.test(chk[1]) ? Number(chk[1]) : NUM[chk[1]];
      r.checksToWin = Math.max(1, Math.min(20, n));
      hit(`${r.checksToWin} Schachgebote gewinnen`);
    }
    if (/schlagschach|antichess|räuberschach|verlierer|(alle (figuren|steine) (verliert|los ?wird|abgibt)).*(gewinnt|sieger)|(gewinnt|sieger).*(alle (figuren|steine) (verliert|los ?wird|abgibt))/.test(s)) {
      Object.assign(r, { antichess: true, forcedCapture: true, kingSafety: false, castling: false, promo: ['q', 'r', 'b', 'n', 'k'] });
      hit('Schlagschach: Wer alle Figuren verliert, gewinnt');
    }
    if (/schlagzwang|(muss|müssen) (immer )?(ge)?schlagen|schlagen ist pflicht|pflicht zu schlagen/.test(s)) {
      r.forcedCapture = true;
      hit('Schlagzwang');
    }
    if (/kein schach|ohne schach|könig (kann|darf) geschlagen|könig schlagen|(schlägt|schlagen).*könig.*gewinn/.test(s) && !r.antichess) {
      r.kingSafety = false;
      hit('König kann geschlagen werden');
    }
    if (/(ohne|keine|verbot).*rochade|rochade.*(verboten|nicht erlaubt|gibt es nicht)/.test(s)) {
      r.castling = false;
      hit('Keine Rochade');
    }
    if (/(bauern?.*(nur|immer) (ein|1) feld)|kein(en)? doppelschritt/.test(s)) {
      r.pawnDouble = false;
      hit('Kein Bauern-Doppelschritt');
    }
    if (/patt.*gewinn|gewinn.*patt/.test(s)) {
      r.stalemateWins = true;
      hit('Patt gewinnt');
    }
    if (/(rennen|racing|8\. reihe|achte reihe|letzte reihe|ziel).*(könig)|könig.*(rennen|8\. reihe|achte reihe|letzte reihe|ins ziel)/.test(s)) {
      r.race = true;
      r.castling = false;
      if (d.base === 'standard') d.base = 'racing';
      hit('Königsrennen zur 8. Reihe');
    }
    if (/6\s*[x×*]\s*6|kleine[sn]? brett|los alamos/.test(s)) {
      d.base = 'losalamos';
      Object.assign(r, { castling: false, pawnDouble: false });
      hit('Kleines 6×6-Brett');
    }
    if (/10\s*[x×*]\s*8|breite[sn]? brett|capablanca/.test(s)) {
      d.base = 'capablanca';
      hit('Breites 10×8-Brett mit Kanzler und Erzbischof');
    }
    if (/10\s*[x×*]\s*10|große[sn]? brett|grand chess/.test(s)) {
      d.base = 'grand';
      r.castling = false;
      hit('Großes 10×10-Brett');
    }
    if (/bauernkrieg|nur (mit )?bauern\b/.test(s) && !/könig|gegen/.test(s)) {
      d.base = 'pawns';
      Object.assign(r, { kingSafety: false, castling: false, promoteWins: true, noMovesLoses: true });
      hit('Nur Bauern – wer zuerst umwandelt, gewinnt');
    }
    if (/(umwandel|umwandlung|letzte reihe erreicht).*(gewinn|sieg)|(gewinn|sieg).*(umwandel|umwandlung)/.test(s) && !r.race && !r.promoteWins) {
      r.promoteWins = true;
      hit('Erste Umwandlung gewinnt');
    }
    const lim = s.match(/nach (\d+|zehn|fünfzehn|zwanzig|dreißig) zügen/);
    if (lim && /material|mehr (figuren|punkte)/.test(s)) {
      const words: Record<string, number> = { zehn: 10, fünfzehn: 15, zwanzig: 20, dreißig: 30 };
      r.moveLimit = Math.max(5, Math.min(80, /\d/.test(lim[1]) ? Number(lim[1]) : words[lim[1]]));
      hit(`Nach ${r.moveLimit} Zügen gewinnt mehr Material`);
    }
    const cw = /(schlägt|erobert|fängt|nimmt).*(gewinnt|sieg)/.test(s) && !/(statt|werden zu|wird zu|ersetz)/.test(s) ? pieceIn(s).filter((t) => t !== 'k') : [];
    if (cw.length === 1) {
      r.captureWin = cw[0];
      hit(`Wer alle ${NAMES_[cw[0]] ?? cw[0]} des Gegners schlägt, gewinnt`);
    }
    if (/doppelzug|zwei züge|2 züge|zweimal ziehen|marseille/.test(s)) {
      r.doubleMove = true;
      hit('Doppelzug: zwei Züge pro Runde');
    }
    if (/löcher|loch im brett|schwarze löcher|gesperrte felder/.test(s)) {
      d.base = 'custom';
      d.customFen = 'rnbqkbnr/pppppppp/8/2*2*2/2*2*2/8/PPPPPPPP/RNBQKBNR w';
      hit('Vier Löcher im Zentrum');
    }
    if (/horde|nur bauern gegen|36 bauern|bauernarmee/.test(s)) {
      d.base = 'horde';
      hit('Horde-Aufstellung');
    }
    if (/960|zufällig|gemischt|fischer.?random|zufallsschach/.test(s)) {
      d.base = '960';
      hit('Zufällige Grundreihe (Chess960)');
    }
    if (/nur (in )?(eine )?dame (um|ge)wandel|umwandlung nur (in )?(eine )?dame/.test(s)) {
      r.promo = ['q'];
      hit('Umwandlung nur in eine Dame');
    }
    // Figurentausch / -entfernung
    const W = /(^|[^a-zäöüß])weiß/.test(s);
    const B = /(^|[^a-zäöüß])schwarz/.test(s);
    const side: Design['swapSide'] = W && !B ? 'w' : B && !W ? 'b' : 'both';
    const sideTxt = side === 'w' ? ' (Weiß)' : side === 'b' ? ' (Schwarz)' : '';
    const pcs = pieceIn(s);
    if (/nur (bauern|könig)/.test(s) && /bauern/.test(s) && /könig/.test(s)) {
      d.swap = { n: '', b: '', r: '', q: '' };
      d.swapSide = side;
      hit('Nur Könige und Bauern');
    } else if (pcs.length >= 2 && /(statt|anstelle|anstatt|werden zu|wird zu|ersetz|durch|tausch|verwandel)/.test(s)) {
      // Paare in Lesereihenfolge: „Türme werden zu Kanzlern und Läufer zu Erzbischöfen“, „statt Türmen Kanzler“
      for (let i = 0; i + 1 < pcs.length; i += 2) {
        const [from, to] = [pcs[i], pcs[i + 1]];
        if ('nbrq'.includes(from) && from !== to) {
          d.swap[from] = to;
          d.swapSide = side;
          hit(`${NAMES[from]} werden zu ${DATIV[to]}${sideTxt}`);
        }
      }
    } else if (pcs.length && /(ohne|keine?n?\s|entfern|(^|\s)weg(\s|$)|nicht dabei)/.test(s)) {
      for (const t of pcs) if ('nbrq'.includes(t)) d.swap[t] = '';
      d.swapSide = side;
      hit(`Ohne ${pcs.map((t) => NAMES[t]).join(', ')}${sideTxt}`);
    }
    const name = raw.match(/(?:heißt|name(?: ist)?:?)\s+[„"]?([^„"“]+)[“"]?/i);
    if (name) {
      d.name = name[1].trim().slice(0, 40);
      hit(`Name: ${d.name}`);
    }
    if (JSON.stringify(d) === before && s.length > 3) unknown.push(raw);
  }
  r.name = d.name;
  return { design: d, understood, unknown, engine: 'regeln' };
}

// ---------- Optionale Browser-KI (Chrome Prompt API, kostenlos und lokal) ----------

interface LM {
  availability?: () => Promise<string>;
  create: (o?: unknown) => Promise<{ prompt: (t: string, o?: unknown) => Promise<string>; destroy?: () => void }>;
}
const lm = (): LM | undefined => (globalThis as unknown as { LanguageModel?: LM }).LanguageModel;

export async function browserAiStatus(): Promise<'available' | 'downloadable' | 'none'> {
  const L = lm();
  if (!L?.availability) return 'none';
  try {
    const a = await L.availability();
    return a === 'available' ? 'available' : a === 'downloadable' || a === 'downloading' ? 'downloadable' : 'none';
  } catch {
    return 'none';
  }
}

const SCHEMA = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    base: { enum: ['standard', '960', 'horde', 'racing'] },
    remove: { type: 'array', items: { enum: ['n', 'b', 'r', 'q'] } },
    replace: { type: 'object', properties: { n: { enum: ['n', 'b', 'r', 'q', 'a', 'c', 'h'] }, b: { enum: ['n', 'b', 'r', 'q', 'a', 'c', 'h'] }, r: { enum: ['n', 'b', 'r', 'q', 'a', 'c', 'h'] }, q: { enum: ['n', 'b', 'r', 'q', 'a', 'c', 'h'] } } },
    side: { enum: ['both', 'w', 'b'] },
    kingCanBeCaptured: { type: 'boolean' },
    forcedCapture: { type: 'boolean' },
    loseAllPiecesWins: { type: 'boolean' },
    atomic: { type: 'boolean' },
    drops: { type: 'boolean' },
    duck: { type: 'boolean' },
    fog: { type: 'boolean' },
    checksToWin: { type: 'integer', minimum: 0, maximum: 20 },
    kingOfTheHill: { type: 'boolean' },
    raceToEighthRank: { type: 'boolean' },
    castling: { type: 'boolean' },
    pawnDoubleStep: { type: 'boolean' },
    stalemateWins: { type: 'boolean' },
  },
};

const SYSTEM = `Du wandelst Ideen für Schachvarianten in JSON um. Erlaubte Bausteine: Startaufstellung (standard, 960, horde, racing),
Figuren entfernen (n=Springer, b=Läufer, r=Turm, q=Dame) oder ersetzen (auch durch a=Amazone D+S, c=Kanzler T+S, h=Erzbischof L+S),
side (both/w/b), kingCanBeCaptured, forcedCapture, loseAllPiecesWins, atomic, drops (Crazyhouse), duck, fog, checksToWin, kingOfTheHill,
raceToEighthRank, castling, pawnDoubleStep, stalemateWins. Setze nur Felder, die die Idee verlangt. Antworte nur mit JSON.`;

export async function parseWithBrowserAi(text: string): Promise<ParseResult | null> {
  const L = lm();
  if (!L) return null;
  try {
    const session = await L.create({ initialPrompts: [{ role: 'system', content: SYSTEM }], expectedInputs: [{ type: 'text', languages: ['de'] }], expectedOutputs: [{ type: 'text', languages: ['de'] }] });
    const raw = await session.prompt(text, { responseConstraint: SCHEMA });
    session.destroy?.();
    const j = JSON.parse(raw) as Record<string, unknown>;
    const d = emptyDesign();
    const r = d.rules;
    if (typeof j.name === 'string' && j.name) d.name = j.name.slice(0, 40);
    if (j.base === '960' || j.base === 'horde' || j.base === 'racing') d.base = j.base;
    if (Array.isArray(j.remove)) for (const t of j.remove) if ('nbrq'.includes(String(t))) d.swap[String(t)] = '';
    if (j.replace && typeof j.replace === 'object')
      for (const [k, val] of Object.entries(j.replace as Record<string, string>)) if ('nbrq'.includes(k) && 'nbrqach'.includes(val) && k !== val) d.swap[k] = val;
    if (j.side === 'w' || j.side === 'b') d.swapSide = j.side;
    if (j.loseAllPiecesWins) Object.assign(r, { antichess: true, forcedCapture: true, kingSafety: false, castling: false, promo: ['q', 'r', 'b', 'n', 'k'] });
    if (j.kingCanBeCaptured) r.kingSafety = false;
    if (j.forcedCapture) r.forcedCapture = true;
    if (j.atomic) r.atomic = true;
    if (j.drops) r.drops = true;
    if (j.duck) Object.assign(r, { duck: true, kingSafety: false, stalemateWins: true });
    if (j.fog) Object.assign(r, { fog: true, kingSafety: false });
    if (typeof j.checksToWin === 'number' && j.checksToWin > 0) r.checksToWin = Math.min(20, Math.round(j.checksToWin));
    if (j.kingOfTheHill) r.hill = true;
    if (j.raceToEighthRank) {
      Object.assign(r, { race: true, castling: false });
      if (d.base === 'standard') d.base = 'racing';
    }
    if (j.castling === false) r.castling = false;
    if (j.pawnDoubleStep === false) r.pawnDouble = false;
    if (j.stalemateWins) r.stalemateWins = true;
    r.name = d.name;
    return { design: d, understood: describeRules(designRules(d), d), unknown: [], engine: 'browser-ki' };
  } catch {
    return null;
  }
}

/** Beispiele als Anregung */
export const IDEAS = [
  'Doppelzug: Jeder zieht zweimal. Wer 3 Schachgebote gibt, gewinnt.',
  'Schwarze Löcher im Brett und Läufer werden zu Kamelen.',
  'Springer werden zu Kamelen. Wer die Dame des Gegners schlägt, gewinnt.',
  'Kleines Brett 6x6 und Schlagzwang.',
  'Breites Brett 10x8. Nach 30 Zügen gewinnt, wer mehr Material hat.',
  'Nur Bauern: Wer zuerst umwandelt, gewinnt.',
  'Wer zuerst 5 Schachgebote gibt, gewinnt. Keine Rochade.',
  'Türme werden zu Kanzlern und Läufer zu Erzbischöfen. Geschlagene Figuren darf man wieder einsetzen.',
  'Weiß spielt ohne Dame. Wer den König ins Zentrum bringt, gewinnt.',
  'Schlagzwang und der König darf geschlagen werden. Bauern ziehen nur ein Feld.',
  'Zufällige Grundreihe, jede Figur explodiert beim Schlagen.',
  'Nur Könige und Bauern, dazu eine Ente.',
];
