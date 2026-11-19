// Security+ Quest: Boot scene. Generates every texture procedurally (no image files needed).

function gridTexture(scene,key,grid,px){
  if(scene.textures.exists(key))return key;
  const g=scene.make.graphics({x:0,y:0},false);
  grid.forEach((row,y)=>row.forEach((c,x)=>{if(c){g.fillStyle(hexNum(c),1);g.fillRect(x*px,y*px,px,px)}}));
  g.generateTexture(key,grid[0].length*px,grid.length*px);g.destroy();
  return key;
}
// Monster texture for an enemy name; generated once and cached by Phaser.
function monsterTex(scene,name,color,boss){return gridTexture(scene,'m_'+name,monsterGrid(name,color,boss),8)}

class BootScene extends Phaser.Scene{
  constructor(){super('Boot')}
  create(){
    // Hacker spritesheet: 7 frames side by side, 5px per pixel (80x90 per frame).
    // idle = hood sway + visor flicker, walk, type = attack. Uses the equipped outfit (meta.js).
    buildHacker(this.textures,this.anims);

    const g=this.make.graphics({x:0,y:0},false);
    // particle: small square
    g.fillStyle(0xffffff,1);g.fillRect(0,0,6,6);g.generateTexture('px',6,6);g.clear();
    // soft glow dot
    for(let r=16;r>0;r-=2){g.fillStyle(0xffffff,0.06+(16-r)*0.012);g.fillCircle(16,16,r)}
    g.generateTexture('glow',32,32);g.clear();
    // projectile bolt
    g.fillStyle(0x00ff9c,1);g.fillRect(0,4,22,6);g.fillStyle(0xb8ffe0,1);g.fillRect(12,5,10,4);g.fillStyle(0xffffff,1);g.fillRect(18,6,4,2);
    g.generateTexture('bolt',22,14);g.clear();
    // enemy orb attack
    g.fillStyle(0xff2e63,1);g.fillCircle(9,9,9);g.fillStyle(0xffc2cf,1);g.fillCircle(7,7,4);
    g.generateTexture('orb',18,18);g.clear();
    // server rack (Packet Defender)
    g.fillStyle(0x16213a,1);g.fillRect(0,0,64,120);g.lineStyle(2,0x5ee6ff,1);g.strokeRect(1,1,62,118);
    for(let i=0;i<5;i++){g.fillStyle(0x0a1222,1);g.fillRect(6,8+i*22,52,16);g.fillStyle(i%2?0x3dff9a:0x5ee6ff,1);g.fillRect(10,14+i*22,6,4);g.fillRect(20,14+i*22,6,4)}
    g.generateTexture('server',64,120);g.clear();
    // terminal kiosk (overworld)
    g.fillStyle(0x0a1222,1);g.fillRect(4,0,48,36);g.lineStyle(2,0xffffff,1);g.strokeRect(5,1,46,34);
    g.fillStyle(0xffffff,0.85);g.fillRect(10,8,22,3);g.fillRect(10,15,30,3);g.fillRect(10,22,16,3);
    g.fillStyle(0x25335a,1);g.fillRect(22,36,12,10);g.fillRect(10,46,36,6);
    g.generateTexture('kiosk',56,52);g.clear();
    // floor tile: transparent neon grid with a circuit trace, so falling code shows through
    g.lineStyle(1,0x00ff9c,.18);g.strokeRect(0,0,48,48);
    g.fillStyle(0x00e5ff,.22);g.fillRect(22,0,2,14);g.fillRect(22,14,14,2);g.fillCircle(36,15,2);
    g.generateTexture('floor',48,48);g.clear();
    // terminal panel behind portals
    g.fillStyle(0x000000,.75);g.fillRect(0,0,150,150);g.lineStyle(1,0x00ff9c,.35);g.strokeRect(.5,.5,149,149);
    g.fillStyle(0x00ff9c,.6);g.fillRect(0,0,10,2);g.fillRect(0,0,2,10);g.fillRect(140,148,10,2);g.fillRect(148,140,2,10);
    g.generateTexture('frame',150,150);g.destroy();

    DOMAINS.forEach(d=>d.enemies.forEach(n=>hasMinionArt(n)?minionSheet(this,n):monsterTex(this,n,d.color,false)));   // hacker minions
    Object.keys(BOSS_ART).forEach(n=>bossSheet(this,n));   // boss villains: idle, attack, death anims

    App.ready();
  }
}
