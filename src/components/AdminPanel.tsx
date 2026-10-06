import { useEffect, useRef, useState } from 'react';
import {
  FLAGS, useAdmin, useAdminActions, useCurrentFen, setFlag, setOpen, toggleOpen, unlock, lock, restoreBackup, hasBackup, dropBackup, setTimeOffset,
  runAction, taint, type Flag,
} from '../lib/admin';
import { update, addXp, getProgress } from '../lib/progress';
import { LESSON_META as lessons } from '../content/meta';
import { BADGES, questsFor } from '../lib/game';
import { confetti } from '../lib/confetti';
import { today } from '../lib/progress';

const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

const ROUTES = ['', 'lernen', 'taktik', 'eroeffnungen', 'endspiele', 'meister', 'training', 'spielen', 'varianten', 'varianten/werkstatt',
  'salon', 'plan', 'coach', 'analyse', 'fehlerheft', 'begriffe', 'wissen', 'editor', 'tagespuzzle', 'einstufung', 'community', 'online', 'profil', 'rechtliches'];

/** IDs, die alles „erledigt“ machen: Lektionen, Praxisteile, Endspiel-Praxis, Varianten-Einführungen */
const PRACTICE_IDS = ['kq-k', 'kr-k', 'kbb-k', 'kbn-k', 'kp-k-opp', 'kp-k-draw', 'lucena', 'philidor', 'kq-kp7', 'kpk-abstand', 'kpk-def2', 'falscher-laeufer', 'vancura', 'kq-kr'];

