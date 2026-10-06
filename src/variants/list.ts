import { BASE_RULES, type Rules } from './engine';

export interface VariantInfo {
  rules: Rules;
  short: string;
  rules_text: string[];
  tip: string;
  /** Wo die Variante online beliebt ist */
  where: string;
}

const v = (r: Partial<Rules> & { id: string; name: string }): Rules => ({ ...BASE_RULES, ...r });

// Auswahl: die meistgespielten Varianten auf Lichess und Chess.com
// (Lichess: Antichess, Crazyhouse, Chess960, Atomic, Drei-Schach, King of the Hill, Horde, Racing Kings;
//  Chess.com zusätzlich: Fog of War und Duck Chess). Tandem (Bughouse) braucht vier Spieler und fehlt deshalb.
export const VARIANTS: VariantInfo[] = [
  {
    rules: v({ id: 'chess960', name: 'Chess960', setup: '960' }),
    short: 'Fischers Zufallsschach: Die Figuren der Grundreihe werden gemischt – Eröffnungstheorie hilft nicht mehr.',
    rules_text: [
      'Die Grundreihe wird zufällig gemischt (960 Möglichkeiten), Schwarz spiegelt Weiß.',
      'Die Läufer stehen auf verschiedenfarbigen Feldern, der König zwischen den Türmen.',
      'Rochade: König und Turm landen auf denselben Feldern wie im normalen Schach (g1/f1 bzw. c1/d1).',
      'Sonst gelten alle normalen Regeln.',
    ],
    tip: 'Entwickle schnell, sichere den König durch Rochade und achte auf ungeschützte Bauern – viele Stellungen haben frühe Angriffe.',
    where: 'Lichess und Chess.com, Weltmeisterschaften seit 2019',
  },
  {
    rules: v({ id: 'crazyhouse', name: 'Crazyhouse', drops: true }),
    short: 'Geschlagene Figuren wechseln die Seite und dürfen als eigener Zug wieder eingesetzt werden.',
    rules_text: [
      'Schlägst du eine Figur, kommt sie in deine Reserve (in deiner Farbe).',
      'Statt zu ziehen, darfst du eine Reservefigur auf ein beliebiges leeres Feld setzen.',
      'Bauern dürfen nicht auf die 1. oder 8. Reihe gesetzt werden.',
      'Umgewandelte Figuren werden beim Schlagen wieder zu Bauern.',
      'Gewonnen wird durch Schachmatt.',
    ],
    tip: 'Material ist nie weg! Königssicherheit ist wichtiger als im normalen Schach – eingesetzte Springer und Damen führen schnell zum Matt.',
    where: 'Lichess (eine der zwei beliebtesten Varianten), Chess.com',
  },
  {
    rules: v({ id: 'antichess', name: 'Schlagschach', kingSafety: false, forcedCapture: true, antichess: true, castling: false, promo: ['q', 'r', 'b', 'n', 'k'] }),
    short: 'Antichess: Wer zuerst alle Figuren verliert, gewinnt. Schlagen ist Pflicht!',
    rules_text: [
      'Kannst du schlagen, musst du schlagen (bei mehreren Möglichkeiten darfst du wählen).',
      'Der König ist eine normale Figur: kein Schach, keine Rochade, er darf geschlagen werden.',
      'Bauern dürfen auch in einen König umwandeln.',
      'Gewonnen hat, wer keine Figuren mehr hat – oder keinen Zug mehr machen kann.',
    ],
    tip: 'Zwinge den Gegner, deine Figuren zu schlagen, und vermeide Stellungen, in denen er dir viele Figuren „aufdrängen“ kann.',
    where: 'Lichess (nach normalem Schach die meistgespielte Variante)',
  },
  {
    rules: v({ id: 'atomic', name: 'Atomschach', atomic: true }),
    short: 'Jeder Schlagzug löst eine Explosion aus – alle Figuren außer Bauern im Umkreis verschwinden.',
    rules_text: [
      'Beim Schlagen explodieren die schlagende Figur und alle Nicht-Bauern auf den 8 Nachbarfeldern.',
      'Der König darf nicht schlagen. Bringt ein Schlagzug den eigenen König zur Explosion, ist er verboten.',
      'Wessen König explodiert, der verliert – auch ohne Schachmatt.',
      'Stehen die Könige nebeneinander, gibt es kein Schach.',
    ],
    tip: 'Ein Schlagzug neben dem gegnerischen König gewinnt sofort. Halte deinen König nah am gegnerischen – dort ist er sicher.',
    where: 'Lichess, Chess.com',
  },
  {
    rules: v({ id: 'threecheck', name: 'Drei-Schach', checksToWin: 3 }),
    short: 'Wer dem Gegner dreimal Schach gibt, gewinnt – oder normal durch Schachmatt.',
    rules_text: ['Jedes Schachgebot zählt. Nach dem dritten ist die Partie gewonnen.', 'Schachmatt gewinnt natürlich auch.', 'Sonst normale Regeln.'],
    tip: 'Öffne früh Linien zum König und halte deine eigene Königsstellung dicht. Ein Figurenopfer für zwei Schachs lohnt sich oft.',
    where: 'Lichess, Chess.com (3-Check)',
  },
  {
    rules: v({ id: 'koth', name: 'König der Hügel', hill: true }),
    short: 'King of the Hill: Wer seinen König ins Zentrum (d4, e4, d5, e5) bringt, gewinnt.',
    rules_text: ['Erreicht dein König eines der vier Zentrumsfelder, gewinnst du sofort.', 'Schachmatt gewinnt ebenfalls.', 'Sonst normale Regeln.'],
    tip: 'Kontrolliere das Zentrum mit Bauern und Figuren – dann ist der Weg für den eigenen König frei, für den gegnerischen versperrt.',
    where: 'Lichess, Chess.com',
  },
  {
    rules: v({ id: 'horde', name: 'Horde', setup: 'rnbqkbnr/pppppppp/8/1PP2PP1/PPPPPPPP/PPPPPPPP/PPPPPPPP/PPPPPPPP w' }),
    short: 'Weiß hat 36 Bauern und keinen König, Schwarz eine normale Armee.',
    rules_text: [
      'Weiß gewinnt durch Schachmatt gegen Schwarz.',
      'Schwarz gewinnt, wenn alle weißen Figuren geschlagen sind.',
      'Weiße Bauern auf der 1. Reihe dürfen ebenfalls zwei Felder ziehen.',
    ],
    tip: 'Als Weiß: Bauernketten geschlossen halten und in Gruppen vorrücken. Als Schwarz: Lücken aufreißen und Bauern einzeln abholen.',
    where: 'Lichess, Chess.com',
  },
  {
    rules: v({ id: 'racingkings', name: 'Königsrennen', setup: '8/8/8/8/8/8/krbnNBRK/qrbnNBRQ w', race: true, castling: false }),
    short: 'Racing Kings: Wer seinen König zuerst auf die 8. Reihe bringt, gewinnt. Schach geben ist verboten!',
    rules_text: [
      'Beide Könige laufen nach oben zur 8. Reihe.',
      'Kein Zug darf Schach geben, und kein König darf ins Schach ziehen.',
      'Erreicht Weiß die 8. Reihe und Schwarz schafft es im direkt folgenden Zug auch, ist es Remis.',
    ],
    tip: 'Blockiere mit deinen Figuren die Felder vor dem gegnerischen König – du darfst ihm zwar kein Schach geben, aber Felder wegnehmen.',
    where: 'Lichess',
  },
  {
    rules: v({ id: 'fog', name: 'Nebelschach', fog: true, kingSafety: false }),
    short: 'Fog of War: Du siehst nur die Felder, die deine Figuren erreichen können.',
    rules_text: [
      'Gegnerische Figuren sind nur sichtbar, wenn eine deiner Figuren sie erreichen kann.',
      'Es gibt kein Schach: Man darf den König ins Schach stellen – und ihn schlagen.',
      'Wer den König schlägt, gewinnt.',
    ],
    tip: 'Schütze deinen König auch vor unsichtbaren Angreifern und rechne mit Überraschungen auf langen Diagonalen. (Die Bots sehen durch den Nebel.)',
    where: 'Chess.com (zeitweise die beliebteste Variante dort)',
  },
  {
    rules: v({ id: 'duck', name: 'Entenschach', duck: true, kingSafety: false, stalemateWins: true }),
    short: 'Duck Chess: Nach jedem Zug setzt du die Ente auf ein leeres Feld – sie blockiert für alle.',
    rules_text: [
      'Nach deinem Figurenzug musst du die Ente auf ein anderes leeres Feld setzen.',
      'Niemand kann auf oder über die Ente ziehen, sie kann nicht geschlagen werden.',
      'Es gibt kein Schach: Wer den König schlägt, gewinnt.',
      'Wer keinen Zug mehr hat (Patt), gewinnt.',
    ],
    tip: 'Nutze die Ente zum Blockieren gegnerischer Angriffe auf deinen König – oder um seine Fluchtfelder zu versperren.',
    where: 'Chess.com (Duck Chess), sehr beliebt seit 2022',
  },
  {
    rules: v({ id: 'losalamos', name: 'Los Alamos (6×6)', setup: 'rnqknr/pppppp/6/6/PPPPPP/RNQKNR w', castling: false, pawnDouble: false, promo: ['q', 'r', 'n'] }),
    short: 'Schach auf 6×6 Feldern ohne Läufer – 1956 die erste Schachvariante, die ein Computer gespielt hat.',
    rules_text: [
      'Brett 6×6, keine Läufer, keine Rochade, kein Bauern-Doppelschritt, kein en passant.',
      'Bauern wandeln in Dame, Turm oder Springer um.',
      'Sonst normale Regeln: Gewonnen wird durch Schachmatt.',
    ],
    tip: 'Auf dem kleinen Brett ist alles nah: Schon nach wenigen Zügen greifen Figuren den König an. Rechne jede Drohung durch.',
    where: 'MANIAC-Computer in Los Alamos, 1956',
  },
  {
    rules: v({ id: 'capablanca', name: 'Capablanca-Schach (10×8)', setup: 'rnhbqkbcnr/pppppppppp/10/10/10/10/PPPPPPPPPP/RNHBQKBCNR w', promo: ['q', 'c', 'h', 'r', 'b', 'n'] }),
    short: 'Ex-Weltmeister Capablancas Idee: breiteres Brett mit Kanzler (Turm + Springer) und Erzbischof (Läufer + Springer).',
    rules_text: [
      'Brett 10×8. Neu: Kanzler (Turm + Springer) auf h1 und Erzbischof (Läufer + Springer) auf c1.',
      'Rochade: Der König zieht drei Felder nach i1 bzw. c1, der Turm springt daneben.',
      'Bauern wandeln auch in Kanzler oder Erzbischof um.',
    ],
    tip: 'Kanzler und Erzbischof sind fast so stark wie eine Dame. Achte auf Springergabeln aus dem Nichts.',
    where: 'Erfunden von José Raúl Capablanca (1920er), Gothic Chess',
  },
  {
    rules: v({ id: 'grand', name: 'Grand Chess (10×10)', setup: 'r8r/1nbqkchbn1/pppppppppp/10/10/10/10/PPPPPPPPPP/1NBQKCHBN1/R8R w', castling: false, promo: ['q', 'c', 'h', 'r', 'b', 'n'] }),
    short: 'Großes Brett, große Armee: zehn Bauern, Kanzler, Erzbischof und Türme in den Ecken der Grundreihe.',
    rules_text: [
      'Brett 10×10. Die Türme stehen auf der 1. Reihe, alle anderen Figuren eine Reihe davor.',
      'Keine Rochade. Bauern dürfen aus der Startreihe zwei Felder ziehen.',
      'Vereinfachung: Umwandlung nur auf der letzten Reihe (im Original schon ab der 8.).',
    ],
    tip: 'Die Türme sind von Anfang an aktiv – öffne früh eine Linie für sie.',
    where: 'Erfunden von Christian Freeling (1984)',
  },
  {
    rules: v({ id: 'bauernkrieg', name: 'Bauernkrieg', setup: '8/pppppppp/8/8/8/8/PPPPPPPP/8 w', kingSafety: false, castling: false, promoteWins: true, noMovesLoses: true }),
    short: 'Nur Bauern: Wer zuerst die letzte Reihe erreicht, gewinnt. Perfekt, um Bauernendspiele zu verstehen.',
    rules_text: [
      'Jede Seite hat nur ihre acht Bauern.',
      'Wer zuerst einen Bauern auf die letzte Reihe bringt, gewinnt sofort.',
      'Wer keinen Zug mehr hat oder alle Bauern verliert, verliert.',
    ],
    tip: 'Zähle die Tempi! Ein Freibauer, den kein gegnerischer Bauer mehr aufhalten kann, entscheidet. Durchbrüche wie b5/c5 sind der Schlüssel.',
    where: 'Klassisches Trainingsspiel in Schachschulen',
  },
  {
    rules: v({ id: 'kamel', name: 'Kamelschach', setup: 'rlbqkblr/pppppppp/8/8/8/8/PPPPPPPP/RLBQKBLR w', promo: ['q', 'r', 'b', 'l'] }),
    short: 'Die Springer werden zu Kamelen: Sie springen drei Felder geradeaus und eins zur Seite.',
    rules_text: [
      'Kamele springen (3,1) – wie ein langer Springer. Sie bleiben immer auf derselben Feldfarbe.',
      'Sonst normale Regeln.',
    ],
    tip: 'Kamele erreichen nur die Hälfte der Felder. Stelle wichtige Figuren auf die andere Feldfarbe – dort sind sie vor Kamelen sicher.',
    where: 'Alte Märchenfigur aus dem persischen Großschach (Tamerlan-Schach)',
  },
  {
    rules: v({ id: 'damenjagd', name: 'Damenjagd', captureWin: 'q' }),
    short: 'Wer die gegnerische Dame schlägt, gewinnt sofort. Trainiert, die eigene Dame sicher zu halten.',
    rules_text: [
      'Normale Regeln – aber wer die Dame des Gegners schlägt, gewinnt sofort.',
      'Schachmatt gewinnt natürlich auch.',
    ],
    tip: 'Ziehe die Dame nicht zu früh heraus und prüfe nach jedem gegnerischen Zug: Kann meine Dame angegriffen werden?',
    where: 'Trainingsvariante für Einsteiger',
  },
  {
    rules: v({ id: 'material', name: 'Materialschlacht', moveLimit: 20 }),
    short: 'Nach 20 Zügen gewinnt, wer mehr Material hat. Jeder Schlagzug zählt!',
    rules_text: [
      'Normale Regeln, aber nach 20 Zügen je Seite endet die Partie.',
      'Gewonnen hat, wer dann mehr Material besitzt (Bauer 1, Leichtfigur 3, Turm 5, Dame 9).',
      'Schachmatt vor dem Limit gewinnt sofort.',
    ],
    tip: 'Hängende Figuren entscheiden – aber Vorsicht vor Gegenschlägen. Gegen Ende lohnt es sich, Abtausche zu vermeiden, wenn du vorne liegst.',
    where: 'Trainingsvariante (Taktikblick)',
  },
];

export const variantById = (id: string) => VARIANTS.find((x) => x.rules.id === id);
