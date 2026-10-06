// Automatisch erzeugt von scripts/build-puzzle-lessons.ts aus Lichess-Puzzles (CC0) – nicht von Hand bearbeiten.
import type { Lesson } from '../types';

export const partien: Lesson[] = [
 {
  "id": "p-doppelschach",
  "title": "Doppelschach in echten Partien",
  "category": "taktik",
  "level": 2,
  "summary": "Zwei Figuren geben gleichzeitig Schach – der König MUSS ziehen.",
  "steps": [
   {
    "kind": "info",
    "title": "Doppelschach in echten Partien",
    "text": {
     "short": "Beim Doppelschach greifen zwei Figuren den König gleichzeitig an. Blocken oder Schlagen hilft nicht – nur ein Königszug.",
     "why": "Darum ist das Doppelschach das stärkste Abzugsschach: Selbst eine hängende Figur darf dabei angegriffen stehen bleiben."
    }
   },
   {
    "kind": "move",
    "fen": "r1bqkb1r/pp1n1ppp/2p2p2/8/3PN3/8/PPP1QPPP/R3KBNR b KQkq - 2 7",
    "play": [
     "g6"
    ],
    "title": "Partie 1 (Wertung 656)",
    "prompt": {
     "short": "Finde den stärksten Zug. Gibt es ein Abzugs- oder Doppelschach?"
    },
    "solution": [
     "Nd6#"
    ],
    "success": {
     "short": "Genau – so wird der König gezwungen, und die Taktik geht auf."
    }
   },
   {
    "kind": "move",
    "fen": "2brr2k/p1q2p1P/1ppb1n2/3p1NR1/3P4/PP2PP2/1B3K2/6QR b - - 3 32",
    "play": [
     "Bxf5"
    ],
    "title": "Partie 2 (Wertung 1149)",
    "prompt": {
     "short": "Finde den stärksten Zug. Gibt es ein Abzugs- oder Doppelschach?"
    },
    "solution": [
     "Rg8+"
    ],
    "reply": "Nxg8",
    "success": {
     "short": "Gut – der Gegner antwortet."
    }
   },
   {
    "kind": "move",
    "title": "Partie 2: weiter",
    "prompt": {
     "short": "Weiter geht es – finde den nächsten Zug."
    },
    "solution": [
     "hxg8=Q#"
    ],
    "success": {
     "short": "Genau – so wird der König gezwungen, und die Taktik geht auf."
    }
   },
   {
    "kind": "move",
    "fen": "1rb1kb1r/p1p2pp1/1pN1p2p/3Q4/4N2q/8/PPP2PPP/R1B1R1K1 b k - 0 14",
    "play": [
     "exd5"
    ],
    "title": "Partie 3 (Wertung 1321)",
    "prompt": {
     "short": "Finde den stärksten Zug. Gibt es ein Abzugs- oder Doppelschach?"
    },
    "solution": [
     "Nf6#"
    ],
    "success": {
     "short": "Genau – so wird der König gezwungen, und die Taktik geht auf."
    }
   },
   {
    "kind": "move",
    "fen": "r1bqr1k1/ppp2pb1/2n2nQ1/3N4/2B5/5N2/PPP2PPP/R3R1K1 b - - 0 15",
    "play": [
     "fxg6"
    ],
    "title": "Partie 4 (Wertung 1598)",
    "prompt": {
     "short": "Finde den stärksten Zug. Gibt es ein Abzugs- oder Doppelschach?"
    },
    "solution": [
     "Nxf6+"
    ],
    "reply": "Kh8",
    "success": {
     "short": "Gut – der Gegner antwortet."
    }
   },
   {
    "kind": "move",
    "title": "Partie 4: weiter",
    "prompt": {
     "short": "Weiter geht es – finde den nächsten Zug."
    },
    "solution": [
     "Rxe8+"
    ],
    "reply": "Qxe8",
    "success": {
     "short": "Gut – der Gegner antwortet."
    }
   },
   {
    "kind": "move",
    "title": "Partie 4: weiter",
    "prompt": {
     "short": "Weiter geht es – finde den nächsten Zug."
    },
    "solution": [
     "Nxe8"
    ],
    "success": {
     "short": "Genau – so wird der König gezwungen, und die Taktik geht auf."
    }
   }
  ],
  "takeaways": [
   "Doppelschach: nur Königszüge helfen.",
   "Figuren vor Linien-Figuren können mit Wucht abziehen."
  ],
  "practice": {
   "themes": [
    "doubleCheck"
   ]
  }
 },
 {
  "id": "p-gefangen",
  "title": "Figuren einfangen",
  "category": "taktik",
  "level": 2,
  "summary": "Wenn eine Figur keine sicheren Felder mehr hat, kann man sie einsammeln.",
  "steps": [
   {
    "kind": "info",
    "title": "Figuren einfangen",
    "text": {
     "short": "Eine Figur ohne Rückzugsfelder ist so gut wie verloren. Oft reicht ein ruhiger Bauernzug, um sie einzusperren.",
     "why": "Besonders Läufer und Damen, die tief im gegnerischen Lager stehen, werden gerne gefangen."
    }
   },
   {
    "kind": "move",
    "fen": "2kr1b1r/p1p2ppp/2p1p3/4P3/3pR2n/1P1P1P1P/P1P2P2/RNB3K1 b - - 2 14",
    "play": [
     "Nxf3+"
    ],
    "title": "Partie 1 (Wertung 823)",
    "prompt": {
     "short": "Welche gegnerische Figur hat kaum noch Felder? Sperr sie ein oder greif sie an."
    },
    "solution": [
     "Kg2"
    ],
    "reply": "Nxe5",
    "success": {
     "short": "Gut – der Gegner antwortet."
    }
   },
   {
    "kind": "move",
    "title": "Partie 1: weiter",
    "prompt": {
     "short": "Weiter geht es – finde den nächsten Zug."
    },
    "solution": [
     "Rxe5"
    ],
    "success": {
     "short": "Richtig – die Figur hat keinen sicheren Ausweg mehr."
    }
   },
   {
    "kind": "move",
    "fen": "rnb1k2r/p1pp1ppp/1p2p3/8/3P4/2P2NP1/P1PKQ2P/R1B2B1q b kq - 1 10",
    "play": [
     "Bb7"
    ],
    "title": "Partie 2 (Wertung 1164)",
    "prompt": {
     "short": "Welche gegnerische Figur hat kaum noch Felder? Sperr sie ein oder greif sie an."
    },
    "solution": [
     "Bg2"
    ],
    "reply": "Qxg2",
    "success": {
     "short": "Gut – der Gegner antwortet."
    }
   },
   {
    "kind": "move",
    "title": "Partie 2: weiter",
    "prompt": {
     "short": "Weiter geht es – finde den nächsten Zug."
    },
    "solution": [
     "Qxg2"
    ],
    "success": {
     "short": "Richtig – die Figur hat keinen sicheren Ausweg mehr."
    }
   },
   {
    "kind": "move",
    "fen": "rn2k1r1/p4ppp/2ppbq2/1pb1p3/2B5/1QN2N2/PPPP1PPP/R1B1K2R b KQq - 3 12",
    "play": [
     "bxc4"
    ],
    "title": "Partie 3 (Wertung 1367)",
    "prompt": {
     "short": "Welche gegnerische Figur hat kaum noch Felder? Sperr sie ein oder greif sie an."
    },
    "solution": [
     "Qb7"
    ],
    "reply": "Qe7",
    "success": {
     "short": "Gut – der Gegner antwortet."
    }
   },
   {
    "kind": "move",
    "title": "Partie 3: weiter",
    "prompt": {
     "short": "Weiter geht es – finde den nächsten Zug."
    },
    "solution": [
     "Qxa8"
    ],
    "success": {
     "short": "Richtig – die Figur hat keinen sicheren Ausweg mehr."
    }
   },
   {
    "kind": "move",
    "fen": "r1b2rk1/2p1nppn/p2p1q1p/1pb1p3/4P3/1B1P1NNP/PPP2PP1/R1BQ1RK1 b - - 1 13",
    "play": [
     "Be6"
    ],
    "title": "Partie 4 (Wertung 1592)",
    "prompt": {
     "short": "Welche gegnerische Figur hat kaum noch Felder? Sperr sie ein oder greif sie an."
    },
    "solution": [
     "Nh5"
    ],
    "reply": "Qg6",
    "success": {
     "short": "Gut – der Gegner antwortet."
    }
   },
   {
    "kind": "move",
    "title": "Partie 4: weiter",
    "prompt": {
     "short": "Weiter geht es – finde den nächsten Zug."
    },
    "solution": [
     "Nh4"
    ],
    "reply": "Bxb3",
    "success": {
     "short": "Gut – der Gegner antwortet."
    }
   },
   {
    "kind": "move",
    "title": "Partie 4: weiter",
    "prompt": {
     "short": "Weiter geht es – finde den nächsten Zug."
    },
    "solution": [
     "Nxg6"
    ],
    "success": {
     "short": "Richtig – die Figur hat keinen sicheren Ausweg mehr."
    }
   }
  ],
  "takeaways": [
   "Vor dem Ausflug ins feindliche Lager: Rückweg prüfen!",
   "Erst Felder nehmen, dann angreifen."
  ],
  "practice": {
   "themes": [
    "trappedPiece"
   ]
  }
 },
 {
  "id": "p-verteidigung",
  "title": "Verteidigen in echten Partien",
  "category": "taktik",
  "level": 2,
  "summary": "Manchmal ist der beste Zug kein Angriff, sondern eine präzise Abwehr.",
  "steps": [
   {
    "kind": "info",
    "title": "Verteidigen in echten Partien",
    "text": {
     "short": "In diesen Stellungen droht dir etwas. Der beste Zug wehrt die Drohung ab – ohne neue Schwächen zu schaffen.",
     "why": "Starke Spieler fragen vor jedem Zug: Was will mein Gegner? Wer nur angreift, verliert gegen gute Gegner."
    }
   },
   {
    "kind": "move",
    "fen": "3QK3/8/6p1/8/1qP3k1/8/8/8 b - - 6 65",
    "play": [
     "Qa4+"
    ],
    "title": "Partie 1 (Wertung 800)",
    "prompt": {
     "short": "Was droht dein Gegner? Finde die beste Verteidigung."
    },
    "solution": [
     "Qd7+"
    ],
    "reply": "Qxd7+",
    "success": {
     "short": "Gut – der Gegner antwortet."
    }
   },
   {
    "kind": "move",
    "title": "Partie 1: weiter",
    "prompt": {
     "short": "Weiter geht es – finde den nächsten Zug."
    },
    "solution": [
     "Kxd7"
    ],
    "reply": "g5",
    "success": {
     "short": "Gut – der Gegner antwortet."
    }
   },
   {
    "kind": "move",
    "title": "Partie 1: weiter",
    "prompt": {
     "short": "Weiter geht es – finde den nächsten Zug."
    },
    "solution": [
     "c5"
    ],
    "success": {
     "short": "Gut verteidigt – die Drohung ist entschärft."
    }
   },
   {
    "kind": "move",
    "fen": "8/8/8/pK6/P3k3/8/8/8 b - - 9 44",
    "play": [
     "Ke5"
    ],
    "title": "Partie 2 (Wertung 1149)",
    "prompt": {
     "short": "Was droht dein Gegner? Finde die beste Verteidigung."
    },
    "solution": [
     "Kxa5"
    ],
    "reply": "Kd6",
    "success": {
     "short": "Gut – der Gegner antwortet."
    }
   },
   {
    "kind": "move",
    "title": "Partie 2: weiter",
    "prompt": {
     "short": "Weiter geht es – finde den nächsten Zug."
    },
    "solution": [
     "Kb6"
    ],
    "success": {
     "short": "Gut verteidigt – die Drohung ist entschärft."
    }
   },
   {
    "kind": "move",
    "fen": "8/3k4/p1P2p2/3P1Kp1/P5P1/3n3P/8/8 b - - 0 44",
    "play": [
     "Kd6"
    ],
    "title": "Partie 3 (Wertung 1385)",
    "prompt": {
     "short": "Was droht dein Gegner? Finde die beste Verteidigung."
    },
    "solution": [
     "Kxf6"
    ],
    "reply": "Nf4",
    "success": {
     "short": "Gut – der Gegner antwortet."
    }
   },
   {
    "kind": "move",
    "title": "Partie 3: weiter",
    "prompt": {
     "short": "Weiter geht es – finde den nächsten Zug."
    },
    "solution": [
     "Kxg5"
    ],
    "reply": "Nxd5",
    "success": {
     "short": "Gut – der Gegner antwortet."
    }
   },
   {
    "kind": "move",
    "title": "Partie 3: weiter",
    "prompt": {
     "short": "Weiter geht es – finde den nächsten Zug."
    },
    "solution": [
     "h4"
    ],
    "success": {
     "short": "Gut verteidigt – die Drohung ist entschärft."
    }
   },
   {
    "kind": "move",
    "fen": "3r4/5p2/1k2p3/pp1BPp1p/5P1P/1P2K1P1/P2R4/8 b - - 2 32",
    "play": [
     "Rxd5"
    ],
    "title": "Partie 4 (Wertung 1588)",
    "prompt": {
     "short": "Was droht dein Gegner? Finde die beste Verteidigung."
    },
    "solution": [
     "Rxd5"
    ],
    "reply": "exd5",
    "success": {
     "short": "Gut – der Gegner antwortet."
    }
   },
   {
    "kind": "move",
    "title": "Partie 4: weiter",
    "prompt": {
     "short": "Weiter geht es – finde den nächsten Zug."
    },
    "solution": [
     "Kd4"
    ],
    "reply": "Kc6",
    "success": {
     "short": "Gut – der Gegner antwortet."
    }
   },
   {
    "kind": "move",
    "title": "Partie 4: weiter",
    "prompt": {
     "short": "Weiter geht es – finde den nächsten Zug."
    },
    "solution": [
     "a3"
    ],
    "success": {
     "short": "Gut verteidigt – die Drohung ist entschärft."
    }
   }
  ],
  "takeaways": [
   "Vor jedem Zug: Was droht der Gegner?",
   "Die beste Verteidigung ist oft ein ruhiger Zug."
  ],
  "practice": {
   "themes": [
    "defensiveMove"
   ]
  }
 },
 {
  "id": "p-grundreihe",
  "title": "Grundreihenmatt in echten Partien",
  "category": "taktik",
  "level": 1,
  "summary": "Der König hinter seinen Bauern eingesperrt – ein Turm oder die Dame genügt.",
  "steps": [
   {
    "kind": "info",
    "title": "Grundreihenmatt in echten Partien",
    "text": {
     "short": "Steht der König hinter drei unbewegten Bauern, ist die Grundreihe seine Achillesferse.",
     "why": "Ein „Luftloch“ (h3/h6) verhindert das. In diesen Partien hat es gefehlt."
    }
   },
   {
    "kind": "move",
    "fen": "r4rk1/p4ppp/2p5/2R5/1q6/3PQ3/2P2PPP/4R1K1 b - - 3 23",
    "play": [
     "Rfe8"
    ],
    "title": "Partie 1 (Wertung 441)",
    "prompt": {
     "short": "Ist die gegnerische Grundreihe geschützt? Nutze sie aus!"
    },
    "solution": [
     "Qxe8+"
    ],
    "reply": "Rxe8",
    "success": {
     "short": "Gut – der Gegner antwortet."
    }
   },
   {
    "kind": "move",
    "title": "Partie 1: weiter",
    "prompt": {
     "short": "Weiter geht es – finde den nächsten Zug."
    },
    "solution": [
     "Rxe8#"
    ],
    "success": {
     "short": "Stark – die Grundreihe war die Schwachstelle."
    }
   },
   {
    "kind": "move",
    "fen": "5rk1/1p1R1Qpp/2p5/p3p1B1/4P2P/6qB/1PP5/4b2K b - - 0 27",
    "play": [
     "Rxf7"
    ],
    "title": "Partie 2 (Wertung 1057)",
    "prompt": {
     "short": "Ist die gegnerische Grundreihe geschützt? Nutze sie aus!"
    },
    "solution": [
     "Rd8+"
    ],
    "reply": "Rf8",
    "success": {
     "short": "Gut – der Gegner antwortet."
    }
   },
   {
    "kind": "move",
    "title": "Partie 2: weiter",
    "prompt": {
     "short": "Weiter geht es – finde den nächsten Zug."
    },
    "solution": [
     "Be6+"
    ],
    "reply": "Kh8",
    "success": {
     "short": "Gut – der Gegner antwortet."
    }
   },
   {
    "kind": "move",
    "title": "Partie 2: weiter",
    "prompt": {
     "short": "Weiter geht es – finde den nächsten Zug."
    },
    "solution": [
     "Rxf8#"
    ],
    "success": {
     "short": "Stark – die Grundreihe war die Schwachstelle."
    }
   },
   {
    "kind": "move",
    "fen": "2Rr3k/6pp/p3Q3/1p4q1/4P3/PP4P1/5n1P/6K1 b - - 1 33",
    "play": [
     "Nd1"
    ],
    "title": "Partie 3 (Wertung 1284)",
    "prompt": {
     "short": "Ist die gegnerische Grundreihe geschützt? Nutze sie aus!"
    },
    "solution": [
     "Qe8+"
    ],
    "reply": "Rxe8",
    "success": {
     "short": "Gut – der Gegner antwortet."
    }
   },
   {
    "kind": "move",
    "title": "Partie 3: weiter",
    "prompt": {
     "short": "Weiter geht es – finde den nächsten Zug."
    },
    "solution": [
     "Rxe8#"
    ],
    "success": {
     "short": "Stark – die Grundreihe war die Schwachstelle."
    }
   },
   {
    "kind": "move",
    "fen": "Rr5k/6pp/3pB2r/3Pp1Q1/4Pp2/1q2bPP1/2p3KP/R7 b - - 4 38",
    "play": [
     "c1=Q"
    ],
    "title": "Partie 4 (Wertung 1596)",
    "prompt": {
     "short": "Ist die gegnerische Grundreihe geschützt? Nutze sie aus!"
    },
    "solution": [
     "Qd8+"
    ],
    "reply": "Rxd8",
    "success": {
     "short": "Gut – der Gegner antwortet."
    }
   },
   {
    "kind": "move",
    "title": "Partie 4: weiter",
    "prompt": {
     "short": "Weiter geht es – finde den nächsten Zug."
    },
    "solution": [
     "Rxd8#"
    ],
    "success": {
     "short": "Stark – die Grundreihe war die Schwachstelle."
    }
   }
  ],
  "takeaways": [
   "Luftloch schaffen, bevor es zu spät ist.",
   "Deckt nur eine Figur die Grundreihe? Lenk sie ab!"
  ],
  "practice": {
   "themes": [
    "backRankMate"
   ]
  }
 },
 {
  "id": "p-erstickt",
  "title": "Ersticktes Matt in echten Partien",
  "category": "taktik",
  "level": 2,
  "summary": "Der König wird von seinen eigenen Figuren eingemauert – ein Springer setzt matt.",
  "steps": [
   {
    "kind": "info",
    "title": "Ersticktes Matt in echten Partien",
    "text": {
     "short": "Beim erstickten Matt blockieren eigene Figuren alle Fluchtfelder des Königs. Nur ein Springer kann dann noch Schach geben, das man nicht blocken kann.",
     "why": "Das berühmteste Muster: Damenopfer auf g8, Turm schlägt, Springer setzt auf f7 matt (Philidors Vermächtnis)."
    }
   },
   {
    "kind": "move",
    "fen": "r3r1Qk/1p1qb1pp/p1np1n2/6N1/8/P1N5/BP3PPP/R1B3K1 b - - 4 19",
    "play": [
     "Rxg8"
    ],
    "title": "Partie 1 (Wertung 595)",
    "prompt": {
     "short": "Der König hat keine Luft. Findest du das Springermatt?"
    },
    "solution": [
     "Nf7#"
    ],
    "success": {
     "short": "Ersticktes Matt – wunderschön!"
    }
   },
   {
    "kind": "move",
    "fen": "r2qkb1r/pp2np1p/3p1np1/1N1Pp3/Q1P3b1/5N2/PP2BPPP/R1B2RK1 b kq - 3 12",
    "play": [
     "Bd7"
    ],
    "title": "Partie 2 (Wertung 1017)",
    "prompt": {
     "short": "Der König hat keine Luft. Findest du das Springermatt?"
    },
    "solution": [
     "Nxd6#"
    ],
    "success": {
     "short": "Ersticktes Matt – wunderschön!"
    }
   },
   {
    "kind": "move",
    "fen": "rn3r1k/4pNbp/2p1Q1p1/pp6/3q4/2N5/PP4PP/R3K2R b KQ - 1 19",
    "play": [
     "Kg8"
    ],
    "title": "Partie 3 (Wertung 1305)",
    "prompt": {
     "short": "Der König hat keine Luft. Findest du das Springermatt?"
    },
    "solution": [
     "Nh6+"
    ],
    "reply": "Kh8",
    "success": {
     "short": "Gut – der Gegner antwortet."
    }
   },
   {
    "kind": "move",
    "title": "Partie 3: weiter",
    "prompt": {
     "short": "Weiter geht es – finde den nächsten Zug."
    },
    "solution": [
     "Qg8+"
    ],
    "reply": "Rxg8",
    "success": {
     "short": "Gut – der Gegner antwortet."
    }
   },
   {
    "kind": "move",
    "title": "Partie 3: weiter",
    "prompt": {
     "short": "Weiter geht es – finde den nächsten Zug."
    },
    "solution": [
     "Nf7#"
    ],
    "success": {
     "short": "Ersticktes Matt – wunderschön!"
    }
   },
   {
    "kind": "move",
    "fen": "r1bqkb1r/pp1nnppp/2p1p3/8/3PN3/3B1N2/PPP2PPP/R1BQ1RK1 b kq - 0 7",
    "play": [
     "g6"
    ],
    "title": "Partie 4 (Wertung 1562)",
    "prompt": {
     "short": "Der König hat keine Luft. Findest du das Springermatt?"
    },
    "solution": [
     "Nd6#"
    ],
    "success": {
     "short": "Ersticktes Matt – wunderschön!"
    }
   }
  ],
  "takeaways": [
   "König in der Ecke + eigene Figuren drumherum = Springermatt-Gefahr.",
   "Oft geht ein Damenopfer voraus."
  ],
  "practice": {
   "themes": [
    "smotheredMate"
   ]
  }
 },
 {
  "id": "p-umwandlung",
  "title": "Bauern durchbringen",
  "category": "taktik",
  "level": 1,
  "summary": "Ein Bauer kurz vor der Umwandlung ist oft mehr wert als eine Figur.",
  "steps": [
   {
    "kind": "info",
    "title": "Bauern durchbringen",
    "text": {
     "short": "In diesen Partien entscheidet ein Bauer, der zur Dame wird. Manchmal muss man dafür eine Figur opfern oder den Blockeur ablenken.",
     "why": "Rechne genau: Wer zuerst umwandelt, mit Schach oder mit Angriff auf die gegnerische Dame, gewinnt meistens."
    }
   },
   {
    "kind": "move",
    "fen": "1k1r4/pp1P2p1/1p3p2/4p3/1P6/2n1PK1B/7P/2R5 b - - 1 32",
    "play": [
     "Nd5"
    ],
    "title": "Partie 1 (Wertung 602)",
    "prompt": {
     "short": "Kann ein Bauer durchlaufen? Finde den Weg zur Umwandlung."
    },
    "solution": [
     "Rc8+"
    ],
    "reply": "Rxc8",
    "success": {
     "short": "Gut – der Gegner antwortet."
    }
   },
   {
    "kind": "move",
    "title": "Partie 1: weiter",
    "prompt": {
     "short": "Weiter geht es – finde den nächsten Zug."
    },
    "solution": [
     "dxc8=Q#"
    ],
    "success": {
     "short": "Richtig – der Bauer ist nicht mehr aufzuhalten."
    }
   },
   {
    "kind": "move",
    "fen": "6k1/p3P1B1/4q1r1/1p6/2pP1Qp1/P2p1P2/1P3KP1/8 b - - 0 38",
    "play": [
     "Kxg7"
    ],
    "title": "Partie 2 (Wertung 1131)",
    "prompt": {
     "short": "Kann ein Bauer durchlaufen? Finde den Weg zur Umwandlung."
    },
    "solution": [
     "Qf8+"
    ],
    "reply": "Kh7",
    "success": {
     "short": "Gut – der Gegner antwortet."
    }
   },
   {
    "kind": "move",
    "title": "Partie 2: weiter",
    "prompt": {
     "short": "Weiter geht es – finde den nächsten Zug."
    },
    "solution": [
     "e8=Q"
    ],
    "success": {
     "short": "Richtig – der Bauer ist nicht mehr aufzuhalten."
    }
   },
   {
    "kind": "move",
    "fen": "8/1PK5/5R2/8/8/6p1/5k2/1r6 b - - 3 59",
    "play": [
     "Kg1"
    ],
    "title": "Partie 3 (Wertung 1325)",
    "prompt": {
     "short": "Kann ein Bauer durchlaufen? Finde den Weg zur Umwandlung."
    },
    "solution": [
     "Rb6"
    ],
    "reply": "Rxb6",
    "success": {
     "short": "Gut – der Gegner antwortet."
    }
   },
   {
    "kind": "move",
    "title": "Partie 3: weiter",
    "prompt": {
     "short": "Weiter geht es – finde den nächsten Zug."
    },
    "solution": [
     "Kxb6"
    ],
    "reply": "Kf1",
    "success": {
     "short": "Gut – der Gegner antwortet."
    }
   },
   {
    "kind": "move",
    "title": "Partie 3: weiter",
    "prompt": {
     "short": "Weiter geht es – finde den nächsten Zug."
    },
    "solution": [
     "b8=Q"
    ],
    "success": {
     "short": "Richtig – der Bauer ist nicht mehr aufzuhalten."
    }
   },
   {
    "kind": "move",
    "fen": "8/8/1P1P2bp/4k1p1/6P1/4pP1P/7b/5K2 b - - 0 42",
    "play": [
     "Kd4"
    ],
    "title": "Partie 4 (Wertung 1588)",
    "prompt": {
     "short": "Kann ein Bauer durchlaufen? Finde den Weg zur Umwandlung."
    },
    "solution": [
     "d7"
    ],
    "reply": "Bd3+",
    "success": {
     "short": "Gut – der Gegner antwortet."
    }
   },
   {
    "kind": "move",
    "title": "Partie 4: weiter",
    "prompt": {
     "short": "Weiter geht es – finde den nächsten Zug."
    },
    "solution": [
     "Kg2"
    ],
    "reply": "e2",
    "success": {
     "short": "Gut – der Gegner antwortet."
    }
   },
   {
    "kind": "move",
    "title": "Partie 4: weiter",
    "prompt": {
     "short": "Weiter geht es – finde den nächsten Zug."
    },
    "solution": [
     "d8=Q+"
    ],
    "success": {
     "short": "Richtig – der Bauer ist nicht mehr aufzuhalten."
    }
   }
  ],
  "takeaways": [
   "Freibauern müssen laufen!",
   "Blockierende Figuren ablenken oder schlagen."
  ],
  "practice": {
   "themes": [
    "promotion"
   ]
  }
 },
 {
  "id": "p-koenigsangriff",
  "title": "Den offenen König angreifen",
  "category": "taktik",
  "level": 3,
  "summary": "Ein König ohne Bauernschutz ist ein Ziel für alle Figuren.",
  "steps": [
   {
    "kind": "info",
    "title": "Den offenen König angreifen",
    "text": {
     "short": "Wenn der gegnerische König ohne Bauern dasteht, lohnen sich Schachs, Opfer und das Heranführen weiterer Figuren.",
     "why": "Zähle Angreifer und Verteidiger am König: Hast du mehr, ist ein Angriff meist richtig."
    }
   },
   {
    "kind": "move",
    "fen": "1r1q1r2/pb2b1k1/2p1p3/1p3p1Q/3PB3/2P2R2/PP4PP/R5K1 b - - 1 18",
    "play": [
     "Rh8"
    ],
    "title": "Partie 1 (Wertung 1200)",
    "prompt": {
     "short": "Der König steht offen. Wie greifst du am stärksten an?"
    },
    "solution": [
     "Rg3+"
    ],
    "reply": "Bg5",
    "success": {
     "short": "Gut – der Gegner antwortet."
    }
   },
   {
    "kind": "move",
    "title": "Partie 1: weiter",
    "prompt": {
     "short": "Weiter geht es – finde den nächsten Zug."
    },
    "solution": [
     "Rxg5+"
    ],
    "reply": "Qxg5",
    "success": {
     "short": "Gut – der Gegner antwortet."
    }
   },
   {
    "kind": "move",
    "title": "Partie 1: weiter",
    "prompt": {
     "short": "Weiter geht es – finde den nächsten Zug."
    },
    "solution": [
     "Qxg5+"
    ],
    "success": {
     "short": "Genau – der König findet keine Ruhe."
    }
   },
   {
    "kind": "move",
    "fen": "7r/4k3/p1n1q2p/1p2p1p1/2pPN3/P1P1P3/1PK2R1Q/8 b - - 0 32",
    "play": [
     "exd4"
    ],
    "title": "Partie 2 (Wertung 1385)",
    "prompt": {
     "short": "Der König steht offen. Wie greifst du am stärksten an?"
    },
    "solution": [
     "Qc7+"
    ],
    "reply": "Qd7",
    "success": {
     "short": "Gut – der Gegner antwortet."
    }
   },
   {
    "kind": "move",
    "title": "Partie 2: weiter",
    "prompt": {
     "short": "Weiter geht es – finde den nächsten Zug."
    },
    "solution": [
     "Rf7+"
    ],
    "reply": "Kxf7",
    "success": {
     "short": "Gut – der Gegner antwortet."
    }
   },
   {
    "kind": "move",
    "title": "Partie 2: weiter",
    "prompt": {
     "short": "Weiter geht es – finde den nächsten Zug."
    },
    "solution": [
     "Qxd7+"
    ],
    "success": {
     "short": "Genau – der König findet keine Ruhe."
    }
   },
   {
    "kind": "move",
    "fen": "r4rk1/4q2p/2n1p1R1/3pP3/1p1P4/1p1Q4/P3NP2/2K3R1 b - - 0 26",
    "play": [
     "hxg6"
    ],
    "title": "Partie 3 (Wertung 1503)",
    "prompt": {
     "short": "Der König steht offen. Wie greifst du am stärksten an?"
    },
    "solution": [
     "Qxg6+"
    ],
    "reply": "Kh8",
    "success": {
     "short": "Gut – der Gegner antwortet."
    }
   },
   {
    "kind": "move",
    "title": "Partie 3: weiter",
    "prompt": {
     "short": "Weiter geht es – finde den nächsten Zug."
    },
    "solution": [
     "Rh1+"
    ],
    "reply": "Qh4",
    "success": {
     "short": "Gut – der Gegner antwortet."
    }
   },
   {
    "kind": "move",
    "title": "Partie 3: weiter",
    "prompt": {
     "short": "Weiter geht es – finde den nächsten Zug."
    },
    "solution": [
     "Rxh4#"
    ],
    "success": {
     "short": "Genau – der König findet keine Ruhe."
    }
   },
   {
    "kind": "move",
    "fen": "rn1q1r2/2pb1p2/p2b1n1k/1p6/2BN4/2N5/PPPQ1PPP/R5K1 b - - 1 15",
    "play": [
     "Kh7"
    ],
    "title": "Partie 4 (Wertung 1594)",
    "prompt": {
     "short": "Der König steht offen. Wie greifst du am stärksten an?"
    },
    "solution": [
     "Bd3+"
    ],
    "reply": "Ne4",
    "success": {
     "short": "Gut – der Gegner antwortet."
    }
   },
   {
    "kind": "move",
    "title": "Partie 4: weiter",
    "prompt": {
     "short": "Weiter geht es – finde den nächsten Zug."
    },
    "solution": [
     "Bxe4+"
    ],
    "reply": "f5",
    "success": {
     "short": "Gut – der Gegner antwortet."
    }
   },
   {
    "kind": "move",
    "title": "Partie 4: weiter",
    "prompt": {
     "short": "Weiter geht es – finde den nächsten Zug."
    },
    "solution": [
     "Bxa8"
    ],
    "success": {
     "short": "Genau – der König findet keine Ruhe."
    }
   }
  ],
  "takeaways": [
   "Offener König: Schachs und Opfer prüfen.",
   "Mehr Angreifer als Verteidiger = Angriff!"
  ],
  "practice": {
   "themes": [
    "exposedKing"
   ]
  }
 },
 {
  "id": "p-opfer",
  "title": "Opfer, die sich lohnen",
  "category": "taktik",
  "level": 3,
  "summary": "Material hergeben, um mehr zurückzubekommen – oder matt zu setzen.",
  "steps": [
   {
    "kind": "info",
    "title": "Opfer, die sich lohnen",
    "text": {
     "short": "Ein Opfer ist ein Tausch auf Zeit: Du gibst Material, um Linien zu öffnen, den König zu entblößen oder eine Taktik zu erzwingen.",
     "why": "Jedes Opfer muss gerechnet werden. In diesen Partien war es der beste Zug."
    }
   },
   {
    "kind": "move",
    "fen": "5r1k/p5pp/1p3q2/2pBp3/2PpP1Qn/PP6/2K4R/8 b - - 1 30",
    "play": [
     "Ng6"
    ],
    "title": "Partie 1 (Wertung 1202)",
    "prompt": {
     "short": "Der stärkste Zug kostet Material. Findest du ihn?"
    },
    "solution": [
     "Rxh7+"
    ],
    "reply": "Kxh7",
    "success": {
     "short": "Gut – der Gegner antwortet."
    }
   },
   {
    "kind": "move",
    "title": "Partie 1: weiter",
    "prompt": {
     "short": "Weiter geht es – finde den nächsten Zug."
    },
    "solution": [
     "Qh5#"
    ],
    "success": {
     "short": "Mutig und richtig – das Opfer lohnt sich."
    }
   },
   {
    "kind": "move",
    "fen": "2r1r3/6kp/6bQ/3qp3/pp1bNp2/5P2/PP3P2/1KBR3R b - - 1 27",
    "play": [
     "Kg8"
    ],
    "title": "Partie 2 (Wertung 1362)",
    "prompt": {
     "short": "Der stärkste Zug kostet Material. Findest du ihn?"
    },
    "solution": [
     "Qxg6+"
    ],
    "reply": "hxg6",
    "success": {
     "short": "Gut – der Gegner antwortet."
    }
   },
   {
    "kind": "move",
    "title": "Partie 2: weiter",
    "prompt": {
     "short": "Weiter geht es – finde den nächsten Zug."
    },
    "solution": [
     "Nf6+"
    ],
    "reply": "Kf7",
    "success": {
     "short": "Gut – der Gegner antwortet."
    }
   },
   {
    "kind": "move",
    "title": "Partie 2: weiter",
    "prompt": {
     "short": "Weiter geht es – finde den nächsten Zug."
    },
    "solution": [
     "Nxd5"
    ],
    "success": {
     "short": "Mutig und richtig – das Opfer lohnt sich."
    }
   },
   {
    "kind": "move",
    "fen": "3r2k1/2q2ppp/1rP1pn2/2Q5/1p1P4/5NP1/5P1P/2R1R1K1 b - - 2 27",
    "play": [
     "Rd5"
    ],
    "title": "Partie 3 (Wertung 1475)",
    "prompt": {
     "short": "Der stärkste Zug kostet Material. Findest du ihn?"
    },
    "solution": [
     "Qxb6"
    ],
    "reply": "Qxb6",
    "success": {
     "short": "Gut – der Gegner antwortet."
    }
   },
   {
    "kind": "move",
    "title": "Partie 3: weiter",
    "prompt": {
     "short": "Weiter geht es – finde den nächsten Zug."
    },
    "solution": [
     "c7"
    ],
    "success": {
     "short": "Mutig und richtig – das Opfer lohnt sich."
    }
   },
   {
    "kind": "move",
    "fen": "8/1Q5p/3q1ppk/2p1p3/4P1P1/1PP2PK1/r2r4/7R b - - 13 44",
    "play": [
     "Kg5"
    ],
    "title": "Partie 4 (Wertung 1595)",
    "prompt": {
     "short": "Der stärkste Zug kostet Material. Findest du ihn?"
    },
    "solution": [
     "Rh5+"
    ],
    "reply": "gxh5",
    "success": {
     "short": "Gut – der Gegner antwortet."
    }
   },
   {
    "kind": "move",
    "title": "Partie 4: weiter",
    "prompt": {
     "short": "Weiter geht es – finde den nächsten Zug."
    },
    "solution": [
     "Qg7#"
    ],
    "success": {
     "short": "Mutig und richtig – das Opfer lohnt sich."
    }
   }
  ],
  "takeaways": [
   "Erst forcierende Züge prüfen: Schach, Schlag, Drohung.",
   "Ein Opfer ohne Rechnung ist ein Geschenk."
  ],
  "practice": {
   "themes": [
    "sacrifice"
   ]
  }
 }
];
