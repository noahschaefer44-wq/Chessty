import { Rich } from './Explain';
import type { WrongMoveInfo } from '../lib/wrongMove';
import type { Explain } from '../content/types';

/**
 * Erklärung eines falschen Zuges: eigener Text (falls vorhanden) + Engine-Begründung,
 * Widerlegung zum Nachspielen und „Nochmal versuchen“.
 */
export default function WrongMovePanel({
  san,
  known,
  info,
  loading,
  onReplay,
  onRetry,
  onAcceptAlt,
}: {
  san: string;
  known?: Explain;
  info?: WrongMoveInfo | null;
  loading?: boolean;
  onReplay?: () => void;
  onRetry?: () => void;
  /** Nur anbieten, wenn der Zug laut Engine gleichwertig ist */
  onAcceptAlt?: () => void;
}) {
  const ok = info?.verdict === 'ok' && !known;
  return (
    <div className={'feedback ' + (ok ? 'good' : 'bad')} role="status">
      <b>{ok ? '✓ ' : '✕ '}{info?.headline ?? `${san} ist nicht der gesuchte Zug.`}</b>
      {known && (
        <>
          <Rich text={known.short} />
          {known.why && <Rich text={known.why} />}
        </>
      )}
      {loading && <p className="mono" style={{ fontSize: 13 }}><span className="spinner" /> Stockfish prüft deinen Zug …</p>}
      {info && (
        <>
          <Rich text={info.text} />
          {info.line.length > 0 && info.verdict !== 'ok' && (
            <p className="mono" style={{ fontSize: 13 }}>Mögliche Fortsetzung: {info.line.join(' ')}</p>
          )}
        </>
      )}
      <div className="row" style={{ marginTop: 8 }}>
        {info && info.fens.length > 1 && onReplay && (
          <button className="btn small" onClick={onReplay}>Widerlegung zeigen</button>
        )}
        {ok && onAcceptAlt && <button className="btn small" onClick={onAcceptAlt}>Weiter mit der Hauptvariante</button>}
        {onRetry && <button className="btn small primary" onClick={onRetry}>Nochmal versuchen</button>}
      </div>
    </div>
  );
}
