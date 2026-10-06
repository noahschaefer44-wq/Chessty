import { useEffect, useRef, useState } from 'react';
import { useProgress, type Pace } from '../lib/progress';

/** Lesezeit für einen Text: Grundzeit + Zeit pro Wort, je nach gewähltem Tempo. */
export function readingMs(text: string, pace: Pace, extra = 0): number {
  const words = text.replace(/\*\*/g, '').split(/\s+/).filter(Boolean).length;
  const base = Math.max(1800, Math.min(9000, 900 + words * 240));
  return Math.round(base * (pace === 'ruhig' ? 1.7 : 1)) + extra;
}

/**
 * Automatisches Weitergehen mit sichtbarem Zeitbalken.
 * Läuft nur, wenn `active` und das Tempo nicht „manuell“ ist; pausiert bei verstecktem Tab,
 * bei `hold` (z. B. aufgeklappte Vertiefung) oder wenn der Nutzer auf „Pause“ tippt.
 * Ohne Automatik erscheint nur der normale Weiter-Knopf.
 */
export default function AutoNext({
  active,
  ms,
  onNext,
  label,
  hold = false,
  resetKey,
}: {
  active: boolean;
  ms: number;
  onNext: () => void;
  label: string;
  hold?: boolean;
  resetKey: string | number;
}) {
  const { pace } = useProgress();
  const auto = pace !== 'manuell';
  const [paused, setPaused] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const cb = useRef(onNext);
  cb.current = onNext;

  // Neuer Schritt: Zähler zurücksetzen, Pause aufheben
  useEffect(() => {
    setElapsed(0);
    setPaused(false);
  }, [resetKey]);

  // Aufgeklappte Vertiefung, Tiefe gewechselt, Vorlesen: anhalten, bis der Nutzer selbst weitermacht
  useEffect(() => {
    if (hold) setPaused(true);
  }, [hold]);
  useEffect(() => {
    const on = () => setPaused(true);
    window.addEventListener('chessty-reading', on);
    return () => window.removeEventListener('chessty-reading', on);
  }, []);

  const running = auto && active && !paused;
  useEffect(() => {
    if (!running) return;
    let last = performance.now();
    let raf = 0;
    let fired = false;
    const tick = (t: number) => {
      const dt = document.hidden ? 0 : t - last;
      last = t;
      setElapsed((e) => {
        const n = e + dt;
        if (n >= ms && !fired) {
          fired = true;
          queueMicrotask(() => cb.current());
        }
        return n;
      });
      if (!fired) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [running, ms]);

  if (!active) return null;
  const pct = Math.min(100, (elapsed / ms) * 100);
  return (
    <div className="autonext">
      {auto && (
        <div className="autonext-bar" aria-hidden="true">
          <i style={{ width: pct + '%' }} />
        </div>
      )}
      <div className="row" style={{ marginTop: 0 }}>
        {auto && (
          <button className="btn small ghost" onClick={() => setPaused((p) => !p)} aria-pressed={paused}>
            {paused ? '▶ Automatisch weiter' : '❚❚ Anhalten'}
          </button>
        )}
        <span className="spacer" />
        <button className="btn primary" onClick={() => cb.current()}>
          {label} <span className="arrow">→</span>
        </button>
      </div>
    </div>
  );
}

