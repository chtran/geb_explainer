/* Adds "All chapters" link at the top and previous/next links at the bottom of a chapter page.
   The page declares itself with <body data-chapter="<folder id>">. */
(function(){
  var id=document.body.dataset.chapter, toc=(window.GEB_TOC||[]).filter(function(e){return e.id;});
  var i=toc.findIndex(function(e){return e.id===id;}); if(i<0)return;
  var bar=document.createElement('div'); bar.className='sitebar';
  bar.innerHTML='<a href="../">← All chapters</a>';
  document.body.insertBefore(bar,document.body.firstChild);
  function link(e,label,cls){
    if(!e) return '<span class="'+cls+'"></span>';
    var name=(e.dialogue&&e.chapter)?e.dialogue+' + '+e.chapter:e.title;
    var inner='<div class="lbl">'+label+'</div>'+name;
    return e.done?'<a class="'+cls+'" href="../'+e.id+'/">'+inner+'</a>':'<span class="'+cls+'">'+inner+'<div class="lbl" style="margin-top:4px">coming soon</div></span>';
  }
  var pg=document.createElement('nav'); pg.className='pager';
  pg.innerHTML=link(toc[i-1],'← Previous','pv')+link(toc[i+1],'Next →','nx');
  var f=document.querySelector('footer'); f.parentNode.insertBefore(pg,f);
})();

/* Scroll-spy: as the reader scrolls, highlight the current section in the
   toolbar and put its #id in the address bar (without adding history entries),
   so the URL always points at the section on screen. */
(function(){
  var secs=[].slice.call(document.querySelectorAll('main section[id]')); if(!secs.length)return;
  var links={}; [].forEach.call(document.querySelectorAll('#toc a[href^="#"]'),function(a){links[a.getAttribute('href').slice(1)]=a;});
  var bar=document.querySelector('.toolbar'), cur, ticking=false;
  function update(){
    ticking=false;
    var off=Math.max((bar?bar.offsetHeight:0)+24,window.innerHeight*0.3), id=null;
    for(var i=0;i<secs.length;i++){ if(secs[i].getBoundingClientRect().top<=off) id=secs[i].id; else break; }
    if((window.innerHeight+window.scrollY)>=document.documentElement.scrollHeight-2) id=secs[secs.length-1].id;
    if(id===cur)return; cur=id;
    for(var k in links) links[k].classList.toggle('on',k===id);
    var url=location.pathname+location.search+(id?'#'+id:'');
    if(url!==location.pathname+location.search+location.hash) history.replaceState(history.state,'',url);
  }
  window.addEventListener('scroll',function(){ if(!ticking){ticking=true;requestAnimationFrame(update);} },{passive:true});
  /* No initial update(): on load the browser must first scroll to any #id in the URL. */
})();

/* Chapter sidebar: every page of the site, in book order, on the left.
   Open by default on wide screens (remembered per viewer); a slide-in drawer
   on narrow ones. Toggled from the "Chapters" button in the toolbar. */
(function(){
  var id=document.body.dataset.chapter, all=window.GEB_TOC||[]; if(!id||!all.length)return;
  var WIDE=window.matchMedia('(min-width:1180px)'), KEY='geb-side-open';
  function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
  var html='', n=0;
  all.forEach(function(e){
    if(e.part){ html+='<div class="sd-part">'+esc(e.part)+'</div>'; return; }
    n++;
    var m=/^Chapter ([IVXL]+):\s*(.*)$/.exec(e.chapter||''), k, t;
    if(m){ k='Chapter '+m[1]; t=m[2]; } else if(e.chapter){ k='Introduction'; t=e.chapter.replace(/^Introduction:\s*/,''); } else { k='Final dialogue'; t=e.title; }
    var body='<span class="sd-n">'+String(n).padStart(2,'0')+'</span><span class="sd-t"><span class="sd-k">'+esc(k)+'</span>'+esc(t)+
      (e.dialogue&&e.chapter?'<span class="sd-d">'+esc(e.dialogue)+'</span>':'')+'</span>';
    if(e.id===id) html+='<a class="sd-i cur" href="#" aria-current="page">'+body+'</a>';
    else if(e.done) html+='<a class="sd-i" href="../'+e.id+'/">'+body+'</a>';
    else html+='<span class="sd-i soon" title="Coming soon">'+body+'</span>';
  });
  var side=document.createElement('aside'); side.className='side'; side.id='side'; side.setAttribute('aria-label','Chapters');
  side.innerHTML='<div class="sd-head"><a class="sd-home" href="../"><span class="sd-geb"><i class="g">G</i><i class="e">E</i><i class="b">B</i></span>All chapters</a>'+
    '<button class="sd-close" type="button" aria-label="Hide chapter list" title="Hide chapter list">«</button></div><nav class="sd-list">'+html+'</nav>';
  var shade=document.createElement('div'); shade.className='side-shade';
  document.body.appendChild(side); document.body.appendChild(shade);
  var btn=document.createElement('button'); btn.type='button'; btn.className='side-btn'; btn.setAttribute('aria-controls','side');
  btn.innerHTML='<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="M2 3.5h12M2 8h12M2 12.5h12" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg><span>Chapters</span>';
  var tin=document.querySelector('.toolbar .in');
  if(tin) tin.insertBefore(btn,tin.firstChild); else { btn.classList.add('float'); document.body.appendChild(btn); }
  function get(){ try{return localStorage.getItem(KEY);}catch(e){return null;} }
  function put(v){ try{localStorage.setItem(KEY,v);}catch(e){} }
  function set(open,remember){
    document.body.classList.toggle('side-open',open);
    btn.setAttribute('aria-expanded',open); btn.classList.toggle('on',open);
    side.toggleAttribute('inert',!open);
    if(remember&&WIDE.matches) put(open?'1':'0');
  }
  function initial(){ return WIDE.matches && get()!=='0'; }
  btn.onclick=function(){ set(!document.body.classList.contains('side-open'),true); };
  side.querySelector('.sd-close').onclick=function(){ set(false,true); };
  shade.onclick=function(){ set(false,false); };
  side.querySelector('.cur').onclick=function(ev){ ev.preventDefault(); window.scrollTo({top:0}); if(!WIDE.matches)set(false,false); };
  document.addEventListener('keydown',function(ev){ if(ev.key==='Escape'&&!WIDE.matches&&document.body.classList.contains('side-open')) set(false,false); });
  (WIDE.addEventListener?WIDE.addEventListener.bind(WIDE,'change'):WIDE.addListener.bind(WIDE))(function(){ set(initial(),false); });
  document.body.classList.add('has-side');
  set(initial(),false);
  requestAnimationFrame(function(){
    document.body.classList.add('side-ready');
    var c=side.querySelector('.cur'), l=side.querySelector('.sd-list');
    if(c) l.scrollTop=c.offsetTop-l.clientHeight/3;
  });
})();
