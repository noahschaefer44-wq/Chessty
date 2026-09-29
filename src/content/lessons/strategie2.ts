import type { Lesson } from '../types';

export const strategie2: Lesson[] = [
  {
    id: 's-schlechteste-figur',
    title: 'Verbessere deine schlechteste Figur',
    category: 'strategie',
    level: 2,
    summary: 'Wenn du keinen Plan hast: Suche die Figur, die am wenigsten tut, und bring sie ins Spiel.',
    fen: '6k1/pp3ppp/2p1b3/3p4/3P4/2P1P3/PP3PPP/N5K1 w - - 0 1',
    steps: [
      {
        kind: 'info',
        text: {
          short: 'Der Springer a1 steht am Rand und kontrolliert fast nichts. Er ist die schlechteste Figur von Weiß.',
          why: 'Eine Partie ist so stark wie die schwächste Figur. Eine passive Figur zu aktivieren bringt oft mehr als jeder „Angriff“.',
          pro: 'Die Methode stammt aus der Schule von Dworezki: Frage in ruhigen Stellungen immer „Welche Figur steht am schlechtesten, und wo stünde sie am besten?“ – und plane den Weg dorthin.',
        },
        arrows: ['a1', 'a1b3', 'b3d2', '?a1c2'],
      },
      {
        kind: 'move',
        title: 'Den Springer aktivieren',
        prompt: {
          short: 'Bring den Springer auf den Weg in Richtung Zentrum.',
          why: 'Von b3 oder c2 aus kann er später nach d2–f3 oder c5 weiterziehen.',
        },
        solution: ['Nb3', 'Nc2'],
        mistakes: [
          { soft: true, san: 'h4', text: { short: 'Ein Randbauernzug ändert nichts an der Stellung. Der Springer bleibt nutzlos.' } },
        ],
        success: {
          short: 'Genau: Der Springer macht sich auf den Weg. Ziel ist ein Feld wie c5 oder e5, von dem er die gegnerische Stellung angreift.',
          pro: 'Im Endspiel gilt das auch für den König: Er ist oft die „schlechteste Figur“, solange er hinter den Bauern steht.',
        },
      },
    ],
    takeaways: ['Keinen Plan? Verbessere die schlechteste Figur.', 'Randfiguren ins Zentrum führen.'],
  },
  {
    id: 's-prophylaxe',
    title: 'Prophylaxe: den Plan des Gegners verhindern',
    category: 'strategie',
    level: 3,
    summary: 'Denke zuerst daran, was dein Gegner will – dann verhindere es.',
    steps: [
      {
        kind: 'info',
        play: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'a6', 'Ba4', 'Nf6', 'O-O', 'Be7', 'Re1', 'b5', 'Bb3', 'd6', 'c3', 'O-O'],
        text: {
          short: 'Spanische Partie: Weiß möchte d4 spielen. Schwarz lauert auf …Lg4, um den Springer f3 zu fesseln, der d4 unterstützt.',
          why: 'Prophylaxe heißt: Nicht nur an den eigenen Plan denken, sondern zuerst fragen: „Was würde mein Gegner tun, wenn er zweimal hintereinander ziehen dürfte?“',
          pro: 'Nimzowitsch prägte den Begriff, Petrosjan und Karpow machten ihn zur Kunst. Karpow gewann viele Partien, indem er dem Gegner schlicht jede aktive Idee nahm.',
        },
        arrows: ['!c8g4', 'f3d4', 'd2d4'],
      },
      {
        kind: 'move',
        title: 'Vorbeugen',
        prompt: {
          short: 'Welcher kleine Bauernzug verhindert die Fesselung …Lg4 und bereitet d4 vor?',
        },
        solution: ['h3'],
        mistakes: [
          {
            soft: true,
            san: 'd4',
            text: {
              short: 'Sofort d4 ist möglich, aber nach …Lg4 fesselt Schwarz den Springer und erhöht den Druck auf d4.',
            },
          },
        ],
        success: {
          short: 'h3! Die Hauptvariante der Spanischen Partie. Jetzt kommt d4 ohne lästige Fesselung.',
          pro: 'Nach 9.h3 spielt Schwarz Systeme wie Tschigorin (…Sa5), Breyer (…Sb8) oder Zaitsev (…Lb7) – alle drehen sich um das Zentrum d4/e5.',
        },
      },
    ],
    takeaways: ['Frage vor deinem Plan: Was will der Gegner?', 'Kleine Vorbeugezüge (h3, a3, Kh1) sind oft die stärksten.'],
  },
  {
    id: 's-raum-plaene',
    title: 'Raumvorteil und Flügelpläne',
    category: 'strategie',
    level: 3,
    summary: 'Geschlossenes Zentrum: Wer mehr Raum hat, greift dort an, wohin seine Bauern zeigen.',
    steps: [
      {
        kind: 'info',
        play: ['d4', 'Nf6', 'c4', 'g6', 'Nc3', 'Bg7', 'e4', 'd6', 'Nf3', 'O-O', 'Be2', 'e5', 'O-O', 'Nc6', 'd5', 'Ne7'],
        text: {
          short: 'Die Bauernkette d5/e4 (Weiß) gegen d6/e5 (Schwarz) zeigt die Richtung: Weiß hat Raum am Damenflügel und greift dort an (c4–c5), Schwarz am Königsflügel (…f5).',
          why: 'Regel: Man greift dort an, wohin die eigenen Bauern „zeigen“. Die weiße Kette zeigt nach rechts oben – Richtung Damenflügel.',
          pro: 'Das ist die Mar-del-Plata-Struktur aus der Königsindischen Verteidigung – ein Rennen der Flügelangriffe.',
        },
        arrows: ['c4c5', '?f7f5', 'd5', 'e4'],
      },
      {
        kind: 'move',
        title: 'Den Springer umgruppieren',
        prompt: {
          short: 'Der Springer f3 steht Weiß im Weg: f2–f3 (gegen …f5) ist blockiert. Wohin mit ihm?',
          why: 'Über e1 kann er nach d3 – dort unterstützt er c4–c5 und macht den f-Bauern frei.',
        },
        solution: ['Ne1', 'Nd2'],
        mistakes: [
          { soft: true, san: 'Bg5', text: { short: 'Aktiv, aber ohne Plan. Nach …h6 muss der Läufer wieder weichen.' } },
        ],
        success: {
          short: 'Se1! – der Springer geht nach d3, danach folgen f3, Le3 und c5. Der klassische Plan für Weiß.',
          pro: 'Schwarz antwortet meist mit …Sd7 und …f5. Wer zuerst am eigenen Flügel durchbricht, bekommt die Initiative.',
        },
        successArrows: ['e1d3', 'd3c5', 'f2f3'],
      },
    ],
    takeaways: ['Angreifen, wohin die Bauern zeigen.', 'Springer umgruppieren, um Bauernhebel freizumachen.'],
  },
  {
    id: 's-zwei-schwaechen',
    title: 'Das Prinzip der zwei Schwächen',
    category: 'strategie',
    level: 4,
    summary: 'Eine Schwäche lässt sich verteidigen – zwei weit voneinander entfernte meist nicht.',
    steps: [
      {
        kind: 'info',
        fen: '6k1/p4p1p/1p4p1/8/8/1P4P1/P4P1P/6K1 w - - 0 1',
        text: {
          short: 'Im Endspiel reicht eine einzelne Schwäche oft nicht zum Gewinn: Der Verteidiger stellt alle Figuren davor.',
          why: 'Die Lösung: eine **zweite Schwäche** am anderen Flügel schaffen. Der Verteidiger kann nicht gleichzeitig an zwei Orten sein.',
          pro: 'Das Prinzip ist mit Capablanca und später Karpow verbunden. Typisch: Druck gegen einen isolierten Bauern + Bauernmajorität am anderen Flügel.',
        },
        arrows: ['a7', 'h7'],
      },
      {
        kind: 'info',
        fen: '8/5pk1/p5p1/3p4/3P4/P5P1/5PK1/8 w - - 0 1',
        text: {
          short: 'Mit Königen allein: Der König greift eine Schwäche an – der gegnerische verteidigt. Dann wechselt er blitzschnell zum anderen Flügel.',
          why: 'Wer mehr Angriffsziele hat, gewinnt das „Überlastungsduell“. Deshalb gilt im Endspiel: Nicht zu früh alle Bauern tauschen, wenn du auf Gewinn spielst.',
          pro: 'Die Kunst ist die Geduld. Im Endspiel schadet ein Zug, der nichts verdirbt, selten – „Nicht eilen!“ (Schereschewski).',
        },
        arrows: ['a6', 'd5'],
      },
    ],
    takeaways: ['Eine Schwäche verteidigt man, zwei selten.', 'Geduld: Stellung verbessern, dann an zwei Flügeln Druck machen.'],
  },
  {
    id: 's-initiative',
    title: 'Initiative und Tempo',
    category: 'strategie',
    level: 2,
    summary: 'Wer Drohungen stellt, bestimmt das Spiel – der Gegner kommt nicht zu eigenen Plänen.',
    steps: [
      {
        kind: 'info',
        play: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Nf6', 'Ng5'],
        text: {
          short: 'Weiß greift sofort f7 an. Schwarz MUSS reagieren – das ist Initiative: Der Gegner tanzt nach deiner Pfeife.',
          why: 'Initiative entsteht durch Züge mit Drohung: Schach, Angriff auf Figuren, Mattdrohungen. Jede Drohung kostet den Gegner ein Tempo.',
          pro: 'Initiative ist ein vorübergehender Vorteil. Wer sie hat, muss sie in etwas Dauerhaftes umwandeln (Material, Struktur, Königsangriff) – sonst verpufft sie.',
        },
        arrows: ['g5f7', 'c4f7'],
      },
      {
        kind: 'move',
        title: 'Schwarz verteidigt aktiv',
        prompt: {
          short: 'Schwarz am Zug: Gegenangriff statt passiver Deckung!',
          why: 'Der Bauernzug ins Zentrum blockiert die Diagonale c4–f7 und greift den Läufer an.',
        },
        solution: ['d5'],
        reply: 'exd5',
        mistakes: [
          { soft: true, san: 'Qe7', text: { short: 'Deckt f7, ist aber passiv. Weiß behält die Initiative.' } },
        ],
        success: {
          short: '…d5! 5.exd5 – jetzt muss Schwarz genau spielen: 5…Sa5! (nicht 5…Sxd5?! 6.Sxf7!? – der Fried-Liver-Angriff).',
          pro: 'Nach 5…Sa5 6.Lb5+ c6 7.dxc6 bxc6 8.Le2 h6 gibt Schwarz einen Bauern, bekommt aber Entwicklungsvorsprung und Initiative – das Blatt hat sich gewendet.',
        },
      },
    ],
    takeaways: ['Initiative = Drohungen, auf die der Gegner reagieren muss.', 'Gegen Initiative: aktiv verteidigen, mit Gegendrohung.'],
  },
];
