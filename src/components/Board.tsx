import { useEffect, useRef, useState } from 'react';
import { Chessground } from 'chessground';
import type { Api } from 'chessground/api';
import type { DrawShape } from 'chessground/draw';
import type { Key } from 'chessground/types';
import { Chess } from 'chess.js';
import { dests, isPromotion, turnColor, type Color } from '../lib/chess';
import { useProgress } from '../lib/progress';
import { useAdmin, reportFen } from '../lib/admin';
import { confetti } from '../lib/confetti';

export interface BoardProps {
  fen: string;
  orientation?: Color;
  /** Welche Seite darf ziehen: eine Farbe, 'both' oder undefined (keine) */
  movable?: Color | 'both';
  onMove?: (uci: string) => void;
  lastMove?: [string, string];
  shapes?: DrawShape[];
  /** Pfeil-Kurzschreibweise, z. B. "e2e4", "!d1h5", "?g1f3", "e4" (Kreis) */
  arrows?: string[];
  className?: string;
  /** Admin-Panel: illegale Züge auf diesem Brett erlauben (nur Bot-Partien) */
  allowFree?: boolean;
}

// Eigene Pfeile (Rechtsklick/Ziehen) werden pro Stellung gespeichert
const ARROW_KEY = 'chessty.arrows';
function loadArrows(fen: string): DrawShape[] {
  try {
    return JSON.parse(localStorage.getItem(ARROW_KEY) ?? '{}')[fen.split(' ')[0]] ?? [];
  } catch {
    return [];
  }
}
function saveArrows(fen: string, shapes: DrawShape[]) {
  try {
    const all = JSON.parse(localStorage.getItem(ARROW_KEY) ?? '{}');
    const k = fen.split(' ')[0];
    if (shapes.length) all[k] = shapes;
    else delete all[k];
    const keys = Object.keys(all);
    if (keys.length > 400) delete all[keys[0]];
    localStorage.setItem(ARROW_KEY, JSON.stringify(all));
  } catch {
    /* Speicher nicht verfügbar */
  }
}

// Monochrome Pinsel: Schwarz = empfohlen, Grau = Alternative, Hellgrau = Fehler
const brushes = {
  green: { key: 'g', color: '#000000', opacity: 0.85, lineWidth: 10 },
  red: { key: 'r', color: '#6b6b6b', opacity: 0.85, lineWidth: 10 },
  blue: { key: 'b', color: '#3a3a3a', opacity: 0.6, lineWidth: 10 },
  yellow: { key: 'y', color: '#9a9a9a', opacity: 0.8, lineWidth: 10 },
  main: { key: 'm', color: '#000000', opacity: 0.9, lineWidth: 11 },
  alt: { key: 'a', color: '#555555', opacity: 0.7, lineWidth: 8 },
  bad: { key: 'x', color: '#8a8a8a', opacity: 0.85, lineWidth: 9 },
  engine: { key: 'e', color: '#1a1a1a', opacity: 0.45, lineWidth: 14 },
};

export function parseArrows(list: string[] = []): DrawShape[] {
  return list.map((a) => {
    let brush = 'main';
    let s = a;
    if (s.startsWith('!')) {
      brush = 'bad';
      s = s.slice(1);
    } else if (s.startsWith('?')) {
      brush = 'alt';
      s = s.slice(1);
    }
    const orig = s.slice(0, 2) as Key;
    const dest = s.length >= 4 ? (s.slice(2, 4) as Key) : undefined;
    const shape: DrawShape = { orig, dest, brush };
    if (brush === 'bad' && dest) shape.label = { text: '?', fill: '#555' };
    return shape;
  });
}

