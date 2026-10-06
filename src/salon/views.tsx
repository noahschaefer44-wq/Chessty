import { useState } from 'react';
import type { ViewProps } from './Shell';
import type { DameMove, DameState } from './dame';
import { POINTS, ADJ, type MuehleMove, type MuehleState } from './muehle';
import { gomokuLegal, type GridState } from './grids';

const stone = (p: number) => (p === 1 ? 'var(--bg)' : 'var(--fg)');

// ---------- Dame ----------
export function DameView({ state, legal, active, onMove, human }: ViewProps<DameState, DameMove>) {
  const [sel, setSel] = useState<number | null>(null);
  const flip = human === 2;
  const xy = (s: number) => {
    const r = s >> 3;
    const c = s & 7;
    return flip ? { x: 7 - c, y: r } : { x: c, y: 7 - r };
  };
  const from = new Set(legal.map((m) => m.path[0]));
  const targets = sel === null ? [] : legal.filter((m) => m.path[0] === sel);
  function click(s: number) {
    if (!active) return;
    if (sel !== null) {
      const ms = targets.filter((m) => m.path[m.path.length - 1] === s).sort((a, b) => b.caps.length - a.caps.length);
      if (ms.length) {
        onMove(ms[0]);
        setSel(null);
        return;
      }
    }
    setSel(from.has(s) ? s : null);
  }
  return (
    <svg viewBox="0 0 8 8" className="salon-svg" role="img" aria-label="Dame-Brett">
      {Array.from({ length: 64 }, (_, s) => {
        const { x, y } = xy(s);
        const dark = ((s >> 3) + (s & 7)) % 2 === 0;
        const v = state.b[s];
        const t = targets.some((m) => m.path[m.path.length - 1] === s);
        return (
          <g key={s} onClick={() => click(s)} style={{ cursor: active ? 'pointer' : 'default' }} role="button" aria-label={`Feld ${String.fromCharCode(97 + (s & 7))}${(s >> 3) + 1}`}>
            <rect x={x} y={y} width={1} height={1} fill={dark ? 'var(--sq-dark)' : 'var(--sq-light)'} />
            {sel === s && <rect x={x + 0.05} y={y + 0.05} width={0.9} height={0.9} fill="none" stroke="var(--fg)" strokeWidth={0.08} />}
            {v > 0 && (
              <g>
                <circle cx={x + 0.5} cy={y + 0.5} r={0.38} fill={stone(v === 1 || v === 3 ? 1 : 2)} stroke="var(--fg)" strokeWidth={0.06} />
                <circle cx={x + 0.5} cy={y + 0.5} r={0.26} fill="none" stroke={v === 1 || v === 3 ? 'var(--fg)' : 'var(--bg)'} strokeWidth={0.03} />
                {v >= 3 && <text x={x + 0.5} y={y + 0.62} fontSize={0.36} textAnchor="middle" fontWeight={700} fill={v === 3 ? 'var(--fg)' : 'var(--bg)'}>♛</text>}
              </g>
            )}
            {t && <circle cx={x + 0.5} cy={y + 0.5} r={0.13} fill="rgba(0,0,0,.45)" />}
            {active && from.has(s) && sel === null && <rect x={x + 0.03} y={y + 0.03} width={0.94} height={0.94} fill="none" stroke="var(--g5)" strokeWidth={0.04} strokeDasharray="0.1 0.08" />}
          </g>
        );
      })}
    </svg>
  );
}

// ---------- Mühle ----------
export function MuehleView({ state, legal, active, onMove }: ViewProps<MuehleState, MuehleMove>) {
  const [sel, setSel] = useState<number | null>(null);
  const [pending, setPending] = useState<{ from: number; to: number } | null>(null);
  const p = state.turn;
  const placing = state.hand[p - 1] > 0;
  function click(i: number) {
    if (!active) return;
    if (pending) {
      const m = legal.find((x) => x.from === pending.from && x.to === pending.to && x.remove === i);
      if (m) {
        onMove(m);
        setPending(null);
      }
      return;
    }
    const tryTo = (from: number) => {
      const ms = legal.filter((x) => x.from === from && x.to === i);
      if (!ms.length) return false;
      if (ms[0].remove < 0) onMove(ms[0]);
      else setPending({ from, to: i });
      setSel(null);
      return true;
    };
    if (placing) {
      tryTo(-1);
      return;
    }
    if (sel !== null && tryTo(sel)) return;
    setSel(state.b[i] === p && legal.some((x) => x.from === i) ? i : null);
  }
  const lines: [number, number][] = [];
  ADJ.forEach((ns, a) => ns.forEach((b) => a < b && lines.push([a, b])));
  const shown = state.b.slice();
  if (pending) {
    if (pending.from >= 0) shown[pending.from] = 0;
    shown[pending.to] = p;
  }
  const targets = pending ? legal.filter((x) => x.from === pending.from && x.to === pending.to).map((x) => x.remove)
    : placing ? legal.map((x) => x.to) : sel !== null ? legal.filter((x) => x.from === sel).map((x) => x.to) : [];
  return (
    <div>
      <svg viewBox="-0.6 -0.6 7.2 7.2" className="salon-svg" role="img" aria-label="Mühle-Brett">
        <rect x={-0.6} y={-0.6} width={7.2} height={7.2} fill="var(--sq-light)" />
        {lines.map(([a, b]) => (
          <line key={a + '-' + b} x1={POINTS[a][0]} y1={POINTS[a][1]} x2={POINTS[b][0]} y2={POINTS[b][1]} stroke="var(--fg)" strokeWidth={0.06} />
        ))}
        {POINTS.map(([x, y], i) => (
          <g key={i} onClick={() => click(i)} style={{ cursor: active ? 'pointer' : 'default' }} role="button" aria-label={`Punkt ${i + 1}${shown[i] ? (shown[i] === 1 ? ', weißer Stein' : ', schwarzer Stein') : ''}`}>
            <circle cx={x} cy={y} r={0.42} fill="transparent" />
            <circle cx={x} cy={y} r={0.1} fill="var(--fg)" />
            {shown[i] > 0 && <circle cx={x} cy={y} r={0.32} fill={stone(shown[i])} stroke="var(--fg)" strokeWidth={0.06} />}
            {sel === i && <circle cx={x} cy={y} r={0.4} fill="none" stroke="var(--fg)" strokeWidth={0.06} />}
            {targets.includes(i) && <circle cx={x} cy={y} r={pending ? 0.4 : 0.14} fill={pending ? 'none' : 'rgba(0,0,0,.4)'} stroke={pending ? 'var(--fg)' : 'none'} strokeWidth={0.06} strokeDasharray={pending ? '0.12 0.08' : undefined} />}
          </g>
        ))}
      </svg>
      <p className="mono muted" style={{ fontSize: 13, textAlign: 'center' }}>
        Steine zum Setzen – Weiß: {state.hand[0]} · Schwarz: {state.hand[1]}
        {pending && active ? ' · Mühle! Tippe einen gegnerischen Stein zum Entfernen an.' : ''}
      </p>
    </div>
  );
}

