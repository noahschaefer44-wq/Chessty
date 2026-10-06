import { PIECE_IMG } from '../components/pieceImages';
import { sqName, pieceDef, pieceName, type Pos, type Rules } from './engine';

/** Figur zeichnen – Märchenfiguren und eigene Figuren als Grundbild mit kleinem Abzeichen */
export function PieceSvg({ p, x, y, size = 1, rules }: { p: string; x: number; y: number; size?: number; rules?: Rules }) {
  const t = p.toLowerCase();
  const white = p !== t;
  if (t === 'p' || 'nbrqk'.includes(t) && !rules?.pieces?.[t]) return <image href={PIECE_IMG[p]} x={x} y={y} width={size} height={size} />;
  const d = pieceDef(t, rules);
  const look = d?.look ?? 'p';
  const main = white ? look.toUpperCase() : look;
  const badge = d?.badge ?? t.toUpperCase();
  return (
    <g>
      <image href={PIECE_IMG[main]} x={x} y={y} width={size} height={size} />
      <circle cx={x + size * 0.78} cy={y + size * 0.22} r={size * 0.2} fill={white ? '#fff' : '#000'} stroke="#000" strokeWidth={size * 0.03} />
      {badge === 'S' ? (
        <image href={PIECE_IMG[white ? 'N' : 'n']} x={x + size * 0.6} y={y + size * 0.04} width={size * 0.36} height={size * 0.36} />
      ) : (
        <text x={x + size * 0.78} y={y + size * 0.3} fontSize={size * 0.24} textAnchor="middle" fontFamily="Space Grotesk, sans-serif" fontWeight="700"
          fill={white ? '#000' : '#fff'}>{badge}</text>
      )}
    </g>
  );
}

