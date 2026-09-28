import { useEffect, useMemo, useRef, useState } from 'react';
import { Chess } from 'chess.js';
import Board from '../components/Board';
import { EvalBar } from '../components/Widgets';
import { engine, formatEval, winChance, type EngineLine } from '../lib/engine';
import { sanDe, parseUci, material, pieceName, uci } from '../lib/chess';
import { addReview } from '../lib/progress';
import { Rich } from '../components/Explain';

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
  quality?: 'best' | 'good' | 'inaccuracy' | 'mistake' | 'blunder';
  explain?: string;
}

const Q_LABEL = { best: 'Bester Zug', good: 'Gut', inaccuracy: 'Ungenauigkeit ?!', mistake: 'Fehler ?', blunder: 'Patzer ??' };

const SAMPLE = `1. e4 e5 2. Nf3 Nc6 3. Bc4 Nd4 4. Nxe5 Qg5 5. Nxf7 Qxg2 6. Rf1 Qxe4+ 7. Be2 Nf3#`;

/** Einfache Sprache: Was ist bei diesem Zug schiefgelaufen? */
function explain(p: Ply, afterLine: EngineLine | undefined): string {
  const me = p.color === 'w' ? 1 : -1;
  const bestMate = p.evalBefore?.mate;
  if (bestMate !== undefined && bestMate * me > 0 && !(p.evalAfter?.mate !== undefined && p.evalAfter.mate * me > 0))
    return `Du hattest ein **Matt in ${Math.abs(bestMate)}** – beginnend mit **${sanDe(p.bestSan ?? '')}**. Suche immer zuerst nach Schachgeboten!`;
  if (p.evalAfter?.mate !== undefined && p.evalAfter.mate * me < 0)
    return `Nach ${sanDe(p.san)} kann der Gegner **in ${Math.abs(p.evalAfter.mate)} Zügen mattsetzen**. Prüfe vor jedem Zug: Welche Schachs und Drohungen hat der Gegner?`;
  // Materialverlust nach der besten gegnerischen Antwort?
  const reply = afterLine?.pv[0];
  if (reply) {
    const c = new Chess(p.fenAfter);
    const before = material(new Chess(p.fenBefore));
    const r = c.move(parseUci(reply));
    if (r?.captured) {
      const after = material(c);
      const lost = p.color === 'w' ? before.white - after.white : before.black - after.black;
      if (lost >= 2)
        return `Nach ${sanDe(p.san)} schlägt der Gegner mit **${sanDe(r.san)}** deinen ${pieceName[r.captured]} auf ${r.to}. Stand die Figur ungedeckt? Besser war **${sanDe(p.bestSan ?? '')}**.`;
    }
    if (r) return `Der Gegner antwortet stark mit **${sanDe(r.san)}**. Besser war **${sanDe(p.bestSan ?? '')}** (Bewertung ${formatEval(p.evalBefore)} statt ${formatEval(p.evalAfter)}).`;
  }
  return `Besser war **${sanDe(p.bestSan ?? '')}**.`;
}

