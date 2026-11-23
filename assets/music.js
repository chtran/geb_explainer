/* Shared audio + piano-roll helpers for GEB explainers */
/* ============ AUDIO CORE ============ */
let AC=null, bus=null;
function ac(){
  if(!AC){AC=new (window.AudioContext||window.webkitAudioContext)();}
  if(AC.state==='suspended') AC.resume();
  return AC;
}
function newBus(){
  const c=ac();
  if(bus){try{bus.gain.setTargetAtTime(0,c.currentTime,0.02);const b=bus;setTimeout(()=>b.disconnect(),300);}catch(e){}}
  bus=c.createGain(); bus.gain.value=0.9;
  const comp=c.createDynamicsCompressor(); bus.connect(comp); comp.connect(c.destination);
  return bus;
}
function stopSound(){
  if(bus&&AC){const b=bus;b.gain.setTargetAtTime(0,AC.currentTime,0.02);setTimeout(()=>{try{b.disconnect()}catch(e){}},300);bus=null;}
  anims.forEach(f=>f.stop&&f.stop()); anims.clear();
  if(typeof stopShepard==='function')stopShepard();
  releaseButton();
}
/* Play/Stop toggle buttons: while a button's sound plays, it reads "■ Stop"
   and clicking it stops that sound. Starting any other sound resets it. */
let activeBtn=null;
function releaseButton(){
  if(activeBtn){activeBtn.textContent=activeBtn.dataset.label;activeBtn.classList.remove('on');activeBtn=null;}
}
function playToggle(btn,start){
  btn.dataset.label=btn.textContent;
  btn.onclick=()=>{
    if(activeBtn===btn){stopSound();return;}
    start();                       // start() calls stopSound() first, which resets any other button
    activeBtn=btn; btn.textContent='■ Stop'; btn.classList.add('on');
  };
}
const anims=new Set();
const mtof=m=>440*Math.pow(2,(m-69)/12);
function pluck(out,midi,t,dur,gain=0.22,color='harpsi'){
  const c=ac(), f=mtof(midi);
  const o=c.createOscillator(); o.type=color==='soft'?'triangle':'sawtooth'; o.frequency.value=f;
  const o2=c.createOscillator(); o2.type='triangle'; o2.frequency.value=f*2.001;
  const g2=c.createGain(); g2.gain.value=0.3;
  const fl=c.createBiquadFilter(); fl.type='lowpass'; fl.Q.value=1;
  fl.frequency.setValueAtTime(Math.min(f*9,12000),t); fl.frequency.exponentialRampToValueAtTime(Math.max(f*1.6,300),t+0.5);
  const g=c.createGain();
  const hold=Math.max(t+0.27,t+dur-0.04);
  g.gain.setValueAtTime(0.0001,t); g.gain.exponentialRampToValueAtTime(gain,t+0.008);
  g.gain.exponentialRampToValueAtTime(gain*0.4,t+0.26); g.gain.setValueAtTime(gain*0.4,hold);
  g.gain.exponentialRampToValueAtTime(0.0001,hold+0.22);
  o.connect(fl); o2.connect(g2); g2.connect(fl); fl.connect(g); g.connect(out);
  o.start(t); o2.start(t); o.stop(hold+0.25); o2.stop(hold+0.25);
}

/* ============ THEMES ============ */
// [midi or null(rest), beats]
const ROYAL=[[60,2],[63,2],[67,2],[68,2],[59,2],[null,1],[67,1],[66,2],[65,2],[64,2],[63,2],[62,1],[61,1],[60,1],[59,.5],[57,.5],[55,1],[60,1],[65,1],[63,2],[62,2],[60,3]];
const FJ=[[60,1],[62,1],[64,1],[60,1],[60,1],[62,1],[64,1],[60,1],[64,1],[65,1],[67,2],[64,1],[65,1],[67,2],
  [67,.5],[69,.5],[67,.5],[65,.5],[64,1],[60,1],[67,.5],[69,.5],[67,.5],[65,.5],[64,1],[60,1],[60,1],[55,1],[60,2],[60,1],[55,1],[60,2]];
function toEvents(seq,offset=0){let t=offset,ev=[];for(const [p,d] of seq){if(p!=null)ev.push({p,s:t,d});t+=d;}return ev;}
function seqLen(seq){return seq.reduce((a,[,d])=>a+d,0);}

