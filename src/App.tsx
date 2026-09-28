import { useEffect, useState } from 'react';
import { useRoute } from './lib/router';
import { useProgress, levelFromXp, heartsNow } from './lib/progress';
import { BADGES, questsFor } from './lib/game';
import { confetti } from './lib/confetti';
import { today } from './lib/progress';
import Home from './pages/Home';
import LessonPlayer from './pages/LessonPlayer';
import Learn from './pages/Learn';
import Puzzles from './pages/Puzzles';
import PuzzleSession from './pages/PuzzleSession';
import Openings from './pages/Openings';
import OpeningDrill from './pages/OpeningDrill';
import Explorer from './pages/Explorer';
import Endgames from './pages/Endgames';
import EndgamePractice from './pages/EndgamePractice';
import Masters from './pages/Masters';
import MasterGamePlayer from './pages/MasterGamePlayer';
import Play from './pages/Play';
import Analysis from './pages/Analysis';
import Review from './pages/Review';
import Profile from './pages/Profile';
import Glossary from './pages/Glossary';
import Editor from './pages/Editor';
import ExamPlayer from './pages/ExamPlayer';
import Placement from './pages/Placement';
import Training from './pages/Training';
import Coordinates from './pages/trainers/Coordinates';
import Colors from './pages/trainers/Colors';
import Blind from './pages/trainers/Blind';
import Hanging from './pages/trainers/Hanging';
import Calc from './pages/trainers/Calc';
import Threat from './pages/trainers/Threat';
import Candidates from './pages/trainers/Candidates';
import EvalGuess from './pages/trainers/EvalGuess';
import Rebuild from './pages/trainers/Rebuild';
import GuessMove from './pages/trainers/GuessMove';
import ErrorBoundary from './components/ErrorBoundary';

const NAV = [
  { path: '', label: 'Lernpfad', ico: '◆' },
  { path: 'taktik', label: 'Taktik', ico: '⚔' },
  { path: 'eroeffnungen', label: 'Eröffnungen', ico: '♞' },
  { path: 'endspiele', label: 'Endspiele', ico: '♔' },
  { path: 'meister', label: 'Meister', ico: '♛' },
  { path: 'training', label: 'Training', ico: '✚' },
  { path: 'spielen', label: 'Spielen', ico: '▶' },
  { path: 'analyse', label: 'Analyse', ico: '⌕' },
  { path: 'fehlerheft', label: 'Fehlerheft', ico: '↻' },
  { path: 'begriffe', label: 'Begriffe', ico: '≡' },
];
const MOBILE = ['', 'taktik', 'training', 'spielen', 'profil'];

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
    case 'begriffe':
      return <Glossary id={r[1]} />;
    case 'editor':
      return <Editor initial={r[1]} key={r[1] ?? 'leer'} />;
    case 'analyse':
      return <Analysis />;
    case 'fehlerheft':
      return <Review />;
    case 'profil':
      return <Profile />;
    default:
      return <Home />;
  }
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
        <ErrorBoundary resetKey={route.join('/')}>{page(route)}</ErrorBoundary>
      </main>
      <footer className="footer">
        Chessty · kostenlos & Open Source (GPL-3) · Engine: Stockfish 19 · Puzzles & Eröffnungsnamen: Lichess (CC0)
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
          const n = NAV.find((x) => x.path === path) ?? { path: 'profil', label: 'Profil', ico: '●' };
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
