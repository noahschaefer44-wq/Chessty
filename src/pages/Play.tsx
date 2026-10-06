import { useEffect, useMemo, useRef, useState } from 'react';
import { flag, useAdmin, registerAdminActions } from '../lib/admin';
import { forceMove } from '../lib/forceMove';
import { Chess, type Move } from 'chess.js';
import Board from '../components/Board';
import { EvalBar } from '../components/Widgets';
import { Rich } from '../components/Explain';
import { engine, evalNumber, formatEval, type EngineLine } from '../lib/engine';
import { speak } from '../components/Explain';
import { START_FEN, tryMove, sanDe, uciToSan, material, PIECE_VALUE, parseUci } from '../lib/chess';
import { useEngine } from '../lib/useEngine';
import { update, addXp, useProgress, bump, bumpTotal } from '../lib/progress';
import { sound } from '../lib/sound';
import { openingName } from '../lib/openings';
import { judgeMove, Q_LABEL } from '../lib/explainMove';
import { openCoach } from '../lib/coach';
import { hangingPieces } from '../lib/trainerData';
import { TRAPS } from '../content/traps';

type Style = 'normal' | 'attack' | 'defend' | 'book' | 'simplify' | 'trap' | 'gambit' | 'chaos' | 'mirror' | 'kamikaze' | 'pacifist' | 'pawns' | 'trash' | 'teacher';

interface Bot {
  id: string;
  name: string;
  elo: string;
  desc: string;
  skill: number;
  depth: number;
  /** Wahrscheinlichkeit für einen Zufallszug (macht Anfänger-Bots menschlicher) */
  random: number;
  style: Style;
}

const BOTS: Bot[] = [
  { id: 'bauer', name: 'Bauer Bruno', elo: '~400', desc: 'Zieht oft planlos und übersieht Figuren. Perfekt für die ersten Partien.', skill: 0, depth: 1, random: 0.45, style: 'normal' },
  { id: 'springer', name: 'Springer Sina', elo: '~800', desc: 'Kennt die Regeln, aber hängt manchmal Figuren ein.', skill: 1, depth: 2, random: 0.2, style: 'normal' },
  { id: 'laeufer', name: 'Läufer Leo', elo: '~1200', desc: 'Solider Vereinsanfänger. Bestraft grobe Fehler.', skill: 4, depth: 4, random: 0.05, style: 'normal' },
  { id: 'turm', name: 'Turm Tara', elo: '~1600', desc: 'Starker Clubspieler mit gutem Taktikblick.', skill: 8, depth: 8, random: 0, style: 'normal' },
  { id: 'dame', name: 'Dame Doris', elo: '~2000', desc: 'Experte. Spielt positionell und taktisch sauber.', skill: 13, depth: 12, random: 0, style: 'normal' },
  { id: 'koenig', name: 'König Karl', elo: '2500+', desc: 'Volle Engine-Stärke auf hoher Suchtiefe. Viel Glück.', skill: 20, depth: 16, random: 0, style: 'normal' },
  { id: 'greta', name: 'Großmeisterin Greta', elo: '2800+', desc: 'Die stärkste Stufe: volle Stärke, sehr tiefe Suche. Rechnet länger – und verzeiht nichts.', skill: 20, depth: 22, random: 0, style: 'normal' },
  // Persönlichkeiten
  { id: 'anton', name: 'Angreifer Anton', elo: '~1500', desc: 'Liebt Schachs, Schläge und Opfer. Greift an, auch wenn es riskant ist – übe Verteidigung!', skill: 7, depth: 8, random: 0, style: 'attack' },
  { id: 'vera', name: 'Verteidigerin Vera', elo: '~1500', desc: 'Spielt vorsichtig und solide. Übe, eine gesicherte Stellung zu knacken.', skill: 7, depth: 8, random: 0, style: 'defend' },
  { id: 'olga', name: 'Eröffnungs-Olga', elo: '~1400', desc: 'Spielt nur Najdorf (Schwarz) und London (Weiß) – teste deine Vorbereitung.', skill: 6, depth: 7, random: 0, style: 'book' },
  { id: 'felix', name: 'Fallen-Felix', elo: '~1100', desc: 'Stellt dir die berühmten Eröffnungsfallen (Légal, Blackburne, Stafford …). Kennst du sie aus den Lektionen?', skill: 5, depth: 6, random: 0, style: 'trap' },
  { id: 'gerd', name: 'Gambit-Gerd', elo: '~1400', desc: 'Opfert in der Eröffnung Bauern (Königsgambit, Evans, Morra, Albin, Budapester) und greift dann an.', skill: 7, depth: 8, random: 0, style: 'gambit' },
  { id: 'fritz', name: 'Festungs-Fritz', elo: '~1900', desc: 'Mauert, tauscht nichts Unnötiges und wartet auf deinen Fehler. Übe Geduld und Pläne.', skill: 12, depth: 12, random: 0, style: 'defend' },
  { id: 'charlie', name: 'Chaos-Charlie', elo: '~1000', desc: 'Völlig unberechenbar: wilde Opfer, seltsame Züge, manchmal genial. Übe, ruhig zu bleiben.', skill: 4, depth: 6, random: 0.12, style: 'chaos' },
  { id: 'sven', name: 'Spiegel-Sven', elo: '~900', desc: 'Macht deine Züge spiegelverkehrt nach, solange es geht. Kannst du das ausnutzen?', skill: 5, depth: 6, random: 0, style: 'mirror' },
  { id: 'kim', name: 'Kamikaze-Kim', elo: '~700', desc: 'Schlägt alles, was sie erreichen kann – egal, was es kostet. Stell ihr vergiftete Köder!', skill: 3, depth: 4, random: 0, style: 'kamikaze' },
  { id: 'paul', name: 'Pazifist Paul', elo: '~1300', desc: 'Schlägt grundsätzlich nie, außer er muss. Gut, um Angriff ohne Gegenwehr zu üben.', skill: 8, depth: 8, random: 0, style: 'pacifist' },
  { id: 'benno', name: 'Bauer Benno', elo: '~800', desc: 'Zieht nur Bauern, solange er kann. Lerne, eine Bauernlawine zu stoppen.', skill: 6, depth: 6, random: 0, style: 'pawns' },
  { id: 'tina', name: 'Trash-Talk-Tina', elo: '~1500', desc: 'Spielt ordentlich und kommentiert jeden Zug frech im Chat. Lass dich nicht provozieren!', skill: 9, depth: 9, random: 0, style: 'trash' },
  { id: 'lena', name: 'Lehrerin Lena', elo: 'passt sich an', desc: 'Wird stärker, wenn du gewinnst, und leichter, wenn du verlierst. Warnt dich vor groben Fehlern und lässt dich zurücknehmen.', skill: 4, depth: 5, random: 0, style: 'teacher' },
  { id: 'emil', name: 'Endspiel-Emil', elo: '~1500', desc: 'Tauscht Figuren, wo er kann, und will ins Endspiel. Übe deine Technik!', skill: 7, depth: 8, random: 0, style: 'simplify' },
];

