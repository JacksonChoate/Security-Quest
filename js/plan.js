// Security+ Quest: Mission Plan. Enter your exam date to get a countdown, daily targets,
// a ready / almost / not yet status per domain, and this week's focus based on your weakest objectives.

// Readiness per exam domain from your attempt history and spaced-repetition progress.
// ready:    accuracy >= 85% and at least 80% of the domain's questions answered
// almost:   accuracy >= 70% and at least 50% answered
// not yet:  anything else (including domains you have not started)
function domainReadiness(){
  return [1,2,3,4,5].map(d=>{
    const qs=Q.filter(q=>q.d===d);let r=0,t=0,seen=0,mast=0;
    qs.forEach(q=>{const a=S.att[q.id];if(a&&a.t){r+=a.r;t+=a.t;seen++}if((srsBox('q'+q.id)||0)>=3)mast++});
    const acc=t?r/t:null,cov=seen/qs.length,mas=mast/qs.length;
    const score=t?.6*acc+.25*cov+.15*mas:0;
    const status=acc!==null&&acc>=.85&&cov>=.8?'ready':acc!==null&&acc>=.7&&cov>=.5?'almost':'not yet';
    const w=DOMAIN_WEIGHT[d];
    return {d,name:dom(d).name,color:dom(d).color,n:qs.length,seen,acc,cov,mas,score,status,w,prio:(1-score)*w};
  });
}

// What is left to cover: unseen questions, questions not yet stable in memory, flashcards and PBQs.
function planWork(){
  const core=Q.filter(q=>q.d<6);
  const unseen=core.filter(q=>!S.att[q.id]).length;
  const review=core.filter(q=>S.att[q.id]&&(srsBox('q'+q.id)||0)<3).length;   // not yet at the 3-day box
  const cards=Modes.flashCards('all').map(c=>c.k),cardsLeft=cards.filter(k=>(srsBox(k)||0)<2).length;
  const pbqLeft=allPbqs().filter(p=>S.pbq[p.s.title]!==1).length;
  return {unseen,review,cardsLeft,pbqLeft,total:core.length,cards:cards.length};
}

function planTarget(){
  const P=S.plan;if(!P.date)return null;
  const [y,m,d]=P.date.split('-').map(Number),[hh,mm]=(P.time||'09:00').split(':').map(Number);
  return new Date(y,m-1,d,hh||0,mm||0,0);
}
function planDays(){const t=planTarget();return t?dayDiff(today(),S.plan.date):null}

function planTargets(){
  const days=planDays(),W=planWork();
  if(days===null||days<=0)return null;
  const study=Math.max(1,days-1);   // keep the last day before the exam for light review
  const q=Math.max(10,Math.ceil((W.unseen+W.review*1.5)/study));
  return {days,study,q,cards:W.cardsLeft?Math.max(5,Math.ceil(W.cardsLeft/study)):0,pbq:W.pbqLeft?Math.ceil(W.pbqLeft/study):0,
    exams:Math.max(1,Math.floor(days/7)),tight:q>80,W};
}

