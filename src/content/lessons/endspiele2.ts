import type { Lesson } from '../types';

// Alle Stellungen sind mit der Lichess-Endspieldatenbank (Syzygy) geprüft.
export const endspiele2: Lesson[] = [
  {
    id: 'e-koenig-vor-bauer',
    title: 'König vor dem Bauern: die 6. Reihe',
    category: 'endspiele',
    level: 2,
    summary: 'Steht dein König vor dem Bauern auf der 6. Reihe, gewinnst du – wenn du weißt, wie.',
    steps: [
      {
        kind: 'info',
        fen: '4k3/8/4K3/4P3/8/8/8/8 w - - 0 1',
        text: {
          short: 'Der weiße König steht auf der 6. Reihe VOR seinem Bauern. Das gewinnt immer (außer beim Randbauern) – egal, wer am Zug ist.',
          why: 'Die Felder d6, e6 und f6 sind Schlüsselfelder für den Bauern e5. Der König ist schon da – jetzt muss er nur richtig weitergehen.',
          pro: 'Merksatz: König auf der 6. Reihe vor dem Bauern = Gewinn. Beim Randbauern (a/h) reicht es nicht: Der Verteidiger hält in der Ecke.',
        },
        arrows: ['d6', 'e6', 'f6'],
      },
      {
        kind: 'move',
        title: 'Umgehen',
        prompt: {
          short: 'Weiß am Zug. Umgehe den schwarzen König, damit der Bauer vorrücken kann.',
          why: 'Mit dem König zur Seite und nach vorne – der Bauer folgt später.',
        },
        solution: ['Kd6', 'Kf6'],
        mistakes: [
          { san: 'Kd5', text: { short: 'Zurückweichen gibt die 6. Reihe auf – laut Datenbank nur noch Remis.' } },
          { san: 'Kf5', text: { short: 'Der König verlässt die 6. Reihe – nur noch Remis.' } },
        ],
        success: { short: 'Kd6 (oder Kf6) – der König führt, der Bauer folgt. Schwarz kann die Umwandlung nicht mehr verhindern.' },
      },
      {
        kind: 'move',
        title: 'Bauer und König auf der 6.',
        fen: '3k4/8/3PK3/8/8/8/8/8 w - - 0 1',
        prompt: {
          short: 'Weiß am Zug: Der Bauer steht schon auf der 6. Reihe. Welcher Zug gewinnt sofort?',
          why: 'Wird der Bauer auf d7 vom König gedeckt, kommt der schwarze König nicht mehr an ihn heran.',
        },
        solution: ['d7'],
        mistakes: [
          { san: 'Kd5', text: { short: 'Nach Kd5 kommt …Kd7 – der schwarze König blockiert, Remis.' } },
        ],
        success: {
          short: 'd7! Der Bauer ist gedeckt, der schwarze König muss weichen, dann folgt Ke7 und d8=D.',
        },
      },
    ],
    takeaways: ['König vor dem Bauern auf der 6. Reihe gewinnt (außer Randbauer).', 'Den gegnerischen König umgehen, nicht zurückweichen.'],
  },
  {
    id: 'e-ungleiche-laeufer',
    title: 'Ungleichfarbige Läufer',
    category: 'endspiele',
    level: 3,
    summary: 'Zwei Bauern mehr – und trotzdem Remis? Warum ungleiche Läufer so remislastig sind.',
    steps: [
      {
        kind: 'info',
        fen: '8/3k4/8/2P1P3/3K4/4B3/8/5b2 w - - 0 1',
        text: {
          short: 'Weiß hat zwei Bauern mehr, aber das ist laut Datenbank **Remis**. Der schwarze Läufer hält die hellen Felder, der König blockiert.',
          why: 'Ungleichfarbige Läufer können sich nie tauschen und nie dieselben Felder angreifen. Der Verteidiger stellt König und Läufer auf die Farbe, die der gegnerische Läufer nicht erreicht.',
          pro: 'Faustregel: Mit ungleichfarbigen Läufern gewinnen meist nur zwei Bauern, die weit auseinander stehen (mindestens drei Linien) – oder verbundene Bauern, die weit genug vorgerückt sind.',
        },
        arrows: ['c6', 'e6', 'd7'],
      },
      {
        kind: 'info',
        fen: '8/3k4/8/2PP4/3K4/4B3/8/5b2 w - - 0 1',
        text: {
          short: 'Hier dagegen stehen die Bauern verbunden auf c5 und d5 – laut Datenbank ein **Gewinn** für Weiß.',
          why: 'Verbundene Bauern schützen sich gegenseitig. Mit König und Läufer wird ein Bauer nach vorne geschoben, bis der Verteidiger seinen Läufer opfern muss.',
          pro: 'Im Mittelspiel ist es umgekehrt: Ungleichfarbige Läufer begünstigen den Angreifer, weil sein Läufer Felder angreift, die der Verteidiger-Läufer nicht decken kann.',
        },
        arrows: ['c5c6', 'd5d6'],
      },
    ],
    takeaways: ['Ungleiche Läufer: sehr remislastig im Endspiel.', 'Verteidiger: blockiere auf der Farbe deines Läufers.', 'Im Mittelspiel: Vorteil für den Angreifer.'],
  },
  {
    id: 'e-vancura',
    title: 'Vancura: Turm gegen Turm und a-Bauer',
    category: 'endspiele',
    level: 4,
    summary: 'Die Standardverteidigung gegen den Randbauern mit Turm davor.',
    orientation: 'black',
    fen: 'R7/6k1/P7/8/8/8/5r2/6K1 b - - 0 1',
    steps: [
      {
        kind: 'info',
        text: {
          short: 'Weiß hat einen a-Bauern, der Turm steht davor auf a8. Schwarz verteidigt sich mit der **Vancura-Stellung**: Turm auf die 6. Reihe, er greift den Bauern von der Seite an.',
          why: 'Von der Seite hält der schwarze Turm den Bauern fest und kann gleichzeitig Schach von hinten geben, wenn der weiße König sich nähert.',
          pro: 'Die Stellung ist nach Josef Vančura (1924) benannt. Wichtig: Der schwarze König bleibt auf g7/h7 – dort kann ihn der Turm a8 nicht mit Schach vertreiben, und er hält das Feld a7 indirekt.',
        },
        arrows: ['f2f6', 'f6a6', 'g7'],
      },
      {
        kind: 'move',
        title: 'Die Vancura-Stellung',
        prompt: {
          short: 'Bring deinen Turm auf die 6. Reihe und greife den Bauern von der Seite an.',
        },
        solution: ['Rf6'],
        mistakes: [
          { san: 'Rf8', text: { short: 'Passiv auf der Grundreihe: Laut Datenbank verliert das.' } },
          { san: 'Kf7', text: { short: 'Der König verlässt g7 – nach a7 und Th8 gewinnt Weiß.' } },
        ],
        success: {
          short: '…Tf6! Der Bauer a6 ist gebunden. Zieht der weiße König heran, kommen Schachs von hinten. Remis.',
          pro: 'Andere Züge wie …Ta2 (Turm hinter dem Bauern) halten ebenfalls – aber die Vancura-Stellung ist die sicherste Methode.',
        },
      },
    ],
    takeaways: ['Gegen Turm vor dem a-Bauern: Turm auf die 6. Reihe (seitlich).', 'König auf g7/h7 halten.'],
  },
];
