import { lazy, Suspense, useEffect, useState } from 'react';
import { useRoute } from './lib/router';
import { useProgress, levelFromXp, heartsNow } from './lib/progress';
import { BADGES, questsFor } from './lib/game';
import { confetti } from './lib/confetti';
import { today } from './lib/progress';
import Home from './pages/Home';
const LessonPlayer = lazy(() => import('./pages/LessonPlayer'));
const Learn = lazy(() => import('./pages/Learn'));
const Puzzles = lazy(() => import('./pages/Puzzles'));
const PuzzleSession = lazy(() => import('./pages/PuzzleSession'));
const Openings = lazy(() => import('./pages/Openings'));
const OpeningDrill = lazy(() => import('./pages/OpeningDrill'));
const Explorer = lazy(() => import('./pages/Explorer'));
const Endgames = lazy(() => import('./pages/Endgames'));
const EndgamePractice = lazy(() => import('./pages/EndgamePractice'));
const Masters = lazy(() => import('./pages/Masters'));
const MasterGamePlayer = lazy(() => import('./pages/MasterGamePlayer'));
const Play = lazy(() => import('./pages/Play'));
const Analysis = lazy(() => import('./pages/Analysis'));
const Review = lazy(() => import('./pages/Review'));
const Profile = lazy(() => import('./pages/Profile'));
const Glossary = lazy(() => import('./pages/Glossary'));
const Editor = lazy(() => import('./pages/Editor'));
const ExamPlayer = lazy(() => import('./pages/ExamPlayer'));
const Placement = lazy(() => import('./pages/Placement'));
const Training = lazy(() => import('./pages/Training'));
const Coordinates = lazy(() => import('./pages/trainers/Coordinates'));
const Colors = lazy(() => import('./pages/trainers/Colors'));
const Blind = lazy(() => import('./pages/trainers/Blind'));
const Hanging = lazy(() => import('./pages/trainers/Hanging'));
const Calc = lazy(() => import('./pages/trainers/Calc'));
const Threat = lazy(() => import('./pages/trainers/Threat'));
const Candidates = lazy(() => import('./pages/trainers/Candidates'));
const EvalGuess = lazy(() => import('./pages/trainers/EvalGuess'));
const Rebuild = lazy(() => import('./pages/trainers/Rebuild'));
const GuessMove = lazy(() => import('./pages/trainers/GuessMove'));
const RepertoireDrill = lazy(() => import('./pages/RepertoireDrill'));
const Knowledge = lazy(() => import('./pages/Knowledge'));
const Community = lazy(() => import('./pages/Community'));
const DailyPuzzle = lazy(() => import('./pages/DailyPuzzle'));
const Online = lazy(() => import('./pages/Online'));
const Variants = lazy(() => import('./pages/Variants'));
const Legal = lazy(() => import('./pages/Legal'));
import ErrorBoundary from './components/ErrorBoundary';

const NAV = [
  { path: '', label: 'Lernpfad', ico: '◆' },
  { path: 'taktik', label: 'Taktik', ico: '⚔' },
  { path: 'eroeffnungen', label: 'Eröffnungen', ico: '♞' },
  { path: 'endspiele', label: 'Endspiele', ico: '♔' },
  { path: 'meister', label: 'Meister', ico: '♛' },
  { path: 'training', label: 'Training', ico: '✚' },
  { path: 'spielen', label: 'Spielen', ico: '▶' },
  { path: 'varianten', label: 'Varianten', ico: '✦' },
];
const MORE = [
  { path: 'community', label: 'Community' },
  { path: 'analyse', label: 'Partieanalyse' },
  { path: 'fehlerheft', label: 'Fehlerheft' },
  { path: 'begriffe', label: 'Fachbegriffe' },
  { path: 'wissen', label: 'Geschichte & Regeln' },
  { path: 'editor', label: 'Brett-Editor' },
  { path: 'tagespuzzle', label: 'Tagespuzzle' },
  { path: 'einstufung', label: 'Einstufungstest' },
  { path: 'profil', label: 'Profil & Einstellungen' },
  { path: 'rechtliches', label: 'Impressum & Datenschutz' },
];
const MOBILE = ['', 'taktik', 'training', 'spielen', 'mehr'];

