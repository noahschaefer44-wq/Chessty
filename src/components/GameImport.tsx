import { useState } from 'react';

export interface ImportedGame {
  pgn: string;
  white: string;
  black: string;
  result: string;
  date: string;
  userColor: 'w' | 'b';
  site: 'Lichess' | 'Chess.com';
}

/** Eigene Partien von Lichess oder Chess.com laden (beide APIs sind kostenlos und ohne Login). */
export default function GameImport({ onPick }: { onPick: (g: ImportedGame) => void }) {
  const [site, setSite] = useState<'Lichess' | 'Chess.com'>(() => {
    try { return (localStorage.getItem('chessty.importSite') as 'Lichess') || 'Lichess'; } catch { return 'Lichess'; }
  });
  const [name, setName] = useState(() => {
    try { return localStorage.getItem('chessty.importName') ?? ''; } catch { return ''; }
  });
  const [games, setGames] = useState<ImportedGame[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  async function load() {
    const user = name.trim();
    if (!user) return;
    setBusy(true);
    setErr('');
    setGames([]);
    try {
      localStorage.setItem('chessty.importName', user);
      localStorage.setItem('chessty.importSite', site);
    } catch { /* egal */ }
    try {
      let out: ImportedGame[] = [];
      if (site === 'Lichess') {
        const r = await fetch(`https://lichess.org/api/games/user/${encodeURIComponent(user)}?max=15&moves=true&pgnInJson=true`, { headers: { Accept: 'application/x-ndjson' } });
        if (!r.ok) throw new Error(r.status === 404 ? 'Benutzer nicht gefunden.' : 'Lichess antwortet nicht.');
        const txt = await r.text();
        out = txt.trim().split('\n').filter(Boolean).map((l) => {
          const g = JSON.parse(l);
          const w = g.players?.white?.user?.name ?? 'Weiß';
          const b = g.players?.black?.user?.name ?? 'Schwarz';
          return { pgn: g.pgn, white: w, black: b, result: g.winner === 'white' ? '1-0' : g.winner === 'black' ? '0-1' : '½-½', date: new Date(g.createdAt).toLocaleDateString('de-DE'), userColor: w.toLowerCase() === user.toLowerCase() ? 'w' : 'b', site };
        });
      } else {
        const a = await fetch(`https://api.chess.com/pub/player/${encodeURIComponent(user.toLowerCase())}/games/archives`);
        if (!a.ok) throw new Error('Benutzer nicht gefunden.');
        const archives: string[] = (await a.json()).archives ?? [];
        for (const url of archives.slice(-2).reverse()) {
          const r = await fetch(url);
          const list = (await r.json()).games ?? [];
          for (const g of list.reverse()) {
            if (!g.pgn || g.rules !== 'chess') continue;
            const w = g.white.username;
            out.push({ pgn: g.pgn, white: w, black: g.black.username, result: g.white.result === 'win' ? '1-0' : g.black.result === 'win' ? '0-1' : '½-½', date: new Date(g.end_time * 1000).toLocaleDateString('de-DE'), userColor: w.toLowerCase() === user.toLowerCase() ? 'w' : 'b', site });
          }
          if (out.length >= 15) break;
        }
        out = out.slice(0, 15);
      }
      if (!out.length) setErr('Keine Partien gefunden.');
      setGames(out);
    } catch (e) {
      setErr(navigator.onLine ? (e as Error).message || 'Laden fehlgeschlagen.' : 'Für den Import brauchst du Internet.');
    }
    setBusy(false);
  }

  return (
    <div className="panel">
      <div className="panel-head"><b>Eigene Partien laden</b></div>
      <div className="panel-body stack">
        <div className="row">
          <div className="seg">
            {(['Lichess', 'Chess.com'] as const).map((s) => <button key={s} className={site === s ? 'on' : ''} onClick={() => setSite(s)}>{s}</button>)}
          </div>
          <input type="text" placeholder="Benutzername" value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && load()} style={{ flex: 1, minWidth: 160 }} />
          <button className="btn primary" onClick={load} disabled={busy || !name.trim()}>{busy ? 'Lade …' : 'Laden'}</button>
        </div>
        {err && <div className="feedback bad">{err}</div>}
        {games.length > 0 && (
          <div className="list" style={{ maxHeight: 320, overflow: 'auto' }}>
            {games.map((g, i) => (
              <button key={i} onClick={() => onPick(g)}>
                <span className="mono" style={{ width: 86, fontSize: 12 }}>{g.date}</span>
                <span style={{ flex: 1 }}>{g.white} – {g.black}</span>
                <b className="mono">{g.result}</b>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
