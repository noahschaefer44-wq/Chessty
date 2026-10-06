// Inhalte der Tarn-Ansicht: Ordner und Hefte einer Berufsschule (Fantasie-Mitschriften).

export interface Notebook {
  title: string;
  date: string;
  /** Deckblatt-Farbe (sonst Seitenvorschau) */
  cover?: string;
  /** Zeilen; „# “ = Überschrift */
  lines: string[];
}
export interface Folder {
  name: string;
  color: string;
  books: Notebook[];
}

export const FOLDERS: Folder[] = [
  {
    name: 'Lernfeld 1–4', color: '#5b8def', books: [
      { title: 'LF1 Betrieb & Ausbildung', date: '09.09.2026', lines: ['# Duales System', 'Ausbildung an zwei Lernorten: Betrieb und Berufsschule.', 'Rechtsgrundlagen: BBiG, Ausbildungsordnung, Rahmenlehrplan.', '# Rechte des Azubis', 'Vergütung, Urlaub, Zeugnis, Freistellung für die Berufsschule.', '# Pflichten', 'Lernpflicht, Weisungsgebundenheit, Berichtsheft führen, Schweigepflicht.'] },
      { title: 'LF2 Mitschrift', date: '16.09.2026', lines: ['# Aufbauorganisation', 'Stelle = kleinste organisatorische Einheit.', 'Einlinien-, Mehrlinien-, Stabliniensystem, Matrixorganisation.', 'Vorteile Einliniensystem: klare Zuständigkeiten.', 'Nachteile: lange Dienstwege.'] },
      { title: 'LF3 Arbeitsblatt Kalkulation', date: '23.09.2026', lines: ['# Zuschlagskalkulation', 'Materialeinzelkosten + Materialgemeinkosten = Materialkosten', 'Fertigungslöhne + Fertigungsgemeinkosten = Fertigungskosten', 'Herstellkosten + Verwaltungs- und Vertriebsgemeinkosten = Selbstkosten', 'Selbstkosten + Gewinn = Barverkaufspreis'] },
      { title: 'LF4 Projekt', date: '30.09.2026', cover: '#2f4a7a', lines: ['# Projektplanung', 'Ziele SMART formulieren.', 'Meilensteine, Gantt-Diagramm, kritischer Pfad.'] },
    ],
  },
  {
    name: 'Wirtschafts- und Sozialkunde', color: '#f2a93b', books: [
      { title: 'Arbeitsvertrag', date: '10.09.2026', lines: ['# Inhalte nach Nachweisgesetz', 'Name und Anschrift der Vertragsparteien', 'Beginn, Dauer, Arbeitsort, Tätigkeit', 'Arbeitszeit, Urlaub, Kündigungsfristen', '# Probezeit', 'Höchstens sechs Monate, Kündigungsfrist zwei Wochen.'] },
      { title: 'Sozialversicherung', date: '24.09.2026', lines: ['# Fünf Säulen', 'Kranken-, Pflege-, Renten-, Arbeitslosen-, Unfallversicherung.', 'Unfallversicherung zahlt nur der Arbeitgeber (Berufsgenossenschaft).', 'Beitragsbemessungsgrenze beachten!'] },
      { title: 'Tarifvertrag', date: '01.10.2026', lines: ['# Tarifautonomie', 'Gewerkschaften und Arbeitgeberverbände verhandeln ohne Staat.', 'Manteltarifvertrag vs. Lohn- und Gehaltstarifvertrag.', 'Friedenspflicht während der Laufzeit.'] },
    ],
  },
  {
    name: 'Deutsch / Kommunikation', color: '#e5604e', books: [
      { title: 'Geschäftsbrief DIN 5008', date: '11.09.2026', lines: ['# Aufbau', 'Briefkopf, Anschriftfeld, Informationsblock, Betreff, Anrede, Text, Gruß, Anlagen.', 'Betreff ohne das Wort „Betreff“, fett möglich.', 'Datum: TT.MM.JJJJ oder JJJJ-MM-TT.'] },
      { title: 'Erörterung', date: '25.09.2026', lines: ['# Lineare Erörterung', 'Einleitung – Hauptteil mit Argumenten (steigernd) – Schluss.', 'Argument = Behauptung + Begründung + Beispiel.'] },
    ],
  },
  {
    name: 'Englisch', color: '#4fb07a', books: [
      { title: 'Business Letters', date: '12.09.2026', lines: ['# Opening', 'Dear Mr Smith, / Dear Sir or Madam,', '# Closing', 'Yours sincerely (name known) / Yours faithfully (name unknown)', 'Please do not hesitate to contact us.'] },
      { title: 'Vocabulary Unit 3', date: '26.09.2026', lines: ['invoice – Rechnung', 'delivery note – Lieferschein', 'to place an order – eine Bestellung aufgeben', 'complaint – Reklamation', 'warehouse – Lager'] },
    ],
  },
  {
    name: 'Mathematik', color: '#8c6bd6', books: [
      { title: 'Prozentrechnung', date: '15.09.2026', lines: ['# Grundformel', 'Prozentwert = Grundwert · Prozentsatz / 100', 'Vermehrter Grundwert: G · (1 + p/100)', 'Verminderter Grundwert: G · (1 − p/100)'] },
      { title: 'Dreisatz', date: '29.09.2026', lines: ['# Proportional', '3 kg kosten 7,50 € → 1 kg 2,50 € → 5 kg 12,50 €', '# Antiproportional', '4 Arbeiter brauchen 6 Tage → 1 Arbeiter 24 Tage → 3 Arbeiter 8 Tage'] },
    ],
  },
  {
    name: 'Politik', color: '#7a8a99', books: [
      { title: 'Grundgesetz', date: '17.09.2026', lines: ['# Artikel 1–19', 'Grundrechte: Menschenwürde, freie Entfaltung, Gleichheit …', '# Staatsprinzipien (Art. 20)', 'Demokratie, Rechtsstaat, Sozialstaat, Bundesstaat, Republik.'] },
    ],
  },
  {
    name: 'Prüfungsvorbereitung', color: '#3fb6c4', books: [
      { title: 'Zwischenprüfung Altfragen', date: '02.10.2026', cover: '#1f6f78', lines: ['# Fragen 1–20', '1. Welche Aufgaben hat der Betriebsrat?', '2. Was regelt das Jugendarbeitsschutzgesetz?', '3. Unterschied Kündigung und Aufhebungsvertrag?'] },
      { title: 'Lernplan', date: '04.10.2026', lines: ['Mo: LF2 wiederholen', 'Di: WiSo Sozialversicherung', 'Mi: Mathe Dreisatz Übungen', 'Do: Englisch Vokabeln', 'Fr: Altfragen'] },
    ],
  },
  {
    name: 'Berichtsheft', color: '#b5855a', books: [
      { title: 'KW 39', date: '27.09.2026', lines: ['Montag: Wareneingang geprüft, Lieferscheine abgeglichen', 'Dienstag: Kundengespräch begleitet', 'Mittwoch–Donnerstag: Berufsschule', 'Freitag: Inventurliste vorbereitet'] },
      { title: 'KW 40', date: '04.10.2026', lines: ['Montag: Angebote verglichen', 'Dienstag: Bestellung im System angelegt', 'Mittwoch–Donnerstag: Berufsschule', 'Freitag: Ablage und Rechnungsprüfung'] },
    ],
  },
];
