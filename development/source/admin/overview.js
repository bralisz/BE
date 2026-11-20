'use strict';

const styles = require('./overview-style');

function renderOverview({host, user, client, db, edit, publish, create, logout, resume, statsPage, avatar}) {
  const paths = {
    home:'M3 11l9-8 9 8 M5 10v11h5v-7h4v7h5V10', video:'M3 5h18v14H3z M10 9l5 3-5 3z',
    categories:'M3 4h7v7H3z M14 4h7v7h-7z M3 15h7v6H3z M14 15h7v6h-7z',
    users:'M16 21v-2a5 5 0 00-5-5H8a5 5 0 00-5 5v2 M14 7a4 4 0 11-8 0 4 4 0 018 0 M18 4a4 4 0 010 7 M18 15a4 4 0 013 4',
    stats:'M3 3v18h18 M7 16v-4 M12 16V6 M17 16V9',settings:'M3 7h5m4 0h9 M3 17h11m4 0h3 M8 4h4v6H8z M14 14h4v6h-4z',
    bell:'M4 17h16l-2-3V9a6 6 0 00-12 0v5z M10 21h4', exit:'M9 3H4v18h5 M10 12h11m-4-4 4 4-4 4',
    search:'M16 16l5 5 M18 10a8 8 0 11-16 0 8 8 0 0116 0',plus:'M12 5v14 M5 12h14',menu:'M3 6h18 M3 12h18 M3 18h18',
    calendar:'M3 5h18v16H3z M7 3v5 M17 3v5 M3 10h18'
  };
  const icon = key => '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="'+paths[key]+'"/></svg>';
  function node(tag, cls, text) {
    const el = document.createElement(tag);
    if (cls) el.className = cls;
    if (text != null) el.textContent = text;
    return el;
  }
  function button(cls, label, action) {
    const el = node('button', cls, label);
    el.type = 'button'; el.onclick = action;
    return el;
  }
  const root = node('div'); root.id = 'betv-overview';
  host.replaceChildren(root);
  const rail = node('nav','rail'); rail.id = 'overviewNav'; rail.setAttribute('aria-label','Painel administrativo');
  const body = node('div','body'); root.append(rail,body);
  const brand = node('a','brand','BE'); brand.href='/'; brand.title='Ver site'; brand.setAttribute('aria-label','Ver site'); rail.append(brand);
  const destinations = [
    ['dashboard','Dashboard','home'],['contents/videos','Conteúdo e vídeos','video'],['sections','Categorias','categories'],
    ['users','Usuários','users'],['statistics','Estatísticas','stats'],['operations','Configurações','settings'],['notifications','Notificações','bell']
  ];
  for (const [route,label,key] of destinations) {
    const link = node('a'); link.href='#/admin/'+route; link.title=label; link.setAttribute('aria-label',label);
    link.innerHTML=icon(key);
    if (route === (statsPage?'statistics':'dashboard')) link.setAttribute('aria-current','page');
    rail.append(link);
  }
  const exit = button('exit','',logout); exit.title='Sair'; exit.setAttribute('aria-label','Sair'); exit.innerHTML=icon('exit'); rail.append(exit);
  const name = String(user?.displayName || user?.profile?.displayName || user?.email?.split('@')[0] || 'admin');
  const portrait = avatar ? node('img','avatar') : node('span','avatar',name[0].toUpperCase());
  if (avatar) { portrait.src=avatar; portrait.alt=name; }
  rail.append(portrait);
  const header=node('header'), greeting=node('div','greeting'), tools=node('div','tools');
  const menu=button('menu','',()=>{const open=rail.classList.toggle('open');menu.setAttribute('aria-expanded',String(open));if(open)rail.querySelector('[aria-current]').focus();});
  menu.innerHTML=icon('menu'); menu.setAttribute('aria-label','Menu do painel');menu.setAttribute('aria-controls',rail.id);menu.setAttribute('aria-expanded','false');
  root.addEventListener('keydown',e=>{if(e.key==='Escape' && rail.classList.contains('open')){rail.classList.remove('open');menu.setAttribute('aria-expanded','false');menu.focus();}});
  greeting.append(node('h1','',statsPage?'Estatísticas':'Olá, '+name+'!'),node('small','',new Intl.DateTimeFormat('pt-BR',{weekday:'long',day:'numeric',month:'long'}).format(new Date())));
  const search=button('pill','',()=>document.querySelector('.workspace-search')?.click());
  search.innerHTML=icon('search')+' Buscar no painel';search.setAttribute('aria-haspopup','dialog');
  const newItem=button('pill primary','',create);newItem.innerHTML=icon('plus')+' Novo conteúdo';
  tools.append(search,newItem);header.append(menu,greeting,tools);body.append(header);
  const grid=node('div','grid');body.append(grid);
  function panel(title,cls='') {
    const box=node('section','panel '+cls),heading=node('div','row'),content=node('div');
    heading.append(node('h2','',title));box.append(heading,content);grid.append(box);
    return {box,heading,content};
  }
  function feedback(host,message,retry) {
    const box=node('div','feedback');box.setAttribute('role','status');box.innerHTML=icon('video');
    box.append(node('span','',message));
    if(retry)box.append(button('pill','Tentar novamente',retry));
    host.replaceChildren(box);
  }
  const overview=panel('Cadastros','summary');
  const range=node('select');range.setAttribute('aria-label','Período dos cadastros');
  for(const [n,label] of [[7,'7 dias'],[1,'Hoje']]){const option=node('option','',label);option.value=n;range.append(option);}
  overview.heading.append(range);
  const calendar=panel('Calendário','calendar');calendar.heading.insertAdjacentHTML('beforeend',icon('calendar'));
  const today=new Date(),first=new Date(today.getFullYear(),today.getMonth(),1),last=new Date(today.getFullYear(),today.getMonth()+1,0);
  calendar.content.append(node('p','',today.toLocaleDateString('pt-BR',{month:'long',year:'numeric'})));
  const month=node('div','month');calendar.content.append(month);
  ['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'].forEach(d=>month.append(node('span','',d)));
  for(let i=0;i<(first.getDay()+6)%7;i++)month.append(node('span'));
  for(let i=1;i<=last.getDate();i++){const d=node('span','day',i);if(i===today.getDate())d.setAttribute('aria-current','date');month.append(d);}
  const popular=panel('Destaques do catálogo');
  const pace=panel('Cadastros na semana');
  const fmt=n=>Number(n).toLocaleString('pt-BR',{maximumFractionDigits:1});
  function stat(label,value,detail){
    const el=node('div','ov-stat');el.append(node('span','',label),node('strong','',fmt(value)),node('small','',detail));return el;
  }
  function renderMetrics(data) {
    const days=(data.weeklyUsers||[]).filter(d=>d.date && Number.isFinite(Number(d.users))).slice().sort((a,b)=>String(a.date).localeCompare(String(b.date))).slice(-7);
    function chart(){
      overview.content.replaceChildren();
      if(!days.length){feedback(overview.content,'Sem histórico de cadastros.',loadMetrics);return;}
      const values=days.map(d=>Number(d.users)),sum=values.reduce((a,b)=>a+b,0),max=Math.max(...values),mean=sum/values.length;
      const one=range.value==='1';
      const selected=one?values.slice(-1):values;
      const points=selected.map((v,i)=>[(i+.5)*300/selected.length,61-v*54/Math.max(1,...selected)].join(',')).join(' ');
      const svg='<svg class="trend" viewBox="0 0 300 68" preserveAspectRatio="none" role="img" aria-label="Cadastros por dia: '+selected.join(', ')+'"><polyline fill="none" stroke="currentColor" stroke-width="2.5" vector-effect="non-scaling-stroke" points="'+points+'"/>'+selected.map((v,i)=>'<circle cx="'+(i+.5)*300/selected.length+'" cy="'+(61-v*54/Math.max(1,...selected))+'" r="2.4" fill="currentColor"/>').join('')+'</svg>';
      overview.content.insertAdjacentHTML('beforeend',svg);
      const row=node('div','ov-stats');
      row.append(stat(one?'Hoje':'No período',one?(data.todayUsers??values.at(-1)):sum,'novas contas'),stat('Média diária',mean,'últimos '+values.length+' dias'),stat('Pico diário',max,'últimos '+values.length+' dias'));overview.content.append(row);
      const active=values.filter(n=>n>0).length;const progress=node('progress');progress.value=active;progress.max=values.length;progress.setAttribute('aria-label','Dias com novos cadastros');
      pace.content.replaceChildren(node('p','',active+' de '+values.length+' dias com novas contas'),progress);
    }
    range.onchange=chart;chart();if(!days.length)feedback(pace.content,'Sem dias registrados.');
    popular.content.className='metric-list';popular.content.replaceChildren();
    for(const [key,label] of [['topViewed','visualizações'],['topSaved','salvamentos'],...(statsPage?[['topCommented','comentários']]:[])]){
      const metric=data[key];if(!metric?.title || !Number(metric.value))continue;
      const line=node('div');line.append(node('span','',metric.title),node('small','',fmt(metric.value)+' '+label));popular.content.append(line);
    }
    if(!popular.content.childElementCount)feedback(popular.content,'Ainda não há interações registradas.');
  }
  async function loadMetrics(){
    const panels=[overview,pace,popular];panels.forEach(p=>p.content.replaceChildren(node('div','loading')));
    try{const {data,error}=await client.rpc('get_admin_dashboard_metrics');if(error||!data)throw Error();renderMetrics(data);}
    catch{panels.forEach(p=>feedback(p.content,'Indicadores indisponíveis.',loadMetrics));}
  }
  loadMetrics();
  if(statsPage)return;
  const recent=panel('Conteúdos recentes','recent'),chips=node('div','chips'),items=node('div','items');
  recent.content.append(chips,items);
  const listLink=node('a','muted','Ver catálogo →');listLink.href='#/admin/contents/videos';recent.heading.append(listLink);
  const groups={videos:'Vídeo',movies:'Filme',series:'Série',news:'Álbum'};
  let request=0;
  async function loadRecent(filter) {
    const seq=++request;items.replaceChildren(node('div','loading'));
    [...chips.children].forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.filter===filter)));
    try {
      let query=client.from('content_items').select('id,collection,title:data->>title,active:data->>active,updated_at').in('collection',Object.keys(groups));
      if(filter==='hidden')query=query.eq('data->>active','false');
      if(filter==='live')query=query.or('data->>active.is.null,data->>active.eq.true');
      const {data,error}=await query.order('updated_at',{ascending:false}).limit(4);
      if(seq!==request)return;if(error)throw error;
      items.replaceChildren();if(!data.length)feedback(items,'Nenhum conteúdo neste filtro.');
      for(const row of data){
        const tile=button('tile','',async()=>{
          tile.disabled=true;
          try{const full=await db.get(row.collection,row.id);if(!full)throw Error();if(root.isConnected)await edit(row.collection,full);}
          catch{if(root.isConnected)feedback(items,'Não foi possível abrir o editor.',()=>loadRecent(filter));}
          finally{tile.disabled=false;}
        });
        tile.setAttribute('aria-label','Editar '+(row.title||groups[row.collection]));
        tile.append(node('small','',groups[row.collection]),node('strong','',row.title||'Sem título'),node('small','',String(row.active)==='false'?'Oculto · Editar →':'Publicado · Editar →'));if(String(row.active)==='false'){
          const group=node('div','tile-group');
          const post=button('chip publish','Publicar',async()=>{
            tile.disabled=post.disabled=true;
            try{const full=await db.get(row.collection,row.id);if(!full)throw Error();if(root.isConnected && full.active===false)await publish(row.collection,full);else if(root.isConnected)await loadRecent(filter);}
            catch{if(root.isConnected)feedback(items,'Não foi possível iniciar a publicação.',()=>loadRecent(filter));}
            finally{tile.disabled=post.disabled=false;}
          });
          post.setAttribute('aria-label','Publicar '+(row.title||groups[row.collection]));
          group.append(tile,post);items.append(group);
        }else items.append(tile);
      }
      const add=button('add','',create);add.innerHTML=icon('plus')+'Adicionar';items.append(add);
    }catch{if(seq===request)feedback(items,'Não foi possível carregar o catálogo.',()=>loadRecent(filter));}
  }
  for(const [key,label] of [['all','Todos'],['live','Publicados'],['hidden','Ocultos']]){
    const chip=button('chip',label,()=>loadRecent(key));chip.dataset.filter=key;chips.append(chip);
  }
  loadRecent('all');resume();
}

module.exports = '(() => {const style=document.createElement("style");style.id="betv-overview-style";style.textContent='+JSON.stringify(styles)+';if(!document.getElementById(style.id))document.head.append(style);window.BETVRenderOverview='+renderOverview.toString()+';})();';
