// OMEGA's game library: complete, tested phone games used when someone asks for a well-known game.
// Each is one self-contained HTML file (touch + mouse + keyboard), so it runs in the Play window and in shared links.

const shell = (title, bg, body, script) => `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,user-scalable=no">
<title>${title}</title>
<style>
html,body{margin:0;height:100%;overflow:hidden;background:${bg};touch-action:none;-webkit-user-select:none;user-select:none;font-family:-apple-system,system-ui,sans-serif}
canvas{display:block;width:100vw;height:100vh}
${body}
</style></head><body>
<canvas id="c"></canvas>
<script>
const cv=document.getElementById('c'),x=cv.getContext('2d');let W=0,H=0,D=1;
function fit(){D=window.devicePixelRatio||1;W=innerWidth;H=innerHeight;cv.width=W*D;cv.height=H*D;x.setTransform(D,0,0,D,0,0)}
addEventListener('resize',fit);fit();
const best={get(k){try{return +localStorage.getItem(k)||0}catch(e){return best[k]||0}},set(k,v){try{localStorage.setItem(k,v)}catch(e){best[k]=v}}};
function txt(s,px,y,c,al){x.fillStyle=c||'#fff';x.font='bold '+px+'px -apple-system,system-ui,sans-serif';x.textAlign=al||'center';x.fillText(s,W/2,y)}
function outline(s,px,y){x.font='bold '+px+'px -apple-system,system-ui,sans-serif';x.textAlign='center';x.lineWidth=px/6;x.strokeStyle='#000';x.strokeText(s,W/2,y);x.fillStyle='#fff';x.fillText(s,W/2,y)}
${script}
</script></body></html>`;

