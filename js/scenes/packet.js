// Security+ Quest: Packet Defender. Block insecure protocols and weak crypto before they reach the server.
// Tap or click a packet to block it, or press 1-4 to block the front packet in that lane.

class PacketScene extends Phaser.Scene{
  constructor(){super('Packet')}
  create(){
    const W=960,H=540;
    this.LANES=[150,250,350,450];this.WALL=170;
    this.st={score:0,hp:5,combo:0,wave:1,started:false,over:false,blocked:0,mistakes:0,speed:70,gap:1700,next:0,elapsed:0};
    this.packets=[];

    const g=this.add.graphics();
    this.cameras.main.setBackgroundColor(curTheme().bg);FX.rain(this,{alpha:.2,color:'#00e5ff',every:70});Sound.play('battle');
    this.events.once('shutdown',()=>Sound.alarm(false));
    g.fillGradientStyle(0x000000,0x000000,0x02101a,0x02101a,.7);g.fillRect(0,0,W,H);
    this.LANES.forEach((y,i)=>{
      g.lineStyle(1,0x0c5c3a,1);g.lineBetween(this.WALL,y+38,W,y+38);
      g.fillStyle(0x002a1a,1);g.fillRect(this.WALL+8,y-14,28,28);
      this.add.text(this.WALL+22,y,String(i+1),{fontFamily:FONT_T,fontSize:'14px',color:'#3fae7d'}).setOrigin(.5);
    });
    // lane flow dashes
    this.dashes=this.add.tileSprite(this.WALL,100,W-this.WALL,400,'px').setOrigin(0).setAlpha(.0);
    // firewall
    this.wall=this.add.graphics();this.drawWall(0x00e5ff);
    this.server=this.add.image(80,300,'server').setScale(1.1);
    this.add.text(80,380,'SERVER',{fontFamily:FONT_T,fontSize:'12px',color:'#00e5ff'}).setOrigin(.5);

    this.hud=this.add.text(20,16,'',{fontFamily:FONT_T,fontSize:'16px',color:'#b8ffe0'});
    this.hpTxt=this.add.text(940,16,'',{fontFamily:FONT_T,fontSize:'16px',color:'#00ff9c'}).setOrigin(1,0);
    this.zapFx=this.add.particles(0,0,'px',{speed:{min:80,max:300},lifespan:500,scale:{start:1.2,end:0},emitting:false}).setDepth(30);
    this.bolt=this.add.graphics().setDepth(29);

    this.intro=this.add.container(480,270).setDepth(50);
    const box=this.add.rectangle(0,0,560,220,0x000000,.92).setStrokeStyle(2,0x00ff9c);
    const t1=this.add.text(0,-70,'> packet_defender.exe',{fontFamily:FONT_T,fontSize:'28px',color:'#00ff9c'}).setOrigin(.5);
    const t2=this.add.text(0,-10,'Block insecure protocols and weak crypto.\nLet secure traffic reach the server.\nBlocking legit traffic costs integrity too.\nTap a packet, or press 1-4 to block a lane.',{fontFamily:'IBM Plex Sans',fontSize:'16px',color:'#b8ffe0',align:'center',lineSpacing:4}).setOrigin(.5);
    const t3=this.add.text(0,70,'[ TAP OR PRESS ENTER TO ARM FIREWALL ]',{fontFamily:FONT_T,fontSize:'16px',color:'#000000',backgroundColor:'#00ff9c',padding:{x:10,y:6}}).setOrigin(.5);
    this.tweens.add({targets:t3,scale:1.06,duration:500,yoyo:true,repeat:-1});
    this.intro.add([box,t1,t2,t3]);
    this.input.once('pointerdown',()=>this.start());

    this.log=[];
    this.renderPanel();
    UI.keyHandler=e=>{
      if(!this.st.started&&(e.key==='Enter'||e.key===' ')){e.preventDefault();return this.start()}
      const n='1234'.indexOf(e.key);if(n>=0&&this.st.started&&!this.st.over)this.blockLane(n);
    };
    this.drawHud();
  }
  drawWall(col){
    const g=this.wall;g.clear();g.fillStyle(col,.12);g.fillRect(this.WALL-14,100,14,400);
    g.lineStyle(3,col,1);g.lineBetween(this.WALL,100,this.WALL,500);
    for(let y=104;y<500;y+=24){g.fillStyle(col,.6);g.fillRect(this.WALL-10,y,6,12)}
  }
  start(){
    if(this.st.started)return;this.st.started=true;sfx.select();
    this.tweens.add({targets:this.intro,alpha:0,scale:.8,duration:250,onComplete:()=>this.intro.destroy()});
    this.input.on('gameobjectdown',(p,obj)=>{const pk=this.packets.find(k=>k.box===obj);if(pk)this.block(pk)});
  }
  spawn(){
    const lane=Phaser.Math.Between(0,3),y=this.LANES[lane];
    // avoid stacking on a packet that just spawned in this lane
    if(this.packets.some(k=>k.lane===lane&&k.c.x>820))return;
    const P=pick(PACKETS);
    const c=this.add.container(1010,y);
    const box=this.add.rectangle(0,0,150,48,0x00140c).setStrokeStyle(2,0x00e5ff,.8).setInteractive({useHandCursor:true});
    const name=this.add.text(0,-8,P.n,{fontFamily:FONT_T,fontSize:'15px',color:'#b8ffe0'}).setOrigin(.5);
    const port=this.add.text(0,12,P.p===''?'':(isNaN(+P.p)?P.p:'port '+P.p),{fontFamily:'IBM Plex Sans',fontSize:'12px',color:'#3fae7d'}).setOrigin(.5);
    c.add([box,name,port]);
    this.packets.push({c,box,P,lane,dead:false});
  }
  blockLane(n){
    const front=this.packets.filter(k=>k.lane===n&&!k.dead).sort((a,b)=>a.c.x-b.c.x)[0];
    if(front)this.block(front);
  }
  block(pk){
    if(pk.dead||this.st.over||!this.st.started)return;pk.dead=true;
    const st=this.st,{x,y}=pk.c;
    this.bolt.clear();this.bolt.lineStyle(3,pk.P.bad?0x00e5ff:0xff2e63,1);
    let px=this.WALL,py=y;this.bolt.beginPath();this.bolt.moveTo(px,py);
    for(let i=1;i<=6;i++){px=this.WALL+(x-this.WALL)*i/6;this.bolt.lineTo(px,y+Phaser.Math.Between(-12,12))}
    this.bolt.strokePath();this.time.delayedCall(90,()=>this.bolt.clear());
    if(pk.P.bad){
      st.combo++;st.blocked++;const mult=Math.min(4,1+Math.floor(st.combo/4));const pts=10*mult;st.score+=pts;
      sfx.zap();this.zapFx.setParticleTint(0x00e5ff);this.zapFx.explode(18,x,y);
      this.float(x,y-20,`DROPPED +${pts}`,'#00e5ff');
      this.tweens.add({targets:pk.c,scale:0,angle:90,alpha:0,duration:220,onComplete:()=>pk.c.destroy()});
      this.addLog(true,`Blocked ${pk.P.n}. ${pk.P.why}`);
    }else{
      st.combo=0;st.mistakes++;this.damage(`You blocked ${pk.P.n}, which is secure. ${pk.P.why}`);
      this.float(x,y-20,'LEGIT TRAFFIC!','#ff2e63');
      this.tweens.add({targets:pk.c,alpha:0,y:y+20,duration:300,onComplete:()=>pk.c.destroy()});
    }
    this.drawHud();
  }
  damage(msg){
    const st=this.st;st.hp--;sfx.hurt();
    this.cameras.main.shake(220,.01);this.cameras.main.flash(140,255,40,80);
    this.server.setTint(0xff2e63);this.time.delayedCall(200,()=>this.server.clearTint());
    this.drawWall(0xff2e63);this.time.delayedCall(250,()=>this.drawWall(0x00e5ff));
    FX.glitch();FX.sceneGlitch(this);if(st.hp<=2&&st.hp>0)Sound.alarm(true);
    this.addLog(false,msg);
    if(st.hp<=0)this.finish();
  }
  float(x,y,s,color){
    const t=this.add.text(x,y,s,{fontFamily:FONT_T,fontSize:'16px',color,stroke:'#000',strokeThickness:4}).setOrigin(.5).setDepth(40);
    this.tweens.add({targets:t,y:y-40,alpha:0,duration:800,onComplete:()=>t.destroy()});
  }
  drawHud(){
    const st=this.st;const mult=Math.min(4,1+Math.floor(st.combo/4));
    this.hud.setText(`SCORE ${st.score}   WAVE ${st.wave}${mult>1?`   COMBO x${mult}`:''}`);
    this.hpTxt.setText('INTEGRITY '+'#'.repeat(Math.max(0,st.hp))+'-'.repeat(5-Math.max(0,st.hp))).setColor(st.hp<=2?'#ff2e63':'#00ff9c');
    const s=document.getElementById('pdScore');if(s)s.textContent=st.score;
  }
  addLog(ok,msg){
    this.log.unshift({ok,msg});this.log=this.log.slice(0,3);
    const el=document.getElementById('pdLog');
    if(el)el.innerHTML=this.log.map(l=>`<li class="${l.ok?'yes':'no'}">${esc(l.msg)}</li>`).join('');
  }
  renderPanel(){
    UI.set(`<div class="pd">
      <div class="bhead"><span class="pix">&gt; packet_defender.exe</span><span class="pix">Score <span id="pdScore">0</span></span><span class="tiny">Best ${S.best.packet}</span></div>
      <p class="tiny">Tap a packet to block it, or press 1-4 to block the front packet in that lane. Every decision is explained below.</p>
      <ul class="pdlog" id="pdLog"><li class="muted">Insecure: Telnet, FTP, HTTP, SNMPv1, SSL, TLS 1.0, WEP, DES, MD5... Secure: SSH, HTTPS, SFTP, LDAPS, SNMPv3, WPA3, AES...</li></ul>
      </div>`);
  }
  update(t,dt){
    const st=this.st;if(!st.started||st.over)return;
    st.elapsed+=dt;
    const wave=1+Math.floor(st.elapsed/25000);
    if(wave!==st.wave){st.wave=wave;st.speed=70+wave*14;st.gap=Math.max(600,1700-wave*170);this.banner(`WAVE ${wave}`);this.drawHud()}
    st.next-=dt;if(st.next<=0){this.spawn();st.next=st.gap*Phaser.Math.FloatBetween(.7,1.2)}
    const mv=st.speed*dt/1000;
    this.packets.forEach(pk=>{
      if(pk.dead)return;
      pk.c.x-=mv;
      if(pk.c.x<=this.WALL+80){
        pk.dead=true;
        if(pk.P.bad){st.combo=0;st.mistakes++;this.damage(`${pk.P.n} got through. ${pk.P.why}`);this.float(pk.c.x,pk.c.y-20,'BREACH!','#ff2e63')}
        else{st.score+=5;this.float(pk.c.x,pk.c.y-20,'DELIVERED +5','#00ff9c');sfx.tick()}
        this.tweens.add({targets:pk.c,x:110,scale:.2,alpha:0,duration:250,onComplete:()=>pk.c.destroy()});
        this.drawHud();
      }
    });
    this.packets=this.packets.filter(k=>!k.dead||k.c.active);
  }
  banner(s){
    const t=this.add.text(560,300,s,{fontFamily:FONT_T,fontSize:'34px',color:'#ffd23f',stroke:'#000',strokeThickness:6}).setOrigin(.5).setDepth(45).setAlpha(0);
    this.tweens.add({targets:t,alpha:1,duration:250,hold:700,yoyo:true,onComplete:()=>t.destroy()});
  }
  finish(){
    const st=this.st;if(st.over)return;st.over=true;Sound.alarm(false);document.body.classList.add('bover');requestAnimationFrame(()=>App.game.scale.refresh());
    const newBest=st.score>S.best.packet;if(newBest)S.best.packet=st.score;
    save();addXp(Math.round(st.score/5));sfx.lose();
    this.packets.forEach(pk=>{if(pk.c.active)this.tweens.add({targets:pk.c,alpha:0,duration:400})});
    this.banner('SYSTEM COMPROMISED');
    const lessons=this.log.filter(l=>!l.ok);
    const el=UI.set(`<div class="result lose">
      <h2 class="pix">&gt; system compromised</h2><div class="bigscore pix">${st.score}</div>
      <p>${newBest?'New personal best!':'Best: '+S.best.packet} &middot; wave ${st.wave} &middot; ${st.blocked} threats blocked &middot; +${Math.round(st.score/5)} XP</p>
      ${lessons.length?`<div class="lessons"><b>Review what got you:</b><ul>${lessons.map(l=>`<li>${esc(l.msg)}</li>`).join('')}</ul></div>`:''}
      <div class="row center"><button class="btn" id="pdAgain">Play again</button><button class="btn ghost" id="pdMap">Back to map</button></div></div>`);
    el.querySelector('#pdAgain').onclick=()=>App.go('packet');
    el.querySelector('#pdMap').onclick=()=>App.go('world');
    UI.keyHandler=e=>{if(e.key==='Enter')App.go('packet')};
  }
}
