import { getProgress } from './progress';

// Kurze, synthetische Klicks – keine Audiodateien nötig.
let ctx: AudioContext | null = null;
function beep(freq: number, dur = 0.06, type: OscillatorType = 'square', gain = 0.04) {
  if (!getProgress().sound) return;
  try {
    ctx ??= new AudioContext();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.value = freq;
    g.gain.setValueAtTime(gain, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
    o.connect(g).connect(ctx.destination);
    o.start();
    o.stop(ctx.currentTime + dur);
  } catch {
    /* Audio nicht verfügbar */
  }
}

export const sound = {
  move: () => beep(420, 0.04, 'triangle', 0.08),
  capture: () => beep(260, 0.07, 'triangle', 0.1),
  good: () => {
    beep(660, 0.08, 'sine', 0.06);
    setTimeout(() => beep(990, 0.12, 'sine', 0.06), 80);
  },
  bad: () => beep(150, 0.18, 'sawtooth', 0.04),
};
