import type { Explain, Lesson, Level, Step } from '../types';

interface Note {
  prompt: string;
  success: string;
  why?: string;
  mistakes?: { san: string; text: string; soft?: boolean }[];
}

/**
 * Eröffnungslektion aus einer Zugfolge: Für jeden eigenen Zug gibt es eine Aufgabe (Notiz),
 * die Antwort des Gegners wird automatisch gespielt. Spielt der Lernende Schwarz, wird der erste weiße Zug vorgespielt.
 */
function opening(o: {
  id: string; title: string; level: Level; color: 'white' | 'black'; summary: string; intro: Explain;
  moves: string[]; notes: Note[]; outro: Explain; takeaways: string[]; pitfalls: string[]; drillName: string; drillExtra?: string[];
}): Lesson {
  const steps: Step[] = [{ kind: 'info', title: o.title, text: o.intro, ...(o.color === 'black' ? { play: [o.moves[0]] } : {}) }];
  const first = o.color === 'white' ? 0 : 1;
  o.notes.forEach((n, k) => {
    const i = first + 2 * k;
    steps.push({
      kind: 'move',
      title: `${Math.floor(i / 2) + 1}. Zug`,
      prompt: { short: n.prompt, ...(n.why ? { why: n.why } : {}) },
      solution: [o.moves[i]],
      ...(o.moves[i + 1] ? { reply: o.moves[i + 1] } : {}),
      success: { short: n.success },
      ...(n.mistakes ? { mistakes: n.mistakes.map((m) => ({ san: m.san, soft: m.soft, text: { short: m.text } })) } : {}),
    });
  });
  steps.push({ kind: 'info', title: 'Pläne und typische Fehler', text: o.outro });
  return {
    id: o.id, title: o.title, category: 'eroeffnungen', level: o.level, summary: o.summary,
    orientation: o.color, steps, takeaways: o.takeaways, pitfalls: o.pitfalls,
    drill: [{ name: o.drillName, color: o.color, moves: [...o.moves, ...(o.drillExtra ?? [])] }],
  };
}

