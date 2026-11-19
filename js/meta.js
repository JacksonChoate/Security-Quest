// Security+ Quest: meta progression and preferences.
// Daily login streak + daily challenge, achievements, unlockable outfits, first-run tutorial,
// battle pause menu, accessibility preferences, and save export / import. Also the Profile screen.

// ---------- preferences (stored with audio settings, so they stay per computer) ----------
const PREF_DEFAULTS={timer:false,timerSecs:30,contrast:false,motion:false,text:1};
Object.keys(PREF_DEFAULTS).forEach(k=>{if(Settings[k]===undefined)Settings[k]=PREF_DEFAULTS[k]});

const today=()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
const dayDiff=(a,b)=>Math.round((new Date(b+'T00:00')-new Date(a+'T00:00'))/864e5);

// ---------- outfits: palette swaps for the hacker sprite ----------
const OUTFITS=[
  {id:'nightops',name:'Night Ops',req:{lvl:1},pal:{}},
  {id:'stealth',name:'Stealth Black',req:{lvl:2},pal:{h:'#0b0d0c',H:'#1f2422',v:'#9aa5a0',V:'#ffffff',d:'#3a403d',g:'#9aa5a0',L:'#ffffff',l:'#3a403d'}},
  {id:'ice',name:'Ice Protocol',req:{lvl:3},pal:{h:'#0b2233',H:'#174566',v:'#00e5ff',V:'#d9fbff',g:'#00e5ff',L:'#00e5ff',l:'#0b4a5c'}},
  {id:'crimson',name:'Crimson Root',req:{lvl:4},pal:{h:'#2a0710',H:'#4d0f1f',v:'#ff2e63',V:'#ffc2cf',d:'#5c0010',g:'#ff2e63',L:'#ff2e63',l:'#5c0010'}},
  {id:'violet',name:'Violet Proxy',req:{lvl:5},pal:{h:'#1c1238',H:'#33236b',v:'#c39bff',V:'#f0e6ff',d:'#4a3b85',g:'#a98bff',L:'#c39bff',l:'#33236b'}},
  {id:'ghost',name:'Ghost White',req:{lvl:6},pal:{h:'#c9d6d0',H:'#ffffff',k:'#2a3a33',v:'#00ff9c',V:'#d9ffec',g:'#00ff9c'}},
  {id:'gold',name:'Gold Clearance',req:{lvl:8},pal:{h:'#2a2008',H:'#4d3b10',v:'#ffd23f',V:'#fff6cc',d:'#6b5a1a',g:'#ffd23f',L:'#ffd23f',l:'#6b5a1a'}},
  {id:'zeroday',name:'Zero Day',req:{ach:'run50'},pal:{h:'#050505',H:'#1a1a1a',v:'#ff9b4d',V:'#ffffff',d:'#6b3a12',g:'#ff2e63',L:'#00e5ff',l:'#3a0712'}},
  {id:'auditor',name:'Auditor\'s Coat',req:{ach:'examPass'},pal:{h:'#3d2a10',H:'#6b4a1f',v:'#ffc94d',V:'#fff1c2',g:'#ffc94d',L:'#ffc94d',l:'#3d2a10'}}
];
function outfitPal(id){const o=OUTFITS.find(x=>x.id===(id||S.outfit))||OUTFITS[0];return Object.assign({},HK_PAL,o.pal)}
function outfitUnlocked(o){return o.req.ach?!!S.ach[o.req.ach]:level()>=o.req.lvl}
function outfitReq(o){return o.req.ach?`Achievement: ${(ACH.find(a=>a.id===o.req.ach)||{}).name}`:`Level ${o.req.lvl}`}

// (Re)build the hacker spritesheet + animations in the current outfit. Safe to call any time no scene is using it.
function buildHacker(textures,anims){
  const px=5,fw=16*px,fh=18*px;
  ['hk_idle','hk_walk','hk_type'].forEach(k=>{if(anims.exists(k))anims.remove(k)});
  if(textures.exists('hacker'))textures.remove('hacker');
  const tex=textures.createCanvas('hacker',fw*HK_FRAMES,fh),ctx=tex.getContext();
  for(let f=0;f<HK_FRAMES;f++)heroGrid(f).forEach((row,y)=>row.forEach((c,x)=>{if(c){ctx.fillStyle=c;ctx.fillRect(f*fw+x*px,y*px,px,px)}}));
  tex.refresh();
  for(let f=0;f<HK_FRAMES;f++)tex.add(f,0,f*fw,0,fw,fh);
  const fr=l=>l.map(frame=>({key:'hacker',frame}));
  anims.create({key:'hk_idle',frames:fr([0,0,1,1,0,2,0,1]),frameRate:4,repeat:-1});
  anims.create({key:'hk_walk',frames:fr([3,0,4,0]),frameRate:9,repeat:-1});
  anims.create({key:'hk_type',frames:fr([5,6,5,6,5,6]),frameRate:16,repeat:0});
}