/* ============ THEME ============ */
/* Canvas can't read CSS variables: col('var(--ink)') or col('--ink', alpha) gives the current theme's colour. */
function col(c,a){
  const m=/^(?:var\()?(--[\w-]+)\)?$/.exec(c);
  if(m)c=getComputedStyle(document.documentElement).getPropertyValue(m[1]).trim();
  if(a!=null&&/^#[0-9a-f]{6}$/i.test(c))c='rgba('+[1,3,5].map(i=>parseInt(c.substr(i,2),16))+','+a+')';
  return c;
}
/* When the system switches light/dark, pages redraw their canvases (they already redraw on resize). */
matchMedia('(prefers-color-scheme: dark)').addEventListener('change',()=>{dispatchEvent(new Event('themechange'));dispatchEvent(new Event('resize'));});

/* ============ PIANO ROLL ============ */
function setupCanvas(cv){const r=window.devicePixelRatio||1;if(!cv._h)cv._h=+cv.getAttribute('height');const w=cv.clientWidth||600;if(cv._w!==w||cv._r!==r){cv._w=w;cv._r=r;cv.width=w*r;cv.height=cv._h*r;cv.style.height=cv._h+'px';}const x=cv.getContext('2d');x.setTransform(r,0,0,r,0,0);return x;}
function drawRoll(cv,voices,playBeat=-1){
  const x=setupCanvas(cv), W=cv._w, H=cv._h;
  x.clearRect(0,0,W,H);
  let all=voices.flatMap(v=>v.ev); if(!all.length)return;
  let lo=Math.min(...all.map(e=>e.p))-2, hi=Math.max(...all.map(e=>e.p))+2;
  let end=Math.max(...all.map(e=>e.s+e.d));
  const pad=14, bx=b=>pad+(W-2*pad)*b/end, py=p=>H-pad-(H-2*pad)*(p-lo)/(hi-lo);
  // grid
  x.strokeStyle=col('var(--grid)');x.lineWidth=1;
  for(let b=0;b<=end;b+=4){x.beginPath();x.moveTo(bx(b),pad/2);x.lineTo(bx(b),H-pad/2);x.stroke();}
  for(let p=Math.ceil(lo);p<=hi;p++){if(p%12===0){x.strokeStyle=col('var(--rule)');x.beginPath();x.moveTo(pad,py(p));x.lineTo(W-pad,py(p));x.stroke();x.fillStyle=col('var(--mute)');x.font='10px Inter';x.fillText('C'+(p/12-1),2,py(p)-2);}}
  if(voices.clashes){x.fillStyle=col('--clash',.16);for(const t of voices.clashes.times){x.fillRect(bx(t),pad/2,Math.max(1.5,bx(t+.25)-bx(t)),H-pad);}}
  const nh=Math.max(4,Math.min(10,(H-2*pad)/(hi-lo)*0.9));
  for(const v of voices){
    for(const e of v.ev){
      const active=playBeat>=e.s&&playBeat<e.s+e.d;
      x.fillStyle=col(v.color); x.globalAlpha=active?1:(playBeat<0?0.85:0.45);
      const X=bx(e.s),Y=py(e.p)-nh/2,w=Math.max(2,bx(e.s+e.d)-bx(e.s)-2);
      x.beginPath(); if(x.roundRect)x.roundRect(X,Y,w,nh,3); else x.rect(X,Y,w,nh); x.fill();
      if(active){x.globalAlpha=.25;x.beginPath();x.arc(X+w/2,Y+nh/2,nh*1.6,0,7);x.fill();}
    }
  }
  x.globalAlpha=1;
  if(playBeat>=0){x.strokeStyle=col('var(--gold)');x.lineWidth=2;x.beginPath();x.moveTo(bx(playBeat),0);x.lineTo(bx(playBeat),H);x.stroke();}
}
function playVoices(cv,voices,spb){
  stopSound(); const out=newBus(), c=ac(), t0=c.currentTime+0.08;
  let end=0;
  for(const v of voices){for(const e of v.ev){pluck(out,e.p,t0+e.s*spb,e.d*spb,v.gain||0.2,v.timbre);end=Math.max(end,e.s+e.d);}}
  const myBus=out; let raf;
  const anim={stop(){cancelAnimationFrame(raf);drawRoll(cv,voices);}};
  anims.add(anim);
  (function frame(){const b=(c.currentTime-t0)/spb; if(b>end+0.3||bus!==myBus){anim.stop();anims.delete(anim);if(bus===myBus)releaseButton();return;} drawRoll(cv,voices,Math.max(0,b)); raf=requestAnimationFrame(frame);})();
}

