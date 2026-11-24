// Security+ Quest: Battle scene. Answer questions to attack; bosses fire a PBQ special at half health.
// The battle canvas is a compact 960x320 strip so the question panel below always fits on screen.

const BW=960,BH=320,GROUND=292,HERO_X=210,FOE_X=740;

class BattleScene extends Phaser.Scene{
  constructor(){super('Battle')}
  init(data){
    const d=data.d;let pool,enemies,Z;
    if(d==='missed'){
      pool=srsOrderIds(missedIds());const hp=Math.max(1,Math.min(pool.length,12));
      enemies=[{name:'Echo of Mistakes',hp,max:hp,boss:true,color:'#ff2e63'}];
      Z={zone:'Rematch Arena',name:'Questions you missed',color:'#ff2e63'};
    }else if(d&&d.kind==='story'){   // Story Campaign chapter: the zone's 3 minions, then the chapter boss
      const C=STORY[d.ch];pool=srsOrderIds(d.ids);
      enemies=C.foes.map(n=>({name:n,hp:2,max:2,boss:false,color:C.color})).concat([{name:C.boss,hp:4,max:4,boss:true,color:C.color}]);
      Z={zone:C.title,name:d.sub||'',color:C.color};
    }else if(typeof d==='object'){   // custom battle: Weak Spots or a single-objective drill
      pool=d.ids.slice();
      const per=Math.max(2,Math.ceil(pool.length/5));
      enemies=shuffle(Object.keys(MINION_ART)).slice(0,3).map(n=>({name:n,hp:per,max:per,boss:false,color:MINION_ART[n].acc}))
        .concat([{name:'Echo of Mistakes',hp:per+1,max:per+1,boss:true,color:'#ff2e63'}]);
      Z={zone:d.label,name:d.sub||'',color:'#00e5ff'};
    }else{
      const D=dom(d);Z=D;const ids=Q.filter(q=>q.d===d).map(q=>q.id);
      pool=srsOrderIds(ids);   // spaced repetition: due and missed first, well-known last
      enemies=D.enemies.map(n=>({name:n,hp:3,max:3,boss:false,color:D.color})).concat([{name:D.boss,hp:6,max:6,boss:true,color:D.color}]);
    }
    this.B={d,Z,pool,queue:pool.slice(),enemies,ei:0,php:100,pmax:100,streak:0,best:0,hints:1,right:0,wrong:0,pbqDone:false,over:false};
    // Story resume: restore the saved partial run (defeated foes, score, decision, incident task, boss damage).
    const R=d&&d.kind==='story'&&d.resume&&Story.prog(d.ch);
    if(R){
      const B=this.B,last=enemies.length-1;
      B.ei=Math.min(R.ei,last);enemies.forEach((e,i)=>{if(i<B.ei)e.hp=0});
      if(typeof R.bossHp==='number')enemies[last].hp=Math.max(1,Math.min(enemies[last].max,R.bossHp));
      Object.assign(B,{right:R.right||0,wrong:R.wrong||0,best:R.best||0,decided:!!R.decided,choice:!!R.choice,incident:!!R.incident,task:R.task||undefined,objRes:R.objRes||{}});
    }
  }
  create(){
    const B=this.B,c=hexNum(B.Z.color);
    this.cameras.main.setBackgroundColor(curTheme().bg);
    FX.rain(this,{alpha:.22,every:70});
    const bg=this.add.graphics();
    bg.fillGradientStyle(0x000000,0x000000,0x03140c,0x03140c,.72);bg.fillRect(0,0,BW,BH);
    bg.fillStyle(c,.12);bg.fillRect(0,GROUND-40,BW,BH-GROUND+40);
    bg.lineStyle(1,c,.28);for(let x=-400;x<BW+400;x+=60)bg.lineBetween(BW/2,GROUND-40,x,BH);
    for(let y=GROUND-34;y<BH;y+=(y-(GROUND-46))*.45)bg.lineBetween(0,y,BW,y);
    this.add.particles(0,0,'px',{x:{min:0,max:BW},y:{min:20,max:GROUND-40},lifespan:4000,speedY:{min:-8,max:-20},alpha:{start:0,end:.5,ease:'Sine.inOut'},scale:{min:.2,max:.5},tint:c,frequency:140});

    // header strip: zone, HP bars, foe counter
    this.add.text(16,8,'> '+FX.slug(B.Z.zone)+'.zone',{fontFamily:FONT_T,fontSize:'15px',color:B.Z.color});
    this.foeCount=this.add.text(BW-16,8,'',{fontFamily:FONT_T,fontSize:'14px',color:'#3fae7d'}).setOrigin(1,0);
    this.bars=this.add.graphics();
    this.heroHp=this.add.text(336,34,'',{fontFamily:FONT_T,fontSize:'14px',color:'#3fae7d'}).setOrigin(1,0);
    this.add.text(36,34,(S.handle||'anon').toUpperCase(),{fontFamily:FONT_T,fontSize:'14px',color:'#00e5ff'});
    this.foeName=this.add.text(BW-36,34,'',{fontFamily:FONT_T,fontSize:'14px',color:'#b8ffe0'}).setOrigin(1,0);
    this.foeHp=this.add.text(624,34,'',{fontFamily:FONT_T,fontSize:'14px',color:'#3fae7d'});
    this.streakTxt=this.add.text(BW/2,96,'',{fontFamily:FONT_T,fontSize:'22px',color:'#ffd23f',stroke:'#000',strokeThickness:4}).setOrigin(.5);
    this.tweens.add({targets:this.streakTxt,scale:1.12,duration:400,yoyo:true,repeat:-1});

    // the hacker
    this.add.ellipse(HERO_X,GROUND+2,84,12,0x00ff9c,.15);
    this.hero=this.add.sprite(HERO_X,GROUND,'hacker').setScale(1.25).setOrigin(.5,1).play('hk_idle');
    FX.glow(this.hero,'#00e5ff',2);
    this.foeShadow=this.add.ellipse(FOE_X,GROUND+2,120,16,0x000000,.5);

    this.burst=this.add.particles(0,0,'px',{speed:{min:120,max:360},angle:{min:0,max:360},lifespan:{min:300,max:700},scale:{start:1.3,end:0},gravityY:300,emitting:false}).setDepth(30);
    this.vignette=this.add.rectangle(BW/2,BH/2,BW-8,BH-8).setStrokeStyle(8,0xff2e63,.85).setFillStyle(0xff2e63,.05).setDepth(55).setVisible(false);
    this.tweens.add({targets:this.vignette,alpha:.25,duration:500,yoyo:true,repeat:-1});
    this.events.once('shutdown',()=>Sound.alarm(false));

    this.spawnEnemy(true);
    const n=B.enemies.length;
    FX.type(UI.set(''),[`> initializing zone: ${FX.slug(B.Z.zone)}...`,`> loading threat signatures... ${n} hostile${n>1?'s':''} detected`,`> operator ${S.handle||'anon'} connected. exploit kit armed.`],()=>{
      if(this.B.over||!this.sys.isActive())return;
      if(this.B.d&&this.B.d.kind==='story'&&this.B.d.resume)return Story.resumeCheck(this,this.B,()=>{if(this.sys.isActive())this.ask()});
      this.ask();
    });
  }

