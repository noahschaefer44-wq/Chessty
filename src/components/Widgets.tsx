import { formatEval, winChance, type EngineLine } from '../lib/engine';

export function EvalBar({ line, loading }: { line?: EngineLine; loading?: boolean }) {
  const w = winChance(line) * 100;
  return (
    <div className="evalbar" title="Bewertung (Weiß links)">
      <i style={{ width: `${w}%` }} />
      <span>{loading && !line ? 'Engine …' : formatEval(line)}</span>
    </div>
  );
}

export function Ring({ value, max, label }: { value: number; max: number; label?: string }) {
  const r = 40;
  const c = 2 * Math.PI * r;
  const pct = Math.min(1, value / Math.max(1, max));
  return (
    <svg className="ring" viewBox="0 0 96 96" aria-label={label}>
      <circle className="bg" cx="48" cy="48" r={r} />
      <circle
        className="fg"
        cx="48"
        cy="48"
        r={r}
        strokeDasharray={c}
        strokeDashoffset={c * (1 - pct)}
        transform="rotate(-90 48 48)"
      />
      <text x="48" y="53" textAnchor="middle" fontFamily="JetBrains Mono" fontWeight="700" fontSize="16" fill="currentColor">
        {Math.round(pct * 100)}%
      </text>
    </svg>
  );
}

export function Bar({ value, max }: { value: number; max: number }) {
  return (
    <div className="bar">
      <i style={{ width: `${Math.min(100, (100 * value) / Math.max(1, max))}%` }} />
    </div>
  );
}

export function Legend() {
  return (
    <div className="legend">
      <span><i style={{ background: '#000' }} />empfohlen</span>
      <span><i style={{ background: '#555' }} />Alternative</span>
      <span><i style={{ background: '#8a8a8a' }} />Fehler (?)</span>
    </div>
  );
}

export function Stars({ n, max = 3 }: { n: number; max?: number }) {
  return <span className="stars">{'■'.repeat(n) + '□'.repeat(max - n)}</span>;
}
