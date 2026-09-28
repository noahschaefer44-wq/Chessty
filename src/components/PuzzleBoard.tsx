import { useEffect, useState } from 'react';
import { Chess } from 'chess.js';
import Board from './Board';
import { parseUci, tryMove } from '../lib/chess';
import type { Puzzle } from '../lib/puzzles';
import { sound } from '../lib/sound';

/** Ein einzelnes Lichess-Puzzle: erster Zug gehört dem Gegner, ein Fehler beendet es. */
export default function PuzzleBoard({ puzzle, onResult }: { puzzle: Puzzle; onResult: (ok: boolean) => void }) {
  const [fen, setFen] = useState(puzzle.fen);
  const [last, setLast] = useState<[string, string] | undefined>();
  const [ply, setPly] = useState(1);
  const [over, setOver] = useState(false);
  const [arrows, setArrows] = useState<string[]>([]);
  const [flash, setFlash] = useState('');
  const orientation = new Chess(puzzle.fen).turn() === 'w' ? 'black' : 'white';

  useEffect(() => {
    setFen(puzzle.fen);
    setPly(1);
    setOver(false);
    setArrows([]);
    setLast(undefined);
    const t = setTimeout(() => {
      const c = new Chess(puzzle.fen);
      const m = c.move(parseUci(puzzle.moves[0]));
      setFen(c.fen());
      setLast([m.from, m.to]);
      sound.move();
    }, 450);
    return () => clearTimeout(t);
  }, [puzzle]);

  function onMove(u: string) {
    if (over) return;
    const c = new Chess(fen);
    const m = tryMove(c, u);
    if (!m) return;
    const ok = u === puzzle.moves[ply] || c.isCheckmate();
    setFlash('');
    if (!ok) {
      sound.bad();
      requestAnimationFrame(() => setFlash('flash-bad'));
      setArrows(['!' + u, puzzle.moves[ply].slice(0, 4)]);
      setOver(true);
      onResult(false);
      return;
    }
    setFen(c.fen());
    setLast([m.from, m.to]);
    if (ply + 1 >= puzzle.moves.length || c.isCheckmate()) {
      sound.good();
      requestAnimationFrame(() => setFlash('flash-good'));
      setOver(true);
      onResult(true);
      return;
    }
    sound.move();
    setTimeout(() => {
      const r = c.move(parseUci(puzzle.moves[ply + 1]));
      setFen(c.fen());
      setLast([r.from, r.to]);
      setPly(ply + 2);
    }, 400);
  }

  return <Board fen={fen} orientation={orientation} movable={over ? undefined : orientation} onMove={onMove} lastMove={last} arrows={arrows} className={flash} />;
}
