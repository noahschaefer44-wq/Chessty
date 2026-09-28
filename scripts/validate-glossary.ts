// Prüft alle Diagramme des Fachbegriffe-Hefts auf Legalität und gültige Querverweise.
import { Chess } from 'chess.js';
import { GLOSSARY } from '../src/content/glossary';
import { glossaryFen } from '../src/content/glossaryFen';
import { lessonById } from '../src/content/index';

let bad = 0;
const ids = new Set(GLOSSARY.map((g) => g.id));
if (ids.size !== GLOSSARY.length) { console.log('⚠ doppelte ids'); bad++; }
for (const g of GLOSSARY) {
  try {
    const fen = glossaryFen(g);
    const f = fen.split(' ');
    f[1] = f[1] === 'w' ? 'b' : 'w';
    f[3] = '-';
    if (new Chess(f.join(' ')).inCheck()) throw new Error('illegal: Seite nicht am Zug steht im Schach');
    for (const a of [...(g.arrows ?? []), ...(g.hl ?? [])]) if (!/^[!?]?([a-h][1-8]){1,2}$/.test(a)) throw new Error('Pfeil ' + a);
    for (const s of g.see ?? []) if (!ids.has(s)) throw new Error('Verweis ' + s);
    if (g.lesson && !lessonById(g.lesson)) throw new Error('Lektion ' + g.lesson);
  } catch (e) {
    bad++;
    console.log(`⚠ ${g.id}: ${(e as Error).message}`);
  }
}
console.log(`${GLOSSARY.length} Begriffe, ${bad} Probleme`);
process.exit(bad ? 1 : 0);
