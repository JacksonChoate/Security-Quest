// Security+ Quest: Phaser game setup, screen routing and the top bar.

const PHASER_MODES={world:'World',battle:'Battle',packet:'Packet'};

const App={
  mode:null,timers:[],worldPos:null,game:null,

  every(ms,fn){this.timers.push(setInterval(fn,ms))},
  clearTimers(){this.timers.forEach(clearInterval);this.timers=[]},

  go(mode,arg){
    // Ignore an identical screen change repeated within 300 ms (double clicks would restart a battle mid-start).
    const sig=mode+'|'+(typeof arg==='object'?JSON.stringify(arg):arg),now=Date.now();
    if(sig===this._lastSig&&now-this._lastAt<300)return;this._lastSig=sig;this._lastAt=now;
    if(mode==='weak'){   // Weak Spots: a 20-question battle from your lowest-scoring objectives
      const ids=weakSpotIds(20);
      if(!ids.length)return UI.toast('No questions are tagged with objectives yet.');
      const w=weakestObjectives(3).map(s=>s.o).join(', ');
      return this.go('battle',{kind:'weak',ids,label:'Weak Spots',sub:w?`Focus: ${w}`:'Mixed objectives'});
    }
    if(typeof Modes!=='undefined'&&Modes.stopPreview)Modes.stopPreview(true);   // leaving a screen ends any theme music preview
    // Set the new mode BEFORE closing dialogs, so the pause menu's close knows we are leaving and does not resume the battle.
    this.mode=mode;UI.paused=false;
    this.clearTimers();UI.keyHandler=null;if(UI._modal)UI._modal();
    Sound.alarm(false);document.body.classList.remove('bover');
    if(mode!=='world'&&mode!=='battle')Sound.play(mode==='packet'||mode==='blitz'?'battle':'map');
    const wrap=document.getElementById('gameWrap'),key=PHASER_MODES[mode];
    // Stop every other game scene right away, including PAUSED or resuming ones. (Only stopping running scenes left a
    // paused battle alive; it then drew its black background over the map.)
    Object.values(PHASER_MODES).forEach(k=>{
      if(k===key)return;const s=this.game.scene.getScene(k);if(!s)return;
      const y=s.sys;if(y.isActive()||y.isPaused()||y.isSleeping()||y.settings.status<Phaser.Scenes.RUNNING&&y.settings.status>Phaser.Scenes.PENDING)this.game.scene.stop(k);
    });
    document.body.dataset.mode=mode;   // CSS sizes the canvas and panel per mode
    if(key){
      wrap.hidden=false;
      const h=mode==='battle'?BH:540;   // battles use a compact 960x320 arena
      if(this.game.scale.height!==h)this.game.scale.setGameSize(960,h);
      this.refit();requestAnimationFrame(()=>this.refit());
      // Start the scene a moment later so any "stop" queued by the previous screen runs first.
      // (Without this, switching screens quickly could shut the new battle down right after it started.)
      const token=this._goToken=(this._goToken||0)+1,data=mode==='battle'?{d:arg}:{};
      setTimeout(()=>{
        if(this._goToken!==token||this.mode!==mode)return;
        // A newly equipped skin: rebuild the hacker sprite sheet while no scene is using it.
        if(this.needHacker){this.needHacker=false;this.game.scene.stop(key);buildHacker(this.game.textures,this.game.anims)}
        this.game.scene.start(key,data);this.game.scene.bringToTop(key);   // the current screen always draws on top
      },40);
    }else{
      wrap.hidden=true;
      if(mode==='blitz')Modes.blitz(arg);else Modes[mode](arg);
    }
    if(typeof Unlocks!=='undefined')setTimeout(()=>Unlocks.pump(),700);   // show waiting unlock pop-ups on the new screen
    document.body.dataset.mode=mode;
    this.hud();window.scrollTo(0,0);
  },

  // Ask before leaving something in progress.
  leave(){
    const busy=(this.mode==='battle'&&!this.scene('Battle')?.B?.over)||(this.mode==='packet'&&this.scene('Packet')?.st?.started&&!this.scene('Packet').st.over)||(this.mode==='exam'&&Modes.EX&&Modes.EX.end&&!Modes.EX.result)||(this.mode==='lab'&&Modes.LAB&&Modes.LAB.i<Modes.LAB.set.length);
    const story=this.mode==='battle'&&this.scene('Battle')?.B?.d?.kind==='story';
    const msg=this.mode==='exam'?'Quit the exam? Your answers will be lost.':story?'Leave this chapter? Your answers and chapter progress are saved. Resume it from the Story Campaign.':'Leave now? This run will end. Answers you gave are already saved.';
    if(busy)UI.confirm(msg,'Leave',()=>this.go('world'),this.mode==='exam');
    else this.go('world');
  },
  scene(k){const s=this.game&&this.game.scene.getScene(k);return s&&s.sys.isActive()?s:null},
  // Fit the canvas to its frame. Phaser's refresh() reuses its stored frame size, so re-measure first.
  // (Skipped until Phaser has booted and created its canvas; the frame watcher can fire before that.)
  refit(){const g=this.game,s=g&&g.scale;if(!s||!g.isBooted||!g.canvas)return;s.getParentBounds();s.refresh()},

  hud(){
    const l=level(),cur=lvlXp(l),nxt=lvlXp(l+1),pct=Math.round(100*(S.xp-cur)/(nxt-cur));
    document.getElementById('hud').innerHTML=`
      ${this.mode&&this.mode!=='world'&&!(this.mode==='handle'&&!S.handle)?`<button class="btn ghost sm" onclick="App.leave()">&lt; cd ~/map</button>`:`<div><div class="logo pix">SECURITY+<span>QUEST</span><i class="cursor">&#9608;</i></div><div class="sub">root@secplus:~$ study --exam comptia-security+</div></div>`}
      <div class="player"><div class="hero">${gridSVG(heroGrid())}</div>
        <div><div class="pix rank"><span class="handle">${hName()}</span> &middot; ${esc(rank().toLowerCase().replace(/ /g,'_'))}</div><div class="xpbar"><i style="width:${pct}%"></i></div><div class="tiny">lvl ${l} &middot; ${S.xp} xp &middot; ${S.daily.streak||0}d streak</div></div>
        <button class="btn ghost sm icon" onclick="toggleMute()" aria-pressed="${Settings.muted}" aria-label="${Settings.muted?'Unmute audio':'Mute audio'}">${Settings.muted?'[ muted ]':'[ sound ]'}</button>
        <button class="btn ghost sm icon" onclick="UI.settings()" aria-label="Settings">[ cfg ]</button><button class="btn ghost sm icon" onclick="App.go('profile')" aria-label="Profile, achievements and outfits">[ me ]</button><button class="btn ghost sm icon" onclick="App.go('plan')" aria-label="Mission Plan: exam date and study targets">[ plan ]</button></div>${this.mode==='battle'?'<button class="btn ghost sm" onclick="Meta.pause()">[ esc ] pause</button>':''}`;
  },

  reset(){UI.confirm('Reset all XP, mastery and scores?','Reset',()=>{resetSave();this.worldPos=null;this.go('world')},true)},

  ready(){
    Meta.applyPrefs();Meta.login();
    if(!S.handle)return this.go('handle',{first:true});   // first launch: ask for a hacker handle before the map
    this.greet=`> welcome back, ${S.handle}`;
    this.go('world');if(!S.tut)setTimeout(()=>Meta.tutorial(),700);
  }
};

// Safety net: an error thrown inside any Phaser callback (a tween, timer or scene update) used to stop the
// game loop for good: the map froze and the canvas never resized again. Catch it, log it, and keep running.
function guardGameLoop(){
  const TS=Phaser.Core.TimeStep.prototype;if(TS.__guarded)return;TS.__guarded=true;
  const step=TS.step;let n=0;
  TS.step=function(time){
    try{return step.call(this,time)}
    catch(e){n++;if(n<=5||n%600===0)console.error('Game loop error (recovered, game keeps running):',e)}
  };
}

function bootGame(){
  Meta.applyPrefs();applyTheme();App.hud();guardGameLoop();
  App.game=new Phaser.Game({
    type:Phaser.AUTO,parent:'game',width:960,height:540,backgroundColor:'#000000',pixelArt:true,
    physics:{default:'arcade',arcade:{debug:false}},
    // expandParent:false keeps Phaser from rewriting #game's size; the page CSS owns the frame size.
    scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_HORIZONTALLY,expandParent:false},
    input:{keyboard:{capture:[]}},
    // Test pages only (qa/): headless test browsers barely run animation frames, so drive the loop with timers.
    ...(window.QA_TIMER_LOOP||/[?&]qa-timer-loop=1/.test(location.search)?{fps:{forceSetTimeOut:true,target:6}}:{}),
    scene:[BootScene,WorldScene,BattleScene,PacketScene]
  });
  // Re-fit the canvas whenever its frame changes size for ANY reason: window resize, returning from a
  // full-panel mode (the frame was hidden), the battle arena shrinking or growing, fonts or the top bar settling.
  // Phaser alone only re-measures on window resize, so the canvas could be left shrunk inside a bigger frame.
  if(window.ResizeObserver){
    let last='';
    new ResizeObserver(entries=>{
      const r=entries[0].contentRect,k=Math.round(r.width)+'x'+Math.round(r.height);
      if(k===last||!r.width||!r.height)return;last=k;
      App.refit();
    }).observe(document.getElementById('game'));
  }
}

// Wait for the pixel font so canvas text renders in it, but never hang on a slow network.
(function(){
  if(typeof Phaser==='undefined'){
    document.getElementById('panel').innerHTML='<div class="fb no"><b>The game engine could not load.</b><p>Security+ Quest loads Phaser from cdnjs.cloudflare.com. Check your internet connection and reload the page.</p></div>';
    return;
  }
  const fonts=document.fonts?Promise.all([document.fonts.load('16px "Share Tech Mono"'),document.fonts.load('16px "IBM Plex Sans"')]):Promise.resolve();
  Promise.race([fonts,new Promise(r=>setTimeout(r,2500))]).catch(()=>{}).then(bootGame);
})();