const flappy = () => shell('Flappy Bird', '#4ec0ca', '', `
let st='ready',bird,pipes,score,hi=best.get('flappy'),t=0,ground=0;
const G=0.45,FLAP=-7.6,GAP=()=>Math.max(150,H*0.24),PW=64,SP=2.6;
function reset(){bird={x:W*0.3,y:H*0.45,v:0,r:16};pipes=[];score=0;t=0}
reset();
function flap(){if(st==='over'){if(t>25){reset();st='ready'}return}if(st==='ready')st='play';bird.v=FLAP}
addEventListener('touchstart',e=>{e.preventDefault();flap()},{passive:false});
addEventListener('mousedown',flap);addEventListener('keydown',e=>{if(e.code==='Space'||e.code==='ArrowUp'){e.preventDefault();flap()}});
function addPipe(){const g=GAP(),top=60+Math.random()*(H-140-g-60);pipes.push({x:W+20,top,g,done:0})}
function step(){t++;ground=(ground+(st==='over'?0:SP))%24;
 if(st==='ready'){bird.y=H*0.45+Math.sin(t/10)*8;return}
 if(st==='play'){bird.v+=G;bird.y+=bird.v;
  if(!pipes.length||pipes[pipes.length-1].x<W-Math.max(220,W*0.55))addPipe();
  for(const p of pipes){p.x-=SP;if(!p.done&&p.x+PW<bird.x){p.done=1;score++}
   if(bird.x+bird.r>p.x&&bird.x-bird.r<p.x+PW&&(bird.y-bird.r<p.top||bird.y+bird.r>p.top+p.g))die()}
  pipes=pipes.filter(p=>p.x>-PW-10);
  if(bird.y+bird.r>H-90||bird.y<-50)die()}
 if(st==='over'&&bird.y+bird.r<H-90){bird.v+=G;bird.y+=bird.v}}
function die(){st='over';t=0;if(score>hi){hi=score;best.set('flappy',hi)}}
function draw(){x.fillStyle='#4ec0ca';x.fillRect(0,0,W,H);
 x.fillStyle='#e9fcd9';for(let i=0;i<6;i++){const cx=((i*170-t*0.4)%(W+200)+W+200)%(W+200)-100;x.beginPath();x.arc(cx,H*0.2+(i%3)*40,30,0,7);x.arc(cx+30,H*0.2+(i%3)*40-12,36,0,7);x.arc(cx+64,H*0.2+(i%3)*40,28,0,7);x.fill()}
 for(const p of pipes){x.fillStyle='#73bf2e';x.fillRect(p.x,0,PW,p.top);x.fillRect(p.x,p.top+p.g,PW,H);x.fillStyle='#558c22';x.fillRect(p.x-4,p.top-24,PW+8,24);x.fillRect(p.x-4,p.top+p.g,PW+8,24);x.fillStyle='rgba(255,255,255,.25)';x.fillRect(p.x+6,0,8,p.top-24);x.fillRect(p.x+6,p.top+p.g+24,8,H)}
 x.fillStyle='#ded895';x.fillRect(0,H-90,W,90);x.fillStyle='#73bf2e';x.fillRect(0,H-90,W,16);x.fillStyle='#558c22';for(let i=-24;i<W+24;i+=24)x.fillRect(i-ground,H-90,12,16);
 x.save();x.translate(bird.x,bird.y);x.rotate(Math.max(-0.5,Math.min(1.3,bird.v/10)));
 x.fillStyle='#f8d74b';x.beginPath();x.ellipse(0,0,bird.r+3,bird.r,0,0,7);x.fill();x.strokeStyle='#000';x.lineWidth=2;x.stroke();
 x.fillStyle='#fff';x.beginPath();x.arc(7,-6,6,0,7);x.fill();x.stroke();x.fillStyle='#000';x.beginPath();x.arc(9,-6,2.5,0,7);x.fill();
 x.fillStyle='#f36f2e';x.beginPath();x.moveTo(12,1);x.lineTo(24,4);x.lineTo(12,9);x.closePath();x.fill();x.stroke();
 x.fillStyle='#fff3b0';x.beginPath();x.ellipse(-6,3,8,5,(t%20<10?-0.4:0.4),0,7);x.fill();x.stroke();x.restore();
 if(st!=='ready')outline(score,56,90);
 if(st==='ready'){outline('Flappy Bird',44,H*0.28);outline('Tap to flap',24,H*0.62)}
 if(st==='over'){outline('Game Over',46,H*0.32);outline('Score '+score+'   Best '+hi,24,H*0.32+46);if(t>25)outline('Tap to play again',22,H*0.32+90)}}
(function loop(){step();draw();requestAnimationFrame(loop)})();`);