// ---------- achievements ----------
const ACH=[
  {id:'first',name:'Hello, World',icon:'>_',desc:'Answer your first question correctly.',test:()=>Object.values(S.att).some(a=>a.r>0)},
  {id:'zone1',name:'Foothold',icon:'[1]',desc:'Clear your first zone.',test:()=>Object.keys(S.cleared).length>0},
  {id:'allZones',name:'Domain Sweep',icon:'[5]',desc:'Clear all five exam-domain zones.',test:()=>[1,2,3,4,5].every(d=>S.cleared[d])},
  {id:'fullClear',name:'Full Clear',icon:'[*]',desc:'Clear every zone, including the AI bonus zone.',test:()=>[1,2,3,4,5,6].every(d=>S.cleared[d])},
  {id:'run10',name:'On a Roll',icon:'x10',desc:'Get 10 correct answers in a row.',test:()=>S.bestRun>=10},
  {id:'run25',name:'Hot Streak',icon:'x25',desc:'Get 25 correct answers in a row.',test:()=>S.bestRun>=25},
  {id:'run50',name:'Zero Day Mind',icon:'x50',desc:'Get 50 correct answers in a row. Unlocks the Zero Day outfit.',test:()=>S.bestRun>=50},
  {id:'run100',name:'Untouchable',icon:'100',desc:'Get 100 correct answers in a row.',test:()=>S.bestRun>=100},
  {id:'ports',name:'Port Authority',icon:':443',desc:'Master all ports: every port flashcard reaches the 3-day box.',test:()=>PORTS.every(([p])=>(srsBox('p:'+p)||0)>=3)},
  {id:'acr50',name:'Acronym Archivist',icon:'ABC',desc:'Get 50 acronym flashcards to the 1-day box.',test:()=>ACR.filter(([a])=>(srsBox('a:'+a)||0)>=2).length>=50},
  {id:'terms',name:'Lexicon',icon:'Aa',desc:'Get every key-term flashcard to the 1-day box.',test:()=>TERMS.every(([t])=>(srsBox('t:'+t)||0)>=2)},
  {id:'examDone',name:'Exam Day',icon:'90',desc:'Finish a full 90-question practice exam.',test:()=>S.exams.some(e=>e.kind==='full'&&e.n===90)},
  {id:'examPass',name:'Practice Certified',icon:'750',desc:'Score 81% or more on a full practice exam. Unlocks the Auditor\'s Coat.',test:()=>S.exams.some(e=>(e.kind||'full')==='full'&&e.pct>=81)},
  {id:'quick5',name:'Coffee Break',icon:'15m',desc:'Finish 5 Quick Quizzes.',test:()=>S.exams.filter(e=>e.kind==='quick').length>=5},
  {id:'pbqAce',name:'Hands-On',icon:'PBQ',desc:'Pass all 5 tasks in one PBQ Lab run.',test:()=>S.best.lab>=5},
  {id:'packet500',name:'Firewall',icon:'FW',desc:'Score 500 in Packet Defender.',test:()=>S.best.packet>=500},
  {id:'streak3',name:'Habit Forming',icon:'3d',desc:'Log in 3 days in a row.',test:()=>S.daily.best>=3},
  {id:'streak7',name:'One Week Uptime',icon:'7d',desc:'Log in 7 days in a row.',test:()=>S.daily.best>=7},
  {id:'streak30',name:'Five Nines',icon:'30d',desc:'Log in 30 days in a row.',test:()=>S.daily.best>=30},
  {id:'daily5',name:'Daily Driver',icon:'D5',desc:'Complete 5 daily challenges.',test:()=>(S.daily.count||0)>=5},
  {id:'stars10',name:'Bookworm',icon:'*10',desc:'Bookmark 10 questions.',test:()=>Object.keys(S.star).length>=10},
  {id:'allObj',name:'Full Coverage',icon:'obj',desc:'Attempt every exam objective that has questions.',test:()=>Object.values(objStats()).every(s=>!s.n||s.t>0)},
  {id:'objMaster',name:'Specialist',icon:'90%',desc:'Reach 90% on one objective with at least 10 attempts.',test:()=>Object.values(objStats()).some(s=>s.t>=10&&s.acc>=.9)},
  {id:'seenAll',name:'Completionist',icon:'ALL',desc:'Answer every question in the bank at least once.',test:()=>Q.every(q=>S.att[q.id])},
  {id:'ciso',name:'CISO',icon:'LV9',desc:'Reach the top rank.',test:()=>level()>=9}
];
const ACH_XP=50;

