// Eröffnungsfallen für Einsteiger und Fortgeschrittene – jede Falle aus beiden Sichten:
//  „stellen & bestrafen“: der Gegner tappt hinein, du nutzt es aus
//  „erkennen & vermeiden“: du stehst vor dem verlockenden Fehler und findest den sicheren Zug
// Alle Zugfolgen sind mit Stockfish geprüft (npm run validate -- f-).
import { Chess } from 'chess.js';
import type { Explain, Lesson, Level, Step } from './types';

export interface Trap {
  id: string;
  name: string;
  /** Eröffnung, in der die Falle vorkommt */
  opening: string;
  level: Level;
  /** Wer die Falle stellt */
  trapper: 'white' | 'black';
  /** Vollständige Zugfolge (SAN) inklusive Fehler und Bestrafung */
  line: string[];
  /** Index (Halbzug) des Fehlers des Opfers */
  blunder: number;
  /** Gute Züge statt des Fehlers (erster = Empfehlung) */
  avoid: string[];
  intro: Explain;
  /** Warum der Fehler scheitert (für die Vermeiden-Lektion) */
  blunderWhy: Explain;
  /** Erklärung nach dem sicheren Zug */
  avoidWhy: Explain;
  /** Aufgabentexte für die eigenen Züge nach dem Fehler (Reihenfolge der Bestrafung) */
  punish: { prompt: Explain; success: Explain; alt?: string[] }[];
  takeaways: string[];
}