const snake = () => shell('Snake', '#1b1f24', '', `
let N=18,cs,ox,oy,snake,dir,next,food,score,st='ready',hi=best.get('snake'),acc=0,last=0,sx=0,sy=0;
function grid(){cs=Math.floor(Math.min(W,H-120)/N);ox=Math.floor((W-cs*N)/2);oy=Math.floor((H-cs*N)/2)+30}
function reset(){grid();snake=[{x:8,y:9},{x:7,y:9},{x:6,y:9}];dir={x:1,y:0};next=dir;score=0;place()}
function place(){do{food={x:Math.random()*N|0,y:Math.random()*N|0}}while(snake.some(s=>s.x===food.x&&s.y===food.y))}
reset();addEventListener('resize',grid);
function turn(dx,dy){if(st!=='play'){if(st==='over')reset();st='play'}if(dx===-dir.x&&dy===-dir.y)return;next={x:dx,y:dy}}
addEventListener('keydown',e=>{const k={ArrowUp:[0,-1],ArrowDown:[0,1],ArrowLeft:[-1,0],ArrowRight:[1,0],KeyW:[0,-1],KeyS:[0,1],KeyA:[-1,0],KeyD:[1,0]}[e.code];if(k){e.preventDefault();turn(...k)}});
addEventListener('touchstart',e=>{e.preventDefault();sx=e.touches[0].clientX;sy=e.touches[0].clientY},{passive:false});
addEventListener('touchend',e=>{const dx=e.changedTouches[0].clientX-sx,dy=e.changedTouches[0].clientY-sy;if(Math.max(Math.abs(dx),Math.abs(dy))<20){if(st!=='play'){turn(dir.x,dir.y)}return}Math.abs(dx)>Math.abs(dy)?turn(Math.sign(dx),0):turn(0,Math.sign(dy))});
addEventListener('mousedown',()=>{if(st!=='play')turn(dir.x,dir.y)});
function step(){dir=next;const h={x:snake[0].x+dir.x,y:snake[0].y+dir.y};
 if(h.x<0||h.y<0||h.x>=N||h.y>=N||snake.some(s=>s.x===h.x&&s.y===h.y)){st='over';if(score>hi){hi=score;best.set('snake',hi)}return}
 snake.unshift(h);if(h.x===food.x&&h.y===food.y){score++;place()}else snake.pop()}
function draw(){x.fillStyle='#1b1f24';x.fillRect(0,0,W,H);
 for(let i=0;i<N;i++)for(let j=0;j<N;j++){x.fillStyle=(i+j)%2?'#a2d149':'#aad751';x.fillRect(ox+i*cs,oy+j*cs,cs,cs)}
 x.fillStyle='#e7471d';x.beginPath();x.arc(ox+food.x*cs+cs/2,oy+food.y*cs+cs/2,cs*0.4,0,7);x.fill();
 snake.forEach((s,i)=>{x.fillStyle=i?'#4674e9':'#2f5bd3';const p=i?cs*0.08:0;x.beginPath();x.roundRect(ox+s.x*cs+p,oy+s.y*cs+p,cs-2*p,cs-2*p,cs*0.3);x.fill()});
 const h=snake[0];x.fillStyle='#fff';x.beginPath();x.arc(ox+h.x*cs+cs/2+dir.y*cs*0.18+dir.x*cs*0.15,oy+h.y*cs+cs/2-dir.x*cs*0.18+dir.y*cs*0.15,cs*0.12,0,7);x.arc(ox+h.x*cs+cs/2-dir.y*cs*0.18+dir.x*cs*0.15,oy+h.y*cs+cs/2+dir.x*cs*0.18+dir.y*cs*0.15,cs*0.12,0,7);x.fill();
 txt('🍎 '+score+'    🏆 '+hi,26,oy-18);
 if(st==='ready'){x.fillStyle='rgba(0,0,0,.45)';x.fillRect(0,0,W,H);txt('Snake',48,H*0.4);txt('Swipe to move · tap to start',20,H*0.4+44)}
 if(st==='over'){x.fillStyle='rgba(0,0,0,.45)';x.fillRect(0,0,W,H);txt('Game Over',44,H*0.4);txt('Score '+score+' · tap or swipe to play again',18,H*0.4+40)}}
(function loop(ts){if(st==='play'){acc+=ts-last;const sp=Math.max(70,140-score*3);while(acc>sp){acc-=sp;step();if(st!=='play')break}}else acc=0;last=ts;draw();requestAnimationFrame(loop)})(0);`);

