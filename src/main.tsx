import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import App from './App';
import './styles/global.css';

registerSW({ immediate: true });

// Gespeichertes Farbschema anwenden
try {
  const t = localStorage.getItem('chessty.theme');
  if (t && t !== 'auto') document.documentElement.dataset.theme = t;
} catch {
  /* egal */
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
