// Rauchtest: jede Route im Browser öffnen (Handybreite + Desktop), keine Skriptfehler, kein horizontales Überlaufen.
// Voraussetzung: `npx vite preview --port 4173` läuft. Lokal mit Edge: E2E_CHANNEL=msedge npm run e2e
import { chromium } from 'playwright';

const BASE = process.env.E2E_URL ?? 'http://localhost:4173/';
const ROUTES = [
  '', 'lernen/grundlagen', 'lernen/eroeffnungen', 'lektion/figuren-wert', 'taktik', 'eroeffnungen', 'eroeffnungen/explorer',
  'eroeffnungen/repertoire', 'eroeffnungen/fallen', 'endspiele', 'meister', 'training', 'training/koordinaten', 'training/fallen', 'spielen',
  'varianten', 'varianten/werkstatt', 'analyse', 'fehlerheft', 'begriffe', 'wissen', 'editor', 'tagespuzzle',
  'einstufung', 'profil', 'rechtliches', 'mehr', 'plan',
];

const browser = await chromium.launch(process.env.E2E_CHANNEL ? { channel: process.env.E2E_CHANNEL } : {});
let bad = 0;
for (const width of [360, 1280]) {
  const page = await browser.newPage({ viewport: { width, height: 800 } });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  for (const r of ROUTES) {
    errors.length = 0;
    await page.goto(BASE + '#/' + r);
    await page.waitForTimeout(700);
    const sw = await page.evaluate(() => document.documentElement.scrollWidth);
    const crashed = await page.locator('text=etwas schiefgelaufen').count();
    const fail = errors.length || sw > width || crashed;
    if (fail) bad++;
    console.log(`${fail ? 'FEHLER' : 'OK    '} ${width}px #/${r}${sw > width ? ` (Breite ${sw})` : ''}${crashed ? ' (Fehlerseite)' : ''} ${errors.join(' | ')}`);
  }
  await page.close();
}
await browser.close();
process.exit(bad ? 1 : 0);
