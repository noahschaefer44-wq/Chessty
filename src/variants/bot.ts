import type { Move, Pos, Rules } from './engine';

let worker: Worker | null = null;
let seq = 0;
const pending = new Map<number, (m: Move | null) => void>();

function get(): Worker {
  if (!worker) {
    worker = new Worker(new URL('./ai.worker.ts', import.meta.url), { type: 'module' });
    worker.onmessage = (e: MessageEvent<{ id: number; move: Move | null }>) => {
      pending.get(e.data.id)?.(e.data.move);
      pending.delete(e.data.id);
    };
  }
  return worker;
}

/** Bot-Zug im Hintergrund berechnen (blockiert die Oberfläche nicht) */
export function botMove(pos: Pos, rules: Rules, level: number): Promise<Move | null> {
  const id = ++seq;
  return new Promise((res) => {
    pending.set(id, res);
    get().postMessage({ id, pos, rules, level });
  });
}

/** Laufende Berechnung verwerfen (z. B. bei neuer Partie) */
export function cancelBot() {
  pending.forEach((res) => res(null));
  pending.clear();
  worker?.terminate();
  worker = null;
}
