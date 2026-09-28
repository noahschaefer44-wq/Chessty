import { useEffect, useState } from 'react';
import { useRoute } from './lib/router';
import { useProgress, levelFromXp } from './lib/progress';
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

const NAV = [
  { path: '', label: 'Lernpfad', ico: '◆' },
  { path: 'taktik', label: 'Taktik', ico: '⚔' },
  { path: 'eroeffnungen', label: 'Eröffnungen', ico: '♞' },
  { path: 'endspiele', label: 'Endspiele', ico: '♔' },
  { path: 'meister', label: 'Meister', ico: '♛' },
  { path: 'spielen', label: 'Spielen', ico: '▶' },
  { path: 'analyse', label: 'Analyse', ico: '⌕' },
  { path: 'fehlerheft', label: 'Fehlerheft', ico: '↻' },
];
const MOBILE = ['', 'taktik', 'eroeffnungen', 'spielen', 'profil'];

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
      return <Play />;
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
          <span className="stat hide-sm" title="Erfahrung">{p.xp} XP</span>
          <a href="#/profil" className="stat hide-sm" title="Stufe" style={{ textDecoration: 'none' }}>
            LV {level}
          </a>
        </div>
      </header>
      <main className="main" key={route.join('/')}>
        {page(route)}
      </main>
      <footer className="footer">
        Chessty · kostenlos & Open Source (GPL-3) · Engine: Stockfish 19 · Puzzles & Eröffnungsnamen: Lichess (CC0)
      </footer>
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
