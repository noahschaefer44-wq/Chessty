import type { Lesson } from '../types';

export const grundlagen: Lesson[] = [
  {
    id: 'g-figuren',
    title: 'Figuren und ihr Wert',
    category: 'grundlagen',
    level: 1,
    summary: 'Wie viel ist eine Figur wert – und warum ist das wichtig?',
    steps: [
      {
        kind: 'info',
        title: 'Die Grundstellung',
        text: {
          short: 'Jede Seite hat 16 Figuren: König, Dame, 2 Türme, 2 Läufer, 2 Springer und 8 Bauern. Die Dame steht auf ihrer Farbe: weiße Dame auf d1 (hell), schwarze auf d8 (dunkel).',
          why: 'Das Ziel ist nicht, möglichst viele Figuren zu schlagen, sondern den König mattzusetzen. Material hilft aber enorm: Wer mehr Figuren hat, kann leichter angreifen und verteidigen.',
          pro: 'Merksatz für die Aufstellung: „Die Dame steht auf ihrer Farbe“ und „rechts unten ist ein helles Feld“ (h1 ist weiß). Profis denken in Materialeinheiten, aber vergessen nie: Aktivität und Königssicherheit können Material aufwiegen.',
        },
        arrows: ['d1', 'd8', 'e1', 'e8'],
      },
      {
        kind: 'info',
        title: 'Der Tauschwert',
        fen: '4k3/8/8/8/8/8/8/R1BQKBNR w K - 0 1',
        text: {
          short: 'Faustregel: Bauer = 1, Springer = 3, Läufer = 3, Turm = 5, Dame = 9. Der König ist unbezahlbar.',
          why: 'Mit diesen Zahlen kannst du Abtausche bewerten: Einen Springer (3) gegen einen Turm (5) zu tauschen – den sogenannten „Qualitätsgewinn“ – ist gut für dich.',
          pro: 'Feinere Werte (Kaufman): Läufer etwas mehr als Springer (≈3,25), das Läuferpaar ist ≈0,5 Bauern wert. Im Endspiel steigt der Wert der Türme und Bauern, im Mittelspiel zählt Figurenaktivität oft mehr als ein Bauer.',
        },
        arrows: ['a1', 'c1', 'd1', 'g1'],
      },
      {
        kind: 'move',
        title: 'Freie Beute',
        fen: '4k3/8/8/3q4/8/8/8/3RK3 w - - 0 1',
        prompt: {
          short: 'Die schwarze Dame steht ungedeckt. Schlag sie!',
          why: 'Eine Figur, die niemand verteidigt, nennt man „hängend“. Schau vor jedem Zug: Hängt etwas beim Gegner? Hängt etwas bei mir?',
        },
        solution: ['Rxd5'],
        success: {
          short: 'Der Turm schlägt die Dame: +9 Punkte. Gegen König allein gewinnst du jetzt leicht.',
          why: 'Die Dame war nur vom König gedeckt – und der steht zu weit weg. Die meisten Anfängerpartien werden genau so entschieden.',
        },
      },
      {
        kind: 'move',
        title: 'Die richtige Beute wählen',
        fen: '4k3/8/4p3/3n3b/8/8/8/3RK2Q w - - 0 1',
        prompt: {
          short: 'Du kannst den Springer oder den Läufer schlagen. Welcher Schlag gewinnt wirklich Material?',
          why: 'Prüfe bei jedem Schlagzug: Ist die Figur gedeckt? Wenn ja – was verliere ich beim Zurückschlagen?',
          pro: 'Die Frage lautet immer: Wer steht nach dem letzten Schlag besser da? Rechne den gesamten Abtausch zu Ende, nicht nur den ersten Schlag.',
        },
        solution: ['Qxh5+'],
        mistakes: [
          {
            san: 'Rxd5',
            text: {
              short: 'Der Springer ist durch den Bauern e6 gedeckt. Nach …exd5 hast du einen Turm (5) für einen Springer (3) gegeben.',
              why: 'Der Bauer e6 „schützt“ d5 diagonal. Bauern sind die besten Verteidiger, weil sie am wenigsten wert sind.',
            },
          },
        ],
        success: {
          short: 'Richtig: Der Läufer war ungedeckt – und du gibst sogar Schach!',
          why: 'Die Dame auf h5 greift über g6 und f7 den König an. Gratis-Figur plus Schach: besser geht es kaum.',
        },
      },
    ],
    takeaways: [
      'Bauer 1 · Springer 3 · Läufer 3 · Turm 5 · Dame 9',
      'Vor jedem Zug: **Hängt etwas beim Gegner? Hängt etwas bei mir?**',
      'Gedeckte Figuren nur schlagen, wenn der ganze Abtausch sich lohnt.',
    ],
    pitfalls: ['Eine gedeckte Figur mit einer wertvolleren Figur schlagen.', 'Nur an den eigenen Plan denken und die Drohung des Gegners übersehen.'],
  },
  {
    id: 'g-schach-matt',
    title: 'Schach, Matt und Patt',
    category: 'grundlagen',
    level: 1,
    summary: 'Das Ziel des Spiels – und die Falle, die aus einem Sieg ein Remis macht.',
    steps: [
      {
        kind: 'info',
        title: 'Schach!',
        fen: '4k3/8/8/8/8/8/8/4RK2 b - - 0 1',
        text: {
          short: 'Der Turm greift den König an: Das ist Schach. Schwarz muss sofort reagieren.',
          why: 'Es gibt genau drei Wege aus dem Schach: 1) König ziehen, 2) dazwischenstellen (blocken), 3) den Angreifer schlagen. Hier geht nur Möglichkeit 1.',
          pro: 'Merkwort: **ZBS** – Ziehen, Blocken, Schlagen. Beim Doppelschach hilft nur Ziehen.',
        },
        arrows: ['e1e8'],
      },
      {
        kind: 'move',
        title: 'Grundreihenmatt',
        fen: '6k1/5ppp/8/8/8/8/8/R5K1 w - - 0 1',
        prompt: {
          short: 'Setze in einem Zug matt.',
          why: 'Der schwarze König ist hinter seinen eigenen Bauern eingesperrt. Welche Reihe kann er nicht verlassen?',
        },
        hint: 'Der Turm will auf die 8. Reihe.',
        solution: ['Ra8#'],
        success: {
          short: 'Matt! Der König kann nicht fliehen, nicht blocken und den Turm nicht schlagen.',
          why: 'Die eigenen Bauern f7, g7, h7 nehmen dem König die Fluchtfelder. Das ist das **Grundreihenmatt** – eines der häufigsten Mattbilder überhaupt.',
          pro: 'Vorbeugung: Ein „Luftloch“ wie h3/h6 zur rechten Zeit. Aber Vorsicht – jeder Bauernzug schwächt auch Felder.',
        },
      },
      {
        kind: 'move',
        title: 'Dame und König',
        fen: 'k7/8/1K6/8/8/8/7Q/8 w - - 0 1',
        prompt: {
          short: 'Setze matt. Dein König hilft mit!',
          why: 'Der weiße König auf b6 kontrolliert a7, b7 und c7. Wo kann die Dame jetzt Schach geben, ohne dass der König entkommt?',
        },
        solution: ['Qh8#'],
        mistakes: [
          { san: 'Qc7', text: { short: 'Patt! Schwarz hat keinen Zug mehr, steht aber nicht im Schach – nur Remis. Dazu gleich mehr.' } },
          { san: 'Qb8+', text: { short: 'Der König schlägt einfach die Dame – b8 ist von deinem König nicht gedeckt.' } },
        ],
        success: {
          short: 'Matt! König und Dame arbeiten zusammen.',
          why: 'Die Dame kontrolliert die 8. Reihe, der König die 7. Reihe (a7, b7, c7). Kein Fluchtfeld mehr.',
        },
      },
      {
        kind: 'info',
        title: 'Achtung: Patt',
        fen: 'k7/2Q5/1K6/8/8/8/8/8 b - - 0 1',
        text: {
          short: 'Schwarz ist am Zug, steht NICHT im Schach, hat aber keinen legalen Zug: Das ist Patt – und Patt ist Remis!',
          why: 'Alle Felder um den König (a7, b7, b8) sind angegriffen. Weiß hatte eine gewonnene Stellung und hat sie verschenkt.',
          pro: 'Patt ist die wichtigste Rettungsressource im Endspiel. Starke Spieler suchen in verlorenen Stellungen gezielt nach Pattideen (z. B. König in der Ecke, Turm opfert sich mit „Desperado“-Schachs).',
        },
        arrows: ['a7', 'b7', 'b8'],
      },
      {
        kind: 'move',
        title: 'Matt statt Patt',
        fen: 'k7/8/1K6/8/8/8/2Q5/8 w - - 0 1',
        prompt: {
          short: 'Setze matt – aber tappe nicht in die Pattfalle!',
          why: 'Wenn die Dame das falsche Feld wählt, hat Schwarz keinen Zug mehr und steht nicht im Schach.',
        },
        solution: ['Qc8#'],
        mistakes: [
          {
            san: 'Qc7',
            text: {
              short: 'Patt! Schwarz hat keinen Zug und steht nicht im Schach – Remis.',
              why: 'Vor jedem Zug in so einer Stellung fragen: Hat der Gegner danach noch einen legalen Zug? Wenn nicht, muss es Schach sein.',
            },
          },
        ],
        success: {
          short: 'Matt! Die Dame gibt Schach auf der 8. Reihe, der König deckt die 7. Reihe.',
        },
      },
    ],
    takeaways: [
      'Aus dem Schach: **Ziehen, Blocken oder Schlagen**.',
      'Matt = Schach + keine Rettung. Patt = kein Schach + kein Zug = Remis.',
      'Vor dem letzten Zug immer prüfen: Hat der Gegner noch einen Zug?',
    ],
    pitfalls: ['Mit Dame oder Turm den König so einengen, dass er Patt ist.', 'Grundreihe ohne Luftloch lassen.'],
  },
  {
    id: 'g-sonderzuege',
    title: 'Rochade, en passant, Umwandlung',
    category: 'grundlagen',
    level: 1,
    summary: 'Die drei Sonderregeln, die jeder kennen muss – plus ein Profi-Trick.',
    steps: [
      {
        kind: 'move',
        title: 'Rochade',
        fen: 'r3k2r/pppqbppp/2np1n2/4p3/4P3/2NP1N2/PPPQBPPP/R3K2R w KQkq - 0 1',
        prompt: {
          short: 'Rochiere kurz: Zieh den König zwei Felder Richtung Turm (e1 → g1).',
          why: 'Die Rochade bringt den König in Sicherheit und den Turm ins Spiel – zwei Aufgaben mit einem Zug.',
          pro: 'Regeln: König und Turm dürfen noch nicht gezogen haben, die Felder dazwischen müssen frei sein, und der König darf nicht im Schach stehen, durch ein angegriffenes Feld ziehen oder im Schach landen.',
        },
        solution: ['O-O'],
        success: {
          short: 'Kurze Rochade (O-O): König auf g1, Turm auf f1.',
          why: 'Die kurze Rochade ist schneller (nur Springer und Läufer müssen weg) und der König steht in der Ecke hinter drei Bauern.',
        },
      },
      {
        kind: 'move',
        title: 'En passant',
        fen: 'rnbqkbnr/ppp1pppp/8/3pP3/8/8/PPPP1PPP/RNBQKBNR w KQkq d6 0 3',
        prompt: {
          short: 'Schwarz hat gerade d7–d5 gezogen – am Bauern e5 vorbei. Schlag ihn „im Vorbeigehen“!',
          why: 'Ein Bauer, der mit einem Doppelschritt neben deinen Bauern zieht, darf im direkt folgenden Zug so geschlagen werden, als wäre er nur ein Feld gegangen.',
          pro: 'Nur direkt im nächsten Zug erlaubt! Die Regel entstand, als der Doppelschritt eingeführt wurde – damit Bauern nicht einfach an Gegnern vorbeischleichen können.',
        },
        hint: 'Der Bauer e5 schlägt schräg nach d6.',
        solution: ['exd6'],
        success: { short: 'En passant! Dein Bauer landet auf d6, der schwarze Bauer von d5 verschwindet.' },
      },
      {
        kind: 'move',
        title: 'Umwandlung',
        fen: '8/4P1k1/8/8/8/8/8/4K3 w - - 0 1',
        prompt: { short: 'Zieh den Bauern auf die letzte Reihe und wandle ihn in eine Dame um.' },
        solution: ['e8=Q'],
        success: {
          short: 'Eine neue Dame! In fast allen Fällen ist die Dame die beste Wahl.',
          why: 'Man darf auch Turm, Läufer oder Springer wählen – selbst wenn man die Dame noch hat. Man kann also theoretisch 9 Damen haben.',
        },
      },
      {
        kind: 'move',
        title: 'Profi-Trick: Unterverwandlung',
        fen: '8/2P1k3/1q6/8/8/8/1P6/K7 w - - 0 1',
        prompt: {
          short: 'Wandle um – aber so, dass du die schwarze Dame gewinnst!',
          why: 'Eine Dame auf c8 greift den König nicht an. Welche Figur auf c8 gäbe Schach UND würde die Dame auf b6 angreifen?',
          pro: 'Unterverwandlungen in einen Springer kommen in der Praxis vor allem wegen Gabeln und Schachs vor; in einen Turm/Läufer meist, um Patt zu vermeiden.',
        },
        hint: 'Denk an die Gangart des Springers.',
        solution: ['c8=N+'],
        mistakes: [
          {
            san: 'c8=Q',
            text: {
              short: 'Dame gegen Dame – das ist höchstens ausgeglichen. Mit einem Springer hättest du König und Dame gleichzeitig angegriffen.',
            },
          },
        ],
        success: {
          short: 'Springergabel mit Schach! Nach dem Königszug schlägst du die Dame auf b6.',
          why: 'Der Springer auf c8 greift e7 (König) und b6 (Dame) an. Schwarz muss den König retten – die Dame fällt.',
        },
      },
    ],
    takeaways: ['Rochade: König 2 Felder, Turm springt darüber.', 'En passant nur direkt nach dem Doppelschritt.', 'Umwandlung: meistens Dame – aber immer kurz an Springer denken!'],
  },
  {
    id: 'g-prinzipien',
    title: 'Die 3 Eröffnungsprinzipien',
    category: 'grundlagen',
    level: 1,
    summary: 'Zentrum, Entwicklung, Königssicherheit – der Kompass für die ersten Züge.',
    steps: [
      {
        kind: 'info',
        title: 'Das Zentrum',
        text: {
          short: 'Die vier Felder d4, e4, d5 und e5 sind das Zentrum. Wer sie kontrolliert, hat mehr Platz und beweglichere Figuren.',
          why: 'Ein Springer im Zentrum greift 8 Felder an, am Rand nur 4, in der Ecke nur 2. Figuren in der Mitte können schnell auf beide Flügel wechseln.',
          pro: 'Die „Hypermoderne“ Schule (Réti, Nimzowitsch) zeigte: Man muss das Zentrum nicht besetzen, man kann es auch von der Seite kontrollieren und später angreifen (z. B. Königsindisch, Grünfeld).',
        },
        arrows: ['d4', 'e4', 'd5', 'e5'],
      },
      {
        kind: 'move',
        title: 'Zug 1',
        prompt: {
          short: 'Besetze das Zentrum mit einem Bauern.',
          why: 'Ein Zentrumsbauer kontrolliert wichtige Felder und öffnet gleichzeitig Linien für Dame und Läufer.',
        },
        solution: ['e4', 'd4'],
        reply: 'e5',
        mistakes: [
          { soft: true, san: 'a4', text: { short: 'Ein Randbauer tut nichts fürs Zentrum und entwickelt keine Figur. Verlorene Zeit.' } },
          { soft: true, san: 'h4', text: { short: 'Randbauernzüge in der Eröffnung sind meist Zeitverschwendung und schwächen deinen König.' } },
        ],
        success: {
          short: '1.e4 – der beliebteste erste Zug. Er kontrolliert d5 und öffnet Dame und Läufer f1.',
          why: 'Schwarz antwortet symmetrisch mit 1…e5 und beansprucht ebenfalls das Zentrum.',
        },
      },
      {
        kind: 'move',
        title: 'Entwickle mit Drohung',
        prompt: {
          short: 'Entwickle eine Figur und greife dabei den Bauern e5 an.',
          why: 'Entwicklung heißt: Figuren von der Grundreihe ins Spiel bringen. Am besten mit Tempo – also mit einer Drohung, auf die der Gegner reagieren muss.',
        },
        solution: ['Nf3'],
        reply: 'Nc6',
        mistakes: [
          {
            soft: true,
            san: 'Qh5',
            text: {
              short: 'Die Dame kommt zu früh. Nach …Sc6 und …Sf6 wird sie mit Tempo gejagt und du verlierst Zeit.',
              why: 'Die Dame ist zu wertvoll, um sie früh ins Getümmel zu schicken – jede kleine Figur kann sie vertreiben.',
            },
          },
          {
            soft: true,
            san: 'Qf3',
            text: { short: 'Die Dame nimmt dem Springer sein bestes Feld f3 weg und kann später gejagt werden.' },
          },
        ],
        success: {
          short: 'Sf3 entwickelt und greift e5 an. Schwarz deckt mit …Sc6 – ebenfalls mit Entwicklung.',
          why: '„Springer vor Läufer“ ist eine alte Faustregel: Für Springer ist das beste Feld oft sofort klar (f3/c3), für Läufer noch nicht.',
        },
      },
      {
        kind: 'move',
        title: 'Aktiver Läufer',
        prompt: {
          short: 'Entwickle deinen Läufer auf ein aktives Feld.',
          why: 'Läufer lieben lange, offene Diagonalen. Welches Feld zielt auf den schwächsten Punkt von Schwarz, f7?',
        },
        solution: ['Bc4', 'Bb5'],
        reply: 'Bc5',
        mistakes: [
          { soft: true, san: 'Be2', text: { short: 'Nicht falsch, aber passiv. Von c4 aus zielt der Läufer auf f7 – viel aktiver.' } },
        ],
        success: {
          short: 'Lc4 zielt auf f7 – das Feld, das nur der schwarze König verteidigt. Das ist die Italienische Partie.',
          why: 'Lb5 (Spanisch) wäre ebenfalls stark: Er greift den Verteidiger von e5 an.',
        },
        successArrows: ['c4f7'],
      },
      {
        kind: 'move',
        title: 'König in Sicherheit',
        prompt: {
          short: 'Bring deinen König in Sicherheit.',
          why: 'Der König in der Mitte ist gefährdet, sobald Linien geöffnet werden. Die Rochade löst das und verbindet die Türme.',
        },
        solution: ['O-O'],
        reply: 'Nf6',
        mistakes: [
          { soft: true, san: 'Ng5', text: { short: 'Die gleiche Figur zweimal zu ziehen, bevor alle entwickelt sind, kostet Zeit. Und der Angriff auf f7 ist noch verfrüht.' } },
        ],
        success: {
          short: 'Rochade! In nur vier Zügen hat Weiß Zentrum, Entwicklung und Königssicherheit erreicht.',
          pro: 'Das ist das Giuoco Piano. Der Plan für Weiß lautet oft c3 und d4, um das Zentrum zu übernehmen.',
        },
      },
      {
        kind: 'info',
        title: 'Die Checkliste',
        text: {
          short: '1) Zentrum besetzen. 2) Leichtfiguren entwickeln (Springer, Läufer). 3) Rochieren. 4) Türme verbinden.',
          why: 'Wer diese Punkte schneller erreicht als der Gegner, hat einen „Entwicklungsvorsprung“ – und kann oft zuerst angreifen.',
          pro: 'Regeln sind Leitplanken, keine Gesetze: Konkrete Varianten schlagen Prinzipien. Aber wer gegen Prinzipien verstößt, braucht einen konkreten Grund.',
        },
      },
    ],
    takeaways: ['**Zentrum** mit e4/d4 besetzen', '**Entwickeln**: jede Figur einmal, möglichst mit Tempo', '**Rochieren** – meistens kurz, meistens früh'],
    pitfalls: ['Dame zu früh herausbringen.', 'Dieselbe Figur mehrmals ziehen.', 'Randbauern statt Figuren ziehen.', 'Den König in der Mitte lassen.'],
  },
  {
    id: 'g-schaefermatt',
    title: 'Das Schäfermatt – und wie man es abwehrt',
    category: 'grundlagen',
    level: 1,
    summary: 'Die berühmteste Anfängerfalle. Erkenne sie und bestrafe den Angreifer.',
    steps: [
      {
        kind: 'info',
        play: ['e4', 'e5', 'Bc4', 'Nc6', 'Qh5'],
        text: {
          short: 'Weiß greift mit Dame UND Läufer das Feld f7 an. Es droht Dxf7 matt!',
          why: 'f7 ist nur vom König verteidigt. Zwei Angreifer gegen einen Verteidiger – das geht schief, wenn Schwarz nichts tut.',
          pro: 'Gegen starke Spieler ist Dh5 schlecht: Die Dame wird mit Tempo vertrieben. Aber wer die Drohung übersieht, verliert sofort.',
        },
        arrows: ['h5f7', 'c4f7', 'e5'],
      },
      {
        kind: 'move',
        title: 'Verteidige f7',
        prompt: {
          short: 'Schwarz am Zug: Wehre das Matt auf f7 ab – und pass auf e5 auf!',
          why: 'Die Dame auf h5 greift auch e5 an. Ein guter Zug verstellt die Diagonale h5–f7 oder deckt f7.',
        },
        solution: ['g6', 'Qe7', 'Qf6'],
        reply: 'Qf3',
        mistakes: [
          {
            san: 'Nf6',
            text: {
              short: 'Sf6?? greift die Dame an, übersieht aber: Dxf7 ist MATT.',
              why: 'Immer zuerst die Drohung des Gegners prüfen – erst dann an eigene Angriffe denken.',
            },
          },
        ],
        success: {
          short: '…g6 blockiert die Diagonale und vertreibt die Dame. Aber Weiß droht mit Df3 schon wieder Dxf7 matt!',
          why: '…De7 ist ebenfalls solide. Wichtig ist: f7 muss gedeckt oder die Angriffslinie verstellt sein.',
        },
      },
      {
        kind: 'move',
        title: 'Noch einmal f7',
        prompt: {
          short: 'Weiß droht erneut Dxf7 matt. Verteidige – am besten mit einer Entwicklung.',
          why: 'Welche Figur kann sich entwickeln und gleichzeitig die Linie f3–f7 blockieren?',
        },
        solution: ['Nf6'],
        reply: 'Ne2',
        mistakes: [
          {
            san: 'Nd4',
            text: {
              short: 'Sd4 greift die Dame an, aber Dxf7 ist wieder MATT.',
              why: 'Gegenangriff ist nur gut, wenn er schneller oder stärker ist als die gegnerische Drohung. Matt ist immer schneller.',
            },
          },
        ],
        success: {
          short: 'Sf6 entwickelt und blockiert die f-Linie. Die weiße Dame steht jetzt schlecht und nimmt dem Springer g1 sein bestes Feld.',
          why: 'Schwarz hat nun mehr Figuren entwickelt. Das frühe Damenmanöver hat Weiß nur Zeit gekostet.',
        },
      },
      {
        kind: 'info',
        title: 'Bestrafe die Dame',
        text: {
          short: 'Jetzt kann Schwarz mit …Sd4 die Dame angreifen und gleichzeitig c2 bedrohen. Schwarz steht bereits besser.',
          pro: 'Merke: Eine früh entwickelte Dame ist eine Zielscheibe. Jede Figur, die sie mit Tempo angreift, gewinnt Zeit für die eigene Entwicklung.',
        },
        arrows: ['c6d4', 'd4f3', 'd4c2'],
      },
      {
        kind: 'move',
        title: 'Und wenn Schwarz nicht aufpasst?',
        fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4',
        prompt: { short: 'Schwarz hat 3…Sf6?? gespielt. Setze matt!' },
        solution: ['Qxf7#'],
        success: {
          short: 'Schäfermatt! Die Dame ist vom Läufer gedeckt, der König kann sie nicht schlagen.',
          why: 'Das passiert Millionen Mal pro Jahr in Online-Partien. Jetzt nicht mehr dir.',
        },
      },
    ],
    takeaways: ['f7/f2 ist der schwächste Punkt in der Eröffnung.', 'Erst die gegnerische Drohung prüfen, dann den eigenen Zug.', 'Gegen frühe Damenausflüge: mit Tempo entwickeln.'],
  },
  {
    id: 'g-tauschbilanz',
    title: 'Angreifer und Verteidiger zählen',
    category: 'grundlagen',
    level: 2,
    summary: 'Wer gewinnt den Abtausch? Mit der Tauschbilanz rechnest du es sicher aus.',
    steps: [
      {
        kind: 'info',
        fen: 'r2qk2r/ppp2ppp/4p3/3n4/8/1BN5/PPP2PPP/3R1RK1 w kq - 0 1',
        text: {
          short: 'Der Springer d5 wird dreimal angegriffen (Sc3, Lb3, Td1) und zweimal verteidigt (Bauer e6, Dame d8).',
          why: 'Mehr Angreifer als Verteidiger heißt: Am Ende des Abtauschs bleibt eine Figur von dir auf d5 stehen. Aber das allein reicht nicht – die Reihenfolge zählt!',
          pro: 'Röntgen-Effekte zählen mit: Der Turm d1 greift d5 „durch“ nichts hindurch an, aber wenn Figuren auf der Linie stünden, würde er nach einem Abtausch mitwirken.',
        },
        arrows: ['c3d5', 'b3d5', 'd1d5', '?e6d5', '?d8d5'],
      },
      {
        kind: 'move',
        title: 'Die richtige Reihenfolge',
        prompt: {
          short: 'Schlag auf d5 – aber mit der richtigen Figur zuerst.',
          why: 'Faustregel: Mit der billigsten Figur zuerst schlagen. Sonst verlierst du beim Zurückschlagen eine wertvolle Figur.',
          pro: 'Tauschbilanz: Liste Angreifer und Verteidiger aufsteigend nach Wert, simuliere den Abtausch und stoppe an der Stelle, die für die jeweilige Seite am besten ist.',
        },
        solution: ['Nxd5', 'Bxd5'],
        mistakes: [
          {
            san: 'Rxd5',
            text: {
              short: 'Nach Txd5 exd5 hast du einen Turm (5) für einen Springer (3) gegeben – und Schwarz schlägt mit dem billigsten Bauern.',
              why: 'Die teuerste Figur zuerst einzusetzen, ist fast immer falsch.',
            },
          },
        ],
        success: {
          short: 'Richtig! Nach …exd5 Lxd5 hat Weiß einen Bauern gewonnen – die Dame wird nicht zurückschlagen, sonst folgt Txd5.',
          why: 'Springer gegen Springer ist neutral, danach schlägt der Läufer einen Bauern. Schlägt die Dame auf d5, gewinnt der Turm die Dame.',
        },
      },
    ],
    takeaways: ['Zähle Angreifer und Verteidiger.', 'Schlage mit der **billigsten** Figur zuerst.', 'Der Gegner muss nicht zurückschlagen – rechne mit seiner besten Option.'],
  },
  {
    id: 'g-mattbilder',
    title: 'Fünf Mattbilder, die du kennen musst',
    category: 'grundlagen',
    level: 2,
    summary: 'Muster erkennen statt rechnen: die Klassiker unter den Mattbildern.',
    steps: [
      {
        kind: 'move',
        title: 'Der Kuss des Todes',
        fen: '6k1/5p1p/5PpQ/8/8/8/8/6K1 w - - 0 1',
        prompt: {
          short: 'Setze in einem Zug matt.',
          why: 'Die Dame direkt neben dem König, gedeckt von einer eigenen Figur – der König kann sie nicht schlagen.',
        },
        solution: ['Qg7#'],
        success: {
          short: 'Matt! Der Bauer f6 deckt die Dame auf g7.',
          why: 'Dieses Muster entsteht oft, wenn ein Bauer bis f6 vorstößt und die Dame über h6 kommt.',
        },
      },
      {
        kind: 'move',
        title: 'Das Arabische Matt',
        fen: '7k/1R6/5N2/8/8/8/8/7K w - - 0 1',
        prompt: {
          short: 'Turm und Springer: Setze matt!',
          why: 'Der Springer auf f6 kontrolliert g8 und h7. Welches Feld braucht der Turm?',
        },
        solution: ['Rh7#'],
        mistakes: [
          { san: 'Rb8+', text: { short: 'Schach, aber der König entkommt nach g7 – das Feld kontrolliert der Springer nicht.' } },
        ],
        success: {
          short: 'Arabisches Matt: Der Turm auf h7 ist vom Springer gedeckt, g8 und g7 sind ebenfalls kontrolliert.',
          pro: 'Eines der ältesten dokumentierten Mattbilder – es stammt aus dem arabischen Schatrandsch vor über 1000 Jahren.',
        },
      },
      {
        kind: 'move',
        title: 'Das erstickte Matt',
        fen: '6rk/6pp/8/6N1/8/8/8/6K1 w - - 0 1',
        prompt: {
          short: 'Setze mit dem Springer matt.',
          why: 'Der König ist von seinen eigenen Figuren eingemauert. Welches Feld greift h8 an?',
        },
        solution: ['Nf7#'],
        success: {
          short: 'Ersticktes Matt! Der König kann nirgendwohin – seine eigenen Figuren „ersticken“ ihn.',
          pro: 'In der Partie entsteht es oft durch „Philidors Vermächtnis“: Sf7+ Kg8, Sh6++ Kh8, Dg8+!! Txg8, Sf7#.',
        },
      },
      {
        kind: 'move',
        title: 'Treppenmatt mit zwei Türmen',
        fen: '6k1/R7/8/8/8/8/8/1R4K1 w - - 0 1',
        prompt: {
          short: 'Setze matt.',
          why: 'Ein Turm sperrt die 7. Reihe, der andere …',
        },
        solution: ['Rb8#'],
        success: {
          short: 'Matt! Ein Turm hält die 7. Reihe, der andere gibt auf der 8. Reihe Schach.',
          why: 'So kannst du mit zwei Türmen (oder Turm + Dame) jeden König an den Rand treiben: abwechselnd Reihe für Reihe – wie eine Treppe.',
        },
      },
    ],
    takeaways: ['Kuss des Todes: Dame neben dem König, gedeckt.', 'Arabisch: Turm + Springer in der Ecke.', 'Erstickt: Springer gegen eingemauerten König.', 'Treppe: zwei Schwerfiguren im Wechsel.'],
  },
];
