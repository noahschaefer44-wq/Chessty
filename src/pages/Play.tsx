import { useEffect, useMemo, useRef, useState } from 'react';
import { flag, useAdmin, registerAdminActions } from '../lib/admin';
import { forceMove } from '../lib/forceMove';
import { Chess, type Move } from 'chess.js';
import Board from '../components/Board';
import { EvalBar } from '../components/Widgets';
import { Rich } from '../components/Explain';
import { engine, evalNumber, type EngineLine } from '../lib/engine';
import { tryMove, sanDe, uciToSan, material, PIECE_VALUE, parseUci } from '../lib/chess';
import { useEngine } from '../lib/useEngine';
import { update, addXp, useProgress, bump, bumpTotal } from '../lib/progress';
import { sound } from '../lib/sound';
import { openingName } from '../lib/openings';
import { judgeMove, Q_LABEL } from '../lib/explainMove';

type Style = 'normal' | 'attack' | 'defend' | 'book' | 'simplify';

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
  // Persönlichkeiten
  { id: 'anton', name: 'Angreifer Anton', elo: '~1500', desc: 'Liebt Schachs, Schläge und Opfer. Greift an, auch wenn es riskant ist – übe Verteidigung!', skill: 7, depth: 8, random: 0, style: 'attack' },
  { id: 'vera', name: 'Verteidigerin Vera', elo: '~1500', desc: 'Spielt vorsichtig und solide. Übe, eine gesicherte Stellung zu knacken.', skill: 7, depth: 8, random: 0, style: 'defend' },
  { id: 'olga', name: 'Eröffnungs-Olga', elo: '~1400', desc: 'Spielt nur Najdorf (Schwarz) und London (Weiß) – teste deine Vorbereitung.', skill: 6, depth: 7, random: 0, style: 'book' },
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

