// Erzeugt src/content/meta.ts: schlanke Lektions-Übersicht für Startseite und Lernpfad,
// damit die vollständigen Lektionsschritte nicht im Haupt-Bundle landen.
import { writeFileSync, readFileSync, existsSync } from 'node:fs';
import { lessons, masters } from '../src/content/index';
import { GLOSSARY } from '../src/content/glossary';

const meta = lessons.map(({ id, title, category, level, summary }) => ({ id, title, category, level, summary }));
const out = `// Automatisch erzeugt von scripts/build-meta.ts – nicht von Hand bearbeiten.
import type { LessonMeta } from './types';

export const LESSON_META: LessonMeta[] = ${JSON.stringify(meta, null, 1)};

export const MASTER_COUNT = ${masters.length};
export const GLOSSARY_COUNT = ${GLOSSARY.length};
`;
const file = new URL('../src/content/meta.ts', import.meta.url);
if (!existsSync(file) || readFileSync(file, 'utf8') !== out) {
  writeFileSync(file, out);
  console.log(`meta.ts aktualisiert (${meta.length} Lektionen)`);
}
