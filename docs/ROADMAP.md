# Chessty – Roadmap & Optimierungsliste

Stand 06.10.2026. Priorität: **P1** = zuerst, **P2** = danach, **P3** = später.
Jeder Punkt nennt die betroffenen Dateien und woran man „fertig“ erkennt. Regeln aus `CLAUDE.md` gelten immer.

## 0. Offen beim Eigentümer
- [ ] **Impressum-Daten** (Name, Anschrift, E-Mail) in `src/content/operator.ts` eintragen – rechtlich nötig.
- [ ] Fremde Migration `kraftteller_schema` in der Supabase-DB klären (gehört nicht zu Chessty).
- [ ] Admin-Passphrase sicher aufbewahren (steht nicht im Repo).

## 1. Leistung & Ladezeit (P1)
Messwerte: Haupt-Bundle `index-*.js` 457 KB (144 KB gzip), Supabase-Chunk 214 KB (54 KB gzip), Stockfish-WASM 1,8 MB, `puzzles.json` 584 KB, `openings.json` 412 KB.
- [x] **Lektionsinhalte aus dem Haupt-Bundle lösen**: `src/content/index.ts` importiert alle Lektionen samt Schritten; Startseite und Lernpfad brauchen nur Metadaten (id, Titel, Kategorie, Stufe, Zusammenfassung). Metadaten-Index erzeugen (z. B. `src/content/meta.ts` per Skript) und Schritte pro Kategorie lazy laden (`import()` in `LessonPlayer`). Ziel: Haupt-Bundle < 200 KB.
- [ ] Glossar und Wissen ebenfalls nur in ihren Seiten laden (prüfen mit `grep` im gebauten Bundle).
- [ ] `src/lib/cloud.ts`: Supabase-Client nur dynamisch importieren (prüfen, dass `startAutoSync` in `main.tsx` den Chunk nicht sofort lädt, wenn kein Konto existiert).
- [ ] `puzzles.json` nach Motiv aufteilen (`public/data/puzzles/<motiv>.json`) – Runde lädt nur, was sie braucht. Skript: `scripts/build-puzzles.py`.
- [ ] Stockfish erst laden, wenn eine Seite die Engine wirklich braucht (prüfen: `src/lib/engine.ts` startet den Worker lazy?).
- [ ] Bilder/Diagramme: `pieceImages.ts` (Base64-SVGs) einmal als Sprite statt pro Diagramm.
- [ ] Lighthouse-/Bundle-Report in CI (z. B. `vite build --mode analyze` mit `rollup-plugin-visualizer`, nur dev).

## 2. Qualität & Tests (P1)
- [x] **Automatische Browser-Tests** (Rauchtest; tiefere Abläufe noch offen) (Playwright, als `npm run e2e`): Smoke-Test aller Routen aus `App.tsx` ohne Konsolenfehler; Lektion lösen inkl. falschem Zug; Puzzle-Runde; Bot-Partie per Tastaturzug; Variante Crazyhouse mit Einsetzen; Entenschach mit Enten-Setzen; Admin-Panel entsperren/beenden. In CI aufnehmen.
- [ ] Unit-Tests (Vitest) für `src/lib/accuracy.ts`, `src/lib/forceMove.ts`, `src/variants/engine.ts` (Perft aus `scripts/variants-check.ts` übernehmen), `src/variants/assistant.ts` (Beispielsätze → erwartete Regeln), `progress.ts` (Serie, Herzen, Zeitreise).
- [ ] ESLint + Prettier einführen (React-Hooks-Regeln), bestehende `eslint-disable`-Kommentare prüfen.
- [ ] `scripts/variants-check.ts` in CI aufnehmen.
- [ ] Fehlerbehandlung: globale `unhandledrejection`-Anzeige statt stiller Fehler (z. B. Engine-Worker-Absturz).

## 3. Lern-Features (P2)
- [x] **Fehler-Coach nach Bot-Partien**: die 3 größten Fehler (aus `Analysis`-Logik) automatisch als Mini-Lektion mit `WrongMovePanel`-Erklärung.
- [x] **Persönlicher Trainingsplan**: aus `progress.themeStats`, Fehlerheft und Analyse-Mustern täglich 10 Minuten vorschlagen (Startseite).
- [x] Varianten-Lektionen (erste Einführungen in `src/variants/lessons.ts`) (3–5 geführte Stellungen je Variante) und Varianten-Puzzles; Datenformat analog `Lesson`, aber mit `Rules` aus `src/variants/list.ts`.
- [x] Eröffnungs-Lernmodus mit „Warum?“ pro Zug in `OpeningDrill.tsx` (Texte in den Eröffnungslektionen ergänzen).
- [x] Endspiel-Kurs mit Stufen (KD–K bis Lucena/Philidor) gegen Tablebase (`practice.ts`).
- [x] Mehr Inhalte: Ziel 80+ Lektionen (81); jede neue Lektion mit `npm run validate -- <id>` prüfen.