export const TRAPS: Trap[] = [
  {
    id: 'legal',
    name: 'Légal-Matt',
    opening: 'Philidor-Verteidigung',
    level: 1,
    trapper: 'white',
    line: ['e4', 'e5', 'Nf3', 'd6', 'Bc4', 'Bg4', 'Nc3', 'g6', 'Nxe5', 'Bxd1', 'Bxf7+', 'Ke7', 'Nd5#'],
    blunder: 9,
    avoid: ['dxe5', 'Be6'],
    intro: {
      short: 'Schwarz fesselt den Springer f3 an die Dame. Weiß schlägt trotzdem auf e5 – und „opfert“ die Dame.',
      why: 'Die Fesselung durch Lg4 ist keine echte Fesselung: Hinter dem Springer steht die Dame, nicht der König. Darf Weiß die Dame hergeben, wenn dafür Matt folgt? Ja!',
      pro: 'Benannt nach Sire de Légal (18. Jahrhundert). Die Falle funktioniert, weil 4…g6? den Läufer f8 nicht rechtzeitig nach e7 bringt und f7 nur vom König gedeckt ist.',
    },
    blunderWhy: {
      short: '…Lxd1?? verliert sofort: Lxf7+ Ke7 Sd5 ist Matt. Die Dame war ein vergiftetes Geschenk.',
      why: 'Nimm nie eine Dame, ohne zu prüfen, was der Gegner danach mit Schach erreicht. Hier decken die drei weißen Leichtfiguren alle Fluchtfelder.',
    },
    avoidWhy: {
      short: '…dxe5 ist der beste Zug: Weiß gewinnt zwar mit Dxg4 einen Bauern, aber Schwarz wird nicht mattgesetzt.',
      why: 'Wenn eine Falle schon zugeschnappt ist, wähle den kleineren Schaden. Ein Bauer weniger ist besser als Matt in zwei Zügen.',
    },
    punish: [
      {
        prompt: { short: 'Schwarz hat die Dame genommen. Jetzt kommt das Schach, das alles entscheidet.', why: 'Welcher Läufer greift den König an – und ist gedeckt?' },
        success: { short: 'Lxf7+! Der Läufer ist durch den Springer e5 gedeckt, der König muss nach e7.' },
      },
      {
        prompt: { short: 'Setze matt!', why: 'Welches Feld fehlt dem König noch? Der Springer c3 kann es decken.' },
        success: { short: 'Sd5# – Matt mit drei Leichtfiguren. Das ist das Légal-Matt.', why: 'Lf7 deckt e6 und e8, Se5 deckt d7 und f7, Sd5 gibt Schach und deckt e7-Nachbarn. Der König ist gefangen.' },
      },
    ],
    takeaways: ['Eine „Fesselung“ an die Dame ist keine echte Fesselung.', 'Vor dem Schlagen der Dame: Schachs des Gegners prüfen!', 'f7 ist in der Eröffnung oft nur vom König gedeckt.'],
  },
  {
    id: 'fegatello',
    name: 'Fegatello (gebratene Leber)',
    opening: 'Zweispringerspiel',
    level: 2,
    trapper: 'white',
    line: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Nf6', 'Ng5', 'd5', 'exd5', 'Nxd5', 'Nxf7', 'Kxf7', 'Qf3+', 'Ke6', 'Nc3'],
    blunder: 9,
    avoid: ['Na5', 'b5', 'Nd4'],
    intro: {
      short: 'Weiß greift mit Sg5 den Punkt f7 an. Nach 4…d5 5.exd5 schlägt Schwarz oft natürlich mit dem Springer zurück …',
      why: '… und dann opfert Weiß den Springer auf f7, zieht den schwarzen König heraus und greift ihn mitten im Brett an.',
      pro: 'Objektiv ist 5…Sxd5 nicht sofort verloren, aber in der Praxis äußerst schwer zu verteidigen. Profis spielen 5…Sa5!, das den Läufer c4 angreift.',
    },
    blunderWhy: {
      short: '5…Sxd5?! erlaubt 6.Sxf7! Kxf7 7.Df3+ – der König muss nach e6 und steht mitten im Brett.',
      why: 'Der Springer d5 ist danach doppelt gefesselt bzw. angegriffen (Lc4, Df3, bald Sc3). Schwarz muss viele genaue Züge finden.',
    },
    avoidWhy: {
      short: '5…Sa5! greift den Läufer c4 an. Ohne den Läufer gibt es keinen Druck auf f7 – Schwarz bekommt für den Bauern gutes Spiel.',
      why: 'Das ist die Hauptvariante der Theorie: Schwarz opfert den Bauern d5 für schnelle Entwicklung und Tempo.',
    },
    punish: [
      {
        prompt: { short: 'Schwarz hat mit dem Springer zurückgeschlagen. Opfere auf f7!', why: 'Nach dem Schlagen kommt der König heraus – und deine Dame hat ein Schach.' },
        success: { short: 'Sxf7! Kxf7 – der König verlässt seine sichere Ecke.', pro: '6.d4!? ist objektiv sogar etwas stärker, aber das Opfer ist die berühmte Fortsetzung.' },
        alt: ['d4'],
      },
      {
        prompt: { short: 'Gib Schach und greife gleichzeitig den Springer d5 an.' },
        success: { short: 'Df3+ – der König muss nach e6, um den Springer d5 zu decken.' },
      },
      {
        prompt: { short: 'Greife den gefesselten Springer d5 ein weiteres Mal an.' },
        success: { short: 'Sc3 – drei Angreifer gegen d5. Schwarz steht unter enormem Druck.', why: 'Weiß droht d4, Lxd5+ und Rochade mit Te1 – der schwarze König findet kaum Ruhe.' },
      },
    ],
    takeaways: ['Gegen Sg5 im Zweispringerspiel: 4…d5 5.exd5 Sa5!', 'Ein König in der Brettmitte ist ein Angriffsziel.', 'Gefesselte Figuren mehrfach angreifen.'],
  },
  {
    id: 'blackburne',
    name: 'Blackburne-Shilling-Falle',
    opening: 'Italienische Partie',
    level: 1,
    trapper: 'black',
    line: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Nd4', 'Nxe5', 'Qg5', 'Nxf7', 'Qxg2', 'Rf1', 'Qxe4+', 'Be2', 'Nf3#'],
    blunder: 6,
    avoid: ['Nxd4', 'O-O', 'Nc3'],
    intro: {
      short: 'Schwarz stellt mit 3…Sd4 einen „vergessenen“ Bauern e5 hin. Wer gierig schlägt, erlebt eine böse Überraschung.',
      why: '3…Sd4 ist objektiv nicht gut – aber gegen Gegner, die jeden Bauern nehmen, funktioniert es erschreckend oft.',
    },
    blunderWhy: {
      short: '4.Sxe5? Dg5! greift den Springer e5 UND den Bauern g2 an. Nimmt Weiß dann auch noch auf f7, folgt Matt.',
      why: 'Der Springer e5 und der Turm h1 stehen plötzlich gleichzeitig unter Beschuss. Ein „geschenkter“ Bauer ist oft ein Köder.',
    },
    avoidWhy: {
      short: 'Ruhig bleiben: 4.Sxd4 exd4 und dann 5.O-O oder 5.c3 – Weiß steht besser.',
      why: 'Frag dich bei jedem Geschenk: Warum lässt der Gegner das hängen? Hier öffnet Sxe5 die g-Linie für die schwarze Dame.',
    },
    punish: [
      {
        prompt: { short: 'Weiß hat den Bauern genommen. Greife zwei Dinge gleichzeitig an!', why: 'Die Dame kann den Springer e5 und den Bauern g2 zugleich bedrohen.' },
        success: { short: 'Dg5! – Doppelangriff auf e5 und g2.' },
      },
      {
        prompt: { short: 'Weiß ist gierig geblieben und hat auf f7 geschlagen. Nimm den Bauern g2 – mit Angriff auf den Turm!' },
        success: { short: 'Dxg2 – der Turm h1 hängt, Weiß muss Tf1 spielen.' },
      },
      {
        prompt: { short: 'Nimm den Bauern e4 mit Schach.' },
        success: { short: 'Dxe4+ – Weiß kann nur den Läufer nach e2 ziehen.' },
      },
      {
        prompt: { short: 'Setze matt!', why: 'Der Läufer e2 ist an den König gefesselt – kein weißer Stein kann das Feld f3 verteidigen.' },
        success: { short: 'Sf3# – ersticktes Matt mitten im Brett! Das ist die Blackburne-Shilling-Falle.' },
      },
    ],
    takeaways: ['„Geschenkte“ Bauern in der Eröffnung misstrauisch prüfen.', 'Gegen 3…Sd4: Sxd4 oder Rochade.', 'Doppelangriffe der Dame auf Springer + g2 sind ein typisches Motiv.'],
  },
  {
    id: 'elefant',
    name: 'Elefantenfalle',
    opening: 'Abgelehntes Damengambit',
    level: 2,
    trapper: 'black',
    line: ['d4', 'd5', 'c4', 'e6', 'Nc3', 'Nf6', 'Bg5', 'Nbd7', 'cxd5', 'exd5', 'Nxd5', 'Nxd5', 'Bxd8', 'Bb4+', 'Qd2', 'Bxd2+', 'Kxd2', 'Kxd8'],
    blunder: 10,
    avoid: ['e3', 'Nf3', 'Qc2'],
    intro: {
      short: 'Der Springer f6 scheint gefesselt: Schlägt Weiß auf d5, darf Schwarz angeblich nicht zurückschlagen, weil die Dame d8 hängt …',
      why: '… doch Schwarz schlägt trotzdem! Nach Lxd8 kommt Lb4+ – und Weiß verliert eine Figur.',
      pro: 'Benannt nach der Zwickmühle für den „Elefanten“ (alter Name des Läufers). Die Falle ist über 100 Jahre alt und schnappt bis heute zu.',
    },
    blunderWhy: {
      short: '6.Sxd5?? Sxd5! 7.Lxd8 Lb4+ 8.Dd2 Lxd2+ 9.Kxd2 Kxd8 – Schwarz hat eine Leichtfigur mehr.',
      why: 'Die Fesselung des Sf6 war nur relativ (an die Dame). Mit dem Zwischenschach Lb4+ holt sich Schwarz die Dame zurück.',
    },
    avoidWhy: {
      short: '6.e3 – einfach weiterentwickeln. Der Bauer d5 läuft nicht weg, er ist durch Sf6 gedeckt.',
      why: 'Typischer Plan für Weiß in dieser Struktur: e3, Ld3, Sf3, Dc2, später der Minoritätsangriff b4–b5.',
    },
    punish: [
      {
        prompt: { short: 'Weiß hat auf d5 geschlagen. Schlag zurück – auch wenn deine Dame dann hängt!' },
        success: { short: 'Sxd5! Weiß nimmt die Dame …' },
      },
      {
        prompt: { short: '… und jetzt das Zwischenschach!', why: 'Welcher Läufer gibt Schach, so dass Weiß die Dame d8 nicht mehr behalten kann?' },
        success: { short: 'Lb4+! Weiß muss mit der Dame dazwischenziehen.' },
      },
      {
        prompt: { short: 'Nimm die weiße Dame.' },
        success: { short: 'Lxd2+ – die Damen sind getauscht.' },
        alt: ['Kxd8'],
      },
      {
        prompt: { short: 'Hol dir den Läufer d8 zurück.' },
        success: { short: 'Kxd8 – Schwarz hat einen Springer mehr. Die Elefantenfalle ist zugeschnappt.' },
      },
    ],
    takeaways: ['Relative Fesselung (an die Dame) kann gebrochen werden.', 'Zwischenschach vor dem Zurückschlagen prüfen.', 'In der Damengambit-Struktur: erst entwickeln (e3), nicht auf d5 schlagen.'],
  },
  {
    id: 'lasker',
    name: 'Lasker-Falle',
    opening: 'Albins Gegengambit',
    level: 2,
    trapper: 'black',
    line: ['d4', 'd5', 'c4', 'e5', 'dxe5', 'd4', 'e3', 'Bb4+', 'Bd2', 'dxe3', 'Bxb4', 'exf2+', 'Ke2', 'fxg1=N+', 'Ke1', 'Qh4+'],
    blunder: 10,
    avoid: ['fxe3'],
    intro: {
      short: 'Im Albin-Gegengambit stößt Schwarz den Bauern bis e3 vor. Nimmt Weiß den Läufer b4, verwandelt sich der Bauer – in einen Springer!',
      why: 'Eine der seltenen Fallen mit Unterverwandlung. Ein Springer mit Schach ist hier stärker als eine Dame.',
    },
    blunderWhy: {
      short: '6.Lxb4?? exf2+ 7.Ke2 fxg1=S+! – mit Schach, und danach fällt auch noch der Turm oder die Dame.',
      why: 'Nach 8.Txg1 Lg4+ verliert Weiß die Dame. Nach 8.Ke1 Dh4+ hat Schwarz einen vernichtenden Angriff.',
    },
    avoidWhy: {
      short: '6.fxe3 – den frechen Bauern sofort beseitigen. Weiß behält einen Mehrbauern.',
      why: 'Ein Bauer auf e3 ist eine Waffe direkt vor dem König. Erst die Drohung beseitigen, dann Material zählen.',
    },
    punish: [
      {
        prompt: { short: 'Weiß hat den Läufer genommen. Schlag mit Schach auf f2!' },
        success: { short: 'exf2+ – der König muss nach e2.' },
      },
      {
        prompt: { short: 'Wandle um – aber in welche Figur?', why: 'Eine Dame auf g1 gibt kein Schach. Welche Figur gibt von g1 aus Schach auf e2?' },
        success: { short: 'fxg1=S+!! Unterverwandlung in einen Springer mit Schach.' },
      },
      {
        prompt: { short: 'Weiß geht mit dem König nach e1. Bring die Dame mit Schach ins Spiel.' },
        success: { short: 'Dh4+ – Schwarz hat eine Figur mehr und einen gewaltigen Angriff.' },
      },
    ],
    takeaways: ['Ein Bauer auf der 3. Reihe vor dem König ist gefährlich.', 'Unterverwandlung kann stärker sein als eine Dame.', 'Gegen Albin: nach …d4 e3?! lieber Sf3.'],
  },
  {
    id: 'budapest',
    name: 'Budapester Matt',
    opening: 'Budapester Gambit',
    level: 2,
    trapper: 'black',
    line: ['d4', 'Nf6', 'c4', 'e5', 'dxe5', 'Ng4', 'Bf4', 'Nc6', 'Nf3', 'Bb4+', 'Nbd2', 'Qe7', 'a3', 'Ngxe5', 'axb4', 'Nd3#'],
    blunder: 14,
    avoid: ['Nxe5', 'e3', 'Qc2'],
    intro: {
      short: 'Schwarz greift den Bauern e5 an. Weiß jagt den Läufer mit a3 – und wenn Weiß ihn nimmt, folgt ein ersticktes Matt.',
      why: 'Die Dame e7 fesselt den Bauern e2 an den König. Deshalb kann niemand das Feld d3 verteidigen.',
    },
    blunderWhy: {
      short: '8.axb4?? Sd3# – der Bauer e2 ist gefesselt, der König eingemauert.',
      why: 'Bevor du eine Figur schlägst: Was passiert auf den Feldern rund um deinen König? Hier fehlt d3 jede Deckung.',
    },
    avoidWhy: {
      short: '8.Sxe5 – zuerst den gefährlichen Springer tauschen. Weiß steht gut.',
      why: 'Der Springer e5 bedroht d3 und f3. Wer ihn abtauscht, nimmt Schwarz die Angriffsfigur.',
    },
    punish: [
      {
        prompt: { short: 'Weiß hat den Läufer genommen. Setze matt!', why: 'Der Bauer e2 ist gefesselt – welches Feld neben dem König ist ungeschützt?' },
        success: { short: 'Sd3# – ersticktes Matt. Der König ist von eigenen Figuren umgeben.' },
      },
    ],
    takeaways: ['Gefesselte Bauern decken nichts.', 'Vor dem Schlagen: Felder um den eigenen König prüfen.', 'Starke Angriffsfiguren abtauschen.'],
  },
  {
    id: 'caro',
    name: 'Ersticktes Matt im Caro-Kann',
    opening: 'Caro-Kann-Verteidigung',
    level: 1,
    trapper: 'white',
    line: ['e4', 'c6', 'd4', 'd5', 'Nc3', 'dxe4', 'Nxe4', 'Nd7', 'Qe2', 'Ngf6', 'Nd6#'],
    blunder: 9,
    avoid: ['Ndf6', 'e6', 'Qc7'],
    intro: {
      short: 'Weiß stellt die Dame nach e2 – auf dieselbe Linie wie den schwarzen König. Ein natürlicher Entwicklungszug von Schwarz verliert sofort.',
      why: 'Der Bauer e7 ist an den König gefesselt und kann den Springer auf d6 nicht schlagen.',
    },
    blunderWhy: {
      short: '5…Sgf6?? 6.Sd6# – der e-Bauer ist gefesselt, der König von eigenen Figuren eingemauert.',
      why: 'Nach Sgf6 sind alle Fluchtfelder (d7, f7… ) besetzt oder gedeckt. Ein Springerschach genügt.',
    },
    avoidWhy: {
      short: '5…Sdf6! – mit dem anderen Springer. Jetzt ist d7 frei und der Läufer c8 kann sich entwickeln.',
      why: 'Achte auf Damen und Türme, die auf der Linie deines Königs stehen – sie fesseln Bauern.',
    },
    punish: [
      {
        prompt: { short: 'Schwarz hat Sgf6 gespielt. Setze matt!' },
        success: { short: 'Sd6# – ersticktes Matt in sechs Zügen!' },
      },
    ],
    takeaways: ['Dame auf der Königslinie fesselt den e-Bauern.', 'Ersticktes Matt: der König wird von eigenen Figuren eingesperrt.'],
  },
  {
    id: 'petrow',
    name: 'Petrow-Falle',
    opening: 'Russische Verteidigung (Petrow)',
    level: 1,
    trapper: 'white',
    line: ['e4', 'e5', 'Nf3', 'Nf6', 'Nxe5', 'Nxe4', 'Qe2', 'Nf6', 'Nc6+', 'Be7', 'Nxd8', 'Kxd8'],
    blunder: 7,
    avoid: ['Qe7'],
    intro: {
      short: 'Im Petrow spiegelt Schwarz oft einfach die weißen Züge: 3…Sxe4?. Nach 4.De2! steht die Dame dem König gegenüber.',
      why: 'Zieht der Springer e4 weg, gibt der Springer e5 Abzugsschach – und greift dabei die Dame d8 an.',
    },
    blunderWhy: {
      short: '4…Sf6?? 5.Sc6+! – Abzugsschach durch die Dame e2, und der Springer greift die Dame d8 an.',
      why: 'Ein Abzugsschach ist doppelt gefährlich: Das Schach muss pariert werden, und die abziehende Figur schlägt zu.',
    },
    avoidWhy: {
      short: '4…De7 – die Linie zum König schließen. Danach tauscht man meist die Damen, Weiß hat einen kleinen Vorteil.',
      why: 'Richtig wäre schon im 3. Zug 3…d6! (erst den Springer vertreiben, dann auf e4 schlagen). Das ist die Hauptvariante des Petrow.',
    },
    punish: [
      {
        prompt: { short: 'Der Springer e4 ist weggezogen. Gib Abzugsschach – und greife dabei die Dame an!' },
        success: { short: 'Sc6+! Der Springer greift die Dame d8 an, die Dame e2 gibt Schach.' },
      },
      {
        prompt: { short: 'Schwarz blockt mit dem Läufer. Kassiere die Dame.' },
        success: { short: 'Sxd8 – Weiß gewinnt die Dame für einen Springer.' },
      },
    ],
    takeaways: ['Im Petrow: 3.Sxe5 d6! und erst dann …Sxe4.', 'Dame gegenüber dem König = Gefahr von Abzugsschach.'],
  },
  {
    id: 'stafford',
    name: 'Stafford-Gambit',
    opening: 'Russische Verteidigung (Stafford-Gambit)',
    level: 1,
    trapper: 'black',
    line: ['e4', 'e5', 'Nf3', 'Nf6', 'Nxe5', 'Nc6', 'Nxc6', 'dxc6', 'd3', 'Bc5', 'Bg5', 'Nxe4', 'Bxd8', 'Bxf2+', 'Ke2', 'Bg4#'],
    blunder: 10,
    avoid: ['Be2', 'h3', 'Qf3'],
    intro: {
      short: 'Das Stafford-Gambit ist im Internet berüchtigt: Schwarz opfert einen Bauern für schnelle Entwicklung – und hofft auf natürliche, aber falsche Züge.',
      why: 'Die Fesselung Lg5 sieht stark aus. Doch Schwarz ignoriert sie, opfert die Dame und setzt matt.',
    },
    blunderWhy: {
      short: '6.Lg5?? Sxe4! 7.Lxd8 Lxf2+ 8.Ke2 Lg4# – Matt.',
      why: 'Der Läufer c5 und der Springer zielen auf f2. Wer die Dame nimmt, übersieht das Matt in zwei Zügen.',
    },
    avoidWhy: {
      short: '6.Le2! – entwickeln und das Feld g4 kontrollieren. Weiß bleibt einen Bauern vorn.',
      why: 'Gegen Gambits gilt: in Ruhe entwickeln, König in Sicherheit bringen, Material behalten. Nicht jede Fesselung ist eine Chance.',
    },
    punish: [
      {
        prompt: { short: 'Weiß fesselt den Springer an die Dame. Ignoriere die Fesselung und schlag auf e4!' },
        success: { short: 'Sxe4! Weiß nimmt die Dame …' },
      },
      {
        prompt: { short: '… und jetzt Schach!' },
        success: { short: 'Lxf2+ – der König muss nach e2.' },
      },
      {
        prompt: { short: 'Setze matt!' },
        success: { short: 'Lg4# – der weiße König ist mitten im Brett gefangen.' },
      },
    ],
    takeaways: ['Gegen Gambits: entwickeln, nicht gierig werden.', 'f2/f7 ist der schwächste Punkt in der Eröffnung.', 'Relative Fesselungen können ignoriert werden, wenn Matt droht.'],
  },
  {
    id: 'noah',
    name: 'Noahs Arche',
    opening: 'Spanische Partie',
    level: 2,
    trapper: 'black',
    line: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'a6', 'Ba4', 'd6', 'd4', 'b5', 'Bb3', 'Nxd4', 'Nxd4', 'exd4', 'Qxd4', 'c5', 'Qd5', 'Be6', 'Qc6+', 'Bd7', 'Qd5', 'c4'],
    blunder: 14,
    avoid: ['c3', 'a4', 'O-O'],
    intro: {
      short: 'Der weiße Läufer b3 hat wenig Platz. Schlägt Weiß mit der Dame auf d4, sperren die schwarzen Bauern den Läufer ein.',
      why: 'Die Falle ist so alt, dass man sagt, sie stamme aus Noahs Zeiten – daher der Name.',
    },
    blunderWhy: {
      short: '8.Dxd4?? c5! 9.Dd5 Le6 10.Dc6+ Ld7 11.Dd5 c4 – der Läufer b3 ist gefangen.',
      why: 'Der Läufer b3 hat keine Rückzugsfelder: a4 und c4 sind besetzt bzw. gedeckt, a2 bringt nichts. Schwarz gewinnt eine Figur.',
    },
    avoidWhy: {
      short: '8.c3! – ein Gambit: Weiß opfert den Bauern d4 für Entwicklung und gibt dem Läufer das Feld c2.',
      why: 'Wichtiges Prinzip: Gib Läufern auf b3/b5 rechtzeitig ein Rückzugsfeld (c2 oder a2).',
    },
    punish: [
      {
        prompt: { short: 'Weiß hat mit der Dame genommen. Vertreibe sie mit Tempo!', why: 'Ein Bauernzug greift die Dame an und bereitet …c4 vor.' },
        success: { short: 'c5! – die Dame muss weg.' },
      },
      {
        prompt: { short: 'Die Dame greift den Turm a8 an. Decke ihn mit Tempo.' },
        success: { short: 'Le6 – der Läufer deckt und greift die Dame an.' },
      },
      {
        prompt: { short: 'Dc6+ – blocke das Schach.' },
        success: { short: 'Ld7 – die Dame muss wieder nach d5.' },
      },
      {
        prompt: { short: 'Sperr den Läufer ein!' },
        success: { short: 'c4 – der Läufer b3 ist gefangen. Noahs Arche ist geschlossen.' },
      },
    ],
    takeaways: ['Läufern auf b3 Rückzugsfelder lassen (c2, a2).', 'Bauernketten können Figuren einsperren.', 'Spanisch: nach …Sxd4 Sxd4 exd4 nicht Dxd4, sondern c3.'],
  },
  {
    id: 'sibirisch',
    name: 'Sibirische Falle',
    opening: 'Sizilianisch (Morra-Gambit)',
    level: 2,
    trapper: 'black',
    line: ['e4', 'c5', 'd4', 'cxd4', 'c3', 'dxc3', 'Nxc3', 'Nc6', 'Nf3', 'e6', 'Bc4', 'Qc7', 'O-O', 'Nf6', 'Qe2', 'Ng4', 'h3', 'Nd4', 'Nxd4', 'Qh2#'],
    blunder: 16,
    avoid: ['Rd1', 'Nb5', 'g3'],
    intro: {
      short: 'Im Morra-Gambit droht Schwarz mit Sg4 und Dc7 Matt auf h2. Der „natürliche“ Abwehrzug h3 verliert.',
      why: 'Nach h3 springt der andere Springer nach d4 – mit Angriff auf die Dame. Weicht sie aus, folgt Matt auf h2.',
    },
    blunderWhy: {
      short: '9.h3?? Sd4! – die Dame e2 hängt, und Dh2# droht. Weiß verliert die Dame oder wird mattgesetzt.',
      why: 'Ein Abwehrzug muss die Drohung beseitigen, ohne eine neue Schwäche zu schaffen. h3 lässt die Dame ohne Schutz.',
    },
    avoidWhy: {
      short: '9.Td1 oder 9.g3 – h2 bleibt gedeckt, ohne dass Sd4 einen Doppelangriff hat.',
      why: 'Vor einem Abwehrzug: Welche Figuren des Gegners können danach mit Tempo angreifen?',
    },
    punish: [
      {
        prompt: { short: 'Weiß hat h3 gespielt. Greife die Dame an – und halte die Mattdrohung aufrecht!' },
        success: { short: 'Sd4! – die Dame e2 ist angegriffen, und Dh2# droht.' },
      },
      {
        prompt: { short: 'Weiß hat den Springer geschlagen. Setze matt!' },
        success: { short: 'Dh2# – die Sibirische Falle.' },
      },
    ],
    takeaways: ['Dame + Springer gegen h2/h7 ist ein typisches Mattbild.', 'Abwehrzüge auf neue Taktik prüfen.'],
  },
  {
    id: 'englund',
    name: 'Englund-Gambit-Falle',
    opening: 'Englund-Gambit',
    level: 1,
    trapper: 'black',
    line: ['d4', 'e5', 'dxe5', 'Nc6', 'Nf3', 'Qe7', 'Bf4', 'Qb4+', 'Bd2', 'Qxb2', 'Bc3', 'Bb4', 'Qd2', 'Bxc3', 'Qxc3', 'Qc1#'],
    blunder: 10,
    avoid: ['Nc3'],
    intro: {
      short: 'Das Englund-Gambit ist objektiv schlecht – aber es hat eine fiese Falle: Die schwarze Dame frisst sich durch den Damenflügel.',
      why: 'Nach …Dxb2 verteidigt Weiß den Turm a1 natürlich mit Lc3 – und wird in drei Zügen mattgesetzt.',
    },
    blunderWhy: {
      short: '6.Lc3?? Lb4! 7.Dd2 Lxc3 8.Dxc3 Dc1# – Matt auf der Grundreihe.',
      why: 'Der Läufer c3 ist an die Deckung von a1 gebunden und wird gefesselt. Die Grundreihe ist ungeschützt, weil die Dame d1 wegzieht.',
    },
    avoidWhy: {
      short: '6.Sc3! deckt den Turm indirekt: Nach …Lb4 hat Weiß Sd5 oder Ld2. Weiß steht klar besser.',
      why: 'Die beste Verteidigung ist oft Entwicklung. Sc3 bringt eine neue Figur ins Spiel und sperrt die b-Linie nicht.',
    },
    punish: [
      {
        prompt: { short: 'Weiß hat mit Lc3 den Turm gedeckt. Fessele den Läufer!' },
        success: { short: 'Lb4! – der Läufer c3 ist gefesselt.' },
      },
      {
        prompt: { short: 'Weiß deckt mit der Dame. Nimm den Läufer.' },
        success: { short: 'Lxc3 – Weiß muss zurückschlagen …' },
      },
      {
        prompt: { short: 'Setze matt!' },
        success: { short: 'Dc1# – Grundreihenmatt. Die Englund-Falle.' },
      },
    ],
    takeaways: ['Gegen das Englund-Gambit: Sc3 statt Lc3.', 'Fesselungen gegen Figuren, die etwas decken müssen.'],
  },
];

