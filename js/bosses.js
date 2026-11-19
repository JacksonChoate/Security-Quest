// Security+ Quest: original pixel-art boss villains, one per zone, plus the Rematch "echo".
// Each boss is a 20x24 grid (left halves mirrored to full width) with 7 generated frames:
// 0-1 idle (breathing bob, eye flicker, animated glitch noise), 2-3 attack (charge, strike),
// 4-6 glitch-out death (rows tear sideways, colors corrupt, pixels drop out).
// All designs are original to this game.

const BOSS_PX=5,BOSS_W=20,BOSS_H=24,BOSS_FRAMES=7;

const BOSS_ART={
  // Domain 1, The Foundry: a robed legacy tech-priest with a cracked CRT head and an open padlock crown.
  "The Unpatched Archon":{acc:'#00e5ff',hand:[1,18],blink:{e:'E'},
    pal:{k:'#02070a',a:'#0d2a33',A:'#1a4d5c',m:'#6b7f86',M:'#3a4a50',s:'#001014',e:'#ff2e63',E:'#ffb3c5',t:'#00e5ff',y:'#9fb3ba'},
    rows:["......kyyy",".....ky...",".....ky...","...kkkkkkk","...kMmmmmm","...kmkkkkk","...kmkssss","...kmksees","...kmkssss","...kmksstt","...kmkkkkk","...kMmmmmm",
          "....kkkkMM","..kkaaAAtk",".kaaaAAAta","kaaaaAAAta","kaakaAAAta","kaakaaAAta","kmmkaaaAta",".kk.aaaAta","...kaaaAta","...kaaaata","..kaaaaata","..kkkkkkkk"]},

  // Domain 2, The Badlands: a ransomware gang boss in a spiked jacket, face lost behind live static.
  "The Ransom Baron":{acc:'#ff5c8a',hand:[2,17],noise:['#ffffff','#9a9aa8','#ff5c8a','#000000','#00e5ff'],
    pal:{k:'#070205',h:'#ff5c8a',j:'#2a0d18',J:'#4d1a2c',m:'#c7c7d1',c:'#ffd23f',p:'#140810'},
    rows:[".........h","........hh","......kkhh",".....knnnn",".....knnnn",".....knnnn",".....knnnn","......knnn",".......kkk","...m..kjjj","..mmkkjJjc",".kjjjjJjcj",
          "kjjjjJJjjc","kjjkjJJjcj","kjjkjJjjjc","kjjkjJjjcj","kjjkjJjjjj","kkmkjJjjjj","kmmkkkkkkk","....kpppkp","....kpppk.","....kpppk.","...kmmmmk.","...kkkkkk."]},

  // Domain 3, Cloud Citadel: an armored titan with a storm-cloud helm and a blinking server rack for a chest.
  "The Outage Titan":{acc:'#a98bff',hand:[1,17],blink:{l:'L',L:'l'},
    pal:{k:'#05030a',c:'#d9d0ff',C:'#9d8fd6',a:'#2b2150',A:'#4a3b85',r:'#0b0716',l:'#00ff9c',L:'#ff2e63',v:'#a98bff'},
    rows:["....kkk...","...kccck.k","..kcccckkc","..kcccccCc","..kccCccCC","...kkkkkkk","...kavvvvv","...kakkkkk","....kaaaaa","..kkkAAkkk",".kAAAkkrrr","kAAaakrlrL",
          "kaaaakrrrr","kaaaakrLrl","kaakakrrrr","kaakakrlrL","kAAkakkkkk","kAAkaaaaaa","kkkkaaAaaa","...kaaaka.","...kaaak..","...kAAAk..","..kAAAAk..","..kkkkkk.."]},

  // Domain 4, The SOC Depths: an insider operator in a balaclava, quad night-vision goggles and a headset, palming a USB stick.
  "Ghost Operator":{acc:'#3dff9a',hand:[1,16],blink:{g:'G2'},
    pal:{k:'#010503',b:'#1b2b22',d:'#0e1a14',g:'#3dff9a',G:'#4a5a52',G2:'#0d5c36',v:'#1f3328',V:'#2f4d3c',p:'#13221a',m:'#8aa598',u:'#ffd23f'},
    rows:["......kkkk",".....kbbbb","....kbbbbb","....kddddd","...mkGgGgG","...mkGgGgG","...mkddddd","...m.kdddd","....mkdddd","......kkkk","..kkkvvvvv",".kvvvvpVpv",
          "kvvkvvpVpv","kvvkvvvvvv","kvvkvppvvv","kvvkvppvvv","kuukvvvvvv","kddkkkkkkk","....kdddkd","....kdddk.","....kdddk.","....kdddk.","...kGGGGk.","...kkkkkk."]},

  // Domain 5, Governance Spire: a rogue sysadmin in a trench coat, collar up, amber shades and a stolen badge.
  "The Rogue Sysadmin":{acc:'#ffc94d',hand:[1,16],blink:{o:'O'},
    pal:{k:'#070502',h:'#2a1d10',s:'#b8875a',o:'#ffc94d',O:'#fff1c2',t:'#6b4a1f',T:'#8f6a32',c:'#3d2a10',w:'#e8e2d0',i:'#ff2e63',b:'#ffffff',p:'#1e1a14'},
    rows:["......kkkk",".....khhhh",".....khhhh",".....kssss",".....koooo",".....kssss","......ksss","..kcc.kkss","..kccckwww",".kTttckwiw","kTtttckwiw","kTtttckwbw",
          "kTttktkwww","kTttktkkkk","kTttkttttt","kTttkttTtt","kssktttTtt","kkkktttTtt","...ktttTtt","...kttttk.","...kttttk.","....kppk..","...kkppk..","...kkkkk.."]},

  // Bonus, The Neural Rift: a corrupted AI avatar, one huge eye under a halo, its body shedding fragments.
  "Rogue Model":{acc:'#ff9b4d',hand:[2,16],blink:{e:'O'},
    pal:{k:'#0a0400',f:'#2b1606',F:'#4d2a0e',o:'#ff9b4d',O:'#ffd9b0',e:'#ffffff',r:'#ff9b4d',x:'#ff9b4d'},
    rows:["...rrrrrrr","..r.......","...rrkkkkk","....kFFFFF","...kFfffff","...kffoooo","...kfoOOee","...kfoOOee","...kffoooo","...kfffkkf","....kffoof",".....kkfff",
          "..x..kooFF",".x.kkfoFfF","x.kffffOff","..kff.foff",".kfo..kfoF",".kk..x.kff","x.....x.ko","...x....ko","......x..o","....x....x","........x.","......x..."]},

  // Rematch: a red, corrupted echo of the player's own hacker.
  "Echo of Mistakes":{acc:'#ff2e63',hand:[3,17],blink:{v:'V'},
    pal:{k:'#120004',h:'#3a0712',H:'#5c0f1f',s:'#000000',v:'#ff2e63',V:'#ffc2cf',d:'#5c0010',g:'#ff2e63',p:'#1f0309',b:'#3a0712',L:'#ff2e63',l:'#5c0010','*':'#ffffff'},
    grid:()=>Array(6).fill('.'.repeat(20)).concat(hackerRows(0).map(r=>'..'+r+'..'))}
};

