# Chessty

Kostenlose, interaktive Schach-Lern-App (PWA, offline nutzbar) – vom Einsteiger bis zum Meister.

**Live:** https://chessty.netlify.app

## Inhalte
- **Lernpfad** (Duolingo-Stil) mit XP, Serie, Tagesziel und Stufen
- **36 Lektionen** in Grundlagen, Taktik, Strategie, Eröffnungen, Endspiele – jede Erklärung in drei Tiefen (Kurz / Warum? / Profi), mit Pfeilen, typischen Fehlern und „Warum nicht …?“-Engine-Modus
- **Taktik-Training**: 30 Motive × 4 Stufen aus der Lichess-Puzzle-Datenbank, **max. 10 Puzzles pro Runde**, Puzzle-Rush
- **Eröffnungen**: 9 Eröffnungslektionen mit Fallen, Varianten-Training und Explorer (3.800 benannte Varianten)
- **Endspiel-Praxis** gegen perfekte Verteidigung (Lichess-Tablebase, offline Stockfish)
- **9 Meisterpartien** (Morphy, Anderssen, Fischer, Tal, Kasparow, Capablanca) mit „Finde den Zug“
- **6 Bots** (Stockfish 19 mit Stärkestufen), **Partieanalyse** mit Erklärungen in einfacher Sprache
- **Fehlerheft** mit Spaced Repetition

## Entwicklung
```bash
npm install
npm run dev        # Entwicklungsserver
npm run build      # Produktions-Build nach dist/
npm run validate   # prüft alle Lektionen mit Stockfish und der Endspiel-Datenbank
```

Die Lektionen liegen als TypeScript-Daten in `src/content/` und können ohne Programmierkenntnisse erweitert werden.

## Lizenzen & Quellen
- Code: GPL-3.0-or-later
- Stockfish 19 (stockfish.js, GPL-3), Chessground (GPL-3), chess.js (BSD)
- Puzzles und Eröffnungsnamen: Lichess-Datenbanken (CC0)
- Meisterpartien: PGN Mentor (Partienotationen sind gemeinfrei); alle Kommentare sind eigene Texte