Object.assign(Modes,{
  planLine(){
    const days=planDays();if(days===null)return `<button class="linkbtn" onclick="App.go('plan')">Set your exam date in Mission Plan</button>`;
    if(days<0)return `<span class="tiny">exam date has passed &middot; <button class="linkbtn" onclick="App.go('plan')">update Mission Plan</button></span>`;
    const T=planTargets(),done=S.dayLog[today()]||0;
    return `<span class="tiny planline"><b>${days===0?'exam day':days+' day'+(days===1?'':'s')+' to exam'}</b>${T?` &middot; today ${done}/${T.q} questions`:''} &middot; <button class="linkbtn" onclick="App.go('plan')">Mission Plan</button></span>`;
  },

  plan(){
    const P=S.plan,days=planDays(),T=planTargets(),R=domainReadiness();
    const minDate=today(),suggest=(()=>{const d=new Date();d.setDate(d.getDate()+30);return d.toISOString().slice(0,10)})();
    const focus=R.slice().sort((a,b)=>b.prio-a.prio),top=focus.filter(x=>x.status!=='ready').slice(0,2);
    const focusDomains=(top.length?top:focus.slice(0,1)).map(x=>x.d);
    const st=objStats();
    const tried=Object.values(st).filter(s=>s.n&&focusDomains.includes(+s.o[0])&&s.t).sort((a,b)=>a.acc-b.acc);
    const untried=Object.values(st).filter(s=>s.n&&focusDomains.includes(+s.o[0])&&!s.t);
    const objs=tried.slice(0,5).concat(untried.slice(0,Math.max(0,5-tried.length)));
    const statusChip=x=>`<span class="pstatus ${x.status.replace(' ','')}">${x.status==='ready'?'&#10003; ready':x.status==='almost'?'&#9679; almost':'&#9675; not yet'}</span>`;
    const pct=v=>v===null?'--':Math.round(100*v)+'%';
    const done=S.dayLog[today()]||0;

    // 7-day schedule: rotate the focus domains, a full exam about once a week, light review at the end.
    const sched=[];
    if(T){
      const rot=focus.filter(x=>x.status!=='ready').map(x=>x.d);const order=rot.length?rot:[focus[0].d];
      for(let i=0;i<Math.min(7,T.days+1);i++){
        const dt=new Date();dt.setDate(dt.getDate()+i);const left=T.days-i;
        const label=dt.toLocaleDateString(undefined,{weekday:'short',month:'short',day:'numeric'});
        let task;
        if(left===0)task='Exam day: rest, skim your bookmarks, no new material';
        else if(left===1)task='Light review: flashcards due + one Quick Quiz';
        else if(i%7===5&&T.days>8)task='Full practice exam (90 q, 90 min), then review misses';
        else{const d=order[(i-(i>5?1:0))%order.length];task=`${T.q} questions: focus D${d} ${dom(d).name}${T.cards?` + ${T.cards} flashcards`:''}`}
        sched.push({label,task,today:i===0});
      }
    }

    UI.set(`<div class="plan">
      <div class="bhead"><span class="pix">&gt; mission_plan --exam</span><span class="tiny">Your plan updates as you study. Estimates, not guarantees.</span></div>
      <div class="plantop">
        <section class="pdate"><h3 class="pix">Exam date</h3>
          <div class="row"><label for="planDate" class="tiny">Date</label><input type="date" id="planDate" min="${minDate}" value="${esc(P.date||'')}">
          <label for="planTime" class="tiny">Time</label><input type="time" id="planTime" value="${esc(P.time||'09:00')}"></div>
          ${P.date?'':`<p class="tiny">No date yet. Most people book 4 to 8 weeks out. <button class="linkbtn" id="planSuggest">Use ${suggest}</button></p>`}
        </section>
        <section class="pcount"><h3 class="pix">Countdown</h3>
          ${days===null?'<p class="tiny">Set a date to start the countdown.</p>':days<0?'<p class="tiny">That date has passed. Set your next attempt or retake date.</p>':`<div class="cdown" id="cdown" aria-live="off"></div><span class="tiny">${days===0?'Today is exam day. Good luck, '+hName()+'.':`${days} day${days===1?'':'s'} left, ${T.study} for study`}</span>`}
        </section>
        <section class="ptoday"><h3 class="pix">Today</h3>
          ${T?`<div class="ptgt"><b>${done} / ${T.q}</b><span class="tiny">questions answered today</span></div><div class="bar"><i style="width:${Math.min(100,100*done/T.q)}%"></i></div>
            <ul class="plist"><li><b>${T.q}</b> questions per day${T.tight?' <span class="pstatus notyet">tight schedule</span>':''}</li>${T.cards?`<li><b>${T.cards}</b> flashcards per day</li>`:''}${T.pbq?`<li><b>${T.pbq}</b> PBQ${T.pbq>1?'s':''} per day</li>`:''}<li><b>${T.exams}</b> full practice exam${T.exams>1?'s':''} before exam day</li></ul>
            <div class="row"><button class="btn sm" onclick="App.go('weak')">Start today: Weak Spots</button><button class="btn ghost sm" onclick="App.go('flash','all')">Flashcards</button><button class="btn ghost sm" onclick="App.go('exam')">Practice exam</button></div>`
          :'<p class="tiny">Daily targets appear once your exam date is set.</p>'}
        </section>
      </div>
      <section><h3 class="pix">Domain readiness</h3>
        <div class="dready">${R.map(x=>`<div class="drow" style="--c:${x.color}">
          <span class="dname"><b>D${x.d}</b> ${esc(x.name)} <span class="tiny">${Math.round(x.w*100)}% of exam</span></span>
          ${statusChip(x)}
          <span class="dstat"><span class="tiny">accuracy</span><b>${pct(x.acc)}</b></span>
          <span class="dstat"><span class="tiny">answered</span><b>${x.seen}/${x.n}</b></span>
          <span class="dstat"><span class="tiny">long-term</span><b>${pct(x.mas)}</b></span>
          <button class="btn ghost sm" onclick="App.go('battle',${x.d})">Train</button></div>`).join('')}</div>
        <p class="tiny">Ready = 85%+ accuracy with 80%+ of the domain answered. Almost = 70%+ with half answered. Long-term = questions spaced repetition has pushed out 3+ days.</p>
      </section>
      <section><h3 class="pix">Focus this week</h3>
        <p class="pfocus">${focusDomains.map(d=>`<b style="color:${dom(d).color}">D${d} ${esc(dom(d).name)}</b>`).join(' and ')}<span class="tiny"> are your biggest gaps once weighted by exam share.</span></p>
        <div class="weakchips">${objs.map(s=>`<button class="wchip" style="${Modes.chipStyle(s.acc)}" onclick="Modes.drill('${s.o}')">${s.o} <span>${esc(s.name)}</span> <b>${s.acc===null?'new':Math.round(100*s.acc)+'%'}</b></button>`).join('')||'<span class="tiny">No questions tagged for these objectives yet.</span>'}</div>
        ${sched.length?`<ol class="sched">${sched.map(x=>`<li class="${x.today?'today':''}"><b>${esc(x.label)}${x.today?' (today)':''}</b><span>${esc(x.task)}</span></li>`).join('')}</ol>`:''}
      </section>
    </div>`);

    const save2=()=>{save();Modes.plan()};
    const di=document.getElementById('planDate'),ti=document.getElementById('planTime');
    di.onchange=()=>{P.date=di.value;sfx.granted();save2();if(P.date)UI.toast('Mission Plan updated.')};
    ti.onchange=()=>{P.time=ti.value||'09:00';save2()};
    const sg=document.getElementById('planSuggest');if(sg)sg.onclick=()=>{P.date=suggest;save2()};
    // live countdown
    const tick=()=>{
      const el=document.getElementById('cdown'),t=planTarget();if(!el||!t)return;
      let ms=Math.max(0,t-Date.now());const dd=Math.floor(ms/864e5);ms-=dd*864e5;const h=Math.floor(ms/36e5);ms-=h*36e5;const m=Math.floor(ms/6e4),s=Math.floor(ms%6e4/1e3);
      el.innerHTML=`<span><b>${dd}</b>d</span><span><b>${String(h).padStart(2,'0')}</b>h</span><span><b>${String(m).padStart(2,'0')}</b>m</span><span><b>${String(s).padStart(2,'0')}</b>s</span>`;
    };
    tick();App.clearTimers();App.every(1000,tick);
    UI.keyHandler=null;
  }
});
