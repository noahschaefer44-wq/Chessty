import { useEffect, useRef, useState } from 'react';
import { Chessground } from 'chessground';
import type { Api } from 'chessground/api';
import type { DrawShape } from 'chessground/draw';
import type { Key } from 'chessground/types';
import { Chess } from 'chess.js';
import { dests, isPromotion, turnColor, type Color } from '../lib/chess';
import { useProgress } from '../lib/progress';

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

export default function Board({ fen, orientation = 'white', movable, onMove, lastMove, shapes, arrows, className }: BoardProps) {
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
  const { showCoords } = useProgress();

  useEffect(() => {
    if (!el.current) return;
    api.current = Chessground(el.current, {
      coordinates: showCoords,
      animation: { enabled: true, duration: 220 },
      highlight: { lastMove: true, check: true },
      drawable: { enabled: true, brushes, defaultSnapToValidMove: true },
      premovable: { enabled: false },
    });
    return () => api.current?.destroy();
  }, [showCoords]);

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
  }, [fen, orientation, movable, lastMove?.[0], lastMove?.[1], showCoords]);

  useEffect(() => {
    api.current?.setAutoShapes([...(shapes ?? []), ...parseArrows(arrows)]);
  }, [shapes, arrows, fen, showCoords]);

  const pick = (role: string) => {
    if (!promo) return;
    onMoveRef.current?.(promo.from + promo.to + role);
    setPromo(null);
    resync();
  };

  return (
    <div className={'board-wrap ' + (className ?? '')}>
      <div ref={el} className="cg-board-el" />
      {promo && (
        <div className="promo" role="dialog" aria-label="Umwandlung wählen">
          {['q', 'r', 'b', 'n'].map((r) => (
            <button key={r} className="promo-piece" onClick={() => pick(r)} aria-label={r}>
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
