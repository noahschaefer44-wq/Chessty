import { useEffect, useRef, useState } from 'react';
import { Chessground } from 'chessground';
import type { Api } from 'chessground/api';
import type { Key, Piece } from 'chessground/types';
import { Chess } from 'chess.js';
import { EvalBar } from '../components/Widgets';
import { useEngine } from '../lib/useEngine';
import { uciToSan, sanDe } from '../lib/chess';
import { PIECE_IMG } from '../components/pieceImages';

const START = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR';
const EMPTY = '4k3/8/8/8/8/8/8/4K3';
const ROLES: Record<string, Piece['role']> = { k: 'king', q: 'queen', r: 'rook', b: 'bishop', n: 'knight', p: 'pawn' };

/** Brett-Editor: Stellung frei aufbauen, analysieren, gegen den Bot ausspielen. */
export default function Editor({ initial }: { initial?: string }) {
  const el = useRef<HTMLDivElement>(null);
  const api = useRef<Api | null>(null);
  const [board, setBoard] = useState(() => (initial ? decodeURIComponent(initial).split(' ')[0] : START));
  const [turn, setTurn] = useState<'w' | 'b'>(() => (initial && decodeURIComponent(initial).split(' ')[1] === 'b' ? 'b' : 'w'));
  const [tool, setTool] = useState<string>('move');
  const [flip, setFlip] = useState(false);
  const [engineOn, setEngineOn] = useState(false);
  const toolRef = useRef(tool);
  toolRef.current = tool;

  const fullFen = `${board} ${turn} - - 0 1`;
  const legal = (() => {
    try {
      const c = new Chess(fullFen);
      const f = fullFen.split(' ');
      f[1] = turn === 'w' ? 'b' : 'w';
      if (new Chess(f.join(' ')).inCheck()) return 'Die Seite, die nicht am Zug ist, steht im Schach.';
      if (/[pP]/.test(board.split('/')[0] + board.split('/')[7])) return 'Bauern auf der 1. oder 8. Reihe sind nicht erlaubt.';
      return c ? '' : '';
    } catch (e) {
      return (e as Error).message.includes('king') ? 'Jede Seite braucht genau einen König.' : 'Ungültige Stellung.';
    }
  })();
  const { lines, loading } = useEngine(fullFen, engineOn && !legal, 18, 3);

  useEffect(() => {
    if (!el.current) return;
    api.current = Chessground(el.current, {
      fen: board,
      movable: { free: true, color: 'both' },
      draggable: { deleteOnDropOff: true },
      animation: { duration: 120 },
      highlight: { lastMove: false },
      events: {
        change: () => setBoard(api.current!.getFen()),
        select: (key: Key) => {
          const t = toolRef.current;
          if (t === 'move') return;
          const cg = api.current!;
          const pieces = new Map();
          if (t === 'delete') pieces.set(key, undefined);
          else pieces.set(key, { role: ROLES[t.toLowerCase()], color: t === t.toUpperCase() ? 'white' : 'black' });
          cg.setPieces(pieces);
          cg.selectSquare(null);
          setBoard(cg.getFen());
        },
      },
    });
    return () => api.current?.destroy();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    api.current?.set({ orientation: flip ? 'black' : 'white' });
  }, [flip]);

  useEffect(() => {
    api.current?.setAutoShapes(engineOn && lines[0] ? lines.map((l, i) => ({ orig: l.pv[0].slice(0, 2) as Key, dest: l.pv[0].slice(2, 4) as Key, brush: i ? 'alt' : 'main' })) : []);
  }, [lines, engineOn]);

  const load = (b: string) => {
    api.current?.set({ fen: b });
    setBoard(b);
  };

  const pieceBtn = (p: string) => (
    <button key={p} className={'palette-btn' + (tool === p ? ' on' : '')} onClick={() => setTool(tool === p ? 'move' : p)} aria-label={p}>
      <img src={PIECE_IMG[p]} alt="" />
    </button>
  );

  return (
    <>
      <div className="trainer">
        <div className="board-col">
          <div className="palette">{['K', 'Q', 'R', 'B', 'N', 'P'].map(pieceBtn)}</div>
          <div className="board-wrap"><div ref={el} className="cg-board-el" /></div>
          <div className="palette">{['k', 'q', 'r', 'b', 'n', 'p'].map(pieceBtn)}</div>
          {engineOn && !legal && <EvalBar line={lines[0]} loading={loading} />}
        </div>
        <aside className="side">
          <div>
            <div className="kicker">Brett-Editor</div>
            <h2>Stellung aufbauen</h2>
            <p className="muted" style={{ fontSize: 14 }}>
              Figur oben/unten wählen und aufs Feld tippen. „Verschieben“: Figuren ziehen, vom Brett ziehen löscht sie.
            </p>
          </div>
          <div className="row">
            <button className={'btn small' + (tool === 'move' ? ' primary' : '')} onClick={() => setTool('move')}>Verschieben</button>
            <button className={'btn small' + (tool === 'delete' ? ' primary' : '')} onClick={() => setTool('delete')}>Löschen</button>
          </div>
          <div className="row">
            <span>Am Zug:</span>
            <div className="seg">
              <button className={turn === 'w' ? 'on' : ''} onClick={() => setTurn('w')}>Weiß</button>
              <button className={turn === 'b' ? 'on' : ''} onClick={() => setTurn('b')}>Schwarz</button>
            </div>
          </div>
          <div className="row">
            <button className="btn small" onClick={() => load(START)}>Grundstellung</button>
            <button className="btn small" onClick={() => load(EMPTY)}>Leeres Brett</button>
            <button className="btn small" onClick={() => setFlip((f) => !f)}>Drehen</button>
          </div>
          <input type="text" value={fullFen} readOnly onFocus={(e) => e.target.select()} aria-label="FEN" />
          <input type="text" aria-label="FEN einfügen" placeholder="FEN einfügen und Enter drücken" onKeyDown={(e) => {
            if (e.key !== 'Enter') return;
            const v = (e.target as HTMLInputElement).value.trim();
            try { new Chess(v); load(v.split(' ')[0]); setTurn(v.split(' ')[1] === 'b' ? 'b' : 'w'); } catch { alert('Ungültige FEN'); }
          }} />
          {legal ? <div className="feedback bad">{legal}</div> : (
            <div className="row">
              <button className="btn primary" onClick={() => setEngineOn((x) => !x)}>{engineOn ? 'Engine aus' : 'Analysieren'}</button>
              <a className="btn" href={'#/spielen/' + encodeURIComponent(fullFen)}>Gegen Bot ausspielen</a>
            </div>
          )}
          {engineOn && !legal && lines.length > 0 && (
            <div className="list">
              {lines.map((l, i) => (
                <div key={i}>
                  <b className="mono" style={{ width: 60 }}>{l.mate !== undefined ? `#${l.mate}` : (l.cp! > 0 ? '+' : '') + l.cp!.toFixed(1)}</b>
                  <span className="mono" style={{ fontSize: 13 }}>{sanDe(uciToSan(fullFen, l.pv[0]))}</span>
                </div>
              ))}
            </div>
          )}
        </aside>
      </div>
    </>
  );
}
