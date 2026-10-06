import { useEffect, useState } from 'react';
import type { Explain as ExplainT } from '../content/types';

type Tab = 'short' | 'why' | 'pro';
const LABEL: Record<Tab, string> = { short: 'Kurz', why: 'Warum?', pro: 'Profi' };

// Merkt sich die zuletzt gewählte Tiefe über Schritte hinweg
let remembered: Tab = 'short';

/** Der Text, den der Nutzer in der gewählten Tiefe gerade sieht (für die Lesezeit). */
export const shownText = (t: ExplainT) => t[remembered] ?? t.short;

/** Signal an AutoNext: Nutzer liest/hört gerade genauer hin → automatisches Weitergehen anhalten. */
export const pauseAuto = () => window.dispatchEvent(new Event('chessty-reading'));

/** Erklärung in drei Tiefen, zwischen denen man umschalten kann. */
export default function Explain({ text, title }: { text: ExplainT; title?: string }) {
  const [tab, setTab] = useState<Tab>(remembered);
  const available = (t: Tab) => !!text[t];
  const active: Tab = available(tab) ? tab : available('why') && tab === 'pro' ? 'why' : 'short';
  useEffect(() => setTab(remembered), [text]);
  return (
    <div className="panel">
      {title && (
        <div className="panel-head">
          <b>{title}</b>
        </div>
      )}
      <div className="explain-tabs" role="tablist">
        {(['short', 'why', 'pro'] as Tab[]).map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={active === t}
            className={active === t ? 'on' : ''}
            disabled={!available(t)}
            onClick={() => {
              remembered = t;
              setTab(t);
              pauseAuto();
            }}
          >
            <span>{LABEL[t]}</span>
          </button>
        ))}
      </div>
      <div className="explain-body" key={active + text.short}>
        {'speechSynthesis' in window && (
          <button className="speak" title="Vorlesen" aria-label="Vorlesen" onClick={() => { pauseAuto(); speak(text[active] ?? text.short); }}>🔊</button>
        )}
        <Rich text={text[active] ?? text.short} />
      </div>
    </div>
  );
}

/** Text mit deutscher Stimme vorlesen (Browser-Sprachausgabe, funktioniert offline). */
export function speak(t: string) {
  const s = window.speechSynthesis;
  if (s.speaking) {
    s.cancel();
    return;
  }
  const clean = t.replace(/\*\*/g, '').replace(/…/g, ' ').replace(/(\d+)\./g, 'Zug $1: ');
  const u = new SpeechSynthesisUtterance(clean);
  u.lang = 'de-DE';
  const v = s.getVoices().find((x) => x.lang.startsWith('de'));
  if (v) u.voice = v;
  s.speak(u);
}

/** Minimaler Formatierer: **fett**, Absätze. */
export function Rich({ text }: { text: string }) {
  return (
    <>
      {text.split(/\n\n+/).map((para, i) => (
        <p key={i}>
          {para.split(/(\*\*[^*]+\*\*)/).map((part, j) =>
            part.startsWith('**') ? <b key={j}>{part.slice(2, -2)}</b> : <span key={j}>{part}</span>,
          )}
        </p>
      ))}
    </>
  );
}