function bossBase(art){
  if(art.grid)return art.grid();
  return art.rows.map(h=>{h=h.padEnd(10,'.').slice(0,10);return h+rev(h)});
}

// Returns a 24-row grid of hex colors (or null) for one frame.
function bossFrame(name,f){
  const art=BOSS_ART[name],R=rng(hashStr(name)+f*977);
  const rp=a=>a[Math.floor(R()*a.length)];
  let rows=bossBase(art).map(r=>[...r]);
  // animated static and flickering fragments
  rows=rows.map(r=>r.map(ch=>ch==='n'?'#'+rp(art.noise).slice(1):ch==='x'?(R()<.7?'x':'.'):ch));
  if(f===1){
    for(let y=13;y>0;y--)rows[y]=rows[y-1].slice();rows[0]=Array(BOSS_W).fill('.');
    if(art.blink)rows=rows.map(r=>r.map(c=>art.blink[c]||c));
  }
  let grid=rows.map(r=>r.map(ch=>ch==='.'?null:ch[0]==='#'?ch:(art.pal[ch]||null)));
  if(art.blink&&f===1)grid=rows.map(r=>r.map(ch=>ch==='.'?null:ch[0]==='#'?ch:(art.pal[ch]||null)));
  const [hx,hy]=art.hand;
  const put=(x,y,c)=>{if(y>=0&&y<BOSS_H&&x>=0&&x<BOSS_W)grid[y][x]=c};
  if(f===2){   // charge: glowing orb in the hand, eyes flare
    [[0,0],[-1,0],[0,-1],[-1,-1]].forEach(([dx,dy])=>put(hx+dx,hy+dy,art.acc));put(hx,hy,'#ffffff');
  }
  if(f===3){   // strike: bigger burst thrown toward the player (left)
    for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=1;dx++)if(Math.abs(dx)+Math.abs(dy)<4)put(hx+dx,hy+dy,art.acc);
    put(hx-1,hy,'#ffffff');put(hx,hy,'#ffffff');
  }
  if(f>=4){    // glitch-out death
    const k=f-4,s=[1,3,5][k],corrupt=[.12,.28,.45][k],drop=[0,.22,.5][k],glitch=['#ff2e63','#00e5ff','#ffffff','#00ff9c'];
    grid=grid.map(row=>{
      const sh=Math.round((R()*2-1)*s),out=Array(BOSS_W).fill(null);
      row.forEach((c,x)=>{if(!c||R()<drop)return;const nx=x+sh;if(nx<0||nx>=BOSS_W)return;out[nx]=R()<corrupt?rp(glitch):c});
      return out;
    });
  }
  return grid;
}

const bossKey=name=>'b_'+name;
const hasBossArt=name=>!!BOSS_ART[name];

// Builds the spritesheet and the idle / attack / death animations for one boss.
function bossSheet(scene,name){
  const key=bossKey(name);if(scene.textures.exists(key))return key;
  const fw=BOSS_W*BOSS_PX,fh=BOSS_H*BOSS_PX,g=scene.make.graphics({x:0,y:0},false);
  for(let f=0;f<BOSS_FRAMES;f++)bossFrame(name,f).forEach((row,y)=>row.forEach((c,x)=>{if(c){g.fillStyle(hexNum(c),1);g.fillRect(f*fw+x*BOSS_PX,y*BOSS_PX,BOSS_PX,BOSS_PX)}}));
  g.generateTexture(key,fw*BOSS_FRAMES,fh);g.destroy();
  const tex=scene.textures.get(key);for(let f=0;f<BOSS_FRAMES;f++)tex.add(f,0,f*fw,0,fw,fh);
  const fr=l=>l.map(frame=>({key,frame}));
  scene.anims.create({key:key+'_idle',frames:fr([0,0,1,1]),frameRate:3,repeat:-1});
  scene.anims.create({key:key+'_atk',frames:fr([2,2,3,3,3,2]),frameRate:12,repeat:0});
  scene.anims.create({key:key+'_die',frames:fr([4,0,4,5,4,5,6,5,6,6]),frameRate:14,repeat:0});
  return key;
}
