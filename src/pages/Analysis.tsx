import { useEffect, useMemo, useRef, useState } from 'react';
import { Chess } from 'chess.js';
import Board from '../components/Board';
import { EvalBar } from '../components/Widgets';
import { engine, type EngineLine } from '../lib/engine';
import { gameAccuracy } from '../lib/accuracy';
import { sanDe, uci } from '../lib/chess';
import { addReview, addPatterns } from '../lib/progress';
import { Rich } from '../components/Explain';
import { useKeys } from '../lib/useKeys';
import { judgeMove, Q_LABEL, PATTERN_INFO, type Quality, type Pattern } from '../lib/explainMove';
import GameImport from '../components/GameImport';
import { loadOpenings } from '../lib/openings';
import { lessons } from '../content';

interface Ply {
  san: string;
  uci: string;
  fenBefore: string;
  fenAfter: string;
  color: 'w' | 'b';
  evalBefore?: EngineLine;
  evalAfter?: EngineLine;
  best?: string;
  bestSan?: string;
  quality?: Quality;
  pattern?: Pattern;
  explain?: string;
}

const SAMPLE = `1. e4 e5 2. Nf3 Nc6 3. Bc4 Nd4 4. Nxe5 Qg5 5. Nxf7 Qxg2 6. Rf1 Qxe4+ 7. Be2 Nf3#`;

/** Eröffnungs-Check: benannte Eröffnung und Abweichung von trainierten Varianten. */
async function openingCheck(sans: string[], me: 'w' | 'b' | null) {
  const rows = await loadOpenings();
  let best: { name: string; eco: string; len: number } | null = null;
  for (const r of rows) if (r.moves.length <= sans.length && r.moves.every((m, i) => m === sans[i]) && (!best || r.moves.length > best.len)) best = { name: r.name, eco: r.eco, len: r.moves.length };
  // Abweichung von einer trainierten Variante finden (längste gemeinsame Anfangsfolge)
  let dev: { lesson: string; drill: string; ply: number; expected: string; played: string; mine: boolean } | null = null;
  for (const l of lessons)
    for (const d of l.drill ?? []) {
      let k = 0;
      while (k < d.moves.length && k < sans.length && d.moves[k] === sans[k]) k++;
      if (k >= 2 && k < d.moves.length && k < sans.length && (!dev || k > dev.ply))
        dev = { lesson: l.title, drill: d.name, ply: k, expected: d.moves[k], played: sans[k], mine: me !== null && (k % 2 === 0 ? 'w' : 'b') === me };
    }
  return { best, dev };
}

