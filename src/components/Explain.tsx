import { useEffect, useState } from 'react';
import type { Explain as ExplainT } from '../content/types';

type Tab = 'short' | 'why' | 'pro';
const LABEL: Record<Tab, string> = { short: 'Kurz', why: 'Warum?', pro: 'Profi' };

// Merkt sich die zuletzt gewählte Tiefe über Schritte hinweg
let remembered: Tab = 'short';

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
            }}
          >
            <span>{LABEL[t]}</span>
          </button>
        ))}
      </div>
      <div className="explain-body" key={active + text.short}>
        <Rich text={text[active] ?? text.short} />
      </div>
    </div>
  );
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
