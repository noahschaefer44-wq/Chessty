import type { Lesson } from '../types';

export const taktik: Lesson[] = [
  {
    id: 't-gabel',
    title: 'Die Gabel',
    category: 'taktik',
    level: 1,
    summary: 'Ein Zug, zwei Angriffe: das häufigste taktische Motiv.',
    steps: [
      {
        kind: 'move',
        title: 'Die Springergabel',
        fen: 'r3k3/8/8/1N6/8/8/7P/4K3 w - - 0 1',
        prompt: {
          short: 'Finde ein Feld, von dem der Springer König UND Turm angreift.',
          why: 'Springer sind die Gabel-Könige: Ihr Angriff lässt sich nicht blocken, und sie greifen Figuren auf Feldern beider Farben an.',
          pro: 'Trick zum Finden: Suche Felder, die von zwei gegnerischen Figuren genau einen „Springersprung“ entfernt sind.',
        },
        solution: ['Nc7+'],
        mistakes: [
          { san: 'Nd6+', text: { short: 'Schach – aber vom Feld d6 aus greift der Springer den Turm auf a8 nicht an.' } },
        ],
        success: {
          short: 'Gabel mit Schach! Der König muss ziehen, danach schlägt der Springer den Turm.',
          why: 'Weil es Schach ist, hat Schwarz keine Zeit, den Turm zu retten. Eine Gabel mit Schach ist fast immer tödlich.',
        },
        successArrows: ['c7e8', 'c7a8'],
      },
      {
        kind: 'move',
        title: 'Die Bauerngabel',
        fen: '4k3/8/2n1b3/8/3PP3/8/8/4K3 w - - 0 1',
        prompt: {
          short: 'Auch Bauern können gabeln. Greife zwei Figuren gleichzeitig an!',
          why: 'Ein Bauer ist nur 1 wert – wenn er zwei Leichtfiguren angreift, verliert der Gegner in jedem Fall Material.',
        },
        solution: ['d5'],
        mistakes: [
          { san: 'e5', text: { short: 'Der Bauer auf e5 greift nichts Wichtiges an. Gesucht ist ein Feld zwischen Springer und Läufer.' } },
        ],
        success: {
          short: 'd5! Der Bauer greift c6 und e6 an – und ist vom Bauern e4 gedeckt.',
          why: 'Schlägt der Läufer auf d5, schlägt e4 zurück und die Gabel bleibt bestehen. Eine Figur geht verloren.',
          pro: 'Bauerngabeln entstehen oft in der Eröffnung, z. B. nach …Sxe4 Sxe4 d5 – die „Gabel-Finte“ im Zweispringerspiel und in der Italienischen Partie.',
        },
        successArrows: ['d5c6', 'd5e6'],
      },
      {
        kind: 'move',
        title: 'Die Damengabel',
        fen: '6k1/6pp/8/8/8/8/r4PPP/3Q2K1 w - - 0 1',
        prompt: {
          short: 'Die Dame kann in fast alle Richtungen gabeln. Gewinne den Turm!',
          why: 'Suche ein Feld, von dem die Dame Schach gibt und gleichzeitig den ungedeckten Turm angreift.',
        },
        solution: ['Qd5+', 'Qb3+'],
        success: {
          short: 'Dd5+ greift König (über e6–f7) und Turm a2 (über c4–b3) an. Db3+ funktioniert genauso.',
          why: 'Wichtig: Die Gabel muss auf einer Linie liegen, auf der der Turm NICHT zurückschlagen kann – also auf einer Diagonale.',
          pro: 'Ungedeckte Figuren sind die Voraussetzung jeder Doppelangriffs. Nunn: „Loose pieces drop off“ (LPDO) – lose Figuren fallen.',
        },
        successArrows: ['d5g8', 'd5a2'],
      },
    ],
    takeaways: ['Gabel = eine Figur greift zwei Ziele an.', 'Am stärksten mit **Schach**.', 'Ungedeckte Figuren sind die besten Gabelziele.'],
    pitfalls: ['Eigene Figuren auf Feldern stehen lassen, die ein Springer „gabeln“ kann (z. B. König und Dame im Springerabstand).'],
  },
  {
    id: 't-fesselung',
    title: 'Die Fesselung',
    category: 'taktik',
    level: 2,
    summary: 'Wenn eine Figur nicht ziehen darf, wird sie zur Zielscheibe.',
    steps: [
      {
        kind: 'info',
        title: 'Absolut und relativ',
        fen: 'r1bqk2r/pppp1ppp/2n2n2/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 1',
        text: {
          short: 'Der Läufer b5 fesselt den Springer c6? Noch nicht ganz: Der Bauer d7 steht dazwischen. Wenn d7 zieht, darf der Springer nicht mehr weg – dahinter steht der König.',
          why: '**Absolute Fesselung**: Hinter der gefesselten Figur steht der König – Ziehen ist illegal. **Relative Fesselung**: Dahinter steht eine wertvollere Figur – Ziehen ist erlaubt, kostet aber Material.',
          pro: 'In der Spanischen Partie ist die „Fesselung“ nach …d6 relativ harmlos, weil Schwarz jederzeit mit …Ld7 entfesseln kann. Die Frage ist immer: Kann der Gegner die Fesselung billig lösen?',
        },
        arrows: ['b5e8', 'c6'],
      },
      {
        kind: 'move',
        title: 'Die gefesselte Figur angreifen',
        fen: '4k3/8/2n5/1B6/3P4/8/8/4K3 w - - 0 1',
        prompt: {
          short: 'Der Springer c6 ist gefesselt. Greife ihn an!',
          why: 'Eine gefesselte Figur kann nicht fliehen. Greife sie mit etwas Billigem an – am besten mit einem Bauern.',
        },
        solution: ['d5'],
        success: {
          short: 'd5! Der Springer darf nicht ziehen und geht verloren.',
          why: 'Sein einziger Ausweg wäre, dass der König vorher wegzieht – aber dann schlägt der Bauer trotzdem auf c6.',
          pro: 'Nimzowitsch: „Die gefesselte Figur muss angegriffen werden – mit Nachdruck.“ Häufig mit Bauern (…d5, e5) oder durch Anhäufen von Angreifern.',
        },
      },
      {
        kind: 'move',
        title: 'Die Dame fesseln',
        fen: 'r3k3/3q4/8/8/P7/8/7Q/4KB2 w - - 0 1',
        prompt: {
          short: 'Fessele die schwarze Dame an ihren König!',
          why: 'Ein Läufer auf der Diagonale zwischen Dame und König – und die Dame darf nicht weg. Aber pass auf: Kann sie den Läufer schlagen?',
        },
        solution: ['Bb5'],
        success: {
          short: 'Lb5! Die Dame ist absolut gefesselt. Schlägt sie den Läufer, schlägt a4 zurück – Dame gegen Läufer.',
          why: 'Der Bauer a4 deckt b5. Ohne ihn könnte die Dame den Läufer einfach nehmen.',
        },
        successArrows: ['b5e8'],
      },
    ],
    takeaways: ['Gefesselte Figuren sind schlechte Verteidiger.', 'Greife gefesselte Figuren mit Bauern an.', 'Absolute Fesselung (König dahinter) ist die stärkste.'],
    pitfalls: ['Den eigenen König und die Dame auf eine Linie/Diagonale stellen.', 'Eine Fesselung übersehen und die gefesselte Figur als Verteidiger zählen.'],
  },
  {
    id: 't-spiess',
    title: 'Der Spieß',
    category: 'taktik',
    level: 2,
    summary: 'Die umgekehrte Fesselung: vorne der König, dahinter die Beute.',
    steps: [
      {
        kind: 'move',
        title: 'Turmspieß',
        fen: '8/8/2k4q/8/8/8/8/R5K1 w - - 0 1',
        prompt: {
          short: 'König und Dame stehen auf einer Reihe. Spieße sie auf!',
          why: 'Gib Schach auf der Linie, auf der beide stehen. Der König muss weg – und gibt die Dame dahinter frei.',
        },
        solution: ['Ra6+'],
        success: {
          short: 'Ta6+! Der König muss die 6. Reihe verlassen, danach fällt die Dame auf h6.',
          pro: 'Beim Spieß ist die vordere Figur die wertvollere. Deshalb funktioniert er fast nur mit Schach oder gegen die Dame.',
        },
        successArrows: ['a6h6'],
      },
      {
        kind: 'move',
        title: 'Läuferspieß',
        fen: '2q5/8/8/5k2/8/8/8/4KB2 w - - 0 1',
        prompt: {
          short: 'Finde den Läuferspieß.',
          why: 'König und Dame stehen auf derselben Diagonale. Von welchem Feld aus triffst du beide?',
        },
        solution: ['Bh3+'],
        success: {
          short: 'Lh3+! Der König muss die Diagonale verlassen, dann schlägt der Läufer die Dame auf c8.',
        },
        successArrows: ['h3c8'],
      },
    ],
    takeaways: ['Spieß: Schach auf einer Linie, dahinter wertvolles Material.', 'König und Dame nie auf dieselbe offene Linie stellen.'],
  },
  {
    id: 't-abzug',
    title: 'Abzug und Abzugsschach',
    category: 'taktik',
    level: 2,
    summary: 'Eine Figur zieht weg – und enthüllt einen versteckten Angriff.',
    steps: [
      {
        kind: 'info',
        fen: 'q3k3/7p/8/8/4N3/8/5PBP/6K1 w - - 0 1',
        text: {
          short: 'Der Springer e4 steht zwischen dem Läufer g2 und der schwarzen Dame a8. Zieht er weg, greift der Läufer die Dame an.',
          why: 'Das ist ein **Abzugsangriff**: zwei Figuren arbeiten mit einem Zug. Der Springer darf dabei selbst etwas bedrohen – am besten den König.',
        },
        arrows: ['g2a8', 'e4'],
      },
      {
        kind: 'move',
        title: 'Abzug mit Schach',
        prompt: {
          short: 'Zieh den Springer mit Schach weg und gewinne die Dame.',
          why: 'Wenn der Springer Schach gibt, hat Schwarz keine Zeit, die Dame zu retten.',
        },
        solution: ['Nf6+', 'Nd6+'],
        mistakes: [
          {
            san: 'Nc3',
            text: {
              short: 'Ohne Schach! Schwarz zieht die Dame einfach weg – der Abzug ist verpufft.',
              why: 'Beim Abzug muss die abziehende Figur mit Tempo ziehen: Schach, Schlagen oder eine größere Drohung.',
            },
          },
        ],
        success: {
          short: 'Abzugsangriff mit Schach! Schwarz muss den König ziehen, dann schlägt Lxa8.',
          pro: 'Die abziehende Figur darf bei einem Abzugsschach fast alles: schlagen, Schach geben, sich opfern. Deshalb ist das Abzugsschach so gefürchtet. Beim **Doppelschach** geben beide Figuren Schach – dann hilft nur ein Königszug.',
        },
        successArrows: ['g2a8'],
      },
    ],
    takeaways: ['Figuren vor Linien zu Dame/Turm/Läufer sind „geladene Kanonen“.', 'Abziehen mit Tempo (Schach, Schlagen, Drohung).'],
  },
  {
    id: 't-ablenkung',
    title: 'Ablenkung und Verteidiger beseitigen',
    category: 'taktik',
    level: 3,
    summary: 'Nimm dem Gegner den Verteidiger weg – durch Opfer oder Abtausch.',
    steps: [
      {
        kind: 'move',
        title: 'Den Blockadeturm ablenken',
        fen: '1r4k1/3P1ppp/8/8/8/8/5PPP/4R1K1 w - - 0 1',
        prompt: {
          short: 'Der Turm b8 hält den Bauern auf. Lenke ihn ab!',
          why: 'Der Turm hat zwei Aufgaben: d8 bewachen UND die Grundreihe schützen. Überlaste ihn.',
          pro: 'Überlastete Figur erkennen: Liste für jede Verteidigungsfigur auf, was sie deckt. Hat eine mehr als eine lebenswichtige Aufgabe, suche einen Zug, der beide gleichzeitig fordert.',
        },
        solution: ['Re8+'],
        mistakes: [
          {
            san: 'd8=Q+',
            text: { short: 'Der Turm schlägt einfach: …Txd8. Erst muss der Turm abgelenkt werden!' },
          },
        ],
        success: {
          short: 'Te8+! Nach …Txe8 schlägt dxe8=D+ – eine neue Dame. Weicht der König aus, schlägt Txb8.',
          why: 'Der schwarze Turm kann nicht gleichzeitig e8 und d8 bewachen.',
        },
        successArrows: ['d7e8'],
      },
      {
        kind: 'move',
        title: 'Den Verteidiger beseitigen',
        fen: 'r4rk1/ppp2ppp/5n2/6BQ/8/3B4/PPP2PPP/R5K1 w - - 0 1',
        prompt: {
          short: 'Nur der Springer f6 verhindert Dxh7 matt. Was tust du?',
          why: 'Wenn eine einzige Figur die Stellung zusammenhält, entferne sie – auch wenn das Material kostet.',
        },
        solution: ['Bxf6'],
        mistakes: [
          { san: 'Qxh7+', text: { short: '…Sxh7 – der Springer deckt h7. Zuerst muss er weg!' } },
        ],
        success: {
          short: 'Lxf6! Nach …gxf6 folgt Dxh7 matt. Schwarz verliert mindestens eine Figur.',
          why: 'Der Läufer d3 deckt h7 – die Dame ist dort unantastbar, sobald der Springer fehlt.',
          pro: 'Dieses Motiv („Verteidiger von h7 beseitigen“) ist die Grundlage vieler Königsangriffe: Lxf6, Txf6 oder Sxf6+ gefolgt von Dxh7#.',
        },
        successArrows: ['h5h7', 'd3h7'],
      },
    ],
    takeaways: ['Frage: Welche Figur hält die gegnerische Stellung zusammen?', 'Überlastete Verteidiger mit forcierenden Zügen ablenken.'],
  },
  {
    id: 't-philidor',
    title: 'Hinlenkung: Philidors Vermächtnis',
    category: 'taktik',
    level: 3,
    summary: 'Ein erzwungenes, vierzügiges Matt mit Damenopfer – der Klassiker.',
    steps: [
      {
        kind: 'info',
        fen: '4r2k/6pp/8/6N1/2Q5/8/8/6K1 w - - 0 1',
        text: {
          short: 'Der schwarze König steht in der Ecke, umgeben von eigenen Bauern. Springer und Dame arbeiten perfekt zusammen – finde die Matt-Kombination Schritt für Schritt.',
          pro: 'Das Motiv ist seit Lucena (1497) bekannt und wurde durch Philidor berühmt. Es heißt „ersticktes Matt“.',
        },
        arrows: ['c4g8', 'g5f7'],
      },
      {
        kind: 'move',
        title: 'Zug 1',
        prompt: { short: 'Beginne mit Schach.' },
        solution: ['Nf7+'],
        reply: 'Kg8',
        success: { short: 'Sf7+ Kg8 – der König muss auf die Diagonale der Dame.' },
      },
      {
        kind: 'move',
        title: 'Zug 2: Doppelschach',
        prompt: {
          short: 'Jetzt ein Doppelschach!',
          why: 'Zieh den Springer so weg, dass die Dame c4 Schach gibt UND der Springer ebenfalls.',
        },
        solution: ['Nh6+'],
        reply: 'Kh8',
        success: {
          short: 'Sh6++ – Doppelschach, der König muss zurück in die Ecke. (Nach …Kf8 wäre Df7 matt.)',
        },
      },
      {
        kind: 'move',
        title: 'Zug 3: Das Opfer',
        prompt: {
          short: 'Opfere die Dame, um das Fluchtfeld g8 zu verstopfen!',
          why: 'Das ist Hinlenkung: Der Turm wird gezwungen, sich selbst auf g8 zu stellen.',
        },
        solution: ['Qg8+'],
        reply: 'Rxg8',
        success: { short: 'Dg8+!! Txg8 – erzwungen, denn der König darf die Dame nicht schlagen (Springer deckt g8).' },
      },
      {
        kind: 'move',
        title: 'Zug 4',
        prompt: { short: 'Vollende das Matt.' },
        solution: ['Nf7#'],
        success: {
          short: 'Ersticktes Matt! Der König ist von Turm und Bauern eingemauert.',
          pro: 'Merke das Muster: Doppelschach + Damenopfer auf g8 + Springer f7. Es taucht in unzähligen Partien auf.',
        },
      },
    ],
    takeaways: ['Hinlenkung: Opfer, das eine Figur auf ein schlechtes Feld zwingt.', 'Doppelschach zwingt den König zu ziehen.'],
  },
  {
    id: 't-griechisches-geschenk',
    title: 'Das Griechische Geschenk (Lxh7+)',
    category: 'taktik',
    level: 4,
    summary: 'Das berühmteste Opfer gegen die kurze Rochade – wann es funktioniert und wann nicht.',
    fen: 'r2qk2r/1b3ppp/p3p3/1pbnP3/8/3B1N2/PP3PPP/R1BQ1RK1 b kq - 1 14',
    steps: [
      {
        kind: 'info',
        play: ['O-O'],
        text: {
          short: 'Schwarz hat gerade kurz rochiert. Der Bauer e5 hält den schwarzen Springer von f6 fern – h7 ist nur vom König gedeckt.',
          why: 'Checkliste für Lxh7+: 1) Läufer zielt auf h7, 2) Springer kann mit Schach nach g5, 3) Dame kann nach h5, 4) kein schwarzer Springer auf f6, 5) Schwarz kann g5 nicht ausreichend kontrollieren.',
          pro: 'Gegenmittel, die das Opfer widerlegen können: ein schwarzer Springer auf f6, ein Läufer auf e7 (kontrolliert g5), oder …Kg6 mit Gegenangriff. Rechne immer alle drei Königszüge (…Kg8, …Kg6, …Kh6).',
        },
        arrows: ['d3h7', 'f3g5', 'd1h5', 'e5'],
      },
      {
        kind: 'move',
        title: 'Das Opfer',
        prompt: { short: 'Die Bedingungen sind erfüllt. Schlag zu!' },
        solution: ['Bxh7+'],
        reply: 'Kxh7',
        success: { short: 'Lxh7+! Kxh7 – der König wird aus seiner Deckung gezogen.' },
      },
      {
        kind: 'move',
        title: 'Der Springer kommt',
        prompt: {
          short: 'Setz den Angriff mit Schach fort.',
          why: 'Der Springer auf g5 gibt Schach und öffnet zugleich die Diagonale d1–h5 für die Dame.',
        },
        solution: ['Ng5+'],
        reply: 'Qxg5',
        success: {
          short: 'Sg5+! Schwarz gibt lieber die Dame, denn alle Königszüge verlieren:',
          why: '…Kg8 Dh5 und Dh7# ist nicht zu verhindern. …Kh6 Sxe6+ ist ein Abzugsschach des Läufers c1 – der Springer schlägt danach die Dame. …Kg6 Dg4 oder h4–h5 treibt den König in den Tod.',
          pro: 'Diese drei Antworten sind der Kern jeder Lxh7+-Rechnung. Übe sie im „Ausprobieren“-Modus: setze den König auf g8, g6 und h6 und finde jeweils den Gewinn.',
        },
      },
      {
        kind: 'move',
        title: 'Die Ernte',
        prompt: { short: 'Schlag die Dame.' },
        solution: ['Bxg5'],
        success: {
          short: 'Lxg5: Weiß hat Dame gegen Läufer und Springer – ein gewonnenes Mittelspiel.',
          pro: 'Materialbilanz: Weiß gab Läufer + Springer (6) und bekam Dame + Bauer (10).',
        },
      },
    ],
    takeaways: ['Lxh7+ braucht: Läufer auf h7, Sg5 mit Schach, Dh5, keinen Sf6.', 'Rechne alle drei Königszüge durch (…Kg8/…Kg6/…Kh6).'],
    pitfalls: ['Das Opfer spielen, obwohl Schwarz g5 mit Le7 kontrolliert.', 'Nach …Kg6 keinen konkreten Plan haben.'],
  },
];