export default function Analysis() {
  const [pgn, setPgn] = useState(() => {
    try {
      return sessionStorage.getItem('chessty.analyse') ?? '';
    } catch {
      return '';
    }
  });
  const [me, setMe] = useState<'w' | 'b' | null>(null);
  const [plies, setPlies] = useState<Ply[]>([]);
  const [cur, setCur] = useState(0);
  const [progress, setProgress] = useState(-1);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [opening, setOpening] = useState<Awaited<ReturnType<typeof openingCheck>> | null>(null);
  const cancel = useRef(false);

  useEffect(() => () => { cancel.current = true; engine.stop(); }, []);
  useKeys({
    ArrowRight: () => setCur((c) => Math.min(plies.length, c + 1)),
    ArrowLeft: () => setCur((c) => Math.max(0, c - 1)),
    Home: () => setCur(0),
    End: () => setCur(plies.length),
  });

  async function run(text = pgn, color = me) {
    setError('');
    setSaved(false);
    const c = new Chess();
    try {
      c.loadPgn(text.trim());
    } catch {
      setError('Die PGN konnte nicht gelesen werden. Füge die Züge im Format „1. e4 e5 2. Nf3 …“ ein (englische Figurenbuchstaben: N, B, R, Q, K).');
      return;
    }
    const hist = c.history({ verbose: true });
    if (!hist.length) return setError('Keine Züge gefunden.');
    const list: Ply[] = hist.map((m) => ({ san: m.san, uci: uci(m), fenBefore: m.before, fenAfter: m.after, color: m.color }));
    setPlies(list);
    setCur(0);
    setOpening(await openingCheck(list.map((p) => p.san), color));
    cancel.current = false;
    const evals: (EngineLine | undefined)[] = [];
    const bests: string[] = [];
    const fens = [list[0].fenBefore, ...list.map((p) => p.fenAfter)];
    for (let i = 0; i < fens.length; i++) {
      if (cancel.current) return;
      setProgress(i / fens.length);
      const g = new Chess(fens[i]);
      if (g.isGameOver()) {
        evals[i] = { depth: 0, multipv: 1, pv: [], cp: g.isCheckmate() ? (g.turn() === 'w' ? -100 : 100) : 0 };
        continue;
      }
      const r = await engine.analyse(fens[i], { depth: 14 });
      evals[i] = r.lines[0];
      bests[i] = r.best;
    }
    const out = list.map((p, i) => {
      const j = judgeMove(p.fenBefore, p.uci, evals[i], evals[i + 1], bests[i]);
      return { ...p, evalBefore: evals[i], evalAfter: evals[i + 1], best: bests[i], bestSan: j.bestSan, quality: j.quality, pattern: j.pattern, explain: j.text };
    });
    setPlies(out);
    setProgress(-1);
    // Fehlermuster nur für die eigenen Züge sammeln
    addPatterns(color ? out.filter((p) => p.color === color && (p.quality === 'mistake' || p.quality === 'blunder') && p.pattern).map((p) => p.pattern!) : []);
  }

  const stats = useMemo(() => {
    const s = { w: { inaccuracy: 0, mistake: 0, blunder: 0, acc: 0 }, b: { inaccuracy: 0, mistake: 0, blunder: 0, acc: 0 } };
    if (!plies.length || !plies[0].quality) return s;
    for (const p of plies) if (p.quality && p.quality in s[p.color]) (s[p.color] as Record<string, number>)[p.quality]++;
    // Bewertungen in Centipawns aus Sicht von Weiß (Matt = ±10000)
    const toCp = (l?: EngineLine) => (!l ? 0 : l.mate !== undefined ? (l.mate > 0 ? 10000 : l.mate < 0 ? -10000 : 0) : Math.round((l.cp ?? 0) * 100));
    const cps = [toCp(plies[0].evalBefore), ...plies.map((p) => toCp(p.evalAfter))];
    const acc = gameAccuracy(cps, plies[0].color === 'w');
    s.w.acc = acc.white;
    s.b.acc = acc.black;
    return s;
  }, [plies]);

  const myPatterns = useMemo(() => {
    const m: Partial<Record<Pattern, number>> = {};
    for (const p of plies) if ((p.quality === 'mistake' || p.quality === 'blunder') && p.pattern && (!me || p.color === me)) m[p.pattern] = (m[p.pattern] ?? 0) + 1;
    return Object.entries(m) as [Pattern, number][];
  }, [plies, me]);

  function saveMistakes() {
    for (const p of plies) {
      if ((p.quality === 'mistake' || p.quality === 'blunder') && p.best && (!me || p.color === me)) {
        addReview({ id: 'ana:' + p.fenBefore, fen: p.fenBefore, solution: [p.best], title: `Eigene Partie: statt ${sanDe(p.san)}`, note: p.explain?.replace(/\*\*/g, ''), source: 'Analyse' });
      }
    }
    setSaved(true);
  }

  const view = cur === 0 ? null : plies[cur - 1];
  const fen = view ? view.fenAfter : plies[0]?.fenBefore ?? new Chess().fen();
  const next = plies[cur];
  const arrows = next?.quality && next.quality !== 'best' && next.quality !== 'good' && next.best ? ['!' + next.uci.slice(0, 4), next.best.slice(0, 4)] : [];

  if (!plies.length || progress >= 0) {
    return (
      <>
        <div className="page-head">
          <div className="kicker">Stockfish 19 · läuft offline in deinem Browser</div>
          <h1>Partieanalyse</h1>
          <p className="muted">Lade deine Partien direkt von Lichess oder Chess.com – oder füge eine PGN ein. Jeder Fehler wird in einfacher Sprache erklärt, deine typischen Fehlermuster werden gesammelt.</p>
        </div>
        <div className="stack" style={{ maxWidth: 820 }}>
          <GameImport onPick={(g) => { setPgn(g.pgn); setMe(g.userColor); void run(g.pgn, g.userColor); }} />
          <div className="panel">
            <div className="panel-head"><b>…oder PGN einfügen</b></div>
            <div className="panel-body stack">
              <textarea value={pgn} onChange={(e) => setPgn(e.target.value)} placeholder={SAMPLE} />
              <div className="row">
                <span>Ich hatte:</span>
                <div className="seg">
                  <button className={me === 'w' ? 'on' : ''} onClick={() => setMe('w')}>Weiß</button>
                  <button className={me === 'b' ? 'on' : ''} onClick={() => setMe('b')}>Schwarz</button>
                  <button className={me === null ? 'on' : ''} onClick={() => setMe(null)}>Egal</button>
                </div>
              </div>
            </div>
          </div>
          {error && <div className="feedback bad">{error}</div>}
          {progress >= 0 ? (
            <div>
              <p className="mono"><span className="spinner" /> Analysiere … {Math.round(progress * 100)}%</p>
              <div className="bar"><i style={{ width: `${progress * 100}%` }} /></div>
            </div>
          ) : (
            <div className="row">
              <button className="btn primary" onClick={() => run()} disabled={!pgn.trim()}>Analysieren <span className="arrow">→</span></button>
              <button className="btn" onClick={() => setPgn(SAMPLE)}>Beispiel laden</button>
            </div>
          )}
        </div>
      </>
    );
  }

  return (
    <>
      <button className="back" style={{ background: 'none', border: 0, cursor: 'pointer', padding: 0 }} onClick={() => setPlies([])}>← Neue Partie</button>
      <div className="trainer">
        <div className="board-col">
          <Board fen={fen} orientation={me === 'b' ? 'black' : 'white'} lastMove={view ? [view.uci.slice(0, 2), view.uci.slice(2, 4)] : undefined} arrows={arrows} />
          <EvalBar line={view ? view.evalAfter : plies[0]?.evalBefore} />
        </div>
        <aside className="side">
          <div className="kpis">
            {(['w', 'b'] as const).map((c) => (
              <div className="kpi" key={c}>
                <span>{c === 'w' ? 'Weiß' : 'Schwarz'}{me === c ? ' (du)' : ''} · Genauigkeit</span>
                <b>{Math.round(stats[c].acc)}%</b>
                <span className="mono">{stats[c].blunder}?? · {stats[c].mistake}? · {stats[c].inaccuracy}?!</span>
              </div>
            ))}
          </div>
          {opening?.best && (
            <div className="panel"><div className="panel-body">
              <b>Eröffnung:</b> {opening.best.eco} {opening.best.name} <span className="muted">(Theorie bis Zug {Math.ceil(opening.best.len / 2)})</span>
              {opening.dev && (
                <p style={{ marginTop: 8, marginBottom: 0 }}>
                  {opening.dev.mine ? '⚠ ' : ''}In Zug {Math.floor(opening.dev.ply / 2) + 1} wurde von deiner Trainingsvariante „{opening.dev.drill}“ ({opening.dev.lesson}) abgewichen: gespielt {sanDe(opening.dev.played)}, Theorie {sanDe(opening.dev.expected)}.
                </p>
              )}
            </div></div>
          )}
          {next?.explain && (
            <div className="feedback bad">
              <b>{Math.floor(cur / 2) + 1}{next.color === 'w' ? '.' : '…'} {sanDe(next.san)} – {Q_LABEL[next.quality!]}</b>
              <Rich text={next.explain} />
            </div>
          )}
          {next && !next.explain && next.quality && (
            <div className="panel"><div className="panel-body">Nächster Zug <b>{sanDe(next.san)}</b>: {Q_LABEL[next.quality]}</div></div>
          )}
          <div className="panel">
            <div className="panel-head"><b>Züge</b><span className="spacer" /><span className="mono" style={{ fontSize: 12 }}>unterstrichen = Fehler</span></div>
            <div className="movelist" style={{ maxHeight: 260 }}>
              {plies.map((p, i) => (
                <span key={i} style={{ display: 'contents' }}>
                  {i % 2 === 0 && <span className="n">{i / 2 + 1}.</span>}
                  <button className={(cur === i + 1 ? 'cur ' : '') + (p.quality === 'blunder' ? 'q-blunder' : p.quality === 'mistake' || p.quality === 'inaccuracy' ? 'q-mistake' : '')} onClick={() => setCur(i + 1)}>
                    {sanDe(p.san)}{p.quality === 'blunder' ? '??' : p.quality === 'mistake' ? '?' : p.quality === 'inaccuracy' ? '?!' : ''}
                  </button>
                </span>
              ))}
            </div>
          </div>
          <div className="row">
            <button className="btn small" onClick={() => setCur(0)}>|←</button>
            <button className="btn small" onClick={() => setCur(Math.max(0, cur - 1))}>←</button>
            <button className="btn small" onClick={() => setCur(Math.min(plies.length, cur + 1))}>→</button>
            <button className="btn small" onClick={() => {
              const i = plies.findIndex((p, k) => k >= cur && (p.quality === 'blunder' || p.quality === 'mistake') && (!me || p.color === me));
              if (i >= 0) setCur(i);
            }}>Nächster Fehler</button>
          </div>
          {myPatterns.length > 0 && (
            <div className="panel">
              <div className="panel-head"><b>{me ? 'Deine' : 'Die'} Fehlermuster in dieser Partie</b></div>
              <div className="list" style={{ border: 0 }}>
                {myPatterns.map(([k, n]) => (
                  <a key={k} href={PATTERN_INFO[k].link}>
                    <b style={{ flex: 1 }}>{PATTERN_INFO[k].name} ×{n}</b>
                    <span style={{ fontSize: 13 }}>{PATTERN_INFO[k].linkText} →</span>
                  </a>
                ))}
              </div>
            </div>
          )}
          <div className="row">
            <button className="btn" onClick={saveMistakes} disabled={saved}>{saved ? '✓ Als Puzzles im Fehlerheft' : 'Fehler als Puzzles speichern'}</button>
            <a className="btn" href={'#/spielen/' + encodeURIComponent(fen)}>Ab hier gegen Bot</a>
          </div>
          <p className="muted" style={{ fontSize: 13 }}>Pfeile: grau = gespielter Fehler, schwarz = besserer Zug. Tastatur: ← →</p>
        </aside>
      </div>
    </>
  );
}
