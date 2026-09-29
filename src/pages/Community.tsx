import { useEffect, useState } from 'react';
import { useAccount } from '../lib/useAccount';
import { register, connect, logout, deleteAccount, rename, push, syncCode, friends, addFriend, removeFriend, league, LEAGUES, type FriendRow } from '../lib/cloud';
import { useProgress, isoWeek } from '../lib/progress';

function AccountSetup() {
  const [name, setName] = useState('');
  const [consent, setConsent] = useState(false);
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const run = async (fn: () => Promise<unknown>) => {
    setBusy(true);
    setErr('');
    try {
      await fn();
    } catch (e) {
      setErr(navigator.onLine ? (e as Error).message : 'Dafür brauchst du Internet.');
    }
    setBusy(false);
  };
  return (
    <div className="grid wide">
      <div className="card flat">
        <div className="kicker">Neu hier</div>
        <h3>Konto anlegen</h3>
        <p className="muted" style={{ fontSize: 14 }}>Ohne E-Mail, ohne Passwort: Du wählst einen Namen und bekommst einen geheimen Sync-Code. Dein bisheriger Fortschritt wird übernommen.</p>
        <div className="row">
          <input type="text" aria-label="Anzeigename" placeholder="Anzeigename (2–20 Zeichen)" value={name} maxLength={20} onChange={(e) => setName(e.target.value)} style={{ flex: 1 }} />
          <button className="btn primary" disabled={busy || name.trim().length < 2 || !consent} onClick={() => run(() => register(name.trim()))}>Anlegen</button>
        </div>
        <label className="toggle-row" style={{ marginTop: 8, fontSize: 13 }}>
          <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
          <span>
            Ich willige ein, dass Anzeigename und Spielstände auf dem Chessty-Server (EU) gespeichert werden und der Name in Ranglisten
            sichtbar ist. Details: <a href="#/rechtliches/datenschutz">Datenschutz</a>. Widerruf jederzeit durch Löschen des Kontos.
            Unter 16 nur mit Zustimmung der Eltern.
          </span>
        </label>
      </div>
      <div className="card flat">
        <div className="kicker">Zweites Gerät</div>
        <h3>Mit Sync-Code verbinden</h3>
        <p className="muted" style={{ fontSize: 14 }}>Den Code findest du auf deinem anderen Gerät unter „Community“. Der Fortschritt von dort wird hierher geladen.</p>
        <div className="row">
          <input type="text" aria-label="Sync-Code" placeholder="Sync-Code" value={code} onChange={(e) => setCode(e.target.value)} style={{ flex: 1 }} />
          <button className="btn" disabled={busy || !code.includes('.')} onClick={() => run(() => connect(code, false))}>Verbinden</button>
        </div>
      </div>
      {err && <div className="feedback bad">{err}</div>}
    </div>
  );
}