const VICTIM_NAME = (t: Trap) => (t.trapper === 'white' ? 'Schwarz' : 'Weiß');

/** Lektion „Stellen & bestrafen“: Zugfolge bis zum Fehler läuft automatisch, dann bestraft der Nutzer. */
function trapperLesson(t: Trap): Lesson {
  const steps: Step[] = [
    {
      kind: 'info',
      title: t.opening,
      play: t.line.slice(0, t.blunder + 1),
      text: {
        short: `${t.intro.short}\n\n${VICTIM_NAME(t)} hat gerade den Fehler gemacht. Jetzt bist du dran!`,
        why: t.intro.why,
        pro: t.intro.pro,
      },
    },
  ];
  t.punish.forEach((p, k) => {
    const ply = t.blunder + 1 + 2 * k;
    steps.push({
      kind: 'move',
      title: k === 0 ? 'Bestrafe den Fehler' : 'Weiter so',
      prompt: p.prompt,
      solution: [t.line[ply], ...(p.alt ?? [])],
      reply: t.line[ply + 1],
      success: p.success,
    });
  });
  return {
    id: 'f-' + t.id,
    title: `${t.name}: stellen & bestrafen`,
    category: 'fallen',
    level: t.level,
    orientation: t.trapper,
    summary: `${t.opening}: ${t.intro.short}`,
    steps,
    takeaways: t.takeaways,
    practice: { themes: ['opening'], scenario: false },
  };
}