const Meta={
  // Called after every save. Unlocks anything newly earned.
  check(){
    if(Meta._busy||!S||!S.ach)return;Meta._busy=true;
    const got=[];
    ACH.forEach(a=>{if(S.ach[a.id])return;let ok=false;try{ok=a.test()}catch(e){}if(ok){S.ach[a.id]=Date.now();got.push(a)}});
    if(got.length){
      const lvlBefore=level();S.xp+=ACH_XP*got.length;
      try{localStorage.setItem(SAVE_KEY,JSON.stringify(S))}catch(e){}
      if(got.length>2)UI.toast(`${got.length} achievements unlocked. +${ACH_XP*got.length} XP`,'gold');
      else got.forEach(a=>UI.toast(`Achievement unlocked: ${a.name}. +${ACH_XP} XP`,'gold'));
      sfx.hack();
      OUTFITS.filter(o=>o.req.ach&&got.some(a=>a.id===o.req.ach)).forEach(o=>UI.toast(`New outfit unlocked: ${o.name}`,'gold'));
      if(level()>lvlBefore)UI.toast(`Level up! You are now ${rank()}`,'gold');
      if(typeof App!=='undefined'&&App.game)App.hud();
    }
    Meta._busy=false;
  },

  // ---------- daily login streak + daily challenge ----------
  login(){
    const t=today(),D=S.daily;if(D.last===t)return;
    const gap=D.last?dayDiff(D.last,t):99;
    D.streak=gap===1?D.streak+1:1;D.best=Math.max(D.best,D.streak);D.last=t;
    const xp=Math.min(50,10+5*(D.streak-1));
    save();addXp(xp);
    setTimeout(()=>UI.toast(`Day ${D.streak} login streak. +${xp} XP`,'gold'),600);
  },
  // Same 5 questions for everyone on a given day: one from each exam domain.
  dailyIds(){const R=rng(hashStr('daily-'+today()));return [1,2,3,4,5].map(d=>{const qs=Q.filter(q=>q.d===d);return qs[Math.floor(R()*qs.length)].id})},
  dailyDoneToday(){return S.daily.chal&&S.daily.chal.date===today()},
  startDaily(){App.go('battle',{kind:'daily',ids:Meta.dailyIds(),label:'Daily Challenge',sub:today()})},
  dailyDone(B){
    if(Meta.dailyDoneToday())return;
    const right=Math.min(5,B.right);
    S.daily.chal={date:today(),right};S.daily.count=(S.daily.count||0)+1;
    const xp=50+20*right;save();addXp(xp);
    UI.toast(`Daily challenge complete: ${right}/5. +${xp} bonus XP`,'gold');
  },
  dailyBox(){
    const D=S.daily,done=Meta.dailyDoneToday();
    return `<div class="dailybox"><span class="pix streak">streak ${D.streak||0}d</span><span class="tiny">best ${D.best||0}d</span>
      ${done?`<span class="chip ok">daily challenge done: ${D.chal.right}/5</span>`:`<button class="btn sm" onclick="Meta.startDaily()">Daily challenge: 5 questions, bonus XP</button>`}${typeof Modes!=='undefined'&&Modes.planLine?Modes.planLine():''}</div>`;
  },

  // ---------- pause menu (Esc in battles) ----------
  pause(){
    const sc=App.scene('Battle');if(!sc||sc.B.over||UI._modal)return;
    sc.scene.pause();UI.paused=true;Sound.alarm(false);sfx.select();
    const m=document.createElement('div');m.className='modal';
    m.innerHTML=`<div class="mbox pausebox" role="dialog" aria-modal="true" aria-labelledby="pzT">
      <div class="pix set-title" id="pzT">&gt; process suspended</div>
      <p class="tiny">The battle and the answer timer are paused.</p>
      <div class="pzbtns"><button class="btn" data-a="resume">Resume (Esc)</button>
      <button class="btn ghost" data-a="timer" aria-pressed="${Settings.timer}">Answer timer: ${Settings.timer?'on':'off'}</button>
      <button class="btn ghost" data-a="cfg">Settings</button><button class="btn ghost" data-a="quit">Quit to map</button></div></div>`;
    const close=()=>{
      m.remove();UI._modal=null;UI.paused=false;
      const s=App.game.scene.getScene('Battle');if(App.mode==='battle'&&s&&s.sys.isPaused()){App.game.scene.resume('Battle');s.checkAlarm&&s.checkAlarm()}   // never resume a battle we are leaving
    };
    m.onclick=e=>{
      const a=e.target.dataset.a;
      if(a==='resume'||e.target===m)close();
      else if(a==='timer'){Settings.timer=!Settings.timer;saveSettings();e.target.textContent=`Answer timer: ${Settings.timer?'on':'off'} (from the next question)`;e.target.setAttribute('aria-pressed',Settings.timer)}
      else if(a==='cfg'){close();UI.settings()}
      else if(a==='quit'){close();App.go('world')}
    };
    document.body.appendChild(m);UI._modal=close;m.querySelector('[data-a=resume]').focus();
  },

  // ---------- accessibility ----------
  applyPrefs(){
    document.body.classList.toggle('hc',!!Settings.contrast);
    document.body.classList.toggle('rm',!!Settings.motion);
    document.documentElement.style.setProperty('--ts',Settings.text||1);
  },

  // ---------- first-run tutorial ----------
  TUT:[
    ['> welcome, operator','Security+ Quest turns the CompTIA Security+ exam into a hacking RPG. Every question is a real exam topic, and every answer comes with an explanation, including why the wrong answers are wrong.'],
    ['> move','On the campus map, move with WASD or the arrow keys, or tap where you want to go. Each glowing portal is one exam domain. Walk onto it and press E (or tap it) to connect.'],
    ['> battle','Answer with keys 1-4 or a tap. A right answer attacks; a wrong one hurts you. Read the explanation, then press Enter for the next question. S bookmarks a question and Esc pauses the battle.'],
    ['> train','The kiosks along the bottom hold everything else: Flashcards, Weak Spots, the Objectives heatmap, PBQ Lab, timed practice exams and arcade games. Questions you miss come back sooner.'],
    ['> every day','Log in daily to build a streak, and play the 5-question daily challenge for bonus XP. Open [ me ] for achievements, outfits and save transfer, and [ cfg ] for audio, the answer timer and accessibility.']
  ],
  tutorial(){
    if(UI._modal)UI._modal();
    let i=0;const m=document.createElement('div');m.className='modal';
    const done=()=>{m.remove();UI._modal=null;S.tut=1;save()};
    const draw=()=>{
      const [t,body]=Meta.TUT[i],last=i===Meta.TUT.length-1;
      m.innerHTML=`<div class="mbox tutbox" role="dialog" aria-modal="true" aria-labelledby="tutT">
        <div class="tutsteps">${Meta.TUT.map((x,j)=>`<i class="${j<i?'past':j===i?'now':''}"></i>`).join('')}</div>
        <div class="pix set-title" id="tutT"></div><p>${esc(body)}</p>
        <div class="row between"><button class="linkbtn" data-a="skip">Skip tutorial</button><span>${i?'<button class="btn ghost sm" data-a="back">Back</button> ':''}<button class="btn" data-a="next">${last?'Start playing':'Next'}</button></span></div></div>`;
      FX.typeInline(m.querySelector('#tutT'),t,22);m.querySelector('[data-a=next]').focus();
    };
    m.onclick=e=>{const a=e.target.dataset.a;if(a==='skip')done();if(a==='back'){i--;draw()}if(a==='next'){if(i===Meta.TUT.length-1)done();else{i++;draw()}}};
    document.body.appendChild(m);UI._modal=done;draw();
  },

  // ---------- save export / import ----------
  exportCode(){
    const bytes=new TextEncoder().encode(JSON.stringify(S));let bin='';
    for(let i=0;i<bytes.length;i+=8192)bin+=String.fromCharCode.apply(null,bytes.subarray(i,i+8192));
    const b64=btoa(bin);return 'SQ2-'+hashStr(b64).toString(36)+'-'+b64;
  },
  parseCode(code){
    code=String(code||'').replace(/\s+/g,'');
    const m=/^SQ2-([0-9a-z]+)-([A-Za-z0-9+/=]+)$/.exec(code);
    if(!m)throw new Error('That does not look like a Security+ Quest save code. Codes start with SQ2-.');
    if(hashStr(m[2]).toString(36)!==m[1])throw new Error('The code is incomplete or was changed. Copy the whole code again.');
    const bin=atob(m[2]),obj=JSON.parse(new TextDecoder().decode(Uint8Array.from(bin,c=>c.charCodeAt(0))));
    if(!obj||typeof obj!=='object'||typeof obj.xp!=='number')throw new Error('The code decoded, but it is not a save.');
    return obj;
  },
  importCode(code){
    let obj;try{obj=Meta.parseCode(code)}catch(e){UI.toast(e.message);return}
    UI.confirm(`Replace your progress on this computer with the imported save (level ${Math.floor(Math.sqrt(obj.xp/60))+1}, ${obj.xp} XP)? This cannot be undone.`,'Import save',()=>{
      const keep=S.handle;try{localStorage.setItem(SAVE_KEY,JSON.stringify(obj))}catch(e){}
      loadSave();if(!S.handle)S.handle=keep;save();buildHacker(App.game.textures,App.game.anims);App.worldPos=null;
      UI.toast('Save imported.');App.go('world');
    },true);
  }
};

