// Erzeugt src/content/lessons/partien.ts: Taktik-Lektionen aus echten Partiestellungen (Lichess-Puzzles, CC0).
// Jede Stellung wird so gespiegelt, dass der Lernende immer Weiß spielt; der letzte Zug des Gegners wird vorgespielt.
// Aufruf: npx tsx scripts/build-puzzle-lessons.ts  (danach npm run validate -- p-)
import { readFileSync, writeFileSync } from 'node:fs';
import { Chess } from 'chess.js';
import { mirrorFen, mirrorUci } from '../src/lib/transform';

const db = JSON.parse(readFileSync('public/data/puzzles.json', 'utf8')) as {
  puzzles: [string, string, string, number, string[]][];
  themes: Record<string, number[][]>;
};

interface Spec {
  id: string;
  title: string;
  theme: string;
  level: 1 | 2 | 3;
  summary: string;
  intro: { short: string; why: string };
  prompt: string;
  success: string;
  takeaways: string[];
}

const SPECS: Spec[] = [
  {
    id: 'p-doppelschach', title: 'Doppelschach in echten Partien', theme: 'doubleCheck', level: 2,
    summary: 'Zwei Figuren geben gleichzeitig Schach – der König MUSS ziehen.',
    intro: { short: 'Beim Doppelschach greifen zwei Figuren den König gleichzeitig an. Blocken oder Schlagen hilft nicht – nur ein Königszug.', why: 'Darum ist das Doppelschach das stärkste Abzugsschach: Selbst eine hängende Figur darf dabei angegriffen stehen bleiben.' },
    prompt: 'Finde den stärksten Zug. Gibt es ein Abzugs- oder Doppelschach?',
    success: 'Genau – so wird der König gezwungen, und die Taktik geht auf.',
    takeaways: ['Doppelschach: nur Königszüge helfen.', 'Figuren vor Linien-Figuren können mit Wucht abziehen.'],
  },
  {
    id: 'p-gefangen', title: 'Figuren einfangen', theme: 'trappedPiece', level: 2,
    summary: 'Wenn eine Figur keine sicheren Felder mehr hat, kann man sie einsammeln.',
    intro: { short: 'Eine Figur ohne Rückzugsfelder ist so gut wie verloren. Oft reicht ein ruhiger Bauernzug, um sie einzusperren.', why: 'Besonders Läufer und Damen, die tief im gegnerischen Lager stehen, werden gerne gefangen.' },
    prompt: 'Welche gegnerische Figur hat kaum noch Felder? Sperr sie ein oder greif sie an.',
    success: 'Richtig – die Figur hat keinen sicheren Ausweg mehr.',
    takeaways: ['Vor dem Ausflug ins feindliche Lager: Rückweg prüfen!', 'Erst Felder nehmen, dann angreifen.'],
  },
  {
    id: 'p-verteidigung', title: 'Verteidigen in echten Partien', theme: 'defensiveMove', level: 2,
    summary: 'Manchmal ist der beste Zug kein Angriff, sondern eine präzise Abwehr.',
    intro: { short: 'In diesen Stellungen droht dir etwas. Der beste Zug wehrt die Drohung ab – ohne neue Schwächen zu schaffen.', why: 'Starke Spieler fragen vor jedem Zug: Was will mein Gegner? Wer nur angreift, verliert gegen gute Gegner.' },
    prompt: 'Was droht dein Gegner? Finde die beste Verteidigung.',
    success: 'Gut verteidigt – die Drohung ist entschärft.',
    takeaways: ['Vor jedem Zug: Was droht der Gegner?', 'Die beste Verteidigung ist oft ein ruhiger Zug.'],
  },
  {
    id: 'p-grundreihe', title: 'Grundreihenmatt in echten Partien', theme: 'backRankMate', level: 1,
    summary: 'Der König hinter seinen Bauern eingesperrt – ein Turm oder die Dame genügt.',
    intro: { short: 'Steht der König hinter drei unbewegten Bauern, ist die Grundreihe seine Achillesferse.', why: 'Ein „Luftloch“ (h3/h6) verhindert das. In diesen Partien hat es gefehlt.' },
    prompt: 'Ist die gegnerische Grundreihe geschützt? Nutze sie aus!',
    success: 'Stark – die Grundreihe war die Schwachstelle.',
    takeaways: ['Luftloch schaffen, bevor es zu spät ist.', 'Deckt nur eine Figur die Grundreihe? Lenk sie ab!'],
  },
  {
    id: 'p-erstickt', title: 'Ersticktes Matt in echten Partien', theme: 'smotheredMate', level: 2,
    summary: 'Der König wird von seinen eigenen Figuren eingemauert – ein Springer setzt matt.',
    intro: { short: 'Beim erstickten Matt blockieren eigene Figuren alle Fluchtfelder des Königs. Nur ein Springer kann dann noch Schach geben, das man nicht blocken kann.', why: 'Das berühmteste Muster: Damenopfer auf g8, Turm schlägt, Springer setzt auf f7 matt (Philidors Vermächtnis).' },
    prompt: 'Der König hat keine Luft. Findest du das Springermatt?',
    success: 'Ersticktes Matt – wunderschön!',
    takeaways: ['König in der Ecke + eigene Figuren drumherum = Springermatt-Gefahr.', 'Oft geht ein Damenopfer voraus.'],
  },
  {
    id: 'p-umwandlung', title: 'Bauern durchbringen', theme: 'promotion', level: 1,
    summary: 'Ein Bauer kurz vor der Umwandlung ist oft mehr wert als eine Figur.',
    intro: { short: 'In diesen Partien entscheidet ein Bauer, der zur Dame wird. Manchmal muss man dafür eine Figur opfern oder den Blockeur ablenken.', why: 'Rechne genau: Wer zuerst umwandelt, mit Schach oder mit Angriff auf die gegnerische Dame, gewinnt meistens.' },
    prompt: 'Kann ein Bauer durchlaufen? Finde den Weg zur Umwandlung.',
    success: 'Richtig – der Bauer ist nicht mehr aufzuhalten.',
    takeaways: ['Freibauern müssen laufen!', 'Blockierende Figuren ablenken oder schlagen.'],
  },
  {
    id: 'p-koenigsangriff', title: 'Den offenen König angreifen', theme: 'exposedKing', level: 3,
    summary: 'Ein König ohne Bauernschutz ist ein Ziel für alle Figuren.',
    intro: { short: 'Wenn der gegnerische König ohne Bauern dasteht, lohnen sich Schachs, Opfer und das Heranführen weiterer Figuren.', why: 'Zähle Angreifer und Verteidiger am König: Hast du mehr, ist ein Angriff meist richtig.' },
    prompt: 'Der König steht offen. Wie greifst du am stärksten an?',
    success: 'Genau – der König findet keine Ruhe.',
    takeaways: ['Offener König: Schachs und Opfer prüfen.', 'Mehr Angreifer als Verteidiger = Angriff!'],
  },
  {
    id: 'p-opfer', title: 'Opfer, die sich lohnen', theme: 'sacrifice', level: 3,
    summary: 'Material hergeben, um mehr zurückzubekommen – oder matt zu setzen.',
    intro: { short: 'Ein Opfer ist ein Tausch auf Zeit: Du gibst Material, um Linien zu öffnen, den König zu entblößen oder eine Taktik zu erzwingen.', why: 'Jedes Opfer muss gerechnet werden. In diesen Partien war es der beste Zug.' },
    prompt: 'Der stärkste Zug kostet Material. Findest du ihn?',
    success: 'Mutig und richtig – das Opfer lohnt sich.',
    takeaways: ['Erst forcierende Züge prüfen: Schach, Schlag, Drohung.', 'Ein Opfer ohne Rechnung ist ein Geschenk.'],
  },
];

