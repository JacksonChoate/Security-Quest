// Security+ Quest: original pixel-art hacker minions (the 3 regular enemies before each boss).
// Each is a 12x14 grid (smaller than the 20x24 bosses), facing left toward the player, with 7 generated frames:
// 0-1 idle (bob + blink), 2 attack wind-up (prop glows), 3 strike (lunge + flash), 4-6 glitch-out death.
// All designs are original to this game.

const MIN_PX=5,MIN_W=12,MIN_H=14,MIN_FRAMES=7;
const MIN_BASE={k:'#030805',s:'#000000',w:'#ffffff',o:'#0b0f0d'};

const MINION_ART={
  // ---------- Domain 1: The Foundry ----------
  // Script-kiddie in a hoodie, hiding behind a laptop that shows a red config error.
  "Misconfig Mite":{acc:'#00e5ff',hand:[1,8],blink:{e:'s'},glow:{L:'#ffb3c5'},
    pal:{h:'#123a44',H:'#1e5c6b',e:'#00e5ff',l:'#8a9aa0',L:'#ff2e63',p:'#0a1418',b:'#16262c'},
    rows:["....kkkk....","...khhhhk...","..khhsshhk..","..khseeshk..","..khsssshk..","...khhhhk...","..khhHHhhk..",
          "kllllllhhk..","kLLLLLkhhk..","kLwLLLkhhk..","kLLLLLkhhk..","kkkkkkpppk..","....kpk.kpk.","....kbk.kbk."]},
  // Kid in a striped beanie dragging an oversized key with a crack through it.
  "Weak-Key Wisp":{acc:'#ffd23f',hand:[3,9],blink:{e:'s'},glow:{y:'#fff1a8',Y:'#ffd23f'},
    pal:{h:'#0f3d4a',H:'#00e5ff',e:'#00e5ff',y:'#ffd23f',Y:'#a8861f',c:'#000000',p:'#0a1418',b:'#16262c'},
    rows:["............","....kkkk....","...kHHHHk...","...khhhhk...","...kseesk...","...kssssk...","....khhk....",
          "...khhhhk...","..yykhhhhk..","yyyykhhhhk..","ycyy.khhk...","y.y..kppk...","....kpkkpk..","....kbkkbk.."]},
  // Pale ghost forger holding a forged certificate with a red seal.
  "Cert Phantom":{acc:'#00e5ff',hand:[2,8],blink:{e:'s'},glow:{r:'#ffffff',c:'#ffffff'},
    pal:{h:'#cfe9f0',H:'#ffffff',e:'#00e5ff',c:'#f5ecd0',r:'#ff2e63',t:'#8a7f60'},
    rows:["....kkkk....","...khhhhk...","..khhsshhk..","..khseeshk..","..khsssshk..","..khhhhhhk..","kkkkhHhhhhk.",
          "kccckhhhhhk.","kctckhhHhhk.","kcrckhhhhhk.","kkkkhhhhhk..","...khhhhhk..","...khkhkhk..","....k.k.k..."]},

  // ---------- Domain 2: The Badlands ----------
  // Phishing scammer in a cap with a fake ID badge, casting an email lure on a fishing line.
  "Phishling":{acc:'#ff5c8a',hand:[4,7],blink:{e:'s'},glow:{m:'#ffffff',M:'#ffb3c8'},
    pal:{h:'#3a1023',H:'#5c1a38',c:'#ff5c8a',e:'#ff5c8a',b:'#ffffff',i:'#ff5c8a',r:'#8a6a4a',l:'#c7c7d1',m:'#f5f5f5',M:'#ff5c8a',p:'#1a0a12',B:'#2a0d18'},
    rows:["r.....kkkk..","lr...kcccck.","l.r.kcccccck","l..r.kseesk.","l...rkssssk.","l....rkkkk..","l....kkhhhk.",
          "l...kkhbihk.","mmm.khhbbhk.","MmM.khhhhhk.","mMm.kkhhhkk.",".....kpkpk..",".....kpkpk..","....kkBkBkk."]},
  // Stocky thug with a padlock on his hoodie, swinging a heavy padlock.
  "Ransom Golem":{acc:'#ffd23f',hand:[3,10],blink:{e:'s'},glow:{y:'#fff1a8',Y:'#ffd23f'},
    pal:{h:'#2a0d18',H:'#4d1a2c',e:'#ff2e63',y:'#ffd23f',Y:'#a8861f',m:'#c7c7d1',p:'#140810',b:'#2a0d18'},
    rows:["...kkkkkk...","..khhhhhhk..","..khsssshk..","..khseeshk..","..khsssshk..",".kkhhhhhhkk.","khhhhyyhhhhk",
          "khhhyYYyhhhk",".mm.khhhhhhk","m..mkhhHhhhk","yyyykhhhhhhk","yYYykkkkkkk.","yyyy.kpp.kpk",".....kbk.kbk"]},
  // Hooded worm-spreader dragging a tangle of network cables, a plug in hand.
  "Worm Wyrm":{acc:'#00e5ff',hand:[1,8],blink:{e:'s'},glow:{c:'#b3f6ff',C:'#b3ffd9'},
    pal:{h:'#3a1023',H:'#ff5c8a',e:'#ff5c8a',c:'#00e5ff',C:'#3dff9a',g:'#c7c7d1',p:'#140810',b:'#2a0d18'},
    rows:["..kkkk......",".khhhhk.....","khhsshhk....","khseeshk....","khsssshk....",".khhhhk.....","kkHhhHhk....",
          "kghhhhhkcc..","kghhhhhccCc.",".khhhhkc.C.c",".khhhhk.cC.c",".kpkkpkc.Cc.",".kpk.kpk..Cc",".kbk.kbkcccC"]},

  // ---------- Domain 3: Cloud Citadel ----------
  // Hovering background-process gremlin with a gear hat, config pages drifting away from it.
  "Drift Daemon":{acc:'#a98bff',hand:[3,8],blink:{e:'s'},glow:{j:'#ffffff',g:'#e0d6ff'},
    pal:{h:'#2b2150',H:'#4a3b85',g:'#a98bff',e:'#ffd23f',d:'#e8e2ff',t:'#9d8fd6',j:'#00e5ff'},
    rows:["...k.kk.k...","...kggggk...","..kgkkkkgk..","...khhhhk...","..khseeshk..","..khsssshk..","...khhhhk...",
          "dd.khHHhhk..","dt.khHHhhk..","dd.khhhhhk..","...kkhhhkk..","....kjkjk...",".....j.j....","...d....j..."]},
  // Three cable-necked plug heads on one body with a switch-light chest: a flat network with no segments.
  "Flat-Net Hydra":{acc:'#a98bff',hand:[1,9],blink:{e:'s'},glow:{l:'#b3ffd9',e:'#ffffff'},
    pal:{h:'#2b2150',H:'#4a3b85',e:'#a98bff',c:'#9d8fd6',g:'#e8e2ff',l:'#00ff9c',p:'#120c22'},
    rows:["kgk.kgk.kgk.","kek.kek.kek.",".c...c...c..","..c..c..c...","...ckkkc....","...khhhhk...","..khhhhhhk..",
          "..khlllhhk..",".kkhhhhhhk..","kgkhHHHhhk..","...khhhhhk..","...kkkkkkk..","....kpk.kpk.","....kpk.kpk."]},
  // Ghost sysadmin clutching the one power plug everything depends on, sparks flying.
  "Single-Point Specter":{acc:'#ffd23f',hand:[2,7],blink:{e:'s'},glow:{z:'#ffffff',m:'#ffffff'},
    pal:{h:'#d9d0ff',H:'#ffffff',e:'#a98bff',m:'#c7c7d1',c:'#2b2150',z:'#ffd23f'},
    rows:["....kkkk....","...khhhhk...","..khsssshk..","..khessehk..","..khsssshk..","...khhhhk...","zz..khhhhk..",
          "mmmkhhHhhk..","mmmkhhhhhk..",".c.khhhhhk..",".c.khhhhhk..",".cckhhhhhk..","...khkhkhk..","....k.k.k..."]},

  // ---------- Domain 4: The SOC Depths ----------
  // Botnet drone: quad rotors, camera eye and a flashing red alert light.
  "Alert Swarm":{acc:'#ff2e63',hand:[4,7],blink:{r:'R',a:'A'},glow:{a:'#ffffff',e:'#ffffff'},
    pal:{m:'#4a5a52',M:'#8aa598',r:'#c7d1cc',R:'#4a5a52',e:'#3dff9a',a:'#ff2e63',A:'#5c0010'},
    rows:["............","rrrr....rrrr",".kk......kk.","..k..aa..k..","..kkkkkkkk..",".kMMMMMMMMk.",".kmmkeekmmk.",
          ".kmmkeekmmk.",".kMMMMMMMMk.","..kkkkkkkk..","...k.kk.k...","..k..kk..k..","............","............"]},
  // Rogue insider in an office jacket, an old badge on a lanyard that should have been revoked.
  "Stale Account Shade":{acc:'#3dff9a',hand:[1,9],blink:{e:'s'},glow:{b:'#ffffff',B:'#ff7a9a'},
    pal:{h:'#2a2a2a',e:'#3dff9a',w:'#b8c2bc',t:'#1f3328',l:'#3dff9a',b:'#8a948f',B:'#ff2e63',j:'#3a403d',p:'#1a1f1c'},
    rows:["....kkkk....","...khhhhk...","...khsssk...","...kseesk...","...kssssk...","....kkkk....","..kjjwwjjk..",
          ".kjjlwtljjk.",".kjjwltwjjk.",".kjjwbbwjjk.",".kjjwBBwjjk.","..kkkkkkkk..","...kpk.kpk..","..kkok.kokk."]},
  // Pointy-eared goblin snipping a hole out of the log printout.
  "Log Gap Goblin":{acc:'#3dff9a',hand:[4,8],blink:{e:'g'},glow:{x:'#ffffff',t:'#b3ffd9'},
    pal:{g:'#2f8a5a',h:'#1b2b22',e:'#ffd23f',l:'#e8f5ee',t:'#3dff9a',x:'#c7d1cc',p:'#0e1a14'},
    rows:["....kkkk....","...khhhhk...","..khhhhhhk..","ggkhgeeghkgg","..khgssghk..","...khhhhk...","lll.khhhk...",
          "ltl.khhhhk..","ltlxxkhhhk..","...x.khhhk..","lll..khhhk..","ltl.kpkkpk..","lll.kpk.kpk.","....kok.kok."]},

  // ---------- Domain 5: Governance Spire ----------
  // Unvetted vendor in a dark suit and hat, face in shadow, carrying a mystery briefcase.
  "Shadow Vendor":{acc:'#ffc94d',hand:[2,10],blink:{e:'s'},glow:{y:'#ffffff',e:'#fff1c2'},
    pal:{c:'#1e1a14',e:'#ffc94d',j:'#26262e',J:'#3a3a46',w:'#e8e2d0',t:'#ffc94d',q:'#6b4a1f',Q:'#8f6a32',y:'#ffd23f',p:'#14141a'},
    rows:["............","...kkkkkk...","..kcccccck..",".kkkkkkkkkk.","...kseesk...","...kssssk...","..kjjwwjjk..",
          ".kjjjwtjjjk.",".kJjjwtjjJk.",".kk.kjjjjk..","kqqkkjjjjk..","kQyQkjjjjk..","kqqqkpk.kpk.","kkkkkok.kok."]},
  // Ragged hooded wraith with a clipboard full of red marks.
  "Audit Wraith":{acc:'#ffc94d',hand:[2,9],blink:{e:'s'},glow:{t:'#ffffff',e:'#fff1c2'},
    pal:{h:'#2a2318',H:'#4a3d26',e:'#ffc94d',c:'#8f6a32',w:'#f2ead6',t:'#ff2e63',m:'#c7c7d1'},
    rows:[".....kk.....","....khhk....","...khhhhk...","..khsssshk..","..khseeshk..","..khsssshk..",".kkhhhhhhkk.",
          ".mm.khhHhhk.","kwwwkhhHhhk.","kwtwkhhhhhk.","kwwwkhhhhhk.","kkkkkhhhhk..","...khkhkhhk.","....k.k.k.k."]},
  // Big-eared grinning gremlin ripping a policy document in half.
  "Policy Gremlin":{acc:'#ffc94d',hand:[1,8],blink:{e:'g'},glow:{d:'#ffffff',t:'#fff1c2'},
    pal:{g:'#7a6a2a',G:'#a8923a',e:'#ffc94d',d:'#f2ead6',t:'#ffc94d',h:'#3d2a10',p:'#1e1a14'},
    rows:["............","gg..kkkk..gg",".ggkGGGGkgg.","..kgeggegk..","..kggggggk..","..kgswswgk..","...kkkkkk...",
          "dd.khhhhk.dd","dtdkhhhhkdtd","dd.khhhhk.dd","...khhhhk...","...kkkkkk...","...kpk.kpk..","...kok.kok.."]},

  // ---------- Bonus: The Neural Rift ----------
  // Tiny horned imp holding up a chat bubble with a blinking prompt.
  "Prompt Imp":{acc:'#ff9b4d',hand:[2,2],blink:{t:'b'},glow:{t:'#ffffff',b:'#ffffff'},
    pal:{i:'#4d2a0e',I:'#ff9b4d',e:'#ffffff',b:'#ffd9b0',t:'#ff2e63'},
    rows:["kkkkkk......","kbbbbk.I..I.","ktbttk.kkkk.","kkkkk.kiiiik","....k.kieeik","......kisisk",".....kkiiikk",
          "....kiiIiiik","....kiiIiiik",".....kiiiik.",".....kk.kkI.",".....kk.kk.I","............","............"]},
  // A walking database cylinder leaking toxic green training data.
  "Poisoned Dataset":{acc:'#3dff9a',hand:[1,5],blink:{e:'s'},glow:{g:'#b3ffd9',e:'#ffffff'},
    pal:{d:'#6b3a12',D:'#ff9b4d',r:'#2b1606',e:'#3dff9a',g:'#3dff9a',p:'#2b1606'},
    rows:["...kkkkkk...","..kDDDDDDk..",".kDDDgDDDDk.",".kddddddddk.",".kdseddsedk.",".kddddddddk.",".krrrrrrrrk.",
          ".kddgdddddk.",".kdgddddddk.",".krrrrrrrrk.",".kddddddgdk.","..kkkkkkgk..","...kpk.kpkg.","...kpk.kpk.."]}
};

