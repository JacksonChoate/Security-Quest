// Security+ Quest: World scene. A walkable campus with one portal per exam domain and arcade kiosks.

function worldStations(){
  const pos=[[170,118],[480,118],[790,118],[170,278],[480,278],[790,278]];
  const portals=DOMAINS.map((d,i)=>({
    kind:'portal',x:pos[i][0],y:pos[i][1],color:d.color,label:d.zone,d:d.id,
    title:d.zone,
    desc:`${d.id<6?`Domain ${d.id}: `:''}${d.name.replace('Bonus: ','')}. ${d.id<6?`${d.weight} of the exam.`:'Bonus content.'} Beat ${d.enemies.length} enemies, then the boss. Bosses fire a PBQ special attack at half health.`,
    stat:()=>`Mastery ${mastery(d.id)}%${S.cleared[d.id]?' · Cleared':''}`,
    go:()=>App.go('battle',d.id)
  }));
  const k=[
    ['Story Campaign','#ff2e63','Incident Week at Northwind Ridge Logistics: six story chapters across the zones, with decisions, incident tasks and debriefs.',()=>S.story.done?'Campaign complete':`Chapter ${Math.min(STORY.length,S.story.ch+1)} of ${STORY.length}`,()=>App.go('story')],
    ['Packet Defender','#5ee6ff','Action game. Packets race toward your server. Tap insecure protocols and weak crypto to block them; let secure traffic through.',()=>`Best: ${S.best.packet}`,()=>App.go('packet')],
    ['PBQ Lab','#ff9b4d','Practice performance-based questions: match terms and put processes in order, like the drag-and-drop tasks at the start of the exam.',()=>`Best: ${S.best.lab} / 5`,()=>App.go('lab')],
    ['Weak Spots','#ff2e63','A 20-question battle built from your lowest-scoring exam objectives. Untried objectives get mixed in.',()=>{const w=weakestObjectives(2);return w.length?'Weakest: '+w.map(s=>s.o+' '+Math.round(100*s.acc)+'%').join(', '):'No data yet'},()=>App.go('weak')],
    ['Flashcards','#00e5ff','Acronyms, ports and key terms as 3-choice questions, some in reverse. Answer with keys 1-3; spaced repetition brings missed cards back sooner.',()=>{const n=srsDueCount(Modes.flashCards('all').map(x=>x.k));return `${n} card${n===1?'':'s'} due`},()=>App.go('flash','all')],
    ['Acronym Blitz','#5ee6ff','60 seconds. Match each acronym to its meaning. Wrong answers cost 3 seconds.',()=>`Best: ${S.best.acr}`,()=>App.go('blitz','acr')],
    ['Port Blitz','#a98bff','60 seconds of ports to protocols and back. The exam expects the common ones cold.',()=>`Best: ${S.best.port}`,()=>App.go('blitz','port')],
    ['Practice Exam','#ffc94d','Full exam: 90 questions in 90 minutes, opening with 3-4 PBQs. Or a 15-question, 15-minute Quick Quiz. Includes your score history chart.',()=>S.exams.length?`Last: ${S.exams[S.exams.length-1].pct}%`:'Not taken yet',()=>App.go('exam')],
    ['Rematch','#ff5c8a','Fight only the questions you most recently got wrong until they stick.',()=>`${missedIds().length} waiting`,()=>missedIds().length?App.go('battle','missed'):UI.toast('No missed questions right now.')],
    ['Objectives','#ffd23f','A heatmap of every exam objective, colored by your accuracy. Tap one to drill just that objective.',()=>{const s=Object.values(objStats()).filter(x=>x.t).length;return `${s} of ${OBJECTIVES.length} objectives tried`},()=>App.go('heat')],
    ['Codex','#3dff9a','Browse every acronym, port and question with explanations. Searchable.',()=>`${Q.length} questions`,()=>App.go('codex')]
  ].map((a,i)=>({kind:'kiosk',x:44+i*87,y:452,label:a[0],title:a[0],color:a[1],desc:a[2],stat:a[3],go:a[4]}));
  return portals.concat(k);
}