// Esc opens the pause menu during battles (capture phase, so it runs before other key handlers).
document.addEventListener('keydown',e=>{
  if(e.key!=='Escape'||UI._modal||App.mode!=='battle')return;
  const sc=App.scene('Battle');if(!sc||sc.B.over)return;
  e.preventDefault();e.stopImmediatePropagation();Meta.pause();
},true);

// ---------- Profile screen ----------
Object.assign(Modes,{
  profile(){
    const got=ACH.filter(a=>S.ach[a.id]).length,l=level();
    UI.set(`<div class="profile">
      <div class="bhead"><span class="pix">&gt; whoami</span><span>${esc(rank())} &middot; level ${l} &middot; ${S.xp} XP</span><span class="tiny">best run ${S.bestRun||0} correct in a row</span></div>
      ${Meta.dailyBox()}
      <section><h3 class="pix">Achievements <span class="tiny">${got} / ${ACH.length}</span></h3>
        <div class="badges">${ACH.map(a=>{const on=!!S.ach[a.id];return `<div class="badge ${on?'on':''}" title="${esc(a.desc)}"><span class="bicon">${esc(a.icon)}</span><b>${esc(a.name)}</b><span class="tiny">${esc(a.desc)}</span>${on?`<span class="tiny yes">unlocked ${new Date(S.ach[a.id]).toISOString().slice(0,10)}</span>`:''}</div>`}).join('')}</div></section>
      <section><h3 class="pix">Outfits</h3>
        <div class="outfits">${OUTFITS.map(o=>{const un=outfitUnlocked(o),eq=S.outfit===o.id;
          return `<div class="outfit ${eq?'eq':''} ${un?'':'locked'}"><div class="opreview">${gridSVG(hackerRows(0).map(r=>[...r].map(ch=>outfitPal(o.id)[ch]||null)))}</div><b>${esc(o.name)}</b>
            ${eq?'<span class="chip ok">equipped</span>':un?`<button class="btn sm" onclick="Modes.equip('${o.id}')">Equip</button>`:`<span class="tiny">locked: ${esc(outfitReq(o))}</span>`}</div>`}).join('')}</div></section>
      <section><h3 class="pix">Move your save to another computer</h3>
        <p class="tiny">Export copies all your progress as a text code. On the other computer, open [ me ], paste the code under Import and load it. Audio and accessibility settings stay per computer.</p>
        <div class="xfer"><div><button class="btn" onclick="Modes.doExport()">Export save code</button><textarea id="exportBox" readonly rows="3" aria-label="Your save code" placeholder="Your code appears here"></textarea></div>
        <div><label for="importBox" class="tiny">Import: paste a code</label><textarea id="importBox" rows="3" placeholder="SQ2-..."></textarea><button class="btn ghost" onclick="Meta.importCode(document.getElementById('importBox').value)">Load save code</button></div></div></section>
      <div class="row"><button class="linkbtn" onclick="Meta.tutorial()">Replay the tutorial</button></div>
    </div>`);
  },
  equip(id){S.outfit=id;save();buildHacker(App.game.textures,App.game.anims);App.hud();sfx.granted();Modes.profile()},
  doExport(){
    const box=document.getElementById('exportBox'),code=Meta.exportCode();box.value=code;box.focus();box.select();
    const ok=()=>UI.toast(`Save code copied (${Math.round(code.length/1024)} KB of text).`);
    if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(code).then(ok,()=>UI.toast('Code selected. Press Ctrl+C to copy it.'));
    else UI.toast('Code selected. Press Ctrl+C to copy it.');
  }
});