const minionKey=name=>'n_'+name;
const hasMinionArt=name=>!!MINION_ART[name];

// One frame as a grid of hex colors (or null).
function minionFrame(name,f){
  const art=MINION_ART[name],R=rng(hashStr(name)+f*613),rp=a=>a[Math.floor(R()*a.length)];
  const pal=Object.assign({},MIN_BASE,art.pal);
  let rows=art.rows.map(r=>[...r.padEnd(MIN_W,'.').slice(0,MIN_W)]);
  if(f===1){   // idle bob: upper body dips a pixel, eyes blink
    const top=Math.round(MIN_H*.55);
    for(let y=top;y>0;y--)rows[y]=rows[y-1].slice();rows[0]=Array(MIN_W).fill('.');
    if(art.blink)rows=rows.map(r=>r.map(c=>art.blink[c]||c));
  }
  const col=ch=>ch==='.'?null:(f===2&&art.glow&&art.glow[ch])?art.glow[ch]:(pal[ch]||null);
  let grid=rows.map(r=>r.map(col));
  const [hx,hy]=art.hand;
  const put=(g,x,y,c)=>{if(y>=0&&y<MIN_H&&x>=0&&x<MIN_W)g[y][x]=c};
  if(f===2)put(grid,hx,hy,'#ffffff');
  if(f===3){   // strike: lunge one pixel toward the player and flash from the hand
    grid=grid.map(r=>r.slice(1).concat([null]));
    [[0,0],[-1,0],[0,-1],[0,1],[-2,0]].forEach(([dx,dy])=>put(grid,hx-1+dx,hy+dy,dx===0&&dy===0?'#ffffff':art.acc));
  }
  if(f>=4){    // glitch-out death
    const k=f-4,s=[1,2,4][k],corrupt=[.15,.3,.45][k],drop=[0,.25,.55][k],glitch=['#ff2e63','#00e5ff','#ffffff','#00ff9c'];
    grid=grid.map(row=>{
      const sh=Math.round((R()*2-1)*s),out=Array(MIN_W).fill(null);
      row.forEach((c,x)=>{if(!c||R()<drop)return;const nx=x+sh;if(nx<0||nx>=MIN_W)return;out[nx]=R()<corrupt?rp(glitch):c});
      return out;
    });
  }
  return grid;
}