export default function Analysis() {
  const [pgn, setPgn] = useState(() => {
    try {
      return sessionStorage.getItem('chessty.analyse') ?? '';
    } catch {
      return '';
    }
  });
  const [plies, setPlies] = useState<Ply[]>([]);
  const [cur, setCur] = useState(0);
  const [progress, setProgress] = useState(-1);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const cancel = useRef(false);

  useEffect(() => () => { cancel.current = true; engine.stop(); }, []);

  async function run() {
    setError('');
    setSaved(false);
    const c = new Chess();
    try {
      c.loadPgn(pgn.trim());
    } catch {
      setError('Die PGN konnte nicht gelesen werden. Füge die Züge im Format „1. e4 e5 2. Sf3 …“ ein (englische Figurenbuchstaben: N, B, R, Q, K).');
      return;
    }
    const hist = c.history({ verbose: true });
    if (!hist.length) return setError('Keine Züge gefunden.');
    const list: Ply[] = hist.map((m) => ({ san: m.san, uci: uci(m), fenBefore: m.before, fenAfter: m.after, color: m.color }));
    setPlies(list);
    setCur(0);
    cancel.current = false;
    const evals: (EngineLine | undefined)[] = [];
    const bests: string[] = [];
    const fens = [list[0].fenBefore, ...list.map((p) => p.fenAfter)];
    for (let i = 0; i < fens.length; i++) {
      if (cancel.current) return;
      setProgress(i / fens.length);
      const g = new Chess(fens[i]);
      if (g.isGameOver()) {
        // Matt: ±100 als Bewertung, Remis: 0
        evals[i] = { depth: 0, multipv: 1, pv: [], cp: g.isCheckmate() ? (g.turn() === 'w' ? -100 : 100) : 0 };
        continue;
      }
      const r = await engine.analyse(fens[i], { depth: 12 });
      evals[i] = r.lines[0];
      bests[i] = r.best;
    }
    const out = list.map((p, i) => {
      const before = evals[i];
      const after = evals[i + 1];
      const me = p.color === 'w';
      const wcB = me ? winChance(before) : 1 - winChance(before);
      const wcA = me ? winChance(after) : 1 - winChance(after);
      const drop = wcB - wcA;
      const q: Ply['quality'] = bests[i] === p.uci ? 'best' : drop > 0.3 ? 'blunder' : drop > 0.18 ? 'mistake' : drop > 0.09 ? 'inaccuracy' : 'good';
      const bestSan = bests[i] ? new Chess(p.fenBefore).move(parseUci(bests[i]))?.san : undefined;
      const np: Ply = { ...p, evalBefore: before, evalAfter: after, best: bests[i], bestSan, quality: q };
      if (q === 'mistake' || q === 'blunder' || q === 'inaccuracy') np.explain = explain(np, after);
      return np;
    });
    setPlies(out);
    setProgress(-1);
  }

  const stats = useMemo(() => {
    const s = { w: { inaccuracy: 0, mistake: 0, blunder: 0, acc: 0, n: 0 }, b: { inaccuracy: 0, mistake: 0, blunder: 0, acc: 0, n: 0 } };
    for (const p of plies) {
      if (!p.quality) continue;
      const side = s[p.color];
      if (p.quality in side) (side as Record<string, number>)[p.quality]++;
      const me = p.color === 'w';
      const drop = Math.max(0, (me ? winChance(p.evalBefore) : 1 - winChance(p.evalBefore)) - (me ? winChance(p.evalAfter) : 1 - winChance(p.evalAfter)));
      side.acc += Math.max(0, 100 - drop * 250);
      side.n++;
    }
    return s;
  }, [plies]);

  function saveMistakes() {
    for (const p of plies) {
      if ((p.quality === 'mistake' || p.quality === 'blunder') && p.best) {
        addReview({ id: 'ana:' + p.fenBefore, fen: p.fenBefore, solution: [p.best], title: `Eigene Partie: statt ${sanDe(p.san)}`, note: p.explain?.replace(/\*\*/g, ''), source: 'Analyse' });
      }
    }
    setSaved(true);
  }

  const view = cur === 0 ? null : plies[cur - 1];
  const fen = view ? view.fenAfter : plies[0]?.fenBefore ?? new Chess().fen();
  const next = plies[cur];
  const arrows = next?.quality && next.quality !== 'best' && next.quality !== 'good' && next.best
    ? ['!' + next.uci.slice(0, 4), next.best.slice(0, 4)]
    : [];

  if (!plies.length || progress >= 0) {
    return (
      <>
        <div className="page-head">
          <div className="kicker">Stockfish 19 · läuft offline in deinem Browser</div>
          <h1>Partieanalyse</h1>
          <p className="muted">Füge eine Partie im PGN-Format ein (z. B. von Lichess oder Chess.com exportiert). Jeder Fehler wird in einfacher Sprache erklärt – mit dem besseren Zug als Pfeil.</p>
        </div>
        <div className="stack" style={{ maxWidth: 760 }}>
          <textarea value={pgn} onChange={(e) => setPgn(e.target.value)} placeholder={SAMPLE} />
          {error && <div className="feedback bad">{error}</div>}
          {progress >= 0 ? (
            <div>
              <p className="mono"><span className="spinner" /> Analysiere … {Math.round(progress * 100)}%</p>
              <div className="bar"><i style={{ width: `${progress * 100}%` }} /></div>
            </div>
          ) : (
            <div className="row">
              <button className="btn primary" onClick={run} disabled={!pgn.trim()}>Analysieren <span className="arrow">→</span></button>
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
          <Board fen={fen} lastMove={view ? [view.uci.slice(0, 2), view.uci.slice(2, 4)] : undefined} arrows={arrows} />
          <EvalBar line={view ? view.evalAfter : plies[0]?.evalBefore} />
        </div>
        <aside className="side">
          <div className="kpis">
            {(['w', 'b'] as const).map((c) => (
              <div className="kpi" key={c}>
                <span>{c === 'w' ? 'Weiß' : 'Schwarz'} · Genauigkeit</span>
                <b>{Math.round(stats[c].acc / Math.max(1, stats[c].n))}%</b>
                <span className="mono">{stats[c].blunder}?? · {stats[c].mistake}? · {stats[c].inaccuracy}?!</span>
              </div>
            ))}
          </div>
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
            <div className="movelist" style={{ maxHeight: 300 }}>
              {plies.map((p, i) => (
                <span key={i} style={{ display: 'contents' }}>
                  {i % 2 === 0 && <span className="n">{i / 2 + 1}.</span>}
                  <button className={(cur === i + 1 ? 'cur ' : '') + (p.quality === 'blunder' ? 'q-blunder' : p.quality === 'mistake' || p.quality === 'inaccuracy' ? 'q-mistake' : '')}
                    onClick={() => setCur(i + 1)}>
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
              const i = plies.findIndex((p, k) => k >= cur && (p.quality === 'blunder' || p.quality === 'mistake'));
              if (i >= 0) setCur(i);
            }}>Nächster Fehler</button>
          </div>
          <button className="btn" onClick={saveMistakes} disabled={saved}>{saved ? '✓ Im Fehlerheft' : 'Fehler ins Fehlerheft'}</button>
          <p className="muted" style={{ fontSize: 13 }}>Pfeile: grau = gespielter Fehler, schwarz = besserer Zug. Die Stellung zeigt den Moment VOR dem markierten Zug.</p>
        </aside>
      </div>
    </>
  );
}
