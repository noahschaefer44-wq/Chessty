import { useEffect, useMemo, useState } from 'react';
import { VARIANTS, variantById } from '../variants/list';
import VariantPlay from '../variants/VariantPlay';
import VariantBoard, { PieceSvg } from '../variants/VariantBoard';
import VariantLesson from '../variants/VariantLesson';
import { VARIANT_LESSONS } from '../variants/lessons';
import { newGame, legalMoves, parseSetup, setupSize, pieceName, BUILTIN, CUSTOM_LETTERS, BASE_RULES, type PieceDef, type Rules } from '../variants/engine';
import {
  emptyDesign, designRules, describeRules, describePiece, autoValue, parseIdea, parseWithBrowserAi, browserAiStatus, IDEAS, START, BASES,
  type Design, type ParseResult, type Base,
} from '../variants/assistant';
import { dailyDesign } from '../variants/daily';
import { today } from '../lib/progress';

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
  if (sub === 'eigene' || sub === 'werkstatt') return <Builder initial={arg ? decodeDesign(arg) : null} />;
  if (sub === 'spiel' && arg) {
    const d = decodeDesign(arg);
    if (!d) return <p>Diese Variante konnte nicht gelesen werden.</p>;
    return <CustomPlay d={d} code={arg} />;
  }
  if (sub === 'lektion' && arg) return <VariantLesson id={arg} />;
  if (sub) {
    const v = variantById(sub);
    if (!v) return <p>Variante nicht gefunden.</p>;
    const lesson = VARIANT_LESSONS.find((l) => l.variant === v.rules.id);
    return (
      <>
        <a className="back" href="#/varianten">← Varianten</a>
        <div className="page-head" style={{ marginBottom: 16 }}>
          <div className="kicker">Variante</div>
          <h1 style={{ marginBottom: 6 }}>{v.rules.name}</h1>
          <p className="muted" style={{ margin: 0 }}>{v.short}</p>
          {lesson && <a className="btn small" style={{ marginTop: 10 }} href={'#/varianten/lektion/' + lesson.id}>Geführte Einführung ({lesson.steps.length} Stellungen) <span className="arrow">→</span></a>}
        </div>
        <VariantPlay rules={v.rules} ruleText={v.rules_text} tip={v.tip} />
      </>
    );
  }
  return <Overview />;
}