/** Zugwahl je nach Persönlichkeit: aus den besten Engine-Zügen den „typischen“ nehmen. */
async function botMove(bot: Bot, fen: string, history: string[], fromStart: boolean): Promise<string> {
  const c = new Chess(fen);
  const legal = c.moves({ verbose: true });
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
  if (bot.style === 'normal' || bot.style === 'book') return (await engine.analyse(fen, { depth: bot.depth, skill: bot.skill })).best;
  const r = await engine.analyse(fen, { depth: bot.depth, multipv: 5 });
  const white = c.turn() === 'w';
  const score = (l: EngineLine) => evalNumber(l) * (white ? 1 : -1);
  const best = score(r.lines[0]);
  const tol = bot.style === 'attack' ? 0.9 : 0.5;
  const cands = r.lines.filter((l) => best - score(l) <= tol);
  const bonus = (l: EngineLine) => {
    const m = new Chess(fen).move(parseUci(l.pv[0])) as Move;
    const after = new Chess(fen);
    after.move(m.san);
    if (bot.style === 'attack') return (m.san.includes('+') ? 2 : 0) + (m.captured ? 1 : 0) + (after.isCheckmate() ? 10 : 0);
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
  // Admin-Testmodus: nach illegalen Zügen startet die Partie intern von einer neuen Stellung
  const [base, setBase] = useState<string | undefined>(initialFen);
  const [prefix, setPrefix] = useState<string[]>([]);
  const adm = useAdmin();
  const clair = adm.unlocked && !!adm.flags.clairvoyance;

  const game = useMemo(() => {
    const c = new Chess(base);
    for (const m of history) c.move(m);
    return c;
  }, [history, base]);
  const fen = game.fen();
  const lastMv = game.history({ verbose: true }).at(-1);
  const myTurn = (game.turn() === 'w' ? 'white' : 'black') === color;
  const { lines, loading } = useEngine(fen, (helper || clair) && !!bot && myTurn && !result && !judging, 14);

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

  function startGame(b: Bot) {
    setBot(b);
    setHistory([]);
    setBase(initialFen);
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
    if (!bot) return;
    key === 'w' ? sound.good() : key === 'l' && sound.bad();
    update((pr) => {
      const b = pr.botResults[bot.id] ?? { w: 0, d: 0, l: 0 };
      return { ...pr, botResults: { ...pr.botResults, [bot.id]: { ...b, [key]: b[key] + 1 } } };
    });
    addXp(key === 'w' ? 15 + Math.min(5, BOTS.indexOf(bot)) * 5 : key === 'd' ? 8 : 3);
    bump('botGames');
    if (key === 'w') bumpTotal('botWins');
  }

  const addInc = (side: 'w' | 'b') => clock.inc && setTimes((t) => ({ ...t, [side]: t[side] + clock.inc * 1000 }));

  // Bot zieht (erst nachdem der Kommentar zum eigenen Zug fertig ist)
  useEffect(() => {
    if (!bot || myTurn || result || judging || game.isGameOver()) return;
    let alive = true;
    setThinking(true);
    (async () => {
      let u: string;
      if (flag('weakBot')) {
        const ms = new Chess(fen).moves({ verbose: true });
        const pick = ms[Math.floor(Math.random() * ms.length)];
        u = pick ? pick.from + pick.to + (pick.promotion ?? '') : '';
      } else u = await botMove(bot, fen, history, !initialFen && !prefix.length);
      await new Promise((r) => setTimeout(r, 250));
      if (!alive) return;
      const c = new Chess(fen);
      const m = tryMove(c, u);
      setThinking(false);
      if (!m) return;
      m.captured ? sound.capture() : sound.move();
      addInc(game.turn());
      setHistory((h) => [...h, m.san]);
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fen, bot, myTurn, result, judging]);

  useEffect(() => {
    if (bot && history.length) checkEnd(game);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history]);

  /** Illegalen Zug ausführen (nur Admin-Testmodus) */
  function playIllegal(u: string) {
    const f = forceMove(fen, u);
    if (!f) return;
    sound.capture();
    if (f.capturedKing) {
      setPrefix([...prefix, ...history, f.label]);
      setHistory([]);
      finishGame('Du hast den König geschlagen – Sieg (Testmodus).', 'w');
      return;
    }
    if (!f.valid) {
      setFeedback({ q: 'Testmodus', text: 'Diese Stellung kann die Engine nicht spielen (z. B. König im Schach des Ziehenden). Probiere einen anderen Zug.' });
      return;
    }
    setPrefix([...prefix, ...history, f.label]);
    setHistory([]);
    // Eigener König steht danach im Schach? Dann schlägt ihn der Bot.
    const after = new Chess(f.fen);
    const mine = color === 'white' ? 'w' : 'b';
    const k = after.board().flat().find((x) => x && x.type === 'k' && x.color === mine);
    if (k && after.isAttacked(k.square, mine === 'w' ? 'b' : 'w')) {
      finishGame(`${bot?.name} schlägt deinen König – Niederlage (Testmodus).`, 'l');
      return;
    }
    setBase(f.fen);
    setFeedback(null);
  }

  // Aktionen im Admin-Panel für diese Partie
  useEffect(() => {
    if (!bot || !adm.unlocked) return;
    return registerAdminActions('play', [
      { label: 'Sofort gewinnen', run: () => finishGame('Sieg (Testmodus).', 'w') },
      { label: 'Sofort verlieren', run: () => finishGame('Niederlage (Testmodus).', 'l') },
      { label: 'Remis', run: () => finishGame('Remis (Testmodus).', 'd') },
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
    ]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bot, adm.unlocked, fen, result, history, prefix]);

  async function onMove(u: string) {
    if (!myTurn || result || judging) return;
    const before = fen;
    const c = new Chess(fen);
    const m = tryMove(c, u);
    if (!m) {
      if (flag('freeMoves')) playIllegal(u);
      return;
    }
    m.captured ? sound.capture() : sound.move();
    addInc(game.turn());
    setHistory([...history, m.san]);
    setFeedback(null);
    if (!comment || c.isGameOver()) return;
    // Kurzkommentar: Engine vor und nach dem Zug vergleichen
    setJudging(true);
    try {
      const a = await engine.analyse(before, { depth: 11 });
      const b = await engine.analyse(c.fen(), { depth: 11 });
      const j = judgeMove(before, m.from + m.to + (m.promotion ?? ''), a.lines[0], b.lines[0], a.best);
      const praise = j.quality === 'best' ? 'Stark – das ist der Zug der Engine!' : j.quality === 'good' ? 'Guter Zug.' : undefined;
      setFeedback({ q: Q_LABEL[j.quality], text: j.text ?? praise });
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
          <p className="muted">Sechs Spielstärken und vier Persönlichkeiten. Mit Schachuhr, Tipp-Modus, Kommentar zu jedem Zug und Analyse danach.</p>
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
        </div>
        <h2>Spielstärken</h2>
        <div className="grid">
          {BOTS.filter((b) => b.style === 'normal').map((b, i) => {
            const r = p.botResults[b.id];
            return (
              <button key={b.id} className={'card' + (i === 5 ? ' inverse' : '')} onClick={() => startGame(b)}>
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
          <Board fen={fen} orientation={color} movable={!result && myTurn && !judging ? color : undefined} onMove={onMove} allowFree
            lastMove={lastMv ? [lastMv.from, lastMv.to] : undefined} arrows={(helper || clair) && best && myTurn ? [best.slice(0, 4)] : []} />
          {clockBox(mySide, 'Du')}
          {helper && <EvalBar line={lines[0]} loading={loading} />}
        </div>
        <aside className="side">
          <div>
            <div className="kicker">Gegner · Elo ca. {bot.elo.replace("~", "")}{clock.base ? ` · ${clock.label}` : ''}</div>
            <h2>{bot.name}</h2>
            <p className="mono" style={{ fontSize: 13, margin: 0 }}>
              {thinking ? <><span className="spinner" /> denkt …</> : judging ? <><span className="spinner" /> Kommentar …</> : result ? 'Partie beendet' : myTurn ? 'Du bist am Zug' : ''}
              {diff !== 0 && ` · Material ${diff > 0 ? 'Weiß' : 'Schwarz'} +${Math.abs(diff)}`}
            </p>
            {name && <p className="muted" style={{ fontSize: 13 }}>{name}</p>}
          </div>
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
            <button className="btn small" disabled={history.length < 2 || !!result || !!clock.base} onClick={() => setHistory(history.slice(0, myTurn ? -2 : -1))}>Zug zurück</button>
            {!result && <button className="btn small" onClick={() => finishGame('Du hast aufgegeben.', 'l')}>Aufgeben</button>}
          </div>
          {result && (
            <div className="row">
              <button className="btn small" onClick={() => startGame(bot)}>Revanche</button>
              <button className="btn primary small" onClick={() => {
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
