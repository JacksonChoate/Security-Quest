// Security+ Quest: hacker-theme effects.
// Falling-code background, glitch on damage, terminal typing (canvas and HTML), neon glow.

const FONT_T="'Share Tech Mono', ui-monospace, Consolas, monospace";   // terminal face used on the canvas
const NEON={green:'#00ff9c',cyan:'#00e5ff',red:'#ff2e63',amber:'#ffd23f',dim:'#0c5c3a'};

const FX={
  // Falling code drawn into a canvas texture behind the scene. Returns the image.
  rain(scene,o){
    o=o||{};const W=scene.scale.width,H=scene.scale.height,fs=o.size||16,key='rain_'+scene.scene.key;
    if(scene.textures.exists(key))scene.textures.remove(key);
    const tex=scene.textures.createCanvas(key,W,H),ctx=tex.getContext();
    ctx.fillStyle='#000';ctx.fillRect(0,0,W,H);
    const cols=Math.ceil(W/fs),drops=[...Array(cols)].map(()=>Math.random()*-40);
    const chars='0101010110{}[]<>/\\#$%&*+=;:ABCDEF0123456789';
    const img=scene.add.image(0,0,key).setOrigin(0).setAlpha((o.alpha||.5)*(Settings.contrast?.4:1)).setDepth(-10);
    let acc=0;
    const fn=(t,dt)=>{
      acc+=dt;if(acc<(o.every||55))return;acc=0;
      ctx.fillStyle='rgba(0,0,0,0.13)';ctx.fillRect(0,0,W,H);
      ctx.font=fs+'px Consolas, monospace';
      for(let i=0;i<cols;i++){
        const y=drops[i]*fs;
        ctx.fillStyle=Math.random()<.05?'#d9ffec':(o.color||NEON.green);
        ctx.fillText(chars[Math.random()*chars.length|0],i*fs,y);
        if(y>H&&Math.random()>.97)drops[i]=0;
        drops[i]+=1;
      }
      tex.refresh();
    };
    if(FX.calm()){for(let k=0;k<45;k++){acc=1e6;fn(0,0)}img.setAlpha(img.alpha*.6);return img}   // reduced motion: one still frame
    scene.events.on('update',fn);
    scene.events.once('shutdown',()=>scene.events.off('update',fn));
    return img;
  },
  // Reduced motion: the in-game setting or the operating system preference.
  calm(){return !!Settings.motion||(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches)},

  // CSS glitch on the whole game frame (RGB split, slice jitter).
  glitch(){
    const w=document.getElementById('gameWrap');if(!w||FX.calm())return;
    w.classList.remove('glitch');void w.offsetWidth;w.classList.add('glitch');
    clearTimeout(FX._g);FX._g=setTimeout(()=>w.classList.remove('glitch'),480);
  },
  // In-canvas glitch: neon slices and a horizontal camera jolt.
  sceneGlitch(scene){
    if(FX.calm())return;
    const cols=[0xff2e63,0x00e5ff,0x00ff9c],W=scene.scale.width,H=scene.scale.height;
    for(let i=0;i<8;i++){
      const r=scene.add.rectangle(W/2+Phaser.Math.Between(-60,60),Phaser.Math.Between(0,H),W,Phaser.Math.Between(3,24),pick(cols),.3).setDepth(60).setBlendMode(Phaser.BlendModes.ADD);
      scene.time.delayedCall(Phaser.Math.Between(50,240),()=>r.destroy());
    }
    const cam=scene.cameras.main;
    [0,60,120].forEach((d,i)=>scene.time.delayedCall(d,()=>cam.setScroll(i<2?Phaser.Math.Between(-10,10):0,0)));
  },

  // Neon glow on a canvas object (WebGL only; ignored on Canvas renderer).
  glow(obj,color,strength){try{if(obj.postFX)obj.postFX.addGlow(typeof color==='string'?hexNum(color):color,strength||3,0,false,.1,10)}catch(e){}return obj},

  // Type text into a Phaser Text object with a blinking cursor and key clicks.
  typeText(scene,obj,str,speed,cb){
    let i=0;obj.setText('_');
    scene.time.addEvent({delay:speed||26,repeat:str.length-1,callback:()=>{
      i++;obj.setText(str.slice(0,i)+(i<str.length?'_':''));
      if(i%2===1&&str[i-1]!==' ')sfx.key();
      if(i===str.length&&cb)cb();
    }});
    return obj;
  },

  // Type terminal lines into an HTML element. Click or press any key to skip. Calls cb when done.
  type(el,lines,cb,speed){
    speed=speed||12;let li=0,ci=0,done=false,timer;
    el.onclick=null;
    el.innerHTML=`<div class="term" role="log"></div>`;
    const box=el.firstChild;
    const finish=()=>{if(done)return;done=true;clearTimeout(timer);box.innerHTML=lines.map(l=>`<div>${esc(l)}</div>`).join('');UI.keyHandler=null;setTimeout(()=>cb&&cb(),120)};
    const tickFn=()=>{
      if(done)return;
      if(li>=lines.length)return finish();
      const line=lines[li];ci++;
      box.innerHTML=lines.slice(0,li).map(l=>`<div>${esc(l)}</div>`).join('')+`<div>${esc(line.slice(0,ci))}<span class="cursor">&#9608;</span></div>`;
      if(ci%2===1&&line[ci-1]!==' ')sfx.key();
      if(ci>=line.length){li++;ci=0;timer=setTimeout(tickFn,140)}else timer=setTimeout(tickFn,speed);
    };
    box.onclick=finish;UI.keyHandler=e=>{if(e.key==='Enter'||e.key===' '||e.key==='Escape'){e.preventDefault();finish()}};
    if(FX.typeFast())finish();else tickFn();
  },

  // Type a single line into an element (no callback, used for panel titles).
  typeInline(el,str,speed){
    if(!el)return;let i=0;clearInterval(el._t);
    if(FX.typeFast()){el.textContent=str;return}
    el._t=setInterval(()=>{i++;el.textContent=str.slice(0,i);if(i%3===1)sfx.key();if(i>=str.length)clearInterval(el._t)},speed||18);
  },

  // Typing effect is motion too: show text at once when calm.
  typeFast(){return FX.calm()},

  slug(s){return String(s).toLowerCase().replace(/^the\s+/,'').replace(/[^a-z0-9]+/g,'_').replace(/^_|_$/g,'')}
};

// Reduced motion also disables camera shake and flash everywhere in the game.
if(typeof Phaser!=='undefined'){
  const C=Phaser.Cameras.Scene2D.Camera.prototype,shake=C.shake,flash=C.flash;
  C.shake=function(...a){return FX.calm()?this:shake.apply(this,a)};
  C.flash=function(...a){return FX.calm()?this:flash.apply(this,a)};
}