const pong = () => shell('Pong', '#111', '', `
let you,ai,ball,ys=0,as=0,st='ready',tx=null;const PW=90,PH=14,R=9,WIN=7;
function serve(d){ball={x:W/2,y:H/2,vx:(Math.random()*2-1)*3,vy:5*d}}
function reset(){you={x:W/2};ai={x:W/2};ys=as=0;serve(1)}
reset();
const go=()=>{if(st!=='play'){if(st==='over')reset();st='play'}};
addEventListener('touchstart',e=>{e.preventDefault();go();tx=e.touches[0].clientX},{passive:false});
addEventListener('touchmove',e=>{e.preventDefault();tx=e.touches[0].clientX},{passive:false});
addEventListener('mousemove',e=>tx=e.clientX);addEventListener('mousedown',go);
const keys={};addEventListener('keydown',e=>{keys[e.code]=1;go()});addEventListener('keyup',e=>keys[e.code]=0);
function step(){if(st!=='play')return;
 if(keys.ArrowLeft)tx=you.x-30;if(keys.ArrowRight)tx=you.x+30;
 if(tx!=null)you.x+=(tx-you.x)*0.35;you.x=Math.max(PW/2,Math.min(W-PW/2,you.x));
 ai.x+=Math.max(-4.2,Math.min(4.2,ball.x-ai.x));ai.x=Math.max(PW/2,Math.min(W-PW/2,ai.x));
 ball.x+=ball.vx;ball.y+=ball.vy;if(ball.x<R||ball.x>W-R){ball.vx*=-1;ball.x=Math.max(R,Math.min(W-R,ball.x))}
 const py=H-60,ay=60;
 if(ball.vy>0&&ball.y+R>py&&ball.y<py+PH&&Math.abs(ball.x-you.x)<PW/2+R){ball.vy=-Math.min(13,Math.abs(ball.vy)*1.06);ball.vx=(ball.x-you.x)/(PW/2)*6}
 if(ball.vy<0&&ball.y-R<ay+PH&&ball.y>ay&&Math.abs(ball.x-ai.x)<PW/2+R){ball.vy=Math.min(13,Math.abs(ball.vy)*1.06);ball.vx=(ball.x-ai.x)/(PW/2)*6}
 if(ball.y>H+20){as++;serve(-1)}if(ball.y<-20){ys++;serve(1)}
 if(ys>=WIN||as>=WIN)st='over'}
function draw(){x.fillStyle='#111';x.fillRect(0,0,W,H);x.strokeStyle='#333';x.setLineDash([12,12]);x.lineWidth=4;x.beginPath();x.moveTo(0,H/2);x.lineTo(W,H/2);x.stroke();x.setLineDash([]);
 txt(as,64,H/2-40,'#444');txt(ys,64,H/2+90,'#444');
 x.fillStyle='#ff5c5c';x.beginPath();x.roundRect(ai.x-PW/2,60,PW,PH,7);x.fill();x.fillStyle='#5cc8ff';x.beginPath();x.roundRect(you.x-PW/2,H-60,PW,PH,7);x.fill();
 x.fillStyle='#fff';x.beginPath();x.arc(ball.x,ball.y,R,0,7);x.fill();
 if(st==='ready'){txt('Pong',52,H*0.3);txt('Drag to move · first to '+WIN,20,H*0.3+40,'#aaa')}
 if(st==='over'){txt(ys>as?'You win! 🎉':'Computer wins',40,H*0.3);txt('Tap to play again',20,H*0.3+40,'#aaa')}}
(function loop(){step();draw();requestAnimationFrame(loop)})();`);