class WorldScene extends Phaser.Scene{
  constructor(){super('World')}
  create(){
    const W=960,H=540;
    this.cameras.main.setBackgroundColor(curTheme().bg);
    FX.rain(this,{alpha:.42});
    this.add.tileSprite(0,0,W,H,'floor').setOrigin(0);
    Sound.play('map');
    // walkway lines
    const lines=this.add.graphics();lines.lineStyle(2,0x0c5c3a,.8);
    [[170,118],[480,118],[790,118],[170,278],[480,278],[790,278]].forEach(([x,y])=>lines.lineBetween(x,y,480,380));
    lines.lineStyle(2,0x0c5c3a,.8);lines.lineBetween(40,380,920,380);

    this.add.particles(0,0,'px',{x:{min:0,max:W},y:H+10,speedY:{min:-25,max:-55},lifespan:10000,alpha:{start:.45,end:0},scale:{min:.3,max:.7},tint:[0x00ff9c,0x00e5ff],frequency:220});

    this.stations=worldStations();
    this.stations.forEach(st=>{
      const c=hexNum(st.color);
      if(st.kind==='portal'){
        this.add.image(st.x,st.y+12,'frame');
        const glow=this.add.image(st.x,st.y+30,'glow').setTint(c).setScale(4.2,1.6).setAlpha(.55);
        this.tweens.add({targets:glow,alpha:.25,duration:1200,yoyo:true,repeat:-1,ease:'Sine.inOut'});
        const ring=this.add.graphics();ring.lineStyle(3,c,1);ring.strokeEllipse(st.x,st.y+30,92,30);ring.lineStyle(1,c,.5);ring.strokeEllipse(st.x,st.y+30,110,38);
        const D=dom(st.d);
        const boss=this.add.sprite(st.x,st.y-4,bossKey(D.boss)).setScale(.5).play(bossKey(D.boss)+'_idle');
        this.tweens.add({targets:boss,y:st.y-14,duration:900+st.d*90,yoyo:true,repeat:-1,ease:'Sine.inOut'});
        this.add.text(st.x,st.y+52,st.label.toUpperCase(),{fontFamily:FONT_T,fontSize:'15px',color:st.color}).setOrigin(.5);
        const m=mastery(st.d);
        const bar=this.add.graphics();bar.fillStyle(0x050912,1);bar.fillRect(st.x-40,st.y+66,80,5);bar.fillStyle(c,1);bar.fillRect(st.x-40,st.y+66,80*m/100,5);
        if(S.cleared[st.d])this.add.text(st.x+38,st.y-40,'CLEARED',{fontFamily:FONT_T,fontSize:'10px',color:'#04130b',backgroundColor:'#00ff9c',padding:{x:4,y:1}}).setOrigin(.5);
      }else{
        this.add.image(st.x,st.y,'kiosk').setTint(c).setScale(.78);
        this.add.text(st.x,st.y+36,st.label.toUpperCase(),{fontFamily:FONT_T,fontSize:'11px',color:st.color,align:'center',wordWrap:{width:82}}).setOrigin(.5,0);
      }
    });

    const p=App.worldPos||{x:480,y:365};
    this.player=this.physics.add.sprite(p.x,p.y,'hacker').setScale(.62).setCollideWorldBounds(true).setDepth(10).play('hk_idle');
    FX.glow(this.player,'#00e5ff',2);
    this.player.body.setSize(60,70);
    this.trail=this.add.particles(0,0,'px',{follow:this.player,followOffset:{y:26},lifespan:400,speed:20,scale:{start:.6,end:0},alpha:{start:.6,end:0},tint:0x3dff9a,frequency:40,emitting:false});
    this.shadow=this.add.ellipse(p.x,p.y+28,34,8,0x00ff9c,.18).setDepth(9);
    // your hacker handle floats above the character
    this.nameTag=this.add.text(p.x,p.y-32,S.handle||'anon',{fontFamily:FONT_T,fontSize:'13px',color:'#00e5ff',backgroundColor:'rgba(0,0,0,0.65)',padding:{x:4,y:1}}).setOrigin(.5,1).setDepth(21);
    // typed greeting ("> welcome back, name")
    if(App.greet){
      const g=this.add.text(480,14,'',{fontFamily:FONT_T,fontSize:'20px',color:'#00ff9c',backgroundColor:'rgba(0,0,0,0.8)',padding:{x:12,y:5}}).setOrigin(.5,0).setDepth(30);
      FX.glow(g,'#00ff9c',3);
      FX.typeText(this,g,App.greet,FX.calm()?1:45,()=>this.tweens.add({targets:g,alpha:0,delay:2400,duration:600,onComplete:()=>g.destroy()}));
      App.greet=null;
    }

    this.prompt=this.add.text(0,0,'',{fontFamily:FONT_T,fontSize:'14px',color:'#000000',backgroundColor:'#00ff9c',padding:{x:6,y:3}}).setOrigin(.5).setDepth(20).setVisible(false);
    this.tweens.add({targets:this.prompt,scale:1.08,duration:500,yoyo:true,repeat:-1});

    const kb=this.input.keyboard;
    this.keys=kb.addKeys('W,A,S,D,UP,DOWN,LEFT,RIGHT,E,ENTER,SPACE');
    this.events.once('shutdown',()=>{kb.clearCaptures();kb.removeAllKeys(true)});
    this.target=null;this.near=undefined;this.stepT=0;

    this.input.on('pointerdown',ptr=>{
      const st=this.stations.find(s=>Phaser.Math.Distance.Between(ptr.worldX,ptr.worldY,s.x,s.y)<60);
      if(st)this.target={x:st.x,y:st.y+(st.kind==='portal'?30:-24),st};
      else this.target={x:ptr.worldX,y:ptr.worldY};
      sfx.select();
    });
    UI.keyHandler=null;
    this.updateNear(true);
  }
  enter(st){if(this.entering)return;this.entering=true;App.worldPos={x:this.player.x,y:this.player.y};sfx.zap();this.cameras.main.flash(200,255,255,255);this.time.delayedCall(180,()=>st.go());this.time.delayedCall(400,()=>this.entering=false)}
  updateNear(force){
    let best=null,bd=55;
    this.stations.forEach(s=>{const d=Phaser.Math.Distance.Between(this.player.x,this.player.y,s.x,s.kind==='portal'?s.y+30:s.y-20);if(d<bd){bd=d;best=s}});
    if(best!==this.near||force){
      this.near=best;
      if(best){this.prompt.setText('[E] CONNECT').setPosition(best.x,best.y-(best.kind==='portal'?62:46)).setVisible(true)}
      else this.prompt.setVisible(false);
      worldPanel(best);
    }
  }
  update(t,dt){
    const k=this.keys,sp=230;let vx=0,vy=0;
    if(k.A.isDown||k.LEFT.isDown)vx=-1;else if(k.D.isDown||k.RIGHT.isDown)vx=1;
    if(k.W.isDown||k.UP.isDown)vy=-1;else if(k.S.isDown||k.DOWN.isDown)vy=1;
    if(vx||vy){this.target=null;const n=Math.hypot(vx,vy);this.player.setVelocity(vx/n*sp,vy/n*sp)}
    else if(this.target){
      const dx=this.target.x-this.player.x,dy=this.target.y-this.player.y,d=Math.hypot(dx,dy);
      if(d<8){this.player.setVelocity(0,0);const st=this.target.st;this.target=null;if(st)this.enter(st)}
      else this.player.setVelocity(dx/d*sp,dy/d*sp);
    }else this.player.setVelocity(0,0);

    const moving=this.player.body.velocity.length()>1;
    this.trail.emitting=moving;
    if(this.player.body.velocity.x)this.player.setFlipX(this.player.body.velocity.x<0);
    this.player.play(moving?'hk_walk':'hk_idle',true);
    this.shadow.setPosition(this.player.x,this.player.y+28);this.nameTag.setPosition(this.player.x,this.player.y-32);
    if(moving){this.stepT+=dt;if(this.stepT>260){this.stepT=0;sfx.step()}}
    this.updateNear();
    if(this.near&&(Phaser.Input.Keyboard.JustDown(k.E)||Phaser.Input.Keyboard.JustDown(k.ENTER)||Phaser.Input.Keyboard.JustDown(k.SPACE)))this.enter(this.near);
  }
}

