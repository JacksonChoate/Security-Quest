// Security+ Quest: practice exams.
// Full exam: 90 items in 90 minutes, opening with 3-4 PBQs, then multiple choice weighted by domain.
// Quick Quiz: 15 multiple-choice questions in 15 minutes.
// Before submitting, a review screen lists flagged, unanswered and incomplete items.
// Results include domain bars, PBQ answers, weakest objectives, missed-question review and a history chart.

const EXAM_KINDS={
  full:{label:'Full practice exam',short:'Full exam',n:90,min:90,pbq:[3,4]},
  quick:{label:'Quick Quiz',short:'Quick Quiz',n:15,min:15,pbq:[0,0]}
};
const DOMAIN_WEIGHT={1:.12,2:.22,3:.18,4:.28,5:.20};   // SY0-701 domain weights

// Split n questions across domains by weight (largest remainder, so the total is exact).
function weightedCounts(n){
  const r=Object.entries(DOMAIN_WEIGHT).map(([d,w])=>({d:+d,x:w*n}));
  r.forEach(o=>{o.c=Math.floor(o.x);o.f=o.x-o.c});
  let left=n-r.reduce((s,o)=>s+o.c,0);
  r.slice().sort((a,b)=>b.f-a.f).forEach(o=>{if(left>0){o.c++;left--}});
  return Object.fromEntries(r.map(o=>[o.d,o.c]));
}

