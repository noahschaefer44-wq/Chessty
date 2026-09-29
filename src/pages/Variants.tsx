import { useEffect, useMemo, useState } from 'react';
import { VARIANTS, variantById } from '../variants/list';
import VariantPlay from '../variants/VariantPlay';
import VariantBoard from '../variants/VariantBoard';
import { newGame, legalMoves, PIECE_NAMES } from '../variants/engine';
import {
  emptyDesign, designRules, describeRules, parseIdea, parseWithBrowserAi, browserAiStatus, IDEAS, START,
  type Design, type ParseResult,
} from '../variants/assistant';

const KEY = 'chessty-variants';

function loadSaved(): Design[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]');
  } catch {
    return [];
  }
}
function saveAll(list: Design[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    /* Speicher nicht verfügbar */
  }
}
export function encodeDesign(d: Design): string {
  return btoa(unescape(encodeURIComponent(JSON.stringify(d)))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function decodeDesign(s: string): Design | null {
  try {
    const b = s.replace(/-/g, '+').replace(/_/g, '/');
    const d = JSON.parse(decodeURIComponent(escape(atob(b)))) as Design;
    const base = emptyDesign();
    return { ...base, ...d, rules: { ...base.rules, ...d.rules } };
  } catch {
    return null;
  }
}

export default function Variants({ sub, arg }: { sub?: string; arg?: string }) {
  if (sub === 'eigene') return <Builder initial={arg ? decodeDesign(arg) : null} />;
  if (sub === 'spiel' && arg) {
    const d = decodeDesign(arg);
    if (!d) return <p>Diese Variante konnte nicht gelesen werden.</p>;
    return <CustomPlay d={d} code={arg} />;
  }
  if (sub) {
    const v = variantById(sub);
    if (!v) return <p>Variante nicht gefunden.</p>;
    return (
      <>
        <a className="back" href="#/varianten">← Varianten</a>
        <div className="page-head" style={{ marginBottom: 16 }}>
          <div className="kicker">Variante</div>
          <h1 style={{ marginBottom: 6 }}>{v.rules.name}</h1>
          <p className="muted" style={{ margin: 0 }}>{v.short}</p>
        </div>
        <VariantPlay rules={v.rules} ruleText={v.rules_text} tip={v.tip} />
      </>
    );
  }
  return <Overview />;
}

function Overview() {
  const [saved, setSaved] = useState<Design[]>(loadSaved);
  return (
    <>
      <div className="page-head">
        <div className="kicker">Schach anders</div>
        <h1>Varianten</h1>
        <p className="muted">
          Die zehn beliebtesten Schachvarianten von Lichess und Chess.com – jeweils gegen fünf Bots von „Küken“ bis „Meister“.
          Oder erfinde deine eigene Variante: Beschreibe sie in eigenen Worten, der Regel-Assistent baut sie dir.
        </p>
        <a className="btn primary" href="#/varianten/eigene">Eigene Variante erfinden <span className="arrow">→</span></a>
      </div>
      <div className="grid">
        {VARIANTS.map((v, i) => (
          <a key={v.rules.id} className="card variant-card" href={'#/varianten/' + v.rules.id}>
            <span className="mono muted" style={{ fontSize: 12 }}>{String(i + 1).padStart(2, '0')} · {v.where}</span>
            <PreviewBoard setup={v.rules} />
            <h3 style={{ margin: '8px 0 4px' }}>{v.rules.name}</h3>
            <p className="muted" style={{ margin: 0, fontSize: 14 }}>{v.short}</p>
          </a>
        ))}
      </div>
      {saved.length > 0 && (
        <>
          <h2 style={{ marginTop: 32 }}>Deine Varianten</h2>
          <div className="list">
            {saved.map((d, i) => (
              <div key={i}>
                <span style={{ flex: 1 }}><b>{d.name}</b> <span className="muted" style={{ fontSize: 13 }}>{describeRules(designRules(d), d).slice(0, 2).join(' ')}</span></span>
                <a className="btn small" href={'#/varianten/spiel/' + encodeDesign(d)}>Spielen</a>
                <a className="btn small ghost" href={'#/varianten/eigene/' + encodeDesign(d)}>Bearbeiten</a>
                <button className="btn small ghost" aria-label="Löschen" onClick={() => { const l = saved.filter((_, k) => k !== i); saveAll(l); setSaved(l); }}>✕</button>
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
}

function PreviewBoard({ setup }: { setup: import('../variants/engine').Rules }) {
  const pos = useMemo(() => newGame(setup), [setup]);
  return (
    <div style={{ maxWidth: 200, margin: '8px 0' }}>
      <VariantBoard pos={pos} />
    </div>
  );
}

function CustomPlay({ d, code }: { d: Design; code: string }) {
  const rules = useMemo(() => designRules(d), [d]);
  return (
    <>
      <a className="back" href="#/varianten">← Varianten</a>
      <div className="page-head" style={{ marginBottom: 16 }}>
        <div className="kicker">Eigene Variante</div>
        <h1 style={{ marginBottom: 6 }}>{d.name}</h1>
        <div className="row">
          <a className="btn small ghost" href={'#/varianten/eigene/' + code}>Regeln bearbeiten</a>
          <button className="btn small ghost" onClick={() => navigator.clipboard?.writeText(location.href)}>Link kopieren</button>
        </div>
      </div>
      <VariantPlay rules={rules} ruleText={describeRules(rules, d)} />
    </>
  );
}

const SWAP_OPTIONS: [string, string][] = [['keep', 'unverändert'], ['', 'entfernen'], ['n', 'Springer'], ['b', 'Läufer'], ['r', 'Turm'], ['q', 'Dame'], ['a', 'Amazone (D+S)'], ['c', 'Kanzler (T+S)'], ['h', 'Erzbischof (L+S)']];

function Builder({ initial }: { initial: Design | null }) {
  const [d, setD] = useState<Design>(initial ?? emptyDesign());
  const [text, setText] = useState('');
  const [result, setResult] = useState<ParseResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [ai, setAi] = useState<'available' | 'downloadable' | 'none'>('none');
  const [msg, setMsg] = useState('');
  useEffect(() => {
    browserAiStatus().then(setAi);
  }, []);

  const rules = useMemo(() => designRules(d), [d]);
  const preview = useMemo(() => {
    try {
      return newGame(rules);
    } catch {
      return null;
    }
  }, [rules]);
  const problems = useMemo(() => {
    const out: string[] = [];
    if (!preview) return ['Die Startstellung ist ungültig.'];
    const w = preview.b.filter((p) => p && p === p.toUpperCase()).length;
    const b = preview.b.filter((p) => p && p !== p.toUpperCase()).length;
    if (!w || !b) out.push('Beide Seiten brauchen mindestens eine Figur.');
    if (rules.kingSafety && !preview.hadKing.w && !preview.hadKing.b) out.push('Ohne Könige kann niemand mattgesetzt werden – aktiviere ein anderes Ziel (z. B. Schlagschach).');
    if (preview && !legalMoves(preview, rules).length) out.push('In der Startstellung gibt es keinen erlaubten Zug.');
    return out;
  }, [preview, rules]);

  const set = (patch: Partial<Design>) => setD((x) => ({ ...x, ...patch }));
  const setR = (patch: Partial<Design['rules']>) => setD((x) => ({ ...x, rules: { ...x.rules, ...patch } }));

  async function convert() {
    if (!text.trim()) return;
    setBusy(true);
    let res: ParseResult | null = null;
    if (ai === 'available') res = await parseWithBrowserAi(text);
    const rb = parseIdea(text, emptyDesign());
    if (!res) res = rb;
    else if (rb.understood.length > res.understood.length) res = rb; // der gründlichere gewinnt
    setD(res.design);
    setResult(res);
    setBusy(false);
  }

  function save() {
    const list = loadSaved();
    const i = list.findIndex((x) => x.name === d.name);
    if (i >= 0) list[i] = d;
    else list.push(d);
    saveAll(list);
    setMsg('Gespeichert – du findest sie unter „Deine Varianten“.');
  }

  const toggle = (k: keyof Design['rules'], label: string, extra?: Partial<Design['rules']>) => (
    <label className="toggle-row">
      <input type="checkbox" checked={!!d.rules[k]} onChange={(e) => setR({ [k]: e.target.checked, ...(e.target.checked ? extra : {}) } as Partial<Design['rules']>)} />
      <span>{label}</span>
    </label>
  );

  return (
    <>
      <a className="back" href="#/varianten">← Varianten</a>
      <div className="page-head">
        <div className="kicker">Varianten-Werkstatt</div>
        <h1>Eigene Variante erfinden</h1>
        <p className="muted">Beschreibe deine Idee in normalen Sätzen. Der Regel-Assistent übersetzt sie in Spielregeln – danach kannst du alles von Hand anpassen und direkt gegen die Bots spielen.</p>
      </div>
      <div className="trainer">
        <div className="board-col">
          {preview && <VariantBoard pos={preview} />}
          {problems.length > 0 && <div className="feedback bad">{problems.map((p) => <div key={p}>{p}</div>)}</div>}
        </div>
        <aside className="side">
          <div className="panel">
            <div className="panel-head"><b>1 · Idee beschreiben</b><span className="spacer" /><span className="mono muted" style={{ fontSize: 12 }}>{ai === 'available' ? 'Browser-KI aktiv' : 'Regel-Assistent'}</span></div>
            <div className="panel-body">
              <textarea className="input" aria-label="Deine Varianten-Idee" rows={4} value={text} onChange={(e) => setText(e.target.value)}
                placeholder="z. B.: Wer zuerst 5 Schachgebote gibt, gewinnt. Türme werden zu Kanzlern. Keine Rochade." style={{ width: '100%', resize: 'vertical' }} />
              <div className="row" style={{ marginTop: 8 }}>
                <button className="btn primary small" onClick={convert} disabled={busy || !text.trim()}>{busy ? 'Denke nach …' : 'Umwandeln'}</button>
                <select className="input" style={{ maxWidth: 220 }} value="" onChange={(e) => e.target.value && setText(e.target.value)} aria-label="Beispiel wählen">
                  <option value="">Beispiel einfügen …</option>
                  {IDEAS.map((x) => <option key={x} value={x}>{x}</option>)}
                </select>
              </div>
              {result && (
                <div style={{ marginTop: 10, fontSize: 14 }}>
                  {result.understood.length > 0 && (
                    <>
                      <b>Verstanden{result.engine === 'browser-ki' ? ' (Browser-KI)' : ''}:</b>
                      <ul style={{ margin: '4px 0', paddingLeft: 18 }}>{result.understood.map((u) => <li key={u}>{u}</li>)}</ul>
                    </>
                  )}
                  {result.unknown.length > 0 && (
                    <p className="muted" style={{ margin: '4px 0' }}>
                      Nicht umsetzbar: {result.unknown.map((u) => `„${u}“`).join(', ')}. Tipp: Nutze Bausteine wie Schlagzwang, Explosion, Einsetzen, Ente, Nebel, Hügel, X Schachs, Figurentausch.
                    </p>
                  )}
                  {!result.understood.length && <p className="muted">Ich habe keine bekannte Regel erkannt – probiere eines der Beispiele oder stelle die Regeln unten ein.</p>}
                </div>
              )}
              <p className="muted" style={{ fontSize: 12, margin: '8px 0 0' }}>
                Kostenlos und ohne Server: Der Assistent erkennt Regel-Bausteine in deinem Text.
                {ai === 'available' ? ' Zusätzlich nutzt er die eingebaute KI deines Browsers (läuft lokal auf deinem Gerät).' : ai === 'downloadable' ? ' Dein Browser kann eine lokale KI laden (Chrome) – sie wird genutzt, sobald sie bereit ist.' : ''}
              </p>
            </div>
          </div>

          <div className="panel">
            <div className="panel-head"><b>2 · Regeln anpassen</b></div>
            <div className="panel-body">
              <label className="field">Name <input className="input" value={d.name} onChange={(e) => set({ name: e.target.value.slice(0, 40) })} /></label>
              <label className="field">Startaufstellung
                <select className="input" value={d.base} onChange={(e) => set({ base: e.target.value as Design['base'] })}>
                  <option value="standard">Normale Grundstellung</option>
                  <option value="960">Chess960 (zufällig gemischt)</option>
                  <option value="horde">Horde (36 Bauern gegen Armee)</option>
                  <option value="racing">Königsrennen</option>
                  <option value="custom">Eigene Stellung (FEN)</option>
                </select>
              </label>
              {d.base === 'custom' && (
                <label className="field">FEN (nur Brett-Teil, z. B. aus dem Brett-Editor)
                  <input className="input mono" value={d.customFen} onChange={(e) => set({ customFen: e.target.value || START })} />
                </label>
              )}
              <div className="swap-grid">
                {(['n', 'b', 'r', 'q'] as const).map((t) => (
                  <label key={t} className="field">{PIECE_NAMES[t]}
                    <select className="input" value={t in d.swap ? d.swap[t] : 'keep'}
                      onChange={(e) => {
                        const swap = { ...d.swap };
                        if (e.target.value === 'keep' || e.target.value === t) delete swap[t];
                        else swap[t] = e.target.value;
                        set({ swap });
                      }}>
                      {SWAP_OPTIONS.map(([v, n]) => <option key={v} value={v}>{n}</option>)}
                    </select>
                  </label>
                ))}
                <label className="field">gilt für
                  <select className="input" value={d.swapSide} onChange={(e) => set({ swapSide: e.target.value as Design['swapSide'] })}>
                    <option value="both">beide Seiten</option>
                    <option value="w">nur Weiß</option>
                    <option value="b">nur Schwarz</option>
                  </select>
                </label>
              </div>
              <div className="toggle-grid">
                {toggle('drops', 'Einsetzen (Crazyhouse)')}
                {toggle('atomic', 'Explosionen (Atom)')}
                {toggle('forcedCapture', 'Schlagzwang')}
                {toggle('antichess', 'Wer alles verliert, gewinnt', { forcedCapture: true, kingSafety: false, castling: false })}
                {toggle('hill', 'König ins Zentrum gewinnt')}
                {toggle('race', 'Königsrennen zur 8. Reihe')}
                {toggle('duck', 'Ente', { kingSafety: false, stalemateWins: true })}
                {toggle('fog', 'Nebel', { kingSafety: false })}
                <label className="toggle-row">
                  <input type="checkbox" checked={!d.rules.kingSafety} onChange={(e) => setR({ kingSafety: !e.target.checked })} />
                  <span>König darf geschlagen werden</span>
                </label>
                {toggle('castling', 'Rochade erlaubt')}
                {toggle('pawnDouble', 'Bauern-Doppelschritt')}
                {toggle('stalemateWins', 'Patt gewinnt')}
              </div>
              <label className="field">Schachgebote zum Sieg (0 = aus)
                <input className="input" type="number" min={0} max={20} value={d.rules.checksToWin}
                  onChange={(e) => setR({ checksToWin: Math.max(0, Math.min(20, Number(e.target.value) || 0)) })} />
              </label>
            </div>
          </div>

          <div className="panel">
            <div className="panel-head"><b>3 · Zusammenfassung</b></div>
            <div className="panel-body">
              <ul style={{ margin: 0, paddingLeft: 18 }}>{describeRules(rules, d).map((x) => <li key={x}>{x}</li>)}</ul>
            </div>
          </div>
          {msg && <div className="feedback good">{msg}</div>}
          <div className="row">
            <a className={'btn primary' + (problems.length ? ' disabled' : '')} aria-disabled={problems.length > 0}
              href={problems.length ? undefined : '#/varianten/spiel/' + encodeDesign(d)}>Gegen Bot spielen <span className="arrow">→</span></a>
            <button className="btn" onClick={save}>Speichern</button>
            <button className="btn ghost" onClick={() => { setD(emptyDesign()); setResult(null); setText(''); }}>Zurücksetzen</button>
          </div>
        </aside>
      </div>
    </>
  );
}
