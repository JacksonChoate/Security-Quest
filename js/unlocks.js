// Security+ Quest: unlock pop-ups.
// Announces achievements, skins, theme presets, campaign chapters and level-up ranks in a terminal-style
// pop-up that glitches in. Several unlocks are shown one after another. Nothing interrupts a question:
// pop-ups wait until the battle / round / exam / game ends or you are back on the map. The game is paused
// while one is open. Each unlock is shown once (remembered in the save as S.unl).

// Short "decrypted" sound: a rising arpeggio with a soft noise sweep. Uses the sound-effects volume.
sfx.unlock=function(){
  [659,880,1175,1568].forEach((f,i)=>V('square',f,i*.07,.09,.05,{send:true}));
  N(0,.35,.06,4000);
  [1175,1568,2093].forEach(f=>V('triangle',f,.3,.6,.035,{a:.02}));
};

const Unlocks={
  queue:[],open:null,

  // Everything that is currently unlocked, as pop-up items. Order: level-ups, then the skins/themes they
  // unlock, then achievements, then campaign chapters.
  all(){
    const items=[],L=level();
    for(let l=2;l<=L;l++)items.push({key:'lvl:'+l,type:'level',head:'> RANK UPGRADED',name:RANKS[Math.min(RANKS.length-1,l-1)],
      desc:`Reached level ${l} (${lvlXp(l)} XP).`,preview:()=>`<div class="uprev hero">${gridSVG(heroGrid())}</div><span class="ubig">LV ${l}</span>`});
    OUTFITS.forEach(o=>{if(outfitUnlocked(o))items.push({key:'skin:'+o.id,type:'skin',head:'> NEW SKIN DECRYPTED',name:o.name,id:o.id,
      desc:o.req.ach?`Earned with the "${(ACH.find(a=>a.id===o.req.ach)||{}).name}" achievement.`:`Unlocked at level ${o.req.lvl} (${lvlXp(o.req.lvl)} XP).`,
      preview:()=>{const pal=outfitPal(o.id);return `<div class="uprev hero">${gridSVG(hackerRows(0).map(r=>[...r].map(ch=>pal[ch]||null)))}</div>`}})});
    THEMES.forEach(t=>{if(themeUnlocked(t))items.push({key:'theme:'+t.id,type:'theme',head:'> THEME PRESET DECRYPTED',name:t.name,id:t.id,
      desc:`Unlocked at level ${t.req.lvl} (${lvlXp(t.req.lvl)} XP). ${t.desc}`,
      preview:()=>`<div class="tprev" style="background:${t.sw[0]};border-color:${t.sw[2]}"><span style="color:${t.sw[1]}">&gt; root@${t.id}:~$ <b style="color:${t.sw[2]}">scan</b></span><span style="color:${t.sw[3]}">ACCESS GRANTED</span><span class="tsw">${t.sw.map(c=>`<i style="background:${c}"></i>`).join('')}</span></div>`})});
    ACH.forEach(a=>{if(S.ach[a.id])items.push({key:'ach:'+a.id,type:'ach',head:'> ACHIEVEMENT UNLOCKED',name:a.name,
      desc:a.desc,preview:()=>`<span class="ubadge">${esc(a.icon)}</span>`})});
    for(let i=1;i<STORY.length;i++)if(S.story.ch>=i)items.push({key:'ch:'+i,type:'chapter',head:'> NEW CHAPTER UNLOCKED',name:`Chapter ${i===STORY.length-1?'EP':i+1}: ${STORY[i].title}`,
      desc:`You finished "${STORY[i-1].title}". Continue the Story Campaign from the map.`,preview:()=>`<div class="uprev logo">${gridSVG(CHOIR_LOGO)}</div>`});
    return items;
  },

  // First run of this feature (or a fresh / imported save): mark everything already unlocked as seen,
  // so existing players are not flooded with pop-ups for old unlocks.
  baseline(){
    S.unl={};Unlocks.all().forEach(it=>S.unl[it.key]=1);
    try{localStorage.setItem(SAVE_KEY,JSON.stringify(S))}catch(e){}
  },

  // Called after every save. Queues anything newly unlocked that has not been shown yet.
  scan(){
    if(!S)return;
    if(!S.unl)return Unlocks.baseline();
    const queued=new Set(Unlocks.queue.map(q=>q.key).concat(Unlocks.open?[Unlocks.open.key]:[]));
    Unlocks.all().forEach(it=>{if(!S.unl[it.key]&&!queued.has(it.key))Unlocks.queue.push(it)});
    Unlocks.pump();
  },

  // True while the player is in the middle of something a pop-up must not interrupt.
  busy(){
    if(!App.game||!App.mode||UI._modal)return true;
    const m=App.mode;
    if(m==='handle')return true;
    if(m==='battle'){const b=App.game.scene.getScene('Battle');return !(b&&b.B&&b.B.over)}
    if(m==='packet'){const p=App.game.scene.getScene('Packet');return !!(p&&p.st&&p.st.started&&!p.st.over)}
    if(m==='blitz')return !!(Modes.BL&&!Modes.BL.done);
    if(m==='exam')return !!(Modes.EX&&Modes.EX.end&&!Modes.EX.result);
    if(m==='lab')return !!(Modes.LAB&&Modes.LAB.i<Modes.LAB.set.length);
    if(m==='flash')return !!(Modes.FC&&Modes.FC.i<Modes.FC.cards.length);
    return false;
  },

  // Show the next queued pop-up if it is a good moment.
  pump(){
    if(Unlocks.open||!Unlocks.queue.length||Unlocks.busy())return;
    Unlocks.show(Unlocks.queue.shift());
  },

  show(it){
    Unlocks.open=it;
    S.unl[it.key]=Date.now();try{localStorage.setItem(SAVE_KEY,JSON.stringify(S))}catch(e){}   // shown once, even after a reload
    // pause whatever game scene is on screen
    const key=PHASER_MODES[App.mode],sc=key&&App.game.scene.getScene(key);
    Unlocks.paused=sc&&sc.sys.isActive()?key:null;
    if(Unlocks.paused)App.game.scene.pause(key);
    UI.paused=true;Sound.alarm(false);
    const left=Unlocks.queue.length,equip=(it.type==='skin'||it.type==='theme');
    const m=document.createElement('div');m.className='modal unlockmodal';
    m.innerHTML=`<div class="mbox unlockbox ${FX.calm()?'':'glitchin'} u-${it.type}" role="dialog" aria-modal="true" aria-labelledby="unlHead" aria-describedby="unlDesc">
      <div class="pix uhead" id="unlHead">&nbsp;</div>
      <div class="ubody">${it.preview()}<div><b class="uname">${esc(it.name)}</b><p id="unlDesc">${esc(it.desc)}</p></div></div>
      <div class="row between"><span class="tiny">${left?`${left} more unlock${left>1?'s':''} waiting`:'Enter or Esc to close'}</span>
        <span>${equip?`<button class="btn" data-u="equip">[ EQUIP NOW ]</button> `:''}<button class="btn ${equip?'ghost':''}" data-u="close">[ CLOSE ]</button></span></div></div>`;
    document.body.appendChild(m);
    FX.typeInline(m.querySelector('#unlHead'),it.head,24);
    sfx.unlock();
    const close=()=>Unlocks.close();
    m.onclick=e=>{const a=e.target.dataset.u;if(a==='close'||e.target===m)close();if(a==='equip')Unlocks.equip(it)};
    // Enter / Esc close it (Enter on the focused EQUIP button equips instead). Capture phase, so the
    // battle pause menu and other key handlers do not also react.
    Unlocks._keys=e=>{
      if(e.key!=='Enter'&&e.key!=='Escape')return;
      e.preventDefault();e.stopImmediatePropagation();
      if(e.key==='Enter'&&document.activeElement&&document.activeElement.dataset.u==='equip')Unlocks.equip(it);else close();
    };
    document.addEventListener('keydown',Unlocks._keys,true);
    UI._modal=close;
    m.querySelector('[data-u=close]').focus();
  },

  close(){
    if(!Unlocks.open)return;
    const m=document.querySelector('.unlockmodal');if(m)m.remove();
    document.removeEventListener('keydown',Unlocks._keys,true);
    Unlocks.open=null;if(UI._modal)UI._modal=null;UI.paused=false;
    // resume the scene we paused, but only if we are still on that screen (App.go may be leaving it)
    const key=Unlocks.paused;Unlocks.paused=null;
    if(key&&PHASER_MODES[App.mode]===key){
      const sc=App.game.scene.getScene(key);
      if(sc&&sc.sys.isPaused()){
        if(sc.input&&sc.input.keyboard)sc.input.keyboard.resetKeys();   // the Enter that closed this must not reach the map
        App.game.scene.resume(key);
        if(key==='Battle'&&sc.checkAlarm)sc.checkAlarm();
      }
    }
    setTimeout(()=>Unlocks.pump(),350);   // next pop-up, if any
  },

  equip(it){
    if(it.type==='theme'){S.theme=it.id;save();applyTheme();UI.toast(`Theme applied: ${it.name}`)}
    if(it.type==='skin'){
      S.outfit=it.id;save();App.hud();UI.toast(`Skin equipped: ${it.name}`);
      // The sprite sheet is rebuilt the next time a game scene starts. On the map, restart it now.
      App.needHacker=true;
      if(App.mode==='world'){
        const w=App.game.scene.getScene('World');if(w&&w.player)App.worldPos={x:w.player.x,y:w.player.y};
        Unlocks.close();App._lastSig=null;App.go('world');return;
      }
    }
    sfx.granted();Unlocks.close();
  }
};

// Fallback: try to show waiting pop-ups now and then (for example after a dialog closes or a round ends).
setInterval(()=>{if(Unlocks.queue.length)Unlocks.pump()},1500);