Object.assign(Modes,{
  // ---------- start menu ----------
  exam(){
    Modes.EX=null;UI.keyHandler=null;
    const last=k=>{const h=S.exams.filter(e=>(e.kind||'full')===k);return h.length?`last ${h[h.length-1].pct}%`:'not taken yet'};
    UI.set(`<div class="exmenu">
      <div class="bhead"><span class="pix">&gt; practice_exam --select</span><span class="tiny">real exam: up to 90 questions, 90 minutes, 750 / 900 to pass</span></div>
      <div class="excards">
        <button class="excard" onclick="Modes.examStart('full')"><b class="pix">&gt; full_exam</b><span class="big">90 questions &middot; 90 min</span><span>Opens with 3-4 performance-based questions, then multiple choice weighted like the five domains. No hints, flag for review, graded at the end.</span><span class="chip">${last('full')}</span></button>
        <button class="excard quick" onclick="Modes.examStart('quick')"><b class="pix">&gt; quick_quiz</b><span class="big">15 questions &middot; 15 min</span><span>A short timed session for a study break. Same domain weighting, no PBQs.</span><span class="chip">${last('quick')}</span></button>
      </div>
      ${Modes.historyChart()}
    </div>`);
  },

  // ---------- build and start ----------
  examStart(kind){
    const K=EXAM_KINDS[kind],[pmin,pmax]=K.pbq,np=pmin+Math.floor(Math.random()*(pmax-pmin+1));
    const pbqs=shuffle(allPbqs()).slice(0,np);   // includes simulations: logs, firewall, diagrams, terminal, phishing
    const counts=weightedCounts(K.n-np);
    let ids=[];for(const d in counts)ids=ids.concat(shuffle(Q.filter(q=>q.d===+d).map(q=>q.id)).slice(0,counts[d]));
    const items=pbqs.map((p,i)=>({k:'p',p,state:{},n:i+1})).concat(shuffle(ids).map(id=>({k:'q',id,ord:shuffle([0,1,2,3])})));
    Modes.EX={kind,K,items,np,ans:{},flag:{},i:0,end:0,started:0};
    FX.type(UI.set(''),[`> mounting exam image: ${K.label.toLowerCase()}...`,`> ${items.length} items loaded${np?` (${np} PBQs first)`:''} &middot; weights D1 12 / D2 22 / D3 18 / D4 28 / D5 20`.replace('&middot;','|'),`> hints disabled. timer armed: ${K.min}:00`],()=>{
      const EX=Modes.EX;if(App.mode!=='exam'||!EX||EX.end)return;
      EX.started=Date.now();EX.end=EX.started+K.min*60e3;Modes.renderExam();
    });
    App.every(1000,()=>{
      const EX=Modes.EX;if(!EX||EX.result||!EX.end)return;
      const left=EX.end-Date.now(),el=document.getElementById('etime');
      if(el){el.textContent=Modes.fmt(left);el.classList.toggle('low',left<5*60e3)}
      if(left<=0){UI.toast('Time is up. Your exam was submitted.');Modes.submitExam()}
    });
  },
  fmt(ms){ms=Math.max(0,ms);const m=Math.floor(ms/60000),s=Math.floor(ms/1000)%60;return m+':'+String(s).padStart(2,'0')},

  // ---------- item status ----------
  itemStatus(it,i){
    const EX=Modes.EX;
    if(it.k==='q')return EX.ans[i]!==undefined?'done':'empty';
    const {have,need}=pbqProgress(it.p,it.state);
    return have>=need?'done':have?'partial':'empty';
  },
  cellLabel(it,i){return it.k==='p'?'P'+it.n:String(i+1-Modes.EX.np)},

  // ---------- exam screen ----------
  renderExam(){
    const EX=Modes.EX,it=EX.items[EX.i],n=EX.items.length,last=EX.i===n-1;
    const label=it.k==='p'?`PBQ ${it.n} of ${EX.np}`:`Question ${EX.i+1-EX.np} of ${n-EX.np}`;
    UI.set(`<div class="exam"><div class="bhead"><span class="pix">&gt; ${EX.kind==='full'?'practice_exam':'quick_quiz'}</span><span>${label}</span><span class="pix etime" id="etime">${Modes.fmt(EX.end-Date.now())}</span></div>
      <div id="exItem"></div>
      <div class="row between"><button class="btn ghost" onclick="Modes.exGo(${EX.i-1})" ${EX.i?'':'disabled'}>&larr; Prev</button>
        <button class="btn ghost sm flagbtn ${EX.flag[EX.i]?'on':''}" onclick="Modes.exFlag()" aria-pressed="${!!EX.flag[EX.i]}">${EX.flag[EX.i]?'&#9873; Flagged':'&#9872; Flag for review'} (F)</button>
        ${last?`<button class="btn" onclick="Modes.exReview()">Review &amp; submit &rarr;</button>`:`<button class="btn" onclick="Modes.exGo(${EX.i+1})">Next &rarr;</button>`}</div>
      <div class="grid" id="exGrid"></div>
      <div class="row center"><span class="tiny" id="exCount"></span><button class="btn ghost sm" onclick="Modes.exReview()">Review &amp; submit</button></div></div>`);
    const host=document.getElementById('exItem');
    if(it.k==='q'){
      const q=Q[it.id],a=EX.ans[EX.i];
      host.innerHTML=`<div class="qcard flat"><div class="qmeta"><span class="chip">Domain ${q.d}</span>${UI.starBtn(q.id)}<span class="tiny right keys-hint">keys 1-4 &middot; arrows to move &middot; F = flag</span></div>
        <h3 class="${q.q.length>170?'l2':''}">${esc(q.q)}</h3>
        <div class="opts">${it.ord.map((oi,p)=>`<button class="opt ${a===p?'sel':''}" onclick="Modes.exAns(${p})"><span class="k">${p+1}</span><span>${esc(q.a[oi])}</span></button>`).join('')}</div></div>`;
      UI.bindStar(host);
    }else{
      UI.runPbq(host,it.p,()=>{},{exam:true,state:it.state,chip:`PBQ ${it.n} of ${EX.np}`,onChange:()=>Modes.exGrid()});
    }
    Modes.exGrid();
    UI.keyHandler=e=>{
      const EX=Modes.EX;if(!EX||EX.result)return;
      const n='1234'.indexOf(e.key);
      if(n>=0&&EX.items[EX.i].k==='q')Modes.exAns(n);
      else if(e.key==='ArrowRight')Modes.exGo(EX.i+1);
      else if(e.key==='ArrowLeft')Modes.exGo(EX.i-1);
      else if(e.key==='f'||e.key==='F')Modes.exFlag();
    };
  },
  exGrid(){
    const EX=Modes.EX,g=document.getElementById('exGrid');if(!g)return;
    g.innerHTML=EX.items.map((it,i)=>{const s=Modes.itemStatus(it,i);return `<button class="cell ${s} ${it.k==='p'?'pbq':''} ${EX.flag[i]?'flag':''} ${i===EX.i?'cur':''}" onclick="Modes.exGo(${i})" aria-label="${it.k==='p'?'PBQ '+it.n:'Question '+Modes.cellLabel(it,i)}, ${s==='done'?'answered':s==='partial'?'incomplete':'unanswered'}${EX.flag[i]?', flagged':''}">${Modes.cellLabel(it,i)}</button>`}).join('');
    const done=EX.items.filter((it,i)=>Modes.itemStatus(it,i)==='done').length,fl=Object.values(EX.flag).filter(Boolean).length;
    const c=document.getElementById('exCount');if(c)c.textContent=`${done} of ${EX.items.length} answered · ${fl} flagged (amber) · PBQs in orange`;
  },
  exAns(p){const EX=Modes.EX;EX.ans[EX.i]=p;sfx.select();Modes.renderExam()},
  exGo(i){const EX=Modes.EX;EX.i=Math.max(0,Math.min(EX.items.length-1,i));Modes.renderExam()},
  exFlag(){const EX=Modes.EX;EX.flag[EX.i]=!EX.flag[EX.i];sfx.tick();Modes.renderExam()},

  // ---------- review screen before submitting ----------
  exReview(){
    const EX=Modes.EX;UI.keyHandler=null;
    const rows=EX.items.map((it,i)=>({it,i,s:Modes.itemStatus(it,i),f:!!EX.flag[i]}));
    const flagged=rows.filter(r=>r.f),open=rows.filter(r=>r.s!=='done');
    const line=r=>{const it=r.it,txt=it.k==='p'?it.p.s.title:Q[it.id].q;
      return `<button class="revrow" onclick="Modes.exGo(${r.i})"><span class="cell ${r.s} ${it.k==='p'?'pbq':''} ${r.f?'flag':''}">${Modes.cellLabel(it,r.i)}</span><span class="revtxt">${esc(txt.length>110?txt.slice(0,107)+'...':txt)}</span><span class="tiny">${r.s==='done'?'answered':r.s==='partial'?'incomplete':'unanswered'}${r.f?' &middot; flagged':''}</span></button>`};
    UI.set(`<div class="exam review-screen"><div class="bhead"><span class="pix">&gt; review --before-submit</span><span>${EX.items.length-open.length} of ${EX.items.length} answered</span><span class="pix etime" id="etime">${Modes.fmt(EX.end-Date.now())}</span></div>
      <div class="revcols">
        <section><h3 class="pix">&#9873; Flagged (${flagged.length})</h3>${flagged.length?flagged.map(line).join(''):'<p class="tiny">Nothing flagged.</p>'}</section>
        <section><h3 class="pix">Unanswered or incomplete (${open.length})</h3>${open.length?open.map(line).join(''):'<p class="tiny">Every item has an answer.</p>'}</section>
      </div>
      <p class="tiny">Tap any item to go back to it. The timer keeps running on this screen.</p>
      <div class="row between"><button class="btn ghost" onclick="Modes.exGo(Modes.EX.i)">&larr; Back to exam</button><button class="btn" onclick="Modes.askSubmit()">Submit exam</button></div></div>`);
  },
  askSubmit(){
    const EX=Modes.EX,open=EX.items.filter((it,i)=>Modes.itemStatus(it,i)!=='done').length;
    if(open)UI.confirm(`Submit with ${open} unanswered or incomplete item${open>1?'s':''}? They will be scored as wrong or partial.`,'Submit',Modes.submitExam);
    else Modes.submitExam();
  },

  // ---------- grading ----------
  pbqScore(it){return pbqScoreOf(it.p,it.state)},
  submitExam(){
    const EX=Modes.EX;if(!EX||EX.result)return;App.clearTimers();UI.keyHandler=null;
    const per={},po={};let pts=0;
    const add=(o,k,v)=>{const x=o[k]||(o[k]={r:0,t:0});x.t++;x.r+=v};
    EX.items.forEach((it,i)=>{
      if(it.k==='q'){
        const q=Q[it.id],ok=EX.ans[i]!==undefined&&it.ord[EX.ans[i]]===0;it.ok=ok;
        mark(it.id,ok);pts+=ok?1:0;add(per,q.d,ok?1:0);if(q.o)add(po,q.o,ok?1:0);
      }else{
        const sc=Modes.pbqScore(it),frac=sc.r/sc.t;it.sc=sc;
        S.pbq[it.p.s.title]=frac===1?1:0;pts+=frac;add(per,it.p.s.d,frac);
      }
    });
    const pct=Math.round(100*pts/EX.items.length);
    EX.result={pts,pct,per,po,secs:Math.round((Math.min(Date.now(),EX.end)-EX.started)/1000)};
    S.exams.push({pct,date:new Date().toISOString().slice(0,10),kind:EX.kind,n:EX.items.length,t:Date.now()});
    save();addXp(Math.round(pts*5));pct>=80?sfx.win():sfx.lose();
    Modes.renderExamResult();
  },

  // ---------- results ----------
  examWeak(EX){
    const w=Object.entries(EX.result.po).map(([o,s])=>({o,...s})).filter(s=>s.r<s.t).sort((a,b)=>a.r/a.t-b.r/b.t||b.t-a.t).slice(0,6);
    return w.length?`<div class="weakbox"><b class="pix">&gt; weakest objectives on this exam</b><div class="weakchips">${w.map(s=>`<button class="wchip" style="${Modes.chipStyle(s.r/s.t)}" onclick="Modes.drill('${s.o}')">${s.o} <span>${esc(OBJ_NAME[s.o]||'')}</span> <b>${s.r}/${s.t}</b></button>`).join('')}</div><button class="linkbtn" onclick="App.go('heat')">Open the objectives heatmap</button></div>`:'';
  },
  renderExamResult(){
    const EX=Modes.EX,r=EX.result,scaled=Math.round(100+800*r.pct/100),mm=Math.floor(r.secs/60),ss=String(r.secs%60).padStart(2,'0');
    const miss=EX.items.map((it,i)=>({it,i})).filter(x=>x.it.k==='q'&&!x.it.ok);
    const pb=EX.items.filter(it=>it.k==='p');
    UI.set(`<div class="result ${r.pct>=80?'win':'lose'}"><h2 class="pix">&gt; ${EX.kind==='full'?'exam':'quiz'} complete. scoring done.</h2><div class="bigscore pix">${r.pct}%</div>
      <p>${Math.round(r.pts*10)/10} of ${EX.items.length} points in ${mm}:${ss}${EX.kind==='full'?`, roughly ${scaled} on the 100-900 scale (750 passes)`:''}. ${r.pct>=85?'Strong: you look ready.':r.pct>=75?'Close. Drill your weakest objectives below.':'Keep training: rematch your misses and use Weak Spots.'} This is a rough estimate, not CompTIA's scoring.</p>
      <div class="dbars">${[1,2,3,4,5].map(d=>{const p=r.per[d]||{r:0,t:0};const v=p.t?Math.round(100*p.r/p.t):0;return `<div class="dbar"><span>D${d} ${esc(dom(d).name)}</span><div class="bar"><i style="width:${v}%;background:${dom(d).color}"></i></div><b>${Math.round(p.r*10)/10}/${p.t}</b></div>`}).join('')}</div>
      ${Modes.examWeak(EX)}
      <div class="row center"><button class="btn" onclick="Modes.examStart('${EX.kind}')">New ${EX.K.short.toLowerCase()}</button>${missedIds().length?`<button class="btn ghost" onclick="App.go('battle','missed')">Rematch misses</button>`:''}<button class="btn ghost" onclick="App.go('exam')">Exam menu</button><button class="btn ghost" onclick="App.go('world')">Map</button></div></div>
      ${Modes.historyChart()}
      ${pb.length?`<h2 class="pix sec">PBQ results</h2><div class="review">${pb.map(it=>`<div class="rv"><div class="rvtop"><span class="tiny">PBQ ${it.n} &middot; ${kindLabel(it.p.kind)} &middot; Domain ${it.p.s.d}</span><b class="${it.sc.r===it.sc.t?'yes':'no'}">${it.sc.r}/${it.sc.t}</b></div><b>${esc(it.p.s.title)}</b><p class="muted">${pbqAnswerHtml(it.p)}</p></div>`).join('')}</div>`:''}
      ${miss.length?`<h2 class="pix sec">Review (${miss.length} missed)</h2><div class="review">${miss.map(({it,i})=>{const q=Q[it.id],a=EX.ans[i],pk=a!==undefined?it.ord[a]:null;return Modes.qRow(q,`<p>${pk!==null?`<span class="no">You: ${esc(q.a[pk])}</span>${q.w&&q.w[pk]?` <span class="muted">(${esc(q.w[pk])})</span>`:''}`:'<span class="no">Unanswered</span>'}${EX.flag[i]?' <span class="chip">flagged</span>':''}</p>`)}).join('')}</div>`:''}`);
    UI.bindStar(UI.panel);UI.panel.scrollTop=0;
    UI.keyHandler=e=>{if(e.key==='Enter')App.go('exam')};
  },

  // ---------- history chart (SVG line chart, one point per attempt) ----------
  historyChart(){
    const H=S.exams.map((e,i)=>({i,pct:e.pct,date:e.date,kind:e.kind||'full',n:e.n||60}));
    if(!H.length)return `<div class="hist"><b class="pix">&gt; history</b><p class="tiny">Your practice exam and quiz scores will be charted here after your first attempt.</p></div>`;
    const W=640,Ht=220,L=40,R=58,T=16,B=30,pw=W-L-R,ph=Ht-T-B;
    const x=i=>L+(H.length===1?pw/2:pw*i/(H.length-1)),y=v=>T+ph*(1-v/100);
    const SER=[{k:'full',name:'Full exam',cls:'s-full',shape:'circle'},{k:'quick',name:'Quick Quiz',cls:'s-quick',shape:'square'}];
    const grid=[0,25,50,75,100].map(v=>`<line class="gl" x1="${L}" x2="${W-R}" y1="${y(v)}" y2="${y(v)}"/><text class="ax" x="${L-8}" y="${y(v)+4}" text-anchor="end">${v}%</text>`).join('');
    const pass=`<line class="passl" x1="${L}" x2="${W-R}" y1="${y(81)}" y2="${y(81)}"/><text class="ax pass" x="${W-R+6}" y="${y(81)+4}">~pass</text>`;
    const mark=(s,p)=>s.shape==='circle'?`<circle class="pt ${s.cls}" cx="${x(p.i)}" cy="${y(p.pct)}" r="5"/>`:`<rect class="pt ${s.cls}" x="${x(p.i)-5}" y="${y(p.pct)-5}" width="10" height="10" rx="1.5"/>`;
    const series=SER.map(s=>{
      const pts=H.filter(p=>p.kind===s.k);if(!pts.length)return '';
      const path=pts.map((p,j)=>`${j?'L':'M'}${x(p.i).toFixed(1)},${y(p.pct).toFixed(1)}`).join('');
      const lastP=pts[pts.length-1];
      return `<path class="ln ${s.cls}" d="${path}"/>${pts.map(p=>mark(s,p)).join('')}<text class="dl" x="${x(lastP.i)+9}" y="${y(lastP.pct)-8}">${lastP.pct}%</text>`;
    }).join('');
    const hits=H.map(p=>`<circle class="hit" cx="${x(p.i)}" cy="${y(p.pct)}" r="13" tabindex="0" data-tip="${SER.find(s=>s.k===p.kind).name}${p.kind==='full'&&p.n!==90?` (${p.n}q)`:''} &middot; ${p.date} &middot; ${p.pct}%"><title>${p.date}: ${p.pct}%</title></circle>`).join('');
    const xl=H.length>1?`<text class="ax" x="${L}" y="${Ht-8}">attempt 1</text><text class="ax" x="${W-R}" y="${Ht-8}" text-anchor="end">attempt ${H.length}</text>`:'';
    const fulls=H.filter(p=>p.kind==='full'),qs=H.filter(p=>p.kind==='quick');
    const stat=(arr,name)=>arr.length?`<span><b>${name}</b> latest ${arr[arr.length-1].pct}% &middot; best ${Math.max(...arr.map(p=>p.pct))}%${arr.length>1?` &middot; ${arr[arr.length-1].pct-arr[0].pct>=0?'+':''}${arr[arr.length-1].pct-arr[0].pct} since first`:''}</span>`:'';
    const legend=SER.filter(s=>H.some(p=>p.kind===s.k)).map(s=>`<span class="lg"><svg width="26" height="12" aria-hidden="true"><line class="ln ${s.cls}" x1="0" x2="26" y1="6" y2="6"/>${s.shape==='circle'?`<circle class="pt ${s.cls}" cx="13" cy="6" r="4"/>`:`<rect class="pt ${s.cls}" x="9" y="2" width="8" height="8"/>`}</svg>${s.name}</span>`).join('')+`<span class="lg"><svg width="26" height="12" aria-hidden="true"><line class="passl" x1="0" x2="26" y1="6" y2="6"/></svg>approx. passing (750 of 900)</span>`;
    return `<div class="hist"><div class="histhead"><b class="pix">&gt; score history</b><div class="hstats">${stat(fulls,'Full')}${stat(qs,'Quick')}</div></div>
      <div class="legendrow">${legend}</div>
      <div class="chartwrap"><svg class="hchart" viewBox="0 0 ${W} ${Ht}" role="img" aria-label="Practice exam scores over ${H.length} attempts">${grid}${pass}${series}${xl}${hits}</svg><div class="ctip" id="ctip" hidden></div></div>
      <details class="htable"><summary class="tiny">Show as table</summary><table><thead><tr><th>#</th><th>Date</th><th>Type</th><th>Score</th></tr></thead><tbody>${H.map(p=>`<tr><td>${p.i+1}</td><td>${p.date}</td><td>${p.kind==='full'?'Full exam'+(p.n!==90?` (${p.n}q)`:''):'Quick Quiz'}</td><td>${p.pct}%</td></tr>`).join('')}</tbody></table></details></div>`;
  }
});

// Hover / focus tooltip for the history chart (works for every render of it).
['pointerover','focusin'].forEach(ev=>document.addEventListener(ev,e=>{
  const h=e.target.closest&&e.target.closest('.hchart .hit');if(!h)return;
  const wrap=h.closest('.chartwrap'),tip=wrap.querySelector('.ctip'),svg=wrap.querySelector('svg');
  const sb=svg.getBoundingClientRect(),wb=wrap.getBoundingClientRect(),vb=svg.viewBox.baseVal,k=sb.width/vb.width;
  tip.innerHTML=h.dataset.tip;tip.hidden=false;
  tip.style.left=Math.min(wb.width-170,Math.max(0,sb.left-wb.left+(+h.getAttribute('cx'))*k-80))+'px';
  tip.style.top=(sb.top-wb.top+(+h.getAttribute('cy'))*k-44)+'px';
}));
['pointerout','focusout'].forEach(ev=>document.addEventListener(ev,e=>{
  const h=e.target.closest&&e.target.closest('.hchart .hit');if(!h)return;
  const tip=h.closest('.chartwrap').querySelector('.ctip');if(tip)tip.hidden=true;
}));