function page(r: string[]) {
  switch (r[0]) {
    case undefined:
      return <Home />;
    case 'lernen':
      return <Learn category={r[1]} />;
    case 'lektion':
      return <LessonPlayer id={r[1]} />;
    case 'taktik':
      return r[1] ? <PuzzleSession theme={r[1]} mode={r[2]} /> : <Puzzles />;
    case 'eroeffnungen':
      if (r[1] === 'training') return <OpeningDrill id={r[2]} line={Number(r[3] ?? 0)} />;
      if (r[1] === 'explorer') return <Explorer />;
      if (r[1] === 'repertoire') return <RepertoireDrill />;
      return <Openings />;
    case 'endspiele':
      return r[1] === 'praxis' ? <EndgamePractice id={r[2]} /> : <Endgames />;
    case 'meister':
      return r[1] ? <MasterGamePlayer id={r[1]} /> : <Masters />;
    case 'spielen':
      return <Play startFen={r[1]} key={r[1] ?? 'std'} />;
    case 'pruefung':
      return <ExamPlayer kind={r[1]} arg={r[2]} key={r.join('/')} />;
    case 'einstufung':
      return <Placement />;
    case 'training':
      switch (r[1]) {
        case 'koordinaten': return <Coordinates />;
        case 'feldfarben': return <Colors />;
        case 'blind': return <Blind />;
        case 'haengend': return <Hanging />;
        case 'rechnen': return <Calc />;
        case 'droht': return <Threat />;
        case 'kandidaten': return <Candidates />;
        case 'bewertung': return <EvalGuess />;
        case 'nachbauen': return <Rebuild />;
        case 'raten': return <GuessMove />;
        default: return <Training />;
      }
    case 'rechtliches':
      return <Legal page={r[1]} />;
    case 'varianten':
      return <Variants sub={r[1]} arg={r[2]} key={r.join('/')} />;
    case 'wissen':
      return <Knowledge id={r[1]} />;
    case 'community':
      return <Community />;
    case 'tagespuzzle':
      return <DailyPuzzle />;
    case 'online':
      return <Online code={r[1]} key={r[1] ?? 'neu'} />;
    case 'begriffe':
      return <Glossary id={r[1]} />;
    case 'editor':
      return <Editor initial={r[1]} key={r[1] ?? 'leer'} />;
    case 'analyse':
      return <Analysis />;
    case 'fehlerheft':
      return <Review />;
    case 'mehr':
      return <MoreMenu />;
    case 'profil':
      return <Profile />;
    default:
      return <Home />;
  }
}

/** Mobile Übersicht aller Bereiche. */
function MoreMenu() {
  return (
    <>
      <div className="page-head"><div className="kicker">Alle Bereiche</div><h1>Mehr</h1></div>
      <div className="list">
        {[...NAV.slice(2), ...MORE].map((m) => <a key={m.path} href={'#/' + m.path}><b style={{ flex: 1 }}>{m.label}</b> →</a>)}
      </div>
    </>
  );
}