  // ---------- drawing ----------
  drawBars(){
    // Clamp: a late attack animation can redraw after the last foe is gone (B.ei past the end).
    const B=this.B,en=B.enemies[Math.min(B.ei,B.enemies.length-1)],g=this.bars;g.clear();
    const bar=(x,w,pct,col)=>{g.fillStyle(0x001a0e,1);g.fillRect(x,54,w,12);g.lineStyle(1,0x0c5c3a,1);g.strokeRect(x,54,w,12);g.fillStyle(col,1);g.fillRect(x+2,56,(w-4)*Math.max(0,pct),8)};
    bar(36,300,B.php/B.pmax,B.php<=30?0xff2e63:0x00ff9c);
    bar(BW-336,300,en.hp/en.max,0xff2e63);
    this.heroHp.setText(`${B.php}/${B.pmax}`);
    this.foeName.setText(en.name.toUpperCase()+(en.boss?'  [BOSS]':''));
    this.foeHp.setText(`${en.hp}/${en.max}`);
    this.foeCount.setText(`foe ${B.ei+1}/${B.enemies.length}`);
    this.streakTxt.setText(B.streak>=2?`STREAK x${B.streak}`:'');
  }
  spawnEnemy(first){
    // If the player moved on before the last attack's death animation, clear the old foe sprite first.
    if(this.foe){const old=this.foe;this.foe=null;if(this.foeIdle)this.foeIdle.stop();this.tweens.add({targets:old,alpha:0,scale:0,duration:200,onComplete:()=>old.destroy()})}
    const en=this.B.enemies[this.B.ei];
    const x0=first?FOE_X:BW+140;
    Sound.play(en.boss?'boss':'battle');
    const isBoss=hasBossArt(en.name),isMin=!isBoss&&hasMinionArt(en.name);
    this.foeIsBoss=isBoss;
    this.foeAnim=isBoss?bossKey(en.name):isMin?minionKey(en.name):null;   // animated sprite key, if any
    this.foeAcc=isBoss?BOSS_ART[en.name].acc:isMin?MINION_ART[en.name].acc:en.color;
    this.foe=this.foeAnim
      ?this.add.sprite(x0,GROUND,this.foeAnim).setScale(isBoss?1.55:1.5).setOrigin(.5,1).play(this.foeAnim+'_idle')
      :this.add.image(x0,GROUND,monsterTex(this,en.name,en.color,en.boss)).setScale(en.boss?2:1.45).setOrigin(.5,1);
    if(this.foeAnim)FX.glow(this.foe,this.foeAcc,isBoss?2:1.5);
    this.foeShadow.setScale(isBoss?1.3:isMin?.8:1);
    const foe=this.foe;
    this.tweens.add({targets:foe,x:FOE_X,duration:first?0:600,ease:'Back.out',onComplete:()=>{
      // the foe can be beaten before it finishes sliding in; only start its idle bob if it is still here
      if(this.foe===foe&&foe.active)this.foeIdle=this.tweens.add({targets:foe,y:GROUND-8,duration:800,yoyo:true,repeat:-1,ease:'Sine.inOut'});
    }});
    if(en.boss&&!first)this.banner(`BOSS: ${en.name}`,en.color);
    this.drawBars();
  }
  floatText(x,y,str,color,size){
    const t=this.add.text(x,y,str,{fontFamily:FONT_T,fontSize:(size||28)+'px',color,stroke:'#000',strokeThickness:5}).setOrigin(.5).setDepth(40);
    this.tweens.add({targets:t,y:y-60,alpha:0,duration:1000,ease:'Cubic.out',onComplete:()=>t.destroy()});
  }
  banner(str,color){
    const t=this.add.text(BW/2,150,str.toUpperCase(),{fontFamily:FONT_T,fontSize:'30px',color,stroke:'#000',strokeThickness:6}).setOrigin(.5).setDepth(50).setScale(.4).setAlpha(0);
    this.tweens.add({targets:t,scale:1,alpha:1,duration:300,ease:'Back.out',hold:900,yoyo:true,onComplete:()=>t.destroy()});
  }
  accessMsg(ok){
    const col=ok?'#00ff9c':'#ff2e63';
    const t=this.add.text(BW/2,128,ok?'ACCESS GRANTED':'ACCESS DENIED',{fontFamily:FONT_T,fontSize:'36px',color:col,backgroundColor:'rgba(0,0,0,0.8)',padding:{x:14,y:6}}).setOrigin(.5).setDepth(52);
    FX.glow(t,col,4);
    ok?sfx.granted():sfx.denied();
    this.tweens.add({targets:t,alpha:{from:0,to:1},duration:50,yoyo:true,repeat:2,onComplete:()=>{t.setAlpha(1);this.tweens.add({targets:t,alpha:0,y:110,delay:650,duration:300,onComplete:()=>t.destroy()})}});
  }
  checkAlarm(){const B=this.B,low=B.php>0&&B.php<=30&&!B.over;Sound.alarm(low);this.vignette.setVisible(low)}

