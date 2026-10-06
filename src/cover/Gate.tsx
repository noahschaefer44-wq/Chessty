import { useEffect, useRef, useState, type ReactNode } from 'react';
import Cover from './Cover';

/**
 * Zeigt zuerst die Tarn-Ansicht. Die Freischaltung lebt nur im Arbeitsspeicher:
 * Nach jedem Neuladen (oder zweimal Esc / „Zu den Ordnern“) erscheint wieder die Ordner-Ansicht.
 */
export default function Gate({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const lastEsc = useRef(0);
  useEffect(() => {
    const lock = () => setOpen(false);
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      const now = Date.now();
      if (now - lastEsc.current < 600) lock();
      lastEsc.current = now;
    };
    window.addEventListener('chessty-lock', lock);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('chessty-lock', lock);
      window.removeEventListener('keydown', onKey);
    };
  }, []);
  return open ? <>{children}</> : <Cover onUnlock={() => setOpen(true)} />;
}
