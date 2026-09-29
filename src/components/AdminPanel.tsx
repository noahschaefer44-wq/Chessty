import { useEffect, useRef, useState } from 'react';
import {
  FLAGS, useAdmin, useAdminActions, useCurrentFen, setFlag, setOpen, toggleOpen, unlock, lock, endTestMode, setTimeOffset,
  runAction, taint, type Flag,
} from '../lib/admin';
import { update, addXp, getProgress } from '../lib/progress';
import { lessons } from '../content';
import { BADGES } from '../lib/game';
import { confetti } from '../lib/confetti';

const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

const ROUTES = ['', 'lernen', 'taktik', 'eroeffnungen', 'endspiele', 'meister', 'training', 'spielen', 'varianten', 'varianten/eigene',
  'analyse', 'fehlerheft', 'begriffe', 'wissen', 'editor', 'tagespuzzle', 'einstufung', 'community', 'online', 'profil', 'rechtliches'];

/** Geheimes Test-Panel: Strg+Umschalt+Alt+A, Konami-Code oder 7× aufs Logo tippen */
export default function AdminPanel() {
  const adm = useAdmin();
  const actions = useAdminActions();
  const fen = useCurrentFen();
  const [ask, setAsk] = useState(false);
  const [pass, setPass] = useState('');
  const [err, setErr] = useState('');
  const [msg, setMsg] = useState('');
  const seq = useRef<string[]>([]);
  const taps = useRef<number[]>([]);

  const summon = () => (getAdminUnlocked() ? toggleOpen() : setAsk((a) => !a));
  function getAdminUnlocked() {
    return adm.unlocked;
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.altKey && e.code === 'KeyA') {
        e.preventDefault();
        summon();
        return;
      }
      if (e.key === 'Escape') {
        setAsk(false);
        setOpen(false);
      }
      seq.current = [...seq.current, e.key.length === 1 ? e.key.toLowerCase() : e.key].slice(-KONAMI.length);
      if (seq.current.join() === KONAMI.join()) summon();
    };
    const onTap = (e: Event) => {
      const t = e.target as HTMLElement;
      if (!t.closest?.('.logo')) return;
      const now = Date.now();
      taps.current = [...taps.current.filter((x) => now - x < 3000), now];
      if (taps.current.length >= 7) {
        taps.current = [];
        e.preventDefault();
        summon();
      }
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('click', onTap, true);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('click', onTap, true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adm.unlocked]);

  const flash = (t: string) => {
    setMsg(t);
    setTimeout(() => setMsg(''), 1800);
  };
  const prog = (label: string, fn: () => void) => (
    <button className="btn small" onClick={() => { taint(); fn(); flash(label + ' ✓'); }}>{label}</button>
  );

  if (ask && !adm.unlocked)
    return (
      <div className="admin-gate" role="dialog" aria-label="Admin-Zugang">
        <form onSubmit={async (e) => {
          e.preventDefault();
          if (await unlock(pass)) {
            setAsk(false);
            setPass('');
            setErr('');
          } else setErr('Falsche Passphrase.');
        }}>
          <div className="kicker">Zugang</div>
          <h3 style={{ margin: '0 0 10px' }}>Admin-Panel</h3>
          <input type="password" autoFocus aria-label="Passphrase" placeholder="Passphrase" value={pass} onChange={(e) => setPass(e.target.value)} />
          {err && <p className="mono" style={{ fontSize: 13 }}>{err}</p>}
          <div className="row" style={{ marginTop: 10 }}>
            <button className="btn primary small" type="submit">Entsperren</button>
            <button className="btn ghost small" type="button" onClick={() => setAsk(false)}>Abbrechen</button>
          </div>
        </form>
      </div>
    );

  return (
    <>
      {adm.unlocked && adm.flags.fenBar && fen && (
        <div className="admin-fen mono">
          <span>{fen}</span>
          <button onClick={() => navigator.clipboard?.writeText(fen)}>kopieren</button>
        </div>
      )}
      {adm.unlocked && adm.tainted && !adm.open && (
        <button className="admin-badge" onClick={() => setOpen(true)} title="Admin-Panel öffnen">TEST</button>
      )}
      {adm.unlocked && adm.open && (
        <aside className="admin-panel" aria-label="Admin-Panel">
          <div className="admin-head">
            <b>ADMIN</b>
            <span className="spacer" />
            {adm.tainted && <span className="tag solid" title="Server-Schreibzugriffe sind gesperrt">Testmodus</span>}
            <button className="admin-x" onClick={() => setOpen(false)} aria-label="Panel schließen">✕</button>
          </div>
          <div className="admin-body">
            {msg && <div className="admin-msg mono">{msg}</div>}

            <section>
              <h4>Diese Seite</h4>
              {actions?.list.length ? (
                <div className="admin-actions">
                  {actions.list.map((a) => (
                    <button key={a.label} className="btn small" onClick={() => { runAction(a); flash(a.label + ' ✓'); }}>{a.label}</button>
                  ))}
                </div>
              ) : <p className="muted">Keine Aktionen – öffne eine Bot-Partie, ein Puzzle, eine Lektion oder eine Variante.</p>}
            </section>

            {(['Spiel', 'Optik', 'Debug'] as const).map((g) => (
              <section key={g}>
                <h4>{g}</h4>
                {(Object.keys(FLAGS) as Flag[]).filter((f) => FLAGS[f].group === g).map((f) => (
                  <label key={f} className="admin-toggle" title={FLAGS[f].desc}>
                    <input type="checkbox" checked={!!adm.flags[f]} onChange={(e) => setFlag(f, e.target.checked)} />
                    <span><b>{FLAGS[f].label}</b><small>{FLAGS[f].desc}</small></span>
                  </label>
                ))}
              </section>
            ))}

            <section>
              <h4>Fortschritt</h4>
              <div className="admin-actions">
                {prog('+100 XP', () => addXp(100))}
                {prog('+1000 XP', () => addXp(1000))}
                {prog('Serie +7', () => update((p) => ({ ...p, streak: p.streak + 7, bestStreak: Math.max(p.bestStreak, p.streak + 7) })))}
                {prog('Serienschutz +3', () => update((p) => ({ ...p, streakFreezes: p.streakFreezes + 3 })))}
                {prog('Herzen voll', () => update((p) => ({ ...p, hearts: 5, heartsAt: Date.now() })))}
                {prog('Herzen leer', () => update((p) => ({ ...p, heartsEnabled: true, hearts: 0, heartsAt: Date.now() })))}
                {prog('Tagesziel erfüllen', () => addXp(Math.max(0, getProgress().dailyGoal - getProgress().dailyXp)))}
                {prog('Alle Lektionen fertig', () => update((p) => ({ ...p, lessons: Object.fromEntries(lessons.map((l) => [l.id, { done: true, stars: 3 }])) })))}
                {prog('Alle Abzeichen', () => update((p) => ({ ...p, badges: { ...Object.fromEntries(BADGES.map((b) => [b.id, new Date().toISOString().slice(0, 10)])), ...p.badges } })))}
                {prog('Puzzle-Wertung 2500', () => update((p) => ({ ...p, puzzleRating: 2500 })))}
                {prog('Einstufung zurücksetzen', () => update((p) => ({ ...p, placementDone: false })))}
              </div>
            </section>

            <section>
              <h4>Zeitreise {adm.timeOffsetDays ? `(${adm.timeOffsetDays > 0 ? '+' : ''}${adm.timeOffsetDays} Tage)` : ''}</h4>
              <p className="muted">Verschiebt das Datum für Serie, Tagesquests und Herzen. Lädt die Seite neu.</p>
              <div className="admin-actions">
                <button className="btn small" onClick={() => setTimeOffset(adm.timeOffsetDays + 1)}>+1 Tag</button>
                <button className="btn small" onClick={() => setTimeOffset(adm.timeOffsetDays + 2)}>+2 Tage (Serie reißt)</button>
                <button className="btn small" onClick={() => setTimeOffset(adm.timeOffsetDays + 7)}>+1 Woche</button>
                <button className="btn small" onClick={() => setTimeOffset(0)} disabled={!adm.timeOffsetDays}>Zurück zu heute</button>
              </div>
            </section>

            <section>
              <h4>Werkzeuge</h4>
              <div className="admin-actions">
                <select aria-label="Seite öffnen" value="" onChange={(e) => { location.hash = '#/' + e.target.value; }}>
                  <option value="" disabled>Seite öffnen …</option>
                  {ROUTES.map((r) => <option key={r} value={r}>/{r}</option>)}
                </select>
                <button className="btn small" onClick={() => confetti()}>Konfetti</button>
                <button className="btn small" onClick={() => window.dispatchEvent(new CustomEvent('chessty-badge', { detail: [BADGES[Math.floor(Math.random() * BADGES.length)].id] }))}>Abzeichen-Toast</button>
                <button className="btn small" onClick={() => window.dispatchEvent(new CustomEvent('chessty-update'))}>Update-Hinweis</button>
                <button className="btn small" onClick={() => window.dispatchEvent(new CustomEvent('chessty-admin-crash'))}>Absturz testen</button>
                <button className="btn small" onClick={async () => {
                  const keys = await caches?.keys?.();
                  await Promise.all((keys ?? []).map((k) => caches.delete(k)));
                  const regs = await navigator.serviceWorker?.getRegistrations?.();
                  await Promise.all((regs ?? []).map((r) => r.unregister()));
                  flash('Offline-Speicher geleert');
                }}>Offline-Speicher leeren</button>
                <button className="btn small" onClick={() => {
                  let n = 0;
                  for (let i = 0; i < localStorage.length; i++) n += (localStorage.getItem(localStorage.key(i)!) ?? '').length;
                  flash(`localStorage: ${(n / 1024).toFixed(1)} KB in ${localStorage.length} Einträgen`);
                }}>Speicher messen</button>
              </div>
            </section>

            <section>
              <h4>Beenden</h4>
              <p className="muted">
                {adm.tainted
                  ? 'Test-Features wurden benutzt: Ranglisten, Liga und Sync sind gesperrt, damit keine Testwerte auf den Server gelangen.'
                  : 'Noch keine Test-Features benutzt.'}
              </p>
              <div className="admin-actions">
                <button className="btn small primary" onClick={() => endTestMode()}>Testmodus beenden (echten Fortschritt zurück)</button>
                <button className="btn small ghost" onClick={lock}>Panel sperren</button>
              </div>
            </section>
          </div>
        </aside>
      )}
    </>
  );
}