/** Admin-Panel: Strg+Umschalt+Alt+A, Konami-Code oder 7× aufs Logo tippen */
export default function AdminPanel() {
  const adm = useAdmin();
  const actions = useAdminActions();
  const fen = useCurrentFen();
  const [ask, setAsk] = useState(false);
  const [pass, setPass] = useState('');
  const [err, setErr] = useState('');
  const [msg, setMsg] = useState('');
  const [num, setNum] = useState('1000');
  const [blob, setBlob] = useState('');
  const seq = useRef<string[]>([]);
  const taps = useRef<number[]>([]);

  const summon = () => (adm.unlocked ? toggleOpen() : setAsk((a) => !a));

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
  const n = Math.max(0, Math.round(Number(num) || 0));
  const allDone = (stars: number) => update((p) => ({
    ...p,
    lessons: {
      ...p.lessons,
      ...Object.fromEntries(lessons.flatMap((l) => [[l.id, { done: true, stars }], ['praxis:' + l.id, { done: true, stars }]])),
      ...Object.fromEntries(PRACTICE_IDS.map((id) => ['practice:' + id, { done: true, stars }])),
    },
    exams: Object.fromEntries(['grundlagen', 'taktik', 'strategie', 'eroeffnungen', 'fallen', 'endspiele'].flatMap((c) => [1, 2, 3, 4].map((l) => [`${c}-${l}`, { best: 100, passed: true }]))),
    placementDone: true,
    placementLevel: 4,
  }));

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
      {adm.unlocked && adm.open && (
        <aside className="admin-panel" aria-label="Admin-Panel">
          <div className="admin-head">
            <b>ADMIN</b>
            <span className="spacer" />
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
              ) : <p className="muted">Keine Aktionen – öffne eine Bot-Partie, ein Puzzle, eine Lektion, eine Variante oder ein Spiel im Salon.</p>}
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
              <h4>Werte setzen</h4>
              <div className="admin-actions">
                <input aria-label="Zahl" type="number" min={0} value={num} onChange={(e) => setNum(e.target.value)} style={{ width: 90 }} />
                {prog('= XP', () => update((p) => ({ ...p, xp: n })))}
                {prog('+ XP', () => addXp(n))}
                {prog('= Serie', () => update((p) => ({ ...p, streak: n, bestStreak: Math.max(p.bestStreak, n), lastActiveDay: today() })))}
                {prog('= Puzzle-Wertung', () => update((p) => ({ ...p, puzzleRating: n })))}
                {prog('= Herzen', () => update((p) => ({ ...p, hearts: Math.min(5, n), heartsAt: Date.now() })))}
                {prog('= Tagesziel', () => update((p) => ({ ...p, dailyGoal: Math.max(10, n) })))}
                {prog('= Serienschutz', () => update((p) => ({ ...p, streakFreezes: n })))}
              </div>
            </section>

            <section>
              <h4>Fortschritt</h4>
              <div className="admin-actions">
                {prog('Tagesziel erfüllen', () => addXp(Math.max(0, getProgress().dailyGoal - getProgress().dailyXp)))}
                {prog('Tagesquests erledigen', () => update((p) => ({ ...p, questsClaimed: [...new Set([...p.questsClaimed, ...questsFor(today()).map((q) => q.id)])] })))}
                {prog('Alles erledigt (3 Sterne)', () => allDone(3))}
                {prog('Alles erledigt (1 Stern)', () => allDone(1))}
                {prog('Alle Abzeichen', () => update((p) => ({ ...p, badges: { ...Object.fromEntries(BADGES.map((b) => [b.id, today()])), ...p.badges } })))}
                {prog('Abzeichen löschen', () => update((p) => ({ ...p, badges: {} })))}
                {prog('Lektionen zurücksetzen', () => update((p) => ({ ...p, lessons: {}, exams: {} })))}
                {prog('Fehlerheft: alles fällig', () => update((p) => ({ ...p, review: p.review.map((c) => ({ ...c, due: 0 })) })))}
                {prog('Fehlerheft leeren', () => update((p) => ({ ...p, review: [] })))}
                {prog('Puzzle-Verlauf leeren', () => update((p) => ({ ...p, puzzleSeen: [] })))}
                {prog('Einstufung zurücksetzen', () => update((p) => ({ ...p, placementDone: false })))}
              </div>
            </section>

            <section>
              <h4>Spielstand</h4>
              <div className="admin-actions">
                <button className="btn small" onClick={() => { const t = btoa(unescape(encodeURIComponent(JSON.stringify(getProgress())))); setBlob(t); void navigator.clipboard?.writeText(t); flash('Spielstand kopiert'); }}>Exportieren</button>
                <button className="btn small" onClick={() => {
                  try {
                    const p = JSON.parse(decodeURIComponent(escape(atob(blob.trim()))));
                    taint();
                    update(() => p);
                    flash('Spielstand geladen');
                  } catch {
                    flash('Ungültiger Text');
                  }
                }}>Importieren</button>
              </div>
              <textarea className="input mono" aria-label="Spielstand als Text" rows={2} value={blob} onChange={(e) => setBlob(e.target.value)} style={{ width: '100%', fontSize: 11 }} placeholder="Text zum Importieren einfügen" />
              {hasBackup() && (
                <div className="admin-actions">
                  <button className="btn small" onClick={() => restoreBackup()}>Stand vor dem ersten Cheat zurückholen</button>
                  <button className="btn small ghost" onClick={() => { dropBackup(); flash('Sicherung verworfen'); }}>Sicherung verwerfen</button>
                </div>
              )}
            </section>

            <section>
              <h4>Zeitreise {adm.timeOffsetDays ? `(${adm.timeOffsetDays > 0 ? '+' : ''}${adm.timeOffsetDays} Tage)` : ''}</h4>
              <p className="muted">Verschiebt das Datum für Serie, Tagesplan, Tagesvariante, Tagesquests und Herzen. Lädt die Seite neu.</p>
              <div className="admin-actions">
                <button className="btn small" onClick={() => setTimeOffset(adm.timeOffsetDays - 1)}>−1 Tag</button>
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
                <button className="btn small" onClick={() => window.dispatchEvent(new CustomEvent('chessty-error', { detail: 'Test-Fehlermeldung aus dem Admin-Panel.' }))}>Fehler-Hinweis</button>
                <button className="btn small" onClick={async () => {
                  const keys = await caches?.keys?.();
                  await Promise.all((keys ?? []).map((k) => caches.delete(k)));
                  const regs = await navigator.serviceWorker?.getRegistrations?.();
                  await Promise.all((regs ?? []).map((r) => r.unregister()));
                  flash('Offline-Speicher geleert');
                }}>Offline-Speicher leeren</button>
                <button className="btn small" onClick={() => {
                  let total = 0;
                  for (let i = 0; i < localStorage.length; i++) total += (localStorage.getItem(localStorage.key(i)!) ?? '').length;
                  flash(`localStorage: ${(total / 1024).toFixed(1)} KB in ${localStorage.length} Einträgen`);
                }}>Speicher messen</button>
              </div>
            </section>

            <section>
              <h4>Panel</h4>
              <div className="admin-actions">
                <button className="btn small" onClick={() => { (Object.keys(FLAGS) as Flag[]).forEach((f) => setFlag(f, false)); flash('Alle Schalter aus'); }}>Alle Schalter aus</button>
                <button className="btn small ghost" onClick={lock}>Panel sperren</button>
              </div>
            </section>
          </div>
        </aside>
      )}
    </>
  );
}
