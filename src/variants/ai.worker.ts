import { chooseMove, BOTS } from './ai';
import type { Pos, Rules } from './engine';

self.onmessage = (e: MessageEvent<{ id: number; pos: Pos; rules: Rules; level: number }>) => {
  const { id, pos, rules, level } = e.data;
  let move = null;
  try {
    move = chooseMove(pos, rules, BOTS[level] ?? BOTS[2]);
  } catch (err) {
    console.error(err);
  }
  (self as unknown as Worker).postMessage({ id, move });
};