export default function Board({ fen, orientation = 'white', movable, onMove, lastMove, shapes, arrows, className, allowFree }: BoardProps) {
  const el = useRef<HTMLDivElement>(null);
  const api = useRef<Api | null>(null);
  const onMoveRef = useRef(onMove);
  onMoveRef.current = onMove;
  const fenRef = useRef(fen);
  fenRef.current = fen;
  // Nach einem Zug: Wenn die Elternkomponente die Stellung nicht übernimmt, Brett zurücksetzen
  const resync = () =>
    setTimeout(() => {
      const cg = api.current;
      if (cg && cg.getFen() !== fenRef.current.split(' ')[0]) cg.set({ fen: fenRef.current, lastMove: undefined });
    }, 60);
  const [promo, setPromo] = useState<{ from: string; to: string; color: Color } | null>(null);
  const { showCoords, animSpeed, boardTheme } = useProgress();
  const [announce, setAnnounce] = useState('');
  const adm = useAdmin();
  const on = (f: keyof typeof adm.flags) => adm.unlocked && !!adm.flags[f];
  const free = !!allowFree && on('freeMoves');
  const squareNames = on('squareNames');

  useEffect(() => {
    if (!el.current) return;
    api.current = Chessground(el.current, {
      coordinates: showCoords || squareNames,
      coordinatesOnSquares: squareNames,
      animation: { enabled: animSpeed > 0, duration: animSpeed },
      highlight: { lastMove: true, check: true },
      drawable: { enabled: true, brushes, defaultSnapToValidMove: true, onChange: (sh) => saveArrows(fenRef.current, sh) },
      premovable: { enabled: false },
    });
    return () => api.current?.destroy();
  }, [showCoords, animSpeed, squareNames]);

  useEffect(() => {
    const cg = api.current;
    if (!cg) return;
    let chess: Chess | null = null;
    try {
      chess = new Chess(fen);
    } catch {
      chess = null;
    }
    const turn = chess ? turnColor(chess) : 'white';
    const canMove = !!chess && !!movable && (movable === 'both' || movable === turn);
    reportFen(fen);
    // Admin-Freimodus: eigene Figuren dürfen überall hin (auch wenn chess.js die Stellung nicht versteht)
    const fenTurn: Color = fen.split(' ')[1] === 'b' ? 'black' : 'white';
    if (free && movable) {
      cg.set({
        fen,
        orientation,
        turnColor: fenTurn,
        lastMove: lastMove as Key[] | undefined,
        movable: {
          free: true,
          color: movable === 'both' ? 'both' : movable === fenTurn ? fenTurn : undefined,
          dests: new Map(),
          showDests: false,
          events: { after: (orig, dest) => { onMoveRef.current?.(orig + dest); resync(); } },
        },
      });
      return;
    }
    cg.setShapes(loadArrows(fen));
    cg.set({
      fen,
      orientation,
      turnColor: turn,
      check: chess?.inCheck() ? turn : false,
      lastMove: lastMove as Key[] | undefined,
      movable: {
        free: false,
        color: canMove ? turn : undefined,
        dests: canMove && chess ? dests(chess) : new Map(),
        showDests: true,
        events: {
          after: (orig, dest) => {
            if (chess && isPromotion(chess, orig, dest)) {
              setPromo({ from: orig, to: dest, color: turn });
              return;
            }
            onMoveRef.current?.(orig + dest);
            resync();
          },
        },
      },
    });
    if (lastMove) setAnnounce(`Zug von ${lastMove[0]} nach ${lastMove[1]}${chess?.inCheck() ? ', Schach' : ''}.`);
  }, [fen, orientation, movable, lastMove?.[0], lastMove?.[1], showCoords, animSpeed, free, squareNames]);

  useEffect(() => {
    api.current?.setAutoShapes([...(shapes ?? []), ...parseArrows(arrows)]);
  }, [shapes, arrows, fen, showCoords, animSpeed]);

  const pick = (role: string) => {
    if (!promo) return;
    onMoveRef.current?.(promo.from + promo.to + role);
    setPromo(null);
    resync();
  };

  return (
    <div
      className={`board-wrap theme-${boardTheme} ` + (className ?? '')}
      // Chessground merkt sich die Brettposition; verschiebt sich das Layout (z. B. Uhr oder Hinweis darüber),
      // stimmen Klicks sonst nicht mehr. Vor jeder Berührung deshalb neu vermessen.
      onPointerDownCapture={() => {
        api.current?.state.dom.bounds.clear();
        if (on('confetti')) confetti();
      }}
    >
      <div ref={el} className="cg-board-el" />
      <div className="sr-only" aria-live="polite">{announce}</div>
      {movable && onMove && <KeyboardMove fen={fen} movable={movable} onMove={onMove} />}
      {promo && (
        <div className="promo" role="dialog" aria-label="Umwandlung wählen">
          {['q', 'r', 'b', 'n'].map((r) => (
            <button key={r} className="promo-piece" onClick={() => pick(r)} aria-label={PROMO_NAMES[r]}>
              {(promo.color === 'white' ? { q: '♕', r: '♖', b: '♗', n: '♘' } : { q: '♛', r: '♜', b: '♝', n: '♞' })[r]}
            </button>
          ))}
          <button className="promo-cancel" onClick={() => { setPromo(null); api.current?.set({ fen }); }}>
            Abbrechen
          </button>
        </div>
      )}
    </div>
  );
}

