import {spawn} from 'child_process'; import {Chess} from 'chess.js';
const sf=spawn('node',['node_modules/stockfish/bin/stockfish-19-lite-single.js']);
let buf='',res; sf.stdout.on('data',d=>{buf+=d; if(buf.includes('bestmove')){const b=buf;buf='';res(b);}});
for(const arg of process.argv.slice(2)){
  let c; if(arg.includes('/')) c=new Chess(arg); else {c=new Chess(); arg.split(' ').filter(Boolean).forEach(m=>c.move(m));}
  const out=await new Promise(r=>{res=r; sf.stdin.write(`position fen ${c.fen()}\nsetoption name MultiPV value 4\ngo depth 18\n`)});
  const ls=out.split('\n').filter(l=>l.includes(' depth 18 ')&&l.includes('multipv'));
  console.log('>>', arg.slice(-60), '|', c.fen());
  for(const l of ls){const sc=/score (cp|mate) (-?\d+)/.exec(l); const pv=l.split(' pv ')[1].split(' ').slice(0,5); const t=new Chess(c.fen()); const sans=pv.map(u=>{try{return t.move({from:u.slice(0,2),to:u.slice(2,4),promotion:u[4]}).san}catch{return u}}); console.log('   ',sc[1],sc[2],sans.join(' '));}
}
sf.kill();
