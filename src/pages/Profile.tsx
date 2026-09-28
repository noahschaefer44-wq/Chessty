import { lessons, masters } from '../content';
import { CATEGORIES } from '../content/types';
import { THEMES } from '../content/themes';
import { useProgress, update, resetProgress, levelFromXp } from '../lib/progress';
import { Bar } from '../components/Widgets';

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
        <button className="btn" style={{ alignSelf: 'flex-start' }} onClick={() => confirm('Wirklich den gesamten Fortschritt löschen?') && resetProgress()}>
          Fortschritt zurücksetzen
        </button>
      </div>
    </>
  );
}