const breakout = () => shell('Breakout', '#0f1420', '', `
let pad,ball,bricks,score,lives,st='ready',tx=null,hi=best.get('breakout');const COLS=8,ROWS=6,COLORS=['#ff595e','#ff924c','#ffca3a','#8ac926','#1982c4','#6a4c93'];
function build(){bricks=[];const bw=(W-20)/COLS;for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++)bricks.push({x:10+c*bw+2,y:90+r*26,w:bw-4,h:20,col:COLORS[r],on:1})}
function newBall(){ball={x:pad.x,y:H-90,vx:3*(Math.random()<.5?-1:1),vy:-5.5,r:8,stuck:1}}
function reset(){pad={x:W/2,w:Math.min(110,W*0.26)};score=0;lives=3;build();newBall()}
reset();
const go=()=>{if(st==='over'||st==='won'){reset();st='play'}else{st='play';ball.stuck=0}};
addEventListener('touchstart',e=>{e.preventDefault();tx=e.touches[0].clientX;go()},{passive:false});
addEventListener('touchmove',e=>{e.preventDefault();tx=e.touches[0].clientX},{passive:false});
addEventListener('mousemove',e=>tx=e.clientX);addEventListener('mousedown',go);
const keys={};addEventListener('keydown',e=>{keys[e.code]=1;if(e.code==='Space')go()});addEventListener('keyup',e=>keys[e.code]=0);
function step(){if(keys.ArrowLeft)tx=pad.x-25;if(keys.ArrowRight)tx=pad.x+25;if(tx!=null)pad.x+=(tx-pad.x)*0.4;pad.x=Math.max(pad.w/2,Math.min(W-pad.w/2,pad.x));
 if(st!=='play'||ball.stuck){ball.x=pad.x;ball.y=H-90;return}
 ball.x+=ball.vx;ball.y+=ball.vy;if(ball.x<ball.r||ball.x>W-ball.r)ball.vx*=-1;if(ball.y<ball.r+50)ball.vy=Math.abs(ball.vy);
 if(ball.vy>0&&ball.y+ball.r>H-70&&ball.y<H-56&&Math.abs(ball.x-pad.x)<pad.w/2+ball.r){ball.vy=-Math.abs(ball.vy);ball.vx=(ball.x-pad.x)/(pad.w/2)*6}
 for(const b of bricks)if(b.on&&ball.x>b.x-ball.r&&ball.x<b.x+b.w+ball.r&&ball.y>b.y-ball.r&&ball.y<b.y+b.h+ball.r){b.on=0;score+=10;ball.vy*=-1;ball.vx*=1.01;ball.vy*=1.01;break}
 if(ball.y>H+20){lives--;if(lives<=0){st='over';if(score>hi){hi=score;best.set('breakout',hi)}}else{newBall();st='ready'}}
 if(bricks.every(b=>!b.on)){st='won';if(score>hi){hi=score;best.set('breakout',hi)}}}
function draw(){x.fillStyle='#0f1420';x.fillRect(0,0,W,H);
 x.fillStyle='#fff';x.font='bold 18px -apple-system,system-ui';x.textAlign='left';x.fillText('Score '+score,14,34);x.textAlign='right';x.fillText('❤️'.repeat(Math.max(0,lives)),W-14,34);
 for(const b of bricks)if(b.on){x.fillStyle=b.col;x.beginPath();x.roundRect(b.x,b.y,b.w,b.h,5);x.fill()}
 x.fillStyle='#e8ecf4';x.beginPath();x.roundRect(pad.x-pad.w/2,H-70,pad.w,14,7);x.fill();
 x.fillStyle='#fff';x.beginPath();x.arc(ball.x,ball.y,ball.r,0,7);x.fill();
 if(st==='ready')txt(lives<3?'Tap to launch':'Breakout · tap to launch',22,H*0.62);
 if(st==='over'){txt('Game Over',44,H*0.55);txt('Score '+score+' · Best '+hi+' · tap to retry',18,H*0.55+38,'#aaa')}
 if(st==='won'){txt('You cleared it! 🎉',36,H*0.55);txt('Tap to play again',18,H*0.55+38,'#aaa')}}
(function loop(){step();draw();requestAnimationFrame(loop)})();`);