// ---------- Gitter (Vier gewinnt, Reversi, Fünf in einer Reihe) ----------
function GridView({ state, legal, active, onMove, mode }: ViewProps<GridState, number> & { mode: 'vier' | 'reversi' | 'gomoku' }) {
  const { w, h } = state;
  const ok = (i: number) => (mode === 'gomoku' ? gomokuLegal(state, i) : mode === 'vier' ? legal.includes(i % w) : legal.includes(i));
  const click = (i: number) => {
    if (!active) return;
    if (mode === 'vier') return legal.includes(i % w) && onMove(i % w);
    if (ok(i)) onMove(i);
  };
  const lines = mode === 'gomoku';
  return (
    <div>
      <svg viewBox={`0 0 ${w} ${h}`} className="salon-svg" role="img" aria-label="Spielbrett">
        <rect width={w} height={h} fill={mode === 'reversi' ? 'var(--g4)' : 'var(--sq-light)'} />
        {lines && Array.from({ length: w }, (_, k) => (
          <g key={k}>
            <line x1={k + 0.5} y1={0.5} x2={k + 0.5} y2={h - 0.5} stroke="var(--g5)" strokeWidth={0.03} />
            <line x1={0.5} y1={k + 0.5} x2={w - 0.5} y2={k + 0.5} stroke="var(--g5)" strokeWidth={0.03} />
          </g>
        ))}
        {Array.from({ length: w * h }, (_, i) => {
          const x = i % w;
          const y = h - 1 - Math.floor(i / w);
          const v = state.b[i];
          return (
            <g key={i} onClick={() => click(i)} style={{ cursor: active ? 'pointer' : 'default' }}>
              {!lines && <rect x={x + 0.02} y={y + 0.02} width={0.96} height={0.96} fill={mode === 'vier' ? 'var(--fg)' : 'transparent'} stroke={mode === 'reversi' ? 'var(--fg)' : 'none'} strokeWidth={0.03} />}
              {mode === 'vier' && !v && <circle cx={x + 0.5} cy={y + 0.5} r={0.38} fill="var(--bg)" />}
              {v > 0 && <circle cx={x + 0.5} cy={y + 0.5} r={lines ? 0.42 : 0.38} fill={stone(v)} stroke={mode === 'vier' ? 'var(--bg)' : 'var(--fg)'} strokeWidth={0.06} />}
              {state.last === i && <circle cx={x + 0.5} cy={y + 0.5} r={0.1} fill={v === 1 ? 'var(--fg)' : 'var(--bg)'} />}
              {active && mode === 'reversi' && legal.includes(i) && <circle cx={x + 0.5} cy={y + 0.5} r={0.1} fill="rgba(0,0,0,.45)" />}
            </g>
          );
        })}
      </svg>
      {mode === 'reversi' && (
        <p className="mono muted" style={{ fontSize: 13, textAlign: 'center' }}>
          Weiß {state.b.filter((x) => x === 1).length} · Schwarz {state.b.filter((x) => x === 2).length}
          {active && legal[0] === -1 && <> · <button className="btn small" onClick={() => onMove(-1)}>Passen</button></>}
        </p>
      )}
    </div>
  );
}
export const VierView = (p: ViewProps<GridState, number>) => <GridView {...p} mode="vier" />;
export const ReversiView = (p: ViewProps<GridState, number>) => <GridView {...p} mode="reversi" />;
export const GomokuView = (p: ViewProps<GridState, number>) => <GridView {...p} mode="gomoku" />;
