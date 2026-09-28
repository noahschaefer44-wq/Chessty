// Hilfsskript: druckt Partie Zug für Zug mit Stockfish-Bewertung, um Schlüsselmomente zu finden.
import {Chess} from 'chess.js'; import {spawn} from 'child_process'; import fs from 'fs';
const games=JSON.parse(fs.readFileSync('data-src/masters.json'));
const key=process.argv[2]; const depth=+(process.argv[3]||14);
const c=new Chess(); c.loadPgn(games[key]); const hist=c.history({verbose:true});
const sf=spawn('node',['node_modules/stockfish/bin/stockfish-19-lite-single.js']);
let buf='',res; sf.stdout.on('data',d=>{buf+=d; if(buf.includes('bestmove')){const b=buf;buf='';res(b);}});
const ask=(fen)=>new Promise(r=>{res=r;sf.stdin.write(`position fen ${fen}\ngo depth ${depth}\n`)});
const b=new Chess();
for(let i=0;i<hist.length;i++){
  const out=await ask(b.fen()); const m=[...out.matchAll(/score (cp|mate) (-?\d+).*? pv (\S+)/g)].pop();
  const sc=m[1]=='mate'?'#'+m[2]:(m[2]/100*(b.turn()=='w'?1:-1)).toFixed(2);
  const best=new Chess(b.fen()).move({from:m[3].slice(0,2),to:m[3].slice(2,4),promotion:m[3][4]}).san;
  console.log(`ply${i} ${Math.floor(i/2)+1}${i%2?'...':'.'}${hist[i].san}  eval(before,white)=${sc} best=${best}`);
  b.move(hist[i].san);
}
sf.kill();