/** Lektion „Erkennen & vermeiden“: der Nutzer steht vor dem verlockenden Fehler. */
function victimLesson(t: Trap): Lesson {
  const victim = t.trapper === 'white' ? 'black' : 'white';
  const shown = t.line.slice(0, t.blunder);
  const before = new Chess();
  shown.forEach((m) => before.move(m));
  return {
    id: 'fa-' + t.id,
    title: `${t.name}: erkennen & vermeiden`,
    category: 'fallen',
    level: t.level,
    orientation: victim,
    summary: `Fall nicht herein: Wie du in der ${t.opening} sicher weiterspielst.`,
    steps: [
      {
        kind: 'info',
        title: t.opening,
        play: shown,
        text: {
          short: `Du spielst ${victim === 'white' ? 'Weiß' : 'Schwarz'}. Der Gegner hat gerade ${sanMove(shown.at(-1)!)} gezogen. Ein Zug sieht jetzt sehr verlockend aus – aber er ist eine Falle.`,
          why: t.intro.short,
        },
      },
      {
        kind: 'move',
        title: 'Finde den sicheren Zug',
        prompt: { short: 'Welcher Zug ist gut – und welcher wäre der Fehler?', why: 'Frag dich: Welche Schachs, Schläge und Drohungen hat der Gegner nach meinem Zug?' },
        solution: t.avoid,
        mistakes: [{ san: t.line[t.blunder], text: t.blunderWhy }],
        success: t.avoidWhy,
      },
      {
        kind: 'info',
        title: 'So wäre es ausgegangen',
        fen: before.fen(),
        play: t.line.slice(t.blunder),
        text: { short: `Zum Vergleich die Falle: ${t.blunderWhy.short}`, why: t.blunderWhy.why },
      },
    ],
    takeaways: t.takeaways,
    practice: { themes: ['opening', 'hangingPiece'], scenario: false },
  };
}

/** SAN mit deutschen Figurenbuchstaben für Fließtext */
function sanMove(san: string) {
  return san.replace(/^[NBRQK]/, (p) => ({ N: 'S', B: 'L', R: 'T', Q: 'D', K: 'K' })[p]!);
}

export const fallen: Lesson[] = TRAPS.flatMap((t) => [trapperLesson(t), victimLesson(t)]);
export const trapById = (id: string) => TRAPS.find((t) => t.id === id);