function worldPanel(st){
  if(st){
    const el=UI.set(`<div class="station" style="--c:${st.color}">
      <div><div class="pix st-title" id="stTitle">&nbsp;</div><div class="st-name">${esc(st.title)}</div><p>${esc(st.desc)}</p><span class="chip">${esc(st.stat())}</span></div>
      <button class="btn" id="enterBtn">Connect</button></div>`);
    FX.typeInline(el.querySelector('#stTitle'),`> connect ${FX.slug(st.title)}.${st.kind==='portal'?'zone':'exe'}`);
    el.querySelector('#enterBtn').onclick=()=>{const sc=App.game.scene.getScene('World');if(sc&&sc.sys.isActive())sc.enter(st)};
    return;
  }
  const r=readiness();
  UI.set(`<div class="station idle">
    <div><div class="pix st-title" id="stTitle">&nbsp;</div><div class="st-name">Campus network map</div>
    <p>Move with WASD or the arrow keys, or tap anywhere on the map. Walk onto a portal to breach that exam domain, or connect to a kiosk for arcade and exam practice.</p>
    ${Meta.dailyBox()}<div class="overall"><span class="pix">Exam readiness</span><div class="bar big"><i style="width:${r}%"></i></div><b>${r}%</b></div></div>
    <div class="dlist">${DOMAINS.filter(d=>d.id<6).map(d=>`<div class="dl"><span style="color:${d.color}">D${d.id}</span><div class="bar"><i style="width:${mastery(d.id)}%;background:${d.color}"></i></div><span class="tiny">${mastery(d.id)}%</span></div>`).join('')}</div>
  </div>`);
  FX.typeInline(document.getElementById('stTitle'),'> scan campus_net --all');
}
