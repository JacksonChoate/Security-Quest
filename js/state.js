// Security+ Quest: save data, XP and ranks, sound effects, shared helpers.

const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function shuffle(a){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function pick(a){return a[Math.floor(Math.random()*a.length)]}
const dom=id=>DOMAINS.find(d=>d.id===id);
const hexNum=h=>parseInt(h.slice(1),16);

// ---------- save ----------
const SAVE_KEY='secplus-quest-v2';
const DEF={xp:0,qs:{},att:{},srs:{},star:{},pbq:{},cleared:{},best:{acr:0,port:0,packet:0,lab:0},exams:[],ach:{},outfit:'nightops',daily:{last:'',streak:0,best:0,count:0,chal:null},run:0,bestRun:0,tut:0,handle:'',theme:'classic',plan:{date:'',time:'09:00'},dayLog:{},story:{ch:0,best:{},done:false}};
let S;
function loadSave(){
  let raw={};
  try{raw=JSON.parse(localStorage.getItem(SAVE_KEY)||localStorage.getItem('secplus-quest-v1')||'{}')}catch(e){}
  S=Object.assign(JSON.parse(JSON.stringify(DEF)),raw);   // deep copy so defaults are never shared or mutated
  S.best=Object.assign({},DEF.best,raw.best||{});S.daily=Object.assign({},DEF.daily,raw.daily||{});S.plan=Object.assign({},DEF.plan,raw.plan||{});S.story=Object.assign({},DEF.story,raw.story||{});S.story.best=S.story.best||{};S.dayLog=S.dayLog||{};S.ach=S.ach||{};
  S.qs=S.qs||{};S.att=S.att||{};S.srs=S.srs||{};S.star=S.star||{};S.pbq=S.pbq||{};S.cleared=S.cleared||{};S.exams=S.exams||[];
  // older saves only stored the last result; seed attempt history from it
  Object.keys(S.qs).forEach(id=>{if(!S.att[id])S.att[id]={r:S.qs[id]?1:0,t:1}});
}
loadSave();
function save(){try{localStorage.setItem(SAVE_KEY,JSON.stringify(S))}catch(e){}if(typeof Meta!=='undefined')Meta.check()}
function resetSave(){const handle=S.handle;S=JSON.parse(JSON.stringify(DEF));S.handle=handle;save()}   // the hacker handle survives a reset

function mark(id,ok){
  S.qs[id]=ok?1:0;
  const a=S.att[id]||(S.att[id]={r:0,t:0});a.t++;if(ok)a.r++;
  srsGrade('q'+id,ok);
  if(typeof today==='function'){const k=today();S.dayLog[k]=(S.dayLog[k]||0)+1}   // questions answered per day (Mission Plan)
  S.run=ok?(S.run||0)+1:0;S.bestRun=Math.max(S.bestRun||0,S.run);   // correct answers in a row, for achievements
}

// ---------- spaced repetition (Leitner boxes) ----------
// Box 0 = just missed (back in about a minute); each correct answer moves an item up a box and pushes it further out.
const SRS_INT=[60e3,10*60e3,864e5,3*864e5,7*864e5,21*864e5];   // 1 min, 10 min, 1 day, 3 days, 1 week, 3 weeks
const SRS_LABEL=['learning','10 min','1 day','3 days','1 week','3 weeks'];
function srsGrade(key,ok){
  const c=S.srs[key]||{b:0,due:0,n:0};
  c.n++;c.b=ok?Math.min(5,(S.srs[key]?c.b+1:1)):0;c.due=Date.now()+SRS_INT[c.b];
  S.srs[key]=c;
}
function srsBox(key){const c=S.srs[key];return c?c.b:null}
// Order keys for study: overdue reviews first (lowest box first), then unseen items, then items not yet due.
function srsOrder(keys){
  const now=Date.now(),due=[],fresh=[],later=[];
  keys.forEach(k=>{const c=S.srs[k];if(!c)fresh.push(k);else if(c.due<=now)due.push(k);else later.push(k)});
  due.sort((a,b)=>S.srs[a].b-S.srs[b].b||S.srs[a].due-S.srs[b].due);
  later.sort((a,b)=>S.srs[a].due-S.srs[b].due);
  return due.concat(shuffle(fresh),later);
}
function srsOrderIds(ids){return srsOrder(ids.map(i=>'q'+i)).map(k=>+k.slice(1))}
function srsDueCount(keys){const now=Date.now();return keys.filter(k=>S.srs[k]&&S.srs[k].due<=now).length}

// ---------- bookmarks ----------
function toggleStar(id){if(S.star[id])delete S.star[id];else S.star[id]=1;save();return !!S.star[id]}
const starredIds=()=>Object.keys(S.star).map(Number).filter(i=>Q[i]);

// ---------- accuracy by exam objective ----------
function objStats(){
  const st={};OBJECTIVES.forEach(([o,name])=>st[o]={o,name,r:0,t:0,n:0,seen:0,acc:null});
  Q.forEach(q=>{const s=st[q.o];if(!s)return;s.n++;const a=S.att[q.id];if(a&&a.t){s.r+=a.r;s.t+=a.t;s.seen++}});
  Object.values(st).forEach(s=>{if(s.t)s.acc=s.r/s.t});
  return st;
}
// Lowest-accuracy objectives you have attempted (ties: more attempts first).
function weakestObjectives(n){return Object.values(objStats()).filter(s=>s.n&&s.t).sort((a,b)=>a.acc-b.acc||b.t-a.t).slice(0,n)}
// 20 questions drawn from the weakest objectives; untried objectives count as 60% so they get mixed in.
function weakSpotIds(total){
  total=total||20;
  const objs=Object.values(objStats()).filter(s=>s.n).sort((a,b)=>(a.acc===null?.6:a.acc)-(b.acc===null?.6:b.acc));
  const out=[];
  for(const s of objs){
    if(out.length>=total)break;
    const ids=srsOrderIds(Q.filter(q=>q.o===s.o).map(q=>q.id)).slice(0,5);
    ids.forEach(i=>{if(out.length<total)out.push(i)});
  }
  return out;
}
function mastery(d){const qs=Q.filter(q=>q.d===d);return Math.round(100*qs.filter(q=>S.qs[q.id]===1).length/qs.length)}
function missedIds(){return Object.keys(S.qs).filter(k=>S.qs[k]===0).map(Number)}
function readiness(){const core=Q.filter(q=>q.d<6);return Math.round(100*core.filter(q=>S.qs[q.id]===1).length/core.length)}

// ---------- XP ----------
const RANKS=["Intern","Help Desk Hero","Junior Analyst","SOC Analyst","Senior Analyst","Threat Hunter","Security Engineer","Security Architect","CISO"];
function level(){return Math.floor(Math.sqrt(S.xp/60))+1}
function lvlXp(l){return 60*(l-1)*(l-1)}
function rank(){return RANKS[Math.min(RANKS.length-1,level()-1)]}
function addXp(n){const before=level();S.xp+=Math.round(n);save();if(typeof App!=='undefined'&&App.game)App.hud();const up=level()>before;if(up&&typeof UI!=='undefined')UI.toast(`Level up! You are now ${rank()}`,'gold');return up}

// Sound and music live in audio.js.


// ---------- pixel art (shared by Phaser textures and HTML) ----------
function hashStr(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
function rng(seed){return function(){seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function shade(hex,amt){const n=hexNum(hex);const c=v=>Math.max(0,Math.min(255,v));const r=c((n>>16)+amt),g=c((n>>8&255)+amt),b=c((n&255)+amt);return'#'+((1<<24)|(r<<16)|(g<<8)|b).toString(16).slice(1)}

// Returns a 10x10 grid of color strings (or null) for a symmetric monster.
function monsterGrid(name,color,boss){
  const R=rng(hashStr(name)),dark=shade(color,-80),light=shade(color,60);
  const g=[...Array(10)].map(()=>Array(10).fill(null));
  for(let y=0;y<10;y++)for(let x=0;x<5;x++){
    let p=y===0?(boss?(x%2?.95:.05):.2):y===9?.5:.6;
    if(x>=2&&y>=2&&y<=7)p=1;
    if(R()<p){const r=R();const c=r<.18?dark:r<.3?light:color;g[y][x]=c;g[y][9-x]=c}
  }
  const ey=boss?3:4;
  [[2,ey],[3,ey],[6,ey],[7,ey]].forEach(([x,y])=>g[y][x]='#ffffff');
  g[ey][3]='#0a0e1a';g[ey][6]='#0a0e1a';
  if(boss){for(let x=3;x<7;x++)g[ey+2][x]='#0a0e1a';g[ey+2][3]='#ffffff';g[ey+2][6]='#ffffff'}
  else{g[ey+2][4]='#0a0e1a';g[ey+2][5]='#0a0e1a'}
  return g;
}
// ---------- player: original pixel-art hacker (16x18 grid, 7 animation frames) ----------
// Dark hoodie with the hood up; face hidden in shadow behind a glowing chevron visor.
// Upper body is drawn as left halves and mirrored. Frames:
// 0 idle, 1 hood sway, 2 visor flicker, 3-4 walk steps, 5-6 typing on a holo-keyboard (attack).
const HK_PAL={k:'#010604',h:'#0c241b',H:'#1a4834',s:'#000000',v:'#00b8cc',V:'#8ff8ff',d:'#00505c',g:'#00ff9c',p:'#08140f',b:'#16302a',L:'#00ff9c',l:'#0b5c3e','*':'#eafff5'};
const HK_TOP=[
  "......kk",
  "....kkhh",
  "...khhHh",
  "..khHhss",
  "..khssss",
  "..khsVvs",
  "..khssVv",
  "..khssss",
  "...khsss",
  "...kkhhh",
  "..khhHhg",
  ".khhHhhg",
  ".khhhhhh",
  ".khhhggg",
  ".kkhhhhh"];
const HK_LEGS=["....kppkkppk....","....kppkkppk....","...kbbbkkbbbk..."];
const HK_STEP=["....kppkkppk....","...kppk..kbbk...","..kbbbk........."];
const HK_FRAMES=7;
const rev=s=>[...s].reverse().join('');
function hackerRows(f){
  let rows=HK_TOP.map(h=>h+rev(h)),legs=HK_LEGS;
  if(f===1)for(let i=0;i<10;i++)rows[i]='.'+rows[i].slice(0,15);
  if(f===2)rows=rows.map(r=>r.replace(/v/g,'d').replace(/V/g,'v'));
  if(f===3)legs=HK_STEP;
  if(f===4)legs=HK_STEP.map(rev);
  if(f===5||f===6){
    rows=rows.map(r=>r.replace(/v/g,'V'));
    rows[11]=f===5?'.khLLLLLLLLLLhk.':'.kh*LLL*LLL*Lhk.';
    rows[12]='.kllllllllllllk.';
  }
  return rows.concat(legs);
}
function heroGrid(f){const pal=typeof outfitPal==='function'?outfitPal():HK_PAL;return hackerRows(f||0).map(r=>[...r].map(ch=>pal[ch]||null))}
function gridSVG(g){const h=g.length,w=g[0].length;let o='';g.forEach((row,y)=>row.forEach((c,x)=>{if(c)o+=`<rect x="${x}" y="${y}" width="1.02" height="1.02" fill="${c}"/>`}));return `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">${o}</svg>`}