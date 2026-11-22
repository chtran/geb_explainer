/* Adds "All chapters" link at the top and previous/next links at the bottom of a chapter page.
   The page declares itself with <body data-chapter="<folder id>">. */
(function(){
  var id=document.body.dataset.chapter, toc=(window.GEB_TOC||[]).filter(function(e){return e.id;});
  var i=toc.findIndex(function(e){return e.id===id;}); if(i<0)return;
  var bar=document.createElement('div'); bar.className='sitebar';
  bar.innerHTML='<a href="../">← All chapters</a><a href="../glossary.html">Glossary</a>';
  document.body.insertBefore(bar,document.body.firstChild);
  function link(e,label,cls){
    if(!e) return '<span class="'+cls+'"></span>';
    var inner='<div class="lbl">'+label+'</div>'+e.title;
    return e.done?'<a class="'+cls+'" href="../'+e.id+'/">'+inner+'</a>':'<span class="'+cls+'">'+inner+'<div class="lbl" style="margin-top:4px">coming soon</div></span>';
  }
  var pg=document.createElement('nav'); pg.className='pager';
  pg.innerHTML=link(toc[i-1],'← Previous','pv')+link(toc[i+1],'Next →','nx');
  var f=document.querySelector('footer'); f.parentNode.insertBefore(pg,f);
})();
