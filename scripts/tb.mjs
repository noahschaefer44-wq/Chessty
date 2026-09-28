// Hilfsskript: fragt die Lichess-Endspieldatenbank für FENs ab
for (const fen of process.argv.slice(2)) {
  const t = await fetch('https://tablebase.lichess.ovh/standard?fen=' + encodeURIComponent(fen)).then((r) => r.text());
  if (!t.startsWith('{')) { console.log(fen, '=>', t); continue; }
  const r = JSON.parse(t);
  console.log(fen, '=>', r.category, 'dtm', r.dtm);
  console.log('   ', r.moves.slice(0, 8).map((m) => `${m.san}:${m.category}`).join('  '));
}
