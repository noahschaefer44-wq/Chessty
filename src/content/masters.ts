import type { MasterGame } from './types';
import { MOVES } from './masters-moves';

// Geführte Meisterpartien. Kommentare sind eigene Erklärungen, geprüft mit Stockfish.
export const MASTERS: MasterGame[] = [
  {
    id: 'morphy-opera-1858',
    title: 'Die Opernpartie',
    white: 'Paul Morphy',
    black: 'Herzog Karl & Graf Isouard',
    event: 'Paris (Oper)',
    year: 1858,
    result: '1-0',
    hero: 'white',
    level: 1,
    intro: {
      short: 'Morphy spielte diese Partie in einer Loge der Pariser Oper gegen zwei Adlige – während „Der Barbier von Sevilla“ lief. Ein Lehrstück in Entwicklung und Angriff.',
      why: 'Seine Gegner entwickeln sich langsam und verschwenden Züge. Morphy zeigt, wie man einen Entwicklungsvorsprung mit Opfern in einen direkten Angriff verwandelt.',
      pro: 'Die Partie wird bis heute in jedem Schachlehrbuch als Musterbeispiel für „Entwicklung vor Material“ und offene Linien gegen den König in der Mitte gezeigt.',
    },
    moves: MOVES['morphy-opera-1858'],
    notes: {
      5: 'Philidor-Verteidigung mit …Lg4 – etwas passiv. Schwarz gibt bald das Läuferpaar ab.',
      7: 'Schwarz muss tauschen, sonst verliert er einen Bauern.',
      10: 'Doppelangriff auf f7 und b7: Lc4 und Db3 folgen.',
      13: '…De7 deckt f7, sperrt aber den Läufer f8 ein.',
      17: '…b5?! – Schwarz versucht den Läufer zu vertreiben. Aber Weiß ist viel besser entwickelt.',
    },
    moments: [
      {
        ply: 18,
        prompt: { short: 'Schwarz hat …b5 gespielt. Morphy findet einen Zug, der die Stellung aufreißt. Denk an Entwicklung und offene Linien!' },
        explain: {
          short: '10.Sxb5! Morphy opfert den Springer für zwei Bauern – aber vor allem für offene Linien gegen den König in der Mitte.',
          why: 'Nach …cxb5 Lxb5+ ist der schwarze König gefesselt und kann nicht rochieren. Weiß hat alle Figuren im Spiel, Schwarz fast keine.',
          pro: 'Materiell ist das Opfer nicht korrekt nachweisbar – aber praktisch ist es vernichtend. Morphy spielte „intuitiv richtig“, 50 Jahre bevor Steinitz die Theorie dazu formulierte.',
        },
      },
      {
        ply: 22,
        prompt: { short: 'Der Springer d7 ist gefesselt. Bring deine letzten Figuren ins Spiel – mit Druck auf d7!' },
        explain: {
          short: '12.O-O-O! – die lange Rochade bringt den Turm sofort auf die d-Linie und erhöht den Druck auf den gefesselten Springer.',
          why: 'Ein Zug, zwei Aufgaben: König in Sicherheit, Turm ins Spiel.',
        },
      },
      {
        ply: 24,
        prompt: { short: 'Schwarz verteidigt d7 mit …Td8. Jetzt ein Qualitätsopfer, das den Angriff am Leben hält!' },
        explain: {
          short: '13.Txd7! Txd7 14.Td1 – der zweite Turm übernimmt die Fesselung. Schwarz bleibt völlig gelähmt.',
          pro: 'Die Kunst ist, dass der Angriff „mit Tempo“ weiterläuft: Jeder Zug bringt eine neue Figur gegen den gefesselten Turm.',
        },
      },
      {
        ply: 30,
        prompt: { short: 'Jetzt kommt der Höhepunkt: ein Damenopfer, das zum Matt führt!' },
        explain: {
          short: '16.Db8+!! Sxb8 17.Td8# – eines der berühmtesten Matts der Geschichte.',
          why: 'Die Dame lenkt den Springer d7 ab, der die d-Linie blockiert. Danach setzt der Turm, gedeckt vom Läufer b5, matt.',
        },
        arrows: ['b3b8', 'd1d8'],
      },
      {
        ply: 32,
        prompt: { short: 'Vollende das Matt.' },
        explain: { short: '17.Td8 matt! Mit nur zwei Figuren (Turm + Läufer) – alle anderen hat Morphy geopfert.' },
      },
    ],
    outro: {
      short: 'Entwicklung schlägt Material. Offene Linien gegen einen König in der Mitte sind tödlich.',
      why: 'Schwarz zog die Dame früh, spielte …b5 statt zu entwickeln und rochierte nie. Morphy hatte in jedem Moment mehr Figuren im Spiel.',
    },
  },
  {
    id: 'anderssen-immortal-1851',
    title: 'Die Unsterbliche Partie',
    white: 'Adolf Anderssen',
    black: 'Lionel Kieseritzky',
    event: 'London',
    year: 1851,
    result: '1-0',
    hero: 'white',
    level: 2,
    intro: {
      short: 'Anderssen opfert einen Läufer, beide Türme und die Dame – und setzt mit den drei verbliebenen Leichtfiguren matt.',
      why: 'Die Partie ist ein Denkmal der „romantischen“ Schachepoche: Angriff um jeden Preis. Aus heutiger Sicht nicht fehlerfrei – aber unsterblich schön.',
      pro: 'Moderne Analysen zeigen, dass Schwarz mehrmals besser verteidigen konnte (z. B. 18…Db6!). Umso lehrreicher: Initiative und Figurenaktivität zwingen den Gegner zu präzisen Zügen.',
    },
    moves: MOVES['anderssen-immortal-1851'],
    notes: {
      2: 'Das Königsgambit – im 19. Jahrhundert die beliebteste Eröffnung.',
      8: 'Weiß nimmt den angebotenen Bauern und muss danach seinen König verteidigen.',
      22: 'Schwarz hat den Läufer b5 geschlagen – Weiß opfert ihn und setzt mit h4 den Angriff fort.',
    },
    moments: [
      {
        ply: 32,
        prompt: { short: 'Der Springer sucht ein Traumfeld – mit Drohung Sxc7+.' },
        explain: {
          short: '17.Sd5! Der Springer greift c7 an (Gabel mit Schach droht) und bindet die schwarze Verteidigung.',
          why: 'Schwarz schlägt gierig …Dxb2 und greift beide Türme an.',
        },
      },
      {
        ply: 34,
        prompt: { short: 'Beide Türme hängen. Anderssen lässt sie hängen – und findet einen stillen, vernichtenden Zug.' },
        explain: {
          short: '18.Ld6!! Der Läufer nimmt dem schwarzen König f8 weg. Egal ob Schwarz einen Turm schlägt – das Mattnetz schließt sich.',
          why: 'Es droht Sxg7+ und Le7#. Die schwarzen Figuren sind alle weit weg vom König.',
          pro: 'Moderne Engine-Analysen zeigen 18…Db6! als Verteidigung. In der Partie nahm Schwarz den Turm (…Lxg1) – und verlor.',
        },
      },
      {
        ply: 36,
        prompt: { short: 'Schwarz hat den Turm g1 geschlagen. Jetzt einen Bauernzug, der die schwarze Dame von g7 abschneidet!' },
        explain: {
          short: '19.e5! sperrt die Diagonale a1–h8 bzw. die Verbindung der Dame zu g7. Jetzt kann Schwarz auch den zweiten Turm nehmen …',
        },
      },
      {
        ply: 40,
        prompt: { short: 'Beide weißen Türme sind weg. Jetzt der Schlussangriff – mit Schach!' },
        explain: { short: '21.Sxg7+ Kd8 – der König wird Richtung Mattfeld getrieben.' },
      },
      {
        ply: 42,
        prompt: { short: 'Und nun das letzte, größte Opfer!' },
        explain: {
          short: '22.Df6+!! Sxf6 23.Le7# – Matt mit Läufer und zwei Springern.',
          why: 'Die Dame lenkt den Springer g8 ab, der e7 deckt. Danach ist e7 frei für den Läufer.',
        },
      },
      {
        ply: 44,
        prompt: { short: 'Setze matt!' },
        explain: { short: '23.Le7 matt. Weiß hat nur noch drei Leichtfiguren – und die genügen.' },
      },
    ],
    outro: {
      short: 'Figurenaktivität und Tempo können riesige Materialdefizite ausgleichen – wenn der gegnerische König in Gefahr ist.',
      pro: 'Heute würde man Schwarz’ frühes Damenspiel (…Dh4+, …Dh6, …Dg5, …Dg6, …Df6) als Hauptursache nennen: Die Dame zog 7-mal, die Figuren blieben zu Hause.',
    },
  },
  {
    id: 'byrne-fischer-1956',
    title: 'Die Partie des Jahrhunderts',
    white: 'Donald Byrne',
    black: 'Robert James Fischer',
    event: 'New York (Rosenwald)',
    year: 1956,
    result: '0-1',
    hero: 'black',
    level: 3,
    intro: {
      short: 'Der 13-jährige Bobby Fischer opfert seine Dame und gewinnt mit einer „Windmühle“ fast das gesamte weiße Material.',
      why: 'Weiß verlässt früh mit der Dame das Zentrum und rochiert zu spät. Fischer bestraft das mit präziser, forcierter Taktik.',
      pro: 'Hans Kmoch nannte sie „The Game of the Century“. Die Kombination ab 17…Le6!! ist tief und exakt – Engines bestätigen fast jeden Zug.',
    },
    moves: MOVES['byrne-fischer-1956'],
    notes: {
      10: '6.Db3 – die Dame kommt früh ins Spiel und übt Druck auf d5 und c4 aus.',
      18: 'Weiß greift e7 an und hält Schwarz davon ab, …e5 zu spielen.',
      23: '…Sxc3 – der Springer tauscht und öffnet die Diagonale.',
    },
    moments: [
      {
        ply: 21,
        prompt: {
          short: 'Weiß hat den König noch nicht rochiert. Fischer findet einen verblüffenden Springerzug, der eine Figur „einstellt“.',
          why: 'Denk an die offene e-Linie und den weißen König in der Mitte.',
        },
        explain: {
          short: '11…Sa4!! Nimmt Weiß mit Sxa4, folgt …Sxe4 mit Angriff auf die Dame und den Läufer – und die Drohung …Lxd4.',
          why: 'Der Springer lenkt den Sc3 von der Verteidigung von e4 ab. Weiß spielte 12.Da3 – danach folgt …Sxc3 und …Sxe4.',
          pro: 'Nach 12.Sxa4 Sxe4 13.Dxe7 Da5+ 14.b4 Dxa4 15.Dxe4 Tfe8 16.Le7 Lxd4! hat Schwarz einen vernichtenden Angriff.',
        },
      },
      {
        ply: 25,
        prompt: { short: 'Schwarz opfert noch mehr, um die e-Linie gegen den König zu öffnen.' },
        explain: {
          short: '13…Sxe4! Nach 14.Lxe7 Db6 greift Schwarz den König an, statt die Qualität zu retten.',
          why: 'Offene Linien gegen den ungeschützten König in der Mitte sind wichtiger als ein Turm.',
        },
      },
      {
        ply: 33,
        prompt: {
          short: 'Die schwarze Dame wird angegriffen. Fischer rettet sie NICHT – er findet den berühmtesten Zug seiner Jugend.',
          why: 'Denk an die Diagonale zum weißen König und an Abzugsschachs mit dem Springer.',
        },
        explain: {
          short: '17…Le6!! – Fischer opfert die Dame. Nach 18.Lxb6 folgt eine Windmühle mit Läufer und Springer.',
          why: 'Der Läufer schlägt mit Schach auf c4, danach gibt der Springer abwechselnd Abzugsschachs und sammelt Material ein.',
          pro: 'Die Alternative 18.Lxe6 scheitert an 18…Db5+ 19.Kg1 Se2+ 20.Kf1 Sg3+ 21.Kg1 Df1+!! 22.Txf1 Se2# – ein ersticktes Matt!',
        },
        arrows: ['e6c4', 'c3e2'],
      },
      {
        ply: 35,
        prompt: { short: 'Die Dame ist weg. Jetzt beginnt die Windmühle – mit Schach!' },
        explain: {
          short: '18…Lxc4+ 19.Kg1 Se2+ 20.Kf1 Sxd4+ 21.Kg1 Se2+ 22.Kf1 Sc3+ 23.Kg1 axb6 – Schwarz hat Turm, zwei Läufer, Springer und Bauern für die Dame.',
          why: 'Ein Abzugsschach nach dem anderen – der Springer sammelt Figuren ein, während der Läufer den König in Schach hält.',
        },
      },
      {
        ply: 81,
        prompt: { short: 'Das Material hat gesiegt. Setze matt!' },
        explain: {
          short: '41…Tc2 matt. Das Zusammenspiel von Turm, zwei Läufern und Springer hat den weißen König gejagt.',
        },
      },
    ],
    outro: {
      short: 'Wer den König in der Mitte lässt und mit der Dame Bauern jagt, wird bestraft. Fischer zeigte, dass „Material“ nur eine Zahl ist, wenn die Figuren zusammenspielen.',
    },
  },
  {
    id: 'botvinnik-tal-1960',
    title: 'Tal gegen den Weltmeister',
    white: 'Michail Botwinnik',
    black: 'Michail Tal',
    event: 'WM-Kampf Moskau, Partie 6',
    year: 1960,
    result: '0-1',
    hero: 'black',
    level: 3,
    intro: {
      short: 'Der 23-jährige Tal fordert Weltmeister Botwinnik heraus. In einer ruhigen Königsindischen Stellung opfert er einen Springer – ein Opfer, das man nicht berechnen kann, sondern fühlen muss.',
      why: 'Tals Stärke: Er schuf Stellungen, in denen der Gegner unter Druck den richtigen Weg nicht fand.',
      pro: 'Tal selbst sagte über 21…Sf4: „Ich wusste, dass das Opfer nicht korrekt war, aber ich wusste auch, dass Botwinnik es am Brett nicht widerlegen würde.“ Die Engine sieht Weiß nach dem Opfer leicht besser – doch der Druck war zu groß.',
    },
    moves: MOVES['botvinnik-tal-1960'],
    notes: {
      13: 'Königsindisch: Schwarz beansprucht mit …e5 das Zentrum.',
      29: '…Sh5 bereitet …f5 vor.',
      37: '…f5 – Schwarz öffnet Linien am Königsflügel.',
    },
    moments: [
      {
        ply: 41,
        prompt: {
          short: 'Tal findet ein Springeropfer, das die Diagonale des Läufers g7 und die e-Linie öffnet.',
          why: 'Der Springer h5 hat ein Feld, auf dem er geschlagen werden kann – aber danach explodiert die Stellung.',
        },
        explain: {
          short: '21…Sf4!? Nach 22.gxf4 exf4 wird der Läufer g7 lebendig und der Bauer f4 greift an.',
          why: 'Schwarz bekommt für den Springer die lange Diagonale, den Bauern f4 als Speerspitze und offene Linien gegen den weißen König.',
          pro: 'Tals berühmter Satz: „Du musst deinen Gegner in einen tiefen, dunklen Wald führen, in dem 2 + 2 = 5 ist und der Weg hinaus nur für einen breit genug.“',
        },
        arrows: ['g7b2', 'e5f4'],
      },
      {
        ply: 45,
        prompt: { short: 'Weiß hat den Läufer nach d2 gezogen. Hol dir Material zurück – mit Druck!' },
        explain: {
          short: '23…Dxb2! Schwarz nimmt den Bauern und greift den Turm b1 an. Die Dame ist aktiv, der Läufer g7 zielt auf c3.',
        },
      },
      {
        ply: 47,
        prompt: { short: 'Die schwarze Dame wird angegriffen. Tal hat einen Zwischenzug!' },
        explain: {
          short: '24…f3! Der Bauer greift die weiße Dame an. Nach 25.Txb2 fxe2 hat Schwarz das Material zurück und einen gewaltigen Bauern auf e2.',
          why: 'Zwischenzug: Statt die Dame zu retten, droht Schwarz etwas Größeres.',
        },
      },
    ],
    outro: {
      short: 'Tal gewann das Endspiel mit Läuferpaar und aktiven Türmen – und später den WM-Titel.',
      pro: 'Lehre: In schwierigen Stellungen Probleme stellen! Ein Opfer, das Komplikationen schafft, ist praktisch oft stärker als ein „objektiv bester“ ruhiger Zug.',
    },
  },
  {
    id: 'tal-larsen-1965',
    title: 'Der Zauberer von Riga',
    white: 'Michail Tal',
    black: 'Bent Larsen',
    event: 'Kandidatenmatch Bled, Partie 10',
    year: 1965,
    result: '1-0',
    hero: 'white',
    level: 4,
    intro: {
      short: 'Die entscheidende Partie des Kandidatenmatchs. Tal opfert einen Springer auf d5 – ein Opfer, das Analysten jahrelang beschäftigte.',
      why: 'Entgegengesetzte Rochaden, beide greifen an. Tal wählt den Weg, der die meisten Probleme stellt.',
      pro: 'Moderne Engines halten 16.Sd5 für ungefähr ausgeglichen – nicht gewinnend. Aber Larsen verirrte sich im Labyrinth.',
    },
    moves: MOVES['tal-larsen-1965'],
    moments: [
      {
        ply: 30,
        prompt: {
          short: 'Der Springer c3 wird von …b4 angegriffen. Tal zieht ihn nicht zurück – er opfert ihn!',
          why: 'Welches Feld öffnet die e-Linie gegen den schwarzen König und lähmt den Läufer e7?',
        },
        explain: {
          short: '16.Sd5!? exd5 17.exd5 – Weiß öffnet die e-Linie, der Läufer d3 zielt auf h7, und die schwarzen Figuren stehen unkoordiniert.',
          pro: 'Die Engine zeigt, dass Schwarz sich halten konnte. Doch am Brett, mit tickender Uhr, war das fast unmöglich. Das ist Tals Schach.',
        },
      },
      {
        ply: 38,
        prompt: { short: 'Schwarz hat …Lb7 gespielt. Jetzt ein zweites Opfer, um die Königsstellung zu öffnen!' },
        explain: {
          short: '20.Lxf5! Txf5 21.Txe7 – Weiß gibt den Läufer, gewinnt aber den wichtigen Verteidiger e7 und dringt auf der 7. Reihe ein.',
        },
      },
      {
        ply: 66,
        prompt: { short: 'Die schwarze Dame deckt die 8. Reihe. Lenke sie ab!' },
        explain: {
          short: '34.Lc5! Dxc5 35.Te8+ Tf8 36.De6+ Kh8 37.Df7 – Schwarz gab auf.',
          why: 'Klassische Ablenkung: Die Dame kann nicht gleichzeitig c5 schlagen und die Grundreihe halten.',
        },
      },
    ],
    outro: {
      short: 'Tal gewann das Match und qualifizierte sich für das Finale. Die Partie zeigt: Initiative und Komplikationen sind Waffen.',
    },
  },
  {
    id: 'rbyrne-fischer-1963',
    title: 'Fischers verborgene Kombination',
    white: 'Robert Byrne',
    black: 'Robert James Fischer',
    event: 'US-Meisterschaft New York',
    year: 1963,
    result: '0-1',
    hero: 'black',
    level: 4,
    intro: {
      short: 'Fischer opfert einen Springer auf f2 – und Byrne gibt schließlich in einer Stellung auf, in der die Kommentatoren noch dachten, Weiß stehe besser.',
      why: 'Die Kombination ist tief und elegant: Figuren werden geopfert, um den weißen König zu entblößen und alle Linien zu öffnen.',
    },
    moves: MOVES['rbyrne-fischer-1963'],
    moments: [
      {
        ply: 29,
        prompt: {
          short: 'Fischer greift den weißen König an – mit einem Opfer auf einem schwachen Feld.',
          why: 'Der Springer d3 steht schon tief in der weißen Stellung. Welches Feld neben dem König ist nur einmal gedeckt?',
        },
        explain: {
          short: '15…Sxf2! 16.Kxf2 Sg4+ – der zweite Springer kommt mit Schach und der König steht plötzlich nackt.',
        },
      },
      {
        ply: 33,
        prompt: { short: 'Weiter mit dem Springer!' },
        explain: {
          short: '17…Sxe3 – Schwarz holt einen Bauern und greift die Dame an. Nach 18.Dd2 Sxg2 19.Kxg2 fehlt dem König der Läufer g2.',
        },
      },
      {
        ply: 37,
        prompt: { short: 'Öffne die lange Diagonale für den Läufer g7!' },
        explain: {
          short: '19…d4! 20.Sxd4 Lb7+ – beide Läufer zielen auf den König.',
          why: 'Mit einem Bauernopfer werden die Diagonalen a8–h1 und a1–h8 geöffnet.',
        },
      },
      {
        ply: 41,
        prompt: { short: 'Der letzte, leise Zug – Byrne gab danach auf.' },
        explain: {
          short: '21…Dd7!! – ein stiller Zug. Es droht …Dh3+ mit Mattangriff. Byrne sah, dass er verloren war, und gab auf.',
          pro: 'Die Großmeister im Kommentatorenraum hielten Weiß noch für besser – bis ihnen Byrnes Aufgabe gemeldet wurde.',
        },
      },
    ],
    outro: {
      short: 'Ein König ohne Bauernschutz und ohne Läufer ist gegen zwei Läufer auf langen Diagonalen chancenlos.',
    },
  },
  {
    id: 'fischer-spassky-1972',
    title: 'Fischer–Spasski, Partie 6',
    white: 'Robert James Fischer',
    black: 'Boris Spasski',
    event: 'WM-Kampf Reykjavík, Partie 6',
    year: 1972,
    result: '1-0',
    hero: 'white',
    level: 4,
    intro: {
      short: 'Fischer spielt zum ersten Mal in seiner Karriere 1.c4 – und gewinnt eine positionelle Meisterpartie. Spasski applaudierte am Ende.',
      why: 'Keine Taktik-Feuerwerke, sondern Strategie in Reinform: schwache Felder, ein schlechter Läufer, ein Bauernhebel zur richtigen Zeit.',
    },
    moves: MOVES['fischer-spassky-1972'],
    notes: {
      13: 'Tartakower-Variante des Damengambits – Spasskis Lieblingswaffe.',
      29: 'Schwarz hat jetzt „hängende Bauern“ auf c5 und d5 – stark, aber angreifbar.',
    },
    moments: [
      {
        ply: 36,
        prompt: {
          short: 'Fischer tauscht den besten Verteidiger von Schwarz ab.',
          why: 'Welche schwarze Figur kontrolliert die hellen Felder und schützt die hängenden Bauern?',
        },
        explain: {
          short: '19.Sxe6! fxe6 – der gute schwarze Läufer ist weg, und e6 wird zur dauerhaften Schwäche.',
          why: 'Nach dem Abtausch hat Weiß einen Läufer, Schwarz einen Springer – auf den hellen Feldern ist Weiß überlegen.',
        },
      },
      {
        ply: 40,
        prompt: { short: 'Schwarz hat …d4 gespielt. Blockiere und bereite den Angriff vor!' },
        explain: {
          short: '21.f4! – Weiß plant e5 und f5. Der Bauer d4 ist blockiert, der Springer d7 hat keine guten Felder.',
        },
      },
      {
        ply: 44,
        prompt: { short: 'Bring den Läufer auf die ideale Diagonale gegen e6.' },
        explain: {
          short: '23.Lc4 – der Läufer zielt auf den schwachen Bauern e6 und hindert Schwarz am Befreiungszug …d5.',
        },
      },
      {
        ply: 50,
        prompt: { short: 'Der entscheidende Bauernhebel – öffne die f-Linie!' },
        explain: {
          short: '26.f5! exf5 27.Txf5 – die weißen Türme dringen über die f-Linie ein, der Bauer e5 wird zum Freibauern.',
        },
      },
      {
        ply: 74,
        prompt: { short: 'Das Finale: ein Qualitätsopfer zerstört die Königsstellung.' },
        explain: {
          short: '38.Txf6! gxf6 39.Txf6 – Weiß greift den entblößten König an, 41.Df4 beendet die Partie.',
          pro: 'Spasski stand nach der Partie auf und applaudierte seinem Gegner – eine der berühmtesten Gesten der Schachgeschichte.',
        },
      },
    ],
    outro: {
      short: 'Guter Läufer gegen schlechten Springer, ein schwacher Bauer e6 und ein Bauernhebel zur richtigen Zeit – Strategie wie aus dem Lehrbuch.',
    },
  },
  {
    id: 'kasparov-topalov-1999',
    title: 'Kasparows Unsterbliche',
    white: 'Garri Kasparow',
    black: 'Wesselin Topalow',
    event: 'Wijk aan Zee',
    year: 1999,
    result: '1-0',
    hero: 'white',
    level: 4,
    intro: {
      short: 'Die vielleicht schönste Partie der Moderne: Kasparow opfert einen Turm und treibt den schwarzen König quer über das Brett.',
      why: 'Der Angriff beginnt mit 24.Txd4!! – ein Opfer, dessen Folgen man 15 Züge tief sehen musste.',
      pro: 'Kasparow sagte später, er habe nicht alles berechnet, aber gespürt, dass der König auf a5–a3 nicht überleben kann.',
    },
    moves: MOVES['kasparov-topalov-1999'],
    moments: [
      {
        ply: 46,
        prompt: {
          short: 'Kasparow findet ein Turmopfer, das den schwarzen König aus seinem Versteck lockt.',
          why: 'Schlag dort, wo Schwarz nur mit dem Bauern zurückschlagen kann – dann öffnen sich die Linien.',
        },
        explain: {
          short: '24.Txd4!! cxd4 – Kasparow gibt einen ganzen Turm, um die Linien zum schwarzen König zu öffnen.',
          pro: 'Nach 25.Te7+ hat Schwarz die Wahl: 25…Kb8 verliert nach 26.Dxd4 mit Mattdrohungen, also muss der König mit 25…Kb6 nach vorne – mitten ins Feuer.',
        },
      },
      {
        ply: 48,
        prompt: { short: 'Weiter mit Schach – der zweite Turm!' },
        explain: { short: '25.Te7+ Kb6 – der König wird in die Mitte gezogen.' },
      },
      {
        ply: 50,
        prompt: { short: 'Hol den Bauern d4 mit Schach zurück.' },
        explain: { short: '26.Dxd4+ Kxa5 – der König läuft auf den Damenflügel, wo er gejagt wird.' },
      },
      {
        ply: 52,
        prompt: { short: 'Ein Bauer treibt den König weiter!' },
        explain: { short: '27.b4+ Ka4 28.Dc3 – Weiß droht Db3 matt.' },
      },
      {
        ply: 72,
        prompt: { short: 'Der schönste Zug der Partie – ein Ablenkungsopfer!' },
        explain: {
          short: '37.Td7!! Txd7 38.Lxc4 – die Dame c4 ist weg, und Weiß gewinnt das Endspiel.',
          why: 'Der Turm lenkt den schwarzen Turm von d2 ab, damit der Läufer die Dame schlagen kann.',
        },
      },
    ],
    outro: {
      short: 'Ein König im offenen Feld ist verloren – selbst gegen weniger Material, wenn die Angreifer koordiniert sind.',
    },
  },
  {
    id: 'capablanca-tartakower-1924',
    title: 'Capablancas Königsmarsch',
    white: 'José Raúl Capablanca',
    black: 'Sawielly Tartakower',
    event: 'New York',
    year: 1924,
    result: '1-0',
    hero: 'white',
    level: 3,
    intro: {
      short: 'Das berühmteste Turmendspiel der Geschichte: Capablanca opfert Bauern, um seinen König und seinen Turm zu aktivieren.',
      why: 'Aktivität schlägt Material. Der weiße König marschiert nach f6, der Turm auf die 7. Reihe – und der g-Bauer entscheidet.',
      pro: 'Capablanca („die Schachmaschine“) war für seine Endspieltechnik legendär. Diese Partie ist Pflichtprogramm für jeden, der Turmendspiele verstehen will.',
    },
    moves: MOVES['capablanca-tartakower-1924'],
    moments: [
      {
        ply: 52,
        prompt: { short: 'Das Endspiel beginnt. Schaffe eine Schwäche am Königsflügel!' },
        explain: { short: '27.h5! – nach dem Abtausch entsteht eine offene h-Linie für den weißen Turm.' },
      },
      {
        ply: 58,
        prompt: { short: 'Aktiviere den Turm – auf die 7. Reihe!' },
        explain: { short: '30.Th7 – der Turm auf der 7. Reihe lähmt Schwarz und bedroht c7 und a7.' },
      },
      {
        ply: 68,
        prompt: {
          short: 'Der berühmteste Moment: Capablanca lässt Bauern hängen – für König-Aktivität!',
          why: 'Wohin muss der weiße König, um den g-Bauern zu unterstützen?',
        },
        explain: {
          short: '35.Kg3!! Txc3+ 36.Kh4 – Capablanca gibt zwei Bauern, damit sein König nach g5–f6 marschiert.',
          why: 'Mit König auf f6, Turm auf der 7. Reihe und Freibauer g wird Schwarz mattgesetzt oder verliert den Turm.',
          pro: 'Ein Lehrsatz aus dieser Partie: Im Turmendspiel ist ein aktiver König mehr wert als ein oder zwei Bauern.',
        },
      },
      {
        ply: 72,
        prompt: { short: 'Der Freibauer muss laufen!' },
        explain: { short: '37.g6! – mit König, Turm und Bauer entsteht ein Mattnetz um den schwarzen König.' },
      },
      {
        ply: 76,
        prompt: { short: 'Der König greift an!' },
        explain: { short: '39.Kf6 – Matt droht auf h7/g7. Schwarz muss Material geben.' },
      },
    ],
    outro: {
      short: 'Aktiver König, Turm auf der 7. Reihe, Freibauer – die drei Trümpfe im Turmendspiel.',
    },
  },
];