export const eroeffnungen3: Lesson[] = [
  opening({
    id: 'o-wiener', title: 'Wiener Partie', level: 1, color: 'white', drillName: 'Wiener Gambit',
    summary: 'Sc3 statt Sf3, dann der Vorstoß f4 – ein Angriffsklassiker für Einsteiger.',
    intro: { short: 'In der Wiener Partie entwickelt Weiß zuerst den Damenspringer und bereitet f4 vor. Das öffnet die f-Linie für einen schnellen Angriff.', why: 'Der Springer auf c3 deckt e4 und lässt den f-Bauern frei laufen – anders als nach Sf3.' },
    moves: ['e4', 'e5', 'Nc3', 'Nf6', 'f4', 'd5', 'fxe5', 'Nxe4', 'Nf3', 'Be7', 'd4', 'O-O', 'Bd3'],
    notes: [
      { prompt: 'Beginne mit dem Königsbauern.', success: '1.e4 e5.' },
      { prompt: 'Entwickle den Springer – aber den, der den f-Bauern nicht blockiert.', success: '2.Sc3 – die Wiener Partie.', mistakes: [{ san: 'Nf3', soft: true, text: 'Auch gut (dann Spanisch, Italienisch usw.), aber der Springer blockiert den f-Bauern.' }] },
      { prompt: 'Jetzt der typische Vorstoß: Greif e5 mit einem Bauern an!', success: '3.f4 – das Wiener Gambit. Schwarz kontert im Zentrum mit …d5.', why: 'Nimmt Schwarz auf f4, bekommt Weiß ein starkes Zentrum mit d4.' },
      { prompt: 'Nimm den Bauern e5 und vertreibe später den Springer f6.', success: '4.fxe5 Sxe4 – Schwarz besetzt e4 aktiv.' },
      { prompt: 'Entwickle eine Figur, die e5 deckt und zur Rochade beiträgt.', success: '5.Sf3 – solide. Weiß deckt e5 und bereitet die Rochade vor.' },
      { prompt: 'Baue das Zentrum aus.', success: '6.d4 – Weiß hat mehr Raum, Schwarz einen aktiven Springer.' },
      { prompt: 'Greife den Springer e4 an und entwickle den Läufer.', success: '7.Ld3 – der Springer auf e4 wird vertrieben oder getauscht, danach rochiert Weiß.' },
    ],
    outro: { short: 'Pläne: Rochade kurz, Turm auf die halboffene f-Linie, Angriff am Königsflügel mit Dame und Leichtfiguren.', why: 'Typischer Fehler: zu früh Dh5 spielen. Der Angriff braucht erst alle Figuren.' },
    takeaways: ['2.Sc3 hält den f-Bauern frei.', '3.f4 öffnet die f-Linie.', 'Erst entwickeln, dann angreifen.'],
    pitfalls: ['Dame zu früh ins Spiel bringen.', 'Rochade vergessen, während die e-Linie aufgeht.'],
  }),
  opening({
    id: 'o-vierspringer', title: 'Vierspringerspiel', level: 1, color: 'white', drillName: 'Spanisches Vierspringerspiel',
    summary: 'Alle vier Springer kommen heraus – die einfachste Eröffnung nach den Grundprinzipien.',
    intro: { short: 'Beide Seiten entwickeln zuerst ihre Springer. Das Vierspringerspiel ist ruhig, aber voller Fallen für den, der die Prinzipien vergisst.', why: 'Springer vor Läufer, Rochade, Zentrum – hier lernst du die Prinzipien in Reinform.' },
    moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Nc3', 'Nf6', 'Bb5', 'Bb4', 'O-O', 'O-O', 'd3', 'd6', 'Bg5'],
    notes: [
      { prompt: 'Beginne mit dem Königsbauern.', success: '1.e4 e5.' },
      { prompt: 'Entwickle mit Angriff auf e5.', success: '2.Sf3 Sc6.' },
      { prompt: 'Bring den zweiten Springer.', success: '3.Sc3 Sf6 – das Vierspringerspiel.' },
      { prompt: 'Fessle den Springer c6 wie in der Spanischen Partie.', success: '4.Lb5 – Schwarz antwortet symmetrisch mit 4…Lb4.', mistakes: [{ san: 'Nxe5', soft: true, text: 'Das Springergambit-Prinzip: Nach Sxe5 Sxe5 d4 bekommt Weiß den Bauern zurück, aber Schwarz steht gut. Erst entwickeln!' }] },
      { prompt: 'Bring den König in Sicherheit.', success: '5.O-O O-O.' },
      { prompt: 'Öffne den Läufer c1 mit einem bescheidenen Bauernzug.', success: '6.d3 d6 – symmetrisch.' },
      { prompt: 'Fessle nun den Springer f6 an die Dame.', success: '7.Lg5 – ein typischer Plan: Lxf6 zerstört die Bauernstruktur vor dem schwarzen König.' },
    ],
    outro: { short: 'Typisch: Lxc6 und Lxf6, um Doppelbauern zu erzeugen; dann Sd5 und Angriff mit f4.', why: 'Fehler in symmetrischen Stellungen: einfach immer nachahmen. Irgendwann greift die Seite am Zug zuerst an!' },
    takeaways: ['Springer vor Läufer.', 'Fesselungen mit Lb5/Lg5.', 'Symmetrie nicht blind fortsetzen.'],
    pitfalls: ['Gedankenloses Nachmachen der gegnerischen Züge.', 'Zu frühes Sxe5 ohne Entwicklung.'],
  }),
  opening({
    id: 'o-pirc', title: 'Pirc-Verteidigung', level: 2, color: 'black', drillName: 'Pirc klassisch',
    summary: 'Schwarz lässt Weiß das Zentrum – und greift es später mit Läufer g7 und Bauernhebeln an.',
    intro: { short: 'Weiß hat 1.e4 gespielt. In der Pirc baut Schwarz flexibel auf: …d6, …Sf6, …g6, …Lg7 und Rochade.', why: 'Die Idee der „hypermodernen“ Schule: Das Zentrum nicht sofort besetzen, sondern aus der Ferne kontrollieren und später angreifen.' },
    moves: ['e4', 'd6', 'd4', 'Nf6', 'Nc3', 'g6', 'Nf3', 'Bg7', 'Be2', 'O-O', 'O-O', 'c6', 'a4'],
    notes: [
      { prompt: 'Antworte mit einem bescheidenen Bauernzug, der e5 kontrolliert.', success: '1…d6 2.d4 – Weiß nimmt das ganze Zentrum.' },
      { prompt: 'Entwickle mit Angriff auf e4.', success: '2…Sf6 3.Sc3 – e4 ist gedeckt.' },
      { prompt: 'Bereite den Läufer auf der langen Diagonale vor.', success: '3…g6 4.Sf3.' },
      { prompt: 'Stell den Läufer auf die lange Diagonale.', success: '4…Lg7 – der Läufer zielt auf das weiße Zentrum.' },
      { prompt: 'Bring den König in Sicherheit.', success: '5…O-O 6.O-O.' },
      { prompt: 'Bereite …b5 oder …d5 vor und gib der Dame das Feld c7 bzw. a5.', success: '6…c6 – flexibel. Weiß verhindert mit a4 das …b5.' },
    ],
    outro: { short: 'Pläne für Schwarz: …Lg4 und …Sbd7, dann …e5 oder …d5 als Zentrumshebel; …b5 am Damenflügel.', why: 'Gefahr: Gegen den „Österreichischen Angriff“ mit f4 muss Schwarz schnell im Zentrum zurückschlagen (…c5 oder …e5).' },
    takeaways: ['Hypermodern: Zentrum aus der Ferne angreifen.', 'Lg7 ist die wichtigste Figur.', 'Zentrumshebel …e5/…c5 nicht vergessen.'],
    pitfalls: ['Zu passiv bleiben, bis Weiß mit e5 alles erdrückt.', 'Den Läufer g7 gegen einen Springer tauschen.'],
  }),
  opening({
    id: 'o-alapin', title: 'Sizilianisch: Alapin-Variante', level: 2, color: 'white', drillName: 'Alapin mit 2…Sf6',
    summary: 'Gegen Sizilianisch mit 2.c3: Weiß baut mit d4 ein Bauernzentrum, ohne viel Theorie.',
    intro: { short: 'Viele Spieler fürchten die riesige Sizilianisch-Theorie. 2.c3 bereitet einfach d4 vor – ein ruhiger, gesunder Plan.', why: 'Nach …cxd4 schlägt Weiß mit dem c-Bauern zurück und hat zwei Bauern im Zentrum.' },
    moves: ['e4', 'c5', 'c3', 'Nf6', 'e5', 'Nd5', 'd4', 'cxd4', 'Nf3', 'Nc6', 'cxd4', 'd6', 'Bc4', 'Nb6', 'Bb5'],
    notes: [
      { prompt: 'Beginne mit dem Königsbauern.', success: '1.e4 c5 – Sizilianisch.' },
      { prompt: 'Bereite d4 mit einem Bauernzug vor.', success: '2.c3 – die Alapin-Variante. Schwarz greift sofort e4 an.' },
      { prompt: 'Der Bauer e4 hängt. Weiche mit Raumgewinn aus.', success: '3.e5 Sd5 – der Springer steht zentral, kann aber vertrieben werden.' },
      { prompt: 'Baue das Zentrum aus.', success: '4.d4 cxd4.' },
      { prompt: 'Entwickle zuerst, bevor du zurückschlägst.', success: '5.Sf3 Sc6 – Weiß schlägt gleich mit dem Bauern zurück.' },
      { prompt: 'Schlag zurück und stelle das Bauernzentrum her.', success: '6.cxd4 d6 – Schwarz greift e5 an.' },
      { prompt: 'Entwickle den Läufer mit Angriff auf den Springer d5.', success: '7.Lc4 Sb6.' },
      { prompt: 'Fessle den Springer c6.', success: '8.Lb5 – Weiß hält e5 und entwickelt schnell. Eine gesunde, aktive Stellung.' },
    ],
    outro: { short: 'Pläne: Rochade, Sc3, Le3 oder Lf4, Druck auf e5 aushalten oder exd6 zur rechten Zeit.', why: 'Fehler: den Isolani auf d4 nach Abtauschen nicht aktiv spielen – er braucht Figuren hinter sich.' },
    takeaways: ['2.c3 bereitet d4 vor.', 'Gegen …Sf6: e5 mit Tempo.', 'Mit dem c-Bauern zurückschlagen = Bauernzentrum.'],
    pitfalls: ['e4 einfach hängen lassen.', 'Zu früh Db3 – oft verliert man Zeit.'],
  }),
  opening({
    id: 'o-philidor', title: 'Philidor-Verteidigung', level: 1, color: 'black', drillName: 'Hanham-Aufbau',
    summary: 'Solide und einfach: …d6 deckt e5, Schwarz baut eine feste Festung auf.',
    intro: { short: 'Weiß spielt 1.e4. Mit 1…e5 und 2…d6 deckt Schwarz e5 durch einen Bauern statt durch einen Springer. Der Hanham-Aufbau (…Sbd7, …Le7, …c6) ist eng, aber sehr stabil.', why: 'Gut für Einsteiger, die eine feste Stellung ohne viel Theorie wollen. Aber Vorsicht: das Légal-Matt lauert, wenn man …Lg4 falsch spielt!' },
    moves: ['e4', 'e5', 'Nf3', 'd6', 'd4', 'Nf6', 'Nc3', 'Nbd7', 'Bc4', 'Be7', 'O-O', 'O-O', 'Re1', 'c6'],
    notes: [
      { prompt: 'Antworte symmetrisch im Zentrum.', success: '1…e5 2.Sf3 – e5 ist angegriffen.' },
      { prompt: 'Decke e5 mit einem Bauern.', success: '2…d6 – die Philidor-Verteidigung. Weiß spielt d4.', mistakes: [{ san: 'f6', text: 'Damiano-Verteidigung: 3.Sxe5! fxe5 4.Dh5+ ist sehr gefährlich für Schwarz. f6 schwächt den König.' }] },
      { prompt: 'Greif e4 an und entwickle.', success: '3…Sf6 4.Sc3.' },
      { prompt: 'Halte e5 mit einem Springer, der nicht blockiert wird.', success: '4…Sbd7 – der Hanham-Aufbau. e5 ist dreifach gedeckt.' },
      { prompt: 'Entwickle den Königsläufer bescheiden.', success: '5…Le7 6.O-O.' },
      { prompt: 'Rochade!', success: '6…O-O 7.Te1.' },
      { prompt: 'Gib der Dame Raum und bereite …b5 vor.', success: '7…c6 – Schwarz steht eng, aber fest. Pläne: …b5, …Db6, …Te8, …Lf8.' },
    ],
    outro: { short: 'Pläne: Raum am Damenflügel mit …b5, dann …Lb7 und …exd4 zur rechten Zeit, um Linien zu öffnen.', why: 'Häufigster Fehler: …Lg4 mit Fesselung und danach den Bauern e5 vergessen (Légal-Matt!).' },
    takeaways: ['…d6 deckt e5 mit einem Bauern.', 'Hanham: …Sbd7, …Le7, …c6.', 'Nie …f6 zur Deckung von e5.'],
    pitfalls: ['Damiano (…f6).', 'Légal-Matt nach …Lg4.'],
  }),
  opening({
    id: 'o-katalanisch', title: 'Katalanische Eröffnung', level: 3, color: 'white', drillName: 'Katalanisch offen',
    summary: 'Damengambit mit Fianchetto: Der Läufer g2 übt langfristigen Druck auf den Damenflügel aus.',
    intro: { short: 'Katalanisch verbindet d4/c4 mit einem Läufer auf g2. Weiß opfert manchmal den Bauern c4, um ihn später mit Druck zurückzugewinnen.', why: 'Lieblingseröffnung vieler Weltmeister (Kramnik, Carlsen): wenig Risiko, langer Druck.' },
    moves: ['d4', 'Nf6', 'c4', 'e6', 'g3', 'd5', 'Bg2', 'Be7', 'Nf3', 'O-O', 'O-O', 'dxc4', 'Qc2', 'a6', 'Qxc4', 'b5', 'Qc2', 'Bb7'],
    notes: [
      { prompt: 'Beginne mit dem Damenbauern.', success: '1.d4 Sf6.' },
      { prompt: 'Kontrolliere d5 mit dem c-Bauern.', success: '2.c4 e6.' },
      { prompt: 'Bereite das Fianchetto des Königsläufers vor.', success: '3.g3 d5 – Katalanisch.' },
      { prompt: 'Stell den Läufer auf die lange Diagonale.', success: '4.Lg2 Le7.' },
      { prompt: 'Entwickle den Königsspringer.', success: '5.Sf3 O-O.' },
      { prompt: 'Rochade.', success: '6.O-O dxc4 – Schwarz nimmt den Bauern.' },
      { prompt: 'Hol den Bauern zurück – die Dame greift c4 an.', success: '7.Dc2 a6 – Schwarz will mit …b5 halten.', why: 'Der Läufer g2 macht …b5 unbequem: Die lange Diagonale zielt auf a8.' },
      { prompt: 'Nimm den Bauern zurück.', success: '8.Dxc4 b5.' },
      { prompt: 'Weiche mit der Dame aus und halte die Diagonale im Blick.', success: '9.Dc2 Lb7 – Hauptvariante. Weiß spielt Lg5, Td1 und Druck auf c-Linie und Diagonale.' },
    ],
    outro: { short: 'Pläne: Lg5 oder Lf4, Td1, Sbd2–b3, Druck auf c7 und die lange Diagonale.', why: 'Fehler: den Bauern c4 nie zurückholen. Ohne Bauernausgleich ist das Gambit ein Geschenk.' },
    takeaways: ['Lg2 = langfristiger Druck.', 'Bauer c4 kommt meistens zurück.', 'Ruhiger Aufbau, wenig Risiko.'],
    pitfalls: ['Zu früh Se5 ohne Unterstützung.', 'Den Bauern c4 vergessen.'],
  }),
  opening({
    id: 'o-gruenfeld', title: 'Grünfeld-Indische Verteidigung', level: 3, color: 'black', drillName: 'Grünfeld Abtauschvariante',
    summary: 'Schwarz lässt Weiß ein großes Zentrum bauen – und greift es mit Läufer g7 und …c5 an.',
    intro: { short: 'Weiß hat 1.d4 gespielt. In der Grünfeld-Verteidigung tauscht Schwarz auf d5 und c3 ab und attackiert dann das weiße Bauernzentrum.', why: 'Hochdynamisch: Weiß hat das Zentrum, Schwarz die aktiveren Figuren. Gespielt von Kasparow, Carlsen und Svidler.' },
    moves: ['d4', 'Nf6', 'c4', 'g6', 'Nc3', 'd5', 'cxd5', 'Nxd5', 'e4', 'Nxc3', 'bxc3', 'Bg7', 'Bc4', 'c5', 'Ne2', 'Nc6', 'Be3', 'O-O'],
    notes: [
      { prompt: 'Entwickle den Königsspringer.', success: '1…Sf6 2.c4.' },
      { prompt: 'Bereite das Fianchetto vor.', success: '2…g6 3.Sc3.' },
      { prompt: 'Jetzt der Grünfeld-Zug: Stelle einen Bauern ins Zentrum.', success: '3…d5 – Grünfeld! Weiß tauscht auf d5.', mistakes: [{ san: 'Bg7', soft: true, text: 'Das ist Königsindisch – auch gut, aber eine ganz andere Eröffnung.' }] },
      { prompt: 'Schlag zurück.', success: '4…Sxd5 5.e4 – der Springer wird angegriffen.' },
      { prompt: 'Tausche die Springer.', success: '5…Sxc3 6.bxc3 – Weiß hat ein mächtiges Zentrum.' },
      { prompt: 'Stell den Läufer auf die lange Diagonale.', success: '6…Lg7 – er zielt auf d4 und c3.' },
      { prompt: 'Greif das Zentrum mit einem Bauernhebel an.', success: '7…c5 – der typische Grünfeld-Hebel gegen d4.' },
      { prompt: 'Erhöhe den Druck auf d4.', success: '8…Sc6 9.Le3.' },
      { prompt: 'Rochade!', success: '9…O-O – Hauptstellung. Pläne: …Lg4, …Sa5, …cxd4, Druck auf d4 und c3.' },
    ],
    outro: { short: 'Pläne für Schwarz: …cxd4, …Lg4, …Da5 und Turm nach d8 – alles gegen d4. Weiß will d5 vorstoßen oder am Königsflügel angreifen.', why: 'Fehler: das weiße Zentrum nie angreifen. Dann erdrückt es Schwarz.' },
    takeaways: ['…d5, Tausch auf c3, …Lg7, …c5.', 'Druck auf d4 ist das Ziel.', 'Dynamik statt Raum.'],
    pitfalls: ['Passiv bleiben.', 'Den Läufer g7 tauschen.'],
  }),
];