export default function App() {
  const route = useRoute();
  const p = useProgress();
  const { level } = levelFromXp(p.xp);
  const [online, setOnline] = useState(navigator.onLine);
  const [updateReady, setUpdateReady] = useState(false);
  const [toasts, setToasts] = useState<{ key: number; icon: string; title: string; text: string }[]>([]);
  useEffect(() => {
    const push = (t: { icon: string; title: string; text: string }) => {
      const key = Date.now() + Math.random();
      setToasts((x) => [...x, { ...t, key }]);
      setTimeout(() => setToasts((x) => x.filter((y) => y.key !== key)), 5000);
    };
    const onBadge = (e: Event) => {
      for (const id of (e as CustomEvent<string[]>).detail) {
        const b = BADGES.find((x) => x.id === id);
        if (b) push({ icon: b.icon, title: 'Abzeichen: ' + b.name, text: b.text });
      }
      confetti(60);
    };
    const onQuest = (e: Event) => {
      const q = questsFor(today()).find((x) => x.id === (e as CustomEvent<string>).detail);
      if (q) push({ icon: '✓', title: 'Tagesquest erledigt', text: `${q.text} · +${q.xp} XP` });
    };
    window.addEventListener('chessty-badge', onBadge);
    window.addEventListener('chessty-quest', onQuest);
    return () => {
      window.removeEventListener('chessty-badge', onBadge);
      window.removeEventListener('chessty-quest', onQuest);
    };
  }, []);
  useEffect(() => {
    const on = () => setUpdateReady(true);
    window.addEventListener('chessty-update', on);
    return () => window.removeEventListener('chessty-update', on);
  }, []);
  useEffect(() => {
    const on = () => setOnline(navigator.onLine);
    window.addEventListener('online', on);
    window.addEventListener('offline', on);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', on);
    };
  }, []);
  const cur = route[0] ?? '';
  const isActive = (path: string) => (path === '' ? cur === '' || cur === 'lernen' || cur === 'lektion' : cur === path);

  return (
    <div className="app">
      <header className="topbar">
        <a href="#/" className="logo" aria-label="Chessty Startseite">
          <span className="logo-mark" aria-hidden>
            <span /><span /><span /><span />
          </span>
          Chessty
        </a>
        <nav className="nav" aria-label="Hauptnavigation">
          {NAV.map((n) => (
            <a key={n.path} href={'#/' + n.path} className={isActive(n.path) ? 'active' : ''}>
              {n.label}
            </a>
          ))}
          <div className="more">
            <button className={MORE.some((m) => m.path === cur) ? 'active' : ''} aria-haspopup="true">Mehr ▾</button>
            <div className="more-menu">
              {MORE.map((m) => <a key={m.path} href={'#/' + m.path}>{m.label}</a>)}
            </div>
          </div>
        </nav>
        <div className="topstats">
          {!online && <span className="tag">offline</span>}
          <a href="#/profil" className="stat" style={{ textDecoration: 'none' }} title="Serie">
            <i className={'flame' + (p.streak > 0 ? ' on' : '')} /> {p.streak}
          </a>
          {p.heartsEnabled && <span className="stat hearts" title="Herzen">{'♥'.repeat(heartsNow(p))}{'♡'.repeat(5 - heartsNow(p))}</span>}
          <span className="stat hide-sm" title="Erfahrung">{p.xp} XP</span>
          <a href="#/profil" className="stat hide-sm" title="Stufe" style={{ textDecoration: 'none' }}>
            LV {level}
          </a>
        </div>
      </header>
      <main className="main" key={route.join('/')}>
        <ErrorBoundary resetKey={route.join('/')}>
          <Suspense fallback={<p className="mono"><span className="spinner" /> Lade …</p>}>{page(route)}</Suspense>
        </ErrorBoundary>
      </main>
      <footer className="footer">
        Chessty · kostenlos & Open Source (GPL-3) · Engine: Stockfish 19 · Puzzles & Eröffnungsnamen: Lichess (CC0)
        <nav className="footer-links" aria-label="Rechtliches">
          <a href="#/rechtliches/impressum">Impressum</a>
          <a href="#/rechtliches/datenschutz">Datenschutz</a>
          <a href="#/rechtliches/nutzung">Nutzungsbedingungen</a>
          <a href="#/rechtliches/cookies">Cookies</a>
          <a href="#/rechtliches/barrierefreiheit">Barrierefreiheit</a>
          <a href="#/rechtliches/lizenzen">Lizenzen</a>
        </nav>
      </footer>
      <div className="toast-stack" aria-live="polite">
        {toasts.map((t) => (
          <div className="achv" key={t.key}>
            <span className="ico-box">{t.icon}</span>
            <div><b>{t.title}</b><div className="muted" style={{ fontSize: 13 }}>{t.text}</div></div>
          </div>
        ))}
      </div>
      {updateReady && (
        <div className="toast" role="status">
          <span>Neue Version von Chessty verfügbar.</span>
          <button className="btn small" onClick={() => (window as unknown as { chesstyUpdate: () => void }).chesstyUpdate()}>Neu laden</button>
          <button className="btn small ghost" style={{ color: 'var(--bg)' }} onClick={() => setUpdateReady(false)}>Später</button>
        </div>
      )}
      <nav className="bottomnav" aria-label="Navigation">
        {MOBILE.map((path) => {
          const n = NAV.find((x) => x.path === path) ?? { path: 'mehr', label: 'Mehr', ico: '≡' };
          return (
            <a key={path} href={'#/' + path} className={isActive(path) ? 'active' : ''}>
              <span className="ico">{n.ico}</span>
              {n.label}
            </a>
          );
        })}
      </nav>
    </div>
  );
}
