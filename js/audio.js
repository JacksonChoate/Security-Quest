// Security+ Quest: audio engine.
// Original procedural synthwave/chiptune music and sound effects, synthesized live with the Web Audio API.
// No audio files or existing songs are used: every note below is composed for this game.

// ---------- settings (kept separate from game progress, so "Reset progress" keeps them) ----------
const SETTINGS_KEY='secplus-quest-settings';
const Settings=(()=>{const s={music:.5,sfx:.7,muted:false};try{Object.assign(s,JSON.parse(localStorage.getItem(SETTINGS_KEY)||'{}'))}catch(e){}return s})();
function saveSettings(){try{localStorage.setItem(SETTINGS_KEY,JSON.stringify(Settings))}catch(e){}}

// ---------- music notation helpers ----------
const NOTE_BASE={C:0,D:2,E:4,F:5,G:7,A:9,B:11};
function nm(n){const m=/^([A-G])([#b]?)(\d)$/.exec(n);return 12*(+m[3]+1)+NOTE_BASE[m[1]]+(m[2]==='#'?1:m[2]==='b'?-1:0)}
// Melody written as eighth notes ("-" = rest, "|" bar lines ignored) -> array of 16th steps.
function mel(str){const out=[];str.split(/\s+/).filter(t=>t&&t!=='|').forEach(t=>{out.push(t==='-'?0:nm(t),0)});return out}
const ch=(...n)=>n.map(nm);
const mtof=m=>440*Math.pow(2,(m-69)/12);

// Patterns are 16 steps per bar. Drums: x = hit, o = open hat. Bass: x = root (low), o = root up an octave, f = fifth.
// Arp digits index into the chord (3 = root an octave up).
const TRACKS={
  // Campus map: slow, moody synthwave.
  map:{bpm:92,
    chords:[ch('A3','C4','E4'),ch('F3','A3','C4'),ch('C4','E4','G4'),ch('G3','B3','D4')],
    kick:"x.......x.......",snare:"....x.......x...",hat:"..x...x...x...xo",
    bass:"x..x..x.x..x..o.",bassWave:'triangle',bassCut:900,
    arp:"0.1.2.3.2.1.0.1.",arpWave:'square',arpVol:.05,arpCut:2200,
    pad:true,padVol:.05,
    lead:mel("A4 - - C5 - B4 A4 - | F4 - - A4 - G4 F4 - | E4 - G4 - C5 - B4 - | D5 - - B4 - G4 - -"),leadWave:'triangle',leadVol:.09,leadLen:3},
  // Regular battles: driving four-on-the-floor.
  battle:{bpm:124,
    chords:[ch('A3','C4','E4'),ch('G3','B3','D4'),ch('F3','A3','C4'),ch('E3','G#3','B3')],
    kick:"x...x...x...x...",snare:"....x.......x...",hat:"x.x.x.x.x.x.x.xo",
    bass:"xxoxxxoxxxoxxxox",bassWave:'sawtooth',bassCut:700,
    arp:"0120120120120123",arpWave:'square',arpVol:.045,arpCut:3000,
    pad:true,padVol:.035,
    lead:mel("A4 A4 C5 A4 E5 - D5 C5 | B4 B4 D5 B4 G4 - A4 B4 | C5 C5 A4 C5 F5 - E5 D5 | E5 - G#4 - B4 - E5 -"),leadWave:'square',leadVol:.06,leadLen:2,leadCut:3200},
  // Boss fights: faster, harsher, phrygian half-step menace and busier drums.
  boss:{bpm:150,
    chords:[ch('A3','C4','E4'),ch('Bb3','D4','F4'),ch('A3','C4','E4'),ch('E3','G#3','B3')],
    kick:"x..xx..xx..xx.x.",snare:"....x.......x.xx",hat:"xxxxxxxxxxxxxxxo",
    bass:"xoxoxoxoxoxoxfxo",bassWave:'sawtooth',bassCut:1100,bassQ:6,
    arp:"0123210123210123",arpWave:'sawtooth',arpVol:.04,arpCut:2600,
    pad:true,padVol:.04,padWave:'sawtooth',
    lead:mel("A5 - E5 A5 - G5 F5 E5 | D5 - Bb4 D5 - F5 E5 D5 | C5 - A4 C5 E5 - A5 - | G#5 - E5 - B4 - G#4 -"),leadWave:'sawtooth',leadVol:.055,leadLen:2,leadCut:2600,leadQ:5}
};

const Sound={
  ctx:null,track:null,want:null,step:0,nextTime:0,timer:null,alarmTimer:null,

  init(){
    if(this.ctx)return true;
    const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return false;
    const c=this.ctx=new AC();
    this.master=c.createGain();this.master.connect(c.destination);
    const comp=c.createDynamicsCompressor();comp.threshold.value=-16;comp.ratio.value=4;comp.connect(this.master);
    this.music=c.createGain();this.music.connect(comp);
    this.sfxBus=c.createGain();this.sfxBus.connect(comp);
    // tempo-synced echo gives the synthwave sheen
    this.delay=c.createDelay(1.5);const fb=c.createGain();fb.gain.value=.33;const wet=c.createGain();wet.gain.value=.28;
    const dl=c.createBiquadFilter();dl.type='lowpass';dl.frequency.value=2500;
    this.delay.connect(dl);dl.connect(fb);fb.connect(this.delay);dl.connect(wet);wet.connect(this.music);
    const len=c.sampleRate;const b=c.createBuffer(1,len,c.sampleRate),d=b.getChannelData(0);for(let i=0;i<len;i++)d[i]=Math.random()*2-1;this.noise=b;
    this.apply();
    return true;
  },
  apply(){
    if(!this.ctx)return;const t=this.ctx.currentTime;
    this.master.gain.setTargetAtTime(Settings.muted?0:1,t,.03);
    this.music.gain.setTargetAtTime(Settings.music*.6,t,.05);
    this.sfxBus.gain.setTargetAtTime(Settings.sfx,t,.03);
  },
  ok(){return this.ctx&&this.ctx.state==='running'},
  unlock(){
    if(!this.init())return;
    if(this.ctx.state==='suspended'&&!document.hidden)this.ctx.resume().then(()=>{if(this.want)this.play(this.want)});
    else if(this.want)this.play(this.want);
  },

  // ---------- music ----------
  // Which theme's music to use: a preview overrides the saved theme (themes.js).
  themeId(){return this.previewing||(typeof S!=='undefined'&&S.theme)||'classic'},
  resolve(name){const th=typeof THEMES!=='undefined'&&THEMES.find(t=>t.id===this.themeId());return (th&&th.tracks&&th.tracks[name])||TRACKS[name]},
  play(name){
    this.want=name;
    const id=this.themeId()+':'+name;
    if(!this.ok()||this.trackId===id)return;
    this.track=name;this.trackId=id;const T=this.resolve(name);
    this.step=0;this.nextTime=this.ctx.currentTime+.06;
    this.delay.delayTime.setValueAtTime(60/T.bpm*.75,this.ctx.currentTime);
    if(!this.timer)this.timer=setInterval(()=>this.tick(),25);
  },
  stopMusic(){this.want=null;this.track=null;this.trackId=null},
  tick(){
    if(!this.track||!this.ok())return;
    const c=this.ctx,T=this.resolve(this.track),sp=60/T.bpm/4;
    if(this.nextTime<c.currentTime-.2)this.nextTime=c.currentTime+.02;
    while(this.nextTime<c.currentTime+.12){this.playStep(T,this.step,this.nextTime,sp);this.nextTime+=sp;this.step++}
  },
  playStep(T,step,t,sp){
    const bars=T.chords.length,bar=Math.floor(step/16)%bars,s=step%16,chord=T.chords[bar],root=chord[0];
    if(T.swing&&s%2)t+=sp*T.swing;                       // lo-fi swing: push off-beat 16ths late
    if(T.kick[s]==='x')this.kick(t,T.kickVol);
    if(T.snare[s]==='x')this.snare(t,T.snareVol);
    if(T.hat[s]!=='.')this.hat(t,T.hat[s]==='o',T.hatVol);
    if(T.crackle&&Math.random()<.4)this.noiseHit(t+Math.random()*sp,.012,.012+Math.random()*.025,2500);   // vinyl-style crackle
    const b=T.bass[s];
    if(b!=='.'){const n=b==='o'?root-12:b==='f'?root-5:root-24;this.voice(T.bassWave,mtof(n),t,sp*.9,.16,{cut:T.bassCut,cutEnd:T.bassCut*.4,q:T.bassQ||2})}
    const a=T.arp[s];
    if(a!=='.'){const i=+a,n=i===3?root+24:chord[i]+12;this.voice(T.arpWave,mtof(n),t,sp*.8,T.arpVol,{cut:T.arpCut,send:true})}
    if(T.pad&&s===0)chord.forEach(n=>{[-8,8].forEach(dt=>this.voice(T.padWave||'sawtooth',mtof(n),t,sp*16,T.padVol/2,{a:.35,cut:T.padCut||1100,detune:dt,send:true}))});
    const L=T.lead[step%(bars*16)];
    if(L)this.voice(T.leadWave,mtof(L),t,sp*T.leadLen,T.leadVol,{a:.01,cut:T.leadCut,q:T.leadQ,send:true,vib:true});
  },

  // ---------- synth voices ----------
  voice(type,f,t,dur,vol,o){
    o=o||{};const c=this.ctx,osc=c.createOscillator(),g=c.createGain();
    osc.type=type;osc.frequency.setValueAtTime(f,t);if(o.detune)osc.detune.value=o.detune;
    if(o.slide)osc.frequency.exponentialRampToValueAtTime(o.slide,t+dur);
    if(o.vib){const l=c.createOscillator(),lg=c.createGain();l.frequency.value=5.5;lg.gain.value=f*.006;l.connect(lg);lg.connect(osc.frequency);l.start(t);l.stop(t+dur+.05)}
    let node=osc;
    if(o.cut){const fl=c.createBiquadFilter();fl.type='lowpass';fl.frequency.setValueAtTime(o.cut,t);if(o.cutEnd)fl.frequency.exponentialRampToValueAtTime(o.cutEnd,t+dur);fl.Q.value=o.q||1;osc.connect(fl);node=fl}
    const a=o.a||.004;
    g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(Math.max(vol,.0002),t+a);g.gain.exponentialRampToValueAtTime(.0001,t+Math.max(dur,a+.01));
    node.connect(g);g.connect(o.bus||this.music);if(o.send)g.connect(this.delay);
    osc.start(t);osc.stop(t+dur+.05);
  },
  noiseHit(t,dur,vol,hp,bus){
    const c=this.ctx,s=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain();
    s.buffer=this.noise;f.type='highpass';f.frequency.value=hp;
    g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.0001,t+dur);
    s.connect(f);f.connect(g);g.connect(bus||this.music);s.start(t,Math.random()*.5);s.stop(t+dur+.02);
  },
  kick(t,v){this.voice('sine',150,t,.3,v||.55,{slide:42})},
  snare(t,v){v=v||.22;this.noiseHit(t,.16,v,1400);this.voice('triangle',190,t,.09,v*.7,{slide:110})},
  hat(t,open,v){v=v||.06;this.noiseHit(t,open?.16:.035,open?v*1.2:v,7000)},

  // ---------- sound effects ----------
  fx(fn){if(!this.ok())return;try{fn(this.ctx.currentTime,this.sfxBus)}catch(e){}},
  alarm(on){
    if(on&&!this.alarmTimer){sfx.alarm();this.alarmTimer=setInterval(()=>sfx.alarm(),1500)}
    if(!on&&this.alarmTimer){clearInterval(this.alarmTimer);this.alarmTimer=null}
  }
};

const V=(type,f,dt,dur,vol,o)=>Sound.fx((t,bus)=>Sound.voice(type,f,t+(dt||0),dur,vol,Object.assign({bus},o||{})));
const N=(dt,dur,vol,hp)=>Sound.fx((t,bus)=>Sound.noiseHit(t+(dt||0),dur,vol,hp,bus));
const sfx={
  key(){N(0,.018,.18,2500+Math.random()*2000);V('square',1600+Math.random()*900,0,.012,.025)},       // keyboard click
  select(){V('square',1320,0,.04,.05);V('square',1760,.04,.04,.04)},                                    // UI beep
  tick(){V('square',1975,0,.03,.04)},
  step(){N(0,.02,.04,4000)},
  hit(){V('square',880,0,.06,.08);V('square',1320,.05,.09,.07)},
  crit(){[880,1175,1760].forEach((f,i)=>V('square',f,i*.045,.08,.07));N(.12,.2,.12,5000)},
  shoot(){V('sawtooth',1400,0,.12,.05,{slide:300,cut:4000})},
  zap(){V('sawtooth',2400,0,.14,.06,{slide:200,cut:5000});N(0,.08,.12,6000)},
  boom(){V('sawtooth',160,0,.45,.18,{slide:35,cut:900});N(0,.35,.25,200)},
  hurt(){V('sawtooth',260,0,.32,.14,{slide:70,cut:1200});N(0,.12,.18,800)},
  granted(){V('square',988,0,.07,.07);V('square',1319,.08,.14,.07)},                                     // ACCESS GRANTED
  denied(){V('sawtooth',140,0,.34,.13,{cut:700});V('sawtooth',147,0,.34,.11,{cut:700})},                 // ACCESS DENIED buzz
  alarm(){[0,.18,.36,.54].forEach((dt,i)=>V('triangle',i%2?660:930,dt,.16,.09))},                        // low-health klaxon
  hack(){[523,659,784,1047,1319,1568].forEach((f,i)=>V('square',f,i*.06,.1,.06,{send:true}));          // "hack successful"
         N(0,.4,.08,3000);[1047,1319,1568].forEach(f=>V('sawtooth',f,.4,.7,.035,{a:.02,cut:3000}))},
  win(){sfx.hack()},
  lose(){[392,330,262,196].forEach((f,i)=>V('triangle',f,i*.14,.2,.09));V('sawtooth',90,.56,.5,.1,{cut:600})}
};

function toggleMute(){Settings.muted=!Settings.muted;saveSettings();Sound.unlock();Sound.apply();if(typeof App!=='undefined')App.hud()}

// Browsers only allow audio after a user gesture; also add a keyboard click to every button press.
['pointerdown','keydown'].forEach(ev=>document.addEventListener(ev,()=>Sound.unlock(),{capture:true}));
document.addEventListener('pointerdown',e=>{if(e.target.closest&&e.target.closest('button'))sfx.key()});
// Pause music in background tabs (timers get throttled there) and resume on return.
document.addEventListener('visibilitychange',()=>{if(!Sound.ctx)return;if(document.hidden)Sound.ctx.suspend();else Sound.ctx.resume()});