// ---------- expanded settings panel (replaces the audio-only one in ui.js) ----------
Object.assign(UI,{
  settings(){
    if(UI._modal)UI._modal();
    const pct=v=>Math.round(v*100);
    const m=document.createElement('div');m.className='modal';
    m.innerHTML=`<div class="mbox settings wide" role="dialog" aria-modal="true" aria-labelledby="setTitle">
      <div class="pix set-title" id="setTitle">&gt; nano settings.cfg</div>
      <fieldset><legend class="pix">audio</legend>
        <label for="musicVol">Music volume <output id="musicOut">${pct(Settings.music)}%</output></label>
        <input type="range" id="musicVol" min="0" max="100" step="5" value="${pct(Settings.music)}">
        <label for="sfxVol">Sound effects volume <output id="sfxOut">${pct(Settings.sfx)}%</output></label>
        <input type="range" id="sfxVol" min="0" max="100" step="5" value="${pct(Settings.sfx)}">
        <label class="check" for="muteAll"><input type="checkbox" id="muteAll" ${Settings.muted?'checked':''}> Mute all audio</label></fieldset>
      <fieldset><legend class="pix">gameplay</legend>
        <label class="check" for="optTimer"><input type="checkbox" id="optTimer" ${Settings.timer?'checked':''}> Answer timer in battles (time out = wrong answer)</label>
        <label for="optTimerSecs">Seconds per question
          <select id="optTimerSecs">${[20,30,45,60,90].map(s=>`<option value="${s}" ${Settings.timerSecs===s?'selected':''}>${s}s</option>`).join('')}</select></label></fieldset>
      <fieldset><legend class="pix">accessibility</legend>
        <label class="check" for="optContrast"><input type="checkbox" id="optContrast" ${Settings.contrast?'checked':''}> High contrast (brighter text, no glow, dimmer background effects)</label>
        <label class="check" for="optMotion"><input type="checkbox" id="optMotion" ${Settings.motion?'checked':''}> Reduced motion (no glitch, shake, flashes or falling code)</label>
        <label for="optText">Text size
          <select id="optText">${[[.9,'Small'],[1,'Normal'],[1.15,'Large'],[1.3,'Extra large']].map(([v,n])=>`<option value="${v}" ${Settings.text===v?'selected':''}>${n} (${Math.round(v*100)}%)</option>`).join('')}</select></label></fieldset>
      <fieldset><legend class="pix">other</legend>
        <div class="row"><button class="linkbtn" data-a="handle">Change handle (${hName()})</button><button class="linkbtn" data-a="tut">Replay the tutorial</button><button class="linkbtn" data-a="profile">Profile, achievements and save transfer</button><button class="linkbtn danger-link" data-a="reset">Reset game progress</button></div>
        <p class="tiny">Settings are saved in this browser; resetting progress keeps them. Unofficial study aid, not affiliated with or endorsed by CompTIA. Questions are original and organized by the Security+ SY0-701 domains plus a bonus AI zone. Always check CompTIA's current exam objectives.</p></fieldset>
      <div class="row end"><button class="btn" data-a="done">Save and close</button></div></div>`;
    document.body.appendChild(m);
    const q=s=>m.querySelector(s);
    const upd=()=>{Sound.unlock();Sound.apply();saveSettings();Meta.applyPrefs();App.hud()};
    q('#musicVol').oninput=e=>{Settings.music=e.target.value/100;q('#musicOut').textContent=e.target.value+'%';upd()};
    q('#sfxVol').oninput=e=>{Settings.sfx=e.target.value/100;q('#sfxOut').textContent=e.target.value+'%';upd()};
    q('#sfxVol').onchange=()=>sfx.granted();
    q('#muteAll').onchange=e=>{Settings.muted=e.target.checked;upd()};
    q('#optTimer').onchange=e=>{Settings.timer=e.target.checked;upd()};
    q('#optTimerSecs').onchange=e=>{Settings.timerSecs=+e.target.value;upd()};
    q('#optContrast').onchange=e=>{Settings.contrast=e.target.checked;upd()};
    q('#optMotion').onchange=e=>{Settings.motion=e.target.checked;upd()};
    q('#optText').onchange=e=>{Settings.text=+e.target.value;upd()};
    const close=()=>{m.remove();UI._modal=null};
    m.onclick=e=>{
      const a=e.target.dataset.a;
      if(e.target===m||a==='done')close();
      else if(a==='reset'){close();App.reset()}
      else if(a==='tut'){close();Meta.tutorial()}
      else if(a==='handle'){close();App.go('handle',{change:true})}
      else if(a==='profile'){close();App.go('profile')}
    };
    UI._modal=close;q('#musicVol').focus();
  }
});