  // ---------- attacks ----------
  heroAttack(dmg,crit,big,done){
    const en=this.B.enemies[this.B.ei],shots=big?5:crit?3:1,ty=GROUND-60,target=this.foe;   // the foe this attack is aimed at
    // typing burst on the holo-keyboard, then code bolts fly
    this.hero.play('hk_type');this.hero.once('animationcomplete',()=>this.hero.play('hk_idle'));
    for(let i=0;i<4;i++)this.time.delayedCall(i*45,()=>sfx.key());
    for(let i=0;i<shots;i++){
      this.time.delayedCall(140+i*90,()=>{
        sfx.shoot();
        const b=this.add.image(HERO_X+50,ty+Phaser.Math.Between(-16,16),'bolt').setScale(big?2.2:1.6).setDepth(20);
        this.tweens.add({targets:b,x:FOE_X-30,y:ty,duration:230,ease:'Quad.in',onComplete:()=>{
          b.destroy();
          this.burst.setParticleTint(hexNum(en.color));this.burst.explode(big?40:crit?24:14,FOE_X-20,ty);
          this.burst.setParticleTint(0xffffff);this.burst.explode(6,FOE_X-20,ty);
          if(this.foe){this.foe.setTintFill(0xffffff);this.time.delayedCall(80,()=>this.foe&&this.foe.clearTint())}
          if(i===shots-1){
            this.cameras.main.shake(big?350:crit?250:140,big?.018:crit?.012:.005);
            if(crit||big)this.cameras.main.flash(120,255,220,120);
            this.floatText(FOE_X,GROUND-150,(big?'COUNTER! ':crit?'CRIT! ':'')+'-'+dmg,big||crit?'#ffd23f':'#00ff9c',big||crit?30:26);
            crit||big?sfx.crit():sfx.hit();
            this.drawBars();
            // Only finish off the foe this attack was aimed at (the player may already have moved on to the next one).
            if(en.hp<=0&&target&&this.foe===target)this.killEnemy();
            done&&done();
          }
        }});
      });
    }
  }
  enemyAttack(dmg,done){
    const foe=this.foe;if(!foe)return done&&done();
    const wind=this.foeAnim?(this.foeIsBoss?260:180):0;
    if(this.foeAnim){   // attack animation: charge in hand, then strike
      const k=foe.texture.key;foe.play(k+'_atk');
      foe.once('animationcomplete',()=>{if(foe.active&&this.foe===foe)foe.play(k+'_idle')});
    }
    this.tweens.add({targets:foe,x:FOE_X-80,duration:140,yoyo:true,ease:'Quad.in',delay:wind});
    const o=this.add.image(FOE_X-70,GROUND-70,'orb').setScale(1.5).setDepth(20).setAlpha(wind?0:1);
    this.tweens.add({targets:o,x:HERO_X+20,y:GROUND-60,duration:300,ease:'Quad.in',delay:wind,onStart:()=>o.setAlpha(1),onComplete:()=>{
      o.destroy();sfx.hurt();
      this.burst.setParticleTint(0xff2e63);this.burst.explode(20,HERO_X+10,GROUND-60);
      this.hero.setTint(0xff2e63);this.time.delayedCall(220,()=>this.hero.clearTint());
      this.cameras.main.shake(260,.012);this.cameras.main.flash(160,255,40,80);
      this.floatText(HERO_X,GROUND-140,'-'+dmg,'#ff2e63');
      FX.glitch();FX.sceneGlitch(this);
      this.drawBars();this.checkAlarm();done&&done();
    }});
  }
  killEnemy(){
    const foe=this.foe;if(!foe)return;   // already gone
    this.foe=null;if(this.foeIdle)this.foeIdle.stop();
    if(this.foeAnim){   // glitch-out death: tearing frames, then a CRT-style collapse
      const k=foe.texture.key,acc=hexNum(this.foeAcc),big=this.foeIsBoss,cy=GROUND-(big?90:50);
      this.time.delayedCall(120,()=>{
        foe.clearTint();foe.play(k+'_die');sfx.zap();FX.glitch();FX.sceneGlitch(this);
        this.time.delayedCall(200,()=>FX.sceneGlitch(this));
        foe.once('animationcomplete',()=>{
          sfx.boom();this.burst.setParticleTint(acc);this.burst.explode(big?60:30,FOE_X,cy);
          this.tweens.add({targets:foe,scaleY:.02,scaleX:foe.scaleX*1.7,y:cy,duration:220,ease:'Cubic.in',onComplete:()=>
            this.tweens.add({targets:foe,scaleX:0,alpha:0,duration:160,onComplete:()=>foe.destroy()})});
        });
      });
      return;
    }
    sfx.boom();
    this.time.delayedCall(150,()=>{
      this.burst.setParticleTint(0xffd23f);this.burst.explode(40,FOE_X,GROUND-60);
      this.tweens.add({targets:foe,scale:0,angle:200,alpha:0,duration:600,ease:'Back.in',onComplete:()=>foe.destroy()});
    });
  }

