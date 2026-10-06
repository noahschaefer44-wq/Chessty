// Geführte Einführungen in die Varianten: wenige Stellungen, in denen die besondere Regel den Unterschied macht.
// Züge in Kurzform: „e2e4“, Umwandlung „e7e8q“, Einsetzen „N@f7“. Geprüft in tests/variant-lessons.test.ts.

export interface VariantStep {
  title: string;
  /** Stellung (Brett-Teil + Zugrecht) */
  setup: string;
  /** Reserve der Seite am Zug (Crazyhouse) */
  pocket?: Record<string, number>;
  /** Bereits gegebene Schachs (Drei-Schach) */
  checks?: { w: number; b: number };
  text: string;
  /** Richtige Züge – oder leer, wenn jeder gewinnende Zug zählt (goal: 'win') */
  accept: string[];
  goal?: 'win';
  success: string;
  hint: string;
}

export interface VariantLessonDef {
  id: string;
  variant: string;
  title: string;
  steps: VariantStep[];
}

export const VARIANT_LESSONS: VariantLessonDef[] = [
  {
    id: 'crazyhouse',
    variant: 'crazyhouse',
    title: 'Crazyhouse: Einsetzen',
    steps: [
      {
        title: 'Matt durch Einsetzen',
        setup: '6rk/6pp/8/8/8/8/8/4K3 w',
        pocket: { n: 1 },
        text: 'Du hast einen Springer in der Reserve. Der schwarze König ist von eigenen Figuren eingemauert. Setz den Springer so ein, dass es Matt ist.',
        accept: ['N@f7'],
        goal: 'win',
        success: 'N@f7# – ersticktes Matt aus dem Nichts. In Crazyhouse kann jede Reservefigur sofort zuschlagen.',
        hint: 'Welches Feld greift h8 mit einem Springersprung an?',
      },
      {
        title: 'Gabel aus der Reserve',
        setup: 'q3k3/8/8/8/8/8/8/4K3 w',
        pocket: { n: 1 },
        text: 'Setz den Springer so ein, dass er König und Dame gleichzeitig angreift.',
        accept: ['N@c7'],
        success: 'N@c7+ – Schach und Angriff auf die Dame. Nach dem Königszug schlägst du die Dame.',
        hint: 'Ein Feld, das einen Springersprung von e8 UND von a8 entfernt ist.',
      },
      {
        title: 'Schach abblocken',
        setup: '4r1k1/8/8/8/8/8/8/4K3 w',
        pocket: { p: 1 },
        text: 'Du stehst im Schach. Statt den König zu ziehen, kannst du einen Bauern aus der Reserve dazwischensetzen.',
        accept: ['P@e2', 'P@e3', 'P@e4', 'P@e5', 'P@e6', 'P@e7'],
        success: 'Richtig – ein eingesetzter Stein blockt das Schach. Bauern dürfen nur nicht auf die 1. oder 8. Reihe gesetzt werden.',
        hint: 'Setz den Bauern auf die e-Linie zwischen Turm und König.',
      },
    ],
  },
  {
    id: 'atomic',
    variant: 'atomic',
    title: 'Atomschach: Explosionen',
    steps: [
      {
        title: 'Die Explosion trifft den König',
        setup: '3nk3/8/8/8/8/8/8/3QK3 w',
        text: 'Jeder Schlagzug explodiert und zerstört alle Nicht-Bauern auf den Nachbarfeldern. Schlag so, dass der schwarze König mit in die Luft fliegt!',
        accept: ['d1d8'],
        goal: 'win',
        success: 'Dxd8 – der Springer explodiert, und mit ihm der König auf e8. Sieg!',
        hint: 'Welche Figur steht direkt neben dem schwarzen König?',
      },
      {
        title: 'Bauern schlagen, König sprengen',
        setup: '6k1/5ppp/8/6N1/8/8/8/4K3 w',
        text: 'Bauern überleben Explosionen – außer dem geschlagenen. Aber der König steht direkt daneben …',
        accept: ['g5f7', 'g5h7'],
        goal: 'win',
        success: 'Sxf7 bzw. Sxh7 – die Explosion erreicht g8. Der König ist weg.',
        hint: 'Schlag einen Bauern, der neben dem König steht.',
      },
      {
        title: 'Könige nebeneinander',
        setup: '8/8/8/3k4/8/4K2q/8/8 w',
        text: 'Im Atomschach können sich Könige berühren – und dann gibt es kein Schach mehr: Wer den anderen König angreift, würde sich selbst sprengen. Rette dich vor dem Schach der Dame, indem du dich neben den schwarzen König stellst.',
        accept: ['e3d4', 'e3e4'],
        success: 'Neben dem gegnerischen König bist du sicher – keine Figur kann dort schlagen, ohne den eigenen König zu sprengen.',
        hint: 'Felder neben d5, die dein König erreicht: d4 oder e4.',
      },
    ],
  },
  {
    id: 'threecheck',
    variant: 'threecheck',
    title: 'Drei-Schach: das dritte Schach',
    steps: [
      {
        title: 'Das entscheidende Schach',
        setup: '4k3/8/8/8/8/8/8/3QK3 w',
        checks: { w: 2, b: 0 },
        text: 'Du hast schon zwei Schachs gegeben. Jedes weitere Schach gewinnt sofort – egal ob es Matt ist.',
        accept: [],
        goal: 'win',
        success: 'Drittes Schach – gewonnen! In Drei-Schach zählt jedes Schachgebot, nicht nur Matt.',
        hint: 'Gib einfach irgendein Schach mit der Dame.',
      },
    ],
  },
  {
    id: 'koth',
    variant: 'koth',
    title: 'König der Hügel',
    steps: [
      {
        title: 'Auf den Hügel',
        setup: '7k/8/8/8/8/4K3/8/8 w',
        text: 'Wer seinen König auf eines der vier Zentrumsfelder (d4, e4, d5, e5) bringt, gewinnt sofort.',
        accept: [],
        goal: 'win',
        success: 'Der König steht auf dem Hügel – gewonnen!',
        hint: 'Von e3 aus erreichst du d4 und e4.',
      },
    ],
  },
  {
    id: 'racingkings',
    variant: 'racingkings',
    title: 'Königsrennen',
    steps: [
      {
        title: 'Ins Ziel',
        setup: '8/5K2/8/8/8/8/k7/8 w',
        text: 'Wer seinen König zuerst auf die 8. Reihe bringt, gewinnt. Erreicht Weiß das Ziel, darf Schwarz noch einmal ziehen und gleichziehen – hier ist der schwarze König aber viel zu weit weg.',
        accept: [],
        goal: 'win',
        success: 'Ziel erreicht! Im Königsrennen sind Schachgebote übrigens verboten – deshalb blockiert man sich gegenseitig mit Figuren.',
        hint: 'Ein Schritt nach vorne reicht.',
      },
    ],
  },
  {
    id: 'bauernkrieg',
    variant: 'bauernkrieg',
    title: 'Bauernkrieg: der Durchbruch',
    steps: [
      {
        title: 'Drei gegen drei',
        setup: '8/ppp5/8/PPP5/8/8/8/8 w',
        text: 'Ein berühmtes Rätsel: Drei weiße gegen drei schwarze Bauern. Mit einem Opfer erzwingst du einen Freibauern, der nicht mehr aufzuhalten ist.',
        accept: ['b5b6'],
        success: 'b6!! – nach axb6 folgt c6!, nach cxb6 folgt a6! Ein Bauer läuft durch. Diesen Durchbruch gibt es auch in echten Endspielen.',
        hint: 'Opfere den mittleren Bauern.',
      },
    ],
  },
  {
    id: 'damenjagd',
    variant: 'damenjagd',
    title: 'Damenjagd: die Gabel',
    steps: [
      {
        title: 'König und Dame zugleich',
        setup: 'q3k3/8/8/3N4/8/8/8/4K3 w',
        text: 'Wer die Dame schlägt, gewinnt. Greife König und Dame mit einem Zug an!',
        accept: ['d5c7'],
        success: 'Sc7+ – Schach und Angriff auf die Dame. Nach dem Königszug schlägst du sie und gewinnst.',
        hint: 'Ein Springerzug mit Schach.',
      },
    ],
  },
  {
    id: 'capablanca',
    variant: 'capablanca',
    title: 'Capablanca: die neuen Figuren',
    steps: [
      {
        title: 'Der Kanzler springt',
        setup: '4k5/10/10/10/10/2q7/10/1C2K5 w',
        text: 'Der Kanzler (C) zieht wie Turm UND Springer. Schlag die schwarze Dame!',
        accept: ['b1c3'],
        success: 'Mit dem Springersprung b1–c3 schlägt der Kanzler die Dame.',
        hint: 'Denk an den Springer, nicht an den Turm.',
      },
      {
        title: 'Der Erzbischof',
        setup: '4k5/10/10/10/5r4/10/10/2H1K5 w',
        text: 'Der Erzbischof (E) zieht wie Läufer UND Springer. Schlag den Turm.',
        accept: ['c1f4'],
        success: 'Auf der Diagonale c1–f4 schlägt der Erzbischof wie ein Läufer.',
        hint: 'Diesmal ist es die Läufer-Gangart.',
      },
    ],
  },
  {
    id: 'kamel',
    variant: 'kamel',
    title: 'Kamelschach: der lange Sprung',
    steps: [
      {
        title: 'Kamelsprung',
        setup: '4k3/8/8/8/2r5/8/8/1L2K3 w',
        text: 'Das Kamel springt drei Felder in eine Richtung und eins zur Seite. Schlag den Turm.',
        accept: ['b1c4'],
        success: 'b1–c4: drei nach vorne, eins zur Seite. Das Kamel bleibt dabei immer auf derselben Feldfarbe.',
        hint: 'Zähle drei Reihen nach oben und eine Linie nach rechts.',
      },
    ],
  },
];