// Eröffnungsbuch für Olga (SAN ab Grundstellung)
const BOOK: string[][] = [
  ['e4', 'c5', 'Nf3', 'd6', 'd4', 'cxd4', 'Nxd4', 'Nf6', 'Nc3', 'a6', 'Be3', 'e5', 'Nb3', 'Be6', 'f3', 'Be7', 'Qd2', 'O-O', 'O-O-O', 'Nbd7'],
  ['e4', 'c5', 'Nf3', 'd6', 'd4', 'cxd4', 'Nxd4', 'Nf6', 'Nc3', 'a6', 'Be2', 'e5', 'Nb3', 'Be7', 'O-O', 'O-O', 'Be3', 'Be6'],
  ['e4', 'c5', 'Nf3', 'd6', 'd4', 'cxd4', 'Nxd4', 'Nf6', 'Nc3', 'a6', 'Bg5', 'e6', 'f4', 'Be7', 'Qf3', 'Qc7'],
  ['d4', 'd5', 'Bf4', 'Nf6', 'e3', 'e6', 'Nf3', 'c5', 'c3', 'Nc6', 'Nbd2', 'Bd6', 'Bg3', 'O-O', 'Bd3'],
  ['d4', 'Nf6', 'Bf4', 'g6', 'e3', 'Bg7', 'Nf3', 'O-O', 'Be2', 'd6', 'h3', 'c5', 'c3'],
  ['d4', 'e6', 'Bf4', 'd5', 'e3', 'Nf6', 'Nf3', 'c5', 'c3', 'Nc6', 'Nbd2', 'Bd6', 'Bg3'],
];

// Gambit-Gerd: Gambitlinien für beide Farben (SAN ab Grundstellung)
const GAMBITS: string[][] = [
  ['e4', 'e5', 'f4', 'exf4', 'Nf3', 'g5', 'h4'],
  ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Bc5', 'b4', 'Bxb4', 'c3'],
  ['e4', 'e5', 'd4', 'exd4', 'c3', 'dxc3', 'Bc4'],
  ['e4', 'c5', 'd4', 'cxd4', 'c3', 'dxc3', 'Nxc3'],
  ['d4', 'd5', 'c4', 'e5', 'dxe5', 'd4'],
  ['d4', 'Nf6', 'c4', 'e5', 'dxe5', 'Ng4'],
  ['e4', 'e5', 'Nf3', 'Nf6', 'Nxe5', 'Nc6'],
  ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Nf6', 'Ng5', 'Bc5'],
  ['e4', 'c6', 'd4', 'd5', 'Nc3', 'dxe4', 'f3'],
];
// Fallen-Felix: Fallen-Zugfolgen inklusive Bestrafung (die Fehler des Gegners spielt er nie selbst)
const TRAP_LINES = TRAPS.map((t) => ({ line: t.line, trapper: t.trapper === 'white' ? 0 : 1, blunder: t.blunder }));

/** Buchzug: passende Linie, in der der nächste Zug dem Bot gehört */
function bookMove(lines: string[][], history: string[], fen: string, own?: (line: string[], i: number) => boolean): string | null {
  const ok = lines.filter((b) => b.length > history.length && history.every((m, i) => b[i] === m) && (!own || own(b, history.length)));
  if (!ok.length) return null;
  const san = ok[Math.floor(Math.random() * ok.length)][history.length];
  const m = tryMove(new Chess(fen), san);
  return m ? m.from + m.to + (m.promotion ?? '') : null;
}

/** Admin: absichtlich einen schlechten Zug spielen (Figur dorthin, wo sie geschlagen werden kann) */
function blunderMove(fen: string): string {
  const c = new Chess(fen);
  const ms = c.moves({ verbose: true });
  let best = ms[0];
  let worst = -1;
  for (const m of ms) {
    const a = new Chess(fen);
    a.move(m);
    const loss = a.moves({ verbose: true }).filter((r) => r.to === m.to).length ? PIECE_VALUE[m.promotion ?? m.piece] : 0;
    if (loss + Math.random() * 0.5 > worst) {
      worst = loss;
      best = m;
    }
  }
  return best.from + best.to + (best.promotion ?? '');
}

/** Kommentator (Admin): Zug vorlesen */
function speakMove(san: string, bot: boolean) {
  if (!('speechSynthesis' in window)) return;
  if (window.speechSynthesis.speaking) window.speechSynthesis.cancel();
  speak((bot ? 'Der Bot spielt ' : 'Du spielst ') + sanDe(san).replace('x', ' schlägt ').replace('+', ', Schach').replace('#', ', Matt!'));
}

const CLOCKS = [
  { id: 'ohne', label: 'Ohne Uhr', base: 0, inc: 0 },
  { id: '3+2', label: '3+2', base: 180, inc: 2 },
  { id: '5+3', label: '5+3', base: 300, inc: 3 },
  { id: '10+5', label: '10+5', base: 600, inc: 5 },
];