// ---------- hacker handle ----------
const HANDLE_RE=/^[A-Za-z0-9_-]{3,16}$/;
const hName=()=>esc(S.handle||'anon');   // escaped, for HTML and canvas messages
const randomHandle=()=>'anon_'+(1000+Math.floor(Math.random()*9000));

Object.assign(Modes,{
  // Terminal screen to set the handle. o.first = first launch (offers Skip), o.change = from settings (offers Cancel).
  handle(o){
    o=o||{};const cur=S.handle||'';
    UI.set(`<div class="handlescr"><div id="hsTerm"></div>
      <form class="hsform" id="hsForm" autocomplete="off" novalidate hidden>
        <label for="hsInput" class="pix hslabel">&gt; enter your hacker handle:<i class="cursor">&#9608;</i></label>
        <div class="hsline"><span class="pix" aria-hidden="true">&gt;</span><input id="hsInput" maxlength="16" spellcheck="false" autocapitalize="off" autocomplete="off" value="${esc(cur)}" aria-describedby="hsHelp hsErr"></div>
        <p class="tiny" id="hsHelp">3-16 characters: letters, numbers, underscores (_) and dashes (-). Press Enter to confirm.</p>
        <p class="hserr" id="hsErr" role="alert"></p>
        <div class="row"><button class="btn" type="submit">[ CONFIRM ]</button>${o.first?`<button class="btn ghost" type="button" id="hsSkip">Skip (use a random handle)</button>`:`<button class="btn ghost" type="button" id="hsCancel">Cancel</button>`}</div>
      </form></div>`);
    const lines=o.first?['> booting security+ quest...','> secure channel established.','> new operator detected.']:['> usermod --handle',`> current handle: ${cur||'(none)'}`];
    FX.type(document.getElementById('hsTerm'),lines,()=>{
      const form=document.getElementById('hsForm');if(!form||App.mode!=='handle')return;
      form.hidden=false;
      const inp=document.getElementById('hsInput'),err=document.getElementById('hsErr');
      inp.focus();inp.select();
      inp.oninput=()=>{
        const clean=inp.value.replace(/[^A-Za-z0-9_-]/g,'').slice(0,16);
        if(clean!==inp.value){inp.value=clean;err.textContent='Only letters, numbers, underscores and dashes are allowed.'}else err.textContent='';
        sfx.key();
      };
      form.onsubmit=e=>{
        e.preventDefault();const v=inp.value.trim();
        if(!HANDLE_RE.test(v)){err.textContent=v.length<3?'Handles need at least 3 characters.':'Use 3-16 letters, numbers, underscores or dashes.';sfx.denied();inp.focus();return}
        Modes.setHandle(v,o);
      };
      const skip=document.getElementById('hsSkip');if(skip)skip.onclick=()=>Modes.setHandle(randomHandle(),o);
      const cancel=document.getElementById('hsCancel');if(cancel)cancel.onclick=()=>App.go(o.back||'world');
    });
  },
  setHandle(v,o){
    S.handle=v;save();sfx.granted();
    if(o.back){App.go(o.back);UI.toast(`Handle updated: ${v}`);return}   // e.g. back to the profile screen
    App.greet=o.first?`> welcome, ${v}`:`> handle updated: ${v}`;
    App.go('world');
    if(o.first&&!S.tut)setTimeout(()=>Meta.tutorial(),1100);
  }
});
// ---------- Profile screen v2: the one screen that scrolls; skins as a card grid ----------
Object.assign(Modes,{
  profile(){
    const P=UI.panel,keep=App.mode==='profile'?P.scrollTop:0;
    const got=ACH.filter(a=>S.ach[a.id]).length,l=level();
    const skinCard=o=>{
      const un=outfitUnlocked(o),eq=S.outfit===o.id,need=o.req.lvl?lvlXp(o.req.lvl):null;
      const pal=outfitPal(o.id),frame=f=>gridSVG(hackerRows(f).map(r=>[...r].map(ch=>pal[ch]||null)));
      const req=o.req.ach?`Unlock: earn the "${(ACH.find(a=>a.id===o.req.ach)||{}).name}" achievement`:need===0?'Starter skin, always unlocked':`Unlocks at ${need} XP (level ${o.req.lvl})`;
      const prog=!un&&need?`<div class="bar"><i style="width:${Math.min(100,100*S.xp/need)}%"></i></div><span class="tiny">${S.xp} / ${need} XP &middot; ${need-S.xp} to go</span>`:'';
      return `<div class="skin ${eq?'eq':''} ${un?'':'locked'}">
        <div class="spreview" aria-hidden="true"><span class="f0">${frame(0)}</span><span class="f1">${frame(1)}</span></div>
        <b>${esc(o.name)}</b>
        <span class="chip ${un?'ok':''}">${eq?'equipped':un?'unlocked':'locked'}</span>
        <span class="tiny sreq">${esc(req)}</span>${prog}
        ${eq?'<span class="eqtag pix">[ EQUIPPED ]</span>':un?`<button class="btn sm" onclick="Modes.equip('${o.id}')" aria-label="Equip ${esc(o.name)}">[ EQUIP ]</button>`:`<button class="btn sm" disabled>[ LOCKED ]</button>`}
      </div>`;
    };
    UI.set(`<div class="profile">
      <div class="bhead"><span class="pix">&gt; whoami: ${hName()}</span><button class="btn ghost sm" onclick="App.go('handle',{change:true,back:'profile'})">[ CHANGE HANDLE ]</button><span>${esc(rank())} &middot; level ${l} &middot; ${S.xp} XP</span><span class="tiny">best run ${S.bestRun||0} correct in a row</span></div>
      ${Meta.dailyBox()}
      <nav class="pjump" aria-label="Profile sections"><span class="tiny">jump to:</span>
        <button class="linkbtn" data-j="sec-skins">Skins</button><button class="linkbtn" data-j="sec-themes">Themes</button><button class="linkbtn" data-j="sec-ach">Achievements</button><button class="linkbtn" data-j="sec-save">Save transfer</button>
        <span class="tiny right">scroll with the mouse wheel, arrow keys or Page Up / Page Down</span></nav>
      <section id="sec-skins"><h3 class="pix">Skins <span class="tiny">${OUTFITS.filter(outfitUnlocked).length} / ${OUTFITS.length} unlocked &middot; you have ${S.xp} XP</span></h3>
        <div class="skins">${OUTFITS.map(skinCard).join('')}</div></section>
      ${Modes.themesSection()}<section id="sec-ach"><h3 class="pix">Achievements <span class="tiny">${got} / ${ACH.length}</span></h3>
        <div class="badges">${ACH.map(a=>{const on=!!S.ach[a.id];return `<div class="badge ${on?'on':''}"><span class="bicon">${esc(a.icon)}</span><b>${esc(a.name)}</b><span class="tiny">${esc(a.desc)}</span>${on?`<span class="tiny yes">unlocked ${new Date(S.ach[a.id]).toISOString().slice(0,10)}</span>`:''}</div>`}).join('')}</div></section>
      <section id="sec-save"><h3 class="pix">Move your save to another computer</h3>
        <p class="tiny">Export copies all your progress, including your handle, as a text code. On the other computer, open [ me ], paste the code under Import and load it. Audio and accessibility settings stay per computer.</p>
        <div class="xfer"><div><button class="btn" onclick="Modes.doExport()">Export save code</button><textarea id="exportBox" readonly rows="3" aria-label="Your save code" placeholder="Your code appears here"></textarea></div>
        <div><label for="importBox" class="tiny">Import: paste a code</label><textarea id="importBox" rows="3" placeholder="SQ2-..."></textarea><button class="btn ghost" onclick="Meta.importCode(document.getElementById('importBox').value)">Load save code</button></div></div></section>
      <div class="row"><button class="linkbtn" onclick="Meta.tutorial()">Replay the tutorial</button><button class="linkbtn" onclick="App.go('handle',{change:true,back:'profile'})">Change handle</button></div>
    </div>
    <button class="morehint" id="moreHint" tabindex="-1" aria-hidden="true">&#9660; more below</button>`);
    P.querySelectorAll('[data-j]').forEach(b=>b.onclick=()=>document.getElementById(b.dataset.j).scrollIntoView({behavior:FX.calm()?'auto':'smooth',block:'start'}));
    P.querySelector('#moreHint').onclick=()=>P.scrollBy({top:P.clientHeight*.8,behavior:FX.calm()?'auto':'smooth'});
    P.scrollTop=keep;P.tabIndex=-1;P.focus({preventScroll:true});
    Modes.bindScrollHint();
    UI.keyHandler=Modes.profileKeys;
  },
  // Show "more below" while the panel can still scroll down.
  bindScrollHint(){
    const P=UI.panel,h=document.getElementById('moreHint');
    const upd=()=>{if(!h.isConnected){P.onscroll=null;window.removeEventListener('resize',upd);return}h.classList.toggle('show',P.scrollHeight-P.scrollTop-P.clientHeight>12)};
    P.onscroll=upd;window.addEventListener('resize',upd);requestAnimationFrame(upd);
  },
  // Keyboard scrolling for the profile screen (text boxes keep their own keys).
  profileKeys(e){
    const P=UI.panel,page=P.clientHeight*.85,step={ArrowDown:70,ArrowUp:-70,PageDown:page,PageUp:-page}[e.key];
    const smooth=FX.calm()?'auto':'smooth';
    if(step!==undefined){e.preventDefault();P.scrollBy({top:step,behavior:smooth})}
    else if(e.key==='Home'){e.preventDefault();P.scrollTo({top:0,behavior:smooth})}
    else if(e.key==='End'){e.preventDefault();P.scrollTo({top:P.scrollHeight,behavior:smooth})}
  }
});

