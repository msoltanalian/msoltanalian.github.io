
async function loadJSON(path){ const r = await fetch(path); return await r.json(); }
function el(html){ const t=document.createElement('template'); t.innerHTML=html.trim(); return t.content.firstChild; }

async function renderPubs(){
  const pubList = document.getElementById('pub-list'); if(!pubList) return;
  const pubs = await loadJSON('data/publications.json');
  const types = [...new Set(pubs.map(p=>p.type))].sort();
  const years = [...new Set(pubs.map(p=>p.year))].sort((a,b)=>b-a);
  const chips = document.getElementById('pub-filters');
  types.forEach(t=> chips.appendChild(el(`<button class="chip" data-type="${t}">${t}</button>`)) );
  const yearSel = document.getElementById('year-select');
  years.forEach(y=> yearSel.appendChild(el(`<option value="${y}">${y}</option>`)) );
  yearSel.insertBefore(el(`<option value="">All years</option>`), yearSel.firstChild);
  function apply(){
    const type = [...chips.querySelectorAll('.chip.active')].map(c=>c.dataset.type);
    const year = yearSel.value;
    const q = document.getElementById('pub-search').value.toLowerCase().trim();
    pubList.innerHTML='';
    pubs.filter(p => (type.length===0||type.includes(p.type)) && (!year||String(p.year)===year) && (!q||`${p.title} ${p.authors} ${p.venue}`.toLowerCase().includes(q)))
        .sort((a,b)=> (b.year-a.year)||a.title.localeCompare(b.title))
        .forEach(p=>{
          const links=(p.links||[]).map(l=>`<a class="badge" href="${l.url}" target="_blank" rel="noopener">${l.label}</a>`).join(' ');
          const notes = p.notes?`<span class="badge">${p.notes}</span>`:'';
          pubList.appendChild(el(`<div class="pub"><div class="title">${p.title}</div><div class="meta">${p.authors} — <em>${p.venue}</em> (${p.year})</div><div class="badges">${notes} ${links}</div></div>`));
        });
  }
  chips.addEventListener('click', (e)=>{ if(e.target.classList.contains('chip')){ e.target.classList.toggle('active'); apply();}});
  document.getElementById('pub-search').addEventListener('input', apply);
  document.getElementById('year-select').addEventListener('change', apply);
  apply();
}

async function renderNews(){
  const list = document.getElementById('news-list'); if(!list) return;
  const items = await loadJSON('data/news.json');
  list.innerHTML='';
  items.sort((a,b)=> b.date.localeCompare(a.date)).forEach(n=>{
    const ym=n.date.split('-'); const y=ym[0], m=ym[1]||'01';
    const dateStr = new Date(`${y}-${m}-01`).toLocaleDateString(undefined,{year:'numeric', month:'short'});
    list.appendChild(el(`<div class="pub"><div class="title">${n.title}</div><div class="meta">${dateStr} — <span class="badge">${n.tag}</span></div></div>`));
  });
}
document.addEventListener('DOMContentLoaded', ()=>{ renderPubs(); renderNews(); });