export function DuckSvg({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x},${y})`} aria-label="Ente">
      <ellipse cx="0.48" cy="0.66" rx="0.32" ry="0.2" fill="#c8c8c8" stroke="#000" strokeWidth="0.04" />
      <circle cx="0.66" cy="0.38" r="0.15" fill="#c8c8c8" stroke="#000" strokeWidth="0.04" />
      <path d="M0.79,0.36 L0.95,0.41 L0.79,0.46 z" fill="#000" />
      <circle cx="0.68" cy="0.34" r="0.025" fill="#000" />
      <path d="M0.3,0.62 Q0.45,0.55 0.6,0.66" fill="none" stroke="#000" strokeWidth="0.03" />
    </g>
  );
}

export default function VariantBoard({
  pos,
  flip = false,
  selected = null,
  targets = [],
  last = null,
  hidden,
  check = -1,
  duckMode = false,
  onSquare,
  rules,
}: {
  pos: Pos;
  rules?: Rules;
  flip?: boolean;
  selected?: number | null;
  targets?: number[];
  last?: [number, number] | null;
  hidden?: Set<number>;
  check?: number;
  duckMode?: boolean;
  onSquare?: (s: number) => void;
}) {
  const W = pos.w;
  const H = pos.h;
  const fileOf = (s: number) => s % W;
  const rankOf = (s: number) => Math.floor(s / W);
  const xy = (s: number) => (flip ? { x: W - 1 - fileOf(s), y: rankOf(s) } : { x: fileOf(s), y: H - 1 - rankOf(s) });
  const cells = Array.from({ length: W * H }, (_, s) => s);
  return (
    <svg className="vboard" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Schachbrett ${W} mal ${H}`} style={{ aspectRatio: `${W} / ${H}` }}>
      {cells.map((s) => {
        const { x, y } = xy(s);
        const dark = (fileOf(s) + rankOf(s)) % 2 === 0;
        return <rect key={s} x={x} y={y} width="1" height="1" fill={dark ? 'var(--sq-dark)' : 'var(--sq-light)'} />;
      })}
      {pos.holes?.map((s) => {
        const { x, y } = xy(s);
        return (
          <g key={'h' + s}>
            <rect x={x} y={y} width="1" height="1" fill="var(--fg)" />
            <rect x={x + 0.18} y={y + 0.18} width="0.64" height="0.64" fill="none" stroke="var(--bg)" strokeWidth="0.04" strokeDasharray="0.08 0.06" />
          </g>
        );
      })}
      {last && last.filter((s) => s >= 0).map((s) => {
        const { x, y } = xy(s);
        return <rect key={'l' + s} x={x} y={y} width="1" height="1" fill="rgba(0,0,0,.18)" />;
      })}
      {selected !== null && selected >= 0 && (() => {
        const { x, y } = xy(selected);
        return <rect x={x + 0.04} y={y + 0.04} width="0.92" height="0.92" fill="none" stroke="#000" strokeWidth="0.08" />;
      })()}
      {check >= 0 && (() => {
        const { x, y } = xy(check);
        return <circle cx={x + 0.5} cy={y + 0.5} r="0.5" fill="url(#vb-check)" />;
      })()}
      <defs>
        <radialGradient id="vb-check">
          <stop offset="0" stopColor="#000" stopOpacity="0.7" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </radialGradient>
        <pattern id="vb-fog" width="0.25" height="0.25" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="0.25" height="0.25" fill="#6f6f6f" />
          <line x1="0" y1="0" x2="0" y2="0.25" stroke="#595959" strokeWidth="0.1" />
        </pattern>
      </defs>
      {cells.map((s) => {
        const p = pos.b[s];
        if (!p || hidden?.has(s)) return null;
        const { x, y } = xy(s);
        return <PieceSvg key={'p' + s} p={p} x={x} y={y} rules={rules} />;
      })}
      {pos.duck >= 0 && !hidden?.has(pos.duck) && <DuckSvg {...xy(pos.duck)} />}
      {hidden &&
        [...hidden].map((s) => {
          const { x, y } = xy(s);
          return <rect key={'f' + s} x={x} y={y} width="1" height="1" fill="url(#vb-fog)" opacity="0.92" />;
        })}
      {targets.map((s) => {
        const { x, y } = xy(s);
        const occ = !!pos.b[s];
        return occ ? (
          <rect key={'t' + s} x={x + 0.05} y={y + 0.05} width="0.9" height="0.9" fill="none" stroke="rgba(0,0,0,.55)" strokeWidth="0.08" />
        ) : (
          <circle key={'t' + s} cx={x + 0.5} cy={y + 0.5} r={duckMode ? 0.1 : 0.15} fill="rgba(0,0,0,.35)" />
        );
      })}
      {Array.from({ length: W }, (_, i) => (
        <text key={'cf' + i} x={i + 0.05} y={H - 0.05} fontSize="0.2" fontFamily="JetBrains Mono, monospace" fill="#333" pointerEvents="none">
          {String.fromCharCode(97 + (flip ? W - 1 - i : i))}
        </text>
      ))}
      {Array.from({ length: H }, (_, i) => (
        <text key={'cr' + i} x={W - 0.17 - (H > 9 ? 0.1 : 0)} y={i + 0.22} fontSize="0.2" fontFamily="JetBrains Mono, monospace" fill="#333" pointerEvents="none">
          {flip ? i + 1 : H - i}
        </text>
      ))}
      {onSquare &&
        cells.map((s) => {
          const { x, y } = xy(s);
          const p = pos.b[s];
          const label = pos.holes?.includes(s) ? `${sqName(s, W)}, Loch` : `${sqName(s, W)}${p && !hidden?.has(s) ? ' ' + (p === p.toUpperCase() ? 'weiß: ' : 'schwarz: ') + pieceName(p.toLowerCase(), rules) : ''}${targets.includes(s) ? ', Ziel' : ''}`;
          return (
            <rect key={'k' + s} className="sq-hit" x={x} y={y} width="1" height="1" fill="transparent" onClick={() => onSquare(s)}
              tabIndex={0} role="button" aria-label={label}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSquare(s); } }} />
          );
        })}
    </svg>
  );
}
