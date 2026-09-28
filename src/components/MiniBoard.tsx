import { PIECE_IMG } from './pieceImages';
import { parseArrows } from './Board';

/** Leichtgewichtiges, statisches Diagramm (SVG) – für das Fachbegriffe-Heft und Vorschauen. */
export default function MiniBoard({
  fen,
  arrows = [],
  flip = false,
  size = 240,
  highlight = [],
  onSquare,
  hidePieces = false,
  marks = [],
  coords = false,
}: {
  fen: string;
  arrows?: string[];
  flip?: boolean;
  size?: number;
  highlight?: string[];
  /** Klick auf ein Feld (macht das Diagramm interaktiv) */
  onSquare?: (sq: string) => void;
  hidePieces?: boolean;
  /** Felder mit Markierung (z. B. richtig/falsch) */
  marks?: { sq: string; kind: 'good' | 'bad' | 'pick' }[];
  coords?: boolean;
}) {
  const rows = fen.split(' ')[0].split('/');
  const pieces: { f: number; r: number; p: string }[] = [];
  rows.forEach((row, i) => {
    let f = 0;
    for (const ch of row) {
      if (/\d/.test(ch)) f += +ch;
      else pieces.push({ f: f++, r: 7 - i, p: ch });
    }
  });
  const pos = (f: number, r: number) => (flip ? { x: 7 - f, y: r } : { x: f, y: 7 - r });
  const sq = (s: string) => pos(s.charCodeAt(0) - 97, +s[1] - 1);
  const shapes = parseArrows(arrows);
  const color = (b?: string) => (b === 'bad' ? '#8a8a8a' : b === 'alt' ? '#555' : '#000');
  return (
    <svg className="miniboard" viewBox="0 0 8 8" width={size} height={size} role="img" aria-label="Diagramm">
      <defs>
        {['main', 'alt', 'bad'].map((b) => (
          <marker key={b} id={'ah-' + b} viewBox="0 0 10 10" refX="5" refY="5" markerWidth="2.4" markerHeight="2.4" orient="auto">
            <path d="M0,0 L10,5 L0,10 z" fill={color(b)} />
          </marker>
        ))}
      </defs>
      {Array.from({ length: 64 }, (_, i) => {
        const x = i % 8;
        const y = Math.floor(i / 8);
        const dark = (x + y) % 2 === 1;
        return <rect key={i} x={x} y={y} width="1" height="1" fill={dark ? 'var(--sq-dark)' : 'var(--sq-light)'} />;
      })}
      {highlight.map((h) => {
        const { x, y } = sq(h);
        return <rect key={'h' + h} x={x} y={y} width="1" height="1" fill="rgba(0,0,0,.28)" />;
      })}
      {!hidePieces && pieces.map(({ f, r, p }) => {
        const { x, y } = pos(f, r);
        return <image key={`${f}${r}`} href={PIECE_IMG[p]} x={x} y={y} width="1" height="1" />;
      })}
      {shapes.map((s, i) => {
        const a = sq(s.orig);
        if (!s.dest)
          return <circle key={i} cx={a.x + 0.5} cy={a.y + 0.5} r="0.44" fill="none" stroke={color(s.brush)} strokeWidth="0.08" opacity="0.85" />;
        const b = sq(s.dest);
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const len = Math.hypot(dx, dy);
        const ex = a.x + 0.5 + dx * (1 - 0.32 / len);
        const ey = a.y + 0.5 + dy * (1 - 0.32 / len);
        return (
          <line key={i} x1={a.x + 0.5} y1={a.y + 0.5} x2={ex} y2={ey} stroke={color(s.brush)} strokeWidth="0.16"
            strokeDasharray={s.brush === 'bad' ? '0.25 0.12' : undefined} markerEnd={`url(#ah-${s.brush === 'bad' ? 'bad' : s.brush === 'alt' ? 'alt' : 'main'})`} opacity="0.85" />
        );
      })}
      {marks.map((m, i) => {
        const { x, y } = sq(m.sq);
        if (m.kind === 'pick') return <rect key={'m' + i} x={x + 0.06} y={y + 0.06} width="0.88" height="0.88" fill="none" stroke="#000" strokeWidth="0.1" />;
        const good = m.kind === 'good';
        return (
          <g key={'m' + i}>
            <rect x={x + 0.05} y={y + 0.05} width="0.9" height="0.9" fill="none" stroke={good ? '#000' : '#fff'} strokeWidth="0.1" strokeDasharray={good ? undefined : '0.15 0.1'} />
            <rect x={x + 0.62} y={y + 0.05} width="0.33" height="0.33" fill={good ? '#000' : '#fff'} stroke="#000" strokeWidth="0.03" />
            <text x={x + 0.785} y={y + 0.31} textAnchor="middle" fontSize="0.28" fontWeight="700" fill={good ? '#fff' : '#000'}>{good ? '✓' : '✕'}</text>
          </g>
        );
      })}
      {coords &&
        Array.from({ length: 8 }, (_, i) => (
          <g key={'c' + i} fontSize="0.22" fontFamily="JetBrains Mono" fill="#333">
            <text x={i + 0.06} y={7.94}>{String.fromCharCode(97 + (flip ? 7 - i : i))}</text>
            <text x={0.04} y={i + 0.24}>{flip ? i + 1 : 8 - i}</text>
          </g>
        ))}
      {onSquare &&
        Array.from({ length: 64 }, (_, i) => {
          const x = i % 8;
          const y = Math.floor(i / 8);
          const file = flip ? 7 - x : x;
          const rank = flip ? y : 7 - y;
          const name = String.fromCharCode(97 + file) + (rank + 1);
          return <rect key={'k' + i} className="sq-hit" x={x} y={y} width="1" height="1" fill="transparent" onClick={() => onSquare(name)} />;
        })}
    </svg>
  );
}
