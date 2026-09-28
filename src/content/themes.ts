import type { Explain } from './types';

export interface Theme {
  id: string;
  name: string;
  group: 'Grundmotive' | 'Kombinationen' | 'Mattbilder' | 'Verteidigung & Feinheiten' | 'Endspiel' | 'Phase';
  text: Explain;
}

// Erklärungen der Lichess-Motive, in drei Tiefen
export const THEMES: Theme[] = [
  { id: 'hangingPiece', name: 'Hängende Figur', group: 'Grundmotive', text: {
    short: 'Eine Figur ist ungedeckt oder zu schwach gedeckt – schlag sie einfach.',
    why: 'Die meisten Partien unter 1500 werden durch eingestellte Figuren entschieden. Frage dich vor jedem Zug: Was hat der Gegner gerade ungeschützt gelassen?',
    pro: 'Zähle Angreifer und Verteidiger (Tauschbilanz). Vorsicht vor „vergifteten“ Figuren: Prüfe, ob das Schlagen eine Linie öffnet oder deine Grundreihe schwächt.' } },
  { id: 'fork', name: 'Gabel', group: 'Grundmotive', text: {
    short: 'Eine Figur greift zwei (oder mehr) Ziele gleichzeitig an.',
    why: 'Der Gegner kann nur eine Sache retten. Springergabeln sind am tückischsten, weil Springer nicht zurückgreifen können – aber auch Bauern, Damen und Könige gabeln.',
    pro: 'Suche Felder, die zwei wertvolle Figuren gleichzeitig „sehen“. Oft muss man zuerst eine Figur mit Schach oder Opfer auf das Gabelfeld locken (Hinlenkung + Gabel).' } },
  { id: 'pin', name: 'Fesselung', group: 'Grundmotive', text: {
    short: 'Eine Figur kann nicht ziehen, weil dahinter etwas Wertvolleres steht.',
    why: 'Absolute Fesselung (dahinter der König): Die Figur darf gar nicht ziehen. Relative Fesselung: Sie darf, verliert dann aber mehr. Gefesselte Figuren sind schlechte Verteidiger – greife sie mit Bauern an!',
    pro: 'Nutze die Fesselung, indem du mehr Druck aufbaust („Die gefesselte Figur ist das Ziel“). Achte auf Entfesselungs-Tricks des Gegners, z. B. Zwischenschach oder Gegenangriff auf den Fessler.' } },
  { id: 'skewer', name: 'Spieß', group: 'Grundmotive', text: {
    short: 'Umgekehrte Fesselung: Die wertvolle Figur vorne muss weichen, die dahinter geht verloren.',
    why: 'Typisch mit Läufer, Turm oder Dame auf einer Linie – z. B. Schach dem König, dahinter steht die Dame.',
    pro: 'Im Endspiel entscheidet der Spieß oft Turm- und Damenendspiele (Turm vor Umwandlungsfeld, Schach von hinten). Behalte Linien im Blick, auf denen König und Dame stehen.' } },
  { id: 'discoveredAttack', name: 'Abzugsangriff', group: 'Kombinationen', text: {
    short: 'Eine Figur zieht weg und gibt dahinter eine Linie für eine andere Figur frei.',
    why: 'Zwei Angriffe in einem Zug: die ziehende Figur droht etwas UND die freigelegte Figur greift an. Beim Abzugsschach kann die ziehende Figur fast alles tun.',
    pro: 'Stell dir die Figur vor der Linie als „Kanone mit Deckel“ vor: Der Deckel darf mit Tempo abziehen (Schach, Schlagen, Damenangriff). Die Windmühle ist ein wiederholtes Abzugsschach.' } },
  { id: 'doubleCheck', name: 'Doppelschach', group: 'Kombinationen', text: {
    short: 'Zwei Figuren geben gleichzeitig Schach – der König MUSS ziehen.',
    why: 'Man kann nicht beide Schachs blocken oder beide Angreifer schlagen. Deshalb ist Doppelschach die stärkste Form des Abzugs – selbst eine eingestellte Figur spielt keine Rolle.',
    pro: 'Viele Mattkombinationen (z. B. Réti–Tartakower 1910) enden mit Doppelschach. Wenn der König wenige Fluchtfelder hat, zuerst prüfen: Gibt es ein Doppelschach?' } },
  { id: 'deflection', name: 'Ablenkung', group: 'Kombinationen', text: {
    short: 'Lenke einen Verteidiger von seiner wichtigen Aufgabe weg.',
    why: 'Viele Figuren sind „überlastet“: Sie decken zwei Dinge. Zwinge sie mit Schlagen oder Schach, eine Aufgabe aufzugeben.',
    pro: 'Frage: „Welche gegnerische Figur hält die Stellung zusammen?“ Dann: „Womit kann ich sie zwingen, wegzugehen?“ Oft ein Opfer auf einem Feld, das sie decken muss.' } },
  { id: 'attraction', name: 'Hinlenkung', group: 'Kombinationen', text: {
    short: 'Zwinge eine gegnerische Figur (oft den König) auf ein schlechtes Feld.',
    why: 'Durch ein Opfer wird z. B. der König auf ein Feld gelockt, auf dem eine Gabel, ein Spieß oder Matt möglich ist.',
    pro: 'Klassisch: Opfer auf f7/f2 oder h7/h2, um den König hinauszuziehen. Rechne, was nach dem Annehmen mit Tempo folgt – Hinlenkungen leben von Forcierung.' } },
  { id: 'capturingDefender', name: 'Verteidiger beseitigen', group: 'Kombinationen', text: {
    short: 'Schlag die Figur, die ein wichtiges Feld oder eine Figur verteidigt.',
    why: 'Wenn der einzige Verteidiger verschwindet, fällt, was er gedeckt hat – oft auch unter Materialopfer.',
    pro: 'Typisch: Läufer schlägt Springer f6, der h7 deckt, danach Dame auf h7 matt. Der Tausch ist hier Mittel, nicht Ziel.' } },
  { id: 'interference', name: 'Verstellung', group: 'Kombinationen', text: {
    short: 'Stelle eine Figur zwischen zwei gegnerische Figuren, die sich gegenseitig decken.',
    why: 'Die Verbindung wird unterbrochen, und plötzlich ist eine Figur ungedeckt oder ein Umwandlungsfeld frei.',
    pro: 'Verwandt mit dem „Nowotny“ aus der Problemschach-Welt: Ein Opfer auf dem Schnittpunkt zweier Linien – egal welche Figur schlägt, eine Linie wird verstellt.' } },
  { id: 'clearance', name: 'Räumung', group: 'Kombinationen', text: {
    short: 'Mache ein Feld oder eine Linie frei – meist mit Tempo –, damit eine andere Figur sie nutzen kann.',
    why: 'Manchmal steht die eigene Figur im Weg. Ein Räumungsopfer schafft Platz für den entscheidenden Schlag.',
    pro: 'Achte darauf, dass die Räumung mit Tempo (Schach/Drohung) erfolgt, sonst hat der Gegner Zeit, das Feld selbst zu kontrollieren.' } },
  { id: 'xRayAttack', name: 'Röntgenangriff', group: 'Kombinationen', text: {
    short: 'Eine Figur wirkt „durch“ eine andere Figur hindurch.',
    why: 'Auch wenn eine Figur dazwischen steht, zählt der Druck – nach einem Abtausch ist die Linie frei.',
    pro: 'Beim Abtausch auf einem Feld zählen auch Röntgen-Deckungen (z. B. Turm hinter Turm). Das entscheidet oft, wer den letzten Schlag hat.' } },
  { id: 'intermezzo', name: 'Zwischenzug', group: 'Verteidigung & Feinheiten', text: {
    short: 'Statt sofort zurückzuschlagen, erst einen stärkeren Zug einschieben.',
    why: 'Ein Zwischenschach oder eine Drohung, die beantwortet werden muss, kann den ganzen Abtausch umkehren.',
    pro: 'Die Erwartung „Er muss zurückschlagen“ ist die gefährlichste Annahme im Schach. Prüfe vor jedem Zurückschlagen: Gibt es einen forcierenden Zug zuerst?' } },
  { id: 'sacrifice', name: 'Opfer', group: 'Kombinationen', text: {
    short: 'Gib Material her, um etwas Wertvolleres zu erreichen – Matt, Angriff oder mehr Material.',
    why: 'Material ist nur ein Mittel. Wenn ein Opfer den König aufreißt oder eine Kombination erzwingt, ist es mehr wert als die Figur.',
    pro: 'Unterscheide berechnete Opfer (forciert, konkretes Ergebnis) und positionelle/intuitive Opfer (Initiative, Tal-Stil). Bei letzteren: Entwicklungsvorsprung, offene Linien und schwacher König sind Voraussetzung.' } },
  { id: 'trappedPiece', name: 'Gefangene Figur', group: 'Grundmotive', text: {
    short: 'Eine Figur hat keine sicheren Felder mehr – greif sie an und gewinne sie.',
    why: 'Oft trifft es Läufer auf a7/h7 oder h2/a2 oder eine zu weit vorgedrungene Dame.',
    pro: 'Beispiel: Der „vergiftete Bauer“ b2 – die Dame schlägt, und plötzlich ist sie eingesperrt. Vor dem Schlagen: Hat meine Figur einen Rückweg?' } },
  { id: 'quietMove', name: 'Stiller Zug', group: 'Verteidigung & Feinheiten', text: {
    short: 'Kein Schach, kein Schlagen – aber eine tödliche Drohung.',
    why: 'Stille Züge sind schwer zu finden, weil wir zuerst an forcierende Züge denken. Oft bereiten sie ein Matt vor, gegen das es keine Verteidigung gibt.',
    pro: 'Wenn forcierende Züge nicht klappen, frage: „Welche Figur fehlt noch im Angriff?“ oder „Was verhindert der Gegner gerade?“ – der stille Zug beseitigt genau das.' } },
  { id: 'defensiveMove', name: 'Verteidigung', group: 'Verteidigung & Feinheiten', text: {
    short: 'Finde den einzigen Zug, der die Stellung hält.',
    why: 'Nicht jede Taktik ist ein Angriff. Oft musst du eine Drohung erkennen und den genauen Verteidigungszug finden.',
    pro: 'Gute Verteidiger fragen: „Was ist die gegnerische Drohung?“ und „Welcher Zug verteidigt UND schafft Gegenspiel?“ Passivität ist oft schlimmer als ein aktiver Gegenangriff.' } },
  { id: 'zugzwang', name: 'Zugzwang', group: 'Endspiel', text: {
    short: 'Der Gegner müsste nichts tun – aber er muss ziehen und verschlechtert sich dadurch.',
    why: 'Besonders im Endspiel: Jeder Zug gibt ein wichtiges Feld auf. Manchmal ist ein „Wartezug“ die stärkste Waffe.',
    pro: 'Zugzwang entscheidet Bauernendspiele (Opposition), aber auch Mittelspielstellungen mit wenig Spielraum (Sämisch–Nimzowitsch 1923, „Unsterbliche Zugzwangpartie“).' } },
  { id: 'exposedKing', name: 'Entblößter König', group: 'Mattbilder', text: {
    short: 'Der König hat keine schützenden Bauern mehr – nutze das mit Schachgeboten.',
    why: 'Ein offener König ist anfällig für Doppelangriffe mit Schach, Mattnetze und Figurengewinn.',
    pro: 'Bringe möglichst viele Figuren an den König, bevor du zuschlägst. Damen + Springer sind die gefährlichste Kombination gegen einen offenen König.' } },
  { id: 'kingsideAttack', name: 'Königsangriff', group: 'Mattbilder', text: {
    short: 'Angriff auf den kurz rochierten König.',
    why: 'Typische Ziele: h7/h2, g7/g2, f7/f2. Opfer wie Lxh7+ oder Sg5 öffnen die Stellung.',
    pro: 'Faustregel: Angriff lohnt sich, wenn mehr eigene Angreifer als gegnerische Verteidiger in der Nähe des Königs sind.' } },
  { id: 'mateIn1', name: 'Matt in 1', group: 'Mattbilder', text: {
    short: 'Finde den Zug, der sofort mattsetzt.',
    why: 'Übe, alle Schachgebote zu prüfen und die Fluchtfelder des Königs zu zählen.',
    pro: 'Schnelle Mustererkennung spart Bedenkzeit – Matt-in-1-Training ist wie Vokabellernen.' } },
  { id: 'mateIn2', name: 'Matt in 2', group: 'Mattbilder', text: {
    short: 'Zwei Züge bis zum Matt – der erste ist oft ein Opfer oder stiller Zug.',
    why: 'Du musst jede Verteidigung des Gegners berücksichtigen.',
    pro: 'Methode: Kandidatenzüge (Schachs, Schläge, Drohungen) → für jeden die besten Antworten → gibt es danach immer ein Matt?' } },
  { id: 'mateIn3', name: 'Matt in 3', group: 'Mattbilder', text: {
    short: 'Längere Mattkombination – rechne sauber bis zum Ende.',
    why: 'Oft wird der König mit Schachs in ein Mattnetz getrieben.',
    pro: 'Visualisiere die Endstellung zuerst („Wo soll der König am Ende stehen?“) und arbeite rückwärts.' } },
  { id: 'backRankMate', name: 'Grundreihenmatt', group: 'Mattbilder', text: {
    short: 'Der König ist hinter den eigenen Bauern eingesperrt – ein Turm oder die Dame setzt auf der Grundreihe matt.',
    why: 'Eines der häufigsten Mattbilder überhaupt. Ein „Luftloch“ (h3/h6) verhindert es.',
    pro: 'Die Grundreihenschwäche ist auch dann relevant, wenn es kein direktes Matt gibt: Verteidiger sind an die Grundreihe gebunden und damit überlastet.' } },
  { id: 'smotheredMate', name: 'Ersticktes Matt', group: 'Mattbilder', text: {
    short: 'Der Springer setzt matt, weil der König von eigenen Figuren eingemauert ist.',
    why: 'Klassisch: Dame opfert sich auf g8/g1, der Turm muss schlagen, und der Springer setzt auf f7/f2 matt (Philidors Vermächtnis).',
    pro: 'Voraussetzung ist ein König in der Ecke, umringt von eigenen Figuren, und ein Springer, der mit Schach in die Nähe kommt.' } },
  { id: 'promotion', name: 'Umwandlung', group: 'Endspiel', text: {
    short: 'Bring einen Bauern zur Grundreihe und wandle ihn um.',
    why: 'Eine neue Dame entscheidet fast jede Partie. Manchmal ist eine Unterverwandlung (z. B. Springer mit Schach) noch besser.',
    pro: 'Hilfsmittel: Ablenkung des blockierenden Turms, Verstellung, Deckung des Umwandlungsfeldes „von hinten“.' } },
  { id: 'advancedPawn', name: 'Freibauer', group: 'Endspiel', text: {
    short: 'Ein weit vorgerückter Bauer ist eine Waffe – unterstütze ihn oder opfere für ihn.',
    why: 'Freibauern binden gegnerische Figuren. „Freibauern müssen laufen.“ (Nimzowitsch)',
    pro: 'Verbundene Freibauern auf der 6. Reihe sind oft stärker als ein Turm. Blockade (Springer vor dem Bauern) ist die beste Verteidigung.' } },
  { id: 'rookEndgame', name: 'Turmendspiel', group: 'Endspiel', text: {
    short: 'Taktik im Turmendspiel: Aktivität, Spieße, Umwandlung.',
    why: 'Turmendspiele sind die häufigsten Endspiele. Aktive Türme sind fast immer besser als passive.',
    pro: 'Kenne Lucena (Brückenbau) und Philidor (Verteidigung auf der 3. Reihe) – sie tauchen in unzähligen Varianten auf.' } },
  { id: 'pawnEndgame', name: 'Bauernendspiel', group: 'Endspiel', text: {
    short: 'König und Bauern – hier zählt jedes Tempo.',
    why: 'Opposition, Quadratregel, entfernter Freibauer: Bauernendspiele sind reine Rechnerei.',
    pro: 'Zähle Tempi exakt. „Alle Turmendspiele sind remis“ – aber Bauernendspiele sind fast nie remis, wenn einer ein Tempo mehr hat.' } },
  { id: 'opening', name: 'Eröffnungstaktik', group: 'Phase', text: {
    short: 'Fallen und Taktiken aus den ersten Zügen.',
    why: 'In der Eröffnung stehen Könige oft noch in der Mitte, Figuren ungedeckt – ideale Bedingungen für Taktik.',
    pro: 'Die meisten Eröffnungsfallen basieren auf f7/f2, ungedeckten Läufern auf g4/b4 oder Fesselungen gegen den unrochierten König.' } },
];

export const themeById = (id: string) => THEMES.find((t) => t.id === id);
export const themeName = (id: string) => themeById(id)?.name ?? id;
