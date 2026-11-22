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
