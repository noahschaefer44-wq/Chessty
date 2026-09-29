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
];

export const variantById = (id: string) => VARIANTS.find((x) => x.rules.id === id);