function Overview() {
  const [saved, setSaved] = useState<Design[]>(loadSaved);
  const daily = useMemo(() => dailyDesign(today()), []);
  const dailyRules = useMemo(() => designRules(daily), [daily]);
  const dailyPos = useMemo(() => newGame(dailyRules), [dailyRules]);
  return (
    <>
      <div className="page-head">
        <div className="kicker">Schach anders</div>
        <h1>Varianten</h1>
        <p className="muted">
          Die beliebtesten Schachvarianten von Lichess und Chess.com, Klassiker auf kleinen und großen Brettern – jeweils gegen fünf Bots
          von „Küken“ bis „Meister“. Oder erfinde deine eigene Variante: mit eigenen Figuren, Brettgrößen und Siegbedingungen.
        </p>
        <a className="btn primary" href="#/varianten/werkstatt">Eigene Variante erfinden <span className="arrow">→</span></a>
      </div>

      <section className="card inverse daily-variant">
        <div className="kicker">Variante des Tages · jeden Tag neu gemischt</div>
        <div className="row" style={{ alignItems: 'flex-start', gap: 20 }}>
          <div style={{ width: 160, flex: 'none' }}><VariantBoard pos={dailyPos} rules={dailyRules} /></div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <h3 style={{ marginTop: 0 }}>{daily.name}</h3>
            <ul style={{ margin: '0 0 12px', paddingLeft: 18 }}>{describeRules(dailyRules, daily).slice(0, 4).map((x) => <li key={x}>{x}</li>)}</ul>
            <div className="row">
              <a className="btn small" href={'#/varianten/spiel/' + encodeDesign(daily)}>Spielen <span className="arrow">→</span></a>
              <a className="btn small ghost" href={'#/varianten/werkstatt/' + encodeDesign(daily)} style={{ color: 'inherit' }}>In der Werkstatt öffnen</a>
            </div>
          </div>
        </div>
      </section>

      <div className="grid">
        {VARIANTS.map((v, i) => (
          <a key={v.rules.id} className="card variant-card" href={'#/varianten/' + v.rules.id}>
            <span className="mono muted" style={{ fontSize: 12 }}>{String(i + 1).padStart(2, '0')} · {v.where}</span>
            <PreviewBoard setup={v.rules} />
            <h3 style={{ margin: '8px 0 4px' }}>{v.rules.name}</h3>
            <p className="muted" style={{ margin: 0, fontSize: 14 }}>{v.short}</p>
            {VARIANT_LESSONS.some((l) => l.variant === v.rules.id) && <span className="tag" style={{ marginTop: 8 }}>mit Einführung</span>}
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
                <a className="btn small ghost" href={'#/varianten/werkstatt/' + encodeDesign(d)}>Bearbeiten</a>
                <button className="btn small ghost" aria-label="Löschen" onClick={() => { const l = saved.filter((_, k) => k !== i); saveAll(l); setSaved(l); }}>✕</button>
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
}

function PreviewBoard({ setup }: { setup: Rules }) {
  const pos = useMemo(() => newGame(setup), [setup]);
  return (
    <div style={{ maxWidth: 200, margin: '8px 0' }}>
      <VariantBoard pos={pos} rules={setup} />
    </div>
  );
}

function CustomPlay({ d, code }: { d: Design; code: string }) {
  const rules = useMemo(() => designRules(d), [d]);
  const [copied, setCopied] = useState(false);
  return (
    <>
      <a className="back" href="#/varianten">← Varianten</a>
      <div className="page-head" style={{ marginBottom: 16 }}>
        <div className="kicker">Eigene Variante</div>
        <h1 style={{ marginBottom: 6 }}>{d.name}</h1>
        <div className="row">
          <a className="btn small ghost" href={'#/varianten/werkstatt/' + code}>Regeln bearbeiten</a>
          <button className="btn small ghost" onClick={() => { void navigator.clipboard?.writeText(location.href); setCopied(true); }}>{copied ? 'Link kopiert ✓' : 'Link zum Teilen kopieren'}</button>
        </div>
      </div>
      <VariantPlay rules={rules} ruleText={describeRules(rules, d)} />
    </>
  );
}

// ---------- Werkstatt ----------

/** Märchenfiguren für Tausch und Editor */
const FAIRY = ['a', 'c', 'h', 'm', 'l', 'z', 'f', 'e', 'u'];
const LEAP_OPTIONS: { key: string; label: string; v: [number, number] }[] = [
  { key: '10', label: '1 Feld gerade', v: [1, 0] },
  { key: '11', label: '1 Feld schräg', v: [1, 1] },
  { key: '12', label: 'Springersprung', v: [1, 2] },
  { key: '13', label: 'Kamelsprung (3,1)', v: [1, 3] },
  { key: '23', label: 'Zebrasprung (3,2)', v: [2, 3] },
  { key: '20', label: '2 Felder gerade (springt)', v: [2, 0] },
  { key: '22', label: '2 Felder schräg (springt)', v: [2, 2] },
];
const LOOKS: [string, string][] = [['n', 'Springer'], ['b', 'Läufer'], ['r', 'Turm'], ['q', 'Dame'], ['k', 'König'], ['p', 'Bauer']];

const newPiece = (k: string): PieceDef => ({ name: `Figur ${k.toUpperCase()}`, look: 'n', badge: k.toUpperCase(), leaps: [[1, 2]], slides: [], range: 0, forward: false, value: 300 });

/** Standard-Grundreihe für eine Brettbreite (Editor „Neu aufbauen“) */
const ROWS: Record<number, string> = { 5: 'rnkbq', 6: 'rnqknr', 7: 'rnbkbnr', 8: 'rnbqkbnr', 9: 'rnbqkcbnr', 10: 'rnhbqkbcnr', 11: 'rnhbqkmbcnr', 12: 'rlnhbqkbcnlr' };
function defaultSetup(w: number, h: number): string {
  const back = ROWS[w] ?? 'r' + 'n'.repeat(Math.max(0, w - 3)) + 'kr';
  const rows: string[] = [];
  for (let r = h - 1; r >= 0; r--) {
    if (r === h - 1) rows.push(back);
    else if (r === h - 2 && h >= 5) rows.push('p'.repeat(w));
    else if (r === 1 && h >= 5) rows.push('P'.repeat(w));
    else if (r === 0) rows.push(back.toUpperCase());
    else rows.push(String(w));
  }
  return rows.join('/') + ' w';
}
function cellsToFen(cells: (string | null)[], w: number, h: number, turn: string) {
  const rows: string[] = [];
  for (let r = h - 1; r >= 0; r--) {
    let row = '';
    let empty = 0;
    for (let f = 0; f < w; f++) {
      const p = cells[r * w + f];
      if (!p) empty++;
      else {
        if (empty) row += empty;
        empty = 0;
        row += p;
      }
    }
    if (empty) row += empty;
    rows.push(row);
  }
  return rows.join('/') + ' ' + turn;
}

function Builder({ initial }: { initial: Design | null }) {
  const [d, setD] = useState<Design>(initial ?? emptyDesign());
  const [text, setText] = useState('');
  const [result, setResult] = useState<ParseResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [ai, setAi] = useState<'available' | 'downloadable' | 'none'>('none');
  const [msg, setMsg] = useState('');
  const [brush, setBrush] = useState<string>('P');
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
    if (rules.kingSafety && !preview.hadKing.w && !preview.hadKing.b && !rules.promoteWins && !rules.captureWin && !rules.moveLimit)
      out.push('Ohne Könige kann niemand mattgesetzt werden – wähle eine andere Siegbedingung (z. B. „Erste Umwandlung gewinnt“).');
    if (!legalMoves(preview, rules).length) out.push('In der Startstellung gibt es keinen erlaubten Zug.');
    if (rules.captureWin && preview.hadTarget && !preview.hadTarget.w && !preview.hadTarget.b) out.push(`Keine Seite hat die Zielfigur (${pieceName(rules.captureWin, rules)}).`);
    return out;
  }, [preview, rules]);

  const set = (patch: Partial<Design>) => setD((x) => ({ ...x, ...patch }));
  const setR = (patch: Partial<Design['rules']>) => setD((x) => ({ ...x, rules: { ...x.rules, ...patch } }));
  const custom = d.customPieces ?? {};
  const allPieces = [...'nbrq', ...FAIRY, ...Object.keys(custom)];
  const nameOf = (t: string) => pieceName(t, rules);

  async function convert() {
    if (!text.trim()) return;
    setBusy(true);
    let res: ParseResult | null = null;
    if (ai === 'available') res = await parseWithBrowserAi(text);
    const rb = parseIdea(text, emptyDesign());
    if (!res) res = rb;
    else if (rb.understood.length > res.understood.length) res = rb; // der gründlichere gewinnt
    setD({ ...res.design, customPieces: d.customPieces });
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

  // Eigene Startstellung bearbeiten
  const size = setupSize(d.base === 'custom' ? d.customFen : rules.setup === '960' ? START : rules.setup);
  function switchToCustom() {
    set({ base: 'custom', customFen: rules.setup === '960' ? START : rules.setup, swap: {} });
  }
  function paint(s: number) {
    if (d.base !== 'custom' || !preview) return;
    const cells = parseSetup(d.customFen, BASE_RULES).b.slice();
    cells[s] = brush === '.' ? null : cells[s] === brush ? null : brush;
    set({ customFen: cellsToFen(cells, preview.w, preview.h, d.customFen.split(' ')[1] ?? 'w') });
  }
  function resize(w: number, h: number) {
    set({ base: 'custom', swap: {}, customFen: defaultSetup(w, h) });
  }

  // Eigene Figuren
  function setPiece(k: string, p: PieceDef | null) {
    const next = { ...custom };
    if (p) next[k] = { ...p, value: autoValue(p) };
    else delete next[k];
    set({ customPieces: next });
  }
  const freeLetter = CUSTOM_LETTERS.find((k) => !custom[k]);

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
        <p className="muted">Beschreibe deine Idee in normalen Sätzen oder baue sie Schritt für Schritt: Brettgröße, Aufstellung, eigene Figuren, Siegbedingungen. Danach direkt gegen die Bots spielen – und per Link teilen.</p>
      </div>
      <div className="trainer">
        <div className="board-col">
          {preview && <VariantBoard pos={preview} rules={rules} onSquare={d.base === 'custom' ? paint : undefined} />}
          {d.base === 'custom' && (
            <div className="panel" style={{ marginTop: 14 }}>
              <div className="panel-head"><b>Aufstellung bearbeiten</b><span className="spacer" /><span className="mono muted" style={{ fontSize: 12 }}>{size.w}×{size.h}</span></div>
              <div className="panel-body">
                <p className="muted" style={{ marginTop: 0, fontSize: 13 }}>Figur wählen, dann aufs Brett tippen. Nochmal tippen entfernt sie.</p>
                <div className="palette" role="group" aria-label="Figur zum Setzen">
                  {(['w', 'b'] as const).map((c) => (
                    <div key={c} className="palette-row">
                      {['p', 'k', ...allPieces].map((t) => {
                        const p = c === 'w' ? t.toUpperCase() : t;
                        return (
                          <button key={p} className={'palette-piece' + (brush === p ? ' on' : '')} onClick={() => setBrush(p)} aria-label={`${c === 'w' ? 'Weiß' : 'Schwarz'}: ${nameOf(t)}`} title={nameOf(t)}>
                            <svg viewBox="0 0 1 1" width="30" height="30"><PieceSvg p={p} x={0} y={0} rules={rules} /></svg>
                          </button>
                        );
                      })}
                    </div>
                  ))}
                  <button className={'btn small' + (brush === '.' ? ' primary' : '')} onClick={() => setBrush('.')}>Radierer</button>
                </div>
                <div className="row" style={{ marginTop: 10 }}>
                  <label className="field" style={{ margin: 0 }}>Breite
                    <select className="input" value={size.w} onChange={(e) => resize(Number(e.target.value), size.h)}>
                      {[5, 6, 7, 8, 9, 10, 11, 12].map((n) => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </label>
                  <label className="field" style={{ margin: 0 }}>Höhe
                    <select className="input" value={size.h} onChange={(e) => resize(size.w, Number(e.target.value))}>
                      {[5, 6, 7, 8, 9, 10, 11, 12].map((n) => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </label>
                  <label className="field" style={{ margin: 0 }}>Am Zug
                    <select className="input" value={d.customFen.split(' ')[1] ?? 'w'} onChange={(e) => set({ customFen: d.customFen.split(' ')[0] + ' ' + e.target.value })}>
                      <option value="w">Weiß</option>
                      <option value="b">Schwarz</option>
                    </select>
                  </label>
                </div>
                <div className="row">
                  <button className="btn small ghost" onClick={() => resize(size.w, size.h)}>Neu aufbauen</button>
                  <button className="btn small ghost" onClick={() => set({ customFen: Array(size.h).fill(String(size.w)).join('/') + ' w' })}>Brett leeren</button>
                </div>
              </div>
            </div>
          )}
          {problems.length > 0 && <div className="feedback bad">{problems.map((p) => <div key={p}>{p}</div>)}</div>}
        </div>
        <aside className="side">
          <div className="panel">
            <div className="panel-head"><b>1 · Idee beschreiben</b><span className="spacer" /><span className="mono muted" style={{ fontSize: 12 }}>{ai === 'available' ? 'Browser-KI aktiv' : 'Regel-Assistent'}</span></div>
            <div className="panel-body">
              <textarea className="input" aria-label="Deine Varianten-Idee" rows={4} value={text} onChange={(e) => setText(e.target.value)}
                placeholder="z. B.: Kleines Brett 6x6. Springer werden zu Kamelen. Wer die Dame des Gegners schlägt, gewinnt." style={{ width: '100%', resize: 'vertical' }} />
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
                      Nicht umsetzbar: {result.unknown.map((u) => `„${u}“`).join(', ')}. Tipp: Nutze Bausteine wie Schlagzwang, Explosion, Einsetzen, Ente, Nebel, Hügel, X Schachs, Figurentausch, Brettgröße, „Wer die Dame schlägt, gewinnt“.
                    </p>
                  )}
                  {!result.understood.length && <p className="muted">Ich habe keine bekannte Regel erkannt – probiere eines der Beispiele oder stelle die Regeln unten ein.</p>}
                </div>
              )}
            </div>
          </div>

          <div className="panel">
            <div className="panel-head"><b>2 · Brett und Aufstellung</b></div>
            <div className="panel-body">
              <label className="field">Name <input className="input" value={d.name} onChange={(e) => set({ name: e.target.value.slice(0, 40) })} /></label>
              <label className="field">Startaufstellung
                <select className="input" value={d.base} onChange={(e) => {
                  const b = e.target.value as Base;
                  if (b === 'custom') return switchToCustom();
                  set({ base: b });
                  if (b === 'losalamos') setR({ castling: false, pawnDouble: false });
                  if (b === 'pawns') setR({ kingSafety: false, castling: false, promoteWins: true, noMovesLoses: true });
                }}>
                  {(Object.keys(BASES) as (keyof typeof BASES)[]).map((k) => <option key={k} value={k}>{BASES[k].label}</option>)}
                  <option value="960">Chess960 (zufällig gemischt)</option>
                  <option value="custom">Eigene Aufstellung / Brettgröße</option>
                </select>
              </label>
              {d.base !== 'custom' && <button className="btn small ghost" onClick={switchToCustom}>Diese Aufstellung von Hand bearbeiten</button>}
              <p className="muted" style={{ fontSize: 13, marginBottom: 6 }}>Figuren austauschen:</p>
              <div className="swap-grid">
                {(['n', 'b', 'r', 'q'] as const).map((t) => (
                  <label key={t} className="field">{BUILTIN[t].name}
                    <select className="input" value={t in d.swap ? d.swap[t] : 'keep'}
                      onChange={(e) => {
                        const swap = { ...d.swap };
                        if (e.target.value === 'keep' || e.target.value === t) delete swap[t];
                        else swap[t] = e.target.value;
                        set({ swap });
                      }}>
                      <option value="keep">unverändert</option>
                      <option value="">entfernen</option>
                      {allPieces.filter((x) => x !== t).map((x) => <option key={x} value={x}>{nameOf(x)}</option>)}
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
              <details style={{ marginTop: 8 }}>
                <summary style={{ cursor: 'pointer' }}>Märchenfiguren erklärt</summary>
                <ul style={{ fontSize: 13, paddingLeft: 18 }}>
                  {FAIRY.map((t) => <li key={t}><b>{BUILTIN[t].name}</b>: {describePiece(BUILTIN[t])}</li>)}
                </ul>
              </details>
            </div>
          </div>

          <div className="panel">
            <div className="panel-head"><b>3 · Eigene Figuren</b><span className="spacer" /><span className="mono muted" style={{ fontSize: 12 }}>{Object.keys(custom).length}/3</span></div>
            <div className="panel-body">
              {Object.entries(custom).map(([k, p]) => <PieceEditor key={k} letter={k} piece={p} onChange={(np) => setPiece(k, np)} />)}
              {freeLetter && <button className="btn small" onClick={() => setPiece(freeLetter, newPiece(freeLetter))}>+ Neue Figur erfinden</button>}
              {!Object.keys(custom).length && <p className="muted" style={{ fontSize: 13, marginBottom: 0 }}>Erfinde bis zu drei Figuren mit eigener Gangart. Danach kannst du sie oben gegen klassische Figuren tauschen oder in der Aufstellung setzen.</p>}
            </div>
          </div>

          <div className="panel">
            <div className="panel-head"><b>4 · Regeln</b></div>
            <div className="panel-body">
              <div className="toggle-grid">
                {toggle('drops', 'Einsetzen (Crazyhouse)')}
                {toggle('atomic', 'Explosionen (Atom)')}
                {toggle('forcedCapture', 'Schlagzwang')}
                {toggle('duck', 'Ente', { kingSafety: false, stalemateWins: true })}
                {toggle('fog', 'Nebel', { kingSafety: false })}
                <label className="toggle-row">
                  <input type="checkbox" checked={!d.rules.kingSafety} onChange={(e) => setR({ kingSafety: !e.target.checked })} />
                  <span>König darf geschlagen werden</span>
                </label>
                {toggle('castling', 'Rochade erlaubt')}
                {toggle('pawnDouble', 'Bauern-Doppelschritt')}
              </div>
            </div>
          </div>

          <div className="panel">
            <div className="panel-head"><b>5 · Wie gewinnt man?</b></div>
            <div className="panel-body">
              <p className="muted" style={{ marginTop: 0, fontSize: 13 }}>Schachmatt gewinnt immer (wenn es Könige gibt). Zusätzlich:</p>
              <div className="toggle-grid">
                {toggle('antichess', 'Wer alles verliert, gewinnt', { forcedCapture: true, kingSafety: false, castling: false })}
                {toggle('hill', 'König ins Zentrum')}
                {toggle('race', 'Königsrennen zur letzten Reihe')}
                {toggle('promoteWins', 'Erste Umwandlung gewinnt')}
                {toggle('stalemateWins', 'Patt gewinnt')}
                {toggle('noMovesLoses', 'Ohne Zug verliert man')}
              </div>
              <label className="field">Zielfigur schlagen gewinnt
                <select className="input" value={d.rules.captureWin ?? ''} onChange={(e) => setR({ captureWin: e.target.value || undefined })}>
                  <option value="">aus</option>
                  {['q', 'r', 'b', 'n', ...FAIRY, ...Object.keys(custom)].map((t) => <option key={t} value={t}>alle {nameOf(t)}</option>)}
                  <option value="k">König (ohne Schachregel)</option>
                </select>
              </label>
              <div className="row">
                <label className="field" style={{ flex: 1 }}>Schachgebote zum Sieg (0 = aus)
                  <input className="input" type="number" min={0} max={20} value={d.rules.checksToWin}
                    onChange={(e) => setR({ checksToWin: Math.max(0, Math.min(20, Number(e.target.value) || 0)) })} />
                </label>
                <label className="field" style={{ flex: 1 }}>Zuglimit, dann Material (0 = aus)
                  <input className="input" type="number" min={0} max={80} value={d.rules.moveLimit ?? 0}
                    onChange={(e) => setR({ moveLimit: Math.max(0, Math.min(80, Number(e.target.value) || 0)) || undefined })} />
                </label>
              </div>
            </div>
          </div>

          <div className="panel">
            <div className="panel-head"><b>Zusammenfassung</b></div>
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

/** Gangart einer eigenen Figur einstellen – mit Vorschau der Zielfelder */
function PieceEditor({ letter, piece, onChange }: { letter: string; piece: PieceDef; onChange: (p: PieceDef | null) => void }) {
  const has = (vs: [number, number][], [a, b]: [number, number]) => vs.some(([x, y]) => (x === a && y === b) || (x === b && y === a));
  const toggleLeap = (v: [number, number]) => onChange({ ...piece, leaps: has(piece.leaps, v) ? piece.leaps.filter((x) => !has([x], v)) : [...piece.leaps, v] });
  const toggleSlide = (v: [number, number]) => onChange({ ...piece, slides: has(piece.slides, v) ? piece.slides.filter((x) => !has([x], v)) : [...piece.slides, v] });
  // Vorschau: Figur in der Mitte eines leeren 7×7-Bretts, Zielfelder markiert
  const demo = useMemo(() => {
    const r: Rules = { ...BASE_RULES, setup: `7/7/7/3${letter.toUpperCase()}3/7/7/7 w`, castling: false, pieces: { [letter]: piece } };
    const p = newGame(r);
    return { p, r, targets: legalMoves(p, r).map((m) => m.to) };
  }, [letter, piece]);
  return (
    <div className="piece-editor">
      <div className="row" style={{ alignItems: 'flex-start' }}>
        <div style={{ width: 150, flex: 'none' }}><VariantBoard pos={demo.p} rules={demo.r} targets={demo.targets} /></div>
        <div style={{ flex: 1, minWidth: 180 }}>
          <div className="row" style={{ marginTop: 0 }}>
            <label className="field" style={{ flex: 2, margin: 0 }}>Name
              <input className="input" value={piece.name} onChange={(e) => onChange({ ...piece, name: e.target.value.slice(0, 20) })} />
            </label>
            <label className="field" style={{ flex: 1, margin: 0 }}>Zeichen
              <input className="input" value={piece.badge ?? ''} maxLength={1} onChange={(e) => onChange({ ...piece, badge: e.target.value.slice(0, 1).toUpperCase() || letter.toUpperCase() })} />
            </label>
          </div>
          <label className="field">Aussehen
            <select className="input" value={piece.look} onChange={(e) => onChange({ ...piece, look: e.target.value })}>
              {LOOKS.map(([k, n]) => <option key={k} value={k}>wie {n}</option>)}
            </select>
          </label>
          <p className="muted" style={{ fontSize: 13, margin: '4px 0' }}>{describePiece(piece)} · Wert ≈ {(autoValue(piece) / 100).toFixed(1)}</p>
        </div>
      </div>
      <div className="toggle-grid">
        <label className="toggle-row"><input type="checkbox" checked={has(piece.slides, [1, 0])} onChange={() => toggleSlide([1, 0])} /><span>gleitet gerade (wie Turm)</span></label>
        <label className="toggle-row"><input type="checkbox" checked={has(piece.slides, [1, 1])} onChange={() => toggleSlide([1, 1])} /><span>gleitet schräg (wie Läufer)</span></label>
        {LEAP_OPTIONS.map((o) => (
          <label key={o.key} className="toggle-row"><input type="checkbox" checked={has(piece.leaps, o.v)} onChange={() => toggleLeap(o.v)} /><span>{o.label}</span></label>
        ))}
        <label className="toggle-row"><input type="checkbox" checked={!!piece.forward} onChange={(e) => onChange({ ...piece, forward: e.target.checked })} /><span>nur vorwärts</span></label>
      </div>
      {piece.slides.length > 0 && (
        <label className="field">Reichweite beim Gleiten
          <select className="input" value={piece.range ?? 0} onChange={(e) => onChange({ ...piece, range: Number(e.target.value) })}>
            <option value={0}>unbegrenzt</option>
            {[1, 2, 3, 4].map((n) => <option key={n} value={n}>höchstens {n} Felder</option>)}
          </select>
        </label>
      )}
      <button className="btn small ghost" onClick={() => onChange(null)}>Figur löschen</button>
    </div>
  );
}
