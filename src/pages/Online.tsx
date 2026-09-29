import { useEffect, useMemo, useRef, useState } from 'react';
import { Chess } from 'chess.js';
import Board from '../components/Board';
import { joinGame, newGameCode, type GameConn } from '../lib/cloud';
import { useAccount } from '../lib/useAccount';
import { tryMove, sanDe } from '../lib/chess';
import { sound } from '../lib/sound';
import { bump, addXp } from '../lib/progress';

const CLOCKS = [0, 3, 5, 10];
const fmt = (ms: number) => `${Math.floor(Math.max(0, ms) / 60000)}:${String(Math.floor((Math.max(0, ms) % 60000) / 1000)).padStart(2, '0')}`;

/** Online-Partie per Link. Der Ersteller spielt die gewählte Farbe; Züge laufen über Supabase Realtime. */
export default function Online({ code }: { code?: string }) {
  const a = useAccount();
  const [myName] = useState(() => a?.name ?? 'Gast ' + Math.floor(Math.random() * 900 + 100));
  const [mins, setMins] = useState(5);
  const [hostColor, setHostColor] = useState<'white' | 'black'>('white');

  if (!code) {
    return (
      <div className="stack" style={{ maxWidth: 640 }}>
        <a className="back" href="#/community">← Community</a>
        <div className="kicker">Echtzeit · kostenlos</div>
        <h1>Online spielen</h1>
        <p className="muted">Erstelle eine Partie und schick den Link an einen Freund. Sobald er ihn öffnet, geht es los.</p>
        <div className="row"><span style={{ width: 90 }}>Farbe</span>
          <div className="seg">
            <button className={hostColor === 'white' ? 'on' : ''} onClick={() => setHostColor('white')}>Weiß</button>
            <button className={hostColor === 'black' ? 'on' : ''} onClick={() => setHostColor('black')}>Schwarz</button>
          </div>
        </div>
        <div className="row"><span style={{ width: 90 }}>Bedenkzeit</span>
          <div className="seg">{CLOCKS.map((m) => <button key={m} className={mins === m ? 'on' : ''} onClick={() => setMins(m)}>{m ? `${m} Min` : 'Ohne'}</button>)}</div>
        </div>
        <button className="btn primary" style={{ alignSelf: 'flex-start' }} onClick={() => {
          const c = newGameCode();
          try { sessionStorage.setItem('chessty.host', JSON.stringify({ code: c, color: hostColor, mins })); } catch { /* egal */ }
          location.hash = '#/online/' + c;
        }}>Partie erstellen <span className="arrow">→</span></button>
      </div>
    );
  }
  return <OnlineGame code={code} myName={myName} />;
}