const fmt = (ms: number) => {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};

/** Trash-Talk-Tina: Sprüche je nach Ereignis */
const TALK: Record<string, string[]> = {
  start: ['Na, bereit zu verlieren? 😏', 'Ich hoffe, du hast geübt.', 'Los geht’s – ich bin heute in Form!'],
  botCapture: ['Danke für das Geschenk!', 'Lecker. Noch eine?', 'Das hast du nicht kommen sehen, oder?', 'Mampf.'],
  userCapture: ['Pfff, die brauchte ich eh nicht.', 'Glück gehabt.', 'Okay, okay … das war frech.', 'Das war ein Köder! … glaube ich.'],
  check: ['Schach! Lauf, kleiner König, lauf!', 'Klopf, klopf – wer ist da? Schach!', 'Na, wird’s eng?'],
  userCheck: ['Hey! Das kitzelt.', 'Schach? Ich hab keine Angst.', 'Netter Versuch.'],
  quiet: ['Hmm …', 'Interessant. Falsch, aber interessant.', 'Ich sehe alles.', 'Spiel ruhig weiter, ich warte.', 'Langweilig. Mach was Mutiges!'],
  winning: ['Das läuft ja wie geschmiert.', 'Willst du nicht lieber aufgeben?', 'Ich könnte mich daran gewöhnen.'],
  losing: ['Du hast doch heimlich Stockfish an, oder?', 'Das war Absicht von mir. Taktik!', 'Okay, du bist besser als gedacht.'],
  win: ['GG! Nächstes Mal vielleicht.', 'Und wieder ein Sieg für Tina!'],
  loss: ['Na gut … gut gespielt. Revanche?!', 'Unfassbar. Ich will eine Revanche!'],
};
export const talk = (k: string) => TALK[k][Math.floor(Math.random() * TALK[k].length)];

/** Spiegelzug: e2e4 → e7e5 (Reihen gespiegelt) */
const mirrorSq = (sq: string) => sq[0] + (9 - Number(sq[1]));

/** Zugwahl je nach Persönlichkeit: aus den besten Engine-Zügen den „typischen“ nehmen. */
async function botMove(bot: Bot, fen: string, history: string[], fromStart: boolean, lastUci?: string, onLines?: (l: EngineLine[]) => void): Promise<string> {
  const c = new Chess(fen);
  const legal = c.moves({ verbose: true });
  const uciOf = (m: Move) => m.from + m.to + (m.promotion ?? '');
  if (bot.style === 'mirror' && lastUci) {
    const m = legal.find((x) => x.from === mirrorSq(lastUci.slice(0, 2)) && x.to === mirrorSq(lastUci.slice(2, 4)));
    if (m) return uciOf(m);
  }
  if (bot.style === 'kamikaze') {
    const caps = legal.filter((m) => m.captured).sort((a, b) => PIECE_VALUE[b.captured!] - PIECE_VALUE[a.captured!]);
    if (caps.length) return uciOf(caps[0]);
    const checks = legal.filter((m) => m.san.includes('+'));
    if (checks.length) return uciOf(checks[Math.floor(Math.random() * checks.length)]);
  }
  if (bot.style === 'pacifist' || bot.style === 'pawns') {
    const r = await engine.analyse(fen, { depth: bot.depth, multipv: 8, onInfo: onLines });
    const ok = (m: Move) => (bot.style === 'pacifist' ? !m.captured : m.piece === 'p');
    const fromEngine = r.lines.map((l) => legal.find((m) => uciOf(m) === l.pv[0])).find((m) => m && ok(m));
    if (fromEngine) return uciOf(fromEngine);
    const any = legal.filter(ok);
    if (any.length) return uciOf(any[Math.floor(Math.random() * any.length)]);
    return r.best;
  }
  if (Math.random() < bot.random) {
    const mv = legal[Math.floor(Math.random() * legal.length)];
    return mv.from + mv.to + (mv.promotion ?? '');
  }
  if (bot.style === 'book' && fromStart) {
    const lines = BOOK.filter((b) => b.length > history.length && history.every((m, i) => b[i] === m));
    if (lines.length) {
      const san = lines[Math.floor(Math.random() * lines.length)][history.length];
      const m = tryMove(new Chess(fen), san);
      if (m) return m.from + m.to + (m.promotion ?? '');
    }
  }
  if (bot.style === 'trap' && fromStart) {
    const botIdx = c.turn() === 'w' ? 0 : 1;
    // Nur Linien, in denen der Bot die Falle stellt; der Fehler selbst ist ein Zug des Gegners
    const u = bookMove(TRAP_LINES.filter((t) => t.trapper === botIdx).map((t) => t.line), history, fen);
    if (u) return u;
  }
  if (bot.style === 'gambit' && fromStart) {
    const u = bookMove(GAMBITS, history, fen, (_, i) => (i % 2 === 0) === (c.turn() === 'w'));
    if (u) return u;
  }
  if (['normal', 'book', 'trap', 'mirror', 'kamikaze', 'trash', 'teacher'].includes(bot.style))
    return (await engine.analyse(fen, { depth: bot.depth, skill: bot.skill, multipv: onLines ? 3 : 1, onInfo: onLines })).best;
  const r = await engine.analyse(fen, { depth: bot.depth, multipv: 5, onInfo: onLines });
  const white = c.turn() === 'w';
  const score = (l: EngineLine) => evalNumber(l) * (white ? 1 : -1);
  const best = score(r.lines[0]);
  const tol = bot.style === 'chaos' ? 2.5 : bot.style === 'attack' || bot.style === 'gambit' ? 0.9 : 0.5;
  const cands = r.lines.filter((l) => best - score(l) <= tol);
  const bonus = (l: EngineLine) => {
    const m = new Chess(fen).move(parseUci(l.pv[0])) as Move;
    const after = new Chess(fen);
    after.move(m.san);
    if (bot.style === 'attack' || bot.style === 'gambit') return (m.san.includes('+') ? 2 : 0) + (m.captured ? 1 : 0) + (after.isCheckmate() ? 10 : 0);
    if (bot.style === 'chaos') return Math.random() * 3 + (m.san.includes('+') ? 1 : 0) + (after.isCheckmate() ? 20 : 0);
    if (bot.style === 'defend') return (m.captured ? -1 : 0) + (m.piece === 'k' ? -1 : 0) + (m.san.includes('+') ? -0.5 : 0) + (['a', 'b', 'c', 'f', 'g', 'h'].includes(m.to[0]) && m.piece === 'p' ? -0.5 : 0.5);
    // Vereinfachen: gleichwertige Abtausche bevorzugen
    if (m.captured && PIECE_VALUE[m.captured] >= PIECE_VALUE[m.piece] && m.piece !== 'p') return 3;
    return m.captured ? 1 : 0;
  };
  cands.sort((a, b) => bonus(b) - bonus(a) || score(b) - score(a));
  return cands[0].pv[0];
}

