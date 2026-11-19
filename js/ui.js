// Security+ Quest: HTML widgets shown in the panel under the game canvas.
// Multiple choice cards, PBQ matching and ordering widgets, toasts, confirm dialogs, key routing.

const UI={
  keyHandler:null,
  get panel(){return document.getElementById('panel')},
  set(html){const p=this.panel;p.onclick=null;p.onscroll=null;p.innerHTML=html;p.scrollTop=0;return p},

  toast(msg,kind){
    const t=document.createElement('div');t.className='toast '+(kind||'');t.textContent=msg;
    document.getElementById('toasts').appendChild(t);
    setTimeout(()=>t.classList.add('out'),2200);setTimeout(()=>t.remove(),2700);
  },

  confirm(text,label,ok,danger){
    const m=document.createElement('div');m.className='modal';
    m.innerHTML=`<div class="mbox" role="dialog" aria-modal="true"><p>${esc(text)}</p><div class="row end"><button class="btn ghost" data-a="no">Cancel</button><button class="btn ${danger?'danger':''}" data-a="yes">${esc(label)}</button></div></div>`;
    const close=()=>{m.remove();UI._modal=null};
    m.onclick=e=>{const a=e.target.dataset.a;if(a==='no'||e.target===m)close();if(a==='yes'){close();ok()}};
    document.body.appendChild(m);UI._modal=close;m.querySelector('[data-a=yes]').focus();
  },

  // ---------- bookmarks ----------
  starBtn(id){const on=!!S.star[id];return `<button class="star ${on?'on':''}" data-star="${id}" aria-pressed="${on}" aria-label="${on?'Remove bookmark':'Bookmark this question'}" title="Bookmark">${on?'&#9733;':'&#9734;'}</button>`},
  // Wire every star button inside el (works for lists too).
  bindStar(el){el.querySelectorAll('[data-star]').forEach(b=>b.onclick=e=>{
    e.stopPropagation();const on=toggleStar(+b.dataset.star);
    b.classList.toggle('on',on);b.innerHTML=on?'&#9733;':'&#9734;';b.setAttribute('aria-pressed',on);
    b.setAttribute('aria-label',on?'Remove bookmark':'Bookmark this question');sfx.select();
    UI.toast(on?'Bookmarked. Find it in Codex > Bookmarked.':'Bookmark removed.');
  })},

  // ---------- audio settings ----------
  settings(){
    if(UI._modal)UI._modal();
    const pct=v=>Math.round(v*100);
    const m=document.createElement('div');m.className='modal';
    m.innerHTML=`<div class="mbox settings" role="dialog" aria-modal="true" aria-labelledby="setTitle">
      <div class="pix set-title" id="setTitle">&gt; nano audio.cfg</div>
      <label for="musicVol">Music volume <output id="musicOut">${pct(Settings.music)}%</output></label>
      <input type="range" id="musicVol" min="0" max="100" step="5" value="${pct(Settings.music)}">
      <label for="sfxVol">Sound effects volume <output id="sfxOut">${pct(Settings.sfx)}%</output></label>
      <input type="range" id="sfxVol" min="0" max="100" step="5" value="${pct(Settings.sfx)}">
      <label class="check" for="muteAll"><input type="checkbox" id="muteAll" ${Settings.muted?'checked':''}> Mute all audio</label>
      <p class="tiny">Saved in this browser. Resetting progress keeps these settings.</p>
      <p class="tiny">Unofficial study aid, not affiliated with or endorsed by CompTIA. Questions are original and organized by the five Security+ SY0-701 domains plus a bonus AI zone. Always check CompTIA's current exam objectives.</p>
      <div class="row between"><button class="linkbtn danger-link" data-a="reset">Reset game progress</button><button class="btn" data-a="done">Save and close</button></div></div>`;
    document.body.appendChild(m);
    const q=s=>m.querySelector(s);
    const upd=()=>{Sound.unlock();Sound.apply();saveSettings();App.hud()};
    q('#musicVol').oninput=e=>{Settings.music=e.target.value/100;q('#musicOut').textContent=e.target.value+'%';upd()};
    q('#sfxVol').oninput=e=>{Settings.sfx=e.target.value/100;q('#sfxOut').textContent=e.target.value+'%';upd()};
    q('#sfxVol').onchange=()=>sfx.granted();
    q('#muteAll').onchange=e=>{Settings.muted=e.target.checked;upd()};
    const close=()=>{m.remove();UI._modal=null};
    m.onclick=e=>{if(e.target===m||e.target.dataset.a==='done')close();if(e.target.dataset.a==='reset'){close();App.reset()}};
    UI._modal=close;q('#musicVol').focus();
  },

  // ---------- multiple choice ----------
  // opts: {chips:[...], hints:n, onHint(), onAnswer(ok,ms)}  Returns {feedback(title,btn,onCont,extraHtml)}
  mcq(el,q,opts){
    opts=opts||{};
    const order=shuffle([0,1,2,3]);let hidden=[],done=false;const t0=performance.now();
    const chips=(opts.chips||[]).map(c=>`<span class="chip">${c}</span>`).join('');
    el.onclick=null;
    // Long questions get a slightly smaller font instead of overflowing.
    const len=q.q.length,lc=len>200?' l3':len>140?' l2':len>95?' l1':'';
    const longOpt=q.a.some(a=>a.length>46);
    el.innerHTML=`<div class="qcard${opts.fit?' fit':''}">
      <div class="qmeta">${q.o?`<span class="chip obj">obj ${esc(q.o)}</span>`:''}${chips}<span class="hintslot"></span>${UI.starBtn(q.id)}<span class="tiny right keys-hint">keys 1-4 &middot; S = star &middot; enter = next</span></div>
      ${opts.timer?'<div class="qtimer" aria-hidden="true"><i></i></div>':''}<h3 class="qtext${lc}">${esc(q.q)}</h3>
      <div class="opts${longOpt?' long':''}">${order.map((oi,p)=>`<button class="opt" data-p="${p}"><span class="k">${p+1}</span><span>${esc(q.a[oi])}</span></button>`).join('')}</div>
      <div class="fbslot"><div class="fb wait"><div class="fbtext"><b class="pix">&gt; awaiting input<span class="cursor">&#9608;</span></b><p>Choose an answer with keys 1-4 or tap it. The explanation appears here.</p></div><button class="btn" disabled>Next &#9166;</button></div></div></div>`;
    const btns=[...el.querySelectorAll('.opt')];
    const hintSlot=el.querySelector('.hintslot');
    const drawHint=()=>{
      const n=opts.hints||0;
      hintSlot.innerHTML=`<span class="chip">Hints: ${n}</span>`+(n&&!done&&!hidden.length?` <button class="linkbtn" data-h="1">Use 50/50</button>`:'');
    };
    if(opts.hints!==undefined)drawHint();
    hintSlot.onclick=e=>{
      if(!e.target.dataset.h||done||hidden.length||!opts.hints)return;
      opts.hints--;if(opts.onHint)opts.onHint();
      hidden=shuffle([0,1,2,3].filter(p=>order[p]!==0)).slice(0,2);
      hidden.forEach(p=>{btns[p].classList.add('gone');btns[p].disabled=true});drawHint();sfx.select();
    };
    const choose=p=>{
      if(done||hidden.includes(p))return;done=true;
      const ok=p>=0&&order[p]===0;   // p = -1 means the answer timer ran out
      btns.forEach((b,i)=>{b.disabled=true;if(order[i]===0)b.classList.add('correct');else if(i===p)b.classList.add('wrong');else b.classList.add('dim')});
      // explain why each wrong answer is wrong, right under that answer
      if(q.w)btns.forEach((b,i)=>{const oi=order[i];if(oi!==0&&q.w[oi])b.children[1].insertAdjacentHTML('beforeend',`<small class="why">${esc(q.w[oi])}</small>`)});
      if(opts.hints!==undefined)drawHint();
      opts.onAnswer&&opts.onAnswer(ok,performance.now()-t0,q.a[order[p]],p<0);
    };
    btns.forEach((b,p)=>b.onclick=()=>choose(p));
    UI.bindStar(el);
    // Optional answer timer (Settings > Gameplay). Pauses while UI.paused is set.
    if(opts.timer){
      const total=opts.timer*1000,bar=el.querySelector('.qtimer i');let left=total,last=performance.now();
      const tick=()=>{
        if(done||!el.isConnected||!bar.isConnected)return;
        const now=performance.now();if(!UI.paused)left-=now-last;last=now;
        bar.style.width=Math.max(0,100*left/total)+'%';bar.classList.toggle('low',left<5000);
        if(left<=0)return choose(-1);
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }
    let cont=null;
    UI.keyHandler=e=>{
      const n='1234'.indexOf(e.key);
      if(e.key==='s'||e.key==='S'){const sb=el.querySelector('[data-star]');if(sb)sb.click();return}
      if(n>=0&&!done)choose(n);
      else if((e.key==='Enter'||e.key===' ')&&cont){e.preventDefault();cont()}
    };
    return{
      feedback(ok,title,btn,onCont,extra){
        const slot=el.querySelector('.fbslot');
        const bx=srsBox('q'+q.id),rv=bx===null?'':` <span class="chip">next review: ${SRS_LABEL[bx]}</span>`;
        slot.innerHTML=`<div class="fb ${ok?'ok':'no'}"><div class="fbtext"><b class="pix">${title}</b>${extra||''}${rv}<p>${ok?'':'<strong>Correct answer:</strong> '+esc(q.a[0])+'<br>'}${esc(q.e)}</p></div><button class="btn" id="contBtn">${btn} &#9166;</button></div>`;
        let fired=false;
        cont=()=>{if(fired)return;fired=true;cont=null;onCont()};
        const b=slot.querySelector('#contBtn');b.onclick=cont;
        setTimeout(()=>b.focus({preventScroll:true}),30);
      }
    };
  },

  // ---------- PBQ: matching (tap a term, then tap its match) ----------
  match(el,set,onDone,opts){
    opts=opts||{};
    // Exam mode (opts.exam): answers live in opts.state and are only graded when the exam is submitted.
    const st=opts.state||{};
    const left=st.left||(st.left=shuffle(set.pairs.map((p,i)=>i))),right=st.right||(st.right=shuffle(set.pairs.map((p,i)=>i)));
    const link=st.link||(st.link={});let sel=null,checked=false;
    const COLORS=['#5ee6ff','#ff5c8a','#a98bff','#3dff9a','#ffc94d','#ff9b4d'];
    const draw=()=>{
      const used=Object.values(link);
      const colorOf=li=>{const k=Object.keys(link).map(Number).indexOf(li);return k<0?null:COLORS[k%COLORS.length]};
      const rightColor=ri=>{const li=Object.keys(link).find(k=>link[k]===ri);return li===undefined?null:colorOf(+li)};
      el.innerHTML=`<div class="pbq">
        <div class="qmeta"><span class="chip pbqchip">PBQ &middot; Match</span>${opts.chip?`<span class="chip">${opts.chip}</span>`:''}</div>
        <h3>${esc(set.title)}</h3>
        <p class="tiny">Tap a term on the left, then the item it matches on the right. Tap a matched term again to undo.</p>
        <div class="mcols">
          <div class="mcol">${left.map(li=>{const c=colorOf(li);let cls='mi';if(sel===li)cls+=' sel';if(checked)cls+=link[li]===li?' correct':' wrong';
            return `<button class="${cls}" data-l="${li}" ${checked?'disabled':''} style="${c?`--mc:${c}`:''}">${c?'<i></i>':''}${esc(set.pairs[li][0])}</button>`}).join('')}</div>
          <div class="mcol">${right.map(ri=>{const c=rightColor(ri);let cls='mi r';if(used.includes(ri))cls+=' used';
            return `<button class="${cls}" data-r="${ri}" ${checked?'disabled':''} style="${c?`--mc:${c}`:''}">${c?'<i></i>':''}${esc(set.pairs[ri][1])}</button>`}).join('')}</div>
        </div>
        ${checked?`<div class="fb ${score===set.pairs.length?'ok':'no'}"><b class="pix">${score} / ${set.pairs.length} correct</b><p>${set.pairs.map(p=>`<span class="yes">${esc(p[0])}</span> &rarr; ${esc(p[1])}`).join('<br>')}</p><button class="btn" id="pbqCont">Continue &rarr;</button></div>`
          :opts.exam?`<div class="row"><span class="tiny">${Object.keys(link).length} / ${set.pairs.length} matched &middot; graded when you submit the exam</span></div>`
          :`<div class="row"><button class="btn" id="pbqCheck" ${Object.keys(link).length<set.pairs.length?'disabled':''}>Check answers</button><span class="tiny">${Object.keys(link).length} / ${set.pairs.length} matched</span></div>`}
      </div>`;
      if(checked){const b=el.querySelector('#pbqCont');b.onclick=()=>onDone(score,set.pairs.length);b.focus({preventScroll:true})}
    };
    let score=0;
    el.onclick=e=>{
      const b=e.target.closest('button');if(!b||checked)return;
      if(b.id==='pbqCheck'){checked=true;score=set.pairs.filter((p,i)=>link[i]===i).length;score===set.pairs.length?sfx.win():sfx.hurt();draw();return}
      if(b.dataset.l!==undefined){const li=+b.dataset.l;if(link[li]!==undefined){delete link[li];sel=null}else sel=sel===li?null:li;sfx.select();draw()}
      else if(b.dataset.r!==undefined&&sel!==null){const ri=+b.dataset.r;Object.keys(link).forEach(k=>{if(link[k]===ri)delete link[k]});link[sel]=ri;sel=null;sfx.tick();draw()}
      if(opts.onChange)opts.onChange();
    };
    UI.keyHandler=e=>{if(checked&&e.key==='Enter'){e.preventDefault();onDone(score,set.pairs.length)}};
    draw();
  },

  // ---------- PBQ: ordering (tap items in the right sequence) ----------
  order(el,set,onDone,opts){
    opts=opts||{};
    const st=opts.state||{};
    const pool=st.pool||(st.pool=shuffle(set.items.map((x,i)=>i)));const seq=st.seq||(st.seq=[]);let checked=false,score=0;
    const draw=()=>{
      el.innerHTML=`<div class="pbq">
        <div class="qmeta"><span class="chip pbqchip">PBQ &middot; Order</span>${opts.chip?`<span class="chip">${opts.chip}</span>`:''}</div>
        <h3>${esc(set.title)}</h3>
        <p class="tiny">Tap the steps in order. Tap a placed step to send it back.</p>
        <ol class="seq">${set.items.map((x,pos)=>{const it=seq[pos];let cls='slot';if(it!==undefined)cls+=' filled';if(checked)cls+=it===pos?' correct':' wrong';
          return `<li><button class="${cls}" data-s="${pos}" ${checked||it===undefined?'disabled':''}><span class="k">${pos+1}</span><span>${it!==undefined?esc(set.items[it]):'&nbsp;'}</span></button></li>`}).join('')}</ol>
        ${checked?'':`<div class="pool">${pool.filter(i=>!seq.includes(i)).map(i=>`<button class="mi" data-i="${i}">${esc(set.items[i])}</button>`).join('')}</div>`}
        ${checked?`<div class="fb ${score===set.items.length?'ok':'no'}"><b class="pix">${score} / ${set.items.length} in the right place</b><p>${set.items.map((x,i)=>`${i+1}. ${esc(x)}`).join('<br>')}</p><button class="btn" id="pbqCont">Continue &rarr;</button></div>`
          :`<div class="row">${opts.exam?`<span class="tiny">${seq.length} / ${set.items.length} placed &middot; graded when you submit the exam</span>`:`<button class="btn" id="pbqCheck" ${seq.length<set.items.length?'disabled':''}>Check order</button>`}<button class="btn ghost sm" id="pbqClear" ${seq.length?'':'disabled'}>Clear</button></div>`}
      </div>`;
      if(checked){const b=el.querySelector('#pbqCont');b.onclick=()=>onDone(score,set.items.length);b.focus({preventScroll:true})}
    };
    el.onclick=e=>{
      const b=e.target.closest('button');if(!b||checked)return;
      if(b.id==='pbqCheck'){checked=true;score=seq.filter((it,pos)=>it===pos).length;score===set.items.length?sfx.win():sfx.hurt();draw();return}
      if(b.id==='pbqClear'){seq.length=0;draw()}
      else if(b.dataset.i!==undefined){seq.push(+b.dataset.i);sfx.tick();draw()}
      else if(b.dataset.s!==undefined){seq.splice(+b.dataset.s,1);sfx.select();draw()}
      if(opts.onChange)opts.onChange();
    };
    UI.keyHandler=e=>{if(checked&&e.key==='Enter'){e.preventDefault();onDone(score,set.items.length)}};
    draw();
  },

  // Random PBQ, optionally limited to a domain.
  randomPbq(d){
    const all=allPbqs();   // matching, ordering and the simulation PBQs (sims.js)
    const f=d?all.filter(x=>x.s.d===d):all;
    return pick(f.length?f:all);
  },
  runPbq(el,p,onDone,opts){if(p.kind==='match')UI.match(el,p.s,onDone,opts);else if(p.kind==='order')UI.order(el,p.s,onDone,opts);else SIM_KINDS[p.kind].run(el,p.s,onDone,opts)}
};

document.addEventListener('keydown',e=>{
  if(UI._modal){if(e.key==='Escape')UI._modal();return}
  if(e.target.tagName==='INPUT'||e.target.tagName==='SELECT'||e.target.tagName==='TEXTAREA')return;
  if(UI.keyHandler)UI.keyHandler(e);
});
