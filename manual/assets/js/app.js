(()=>{'use strict';
const H=document.documentElement,root=H.dataset.root||'./',current=H.dataset.page||'',doc=H.dataset.group||'simdron',C=window.SIMDRON_CATALOG||[];
const abs=p=>root+p;
const esc=s=>String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const normalize=s=>String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
function nav(){const box=document.getElementById('sidebar-contents');if(!box)return;
 let groups=new Map();C.filter(x=>x.doc===doc).forEach(x=>{if(!groups.has(x.group))groups.set(x.group,[]);groups.get(x.group).push(x)});
 let html='';let opened=null;for(const [group,items] of groups){const active=items.some(x=>x.id===current);if(active)opened=group;
 html+=`<details class="treegroup" ${active?'open':''}><summary><span class="chev">›</span><span class="group-name">${esc(group.replace(/^\d+ · /,''))}</span><span class="group-total">${items.length}</span></summary><div class="treechildren">`;
 for(const item of items)html+=`<a href="${abs(item.url)}" class="treeitem ${item.id===current?'active':''}" ${item.id===current?'aria-current="page"':''}>${esc(item.title)}</a>`;
 html+='</div></details>'}
 box.innerHTML=html;
 box.querySelectorAll('details').forEach(d=>d.addEventListener('toggle',()=>{if(!d.open)return;box.querySelectorAll('details').forEach(other=>{if(other!==d)other.open=false})}));
 const active=box.querySelector('a.active');if(active)active.scrollIntoView({block:'nearest'});
}
function theme(){let stored='light';try{stored=localStorage.getItem('sd-doc-theme')||'light'}catch(_e){}H.setAttribute('data-theme',stored);const b=document.getElementById('theme-toggle');if(!b)return;
 b.innerHTML=stored==='dark'?'☀ <span>Claro</span>':'☾ <span>Oscuro</span>';
 b.addEventListener('click',()=>{const n=H.getAttribute('data-theme')==='light'?'dark':'light';H.setAttribute('data-theme',n);try{localStorage.setItem('sd-doc-theme',n)}catch(_e){}b.innerHTML=n==='dark'?'☀ <span>Claro</span>':'☾ <span>Oscuro</span>'})}
function search(){const l=document.getElementById('search-shade'),b=document.getElementById('open-search'),inp=document.getElementById('search-input'),res=document.getElementById('search-results');if(!l||!b)return;
 const open=()=>{l.classList.add('open');inp.value='';res.innerHTML='<div class="empty">Buscá un término o función en cualquiera de los dos manuales.</div>';inp.focus()};
 const close=()=>{l.classList.remove('open');b.focus()};b.addEventListener('click',open);document.getElementById('search-close').addEventListener('click',close);
 l.addEventListener('click',e=>{if(e.target===l)close()});
 inp.addEventListener('input',()=>{const q=normalize(inp.value.trim());if(q.length<2){res.innerHTML='<div class="empty">Escribí al menos dos letras.</div>';return}
 const terms=q.split(/\s+/),hits=[];for(const v of C){const title=normalize(v.title),g=normalize(v.group),text=normalize(v.text);if(terms.every(t=>(title+' '+g+' '+text).includes(t))){hits.push({v,score:((title.includes(q)?20:0)+(g.includes(q)?5:0)),snippet:(v.text||'').slice(0,170)})}}
 hits.sort((a,b)=>b.score-a.score);res.innerHTML=hits.length?hits.slice(0,35).map(({v,snippet})=>`<a class="searchresult" href="${abs(v.url)}"><small>${v.doc==='simdron'?'SimDron VR':'Mission Control'} · ${esc(v.group)}</small><strong>${esc(v.title)}</strong><p>${esc(snippet).slice(0,180)}…</p></a>`).join(''):'<div class="empty">No hay resultados.</div>'});
 document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();open()}if(e.key==='Escape')close()})}
function menu(){const toggle=document.getElementById('menu-toggle');if(toggle){toggle.addEventListener('click',()=>{document.getElementById('sidebar')?.classList.toggle('open')})}}
function copy(){const b=document.getElementById('copylink');if(!b)return;b.addEventListener('click',()=>{const done=()=>{b.textContent='✓ Enlace copiado';setTimeout(()=>b.textContent='⧉   Copiar enlace del capítulo',1600)};
 if(navigator.clipboard&&window.isSecureContext){navigator.clipboard.writeText(location.href).then(done).catch(()=>prompt('Copiar enlace',location.href))}else prompt('Copiar enlace',location.href)})}
function c2(){document.querySelectorAll('[data-mode]').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('[data-mode]').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-pressed',String(x===b))});document.querySelectorAll('[data-mode-panel]').forEach(x=>x.classList.toggle('active',x.dataset.modePanel===b.dataset.mode))}))}
nav();theme();search();menu();copy();c2();
})();