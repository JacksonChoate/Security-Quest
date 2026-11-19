// Security+ Quest: HTML modes shown without the game canvas.
// Acronym/Port Blitz, PBQ Lab, Flashcards, Objectives heatmap, Codex. (Practice exams: exam.js)

const Modes={
  // ---------- Blitz ----------
  blitz(mode){
    const BL=Modes.BL={mode,time:60,score:0,streak:0,done:false,item:null,lock:false};
    Modes.blitzNext();Modes.renderBlitz();
    App.every(100,()=>{
      if(BL.done)return;BL.time=Math.max(0,BL.time-.1);
      const t=document.getElementById('tbar');if(t){t.style.width=(100*BL.time/60)+'%';document.getElementById('tnum').textContent=Math.ceil(BL.time)}
      if(BL.time<=0)Modes.blitzEnd();
    });
    UI.keyHandler=e=>{const n='1234'.indexOf(e.key);if(n>=0)Modes.blitzAns(n)};
  },
  blitzNext(){
    const BL=Modes.BL;let prompt,right,opts;
    if(BL.mode==='acr'){const it=pick(ACR);prompt=it[0];right=it[1];opts=[right].concat(shuffle(ACR.filter(x=>x!==it)).slice(0,3).map(x=>x[1]))}
    else{const it=pick(PORTS);const rev=Math.random()<.5;prompt=rev?it[1]:'Port '+it[0];right=rev?it[0]:it[1];opts=[right].concat(shuffle(PORTS.filter(x=>x!==it)).slice(0,3).map(x=>rev?x[0]:x[1]))}
    BL.item={prompt,right,opts:shuffle(opts)};BL.flash=null;BL.lock=false;
  },
  blitzAns(i){
    const BL=Modes.BL;if(BL.done||BL.lock)return;BL.lock=true;
    const ok=BL.item.opts[i]===BL.item.right;
    if(ok){BL.streak++;BL.score+=1+(BL.streak>=5?1:0);sfx.tick()}else{BL.streak=0;BL.time=Math.max(0,BL.time-3);sfx.hurt()}
    BL.flash={i,ok};Modes.renderBlitz();
    setTimeout(()=>{if(!BL.done&&Modes.BL===BL){Modes.blitzNext();Modes.renderBlitz()}},ok?250:900);
  },
  blitzEnd(){
    const BL=Modes.BL;if(BL.done)return;BL.done=true;App.clearTimers();
    BL.newBest=BL.score>S.best[BL.mode];if(BL.newBest)S.best[BL.mode]=BL.score;
    save();addXp(BL.score*3);sfx.win();Modes.renderBlitz();
    UI.keyHandler=e=>{if(e.key==='Enter')App.go('blitz',BL.mode)};
  },
  renderBlitz(){
    const BL=Modes.BL,title=BL.mode==='acr'?'&gt; acronym_blitz.exe':'&gt; port_blitz.exe';
    if(BL.done)return UI.set(`<div class="result win"><h2 class="pix">${title}</h2><div class="bigscore pix">${BL.score}</div><p>${BL.newBest?'New personal best!':'Best: '+S.best[BL.mode]} &middot; +${BL.score*3} XP</p>
      <div class="row center"><button class="btn" onclick="App.go('blitz','${BL.mode}')">Play again</button><button class="btn ghost" onclick="Modes.CX.tab='${BL.mode}';App.go('codex')">Study the list</button><button class="btn ghost" onclick="App.go('world')">Map</button></div></div>`);
    const it=BL.item;
    UI.set(`<div class="blitz"><div class="bhead"><span class="pix">${title}</span><span class="pix">Score ${BL.score}</span><span class="pix"><span id="tnum">${Math.ceil(BL.time)}</span>s</span></div>
      <div class="hp timer"><i id="tbar" style="width:${100*BL.time/60}%"></i></div>
      <div class="fire pix center streakline">${BL.streak>=5?'Streak: x2 points':'&nbsp;'}</div>
      <div class="prompt pix">${esc(it.prompt)}</div>
      <div class="opts">${it.opts.map((o,i)=>{let c='opt';if(BL.flash){if(o===it.right)c+=' correct';else if(i===BL.flash.i)c+=' wrong';else c+=' dim'}return `<button class="${c}" onclick="Modes.blitzAns(${i})"><span class="k">${i+1}</span><span>${esc(o)}</span></button>`}).join('')}</div></div>`);
  },

  // Practice exams live in exam.js.

  // ---------- PBQ Lab ----------
  lab(){
    const all=allPbqs();
    // favor PBQs not yet passed
    const fresh=shuffle(all.filter(p=>S.pbq[p.s.title]!==1)),done=shuffle(all.filter(p=>S.pbq[p.s.title]===1));
    Modes.LAB={set:fresh.concat(done).slice(0,5),i:0,passed:0,pts:0,max:0};
    Modes.labNext();
  },
  labNext(){
    const L=Modes.LAB;
    if(L.i>=L.set.length){
      const nb=L.passed>S.best.lab;if(nb)S.best.lab=L.passed;save();addXp(L.passed*20);L.passed>=4?sfx.win():sfx.lose();
      const total=Object.keys(S.pbq).length,mastered=Object.values(S.pbq).filter(v=>v===1).length;
      UI.set(`<div class="result ${L.passed>=4?'win':'lose'}"><h2 class="pix">&gt; pbq_lab complete</h2><div class="bigscore pix">${L.passed} / 5</div>
        <p>${L.pts} of ${L.max} individual items correct. ${nb?'New personal best! ':''}+${L.passed*20} XP. You have passed ${mastered} of ${allPbqs().length} PBQs at least once${total>mastered?`; ${total-mastered} still need work`:''}.</p>
        <div class="row center"><button class="btn" onclick="App.go('lab')">Run another lab</button><button class="btn ghost" onclick="App.go('world')">Map</button></div></div>`);
      UI.keyHandler=e=>{if(e.key==='Enter')App.go('lab')};
      return;
    }
    const p=L.set[L.i];
    const el=UI.set(`<div class="labhead"><span class="pix">&gt; pbq_lab</span><span class="tiny">Task ${L.i+1} of ${L.set.length} &middot; ${L.passed} passed</span><div class="steps">${L.set.map((x,i)=>`<i class="${i<L.i?'past':i===L.i?'now':''}"></i>`).join('')}</div></div><div id="labHost"></div>`);
    UI.runPbq(document.getElementById('labHost'),p,(score,total)=>{
      L.pts+=score;L.max+=total;const pass=score===total;if(pass)L.passed++;
      S.pbq[p.s.title]=pass?1:0;save();L.i++;Modes.labNext();window.scrollTo(0,0);
    },{chip:p.s.d<6?`Domain ${p.s.d}`:'Bonus'});
  },

  // ---------- shared study helpers ----------
  qRow(q,extra){
    const st=S.qs[q.id]===1?' &middot; <span class="yes">mastered</span>':S.qs[q.id]===0?' &middot; <span class="no">missed</span>':'';
    const bx=srsBox('q'+q.id);
    return `<div class="rv"><div class="rvtop"><span class="tiny">${q.o?'obj '+esc(q.o)+' &middot; ':''}${q.d<6?'Domain '+q.d:'AI bonus'}${st}${bx!==null?' &middot; review '+SRS_LABEL[bx]:''}</span>${UI.starBtn(q.id)}</div>
      <b>${esc(q.q)}</b>${extra||''}<p class="yes">${esc(q.a[0])}</p><p class="muted">${esc(q.e)}</p>
      ${q.w?`<ul class="whys">${[1,2,3].map(i=>`<li><span class="no">${esc(q.a[i])}</span>: ${esc(q.w[i])}</li>`).join('')}</ul>`:''}</div>`;
  },
  chipStyle(acc){return acc===null?'':`--h:${Math.round(130*acc)}`},
  weakLine(){
    const w=weakestObjectives(5);
    return w.length?`<div class="weakbox"><b class="pix">&gt; your weakest objectives</b><div class="weakchips">${w.map(s=>`<button class="wchip" style="${Modes.chipStyle(s.acc)}" onclick="Modes.drill('${s.o}')">${s.o} <span>${esc(s.name)}</span> <b>${Math.round(100*s.acc)}%</b></button>`).join('')}</div><span class="tiny">Tap one to drill it.</span></div>`
      :'<p class="tiny">Answer some questions to see your weakest objectives here.</p>';
  },
  examWeak(EX){
    const po={};
    EX.ids.forEach(id=>{const q=Q[id],ok=EX.ans[id]!==undefined&&EX.orders[id][EX.ans[id]]===0,s=po[q.o]||(po[q.o]={o:q.o,r:0,t:0});s.t++;if(ok)s.r++});
    const w=Object.values(po).filter(s=>s.o&&s.r<s.t).sort((a,b)=>a.r/a.t-b.r/b.t||b.t-a.t).slice(0,6);
    return w.length?`<div class="weakbox"><b class="pix">&gt; weakest objectives on this exam</b><div class="weakchips">${w.map(s=>`<button class="wchip" style="${Modes.chipStyle(s.r/s.t)}" onclick="Modes.drill('${s.o}')">${s.o} <span>${esc(OBJ_NAME[s.o]||'')}</span> <b>${s.r}/${s.t}</b></button>`).join('')}</div><button class="linkbtn" onclick="App.go('heat')">Open the objectives heatmap</button></div>`:'';
  },
  drill(o){
    const ids=srsOrderIds(Q.filter(q=>q.o===o).map(q=>q.id));
    if(!ids.length)return UI.toast(`No questions for ${o} yet.`);
    App.go('battle',{kind:'obj',ids,label:`obj ${o} drill`,sub:OBJ_NAME[o]});
  },

  // ---------- Flashcards (acronyms, ports, key terms) with spaced repetition ----------
  FLASH_DECKS:{all:'All',acr:'Acronyms',port:'Ports',term:'Key terms'},
  flashCards(deck){
    const c=[];
    if(deck==='all'||deck==='acr')ACR.forEach(([a,b])=>c.push({k:'a:'+a,f:a,b,t:'acronym'}));
    if(deck==='all'||deck==='port')PORTS.forEach(([p,n])=>c.push({k:'p:'+p,f:'Port '+p,b:n,t:'port'}));
    if(deck==='all'||deck==='term')TERMS.forEach(([a,b])=>c.push({k:'t:'+a,f:a,b,t:'key term'}));
    return c;
  },
  flash(deck){
    deck=deck||(Modes.FC&&Modes.FC.deck)||'all';
    const all=Modes.flashCards(deck),by=Object.fromEntries(all.map(x=>[x.k,x]));
    Modes.FC={deck,cards:srsOrder(all.map(x=>x.k)).slice(0,20).map(k=>Object.assign({again:0},by[k])),i:0,flip:false,knew:0,miss:0};
    Modes.flashRender();
    UI.keyHandler=e=>{
      const F=Modes.FC;
      if(F.i>=F.cards.length){if(e.key==='Enter')Modes.flash(F.deck);return}
      if(e.key===' '||e.key==='Enter'){e.preventDefault();Modes.flashFlip()}
      else if(F.flip&&(e.key==='1'||e.key==='ArrowLeft'))Modes.flashGrade(false);
      else if(F.flip&&(e.key==='2'||e.key==='ArrowRight'))Modes.flashGrade(true);
    };
  },
  flashFlip(){const F=Modes.FC;if(F.i>=F.cards.length)return;F.flip=!F.flip;sfx.select();Modes.flashRender()},
  flashGrade(ok){
    const F=Modes.FC,c=F.cards[F.i];if(!c||!F.flip)return;
    srsGrade(c.k,ok);save();
    if(ok){F.knew++;sfx.granted()}else{F.miss++;sfx.denied();if(c.again<2){c.again++;F.cards.splice(Math.min(F.i+4,F.cards.length),0,c)}}   // missed cards come back later this session
    F.i++;F.flip=false;
    if(F.i>=F.cards.length)addXp(F.knew*2);
    Modes.flashRender();
  },
  flashRender(){
    const F=Modes.FC;
    const tabs=`<div class="tabs">${Object.entries(Modes.FLASH_DECKS).map(([k,n])=>{const keys=Modes.flashCards(k).map(x=>x.k);return `<button class="tab ${F.deck===k?'on':''}" onclick="Modes.flash('${k}')">${n} <span class="tiny">${srsDueCount(keys)} due &middot; ${keys.filter(x=>!S.srs[x]).length} new</span></button>`}).join('')}</div>`;
    if(F.i>=F.cards.length){
      UI.set(`<div class="result win"><h2 class="pix">&gt; deck complete</h2><div class="bigscore pix">${F.knew}/${F.knew+F.miss}</div>
        <p>Cards you knew move up a box and come back after a longer gap. Cards you missed come back in about a minute. +${F.knew*2} XP</p>${tabs}
        <div class="row center"><button class="btn" onclick="Modes.flash('${F.deck}')">Next 20 cards</button><button class="btn ghost" onclick="App.go('world')">Map</button></div></div>`);
      return;
    }
    const c=F.cards[F.i],bx=srsBox(c.k);
    UI.set(`<div class="flash"><div class="bhead"><span class="pix">&gt; flashcards --deck ${F.deck}</span><span>card ${F.i+1} / ${F.cards.length}</span><span class="tiny">knew ${F.knew} &middot; missed ${F.miss}</span></div>
      ${tabs}<div class="hp"><i style="width:${100*F.i/F.cards.length}%;background:var(--cyan)"></i></div>
      <button class="fcard ${F.flip?'flipped':''}" onclick="Modes.flashFlip()" aria-label="${F.flip?'Show the front':'Flip card'}">
        <div class="fface front"><span class="tiny">${c.t}</span><div class="fterm">${esc(c.f)}</div><span class="tiny">tap or press space to flip</span></div>
        <div class="fface back"><span class="tiny">${esc(c.f)}</span><div class="fdef">${esc(c.b)}</div><span class="tiny">${bx===null?'new card':'box '+bx+' &middot; next gap '+SRS_LABEL[bx]}</span></div>
      </button>
      <div class="row center"><button class="btn danger" ${F.flip?'':'disabled'} onclick="Modes.flashGrade(false)">&#8592; I didn't (1)</button><button class="btn" ${F.flip?'':'disabled'} onclick="Modes.flashGrade(true)">I knew it (2) &#8594;</button></div></div>`);
  },

  // ---------- Objectives heatmap ----------
  heat(){
    const st=objStats();
    const groups=[1,2,3,4,5].map(d=>({tag:'D'+d,name:dom(d).name,objs:OBJECTIVES.filter(([o])=>o.startsWith(d+'.')).map(([o])=>st[o])})).concat([{tag:'AI',name:'Bonus zone',objs:[st.AI]}]);
    const cell=s=>{const has=s.n>0;return `<button class="hcell ${s.acc===null?'untried':''}" style="${Modes.chipStyle(s.acc)}" ${has?`onclick="Modes.drill('${s.o}')"`:'disabled'} aria-label="Objective ${s.o}, ${esc(s.name)}, ${s.acc===null?'not tried':Math.round(100*s.acc)+' percent'}">
      <b>${s.o}</b><span class="hname">${esc(s.name)}</span><span class="hacc">${s.acc===null?(has?'not tried':'no questions yet'):Math.round(100*s.acc)+'%'}</span><span class="tiny">${s.t?s.r+'/'+s.t+' right &middot; ':''}${s.n} q</span></button>`};
    UI.set(`<div class="heat"><div class="bhead"><span class="pix">&gt; heatmap --objectives</span><span class="tiny">Color = your accuracy on all attempts. Tap an objective to drill it.</span></div>
      <div class="legend"><span>0%</span><i></i><span>100%</span><span class="lg-untried"></span><span>not tried</span></div>
      ${groups.map(g=>`<div class="hgroup"><div class="hlabel pix">${g.tag} <span>${esc(g.name)}</span></div><div class="hgrid">${g.objs.map(cell).join('')}</div></div>`).join('')}
      </div>`);
  },
  // ---------- Codex ----------
  CX:{tab:'acr',q:'',d:0},
  codex(){
    const CX=Modes.CX;
    const tabs=[['acr','Acronyms'],['port','Ports'],['q','Question bank'],['star','Bookmarked'],['miss','Missed'],['pbq','PBQs']];
    UI.set(`<div class="codex"><h2 class="pix sec">&gt; cat codex.db</h2>${Modes.weakLine()}
      <div class="tabs" role="tablist">${tabs.map(t=>`<button class="tab ${CX.tab===t[0]?'on':''}" onclick="Modes.CX.tab='${t[0]}';Modes.codex()">${t[1]}</button>`).join('')}</div>
      <div class="row"><input id="cxq" placeholder="Search..." value="${esc(CX.q)}" aria-label="Search the codex">${CX.tab==='q'?`<select id="cxd" aria-label="Filter by domain"><option value="0">All domains</option>${DOMAINS.map(d=>`<option value="${d.id}" ${CX.d===d.id?'selected':''}>${d.id<6?'D'+d.id+' ':''}${esc(d.name)}</option>`).join('')}</select>`:''}</div>
      <div id="cxlist"></div></div>`);
    const i=document.getElementById('cxq');i.oninput=()=>{CX.q=i.value;Modes.codexList()};
    const s=document.getElementById('cxd');if(s)s.onchange=()=>{CX.d=+s.value;Modes.codexList()};
    Modes.codexList();UI.keyHandler=null;
  },
  codexList(){
    const CX=Modes.CX,t=CX.q.toLowerCase(),m=s=>String(s).toLowerCase().includes(t);let h='';
    if(CX.tab==='acr')h=`<div class="tbl">${ACR.filter(a=>m(a[0])||m(a[1])).sort((a,b)=>a[0].localeCompare(b[0])).map(a=>`<div class="tr"><b class="pix">${esc(a[0])}</b><span>${esc(a[1])}</span></div>`).join('')}</div>`;
    else if(CX.tab==='port')h=`<div class="tbl">${PORTS.filter(a=>m(a[0])||m(a[1])).map(a=>`<div class="tr"><b class="pix">${esc(a[0])}</b><span>${esc(a[1])}</span></div>`).join('')}</div>`;
    else if(CX.tab==='pbq'){
      const list=allPbqs().map(p=>({s:p.s,kind:p.kind,body:pbqAnswerHtml(p)}));
      const f=list.filter(x=>m(x.s.title)||m(x.body));
      h=f.length?`<div class="review">${f.map(x=>`<div class="rv"><div class="tiny">${x.s.d<6?'Domain '+x.s.d:'Bonus'}${S.pbq[x.s.title]===1?' &middot; <span class="yes">passed</span>':S.pbq[x.s.title]===0?' &middot; <span class="no">missed</span>':''}</div><b>${esc(x.s.title)}</b><p>${x.body}</p></div>`).join('')}</div>`:'<p class="muted">No matches.</p>';
    }else{
      const list=CX.tab==='miss'?missedIds().map(i=>Q[i]):CX.tab==='star'?starredIds().map(i=>Q[i]):Q.filter(q=>!CX.d||q.d===CX.d);
      const f=list.filter(q=>m(q.q)||m(q.a[0])||m(q.e)||m(q.o||''));
      h=f.length?`<div class="review">${f.map(q=>Modes.qRow(q)).join('')}</div>`:`<p class="muted">${CX.tab==='miss'?'Nothing missed right now. Nice.':CX.tab==='star'?'No bookmarks yet. Tap the star on any question to save it here.':'No matches.'}</p>`;
    }
    document.getElementById('cxlist').innerHTML=h;UI.bindStar(document.getElementById('cxlist'));
  }
};
