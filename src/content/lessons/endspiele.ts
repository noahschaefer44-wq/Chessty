import type { Lesson } from '../types';

export const endspiele: Lesson[] = [
  {
    id: 'e-dame-matt',
    title: 'Matt mit Dame und König',
    category: 'endspiele',
    level: 1,
    summary: 'Die Grundtechnik: einengen im Springerabstand, König holen, mattsetzen – ohne Patt.',
    steps: [
      {
        kind: 'info',
        fen: '8/8/8/4k3/8/8/8/3QK3 w - - 0 1',
        text: {
          short: 'Methode in drei Schritten: 1) Dame einen Springerzug vom König entfernt – der Käfig wird kleiner. 2) Wenn der König am Rand ist: eigenen König holen. 3) Matt setzen.',
          why: 'Die Dame allein kann nicht mattsetzen, aber sie kann den König in ein immer kleineres Rechteck sperren.',
          pro: 'Aus jeder Stellung gewinnt man in höchstens 10 Zügen. Praktischer Tipp: Folge dem König mit der Dame im Springerabstand – das ist einfach und sicher.',
        },
        arrows: ['d1d4', 'd4', 'e5'],
      },
      {
        kind: 'move',
        title: 'Matt am Rand',
        fen: '7k/8/5K2/8/8/8/8/6Q1 w - - 0 1',
        prompt: { short: 'Der König ist in der Ecke, dein König steht bereit. Setze matt!' },
        solution: ['Qg7#'],
        mistakes: [{ san: 'Qg8+', text: { short: 'Der König schlägt die Dame – g8 wird von deinem König nicht gedeckt.' } }],
        success: { short: 'Dg7 matt – die Dame ist vom König gedeckt.' },
      },
      {
        kind: 'move',
        title: 'Vorsicht Patt',
        fen: '7k/8/6K1/8/8/8/8/5Q2 w - - 0 1',
        prompt: { short: 'Setze matt – aber prüfe, ob Schwarz danach noch ziehen kann!' },
        solution: ['Qf8#'],
        mistakes: [
          {
            san: 'Qf7',
            text: {
              short: 'Patt! Schwarz steht nicht im Schach und hat keinen Zug. Remis.',
              why: 'Die Dame nimmt g8, g7 und h7 weg, dein König ebenfalls – aber ohne Schach ist es Patt.',
            },
          },
        ],
        success: { short: 'Df8 matt! Die Dame gibt Schach auf der 8. Reihe, der König deckt g7 und h7.' },
      },
    ],
    takeaways: ['Dame im Springerabstand zum König.', 'Am Rand: König holen.', 'Vor dem Zug: Patt prüfen!'],
    pitfalls: ['Patt durch zu starkes Einengen.', 'Die Dame ungedeckt neben den König stellen.'],
  },
  {
    id: 'e-turm-matt',
    title: 'Matt mit Turm und König',
    category: 'endspiele',
    level: 1,
    summary: 'Wand bauen, Opposition, Schach am Rand.',
    steps: [
      {
        kind: 'info',
        fen: '8/8/8/2k5/8/8/4K3/4R3 w - - 0 1',
        text: {
          short: 'Der Turm baut eine Wand, die der König nicht überqueren kann. Dein König drängt ihn Reihe für Reihe zurück.',
          why: 'Mattgesetzt wird am Rand: Die Könige stehen sich gegenüber (Opposition), und der Turm gibt auf der Randlinie Schach.',
          pro: 'Braucht man einen Tempozug, zieht der Turm entlang seiner Wand (Wartezug). Aus jeder Stellung geht es in höchstens 16 Zügen.',
        },
        arrows: ['e1e8', 'e2d3'],
      },
      {
        kind: 'move',
        title: 'Das Grundmatt',
        fen: '3k4/8/3K4/8/8/8/8/7R w - - 0 1',
        prompt: { short: 'Die Könige stehen sich gegenüber. Setze matt!' },
        solution: ['Rh8#'],
        success: { short: 'Th8 matt: Der Turm kontrolliert die 8. Reihe, der König die 7.' },
      },
      {
        kind: 'move',
        title: 'Noch einmal',
        fen: '6k1/8/6K1/8/8/8/8/R7 w - - 0 1',
        prompt: { short: 'Setze matt.' },
        solution: ['Ra8#'],
        success: { short: 'Ta8 matt. Dasselbe Muster – immer mit Opposition.' },
      },
    ],
    takeaways: ['Turm = Wand.', 'König in Opposition, dann Schach am Rand.', 'Wartezüge mit dem Turm.'],
  },
  {
    id: 'e-quadrat',
    title: 'Die Quadratregel',
    category: 'endspiele',
    level: 1,
    summary: 'Holt der König den Bauern noch ein? Ohne Rechnen – mit einem Quadrat.',
    steps: [
      {
        kind: 'info',
        fen: '7k/8/8/8/p7/8/8/4K3 w - - 0 1',
        text: {
          short: 'Zeichne ein Quadrat vom Bauern bis zur Umwandlungsreihe: a4–a1–d1–d4. Kann der König in dieses Quadrat ziehen, holt er den Bauern ein.',
          why: 'Das Quadrat „wandert“ mit dem Bauern. Steht der König darin (oder kommt er mit seinem Zug hinein), erreicht er das Umwandlungsfeld rechtzeitig.',
          pro: 'Achtung bei Bauern auf der Grundstellung: Der Doppelschritt vergrößert das Quadrat so, als stünde der Bauer schon eine Reihe weiter.',
        },
        arrows: ['a4', 'a1', 'd1', 'd4'],
      },
      {
        kind: 'move',
        title: 'Ins Quadrat',
        prompt: { short: 'Weiß am Zug: Halte den Bauern auf!' },
        solution: ['Kd2', 'Kd1'],
        mistakes: [
          { san: 'Kf1', text: { short: 'Der König bleibt außerhalb des Quadrats – der Bauer wandelt um.' } },
          { san: 'Ke2', text: { short: 'e2 liegt nicht im Quadrat a4–d1. Der Bauer ist schneller.' } },
        ],
        success: { short: 'Kd2! Der König steht im Quadrat und erreicht b2/a1 rechtzeitig. Remis.' },
      },
    ],
    takeaways: ['Quadrat vom Bauern zur Grundreihe.', 'König im Quadrat = Bauer wird eingeholt.'],
  },
  {
    id: 'e-opposition',
    title: 'Opposition und Reservetempo',
    category: 'endspiele',
    level: 2,
    summary: 'Wer am Zug ist, verliert: das Herzstück jedes Bauernendspiels.',
    steps: [
      {
        kind: 'info',
        fen: '8/8/4k3/8/4K3/4P3/8/8 w - - 0 1',
        text: {
          short: 'Die Könige stehen sich mit einem Feld Abstand gegenüber: **Opposition**. Wer jetzt ziehen muss, muss ausweichen.',
          why: 'Mit Weiß am Zug ist das Remis – Weiß muss weichen. Wäre Schwarz am Zug, gewinnt Weiß, weil der schwarze König den Weg freigeben muss.',
          pro: 'Man sagt: Wer die Opposition „hat“, ist NICHT am Zug. Es gibt auch die entfernte Opposition (3 oder 5 Felder Abstand) und die diagonale Opposition.',
        },
        arrows: ['e4', 'e6'],
      },
      {
        kind: 'move',
        title: 'Das Reservetempo',
        fen: '8/8/3k4/8/3K4/8/3P4/8 w - - 0 1',
        prompt: {
          short: 'Opposition – und du bist am Zug. Aber du hast einen Trumpf. Gewinne!',
          why: 'Ein Bauernzug ist ein „Tempozug“: Er gibt die Zugpflicht an den Gegner weiter, ohne dass der König weichen muss.',
          pro: 'Umgehen mit dem König (Kc4/Ke4) gewinnt hier ebenfalls – der Bauer steht noch weit genug zurück.',
        },
        solution: ['d3', 'Kc4', 'Ke4'],
        mistakes: [
          { san: 'Kd3', text: { short: 'Der König weicht zurück – Schwarz rückt mit …Kd5 nach und hat die Opposition. Remis.' } },
          { san: 'Kc3', text: { short: 'Zurückweichen gibt die Opposition auf. Remis.' } },
        ],
        success: {
          short: 'd3! Jetzt muss Schwarz ziehen und die Opposition aufgeben. Der weiße König dringt ein.',
          why: 'Reservetempi sind im Bauernendspiel Gold wert. Zieh deine Bauern deshalb nicht leichtfertig vor.',
        },
      },
      {
        kind: 'info',
        title: 'Die Schlüsselfelder',
        fen: '4k3/8/8/8/8/4P3/8/4K3 w - - 0 1',
        text: {
          short: 'Für einen Bauern auf e3 sind d5, e5 und f5 die **Schlüsselfelder**. Erreicht der weiße König eines davon, gewinnt er – egal wer am Zug ist.',
          why: 'Faustregel für Bauern bis zur 4. Reihe: die drei Felder zwei Reihen vor dem Bauern. Ab der 5. Reihe: die drei Felder eine und zwei Reihen davor.',
          pro: 'Ausnahme: Randbauern (a/h) – dort kann sich der verteidigende König in der Ecke oft einfach verbarrikadieren.',
        },
        arrows: ['d5', 'e5', 'f5'],
      },
    ],
    takeaways: ['Opposition: Wer ziehen muss, weicht.', 'Bauernzüge als Reservetempo.', 'König auf ein Schlüsselfeld = Sieg.'],
    pitfalls: ['Den Bauern zu früh vorziehen und das Reservetempo verschenken.', 'Mit dem König zurückweichen statt Opposition zu halten.'],
  },
  {
    id: 'e-falscher-laeufer',
    title: 'Der falsche Läufer',
    category: 'endspiele',
    level: 3,
    summary: 'Ein Läufer und ein Bauer mehr – und trotzdem nur Remis.',
    steps: [
      {
        kind: 'info',
        fen: '1k6/8/1K6/P7/8/8/8/2B5 b - - 0 1',
        text: {
          short: 'Weiß hat Läufer und a-Bauer, aber der Läufer ist dunkelfeldrig – das Umwandlungsfeld a8 ist hell. Er kann den König nie aus der Ecke vertreiben.',
          why: 'Steht der verteidigende König in der Ecke vor dem Randbauern, ist es Remis, wenn der Läufer das Eckfeld nicht kontrolliert.',
          pro: 'Faustregel: Der Läufer muss die Farbe des Umwandlungsfeldes haben. Für den a-Bauern (a8 hell) braucht Weiß einen weißfeldrigen Läufer, für den h-Bauern (h8 dunkel) einen schwarzfeldrigen.',
        },
        arrows: ['a8', 'c1h6'],
      },
      {
        kind: 'move',
        title: 'Ab in die Ecke',
        prompt: {
          short: 'Schwarz am Zug: Halte das Remis!',
          why: 'Der König muss in die Ecke, die der Läufer nicht erreicht. Aufpassen auf das Patt ist hier die Aufgabe von Weiß – nicht deine.',
        },
        solution: ['Ka8'],
        mistakes: [
          { san: 'Kc8', text: { short: 'Der König verlässt die Ecke! Nach Ka7 oder a6 kommt der Bauer durch – verloren.' } },
        ],
        success: { short: 'Ka8! Der König pendelt zwischen a8 und b8 (bzw. b7). Weiß kann ihn nicht vertreiben: Remis.' },
      },
    ],
    takeaways: ['Randbauer + Läufer der falschen Farbe = Remis, wenn der König in der Ecke ist.', 'Verteidiger: sofort in die Ecke!'],
  },
  {
    id: 'e-lucena',
    title: 'Lucena-Stellung: Brückenbau',
    category: 'endspiele',
    level: 3,
    summary: 'Die wichtigste Gewinnstellung im Turmendspiel.',
    fen: '1K1k4/1P6/8/8/8/8/r7/5R2 w - - 0 1',
    steps: [
      {
        kind: 'info',
        text: {
          short: 'Der weiße Bauer steht auf der 7. Reihe, der König davor. Problem: Der König kommt nicht heraus, weil der schwarze Turm von der Seite Schach gibt.',
          why: 'Lösung in drei Schritten: 1) Den schwarzen König mit Schach abdrängen. 2) Den Turm auf die 4. Reihe stellen. 3) Mit dem König herauslaufen – gegen die Schachs baut der Turm eine „Brücke“.',
          pro: 'Die Stellung ist nach Luis Ramírez de Lucena (1497) benannt, obwohl sie in seinem Buch gar nicht vorkommt – sie erschien bei Salvio 1634.',
        },
        arrows: ['f1d1', 'd1d4'],
      },
      {
        kind: 'move',
        title: 'Den König abdrängen',
        prompt: { short: 'Treib den schwarzen König von der d-Linie weg.' },
        solution: ['Rd1+'],
        reply: 'Ke7',
        success: { short: 'Td1+ Ke7 – jetzt ist der König auf der e-Linie abgeschnitten.' },
      },
      {
        kind: 'move',
        title: 'Die Brücke vorbereiten',
        prompt: {
          short: 'Stell den Turm auf die 4. Reihe!',
          why: 'Von dort kann er später auf b4 dazwischenziehen, wenn der König auf b5 Schach bekommt.',
        },
        solution: ['Rd4'],
        reply: 'Ra1',
        mistakes: [
          { soft: true, san: 'Kc7', text: { short: 'Zu früh: Nach …Tc2+ Kb6 Tb2+ Kc6 Tc2+ findet der König keinen Schutz. Erst der Turm auf die 4. Reihe!' } },
        ],
        success: { short: 'Td4! Schwarz wartet mit …Ta1.' },
      },
      {
        kind: 'move',
        title: 'Heraus mit dem König',
        prompt: { short: 'Jetzt verlässt der König das Umwandlungsfeld.' },
        solution: ['Kc7'],
        reply: 'Rc1+',
        success: { short: 'Kc7 Tc1+ – die Schachs beginnen.' },
      },
      {
        kind: 'move',
        title: 'Den Schachs entkommen',
        prompt: { short: 'Weich aus – Richtung Turm.' },
        solution: ['Kb6'],
        reply: 'Rb1+',
        success: { short: 'Kb6 Tb1+' },
      },
      {
        kind: 'move',
        title: 'Weiter',
        prompt: { short: 'Weiter nach vorne, zum Turm hin.' },
        solution: ['Kc6'],
        reply: 'Rc1+',
        success: { short: 'Kc6 Tc1+' },
      },
      {
        kind: 'move',
        title: 'Fast geschafft',
        prompt: { short: 'Noch ein Königszug …' },
        solution: ['Kb5'],
        reply: 'Rb1+',
        success: { short: 'Kb5 Tb1+ – und jetzt die Brücke!' },
      },
      {
        kind: 'move',
        title: 'Die Brücke',
        prompt: { short: 'Blocke das Schach mit dem Turm!' },
        solution: ['Rb4'],
        success: {
          short: 'Tb4! Die Brücke steht. Keine Schachs mehr – der Bauer wandelt um.',
          pro: 'Merksatz: „Turm auf die 4. Reihe, König raus, Brücke bauen.“ Mit dieser Technik gewinnt man auch, wenn der verteidigende Turm von vorne kommt.',
        },
      },
    ],
    takeaways: ['König abdrängen (Td1+).', 'Turm auf die 4. Reihe.', 'König heraus, Brücke bauen.'],
  },
  {
    id: 'e-philidor',
    title: 'Philidor-Stellung: sicher Remis halten',
    category: 'endspiele',
    level: 3,
    orientation: 'black',
    summary: 'Die wichtigste Verteidigungstechnik im Turmendspiel mit Bauer weniger.',
    fen: '3k4/R7/8/3PK3/8/8/8/7r b - - 0 1',
    steps: [
      {
        kind: 'info',
        text: {
          short: 'Schwarz verteidigt sich gegen König + Bauer + Turm. Der König steht auf dem Umwandlungsfeld vor dem Bauern – ideal. Jetzt muss der Turm richtig stehen.',
          why: 'Der Turm hält die 6. Reihe (aus Sicht von Schwarz die „3. Reihe“). So kann der weiße König nicht nach vorne.',
          pro: 'Philidor analysierte diese Stellung 1777. Sie ist bis heute die Grundlage jeder Turmendspiel-Verteidigung.',
        },
        arrows: ['h1h6', 'e5d6', 'e5e6'],
      },
      {
        kind: 'move',
        title: 'Die 3. Reihe',
        prompt: {
          short: 'Stell den Turm auf die 6. Reihe und sperre den weißen König aus.',
        },
        solution: ['Rh6'],
        reply: 'd6',
        mistakes: [
          {
            san: 'Rh8',
            text: {
              short: 'Passiv! Auf der Grundreihe lässt der Turm den weißen König nach e6/d6 vor – laut Datenbank verloren.',
              why: 'Der Turm gehört auf die 6. Reihe, solange der Bauer auf der 5. steht.',
            },
          },
        ],
        success: { short: '…Th6! Weiß kommt nicht weiter und spielt d6 – aber jetzt fehlt dem König die Deckung.' },
      },
      {
        kind: 'move',
        title: 'Schachs von hinten',
        prompt: {
          short: 'Der Bauer ist auf d6. Jetzt ändert sich die Taktik: Wohin mit dem Turm?',
          why: 'Der König hat keinen Schutz vor Schachs von hinten mehr, weil der Bauer auf d6 ihm das Feld nimmt.',
        },
        solution: ['Rh1'],
        mistakes: [
          { san: 'Rh8', text: { short: 'Wieder passiv: Nach Ke6 droht Ta8 matt, und der Bauer läuft durch. Verloren.' } },
        ],
        success: {
          short: '…Th1! Es folgen endlose Schachs von hinten – der weiße König findet keinen Schutz. Remis.',
          pro: 'Der häufigste Fehler: den Turm passiv auf die Grundreihe stellen. Das verliert oft gegen die Lucena-Technik.',
        },
      },
    ],
    takeaways: ['Turm auf die 3. Reihe (aus eigener Sicht).', 'Rückt der Bauer vor: Schachs von hinten.'],
    pitfalls: ['Passive Grundreihen-Verteidigung.', 'Schachs von der Seite, die dem König Schutz lassen.'],
  },
];
