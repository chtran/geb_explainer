/* Hover (or tap) any <span class="term"> to see its plain-language definition from assets/glossary.js. */
(function(){
  const G=window.GEB_GLOSSARY||{};
  const norm=t=>t.toLowerCase().replace(/[’]/g,"'").replace(/\s+/g,' ').trim();
  function lookup(t){
    t=norm(t); if(G[t])return G[t];
    for(const s of [t.replace(/es$/,''),t.replace(/s$/,'')]) if(G[s])return G[s];
    return null;
  }
  const tip=document.createElement('div'); tip.className='termtip'; tip.id='termtip'; tip.setAttribute('role','tooltip'); tip.hidden=true; document.body.appendChild(tip);
  let cur=null;
  function show(el){
    const g=lookup(el.textContent); if(!g)return;
    cur=el; tip.innerHTML='<b>'+el.textContent+'</b> '+g.def; tip.hidden=false;
    const r=el.getBoundingClientRect(), w=tip.offsetWidth, h=tip.offsetHeight;
    let x=Math.min(Math.max(8,r.left), window.innerWidth-w-8), y=r.bottom+6;
    if(y+h>window.innerHeight-8) y=r.top-h-6;
    tip.style.left=(x+window.scrollX)+'px'; tip.style.top=(y+window.scrollY)+'px';
  }
  function hide(){tip.hidden=true;cur=null;}
  document.querySelectorAll('.term').forEach(el=>{
    if(!lookup(el.textContent))return;
    el.tabIndex=0; el.setAttribute('aria-describedby','termtip');
    el.addEventListener('mouseenter',()=>show(el));
    el.addEventListener('mouseleave',hide);
    el.addEventListener('focus',()=>show(el));
    el.addEventListener('blur',hide);
    el.addEventListener('click',e=>{e.stopPropagation(); cur===el?hide():show(el);});
  });
  document.addEventListener('click',hide); window.addEventListener('scroll',()=>{if(cur)show(cur);},{passive:true});
})();