## 4. Varianten (P2)
- [ ] Varianten online gegen Freunde (Transport wie `Online.tsx`, Zustand = `Pos` aus `src/variants/engine.ts`).
- [x] Werkstatt: eigene Gangarten für Figuren, andere Brettgrößen (6×6, 10×8) – erfordert Verallgemeinerung von `engine.ts` (feste 64 Felder).
- [ ] Bot-Stärke: Transpositionstabelle + Killer-Züge in `src/variants/ai.ts`; Varianten-Eröffnungsbuch für Chess960/Crazyhouse.
- [ ] Nebelschach: Bot ebenfalls nur mit Sichtinformation spielen lassen (derzeit sieht er alles – in den Regeln offen gesagt).
- [ ] Tastatureingabe für Variantenzüge als Text (`e2e4`, `S@f3`), siehe Hinweis in Legal → Barrierefreiheit.

## 5. Community (P3)
- [ ] Moderation von Anzeigenamen (Wortfilter serverseitig in `chessty_register`/`chessty_rename` + Meldefunktion).
- [ ] Rate-Limits für `chessty_game_send` und `chessty_register` (z. B. pro IP über Supabase Edge Function oder Zähltabelle).
- [ ] Wöchentliche Turniere gegen Bots (Server speichert nur Ergebnis + Wochen-ID).
- [ ] Teilen: Endstellung/Partie als Bild oder GIF (Canvas-Export, ohne Server).

## 6. Barrierefreiheit & UX (P2)
- [ ] Spracheingabe von Zügen (Web Speech API, kostenlos im Browser) – baut auf `KeyboardMove` in `Board.tsx` auf.
- [ ] Kontrastmodus und Schriftgröße in `Profile.tsx`.
- [ ] Fokus-Reihenfolge und Screenreader-Texte auf allen Trainer-Seiten prüfen (axe-core im E2E-Test).
- [ ] Mobile: Bretter auf kleinen Displays ohne horizontales Scrollen (360 px testen).

## 7. Technik-Schulden (P3)
- [ ] `src/variants/assistant.ts`: Regex-Parser in Tabelle (Muster → Regel) umbauen, Tests dazu.
- [ ] `LessonPlayer.tsx` nutzt eigene Fehlerlogik statt `useWrongMove` – vereinheitlichen.
- [ ] Doppelte Bot-Konzepte (`Play.tsx` mit Stockfish, `variants/ai.ts`) dokumentieren bzw. gemeinsame Bot-Auswahl-Komponente.
- [ ] Stockfish multi-thread (SharedArrayBuffer braucht COOP/COEP-Header in `netlify.toml`) für stärkere Analyse auf schnellen Geräten.

## Erledigt am 06.10.2026
- Haupt-Bundle 457 → 278 KB (Lektions-Übersicht `src/content/meta.ts`, erzeugt von `scripts/build-meta.ts`); Rest ist fast nur React-DOM
- Vitest-Unit-Tests (`npm test`), Browser-Rauchtest (`npm run e2e`), beide in CI; Fehleranzeige für Engine-Abstürze und unbehandelte Fehler
- Automatisches Weitergehen (AutoNext) in Lektionen, Puzzles, Prüfungen; Lerntempo im Profil
- Praxisteil nach jeder Lektion (`#/praxis/<id>`, `src/content/practicePlan.ts`), Fehler-Coach (`#/coach`), Tagesplan (`#/plan`)
- 12 Eröffnungsfallen aus beiden Sichten (`src/content/traps.ts`, Kategorie `fallen`), Fallen-Trainer, Warum-Erklärungen im Eröffnungstraining
- Endspiel-Kurs in 4 Stufen, 5 neue Datenbank-Praxisstellungen, Praxis gespiegelt
- Varianten-Engine für beliebige Brettgrößen, Märchenfiguren und eigene Figuren; 7 neue Varianten; Werkstatt mit Aufstellungs-Editor, Figuren-Werkstatt und Siegbedingungen; Variante des Tages; geführte Varianten-Einführungen

## Erledigt (Auszug)
- Genauigkeit nach Lichess-Formel (geprüft gegen echte Partien)
- Erklärung falscher Züge überall, inkl. Widerlegung zum Nachspielen
- Varianten-Tab mit 10 Varianten, 5 Bots, Werkstatt + Regel-Assistent
- Rechtliches (Impressum-Gerüst, Datenschutz, Cookies, Nutzungsbedingungen, Barrierefreiheit, Lizenzen), Einwilligung bei Konten
- Tastatur-Zugeingabe auf allen spielbaren Brettern
- Admin-/Testpanel mit Server-Sperre im Testmodus