// Builds one minion's spritesheet and its idle / attack / death animations.
function minionSheet(scene,name){
  const key=minionKey(name);if(scene.textures.exists(key))return key;
  const fw=MIN_W*MIN_PX,fh=MIN_H*MIN_PX,g=scene.make.graphics({x:0,y:0},false);
  for(let f=0;f<MIN_FRAMES;f++)minionFrame(name,f).forEach((row,y)=>row.forEach((c,x)=>{if(c){g.fillStyle(hexNum(c),1);g.fillRect(f*fw+x*MIN_PX,y*MIN_PX,MIN_PX,MIN_PX)}}));
  g.generateTexture(key,fw*MIN_FRAMES,fh);g.destroy();
  const tex=scene.textures.get(key);for(let f=0;f<MIN_FRAMES;f++)tex.add(f,0,f*fw,0,fw,fh);
  const fr=l=>l.map(frame=>({key,frame}));
  scene.anims.create({key:key+'_idle',frames:fr([0,0,0,1,1]),frameRate:4,repeat:-1});
  scene.anims.create({key:key+'_atk',frames:fr([2,2,3,3,0]),frameRate:12,repeat:0});
  scene.anims.create({key:key+'_die',frames:fr([4,0,4,5,4,5,6,6]),frameRate:14,repeat:0});
  return key;
}
