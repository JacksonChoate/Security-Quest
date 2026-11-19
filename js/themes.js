// Security+ Quest: theme presets. Each one changes the color scheme and the music together.
// All tracks are original compositions, synthesized live by audio.js (no audio files, no existing songs).
// Track format: see TRACKS in audio.js. Extra options used here: kickVol/snareVol/hatVol, swing, crackle, padCut.

const THEMES=[
  // ---------- Classic Terminal: green on black, moody synthwave (the original music) ----------
  {id:'classic',name:'Classic Terminal',req:{lvl:1},desc:'Green on black with moody synthwave.',
    sw:['#000000','#00ff9c','#00e5ff','#c9ffe6'],rain:'#00ff9c',bg:'#000000',
    tracks:null},   // null = use TRACKS from audio.js

  // ---------- Ghost Protocol: grey and pale green, lo-fi chill for long study sessions ----------
  {id:'ghost',name:'Ghost Protocol',req:{lvl:1},desc:'Soft grey and pale green with lo-fi chill beats for long study sessions.',
    sw:['#101312','#a8d5b5','#c9d1cc','#e8efe9'],rain:'#7fa58c',bg:'#0c0f0e',
    tracks:{
      map:{bpm:74,swing:.18,crackle:true,kickVol:.32,snareVol:.09,hatVol:.025,
        chords:[ch('F3','A3','C4','E4'),ch('E3','G3','B3','D4'),ch('D3','F3','A3','C4'),ch('C3','E3','G3','B3')],
        kick:"x.........x.....",snare:"....x.......x...",hat:"x.x.x.x.x.x.x.x.",
        bass:"x.....x...x.....",bassWave:'triangle',bassCut:500,
        arp:"0...2...1...3...",arpWave:'triangle',arpVol:.04,arpCut:1500,
        pad:true,padVol:.05,padWave:'triangle',padCut:900,
        lead:mel("E4 - - - - - D4 C4 | B3 - - - - - - - | A3 - C4 - - E4 - - | G4 - - - - - - -"),leadWave:'triangle',leadVol:.06,leadLen:4,leadCut:1800},
      battle:{bpm:86,swing:.2,crackle:true,kickVol:.38,snareVol:.11,hatVol:.03,
        chords:[ch('D3','F3','A3','C4'),ch('G3','B3','D4','F4'),ch('C3','E3','G3','B3'),ch('A3','C4','E4','G4')],
        kick:"x.....x...x.....",snare:"....x.......x...",hat:"x.x.x.x.x.x.x.xo",
        bass:"x.....x.o...x...",bassWave:'triangle',bassCut:600,
        arp:"0.1.2.1.0.1.2.3.",arpWave:'triangle',arpVol:.035,arpCut:1800,
        pad:true,padVol:.045,padWave:'triangle',padCut:1000,
        lead:mel("A4 - C5 - D5 - - C5 | B4 - - - G4 - - - | E4 - G4 - B4 - - A4 | G4 - - - E4 - - -"),leadWave:'triangle',leadVol:.06,leadLen:2,leadCut:2000},
      boss:{bpm:96,swing:.15,crackle:true,kickVol:.45,snareVol:.13,hatVol:.035,
        chords:[ch('A3','C4','E4','G4'),ch('F3','A3','C4','E4'),ch('D3','F3','A3','C4'),ch('E3','G#3','B3','D4')],
        kick:"x..x..x...x..x..",snare:"....x.......x..x",hat:"xxx.xxx.xxx.xxx.",
        bass:"x..x..o...x..x..",bassWave:'square',bassCut:700,
        arp:"0123012301230123",arpWave:'triangle',arpVol:.035,arpCut:2000,
        pad:true,padVol:.045,padWave:'triangle',padCut:1100,
        lead:mel("E5 - C5 - A4 - B4 C5 | A4 - F4 - C5 - - B4 | A4 - D5 - F5 - E5 D5 | G#4 - B4 - D5 - E5 -"),leadWave:'square',leadVol:.045,leadLen:2,leadCut:1600}
    }},

  // ---------- Ice Breaker: cyan and white on deep blue, cold ambient electronic ----------
  {id:'ice',name:'Ice Breaker',req:{lvl:3},desc:'Cyan and white on deep blue with cold ambient electronic.',
    sw:['#020a18','#5ee6ff','#ffffff','#e6f6ff'],rain:'#5ee6ff',bg:'#020a18',
    tracks:{
      map:{bpm:80,kickVol:.3,snareVol:.08,hatVol:.025,
        chords:[ch('D4','F4','A4'),ch('Bb3','D4','F4'),ch('F3','A3','C4'),ch('C4','E4','G4')],
        kick:"x...............",snare:"................",hat:"....x.......x...",
        bass:"x.......x.......",bassWave:'triangle',bassCut:600,
        arp:"0..1..2..3..2..1",arpWave:'sine',arpVol:.06,arpCut:4000,
        pad:true,padVol:.06,padWave:'triangle',padCut:1600,
        lead:mel("D5 - - - A4 - - - | F5 - - - D5 - - - | E5 - - - C5 - - - | G5 - - - E5 - - -"),leadWave:'sine',leadVol:.07,leadLen:6},
      battle:{bpm:112,kickVol:.45,snareVol:.15,hatVol:.04,
        chords:[ch('D4','F4','A4'),ch('C4','E4','G4'),ch('Bb3','D4','F4'),ch('A3','C#4','E4')],
        kick:"x.......x.x.....",snare:"....x.......x...",hat:"x.x.x.x.x.x.x.x.",
        bass:"x.x.xo.xx.x.xo.x",bassWave:'square',bassCut:800,
        arp:"0123012301230123",arpWave:'triangle',arpVol:.05,arpCut:5000,
        pad:true,padVol:.04,padWave:'triangle',padCut:1800,
        lead:mel("D5 - F5 A5 - G5 F5 E5 | C5 - E5 G5 - F5 E5 D5 | Bb4 - D5 F5 - E5 D5 C5 | C#5 - E5 - A5 - G5 -"),leadWave:'triangle',leadVol:.07,leadLen:2},
      boss:{bpm:134,kickVol:.55,snareVol:.2,hatVol:.05,
        chords:[ch('D4','F4','A4'),ch('Eb4','G4','Bb4'),ch('D4','F4','A4'),ch('A3','C#4','E4')],
        kick:"x..x..x.x..x..x.",snare:"....x..x....x..x",hat:"xxxxxxxxxxxxxxxx",
        bass:"xoxoxoxoxoxoxoxo",bassWave:'sawtooth',bassCut:900,bassQ:5,
        arp:"0321032103210321",arpWave:'square',arpVol:.04,arpCut:3500,
        pad:true,padVol:.035,padWave:'sawtooth',padCut:1400,
        lead:mel("D5 - A5 - G5 F5 E5 - | Eb5 - Bb5 - A5 G5 F5 - | D5 F5 A5 D6 - C6 A5 - | C#5 - E5 - G5 - A5 -"),leadWave:'square',leadVol:.05,leadLen:2,leadCut:3200}
    }},

  // ---------- Neon Grid: pink and purple on dark navy, upbeat retro synthwave ----------
  {id:'neon',name:'Neon Grid',req:{lvl:5},desc:'Pink and purple on dark navy with upbeat retro synthwave.',
    sw:['#0b0820','#ff4fd8','#a98bff','#ffe6fb'],rain:'#ff4fd8',bg:'#0b0820',
    tracks:{
      map:{bpm:104,
        chords:[ch('C4','E4','G4'),ch('G3','B3','D4'),ch('A3','C4','E4'),ch('F3','A3','C4')],
        kick:"x.......x.......",snare:"....x.......x...",hat:"..x...x...x...x.",
        bass:"x.xox.xox.xox.xo",bassWave:'sawtooth',bassCut:1200,
        arp:"0123012301230123",arpWave:'square',arpVol:.045,arpCut:3500,
        pad:true,padVol:.045,
        lead:mel("E5 - G5 - C6 - B5 G5 | D5 - G5 - B5 - A5 G5 | C5 - E5 - A5 - G5 E5 | F5 - A5 - C6 - B5 -"),leadWave:'square',leadVol:.06,leadLen:2,leadCut:4000},
      battle:{bpm:128,
        chords:[ch('F3','A3','C4'),ch('G3','B3','D4'),ch('E3','G3','B3'),ch('A3','C4','E4')],
        kick:"x...x...x...x...",snare:"....x.......x...",hat:"x.x.x.x.x.x.x.xo",
        bass:"xoxoxoxoxoxoxoxo",bassWave:'sawtooth',bassCut:1500,
        arp:"0123321001233210",arpWave:'square',arpVol:.045,arpCut:4000,
        pad:true,padVol:.035,
        lead:mel("A5 G5 F5 G5 A5 - C6 - | B5 A5 G5 A5 B5 - D6 - | G5 F5 E5 F5 G5 - B5 - | A5 - E5 - C5 - E5 -"),leadWave:'square',leadVol:.055,leadLen:1,leadCut:4200},
      boss:{bpm:148,
        chords:[ch('A3','C4','E4'),ch('F3','A3','C4'),ch('G3','B3','D4'),ch('E3','G#3','B3')],
        kick:"x.x.x.x.x.x.x.x.",snare:"....x.......x.x.",hat:"xxxxxxxxxxxxxxxx",
        bass:"xoxoxoxoxoxoxfxo",bassWave:'sawtooth',bassCut:1600,bassQ:4,
        arp:"0123012301230123",arpWave:'sawtooth',arpVol:.04,arpCut:3500,
        pad:true,padVol:.035,padWave:'sawtooth',
        lead:mel("A5 - C6 - E6 - D6 C6 | F5 - A5 - C6 - B5 A5 | G5 - B5 - D6 - C6 B5 | G#5 - B5 - E6 - D6 -"),leadWave:'square',leadVol:.05,leadLen:1,leadCut:3800}
    }},

  // ---------- Red Team: red and orange on black, aggressive fast industrial ----------
  {id:'red',name:'Red Team',req:{lvl:7},desc:'Red and orange on black with an aggressive, fast industrial beat.',
    sw:['#050000','#ff3b2e','#ff9b4d','#ffe6e0'],rain:'#ff3b2e',bg:'#050000',
    tracks:{
      map:{bpm:96,kickVol:.6,snareVol:.28,hatVol:.05,
        chords:[ch('E3','G3','B3'),ch('C3','E3','G3'),ch('E3','G3','B3'),ch('D3','F#3','A3')],
        kick:"x...x...x...x..x",snare:"........x.......",hat:"..x...x...x...x.",
        bass:"x..x..x.x..x..x.",bassWave:'sawtooth',bassCut:400,bassQ:8,
        arp:"0.0.1.0.2.0.1.0.",arpWave:'square',arpVol:.035,arpCut:1800,
        pad:true,padVol:.03,padWave:'sawtooth',padCut:700,
        lead:mel("E4 - - G4 - F#4 E4 - | C4 - - E4 - D4 C4 - | E4 - B4 - A4 - G4 - | F#4 - - A4 - - D4 -"),leadWave:'sawtooth',leadVol:.05,leadLen:2,leadCut:1500},
      battle:{bpm:140,kickVol:.65,snareVol:.3,hatVol:.05,
        chords:[ch('E3','G3','B3'),ch('E3','G3','B3'),ch('C3','E3','G3'),ch('D3','F#3','A3')],
        kick:"x.x.x.x.x.x.x.xx",snare:"....x.......x...",hat:"xxxxxxxxxxxxxxxx",
        bass:"xxxoxxxoxxfoxxxo",bassWave:'sawtooth',bassCut:650,bassQ:10,
        arp:"0102010201020103",arpWave:'square',arpVol:.035,arpCut:2200,
        pad:false,
        lead:mel("E5 E5 - E5 G5 - E5 D5 | E5 E5 - E5 B5 - A5 G5 | C5 C5 - C5 E5 - D5 C5 | D5 - F#5 - A5 - B5 -"),leadWave:'square',leadVol:.05,leadLen:1,leadCut:2600,leadQ:3},
      boss:{bpm:166,kickVol:.7,snareVol:.32,hatVol:.05,
        chords:[ch('E3','G3','B3'),ch('F3','A3','C4'),ch('E3','G3','B3'),ch('B2','D#3','F#3')],
        kick:"x.xxx.xxx.xxx.xx",snare:"....x..x....x.xx",hat:"xxxxxxxxxxxxxxxo",
        bass:"xoxoxfxoxoxoxfxo",bassWave:'sawtooth',bassCut:900,bassQ:12,
        arp:"0123012301230123",arpWave:'sawtooth',arpVol:.035,arpCut:2000,
        pad:true,padVol:.03,padWave:'sawtooth',padCut:900,
        lead:mel("E5 - B5 - A5 G5 F#5 E5 | F5 - C6 - B5 A5 G5 F5 | E5 G5 B5 E6 - D6 B5 G5 | D#5 - F#5 - B5 - A5 -"),leadWave:'sawtooth',leadVol:.05,leadLen:1,leadCut:2400,leadQ:6}
    }}
];

const themeById=id=>THEMES.find(t=>t.id===id)||THEMES[0];
const themeUnlocked=t=>level()>=t.req.lvl;
const curTheme=()=>themeById(S.theme);

// Apply the saved theme: page colors (CSS), canvas background/falling code, and music.
function applyTheme(){
  let t=curTheme();if(!themeUnlocked(t)){S.theme='classic';t=THEMES[0]}
  document.body.dataset.theme=t.id;
  NEON.green=t.rain;                       // falling-code color on the map and in battles
  if(App.game)App.game.scene.getScenes(true).forEach(s=>s.cameras&&s.cameras.main.setBackgroundColor(t.bg));
  Sound.trackId=null;if(Sound.want)Sound.play(Sound.want);   // switch the music now
}