export default function Play({ startFen }: { startFen?: string }) {
  const initialFen = startFen ? decodeURIComponent(startFen) : undefined;
  const p = useProgress();
  const [bot, setBot] = useState<Bot | null>(null);
  const [color, setColor] = useState<'white' | 'black'>(initialFen?.split(' ')[1] === 'b' ? 'black' : 'white');
  const [clockId, setClockId] = useState('ohne');
  const [history, setHistory] = useState<string[]>([]);
  const [thinking, setThinking] = useState(false);
  const [helper, setHelper] = useState(false);
  const [comment, setComment] = useState(true);
  const [feedback, setFeedback] = useState<{ q: string; text?: string } | null>(null);
  const [judging, setJudging] = useState(false);
  const [result, setResult] = useState('');
  const [name, setName] = useState('');
  const clock = CLOCKS.find((c) => c.id === clockId)!;
  const [times, setTimes] = useState({ w: 0, b: 0 });
  const tickRef = useRef(Date.now());
  // Admin-Panel: nach illegalen Zügen startet die Partie intern von einer neuen Stellung
  const [base, setBase] = useState<string | undefined>(initialFen);
  const [prefix, setPrefix] = useState<string[]>([]);
  const adm = useAdmin();
  const clair = adm.unlocked && !!adm.flags.clairvoyance;
  // Spielmodi
  const [handicap, setHandicap] = useState<string>('keine');
  const [blind, setBlind] = useState(false);
  const [peek, setPeek] = useState(false);
  const [roulette, setRoulette] = useState(false);
  const [offer, setOffer] = useState<string[]>([]);
  const [tenSec, setTenSec] = useState(false);
  const [moveLeft, setMoveLeft] = useState(10);
  // Zuschauen: dieser Bot spielt deine Seite
  const [watchId, setWatchId] = useState('');
  const watch = BOTS.find((b) => b.id === watchId) ?? null;
  // Chat (Tina, Lena) und Admin-Spielereien
  const [say, setSay] = useState('');
  const [botMind, setBotMind] = useState<EngineLine[]>([]);
  const [botSkip, setBotSkip] = useState(0);
  const lenaSkill = Math.max(0, Math.min(16, 4 + 2 * ((p.botResults.lena?.w ?? 0) - (p.botResults.lena?.l ?? 0))));

  const game = useMemo(() => {
    const c = new Chess(base);
    for (const m of history) c.move(m);
    return c;
  }, [history, base]);
  const fen = game.fen();
  const lastMv = game.history({ verbose: true }).at(-1);
  const myTurn = (game.turn() === 'w' ? 'white' : 'black') === color;
  const showEval = adm.unlocked && !!adm.flags.showEval;
  // Nur auf eigenem Zug analysieren – sonst konkurriert die Analyse mit dem Bot um die Engine
  const { lines, loading } = useEngine(fen, (helper || clair || showEval) && !!bot && myTurn && !result && !judging, 14);

  useEffect(() => {
    if (!initialFen) openingName(history.slice(0, 16)).then(setName);
  }, [history, initialFen]);

  // Schachuhr: läuft für die Seite am Zug
  useEffect(() => {
    if (!bot || !clock.base || result) return;
    tickRef.current = Date.now();
    const iv = setInterval(() => {
      const now = Date.now();
      const d = now - tickRef.current;
      tickRef.current = now;
      setTimes((t) => {
        const side = game.turn();
        if (flag('freezeClock') && (side === 'w' ? 'white' : 'black') === color) return t;
        const nt = { ...t, [side]: t[side] - d };
        if (nt[side] <= 0) {
          const iLost = (side === 'w' ? 'white' : 'black') === color;
          setTimeout(() => finishGame(iLost ? 'Zeit abgelaufen – du verlierst.' : `${bot.name} hat die Zeit überschritten – du gewinnst!`, iLost ? 'l' : 'w'), 0);
        }
        return nt;
      });
    }, 200);
    return () => clearInterval(iv);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bot, clockId, result, fen]);

  /** Vorgabe: Figur aus der Grundstellung entfernen (für Bot oder dich) */
  function handicapFen(): string | undefined {
    if (handicap === 'keine' || initialFen) return initialFen;
    const [who, piece] = handicap.split('-');
    const side = who === 'bot' ? (color === 'white' ? 'b' : 'w') : color === 'white' ? 'w' : 'b';
    const c = new Chess();
    const rank = side === 'w' ? '1' : '8';
    const sq = (piece === 'q' ? 'd' : piece === 'r' ? 'a' : 'b') + rank;
    c.remove(sq as never);
    const parts = c.fen().split(' ');
    if (piece === 'r') parts[2] = parts[2].replace(side === 'w' ? 'Q' : 'q', '') || '-';
    return parts.join(' ');
  }

  function startGame(b: Bot) {
    setBot(b);
    setHistory([]);
    setBase(handicapFen());
    setSay(b.style === 'trash' ? talk('start') : b.style === 'teacher' ? 'Hallo! Ich passe mich an dich an. Wenn du einen groben Fehler machst, sage ich Bescheid.' : '');
    setBotSkip(0);
    setPeek(false);
    setPrefix([]);
    setResult('');
    setFeedback(null);
    setTimes({ w: clock.base * 1000, b: clock.base * 1000 });
  }

  function checkEnd(c: Chess) {
    if (!c.isGameOver()) return false;
    let r = 'Remis';
    let key: 'w' | 'd' | 'l' = 'd';
    if (c.isCheckmate()) {
      const winner = c.turn() === 'w' ? 'black' : 'white';
      r = winner === color ? 'Du gewinnst durch Matt!' : `${bot?.name} gewinnt durch Matt.`;
      key = winner === color ? 'w' : 'l';
    } else if (c.isStalemate()) r = 'Patt – Remis.';
    else if (c.isThreefoldRepetition()) r = 'Dreifache Wiederholung – Remis.';
    else if (c.isInsufficientMaterial()) r = 'Zu wenig Material – Remis.';
    finishGame(r, key);
    return true;
  }

  function finishGame(r: string, key: 'w' | 'd' | 'l') {
    if (result) return;
    setResult(r);
    // Zuschauen zählt nicht für die eigene Statistik
    if (!bot || watch) return;
    key === 'w' ? sound.good() : key === 'l' && sound.bad();
    update((pr) => {
      const b = pr.botResults[bot.id] ?? { w: 0, d: 0, l: 0 };
      return { ...pr, botResults: { ...pr.botResults, [bot.id]: { ...b, [key]: b[key] + 1 } } };
    });
    addXp(key === 'w' ? 15 + Math.min(5, BOTS.indexOf(bot)) * 5 : key === 'd' ? 8 : 3);
    if (bot.style === 'trash') setSay(talk(key === 'l' ? 'win' : key === 'w' ? 'loss' : 'quiet'));
    if (bot.style === 'teacher') setSay(key === 'w' ? 'Super gespielt! Nächstes Mal werde ich etwas stärker.' : key === 'l' ? 'Kopf hoch – nächstes Mal spiele ich etwas leichter. Schau dir den Fehler-Coach an!' : 'Remis – gut gekämpft!');
    bump('botGames');
    if (key === 'w') bumpTotal('botWins');
  }

  const addInc = (side: 'w' | 'b') => clock.inc && setTimes((t) => ({ ...t, [side]: t[side] + clock.inc * 1000 }));

  // Bot zieht (erst nachdem der Kommentar zum eigenen Zug fertig ist); beim Zuschauen ziehen beide Bots
  useEffect(() => {
    if (!bot || (myTurn && !watch) || result || judging || game.isGameOver()) return;
    const mover = myTurn && watch ? watch : bot;
    let alive = true;
    setThinking(true);
    (async () => {
      let u: string;
      if (botSkip > 0) {
        // Admin: Bot setzt aus – Zugrecht per FEN zurückgeben
        const parts = fen.split(' ');
        parts[1] = parts[1] === 'w' ? 'b' : 'w';
        parts[3] = '-';
        const nf = parts.join(' ');
        setThinking(false);
        try { new Chess(nf); } catch { setBotSkip(0); return; }
        setBotSkip((k) => k - 1);
        setPrefix((pr) => [...pr, ...history, '(Bot setzt aus)']);
        setHistory([]);
        setBase(nf);
        return;
      }
      const mind = adm.unlocked && !!adm.flags.botMind ? (l: EngineLine[]) => alive && setBotMind(l.slice(0, 3)) : undefined;
      const lastUci = (() => { const v = game.history({ verbose: true }).at(-1); return v ? v.from + v.to : undefined; })();
      const eff = mover.style === 'teacher' ? { ...mover, skill: lenaSkill, depth: 2 + Math.round(lenaSkill / 2) } : mover;
      if (flag('botBlunder')) u = blunderMove(fen);
      else if (flag('weakBot')) {
        const ms = new Chess(fen).moves({ verbose: true });
        const pick = ms[Math.floor(Math.random() * ms.length)];
        u = pick ? pick.from + pick.to + (pick.promotion ?? '') : '';
      } else u = await botMove(eff, fen, history, !base && !prefix.length, lastUci, mind);
      if (!flag('turbo')) await new Promise((r) => setTimeout(r, watch ? 700 : 250));
      if (!alive) return;
      const c = new Chess(fen);
      const m = tryMove(c, u);
      setThinking(false);
      if (!m) return;
      m.captured ? sound.capture() : sound.move();
      addInc(game.turn());
      setHistory((h) => [...h, m.san]);
      setBotMind([]);
      if (flag('commentator')) speakMove(m.san, true);
      if (bot.style === 'trash') {
        setSay(talk(m.san.includes('+') ? 'check' : m.captured ? 'botCapture' : Math.random() < 0.5 ? 'quiet' : material(c).white - material(c).black > 2 === (color === 'black') ? 'winning' : 'quiet'));
      }
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fen, bot, myTurn, result, judging, watch]);

  // Zug-Roulette: drei zufällige erlaubte Züge anbieten
  useEffect(() => {
    if (!roulette || !bot || !myTurn || result) return setOffer([]);
    const ms = new Chess(fen).moves({ verbose: true }).sort(() => Math.random() - 0.5).slice(0, 3);
    setOffer(ms.map((m) => m.from + m.to + (m.promotion ?? '')));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fen, roulette, bot, myTurn, result]);

  // Sekundenschach: 10 Sekunden pro eigenem Zug, sonst Zufallszug
  useEffect(() => {
    if (!tenSec || !bot || !myTurn || result || judging) return;
    setMoveLeft(10);
    const t0 = Date.now();
    const iv = setInterval(() => {
      const left = 10 - Math.floor((Date.now() - t0) / 1000);
      setMoveLeft(Math.max(0, left));
      if (left <= 0) {
        clearInterval(iv);
        const pool = offer.length ? offer : new Chess(fen).moves({ verbose: true }).map((m) => m.from + m.to + (m.promotion ?? ''));
        const pick = pool[Math.floor(Math.random() * pool.length)];
        setFeedback({ q: 'Zeit weg!', text: 'Zehn Sekunden vorbei – es wurde ein Zufallszug für dich gespielt.' });
        if (pick) void onMove(pick);
      }
    }, 250);
    return () => clearInterval(iv);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fen, tenSec, bot, myTurn, result, judging]);

  useEffect(() => {
    if (bot && history.length) checkEnd(game);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history]);

  /** Illegalen Zug ausführen (nur Admin-Panel) */
  function playIllegal(u: string) {
    const f = forceMove(fen, u);
    if (!f) return;
    sound.capture();
    if (f.capturedKing) {
      setPrefix([...prefix, ...history, f.label]);
      setHistory([]);
      finishGame('Du hast den König geschlagen – Sieg (Admin).', 'w');
      return;
    }
    if (!f.valid) {
      setFeedback({ q: 'Admin', text: 'Diese Stellung kann die Engine nicht spielen (z. B. König im Schach des Ziehenden). Probiere einen anderen Zug.' });
      return;
    }
    setPrefix([...prefix, ...history, f.label]);
    setHistory([]);
    // Eigener König steht danach im Schach? Dann schlägt ihn der Bot.
    const after = new Chess(f.fen);
    const mine = color === 'white' ? 'w' : 'b';
    const k = after.board().flat().find((x) => x && x.type === 'k' && x.color === mine);
    if (k && after.isAttacked(k.square, mine === 'w' ? 'b' : 'w')) {
      finishGame(`${bot?.name} schlägt deinen König – Niederlage (Admin).`, 'l');
      return;
    }
    setBase(f.fen);
    setFeedback(null);
  }

  // Aktionen im Admin-Panel für diese Partie
  useEffect(() => {
    if (!bot || !adm.unlocked) return;
    return registerAdminActions('play', [
      { label: 'Sofort gewinnen', run: () => finishGame('Sieg (Admin).', 'w') },
      { label: 'Sofort verlieren', run: () => finishGame('Niederlage (Admin).', 'l') },
      { label: 'Remis', run: () => finishGame('Remis (Admin).', 'd') },
      { label: 'Zug aussetzen (Seite wechseln)', run: () => {
        const parts = fen.split(' ');
        parts[1] = parts[1] === 'w' ? 'b' : 'w';
        parts[3] = '-';
        const nf = parts.join(' ');
        try { new Chess(nf); } catch { return; }
        setPrefix([...prefix, ...history, '(aussetzen)']);
        setHistory([]);
        setBase(nf);
      } },
      { label: 'Gegnerische Dame entfernen', run: () => {
        const c = new Chess(fen);
        const q = color === 'white' ? 'b' : 'w';
        const sq = c.board().flat().find((x) => x && x.type === 'q' && x.color === q);
        if (!sq) return;
        c.remove(sq.square);
        setPrefix([...prefix, ...history, `(Dame ${sq.square} weg)`]);
        setHistory([]);
        setBase(c.fen());
      } },
      { label: 'Stellung → Brett-Editor', run: () => { location.hash = '#/editor/' + encodeURIComponent(fen); } },
      { label: 'Alle meine Bauern → Damen', run: () => {
        const c = new Chess(fen);
        const mine = color === 'white' ? 'w' : 'b';
        for (const sq of c.board().flat()) if (sq && sq.type === 'p' && sq.color === mine) { c.remove(sq.square); c.put({ type: 'q', color: mine }, sq.square); }
        try { new Chess(c.fen()); } catch { return; }
        setPrefix([...prefix, ...history, '(Bauern → Damen)']);
        setHistory([]);
        setBase(c.fen());
      } },
      { label: 'Figuren durcheinanderwirbeln', run: () => {
        for (let tries = 0; tries < 30; tries++) {
          const c = new Chess(fen);
          for (const side of ['w', 'b'] as const) {
            const sqs = c.board().flat().filter((x) => x && x.color === side && x.type !== 'k' && x.type !== 'p').map((x) => x!);
            const types = sqs.map((x) => x.type).sort(() => Math.random() - 0.5);
            sqs.forEach((x, i) => { c.remove(x.square); c.put({ type: types[i], color: side }, x.square); });
          }
          const parts = c.fen().split(' ');
          parts[2] = '-';
          try {
            const n = new Chess(parts.join(' '));
            setPrefix([...prefix, ...history, '(Wirbel!)']);
            setHistory([]);
            setBase(n.fen());
            return;
          } catch { /* nochmal */ }
        }
      } },
      { label: 'Seiten tauschen', run: () => setColor((c) => (c === 'white' ? 'black' : 'white')) },
      { label: 'Bot setzt 3 Züge aus', run: () => setBotSkip(3) },
      { label: '+5 Minuten für mich', run: () => setTimes((t) => ({ ...t, [color === 'white' ? 'w' : 'b']: t[color === 'white' ? 'w' : 'b'] + 300000 })) },
      { label: 'Bot gibt auf', run: () => finishGame(`${bot.name} gibt auf – du gewinnst!`, 'w') },
    ]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bot, adm.unlocked, fen, result, history, prefix]);

  async function onMove(u: string) {
    if (!myTurn || result || judging) return;
    if (roulette && offer.length && !offer.some((o) => o.slice(0, 4) === u.slice(0, 4))) {
      setFeedback({ q: 'Zug-Roulette', text: 'Du darfst nur einen der drei angebotenen Züge spielen (Pfeile).' });
      return;
    }
    const before = fen;
    const c = new Chess(fen);
    const m = tryMove(c, u);
    if (!m) {
      if (flag('freeMoves')) playIllegal(u);
      return;
    }
    if (flag('commentator')) speakMove(m.san, false);
    if (bot?.style === 'trash') setSay(talk(m.san.includes('+') ? 'userCheck' : m.captured ? 'userCapture' : 'quiet'));
    m.captured ? sound.capture() : sound.move();
    addInc(game.turn());
    setHistory([...history, m.san]);
    setFeedback(null);
    if (!comment || c.isGameOver()) return;
    // Kurzkommentar: Engine vor und nach dem Zug vergleichen
    // Lena wartet mit ihrem Zug, bis sie den Zug beurteilt hat
    setJudging(true);
    try {
      const a = await engine.analyse(before, { depth: 11 });
      const b = await engine.analyse(c.fen(), { depth: 11 });
      const j = judgeMove(before, m.from + m.to + (m.promotion ?? ''), a.lines[0], b.lines[0], a.best);
      const praise = j.quality === 'best' ? 'Stark – das ist der Zug der Engine!' : j.quality === 'good' ? 'Guter Zug.' : undefined;
      setFeedback({ q: Q_LABEL[j.quality], text: j.text ?? praise });
      if (bot?.style === 'teacher' && (j.quality === 'blunder' || j.quality === 'mistake')) setSay('Halt! Dieser Zug war ein grober Fehler. Willst du ihn zurücknehmen? (Knopf „Zug zurück“)');
      else if (bot?.style === 'teacher' && j.quality === 'best') setSay('Sehr gut! Genau so hätte ich es auch gespielt.');
    } finally {
      setJudging(false);
    }
  }

  if (!bot) {
    return (
      <>
        <div className="page-head">
          <div className="kicker">Übung macht den Meister</div>
          <h1>Gegen Bots spielen</h1>
          <p className="muted">Sieben Spielstärken, fünfzehn Persönlichkeiten und verrückte Spielmodi. Mit Schachuhr, Tipp-Modus, Kommentar zu jedem Zug und Analyse danach.</p>
          {initialFen && <p className="tag solid">Startet aus der gewählten Stellung</p>}
          <div className="row" style={{ marginTop: 8 }}>
            <div className="seg">
              <button className={color === 'white' ? 'on' : ''} onClick={() => setColor('white')}>Mit Weiß</button>
              <button className={color === 'black' ? 'on' : ''} onClick={() => setColor('black')}>Mit Schwarz</button>
            </div>
            <div className="seg">
              {CLOCKS.map((c) => <button key={c.id} className={clockId === c.id ? 'on' : ''} onClick={() => setClockId(c.id)}>{c.label}</button>)}
            </div>
          </div>
          <div className="panel" style={{ marginTop: 14 }}>
            <div className="panel-head"><b>Spielmodus</b></div>
            <div className="panel-body">
              <div className="row" style={{ marginTop: 0 }}>
                <label className="field" style={{ margin: 0 }}>Vorgabe
                  <select className="input" value={handicap} onChange={(e) => setHandicap(e.target.value)} disabled={!!initialFen}>
                    <option value="keine">keine</option>
                    <option value="bot-q">Bot ohne Dame</option>
                    <option value="bot-r">Bot ohne Turm</option>
                    <option value="bot-n">Bot ohne Springer</option>
                    <option value="me-n">Ich ohne Springer</option>
                    <option value="me-r">Ich ohne Turm</option>
                    <option value="me-q">Ich ohne Dame (Mutprobe)</option>
                  </select>
                </label>
              </div>
              <label className="field">Zuschauen: Dieser Bot spielt für dich
                <select className="input" value={watchId} onChange={(e) => setWatchId(e.target.value)}>
                  <option value="">niemand – ich spiele selbst</option>
                  {BOTS.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </label>
              <div className="toggle-grid">
                <label className="toggle-row"><input type="checkbox" checked={blind} onChange={(e) => setBlind(e.target.checked)} /><span>Blindschach (Figuren unsichtbar, mit Spick-Knopf)</span></label>
                <label className="toggle-row"><input type="checkbox" checked={roulette} onChange={(e) => setRoulette(e.target.checked)} /><span>Zug-Roulette (nur 3 zufällige Züge erlaubt)</span></label>
                <label className="toggle-row"><input type="checkbox" checked={tenSec} onChange={(e) => setTenSec(e.target.checked)} /><span>Sekundenschach (10 Sekunden pro Zug)</span></label>
              </div>
            </div>
          </div>
        </div>
        <h2>Spielstärken</h2>
        <div className="grid">
          {BOTS.filter((b) => b.style === 'normal').map((b, i) => {
            const r = p.botResults[b.id];
            return (
              <button key={b.id} className={'card' + (i >= 5 ? ' inverse' : '')} onClick={() => startGame(b)}>
                <div className="kicker">Elo ca. {b.elo.replace("~", "")} (geschätzt)</div>
                <h3>{b.name}</h3>
                <p className="muted" style={{ fontSize: 14 }}>{b.desc}</p>
                {r && <span className="mono" style={{ fontSize: 12 }}>S {r.w} · R {r.d} · N {r.l}</span>}
              </button>
            );
          })}
        </div>
        <h2 style={{ marginTop: 36 }}>Persönlichkeiten</h2>
        <div className="grid">
          {BOTS.filter((b) => b.style !== 'normal').map((b) => {
            const r = p.botResults[b.id];
            return (
              <button key={b.id} className="card" onClick={() => startGame(b)}>
                <div className="kicker">Elo ca. {b.elo.replace("~", "")} (geschätzt)</div>
                <h3>{b.name}</h3>
                <p className="muted" style={{ fontSize: 14 }}>{b.desc}</p>
                {r && <span className="mono" style={{ fontSize: 12 }}>S {r.w} · R {r.d} · N {r.l}</span>}
              </button>
            );
          })}
        </div>
      </>
    );
  }

  const mat = material(game);
  const diff = mat.white - mat.black;
  const best = lines[0]?.pv[0];
  const botSide = color === 'white' ? 'b' : 'w';
  const mySide = color === 'white' ? 'w' : 'b';

  const clockBox = (side: 'w' | 'b', label: string) =>
    clock.base > 0 && (
      <div className={'clock' + (game.turn() === side && !result ? ' running' : '') + (times[side] < 20000 ? ' low' : '')}>
        <span>{label}</span>
        <b className="mono">{fmt(times[side])}</b>
      </div>
    );

  return (
    <>
      <button className="back" style={{ background: 'none', border: 0, cursor: 'pointer', padding: 0 }} onClick={() => setBot(null)}>← Bot wählen</button>
      <div className="trainer">
        <div className="board-col">
          {clockBox(botSide, bot.name)}
          <Board fen={fen} orientation={color} movable={!result && myTurn && !judging && !watch ? color : undefined} onMove={onMove} allowFree
            className={blind && !peek && !result ? 'blind' : ''}
            lastMove={lastMv ? [lastMv.from, lastMv.to] : undefined}
            arrows={[
              ...((helper || clair) && best && myTurn ? [best.slice(0, 4)] : []),
              ...(roulette && myTurn ? offer.map((o) => '?' + o.slice(0, 4)) : []),
              ...(!myTurn && botMind[0]?.pv[0] ? ['!' + botMind[0].pv[0].slice(0, 4)] : []),
              ...(adm.unlocked && adm.flags.xray && !result ? hangingPieces(fen) : []),
            ]} />
          {clockBox(mySide, 'Du')}
          {(helper || showEval) && <EvalBar line={lines[0]} loading={loading} />}
          {blind && !result && (
            <button className="btn small" style={{ marginTop: 10 }} onPointerDown={() => setPeek(true)} onPointerUp={() => setPeek(false)} onPointerLeave={() => setPeek(false)}>
              Gedrückt halten zum Spicken
            </button>
          )}
        </div>
        <aside className="side">
          <div>
            <div className="kicker">Gegner · Elo ca. {bot.elo.replace("~", "")}{clock.base ? ` · ${clock.label}` : ''}</div>
            <h2>{watch ? `${watch.name} gegen ${bot.name}` : bot.name}</h2>
            <p className="mono" style={{ fontSize: 13, margin: 0 }}>
              {thinking ? <><span className="spinner" /> denkt …</> : judging ? <><span className="spinner" /> Kommentar …</> : result ? 'Partie beendet' : myTurn ? 'Du bist am Zug' : ''}
              {diff !== 0 && ` · Material ${diff > 0 ? 'Weiß' : 'Schwarz'} +${Math.abs(diff)}`}
            </p>
            {name && <p className="muted" style={{ fontSize: 13 }}>{name}</p>}
          </div>
          {say && (
            <div className="chat-bubble" aria-live="polite"><b>{bot.name}:</b> {say}</div>
          )}
          {tenSec && myTurn && !result && <p className="mono" style={{ margin: 0 }}>⏱ {moveLeft} s für diesen Zug</p>}
          {roulette && myTurn && !result && offer.length > 0 && (
            <div className="row">{offer.map((o) => <button key={o} className="btn small" onClick={() => void onMove(o)}>{sanDe(uciToSan(fen, o))}</button>)}</div>
          )}
          {botMind.length > 0 && !myTurn && (
            <div className="panel"><div className="panel-head"><b>Bot-Gedanken</b></div><div className="panel-body mono" style={{ fontSize: 13 }}>
              {botMind.map((l, i) => <div key={i}>{formatEval(l)} · {l.pv.slice(0, 4).map((u, k) => { try { return k === 0 ? sanDe(uciToSan(fen, u)) : u; } catch { return u; } }).join(' ')}</div>)}
            </div></div>
          )}
          {result && <div className="feedback good"><b>{result}</b></div>}
          {feedback && !result && (
            <div className={'feedback ' + (feedback.q === Q_LABEL.best || feedback.q === Q_LABEL.good ? 'good' : 'bad')}>
              <b>{feedback.q}</b>
              {feedback.text && <Rich text={feedback.text} />}
            </div>
          )}
          {helper && best && myTurn && !result && (
            <div className="panel"><div className="panel-body">Tipp: <b>{sanDe(uciToSan(fen, best))}</b> – der Pfeil zeigt den Zug der Engine.</div></div>
          )}
          <div className="panel">
            <div className="panel-head"><b>Züge</b></div>
            <div className="movelist">
              {[...prefix, ...history].map((s, i) => <span key={i}>{i % 2 === 0 && <span className="n">{i / 2 + 1}.</span>} {sanDe(s)}</span>)}
            </div>
          </div>
          <div className="row">
            <button className="btn small" onClick={() => setHelper((h) => !h)}>{helper ? 'Tipps aus' : 'Tipps an'}</button>
            <button className="btn small" onClick={() => setComment((h) => !h)}>{comment ? 'Kommentar aus' : 'Kommentar an'}</button>
            <button className="btn small" disabled={history.length < 2 || ((!!result || !!clock.base) && !flag('freeUndo'))} onClick={() => { if (result) setResult(''); setHistory(history.slice(0, myTurn ? -2 : -1)); }}>Zug zurück</button>
            {!result && <button className="btn small" onClick={() => finishGame('Du hast aufgegeben.', 'l')}>Aufgeben</button>}
          </div>
          {result && (
            <div className="row">
              <button className="btn small" onClick={() => startGame(bot)}>Revanche</button>
              {history.length >= 6 && (
                <button className="btn primary small" onClick={() => openCoach({ fen: base ?? START_FEN, moves: history, me: color === 'white' ? 'w' : 'b', bot: bot?.name ?? 'Bot' })}>
                  Fehler-Coach <span className="arrow">→</span>
                </button>
              )}
              <button className="btn small" onClick={() => {
                try { sessionStorage.setItem('chessty.analyse', game.pgn()); } catch { /* egal */ }
                location.hash = '#/analyse';
              }}>Analysieren <span className="arrow">→</span></button>
            </div>
          )}
        </aside>
      </div>
    </>
  );
}
