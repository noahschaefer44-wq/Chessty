import { lessons, masters } from '../content';
import { CATEGORIES } from '../content/types';
import { THEMES } from '../content/themes';
import { useProgress, update, resetProgress, levelFromXp, exportProgress, importProgress } from '../lib/progress';
import MiniBoard from '../components/MiniBoard';
import { Bar } from '../components/Widgets';
import { BADGES } from '../lib/game';
import { PATTERN_INFO, type Pattern } from '../lib/explainMove';

export default function Profile() {
  const p = useProgress();
  const { level } = levelFromXp(p.xp);
  const theme = (() => {
    try {
      return document.documentElement.dataset.theme ?? 'auto';
    } catch {
      return 'auto';
    }
  })();
  const setTheme = (t: string) => {
    if (t === 'auto') delete document.documentElement.dataset.theme;
    else document.documentElement.dataset.theme = t;
    try {
      localStorage.setItem('chessty.theme', t);
    } catch { /* egal */ }
    update((x) => ({ ...x }));
  };
  const weak = THEMES.map((t) => ({ t, s: p.themeStats[t.id] }))
    .filter((x) => x.s && x.s.s + x.s.f >= 3)
    .sort((a, b) => a.s!.s / (a.s!.s + a.s!.f) - b.s!.s / (b.s!.s + b.s!.f))
    .slice(0, 5);

  return (
    <>
      <div className="page-head">
        <div className="kicker">Dein Fortschritt · nur auf diesem Gerät gespeichert</div>
        <h1>Profil</h1>
      </div>
      <div className="kpis">
        <div className="kpi"><span>Stufe</span><b>{level}</b></div>
        <div className="kpi"><span>XP gesamt</span><b>{p.xp}</b></div>
        <div className="kpi"><span>Serie</span><b>{p.streak}</b></div>
        <div className="kpi"><span>Puzzle-Wertung</span><b>{p.puzzleRating}</b></div>
        <div className="kpi"><span>Puzzles gelöst</span><b>{p.puzzlesSolved}</b></div>
      </div>

      <div className="row" style={{ marginTop: 14, fontFamily: 'var(--mono)', fontSize: 13 }}>
        <span>Beste Serie: {p.bestStreak}</span>
        <span>· Serienschutz: {p.streakFreezes}/2</span>
        {p.placementDone && <span>· Einstufung: Stufe {p.placementLevel}</span>}
      </div>

      <h2 style={{ marginTop: 36 }}>Abzeichen ({Object.keys(p.badges).length}/{BADGES.length})</h2>
      <div className="badge-grid">
        {BADGES.map((b) => (
          <div key={b.id} className={'badge' + (p.badges[b.id] ? ' got' : '')} title={b.text}>
            <span className="ico-box">{b.icon}</span>
            <b>{b.name}</b>
            <small>{p.badges[b.id] ? new Date(p.badges[b.id]).toLocaleDateString('de-DE') : b.text}</small>
          </div>
        ))}
      </div>

      {Object.keys(p.patterns).length > 0 && (
        <>
          <h2 style={{ marginTop: 36 }}>Deine Fehlermuster</h2>
          <p className="muted">Aus {p.totals.analyses} analysierten eigenen Partien. Hier lohnt sich Training am meisten:</p>
          <div className="list">
            {(Object.entries(p.patterns) as [Pattern, number][]).sort((a, b) => b[1] - a[1]).map(([k, n]) => (
              <a key={k} href={PATTERN_INFO[k].link}>
                <b style={{ width: 240 }}>{PATTERN_INFO[k].name}</b>
                <span className="mono" style={{ width: 50 }}>×{n}</span>
                <span style={{ flex: 1, fontSize: 14 }}>{PATTERN_INFO[k].tip}</span>
                <span style={{ fontSize: 13 }}>{PATTERN_INFO[k].linkText} →</span>
              </a>
            ))}
          </div>
        </>
      )}

      <h2 style={{ marginTop: 36 }}>Lernpfade</h2>
      <div className="stack">
        {CATEGORIES.map((c) => {
          const ls = lessons.filter((l) => l.category === c.id);
          const d = ls.filter((l) => p.lessons[l.id]?.done).length;
          return (
            <div key={c.id}>
              <div className="row" style={{ justifyContent: 'space-between' }}><b>{c.name}</b><span className="mono">{d}/{ls.length}</span></div>
              <Bar value={d} max={ls.length} />
            </div>
          );
        })}
        <div>
          <div className="row" style={{ justifyContent: 'space-between' }}><b>Meisterpartien</b><span className="mono">{Object.values(p.masters).filter((m) => m.done).length}/{masters.length}</span></div>
          <Bar value={Object.values(p.masters).filter((m) => m.done).length} max={masters.length} />
        </div>
      </div>

      {weak.length > 0 && (
        <>
          <h2 style={{ marginTop: 36 }}>Deine schwächsten Motive</h2>
          <div className="list">
            {weak.map(({ t, s }) => (
              <a key={t.id} href={`#/taktik/${t.id}/1`}>
                <b style={{ flex: 1 }}>{t.name}</b>
                <span className="mono">{Math.round((100 * s!.s) / (s!.s + s!.f))}% ({s!.s + s!.f})</span>
              </a>
            ))}
          </div>
        </>
      )}

      <h2 style={{ marginTop: 36 }}>Einstellungen</h2>
      <div className="stack" style={{ maxWidth: 560 }}>
        <div className="row">
          <span style={{ width: 160 }}>Tagesziel</span>
          <div className="seg">
            {[20, 50, 100, 200].map((g) => (
              <button key={g} className={p.dailyGoal === g ? 'on' : ''} onClick={() => update((x) => ({ ...x, dailyGoal: g }))}>{g} XP</button>
            ))}
          </div>
        </div>
        <div className="row">
          <span style={{ width: 160 }}>Farbschema</span>
          <div className="seg">
            {[['auto', 'System'], ['light', 'Hell'], ['dark', 'Dunkel']].map(([k, l]) => (
              <button key={k} className={theme === k ? 'on' : ''} onClick={() => setTheme(k)}>{l}</button>
            ))}
          </div>
        </div>
        <div className="row">
          <span style={{ width: 160 }}>Koordinaten</span>
          <div className="seg">
            <button className={p.showCoords ? 'on' : ''} onClick={() => update((x) => ({ ...x, showCoords: true }))}>An</button>
            <button className={!p.showCoords ? 'on' : ''} onClick={() => update((x) => ({ ...x, showCoords: false }))}>Aus</button>
          </div>
        </div>
        <div className="row">
          <span style={{ width: 160 }}>Töne</span>
          <div className="seg">
            <button className={p.sound ? 'on' : ''} onClick={() => update((x) => ({ ...x, sound: true }))}>An</button>
            <button className={!p.sound ? 'on' : ''} onClick={() => update((x) => ({ ...x, sound: false }))}>Aus</button>
          </div>
        </div>
        <div className="row">
          <span style={{ width: 160 }}>Lerntempo</span>
          <div className="seg">
            {([['auto', 'Automatisch'], ['ruhig', 'Ruhig'], ['manuell', 'Per Knopf']] as const).map(([k, l]) => (
              <button key={k} className={p.pace === k ? 'on' : ''} onClick={() => update((x) => ({ ...x, pace: k }))}>{l}</button>
            ))}
          </div>
          <span className="muted" style={{ fontSize: 13 }}>Lektionen gehen nach dem Lesen von selbst weiter</span>
        </div>
        <div className="row">
          <span style={{ width: 160 }}>Herzen</span>
          <div className="seg">
            <button className={p.heartsEnabled ? 'on' : ''} onClick={() => update((x) => ({ ...x, heartsEnabled: true }))}>An</button>
            <button className={!p.heartsEnabled ? 'on' : ''} onClick={() => update((x) => ({ ...x, heartsEnabled: false }))}>Aus</button>
          </div>
          <span className="muted" style={{ fontSize: 13 }}>5 Leben pro Tag, wie bei Duolingo</span>
        </div>
        <div className="row">
          <span style={{ width: 160 }}>Einstufung</span>
          <a className="btn small" href="#/einstufung">{p.placementDone ? 'Test wiederholen' : 'Test machen'}</a>
        </div>
        <div className="row">
          <span style={{ width: 160 }}>Brett</span>
          <div className="seg">
            {([['grau', 'Grau'], ['kontrast', 'Kontrast'], ['papier', 'Papier'], ['schiefer', 'Schiefer']] as const).map(([k, l]) => (
              <button key={k} className={p.boardTheme === k ? 'on' : ''} onClick={() => update((x) => ({ ...x, boardTheme: k }))}>{l}</button>
            ))}
          </div>
        </div>
        <div className={`theme-${p.boardTheme}`} style={{ width: 160 }}>
          <MiniBoard fen="r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3" size={160} />
        </div>
        <div className="row">
          <span style={{ width: 160 }}>Zug-Animation</span>
          <div className="seg">
            {([[0, 'Aus'], [120, 'Schnell'], [220, 'Normal'], [400, 'Langsam']] as const).map(([k, l]) => (
              <button key={k} className={p.animSpeed === k ? 'on' : ''} onClick={() => update((x) => ({ ...x, animSpeed: k }))}>{l}</button>
            ))}
          </div>
        </div>
        <div className="row">
          <span style={{ width: 160 }}>Sicherung</span>
          <button className="btn small" onClick={exportProgress}>Fortschritt exportieren</button>
          <label className="btn small" style={{ cursor: 'pointer' }}>
            Importieren
            <input type="file" accept="application/json" hidden onChange={async (e) => {
              const f = e.target.files?.[0];
              if (f) alert((await importProgress(f)) ? 'Fortschritt geladen.' : 'Diese Datei ist keine Chessty-Sicherung.');
            }} />
          </label>
        </div>
        <p className="muted" style={{ fontSize: 13 }}>
          Tastatur: Leertaste/Enter = Weiter, Pfeiltasten = Züge vor/zurück.
        </p>
        <button className="btn" style={{ alignSelf: 'flex-start' }} onClick={() => confirm('Wirklich den gesamten Fortschritt löschen?') && resetProgress()}>
          Fortschritt zurücksetzen
        </button>
      </div>
    </>
  );
}