export default function Community() {
  const a = useAccount();
  const p = useProgress();
  const [fr, setFr] = useState<FriendRow[] | null>(null);
  const [lg, setLg] = useState<{ name: string; weekly_xp: number; league: number; is_me: boolean }[] | null>(null);
  const [fcode, setFcode] = useState('');
  const [msg, setMsg] = useState('');
  const [showCode, setShowCode] = useState(false);

  const reload = async () => {
    if (!a) return;
    try {
      await push();
      const [f, l] = await Promise.all([friends(), league()]);
      setFr(f);
      setLg(l);
    } catch (e) {
      setMsg((e as Error).message);
    }
  };
  useEffect(() => {
    void reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [a?.id]);

  return (
    <>
      <div className="page-head">
        <div className="kicker">Kostenloser Server · Konto freiwillig</div>
        <h1>Community</h1>
        <p className="muted">Fortschritt auf allen Geräten, Freunde, Wochenliga, Tagespuzzle mit Rangliste und Online-Partien per Link.</p>
      </div>

      <div className="grid" style={{ marginBottom: 30 }}>
        <a className="card inverse" href="#/tagespuzzle">
          <div className="kicker">Für alle gleich</div>
          <h3>Tagespuzzle</h3>
          <p className="muted">Ein Versuch, auf Zeit – mit Tages-Rangliste.</p>
        </a>
        <a className="card" href="#/online">
          <div className="kicker">Echtzeit</div>
          <h3>Online gegen Freunde</h3>
          <p className="muted">Partie erstellen, Link schicken, losspielen – mit Uhr.</p>
        </a>
      </div>

      {!a ? (
        <AccountSetup />
      ) : (
        <div className="trainer" style={{ gridTemplateColumns: 'minmax(0,1fr) 400px' }}>
          <div className="stack">
            <div className="panel">
              <div className="panel-head">
                <b>Wochenliga: {LEAGUES[a.league ?? 0]}</b>
                <span className="spacer" />
                <span className="mono" style={{ fontSize: 12 }}>{isoWeek()}</span>
              </div>
              <div className="panel-body">
                <p className="muted" style={{ fontSize: 13 }}>Sammle diese Woche XP. Die besten 20 % steigen am Montag auf, die letzten 20 % ab. Ligen: {LEAGUES.join(' → ')}.</p>
                <div className="list">
                  {(lg ?? []).map((r, i) => (
                    <div key={i} style={r.is_me ? { background: 'var(--fg)', color: 'var(--bg)' } : undefined}>
                      <b className="mono" style={{ width: 30 }}>{i + 1}.</b>
                      <span style={{ flex: 1 }}>{r.name}{r.is_me ? ' (du)' : ''}</span>
                      <span className="mono">{r.weekly_xp} XP</span>
                    </div>
                  ))}
                  {lg && !lg.length && <div className="muted">Noch niemand in deiner Liga aktiv – sammle XP!</div>}
                  {!lg && <div className="mono"><span className="spinner" /> Lade …</div>}
                </div>
              </div>
            </div>
            <div className="panel">
              <div className="panel-head"><b>Freunde</b></div>
              <div className="panel-body stack">
                <div className="row">
                  <input type="text" aria-label="Freundescode" placeholder="Freundescode (6 Zeichen)" value={fcode} onChange={(e) => setFcode(e.target.value.toUpperCase())} maxLength={6} style={{ flex: 1 }} />
                  <button className="btn primary" disabled={fcode.length !== 6} onClick={async () => {
                    try {
                      const n = await addFriend(fcode);
                      setMsg(`${n} ist jetzt dein Freund.`);
                      setFcode('');
                      void reload();
                    } catch (e) {
                      setMsg((e as Error).message);
                    }
                  }}>Hinzufügen</button>
                </div>
                {msg && <div className="feedback bad">{msg}</div>}
                <div className="list">
                  {(fr ?? []).map((f) => (
                    <div key={f.friend_code} style={f.is_me ? { background: 'var(--g1)' } : undefined}>
                      <span style={{ flex: 1 }}><b>{f.name}</b>{f.is_me ? ' (du)' : ''}</span>
                      <span className="mono" style={{ fontSize: 12 }}>Woche {f.weekly_xp} · ▲{f.streak} · {f.puzzle_rating}</span>
                      {!f.is_me && <button className="btn small ghost" onClick={async () => { await removeFriend(f.friend_code); void reload(); }} aria-label="Entfernen">✕</button>}
                    </div>
                  ))}
                </div>
                <p className="muted" style={{ fontSize: 13 }}>Sortiert nach XP dieser Woche. ▲ = Serie, Zahl = Puzzle-Wertung.</p>
              </div>
            </div>
          </div>
          <aside className="side">
            <div className="panel">
              <div className="panel-head"><b>Dein Konto</b></div>
              <div className="panel-body stack">
                <div className="row"><span className="muted" style={{ width: 120 }}>Name</span><b>{a.name}</b>
                  <button className="btn small ghost" onClick={async () => { const n = prompt('Neuer Name', a.name); if (n) try { await rename(n); } catch (e) { alert((e as Error).message); } }}>ändern</button>
                </div>
                <div className="row"><span className="muted" style={{ width: 120 }}>Freundescode</span><b className="mono" style={{ fontSize: 22 }}>{a.friendCode}</b></div>
                <div className="row"><span className="muted" style={{ width: 120 }}>Gesamt-XP</span><span className="mono">{p.xp}</span></div>
                <div className="row"><span className="muted" style={{ width: 120 }}>Synchronisiert</span><span className="mono" style={{ fontSize: 13 }}>{a.lastSync ? new Date(a.lastSync).toLocaleTimeString('de-DE') : '–'}</span>
                  <button className="btn small ghost" onClick={() => void reload()}>jetzt</button>
                </div>
                <div>
                  <div className="kicker">Geheimer Sync-Code – nicht teilen!</div>
                  {showCode ? (
                    <input type="text" aria-label="Dein geheimer Sync-Code" readOnly value={syncCode(a)} onFocus={(e) => e.target.select()} />
                  ) : (
                    <button className="btn small" onClick={() => setShowCode(true)}>Anzeigen</button>
                  )}
                  <p className="muted" style={{ fontSize: 12 }}>Mit diesem Code holst du deinen Fortschritt auf ein anderes Gerät. Wer ihn kennt, kann dein Konto nutzen.</p>
                </div>
                <div className="row">
                  <button className="btn small" onClick={() => confirm('Abmelden? Dein Fortschritt bleibt auf diesem Gerät und auf dem Server.') && logout()}>Abmelden</button>
                  <button className="btn small ghost" onClick={async () => { if (confirm('Konto auf dem Server endgültig löschen?')) await deleteAccount(); }}>Konto löschen</button>
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