const tictactoe = () => shell('Tic-Tac-Toe', '#14213d', '', `
let b,turn,st,msg,wins={you:0,cpu:0,tie:0};const L=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
function reset(){b=Array(9).fill('');turn='X';st='play';msg='Your turn (X)'}
reset();
function geo(){const s=Math.min(W,H-200)*0.9,cs=s/3;return{s,cs,ox:(W-s)/2,oy:(H-s)/2+20}}
function winner(bd){for(const l of L)if(bd[l[0]]&&bd[l[0]]===bd[l[1]]&&bd[l[1]]===bd[l[2]])return bd[l[0]];return bd.every(v=>v)?'tie':''}
function mm(bd,p){const w=winner(bd);if(w==='O')return 10;if(w==='X')return -10;if(w==='tie')return 0;let best=p==='O'?-99:99;for(let i=0;i<9;i++)if(!bd[i]){bd[i]=p;const v=mm(bd,p==='O'?'X':'O');bd[i]='';best=p==='O'?Math.max(best,v):Math.min(best,v)}return best}
function cpu(){let bi=-1,bv=-99;const free=b.map((v,i)=>v?-1:i).filter(i=>i>=0);
 if(Math.random()<0.2){bi=free[Math.random()*free.length|0]}else for(const i of free){b[i]='O';const v=mm(b,'X');b[i]='';if(v>bv){bv=v;bi=i}}
 b[bi]='O';end()||(turn='X',msg='Your turn (X)')}
function end(){const w=winner(b);if(!w)return false;st='over';if(w==='X'){wins.you++;msg='You win! 🎉'}else if(w==='O'){wins.cpu++;msg='Computer wins'}else{wins.tie++;msg="It's a tie"}msg+=' · tap to play again';return true}
function tap(px,py){if(st==='over'){reset();return}if(turn!=='X')return;const g=geo(),c=Math.floor((px-g.ox)/g.cs),r=Math.floor((py-g.oy)/g.cs);if(c<0||c>2||r<0||r>2)return;const i=r*3+c;if(b[i])return;b[i]='X';if(!end()){turn='O';msg='Thinking…';setTimeout(cpu,350)}}
addEventListener('touchstart',e=>{e.preventDefault();tap(e.touches[0].clientX,e.touches[0].clientY)},{passive:false});
addEventListener('mousedown',e=>tap(e.clientX,e.clientY));
function draw(){x.fillStyle='#14213d';x.fillRect(0,0,W,H);const g=geo();
 txt('Tic-Tac-Toe',34,g.oy-70);txt('You '+wins.you+' · Computer '+wins.cpu+' · Ties '+wins.tie,16,g.oy-40,'#9fb3d9');
 x.strokeStyle='#fca311';x.lineWidth=6;x.lineCap='round';for(let i=1;i<3;i++){x.beginPath();x.moveTo(g.ox+i*g.cs,g.oy+10);x.lineTo(g.ox+i*g.cs,g.oy+g.s-10);x.stroke();x.beginPath();x.moveTo(g.ox+10,g.oy+i*g.cs);x.lineTo(g.ox+g.s-10,g.oy+i*g.cs);x.stroke()}
 b.forEach((v,i)=>{const cx=g.ox+(i%3+0.5)*g.cs,cy=g.oy+((i/3|0)+0.5)*g.cs,r=g.cs*0.3;x.lineWidth=10;
  if(v==='X'){x.strokeStyle='#5cc8ff';x.beginPath();x.moveTo(cx-r,cy-r);x.lineTo(cx+r,cy+r);x.moveTo(cx+r,cy-r);x.lineTo(cx-r,cy+r);x.stroke()}
  if(v==='O'){x.strokeStyle='#ff6b6b';x.beginPath();x.arc(cx,cy,r,0,7);x.stroke()}});
 txt(msg,20,g.oy+g.s+50)}
(function loop(){draw();requestAnimationFrame(loop)})();`);

export const GAMES = [
  { key: 'flappy', name: 'Flappy Bird', emoji: '🐤', match: /flappy|flap+y|bird (game|jump)|tap.*bird/i, make: flappy },
  { key: 'snake', name: 'Snake', emoji: '🐍', match: /\bsnake\b/i, make: snake },
  { key: 'pong', name: 'Pong', emoji: '🏓', match: /\bpong\b|ping ?pong|table tennis/i, make: pong },
  { key: 'breakout', name: 'Breakout', emoji: '🧱', match: /breakout|brick ?breaker|break ?out|arkanoid|bricks? game/i, make: breakout },
  { key: 'tictactoe', name: 'Tic-Tac-Toe', emoji: '❌', match: /tic[\s-]*tac[\s-]*toe|noughts|x'?s and o'?s/i, make: tictactoe },
];
export function findGame(text) { return GAMES.find(g => g.match.test(text)) || null; }