function OnlineGame({ code, myName }: { code: string; myName: string }) {
  const host = useMemo(() => {
    try {
      const h = JSON.parse(sessionStorage.getItem('chessty.host') ?? 'null');
      return h && h.code === code ? h : null;
    } catch {
      return null;
    }
  }, [code]);
  const [conn, setConn] = useState<GameConn | null>(null);
  const [err, setErr] = useState('');
  const [peers, setPeers] = useState(0);
  const [opp, setOpp] = useState('');
  const [color, setColor] = useState<'white' | 'black' | null>(host ? host.color : null);
  const [clockMin, setClockMin] = useState<number>(host?.mins ?? 0);
  const [moves, setMoves] = useState<string[]>([]);
  const [times, setTimes] = useState({ w: 0, b: 0 });
  const [result, setResult] = useState('');
  const [drawOffer, setDrawOffer] = useState(false);
  const started = color !== null && opp !== '';
  const movesRef = useRef(moves);
  movesRef.current = moves;

  const game = useMemo(() => {
    const c = new Chess();
    for (const u of moves) tryMove(c, u);
    return c;
  }, [moves]);

  useEffect(() => {
    let leave = () => {};
    joinGame(
      code,
      (m) => {
        if (m.t === 'hello') {
          setOpp(m.name);
        } else if (m.t === 'start' && !host) {
          setColor(m.white === 'guest' ? 'white' : 'black');
          setClockMin(m.clock);
          setTimes({ w: m.clock * 60000, b: m.clock * 60000 });
        } else if (m.t === 'move') {
          if (m.n !== movesRef.current.length) return;
          const c = new Chess();
          for (const u of movesRef.current) tryMove(c, u);
          const mv = tryMove(c, m.uci);
          if (!mv) return;
          mv.captured ? sound.capture() : sound.move();
          setMoves((x) => [...x, m.uci]);
        } else if (m.t === 'resign') setResult('Dein Gegner hat aufgegeben – du gewinnst!');
        else if (m.t === 'draw-offer') setDrawOffer(true);
        else if (m.t === 'draw-accept') setResult('Remis vereinbart.');
      },
      setPeers,
    )
      .then((c) => {
        setConn(c);
        leave = c.leave;
      })
      .catch((e) => setErr((e as Error).message));
    return () => leave();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  // Handshake: sobald beide da sind, stellen sich beide vor
  useEffect(() => {
    if (conn && peers >= 2) conn.send({ t: 'hello', name: myName, id: conn.me });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conn, peers]);

  // Host startet, sobald der Gast „hello“ gesendet hat (Antwort mit start)
  useEffect(() => {
    if (host && conn && opp) {
      conn.send({ t: 'start', white: host.color === 'white' ? 'host' : 'guest', black: host.color === 'black' ? 'host' : 'guest', clock: host.mins });
      setTimes({ w: host.mins * 60000, b: host.mins * 60000 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opp, conn]);

  // Uhr
  useEffect(() => {
    if (!started || !clockMin || result || moves.length < 2) return;
    let last = Date.now();
    const iv = setInterval(() => {
      const now = Date.now();
      const side = game.turn();
      setTimes((t) => {
        const nt = { ...t, [side]: t[side] - (now - last) };
        if (nt[side] <= 0) setResult((side === 'w' ? 'white' : 'black') === color ? 'Zeit abgelaufen – du verlierst.' : 'Zeit deines Gegners abgelaufen – du gewinnst!');
        return nt;
      });
      last = now;
    }, 250);
    return () => clearInterval(iv);
  }, [started, clockMin, result, moves.length, game, color]);

  useEffect(() => {
    if (!game.isGameOver() || result) return;
    if (game.isCheckmate()) setResult((game.turn() === 'w' ? 'black' : 'white') === color ? 'Matt – du gewinnst!' : 'Matt – du verlierst.');
    else setResult('Remis.');
  }, [game, color, result]);

  useEffect(() => {
    if (!result) return;
    bump('botGames');
    if (result.includes('gewinnst')) addXp(20);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result]);

  const link = location.origin + location.pathname + '#/online/' + code;
  const myTurn = started && !result && (game.turn() === 'w' ? 'white' : 'black') === color;

  function onMove(u: string) {
    if (!myTurn || !conn) return;
    const c = new Chess(game.fen());
    const m = tryMove(c, u);
    if (!m) return;
    const uci = m.from + m.to + (m.promotion ?? '');
    conn.send({ t: 'move', uci, n: moves.length });
    m.captured ? sound.capture() : sound.move();
    setMoves([...moves, uci]);
  }

  const last = game.history({ verbose: true }).at(-1);
  const sans = game.history();

  return (
    <div className="trainer">
      <div className="board-col">
        {!!clockMin && started && <div className={'clock' + (!myTurn && !result ? ' running' : '')}><span>{opp}</span><b className="mono">{fmt(color === 'white' ? times.b : times.w)}</b></div>}
        <Board fen={game.fen()} orientation={color ?? 'white'} movable={myTurn ? color! : undefined} onMove={onMove} lastMove={last ? [last.from, last.to] : undefined} />
        {!!clockMin && started && <div className={'clock' + (myTurn ? ' running' : '')}><span>{myName}</span><b className="mono">{fmt(color === 'white' ? times.w : times.b)}</b></div>}
      </div>
      <aside className="side">
        <div>
          <a className="back" href="#/online">← Neue Partie</a>
          <div className="kicker">Online · Partie {code}</div>
          <h2>{started ? `${myName} gegen ${opp}` : 'Warte auf Gegner …'}</h2>
        </div>
        {err && <div className="feedback bad">{err} – bist du online?</div>}
        {!started && (
          <div className="panel">
            <div className="panel-body stack">
              <p>Schicke diesen Link an deinen Gegner:</p>
              <input type="text" aria-label="Einladungslink" readOnly value={link} onFocus={(e) => e.target.select()} />
              <div className="row">
                <button className="btn small" onClick={() => navigator.clipboard?.writeText(link)}>Link kopieren</button>
                {'share' in navigator && <button className="btn small" onClick={() => navigator.share({ title: 'Chessty – Partie', url: link }).catch(() => undefined)}>Teilen</button>}
              </div>
              <p className="mono muted" style={{ fontSize: 12 }}>{conn ? `Verbunden (${conn.mode}) · ${peers} im Raum` : <><span className="spinner" /> verbinde …</>}</p>
            </div>
          </div>
        )}
        {started && !result && <p className="mono">{myTurn ? 'Du bist am Zug' : `${opp} ist am Zug`} · du spielst {color === 'white' ? 'Weiß' : 'Schwarz'}</p>}
        {result && <div className="feedback good"><b>{result}</b></div>}
        {drawOffer && !result && (
          <div className="feedback bad">
            {opp} bietet Remis an.
            <div className="row" style={{ marginTop: 8 }}>
              <button className="btn small" onClick={() => { conn?.send({ t: 'draw-accept' }); setResult('Remis vereinbart.'); }}>Annehmen</button>
              <button className="btn small ghost" onClick={() => setDrawOffer(false)}>Ablehnen</button>
            </div>
          </div>
        )}
        <div className="panel">
          <div className="panel-head"><b>Züge</b></div>
          <div className="movelist">{sans.map((s, i) => <span key={i}>{i % 2 === 0 && <span className="n">{i / 2 + 1}.</span>} {sanDe(s)}</span>)}</div>
        </div>
        {started && !result && (
          <div className="row">
            <button className="btn small" onClick={() => conn?.send({ t: 'draw-offer', id: conn.me })}>Remis anbieten</button>
            <button className="btn small" onClick={() => { if (confirm('Wirklich aufgeben?')) { conn?.send({ t: 'resign', id: conn.me }); setResult('Du hast aufgegeben.'); } }}>Aufgeben</button>
          </div>
        )}
        {result && (
          <button className="btn primary" style={{ alignSelf: 'flex-start' }} onClick={() => {
            try { sessionStorage.setItem('chessty.analyse', game.pgn()); } catch { /* egal */ }
            location.hash = '#/analyse';
          }}>Partie analysieren <span className="arrow">→</span></button>
        )}
      </aside>
    </div>
  );
}