const PROMO_NAMES: Record<string, string> = { q: 'Dame', r: 'Turm', b: 'Läufer', n: 'Springer' };
const DE_TO_EN: Record<string, string> = { S: 'N', L: 'B', T: 'R', D: 'Q', K: 'K' };

/** Zugeingabe per Tastatur (Barrierefreiheit): unsichtbar, bis sie mit Tab fokussiert wird. */
function KeyboardMove({ fen, movable, onMove }: { fen: string; movable: Color | 'both'; onMove: (uci: string) => void }) {
  const [val, setVal] = useState('');
  const [err, setErr] = useState('');
  function submit() {
    const raw = val.trim().replace(/\s+/g, '');
    if (!raw) return;
    let chess: Chess;
    try {
      chess = new Chess(fen);
    } catch {
      return;
    }
    if (movable !== 'both' && turnColor(chess) !== movable) {
      setErr('Du bist gerade nicht am Zug.');
      return;
    }
    const legalList = chess.moves({ verbose: true });
    let uci = '';
    if (/^[a-h][1-8][a-h][1-8][qrbnQRBNDTLS]?$/.test(raw)) {
      const pr = raw[4] ? (DE_TO_EN[raw[4].toUpperCase()] ?? raw[4].toUpperCase()).toLowerCase() : '';
      uci = raw.slice(0, 4) + pr;
    } else {
      // Deutsche Figurenbuchstaben (S, L, T, D) in englische SAN übersetzen
      const san = raw.replace(/^[SLTDK]/, (c) => DE_TO_EN[c]).replace(/=([SLTD])/, (_, c) => '=' + DE_TO_EN[c]).replace(/0/g, 'O');
      try {
        const m = chess.move(san);
        uci = m.from + m.to + (m.promotion ?? '');
      } catch {
        uci = '';
      }
    }
    const legal = uci && legalList.some((m) => m.from + m.to + (m.promotion ?? '') === uci || (m.from + m.to === uci && !m.promotion));
    if (!legal) {
      setErr(`„${val}“ ist hier kein erlaubter Zug.`);
      return;
    }
    setErr('');
    setVal('');
    onMove(uci);
  }
  return (
    <div className="kbd-move">
      <label>
        Zug per Tastatur (z. B. e4, Sf3, O-O oder e2e4)
        <input type="text" value={val} autoComplete="off" spellCheck={false} aria-invalid={!!err}
          onChange={(e) => { setVal(e.target.value); setErr(''); }} onKeyDown={(e) => e.key === 'Enter' && submit()} />
      </label>
      {err && <span role="alert">{err}</span>}
    </div>
  );
}