const PER_LESSON = 4;
const san = (fen: string, u: string) => new Chess(fen).move({ from: u.slice(0, 2), to: u.slice(2, 4), promotion: u[4] }).san;

const lessons = SPECS.map((sp) => {
  const pool = [...(sp.level === 3 ? db.themes[sp.theme][1] : db.themes[sp.theme][0]), ...db.themes[sp.theme][1]]
    .map((i) => db.puzzles[i])
    .filter((p) => p[2].split(' ').length <= 6)
    .sort((a, b) => a[3] - b[3]);
  // gleichmäßig über die Schwierigkeit verteilen
  const picks = Array.from({ length: PER_LESSON }, (_, k) => pool[Math.floor((k * (pool.length - 1)) / (PER_LESSON - 1))]);
  const steps: unknown[] = [{ kind: 'info', title: sp.title, text: sp.intro }];
  picks.forEach((p, k) => {
    let fen = p[1];
    let moves = p[2].split(' ');
    // Lernender soll Weiß spielen: nach dem ersten Gegnerzug ist der Lernende am Zug
    const solverWhite = fen.split(' ')[1] === 'b';
    if (!solverWhite) {
      fen = mirrorFen(fen, 'colors');
      moves = moves.map((u) => mirrorUci(u, 'colors'));
    }
    const c = new Chess(fen);
    const sans: string[] = [];
    for (const u of moves) {
      const s = san(c.fen(), u);
      sans.push(s);
      c.move(s);
    }
    for (let j = 1; j < sans.length; j += 2) {
      steps.push({
        kind: 'move',
        ...(j === 1 ? { fen, play: [sans[0]], title: `Partie ${k + 1} (Wertung ${p[3]})` } : { title: `Partie ${k + 1}: weiter` }),
        prompt: { short: j === 1 ? sp.prompt : 'Weiter geht es – finde den nächsten Zug.' },
        solution: [sans[j]],
        ...(sans[j + 1] ? { reply: sans[j + 1] } : {}),
        success: { short: j + 2 >= sans.length ? sp.success : 'Gut – der Gegner antwortet.' },
      });
    }
  });
  return {
    id: sp.id,
    title: sp.title,
    category: 'taktik',
    level: sp.level,
    summary: sp.summary,
    steps,
    takeaways: sp.takeaways,
    practice: { themes: [sp.theme] },
  };
});

const out = `// Automatisch erzeugt von scripts/build-puzzle-lessons.ts aus Lichess-Puzzles (CC0) – nicht von Hand bearbeiten.
import type { Lesson } from '../types';

export const partien: Lesson[] = ${JSON.stringify(lessons, null, 1)};
`;
writeFileSync('src/content/lessons/partien.ts', out);
console.log(`${lessons.length} Lektionen, ${lessons.reduce((n, l) => n + l.steps.length, 0)} Schritte`);
