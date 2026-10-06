import { useState } from 'react';
import { FOLDERS, type Folder, type Notebook } from './notes';
import './cover.css';

/**
 * Tarn-Startseite im Stil einer Notizen-App: Ordner, Hefte, Seiten.
 * Erst wenn in den Einstellungen „Ton“ ausgeschaltet wird, öffnet sich die eigentliche App.
 * Der Zustand wird nirgends gespeichert – nach jedem Neuladen erscheint wieder diese Seite.
 */
export default function Cover({ onUnlock }: { onUnlock: () => void }) {
  const [folder, setFolder] = useState<Folder | null>(null);
  const [book, setBook] = useState<Notebook | null>(null);
  const [settings, setSettings] = useState(false);
  const [sound, setSound] = useState(true);
  const [autosave, setAutosave] = useState(true);
  const [paper, setPaper] = useState('Liniert');
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);

  function toggleSound() {
    setSound(false);
    // kurz den umgelegten Schalter zeigen, dann öffnen
    setTimeout(onUnlock, 280);
  }

  const crumbs = (
    <div className="nb-crumbs">
      <button onClick={() => { setFolder(null); setBook(null); }}>Dokumente</button>
      {folder && <><span>›</span><button onClick={() => setBook(null)}>{folder.name}</button></>}
      {book && <><span>›</span><span>{book.title}</span></>}
    </div>
  );

  const visibleFolders = FOLDERS.filter((f) => !query || (f.name + f.books.map((b) => b.title).join(' ')).toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="nb">
      <header className="nb-top">
        <div className="nb-left">
          {(folder || book) && <button className="nb-back" aria-label="Zurück" onClick={() => (book ? setBook(null) : setFolder(null))}>‹</button>}
          <h1>{book ? book.title : folder ? folder.name : 'Dokumente'}</h1>
        </div>
        <div className="nb-actions">
          <button aria-label="Suchen" onClick={() => setSearching((s) => !s)}>
            <svg viewBox="0 0 24 24"><circle cx="10.5" cy="10.5" r="6.5" /><path d="M15.5 15.5 21 21" /></svg>
          </button>
          <button aria-label="Neu">
            <svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" /></svg>
          </button>
          <button aria-label="Einstellungen" onClick={() => setSettings(true)}>
            <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3.2" /><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1" /></svg>
          </button>
        </div>
      </header>
      {searching && !book && (
        <div className="nb-search"><input autoFocus placeholder="Dokumente durchsuchen" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Suchen" /></div>
      )}
      {(folder || book) && crumbs}

      {!folder && !book && (
        <>
          <div className="nb-sort"><span>Sortieren nach</span> <b>Datum ▾</b></div>
          <div className="nb-grid">
            {visibleFolders.map((f) => (
              <button key={f.name} className="nb-folder" onClick={() => setFolder(f)}>
                <svg viewBox="0 0 120 92" className="nb-folder-ico" aria-hidden="true">
                  <path d="M6 14a6 6 0 0 1 6-6h30l8 9h58a6 6 0 0 1 6 6v57a6 6 0 0 1-6 6H12a6 6 0 0 1-6-6z" fill={f.color} />
                  <path d="M6 28a6 6 0 0 1 6-6h96a6 6 0 0 1 6 6v52a6 6 0 0 1-6 6H12a6 6 0 0 1-6-6z" fill={f.color} />
                  <path d="M6 28a6 6 0 0 1 6-6h96a6 6 0 0 1 6 6v52a6 6 0 0 1-6 6H12a6 6 0 0 1-6-6z" fill="#fff" opacity=".16" />
                </svg>
                <b>{f.name}</b>
                <small>{f.books.length} {f.books.length === 1 ? "Element" : "Elemente"}</small>
              </button>
            ))}
          </div>
        </>
      )}

      {folder && !book && (
        <div className="nb-grid">
          {folder.books.map((b) => (
            <button key={b.title} className="nb-book" onClick={() => setBook(b)}>
              <div className={'nb-thumb' + (b.cover ? ' cover' : '')} style={b.cover ? { background: b.cover } : undefined}>
                {!b.cover && b.lines.slice(0, 6).map((l, i) => <i key={i} style={{ width: `${40 + ((l.length * 7) % 50)}%` }} />)}
                {b.cover && <span>{b.title}</span>}
              </div>
              <b>{b.title}</b>
              <small>{b.date}</small>
            </button>
          ))}
        </div>
      )}

      {book && (
        <div className="nb-page-wrap">
          <article className={'nb-page' + (paper === 'Kariert' ? ' grid' : paper === 'Blanko' ? ' blank' : '')}>
            <div className="nb-date">{book.date}</div>
            <h2>{book.title}</h2>
            {book.lines.map((l, i) => (l.startsWith('# ') ? <h3 key={i}>{l.slice(2)}</h3> : <p key={i}>{l}</p>))}
          </article>
        </div>
      )}

      {settings && (
        <div className="nb-sheet-bg" onClick={() => setSettings(false)}>
          <div className="nb-sheet" role="dialog" aria-label="Einstellungen" onClick={(e) => e.stopPropagation()}>
            <div className="nb-sheet-head">
              <b>Einstellungen</b>
              <button onClick={() => setSettings(false)}>Fertig</button>
            </div>
            <div className="nb-group-title">Allgemein</div>
            <div className="nb-group">
              <label className="nb-row"><span>Ton</span><Switch on={sound} onChange={() => (sound ? toggleSound() : setSound(true))} /></label>
              <label className="nb-row"><span>Automatisch speichern</span><Switch on={autosave} onChange={() => setAutosave((a) => !a)} /></label>
              <div className="nb-row"><span>iCloud-Synchronisierung</span><small>Aktiv</small></div>
            </div>
            <div className="nb-group-title">Papier</div>
            <div className="nb-group">
              {['Liniert', 'Kariert', 'Blanko'].map((p) => (
                <button key={p} className="nb-row" onClick={() => setPaper(p)}><span>{p}</span>{paper === p && <b>✓</b>}</button>
              ))}
            </div>
            <div className="nb-group-title">Info</div>
            <div className="nb-group">
              <div className="nb-row"><span>Version</span><small>6.4.2</small></div>
              <div className="nb-row"><span>Speicher</span><small>1,3 GB von 5 GB</small></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Switch({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <button role="switch" aria-checked={on} className={'nb-switch' + (on ? ' on' : '')} onClick={(e) => { e.preventDefault(); onChange(); }}>
      <i />
    </button>
  );
}