  // ---------- turn flow ----------
  ask(){
    const B=this.B,en=B.enemies[B.ei];
    if(en.boss&&typeof B.d==='number'&&!B.pbqDone&&en.hp<=en.max/2)return this.special();
    if(!B.queue.length)B.queue=srsOrderIds(B.pool);
    const q=Q[B.queue.shift()];B.cur=q;
    this.ctl=UI.mcq(UI.panel,q,{fit:true,chips:[q.d<6?`Domain ${q.d}`:'AI bonus'],hints:B.hints,onHint:()=>{B.hints=Math.max(0,B.hints-1)},timer:Settings.timer?Settings.timerSecs:0,onAnswer:(ok,ms,_,to)=>this.answer(ok,ms,to)});
  }
  answer(ok,ms,timedOut){
    const B=this.B,en=B.enemies[B.ei];
    mark(B.cur.id,ok);save();
    if(B.cur.o){B.objRes=B.objRes||{};const x=B.objRes[B.cur.o]||(B.objRes[B.cur.o]={r:0,t:0});x.t++;if(ok)x.r++}   // per-objective results (story debrief)
    // missed questions come back a few questions later in the same battle
    if(!ok&&!B.queue.includes(B.cur.id))B.queue.splice(Math.min(3,B.queue.length),0,B.cur.id);
    let title,extra='';
    if(ok){
      const crit=B.streak>=2,dmg=crit?2:1,quick=ms<12000;
      en.hp=Math.max(0,en.hp-dmg);B.streak++;B.best=Math.max(B.best,B.streak);B.right++;
      if(B.streak%5===0){B.hints++;extra+=' <span class="chip ok">+1 hint</span>'}
      addXp((en.boss?15:10)*(crit?2:1)+(quick?5:0));
      if(quick)extra+=' <span class="chip ok">quick +5 xp</span>';
      title=crit?`ACCESS GRANTED // ${hName()} landed a critical exploit`:`ACCESS GRANTED // ${hName()} breached the firewall`;
      this.accessMsg(true);
      this.heroAttack(dmg,crit,false);
    }else{
      const dmg=en.boss?25:20;B.php=Math.max(0,B.php-dmg);B.streak=0;B.wrong++;
      title=timedOut?`ACCESS DENIED // ${hName()}'s session timed out`:`ACCESS DENIED // ${hName()} was traced`;
      this.accessMsg(false);
      this.enemyAttack(dmg);
    }
    this.drawBars();
    if(B.d&&B.d.kind==='story')Story.saveProg(B);   // after score and HP updates, so leaving mid-chapter loses nothing
    const btn=B.php<=0?'Continue':en.hp<=0?(B.ei+1>=B.enemies.length?'Claim victory':'Next foe'):'Next';
    this.ctl.feedback(ok,title,btn,()=>this.cont(),extra);
  }
  special(){
    const B=this.B,en=B.enemies[B.ei];B.pbqDone=true;
    this.banner('!! counter-intrusion detected !!','#ff2e63');
    sfx.alarm();FX.sceneGlitch(this);
    if(this.foe){this.foe.setTint(0xff7a90);this.tweens.add({targets:this.foe,scale:this.foe.scale*1.12,duration:300,yoyo:true,repeat:2})}
    const charge=this.add.particles(FOE_X,GROUND-70,'px',{speed:{min:40,max:140},angle:{min:0,max:360},lifespan:600,scale:{start:1.2,end:0},alpha:{start:1,end:0},tint:0xff2e63,frequency:25}).setDepth(25);
    const p=UI.randomPbq(B.d);
    UI.set(`<div class="special"><b class="pix">&gt; WARNING: ${esc(en.name)} is deploying a counter-intrusion.</b> Solve this performance-based question to turn it around. Score 80% or more to hit back hard; fall short and you take 35 damage.</div><div id="pbqHost"></div>`);
    UI.runPbq(document.getElementById('pbqHost'),p,(score,total)=>{
      charge.destroy();if(this.foe)this.foe.clearTint();
      const pass=score/total>=.8;S.pbq[p.s.title]=pass?1:0;save();
      UI.set(`<div class="special ${pass?'ok':'no'}"><b class="pix">${pass?'&gt; counter-hack successful':'&gt; counter-intrusion landed'}</b> ${pass?'Your answer turns the attack around.':'Review the correct answers next time this comes up.'}</div>`);
      if(pass){en.hp=Math.max(0,en.hp-2);B.right++;addXp(40);this.heroAttack(2,false,true,()=>this.time.delayedCall(700,()=>this.cont()))}
      else{B.php=Math.max(0,B.php-35);B.wrong++;B.streak=0;this.enemyAttack(35,()=>this.time.delayedCall(700,()=>this.cont()))}
    },{chip:'Boss special'});
  }
  cont(){
    const B=this.B,en=B.enemies[B.ei];
    if(B.over)return;
    if(B.php<=0)return this.finish(false);
    if(en.hp<=0){
      B.ei++;
      if(B.ei>=B.enemies.length)return this.finish(true);
      B.php=Math.min(B.pmax,B.php+20);this.floatText(HERO_X,GROUND-140,'+20 HP','#00ff9c',22);this.checkAlarm();
      if(B.d&&B.d.kind==='story'){Story.saveProg(B);return Story.between(this,B,B.ei-1,()=>{if(B.over||!this.sys.isActive())return;this.drawBars();this.spawnEnemy(false);this.ask()});}
      this.spawnEnemy(false);
    }else if(typeof B.d!=='number'&&!(B.d&&B.d.kind==='story')&&!B.queue.length)return this.finish(true);
    this.ask();
  }
  finish(win){
    const B=this.B;B.over=true;UI.keyHandler=null;Sound.alarm(false);this.vignette.setVisible(false);document.body.classList.add('bover');requestAnimationFrame(()=>App.refit());   // shrink the arena so results fit
    if(B.d&&B.d.kind==='daily')Meta.dailyDone(B);   // daily challenge bonus (once per day)
    if(win){
      if(typeof B.d==='number'){S.cleared[B.d]=true;addXp(100)}else addXp(40);
      save();sfx.hack();
      this.banner('ROOT ACCESS OBTAINED','#00ff9c');
      this.hero.play('hk_type');this.hero.once('animationcomplete',()=>this.hero.play('hk_idle'));
      this.tweens.add({targets:this.hero,y:GROUND-30,duration:220,yoyo:true,repeat:3,ease:'Quad.out'});
      const conf=this.add.particles(BW/2,-10,'px',{x:{min:-BW/2,max:BW/2},speedY:{min:120,max:260},speedX:{min:-40,max:40},lifespan:2000,rotate:{min:0,max:360},tint:[0x00ff9c,0x00e5ff,0xffd23f],quantity:3,frequency:30}).setDepth(45);
      this.time.delayedCall(1800,()=>conf.stop());
    }else{
      sfx.lose();FX.glitch();this.banner('CONNECTION TERMINATED','#ff2e63');
      this.hero.stop();this.tweens.add({targets:this.hero,angle:90,alpha:.4,duration:600});
    }
    if(B.d&&B.d.kind==='story')return Story.debrief(this,B,win);   // chapter debrief instead of the normal result
    const tot=B.right+B.wrong,acc=tot?Math.round(100*B.right/tot):0,miss=missedIds().length;
    const el=UI.set(`<div class="result ${win?'win':'lose'}">
      <h2 class="pix">${win?`&gt; ${hName()}: hack successful, zone secured`:`&gt; ${hName()}: connection terminated`}</h2>
      <p>${win?`You cleared ${esc(B.Z.zone)}.${typeof B.d==='number'?' +100 XP bonus.':''}`:`${esc(B.enemies[Math.min(B.ei,B.enemies.length-1)].name)} got through. The questions you missed come first next time.`}</p>
      <div class="stats"><div><b>${B.right}</b><span>correct</span></div><div><b>${B.wrong}</b><span>wrong</span></div><div><b>${acc}%</b><span>accuracy</span></div><div><b>${B.best}</b><span>best streak</span></div></div>
      <div class="row center"><button class="btn" data-a="again">${win?'Play again':'Retry'}</button><button class="btn ghost" data-a="map">Back to map</button>${miss?`<button class="btn ghost" data-a="miss">Rematch missed (${miss})</button>`:''}</div></div>`);
    el.onclick=e=>{const a=e.target.dataset.a;if(a==='again')B.d&&B.d.kind==='weak'?App.go('weak'):App.go('battle',B.d);if(a==='map')App.go('world');if(a==='miss')App.go('battle','missed')};
    UI.keyHandler=e=>{if(e.key==='Enter')App.go('world')};
  }
}