// ---------- Themes section (profile) ----------
Object.assign(Modes,{
  themesSection(){
    const cards=THEMES.map(t=>{
      const un=themeUnlocked(t),on=S.theme===t.id||(!S.theme&&t.id==='classic'),need=lvlXp(t.req.lvl),pv=Sound.previewing===t.id;
      return `<div class="theme ${on?'eq':''} ${un?'':'locked'}">
        <div class="tprev" aria-hidden="true" style="background:${t.sw[0]};border-color:${t.sw[2]}">
          <span style="color:${t.sw[1]}">&gt; root@${t.id}:~$ <b style="color:${t.sw[2]}">scan</b></span><span style="color:${t.sw[3]}">ACCESS GRANTED</span>
          <span class="tsw">${t.sw.map(c=>`<i style="background:${c}"></i>`).join('')}</span></div>
        <b>${esc(t.name)}</b><span class="tiny tdesc">${esc(t.desc)}</span>
        <span class="chip ${un?'ok':''}">${on?'active':un?'unlocked':'locked'}</span>
        ${un?'':`<span class="tiny">Unlocks at ${need} XP (level ${t.req.lvl}) &middot; ${Math.max(0,need-S.xp)} to go</span><div class="bar"><i style="width:${Math.min(100,100*S.xp/need)}%"></i></div>`}
        <div class="trow"><button class="btn ghost sm" onclick="Modes.previewMusic('${t.id}')" aria-pressed="${pv}">${pv?'&#9632; stop preview':'&#9654; preview music'}</button>
        ${on?'<span class="eqtag pix">[ ACTIVE ]</span>':un?`<button class="btn sm" onclick="Modes.setTheme('${t.id}')">[ APPLY ]</button>`:'<button class="btn sm" disabled>[ LOCKED ]</button>'}</div>
      </div>`;
    }).join('');
    return `<section id="sec-themes"><h3 class="pix">Themes <span class="tiny">each preset changes the colors and the map, battle and boss music together</span></h3><div class="themes">${cards}</div></section>`;
  },
  setTheme(id){
    Modes.stopPreview(true);S.theme=id;save();applyTheme();sfx.granted();
    UI.toast(`Theme applied: ${themeById(id).name}`);Modes.profile();
  },
  // Preview: about 10 seconds of the theme's map track, then 10 of its battle track, then back to your theme.
  previewMusic(id){
    const same=Sound.previewing===id;Modes.stopPreview(true);
    if(!same){
      Sound.previewing=id;Sound.unlock();Sound.trackId=null;Sound.play('map');
      Modes._pv1=setTimeout(()=>{if(Sound.previewing===id){Sound.trackId=null;Sound.play('battle')}},10000);
      Modes._pv2=setTimeout(()=>{if(Sound.previewing===id){Modes.stopPreview();if(App.mode==='profile')Modes.profile()}},20000);
      if(Settings.muted||Settings.music===0)UI.toast('Music is muted or at 0%. Turn it up in [ cfg ] to hear the preview.');
    }else Sound.play('map');
    Modes.profile();
  },
  stopPreview(quiet){
    clearTimeout(Modes._pv1);clearTimeout(Modes._pv2);
    if(Sound.previewing){Sound.previewing=null;Sound.trackId=null;if(!quiet||Sound.want)Sound.play(Sound.want||'map')}
  }
});