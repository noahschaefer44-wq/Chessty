import type { Explain, Level } from './types';

export interface Practice {
  id: string;
  title: string;
  level: Level;
  fen: string;
  /** 'mate' = mattsetzen, 'promote' = sicher umwandeln, 'draw' = Remis halten */
  goal: 'mate' | 'promote' | 'draw';
  /** Zugbegrenzung (eigene Züge) */
  limit: number;
  text: Explain;
}

// Übungsstellungen gegen perfekte Verteidigung (Lichess-Endspieldatenbank, offline Stockfish)
export const PRACTICE: Practice[] = [
  { id: 'kq-k', title: 'Dame + König gegen König', level: 1, goal: 'mate', limit: 20,
    fen: '8/8/8/4k3/8/8/8/3QK3 w - - 0 1',
    text: { short: 'Drück den König mit der Dame an den Rand (Springerabstand!), dann hol deinen König heran.',
      why: 'Die Dame allein kann nicht mattsetzen – der König muss helfen. Stell die Dame einen Springerzug vom gegnerischen König entfernt, so schrumpft sein Käfig bei jedem Zug.',
      pro: 'Achtung Patt: Wenn der König nur noch 2 Felder hat, NICHT weiter einengen, sondern den eigenen König bringen. Maximal 10 Züge aus jeder Stellung.' } },
  { id: 'kr-k', title: 'Turm + König gegen König', level: 1, goal: 'mate', limit: 30,
    fen: '8/8/3k4/8/8/8/8/R3K3 w - - 0 1',
    text: { short: 'Schneide den König mit dem Turm ab und bringe deinen König in Opposition.',
      why: 'Der Turm baut eine „Wand“. Mattgesetzt wird, wenn beide Könige sich gegenüberstehen (Opposition) und der Turm auf der Randlinie Schach gibt.',
      pro: 'Wartezüge mit dem Turm entlang der Linie erzwingen die Opposition. Maximal 16 Züge aus jeder Stellung.' } },
  { id: 'kbb-k', title: 'Zwei Läufer', level: 3, goal: 'mate', limit: 30,
    fen: '8/8/3k4/8/8/8/8/2B1KB2 w - - 0 1',
    text: { short: 'Die Läufer nebeneinander bilden eine Wand – treib den König in eine Ecke.',
      why: 'Mit zwei Läufern kann man in jeder Ecke mattsetzen. König und Läufer arbeiten als Team, der König muss nah heran.',
      pro: 'Maximal 19 Züge. Vorsicht vor Patt in der Ecke: lass dem König immer ein Feld, bis das Matt vorbereitet ist.' } },
  { id: 'kbn-k', title: 'Läufer + Springer', level: 4, goal: 'mate', limit: 40,
    fen: '8/8/8/4k3/8/8/8/1N2KB2 w - - 0 1',
    text: { short: 'Matt geht nur in der Ecke, die der Läufer beherrscht. Treib den König dorthin (W-Manöver).',
      why: 'Das schwerste Grundmatt. Erst den König an den Rand treiben, dann mit dem Springer-W-Manöver in die richtige Ecke schieben.',
      pro: 'Deletang-Methode: 1) an den Rand, 2) in die „falsche“ Ecke, 3) W-Manöver des Springers entlang des Randes. Maximal 33 Züge – die 50-Züge-Regel ist ein echter Gegner.' } },
  { id: 'kp-k-opp', title: 'Bauer durchbringen (Opposition)', level: 2, goal: 'promote', limit: 15,
    fen: '8/8/8/4k3/8/4K3/4P3/8 w - - 0 1',
    text: { short: 'Der König geht VOR den Bauern. Gewinne die Opposition, dann folgt der Bauer.',
      why: 'Wenn dein König ein Schlüsselfeld vor dem Bauern erreicht (hier d4, e4, f4 bzw. später die 6. Reihe), gewinnt der Bauer immer.',
      pro: 'Schlüsselfelder: Für einen Bauern auf der 2.–4. Reihe sind es die drei Felder zwei Reihen vor ihm. Achtung: e3 → Kd3/Kf3 ist hier der Test.' } },
  { id: 'kp-k-draw', title: 'Remis halten: König gegen Bauer', level: 2, goal: 'draw', limit: 15,
    fen: '8/4k3/8/4P3/4K3/8/8/8 b - - 0 1',
    text: { short: 'Stell deinen König vor den Bauern und halte die Opposition.',
      why: 'Ohne das Feld vor dem Bauern kann Weiß nicht gewinnen, wenn du richtig zurückweichst: immer direkt nach hinten (Ke8 statt Kd8/Kf8, wenn möglich).',
      pro: 'Faustregel: Wenn Weiß Opposition nimmt, weichst du ab; wenn Weiß ausweicht, nimmst du die Opposition. Am Ende steht Patt oder der Bauer fällt.' } },
  { id: 'lucena', title: 'Lucena: Brückenbau', level: 3, goal: 'promote', limit: 15,
    fen: '1K1k4/1P6/8/8/8/8/r7/5R2 w - - 0 1',
    text: { short: 'Schneide den König ab, bring den Turm auf die 4. Reihe und baue eine Brücke gegen die Schachs.',
      why: 'Der eigene König kommt aus dem Umwandlungsfeld. Gegen die Seitenschachs stellt sich der Turm auf der 4. Reihe dazwischen.',
      pro: 'Hauptlinie: 1.Td1+ Ke7 2.Td4! (Brücke) Ta1 3.Kc7 Tc1+ 4.Kb6 Tb1+ 5.Kc6 Tc1+ 6.Kb5 Tb1+ 7.Tb4. Alternative: Die Methode mit Turm auf der 5. Reihe.' } },
  { id: 'philidor', title: 'Philidor: Verteidigung auf der 3. Reihe', level: 3, goal: 'draw', limit: 20,
    fen: '3k4/R7/8/3PK3/8/8/8/7r b - - 0 1',
    text: { short: 'Halte den Turm auf der 6. Reihe, bis der Bauer vorrückt – dann Schach von hinten.',
      why: 'Solange dein Turm die 6. Reihe hält, kommt der weiße König nicht nach vorne. Zieht der Bauer auf die 6., hat der König keinen Schutz vor Schachs von hinten.',
      pro: 'Standard: 1…Th6! 2.d6 Th1! und endlose Schachs von hinten. Passive Verteidigung auf der Grundreihe (…Th8) verliert!' } },
  { id: 'kq-kp7', title: 'Dame gegen Bauer auf der 7.', level: 4, goal: 'mate', limit: 30,
    fen: '8/8/8/8/8/5K2/2kp4/7Q w - - 0 1',
    text: { short: 'Zwing den König mit Schachs vor seinen Bauern, dann hol deinen König ein Stück heran.',
      why: 'Jedes Mal, wenn der schwarze König vor dem Bauern steht, gewinnst du ein Tempo für deinen König.',
      pro: 'Gegen Läufer- und Turmbauern (c/f bzw. a/h) ist es wegen Pattideen oft remis – gegen einen d-Bauern gewinnt die Dame.' } },
];

export const practiceById = (id: string) => PRACTICE.find((p) => p.id === id);
