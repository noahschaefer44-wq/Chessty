// Wissensbereich: Schachgeschichte und Regeln – kurze Kapitel, teils mit Diagramm.
export interface Article {
  id: string;
  section: 'Geschichte' | 'Regeln';
  title: string;
  kicker: string;
  paragraphs: string[];
  fen?: string;
  moves?: string[];
  arrows?: string[];
  caption?: string;
}

export const ARTICLES: Article[] = [
  // ───────── Geschichte ─────────
  {
    id: 'ursprung',
    section: 'Geschichte',
    kicker: 'ca. 600 n. Chr.',
    title: 'Von Chaturanga zu Schatrandsch',
    paragraphs: [
      'Das Schachspiel stammt vermutlich aus Indien, wo um das 6. Jahrhundert **Chaturanga** gespielt wurde – ein Kriegsspiel mit Fußsoldaten, Reitern, Elefanten und Streitwagen.',
      'Über Persien gelangte es als **Schatrandsch** in die arabische Welt. Die Dame war damals ein schwacher „Wesir“, der nur ein Feld diagonal ziehen konnte; der Läufer sprang zwei Felder weit.',
      'Aus dieser Zeit stammen die ersten Schachprobleme (Mansuben) – etwa das Arabische Matt mit Turm und Springer, das bis heute in jedem Lehrbuch steht.',
    ],
    fen: '7k/7R/5N2/8/8/8/8/7K b - - 0 1',
    caption: 'Das Arabische Matt – über 1000 Jahre alt.',
  },
  {
    id: 'reform',
    section: 'Geschichte',
    kicker: 'ca. 1475',
    title: 'Die Dame wird stark',
    paragraphs: [
      'Im Spanien und Italien des späten 15. Jahrhunderts wurden die Regeln radikal verändert: Die Dame durfte plötzlich beliebig weit in alle Richtungen ziehen, der Läufer über die ganze Diagonale.',
      'Man nannte das neue Spiel „Schach der verrückten Dame“. Partien wurden schneller und taktischer. Das erste gedruckte Schachbuch mit den neuen Regeln verfasste **Lucena** (1497).',
      'Rochade und en passant setzten sich erst in den folgenden Jahrhunderten überall durch.',
    ],
    fen: '4k3/8/8/8/3Q4/8/8/4K3 w - - 0 1',
    arrows: ['d4d8', 'd4h8', 'd4a7', 'd4a1', 'd4h4'],
    caption: 'Die „neue“ Dame: die stärkste Figur.',
  },
  {
    id: 'philidor',
    section: 'Geschichte',
    kicker: '1749',
    title: 'Philidor und die Seele des Schachs',
    paragraphs: [
      'François-André Danican **Philidor**, Komponist und bester Spieler seiner Zeit, schrieb 1749 „L’analyse du jeu des échecs“.',
      'Sein berühmter Satz: „Die Bauern sind die Seele des Schachs.“ Er erkannte als Erster, dass Bauernstrukturen die Pläne bestimmen – ein Gedanke, der erst 150 Jahre später wirklich verstanden wurde.',
      'Nach ihm sind die Philidor-Verteidigung (1.e4 e5 2.Sf3 d6) und die berühmte Remisstellung im Turmendspiel benannt.',
    ],
    fen: '3k4/R7/7r/3PK3/8/8/8/8 w - - 0 1',
    caption: 'Die Philidor-Stellung: Turm auf der 3. Reihe.',
  },
  {
    id: 'romantik',
    section: 'Geschichte',
    kicker: '1830–1880',
    title: 'Die Romantik: Angriff um jeden Preis',
    paragraphs: [
      'Im 19. Jahrhundert galt Schach als Kunst des Angriffs. Gambits wie das Königsgambit waren Standard, Figuren wurden für die Initiative geopfert.',
      '**Adolf Anderssen** spielte 1851 die „Unsterbliche Partie“ und 1852 die „Immergrüne Partie“. **Paul Morphy**, ein Wunderkind aus New Orleans, besiegte in den 1850er-Jahren alle Meister Europas – mit perfekter Entwicklung und offenen Linien.',
      'Morphy war seiner Zeit voraus: Er opferte nicht blind, sondern erst, wenn seine Figuren besser standen.',
    ],
    moves: ['e4', 'e5', 'f4'],
    caption: 'Das Königsgambit – Lieblingseröffnung der Romantiker.',
  },
  {
    id: 'steinitz',
    section: 'Geschichte',
    kicker: '1886',
    title: 'Steinitz und der erste Weltmeister',
    paragraphs: [
      '**Wilhelm Steinitz** wurde 1886 der erste offizielle Weltmeister. Er formulierte die Grundlagen der Positionslehre: Ein Angriff ist nur dann berechtigt, wenn man einen Vorteil hat.',
      'Er lehrte, kleine Vorteile zu sammeln – Raum, bessere Bauernstruktur, das Läuferpaar – und erst dann anzugreifen.',
      'Seine Nachfolger **Emanuel Lasker** (27 Jahre Weltmeister!), **Capablanca** und **Aljechin** verfeinerten diese Ideen.',
    ],
  },
  {
    id: 'hypermodern',
    section: 'Geschichte',
    kicker: '1920er',
    title: 'Die Hypermodernen',
    paragraphs: [
      'Réti, Nimzowitsch und Bogoljubow stellten die klassischen Regeln infrage: Man müsse das Zentrum nicht mit Bauern besetzen – man könne es auch von der Seite kontrollieren und später angreifen.',
      'Daraus entstanden Eröffnungen wie die Nimzoindische, die Königsindische, die Grünfeld-Verteidigung und die Réti-Eröffnung. **Nimzowitschs** Buch „Mein System“ (1925) ist bis heute ein Klassiker.',
    ],
    moves: ['d4', 'Nf6', 'c4', 'e6', 'Nc3', 'Bb4'],
    arrows: ['b4c3', 'f6e4'],
    caption: 'Nimzoindisch: das Zentrum aus der Ferne kontrollieren.',
  },
  {
    id: 'sowjet',
    section: 'Geschichte',
    kicker: '1948–1972',
    title: 'Die sowjetische Schachschule',
    paragraphs: [
      'Ab 1948 stellte die Sowjetunion fast ununterbrochen den Weltmeister: Botwinnik, Smyslow, Tal, Petrosjan, Spasski. Schach wurde staatlich gefördert und wissenschaftlich trainiert.',
      '**Michail Tal**, der „Zauberer von Riga“, begeisterte mit waghalsigen Opfern; **Tigran Petrosjan** war ein Meister der Vorbeugung (Prophylaxe).',
      '1972 unterbrach **Bobby Fischer** diese Serie im „Match des Jahrhunderts“ in Reykjavík gegen Spasski – mitten im Kalten Krieg.',
    ],
  },
  {
    id: 'computer',
    section: 'Geschichte',
    kicker: '1997 bis heute',
    title: 'Das Computerzeitalter',
    paragraphs: [
      '1997 verlor Weltmeister **Garri Kasparow** gegen IBMs **Deep Blue** – ein Wendepunkt. Seit etwa 2006 sind Schachprogramme für Menschen unschlagbar.',
      '2017 lernte **AlphaZero** Schach nur durch Spielen gegen sich selbst – und spielte kreativ, mit Figurenopfern für langfristige Vorteile. Heute kombiniert **Stockfish** (die Engine in dieser App) klassische Suche mit neuronalen Netzen.',
      'Gleichzeitig erlebt Schach einen Boom: Online-Plattformen, Streaming und Weltmeister wie **Magnus Carlsen** machten das Spiel populär wie nie.',
    ],
  },
  // ───────── Regeln ─────────
  {
    id: 'beruehrt-gefuehrt',
    section: 'Regeln',
    kicker: 'Turnierregel',
    title: 'Berührt – geführt',
    paragraphs: [
      'Wer am Zug ist und absichtlich eine **eigene** Figur berührt, muss mit ihr ziehen (sofern sie einen legalen Zug hat). Wer eine **gegnerische** Figur berührt, muss sie schlagen (sofern möglich).',
      'Eine losgelassene Figur auf einem neuen Feld ist gezogen. Wer nur eine Figur zurechtrücken will, sagt vorher deutlich „**Ich rücke zurecht**“ (auf Französisch: „J’adoube“).',
    ],
  },
  {
    id: 'uhr',
    section: 'Regeln',
    kicker: 'Turnierregel',
    title: 'Die Schachuhr',
    paragraphs: [
      'Nach jedem Zug drückt man die Uhr mit **derselben Hand**, mit der man gezogen hat. Wessen Zeit abläuft, verliert – außer der Gegner kann auf keinem Weg mehr mattsetzen (dann Remis).',
      'Häufige Bedenkzeiten: **Bullet** (unter 3 Min.), **Blitz** (3–10 Min.), **Schnellschach** (10–60 Min.), **klassisch** (über 60 Min.). Ein **Inkrement** (z. B. „3+2“) gibt nach jedem Zug zusätzliche Sekunden.',
    ],
  },
  {
    id: 'remisregeln',
    section: 'Regeln',
    kicker: 'Regel',
    title: 'Wann ist eine Partie Remis?',
    paragraphs: [
      '**Patt**: Die Seite am Zug hat keinen legalen Zug und steht nicht im Schach.',
      '**Dreifache Wiederholung**: Dieselbe Stellung mit derselben Seite am Zug entsteht zum dritten Mal – Remis kann beansprucht werden (bei fünffacher Wiederholung automatisch).',
      '**50-Züge-Regel**: 50 Züge jeder Seite ohne Bauernzug und ohne Schlagen (bei 75 automatisch).',
      '**Ungenügendes Material**: Keine Seite kann mehr mattsetzen, z. B. König gegen König oder König + Läufer gegen König.',
      '**Einigung**: Ein Remisangebot macht man nach dem eigenen Zug und vor dem Drücken der Uhr.',
    ],
    fen: 'k7/2Q5/1K6/8/8/8/8/8 b - - 0 1',
    caption: 'Patt – Schwarz am Zug hat keinen Zug.',
  },
  {
    id: 'rochade-regeln',
    section: 'Regeln',
    kicker: 'Regel',
    title: 'Die Rochade genau',
    paragraphs: [
      'Erlaubt, wenn: König und Turm noch nicht gezogen haben, alle Felder zwischen ihnen leer sind, der König nicht im Schach steht, nicht über ein angegriffenes Feld zieht und nicht im Schach landet.',
      'Der Turm darf angegriffen sein, und bei der langen Rochade darf das Feld b1 (b8) angegriffen sein – dort zieht der König ja nicht hindurch.',
      'Im Turnier zieht man zuerst den **König** – wer zuerst den Turm berührt, hat einen Turmzug gemacht.',
    ],
    fen: 'r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1',
    arrows: ['e1g1', 'e1c1'],
  },
  {
    id: 'notation-regeln',
    section: 'Regeln',
    kicker: 'Notation',
    title: 'Partien aufschreiben',
    paragraphs: [
      'Deutsche Figurenbuchstaben: **K** König, **D** Dame, **T** Turm, **L** Läufer, **S** Springer, Bauern ohne Buchstabe. International (und in PGN-Dateien) gelten die englischen: K, Q, R, B, N.',
      'Zeichen: **x** schlägt, **+** Schach, **#** Matt, **O-O** kurze und **O-O-O** lange Rochade, **=D** Umwandlung. Kommentare: **!** guter Zug, **?** Fehler, **??** Patzer, **!?** interessant, **?!** zweifelhaft.',
      'Im Turnier muss man bei längerer Bedenkzeit jeden Zug mitschreiben – erst ziehen, dann schreiben.',
    ],
  },
  {
    id: 'wertung',
    section: 'Regeln',
    kicker: 'Wertungszahlen',
    title: 'Elo und DWZ',
    paragraphs: [
      'Die **Elo-Zahl** (nach Arpad Elo) misst die Spielstärke: Gewinnst du gegen Stärkere, steigt sie stark; verlierst du gegen Schwächere, sinkt sie stark.',
      'Grobe Einordnung: unter 1200 Einsteiger · 1200–1600 Hobbyspieler · 1600–2000 Vereinsspieler · 2000–2200 Experte · ab 2300 Meister · ab 2500 Großmeister · ab 2800 Weltspitze.',
      'In Deutschland gibt es zusätzlich die **DWZ** (Deutsche Wertungszahl) des Deutschen Schachbundes. Online-Wertungen (Lichess, Chess.com) liegen oft 200–400 Punkte höher als die Elo.',
    ],
  },
];
