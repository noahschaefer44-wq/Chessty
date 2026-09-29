# Chessty

Kostenlose, interaktive Schach-Lern-App (PWA, offline nutzbar) – vom Einsteiger bis zum Meister. Komplett auf Deutsch.

**Live:** https://chessty.netlify.app

## Lernen
- **Lernpfad** (Duolingo-Stil) mit XP, Serie, Serienschutz, Tagesziel, Tagesquests, optionalen Herzen, Wiederholungs-Knoten und Kapitelprüfungen
- **57 Lektionen** in Grundlagen, Taktik, Strategie, Eröffnungen, Endspiele – jede Erklärung in drei Tiefen (Kurz / Warum? / Profi), mit Pfeilen, typischen Fehlern, Vorlesefunktion und „Warum nicht …?“-Engine-Modus
- **Einstufungstest** (10 adaptive Aufgaben) schaltet passende Lektionen frei
- **17 Eröffnungen** mit Fallen, Varianten-Training, persönlichem Repertoire und Explorer (3.800 Varianten, deutsche Namen)
- **Endspiel-Praxis** gegen perfekte Verteidigung (Lichess-Tablebase, offline Stockfish)
- **14 Meisterpartien** (Morphy bis Kasparow) mit „Finde den Zug“
- **Fachbegriffe-Heft** mit 111 Begriffen und Diagrammen
- **Geschichte & Regeln** in 14 kurzen Kapiteln

## Trainieren
- **Taktik**: 30 Motive × 4 Stufen aus der Lichess-Puzzle-Datenbank, **max. 10 Puzzles pro Runde**, Puzzle-Rush, Tagespuzzle mit Rangliste
- **10 Trainer**: Koordinaten, Feldfarben, Blindschach, Stellung nachbauen, hängende Figuren, „Was droht?“, Kandidatenzüge, Rechnen, Bewertung schätzen, „Rate den Meisterzug“
- **Fehlerheft** mit Spaced Repetition

## Spielen & Analysieren
- **10 Bots** (6 Stärken + 4 Persönlichkeiten), Schachuhren, Zug-Kommentare, Tipps
- **Online-Partien** per Link (Supabase Realtime, sonst Server-Abfrage)
- **Partieanalyse** mit Import von Lichess/Chess.com, Fehlermustern und Eröffnungs-Check
- **Brett-Editor**

## Varianten
- Die **10 beliebtesten Varianten** von Lichess und Chess.com: Chess960, Crazyhouse, Schlagschach (Antichess), Atomschach, Drei-Schach, König der Hügel, Horde, Königsrennen, Nebelschach (Fog of War), Entenschach (Duck Chess)
- Jede Variante gegen **5 Bots** (Küken bis Meister), eigene Regel-Engine und KI im Web Worker
- **Varianten-Werkstatt**: Idee in eigenen Worten beschreiben → der Regel-Assistent (regelbasiert, optional mit der lokalen Browser-KI von Chrome) baut daraus spielbare Regeln, inkl. Märchenfiguren (Amazone, Kanzler, Erzbischof); speichern und per Link teilen

## Fehler verstehen
Falsche Züge in Lektionen, Eröffnungstraining, Puzzles, Meisterpartien, Prüfungen und im Fehlerheft werden nicht übersprungen: Stockfish erklärt, was der Gegner antwortet, zeigt die Widerlegung zum Nachspielen und erkennt, wenn dein Zug ebenfalls gut war.

## Community (freiwillig, ohne E-Mail)
Konto mit Name + geheimem Sync-Code, Sync zwischen Geräten, Freunde per Code, Wochenliga (Bronze bis Diamant), Tages-Rangliste. Backend: Supabase; alle Zugriffe über geprüfte Datenbankfunktionen, Tabellen sind direkt nicht erreichbar.

## Entwicklung
```bash
npm install
npm run dev                # Entwicklungsserver
npm run build              # Produktions-Build nach dist/
npm run validate           # prüft alle Lektionen mit Stockfish und der Endspiel-Datenbank
npm run validate:glossary  # prüft alle Diagramme des Fachbegriffe-Hefts
```

Die Inhalte liegen als TypeScript-Daten in `src/content/`. GitHub Actions baut und prüft bei jedem Push.

## Lizenzen & Quellen
- Code: GPL-3.0-or-later
- Stockfish 19 (stockfish.js, GPL-3), Chessground (GPL-3), chess.js (BSD), Supabase JS (MIT)
- Puzzles und Eröffnungsnamen: Lichess-Datenbanken (CC0)
- Meisterpartien: PGN Mentor (Partienotationen sind gemeinfrei); alle Kommentare sind eigene Texte
