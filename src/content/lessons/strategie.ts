import type { Lesson } from '../types';

export const strategie: Lesson[] = [
  {
    id: 's-offene-linie',
    title: 'Türme gehören auf offene Linien',
    category: 'strategie',
    level: 2,
    summary: 'Wer die offene Linie beherrscht, dringt auf der 7. Reihe ein.',
    fen: 'r4rk1/pp3ppp/4p3/8/3P4/4P3/PP3PPP/R4RK1 w - - 0 1',
    steps: [
      {
        kind: 'info',
        text: {
          short: 'Die c-Linie ist offen: Es steht kein Bauer mehr darauf. Wer zuerst einen Turm dorthin stellt, kontrolliert sie.',
          why: 'Türme brauchen offene Linien, um aktiv zu werden. Über die offene Linie dringen sie in die gegnerische Stellung ein – meist auf die 7. Reihe, wo sie Bauern angreifen und den König einsperren.',
          pro: 'Nimzowitsch nannte das Ziel der offenen Linie den „Einbruchspunkt“. Ohne Einbruchspunkt ist die offene Linie wertlos. Hier ist es c7.',
        },
        arrows: ['c1', 'c8', 'c7'],
      },
      {
        kind: 'move',
        title: 'Besetze die Linie',
        prompt: {
          short: 'Bring einen Turm auf die offene c-Linie.',
          why: 'Welcher Turm? Beide sind möglich. Oft nimmt man den, der sonst nichts zu tun hat.',
        },
        solution: ['Rfc1', 'Rac1'],
        mistakes: [
          { soft: true, san: 'Rfd1', text: { short: 'Die d-Linie ist durch deinen eigenen Bauern d4 blockiert – dort ist der Turm passiv.' } },
          { soft: true, san: 'h3', text: { short: 'Ein sinnvoller Luftzug, aber jetzt nimmt Schwarz die c-Linie mit …Tfc8.' } },
        ],
        success: {
          short: 'Der Turm steht auf der offenen Linie. Als Nächstes droht Tc7 – der Turm auf der 7. Reihe.',
          pro: 'Verdoppeln (Tc1 + Tc2 oder Tc1 + Dc2) erhöht den Druck. Kämpft der Gegner um die Linie, entscheidet oft, wer den letzten Turm auf ihr behält.',
        },
        successArrows: ['c1c7'],
      },
    ],
    takeaways: ['Türme auf **offene** Linien.', 'Ziel: der Einbruchspunkt, meist die 7. Reihe.', 'Verdoppeln erhöht die Kraft.'],
  },
  {
    id: 's-bauernkette',
    title: 'Bauernketten und der schlechte Läufer',
    category: 'strategie',
    level: 2,
    summary: 'Greife eine Kette an ihrer Basis an – und erkenne, welcher Läufer leidet.',
    steps: [
      {
        kind: 'info',
        play: ['e4', 'e6', 'd4', 'd5', 'e5'],
        text: {
          short: 'Französische Vorstoßvariante: Die weißen Bauern d4–e5 bilden eine Kette gegen die schwarzen Bauern d5–e6.',
          why: 'Eine Bauernkette hat eine **Spitze** (e5) und eine **Basis** (d4). Die Basis ist der Schwachpunkt, denn sie wird von keinem Bauern gedeckt.',
          pro: 'Nimzowitschs Regel: „Greife die Kette an ihrer Basis an.“ Für Schwarz heißt das: …c5 (gegen d4) und später …f6 (gegen e5).',
        },
        arrows: ['d4', 'e5', 'c8', '!c8h3'],
      },
      {
        kind: 'move',
        title: 'Die Basis angreifen',
        prompt: {
          short: 'Schwarz am Zug: Greife die weiße Kette an ihrer Basis an!',
          why: 'Welcher Bauernzug trifft den Bauern d4?',
        },
        solution: ['c5'],
        reply: 'c3',
        mistakes: [
          { soft: true, san: 'f6', text: { short: '…f6 greift die Spitze an – auch eine Idee, aber erst nach …c5. Zuerst die Basis!' } },
        ],
        success: {
          short: '…c5! Schwarz greift d4 an. Weiß stützt mit c3.',
          why: 'Wenn d4 fällt, verliert e5 seine Stütze und die ganze Kette wird wackelig.',
        },
      },
      {
        kind: 'info',
        play: ['Nc6', 'Nf3', 'Qb6'],
        text: {
          short: 'Schwarz baut Druck gegen d4 auf: Springer c6, Dame b6. Der Läufer c8 steht dagegen hinter den eigenen Bauern e6 und d5 – ein **schlechter Läufer**.',
          why: 'Ein Läufer ist „schlecht“, wenn die eigenen Bauern auf seiner Feldfarbe stehen. Er beißt auf Granit.',
          pro: 'Schlechte Läufer sind oft gute Verteidiger. Pläne für Schwarz: den Läufer über d7–b5 bzw. a6 abtauschen, oder die Bauern auf die andere Farbe umstellen (…f6 und …e5).',
        },
        arrows: ['c6d4', 'b6d4', 'b6b2', '!c8h3'],
      },
      {
        kind: 'move',
        title: 'Weiß am Zug',
        prompt: {
          short: 'Die Dame b6 greift b2 und d4 an. Was ist ein nützlicher, vorbeugender Zug für Weiß?',
          why: 'Weiß möchte b4 spielen, um Raum zu gewinnen und den Druck auf d4 zu mindern. Dafür braucht es eine Vorbereitung.',
        },
        solution: ['a3', 'Bd3', 'Be2'],
        success: {
          short: 'a3 bereitet b4 vor und gewinnt Raum am Damenflügel. Ld3 und Le2 entwickeln – ebenfalls gut.',
          pro: 'Die Hauptvariante 6.a3 wurde durch Sveshnikov populär. Nach 6…c4 entsteht eine geschlossene Stellung, in der Weiß am Königsflügel und Schwarz am Damenflügel spielt.',
        },
      },
    ],
    takeaways: ['Greife Ketten an der **Basis** an.', 'Schlechter Läufer = eigene Bauern auf seiner Farbe.', 'Tausche schlechte Läufer oder stelle die Bauern um.'],
  },
  {
    id: 's-vorposten',
    title: 'Vorposten: das Traumfeld für Springer',
    category: 'strategie',
    level: 3,
    summary: 'Ein Feld, das kein gegnerischer Bauer mehr angreifen kann – ideal für einen Springer.',
    steps: [
      {
        kind: 'info',
        play: ['e4', 'c5', 'Nf3', 'd6', 'd4', 'cxd4', 'Nxd4', 'Nf6', 'Nc3', 'a6', 'Be2', 'e5', 'Nb3', 'Be7', 'O-O', 'O-O', 'Be3', 'Be6'],
        text: {
          short: 'Sizilianisch Najdorf: Schwarz hat mit …e5 das Zentrum besetzt, aber das Feld d5 kann kein schwarzer Bauer mehr angreifen. d5 ist ein **Vorposten** für Weiß.',
          why: 'Ein Springer auf einem Vorposten kann nur von Figuren vertrieben werden – und die tauscht man dafür oft ab. Schwarz kämpft deshalb mit …Le6, …Sf6 und …Sbd7 um d5.',
          pro: 'Die ganze Najdorf-Strategie dreht sich um d5: Schwarz nimmt die Schwäche für aktives Figurenspiel und die halboffene c-Linie in Kauf. Gelingt Schwarz …d5 ohne Nachteile, hat er ausgeglichen.',
        },
        arrows: ['d5', 'c3d5', 'e6d5', 'f6d5'],
      },
      {
        kind: 'move',
        title: 'Auf den Vorposten',
        prompt: {
          short: 'Besetze den Vorposten d5 mit einem Springer.',
          why: 'Nach dem Abtausch auf d5 entsteht ein weißer Bauer d5, der Schwarz einengt, und der Läufer e6 wird vertrieben.',
        },
        solution: ['Nd5'],
        reply: 'Nxd5',
        success: {
          short: 'Sd5! Schwarz tauscht, nach exd5 hat Weiß Raumvorteil und die Diagonale e2–a6 für den Läufer.',
          pro: 'Ob der Abtausch auf d5 gut für Weiß ist, hängt von den Leichtfiguren ab: Bleibt Weiß ein Springer gegen einen schlechten Läufer e7, ist es ein Traum. Hier ist die Stellung dynamisch ausgeglichen – aber der Plan ist typisch.',
        },
      },
      {
        kind: 'move',
        title: 'Zurückschlagen',
        prompt: { short: 'Schlag zurück – mit welcher Figur?' },
        solution: ['exd5'],
        mistakes: [
          { soft: true, san: 'Qxd5', text: { short: 'Die Dame auf d5 wird mit …Sc6 oder …Lxd5 schnell vertrieben. Der Bauer ist dort viel besser: Er engt Schwarz ein.' } },
        ],
        success: {
          short: 'exd5 greift den Läufer e6 an und gewinnt Raum. Der Bauer d5 wird zum Keil in der schwarzen Stellung.',
        },
      },
    ],
    takeaways: ['Vorposten = Feld, das kein gegnerischer Bauer angreifen kann.', 'Springer lieben Vorposten, besonders im Zentrum und auf der 5./6. Reihe.', 'Der Gegner muss Figuren tauschen, um den Eindringling loszuwerden.'],
  },
  {
    id: 's-isolani',
    title: 'Der isolierte Damenbauer',
    category: 'strategie',
    level: 3,
    summary: 'Schwäche oder Stärke? Pläne für beide Seiten.',
    steps: [
      {
        kind: 'info',
        play: ['e4', 'c6', 'd4', 'd5', 'exd5', 'cxd5', 'c4', 'Nf6', 'Nc3', 'e6', 'Nf3', 'Be7', 'cxd5', 'Nxd5', 'Bd3', 'Nc6', 'O-O', 'O-O', 'Re1'],
        text: {
          short: 'Weiß hat einen **isolierten Damenbauern** (Isolani) auf d4: Kein weißer Bauer auf der c- oder e-Linie kann ihn schützen.',
          why: 'Nachteil: Der Bauer braucht Figuren als Schutz, und das Feld d5 davor ist ein idealer Blockadepunkt für Schwarz. Vorteil: Weiß hat mehr Raum, offene Linien (c und e) und aktive Figuren.',
          pro: 'Faustregel: Mit vielen Figuren auf dem Brett ist der Isolani oft eine Stärke (Angriff!), im Endspiel eine Schwäche. Die Seite gegen den Isolani will tauschen, die Seite mit dem Isolani will angreifen oder mit d4–d5 durchbrechen.',
        },
        arrows: ['d4', 'd5', '?e5', 'f3e5'],
      },
      {
        kind: 'move',
        title: 'Druck auf den Isolani',
        prompt: {
          short: 'Schwarz am Zug: Erhöhe den Druck auf den Bauern d4.',
          why: 'Welche Figur kann d4 zusätzlich angreifen?',
        },
        solution: ['Bf6', 'Qb6'],
        reply: 'Be4',
        mistakes: [
          { soft: true, san: 'b6', text: { short: 'Nicht schlecht, aber passiv. Jetzt ist der Moment, d4 unter Druck zu setzen.' } },
        ],
        success: {
          short: '…Lf6 greift d4 an – jetzt verteidigen Springer f3 und Dame. Weiß antwortet aktiv mit Le4 und zielt auf den Blockadespringer d5.',
          pro: 'Ein typischer Kampf: Schwarz will d5 blockieren und tauschen, Weiß will den Blockadespringer vertreiben oder abtauschen, um d4–d5 zu spielen.',
        },
      },
      {
        kind: 'info',
        text: {
          short: 'Die Pläne im Überblick: **Weiß** – Königsangriff mit Se5, Dd3, Lc2 (Batterie auf h7), Turm über e3 nach h3; oder der Durchbruch d4–d5. **Schwarz** – Blockade auf d5, Figuren tauschen, den Bauern im Endspiel gewinnen.',
          pro: 'Klassiker zum Studium: Karpow gegen Isolani-Stellungen (z. B. Karpow–Spasski) und Kasparows Angriffe mit dem Isolani. Merksatz: „Wer einen Isolani hat, sollte angreifen – wer dagegen spielt, sollte tauschen.“',
        },
        arrows: ['e4d5', 'd4d5', 'd5'],
      },
    ],
    takeaways: ['Isolani: Raum und Aktivität gegen eine statische Schwäche.', 'Gegen den Isolani: **blockieren und tauschen**.', 'Mit dem Isolani: **angreifen oder d4–d5**.'],
  },
  {
    id: 's-freibauer',
    title: 'Der entfernte Freibauer',
    category: 'strategie',
    level: 3,
    summary: 'Ein Freibauer weit weg vom Geschehen lenkt den König ab – der Klassiker im Bauernendspiel.',
    fen: '8/5pp1/4k3/8/P3K3/8/5PP1/8 w - - 0 1',
    steps: [
      {
        kind: 'info',
        text: {
          short: 'Am Königsflügel stehen sich zwei gegen zwei Bauern gegenüber. Der weiße a-Bauer hat keinen Gegner – er ist ein **entfernter Freibauer**.',
          why: 'Der schwarze König muss den a-Bauern aufhalten. Während er unterwegs ist, marschiert der weiße König zu den Bauern am Königsflügel und frisst sie.',
          pro: 'Das ist der Hauptgrund, warum im Mittelspiel Bauernmajoritäten am Damenflügel geschätzt werden: Sie erzeugen im Endspiel einen entfernten Freibauern.',
        },
        arrows: ['a4a8', 'e4f5'],
      },
      {
        kind: 'move',
        title: 'Lenke den König ab',
        prompt: {
          short: 'Schick den a-Bauern los!',
          why: 'Der schwarze König muss hinterher. Achte darauf, dass dein König danach schneller am Königsflügel ist.',
        },
        solution: ['a5', 'f4'],
        reply: 'Kd6',
        success: {
          short: 'a5! Der schwarze König muss zum a-Bauern. Danach geht dein König nach f5/g5 und holt sich die Bauern.',
          pro: 'Quadratregel: Der König stoppt einen Freibauern, wenn er in das „Quadrat“ zwischen Bauer und Umwandlungsfeld ziehen kann. Hier gerade noch – aber dann steht er am falschen Flügel.',
        },
      },
      {
        kind: 'move',
        title: 'Der König marschiert',
        prompt: { short: 'Jetzt der König: Ab zum Königsflügel!', why: 'Der schwarze König ist auf dem Weg nach c7/b7. Nutze die Zeit.' },
        solution: ['Kf5', 'f4', 'Kd4'],
        success: {
          short: 'Genau. Weiß gewinnt die Bauern am Königsflügel, während Schwarz den a-Bauern schlägt – am Ende hat Weiß einen neuen Freibauern und gewinnt.',
        },
      },
    ],
    takeaways: ['Der entfernte Freibauer lenkt den König ab.', 'Während der König ihn jagt, holt sich deiner die anderen Bauern.', 'Bauernmajorität am Flügel = zukünftiger entfernter Freibauer.'],
  },
  {
    id: 's-minoritaetsangriff',
    title: 'Der Minoritätsangriff',
    category: 'strategie',
    level: 4,
    summary: 'Zwei Bauern greifen drei an – und erzeugen eine dauerhafte Schwäche.',
    steps: [
      {
        kind: 'info',
        play: ['d4', 'd5', 'c4', 'e6', 'Nc3', 'Nf6', 'cxd5', 'exd5', 'Bg5', 'c6', 'Qc2', 'Be7', 'e3', 'Nbd7', 'Bd3', 'O-O', 'Nf3', 'Re8', 'O-O', 'Nf8', 'Rab1', 'Ng6'],
        text: {
          short: 'Karlsbader Struktur (Abtauschvariante des Damengambits): Weiß hat am Damenflügel 2 Bauern (a, b) gegen 3 schwarze (a, b, c).',
          why: 'Mit b4–b5 greift Weiß mit der „Minderheit“ an. Nach bxc6 bxc6 hat Schwarz einen **rückständigen Bauern** auf c6, nach …cxb5 einen **isolierten Bauern** auf d5.',
          pro: 'Schwarz spielt meist am Königsflügel (…Se4, …f5, …Sg6–h4) oder verhindert b5 mit …a5/…b5. Der Tb1 unterstützt b4–b5, obwohl die b-Linie noch geschlossen ist – ein prophylaktischer Turmzug.',
        },
        arrows: ['b2b4', 'b4b5', 'c6', 'd5'],
      },
      {
        kind: 'move',
        title: 'Der Angriff beginnt',
        prompt: { short: 'Starte den Minoritätsangriff!' },
        solution: ['b4'],
        reply: 'a6',
        success: {
          short: 'b4! Schwarz bremst mit …a6. Weiß setzt mit a4 und b5 fort.',
          why: 'Das Ziel ist nicht Material, sondern eine **dauerhafte Schwäche** auf c6 oder d5, auf die Weiß später mit Türmen und Springern (Sa4–c5) spielt.',
        },
      },
      {
        kind: 'move',
        title: 'b5 vorbereiten',
        prompt: { short: 'Bereite b4–b5 vor.', why: 'Nach …a6 würde b5 einfach geschlagen. Welcher Bauer hilft?' },
        solution: ['a4'],
        success: {
          short: 'a4 – jetzt kann b5 gespielt werden, und nach …axb5 axb5 öffnet sich die a-Linie für Weiß.',
          pro: 'Klassische Partien: Botwinnik gegen Keres und Kasparow–Andersson zeigen den Minoritätsangriff in Perfektion.',
        },
        successArrows: ['b4b5'],
      },
    ],
    takeaways: ['Minoritätsangriff = die kleinere Bauernzahl greift an, um Schwächen zu erzeugen.', 'Ziel: rückständiger Bauer c6 oder isolierter Bauer d5.', 'Gegenspiel des Gegners oft am anderen Flügel.'],
  },
];
