(() => {
  'use strict';
  const $=id=>document.getElementById(id),all=selector=>[...document.querySelectorAll(selector)];
  const pages=['inicio','pecas','como-fazemos','material-reciclagem','maquinas','software','projetos'];
  const titles=['Início','Peças','Como fazemos','Material e reciclagem','Máquinas','Software','Projetos + contato'];
  const universes=[
    {name:'Luminárias',kicker:'LUZ COMO MATÉRIA',phrase:'Luminárias de autor, impressas em 3D: pétalas, folhas e formas que só a nossa fábrica faz.',destination:'pecas/luminarias',tab:'Peças',legacy:1,background:'assets/luminarias/hero.webp',circle:'assets/luminarias/espiral.webp'},
    {name:'Móveis',kicker:'FORMAS PARA VIVER',phrase:'Mesas e cadeiras de forma contínua, feitas em uma peça só, com material reciclado.',destination:'pecas/moveis',tab:'Peças',legacy:0,background:'https://images.pexels.com/photos/6585744/pexels-photo-6585744.jpeg?auto=compress&cs=tinysrgb&w=2400'},
    {name:'Vasos e Decoração',kicker:'FORMAS PARA COMPOR',phrase:'Vasos, centros de mesa e peças decorativas. Design, curvas e texturas para dar identidade ao seu espaço.',destination:'pecas/vasos-decoracao',tab:'Peças',legacy:2,background:'assets/vasos-decoracao/fundo-conceito.svg',circle:'assets/vasos-decoracao/circulo-conceito.svg'},
    {name:'Painéis e Divisórias',kicker:'IMPRESSÃO 3D + MADEIRA',phrase:'Texturas, formas e luz para transformar espaços. Painéis e divisórias em madeira e impressão 3D, pensados para o seu ambiente.',destination:'pecas/paineis-divisorias',tab:'Peças',legacy:9,background:'assets/paineis-divisorias/fundo-conceito.svg',circle:'assets/paineis-divisorias/circulo-conceito.svg'},
    {name:'Arte e Esculturas',kicker:'DA IDEIA À FORMA. DA FORMA À ARTE.',phrase:'Esculturas autorais em impressão 3D. Curvas, vazios e volumes que dão uma nova presença ao seu espaço.',destination:'pecas/arte-esculturas',tab:'Peças',legacy:10,background:'assets/arte-esculturas/fundo-conceito.svg',circle:'assets/arte-esculturas/circulo-conceito.svg'},
    {name:'Jardins e Áreas Externas',kicker:'DESIGN QUE ENCONTRA A NATUREZA',phrase:'Floreiras, bancos e peças escultóricas em material cimentício impresso em 3D. Novas formas para viver do lado de fora.',destination:'pecas/jardins-areas-externas',tab:'Peças',legacy:11,background:'assets/jardins-externos/fundo-conceito.svg',circle:'assets/jardins-externos/circulo-conceito.svg'},
    {name:'Revestimentos e Fachadas',kicker:'A IDENTIDADE COMEÇA NA SUPERFÍCIE',phrase:'Relevos, módulos e materiais que dão expressão à arquitetura. Novas superfícies para paredes e fachadas.',destination:'pecas/revestimentos-fachadas',tab:'Peças',legacy:12,background:'assets/revestimentos-fachadas/fundo-conceito.svg',circle:'assets/revestimentos-fachadas/circulo-conceito.svg'},
    {name:'Reciclagem',kicker:'A MATÉRIA RECOMEÇA',phrase:'Imprimimos com pellet e plástico reciclado. O que sobra é moído e volta para a produção.',destination:'material-reciclagem',tab:'Material e reciclagem',legacy:5,background:'assets/reciclagem/hero.webp',circle:'assets/reciclagem/coleta.webp'},
    {name:'Sob medida',kicker:'SUA IDEIA, NOSSA FÁBRICA',phrase:'Traga um desenho, uma foto ou uma necessidade do seu espaço. Desenvolvemos a peça com você.',destination:'projetos',tab:'Projetos + contato',legacy:7,background:'https://images.pexels.com/photos/38850583/pexels-photo-38850583.jpeg?auto=compress&cs=tinysrgb&w=2400'},
    {name:'Feito por nós',kicker:'DO DESENHO À MÁQUINA',phrase:'Nossas peças nascem no nosso software e saem das nossas máquinas, de grande porte. Tudo feito aqui.',destination:'maquinas',tab:'Máquinas',legacy:6,background:'assets/tecnologia/fundo-v2.webp',circle:'assets/tecnologia/circulo-v2.webp'},
    {name:'Software',kicker:'NOSSO FATIADOR, NA WEB',phrase:'Crie vasos com textura e camadas não planas no navegador. Beta grátis, já no ar.',destination:'software',tab:'Software',legacy:8,fresh:true,background:'assets/software/visio-slicer-fundo.svg',circle:'assets/software/visio-slicer-circulo.svg'}
  ];
  // Keep each retained universe's record IDs, independently of its carousel position.
  const slots=universes.flatMap((c,i)=>['background','circle'].map(kind=>({id:c.legacy+':'+(c.fresh?'photo-slicer-':'')+kind,name:'Início / '+c.name+' / '+(kind==='background'?'fundo':'círculo'),page:'inicio',source:kind==='background'?c.background:c.circle||c.background,kind,collection:i})));
  const records=new Map();
  const source=slot=>records.get(slot.id)?.dataUrl||slot.source||'';
  const sized=(url,size)=>/^(data:|blob:)/.test(url)?url:url.replace('w=2400','w='+size);
  let activePage='inicio',activeDestination='inicio',editorBusy=false,editorReturn=null;
  const motion=matchMedia('(prefers-reduced-motion: reduce)'),mobile=matchMedia('(max-width:700px)'),collapsed=matchMedia('(max-width:1250px)');
  const menu=$('mainNav'),toggle=$('menuToggle'),hero=$('inicio');
  function setMenu(open){menu.classList.toggle('open',open);$('header').classList.toggle('menu-open',open);toggle.setAttribute('aria-expanded',String(open));$('menuLabel').textContent=open?'Fechar':'Menu';pauseAuto();}
  toggle.addEventListener('click',()=>setMenu(toggle.getAttribute('aria-expanded')!=='true'));
  menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>setMenu(false)));
  collapsed.addEventListener('change',()=>setMenu(false));
  document.addEventListener('click',e=>{if(!e.target.closest('#header'))setMenu(false);});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&toggle.getAttribute('aria-expanded')==='true'){setMenu(false);toggle.focus();}});
  addEventListener('scroll',()=>document.body.classList.toggle('page-scrolled',scrollY>24),{passive:true});
  function setFilter(value){
    const filter=all('[data-filter]').some(b=>b.dataset.filter===value)?value:'todos';
    all('[data-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.filter===filter)));
    all('.collection-soon').forEach(card=>{card.hidden=filter!=='todos'&&!card.dataset.categories.split(' ').includes(filter);});
    $('galleryCount').textContent='Em breve';return filter;
  }
  all('[data-filter]').forEach(b=>b.addEventListener('click',()=>{const filter=setFilter(b.dataset.filter);navigate(filter==='objetos'?'pecas/vasos-decoracao':'pecas'+(filter==='todos'?'':'/'+filter));}));
  const aliases={'revestimentos-fachadas':'pecas/revestimentos-fachadas','jardins-areas-externas':'pecas/jardins-areas-externas','arte-esculturas':'pecas/arte-esculturas','paineis-divisorias':'pecas/paineis-divisorias','pecas/objetos':'pecas/vasos-decoracao',objetos:'pecas/vasos-decoracao','vasos-decoracao':'pecas/vasos-decoracao',colecoes:'pecas',contato:'projetos',luminarias:'pecas/luminarias','modelos-luminarias':'pecas/luminarias',reciclagem:'material-reciclagem','processo-reciclagem':'material-reciclagem',materiais:'material-reciclagem',tecnologia:'maquinas','areas-tecnologia':'maquinas','conexoes-tecnologia':'maquinas'};
  function route(){
    const raw=location.hash.slice(1)||'inicio',mapped=aliases[raw]||raw;
    let [page,category]=mapped.split('/');if(!pages.includes(page))page='inicio';
    if(mapped!==raw||!pages.includes(mapped.split('/')[0]))history.replaceState(null,'','#'+page+(category?'/'+category:''));
    const destination=page+(category?'/'+category:'');const changed=activeDestination!==destination;activeDestination=destination;activePage=page;
    all('[data-page]').forEach(el=>el.hidden=el.dataset.page!==page);
    menu.querySelectorAll('a').forEach(a=>{if(a.hash==='#'+page)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
    document.title=titles[pages.indexOf(page)]+' — VISIOARTE';$('skipLink').href='#page-'+page;setMenu(false);
    if(page==='pecas'){
      const furniture=category==='moveis',decoration=category==='vasos-decoracao',panels=category==='paineis-divisorias',art=category==='arte-esculturas',garden=category==='jardins-areas-externas',facade=category==='revestimentos-fachadas';
      $('piecesOverview').hidden=furniture||decoration||panels||art||garden||facade;
      $('furniturePage').hidden=!furniture;
      $('decorPage').hidden=!decoration;
      $('panelsPage').hidden=!panels;
      $('artPage').hidden=!art;
      $('gardenPage').hidden=!garden;
      $('facadePage').hidden=!facade;
      setFilter(decoration?'objetos':category||'todos');
      if(furniture)document.title='Móveis impressos em 3D — VISIOARTE';
      if(decoration)document.title='Vasos e Decoração — VISIOARTE';
      if(panels)document.title='Painéis e Divisórias — VISIOARTE';
      if(art)document.title='Arte e Esculturas — VISIOARTE';
      if(garden)document.title='Jardins e Áreas Externas — VISIOARTE';
      if(facade)document.title='Revestimentos e Fachadas — VISIOARTE';
    }
    requestAnimationFrame(()=>{if(page==='inicio')measure();scrollTo({top:0,behavior:'instant'});if(changed)$('page-'+page).focus({preventScroll:true});if(page==='inicio'&&category==='sobre')$('quem-somos').scrollIntoView({block:'start',behavior:'instant'});});pauseAuto();
  }
  function navigate(destination){const hash='#'+destination;if(location.hash!==hash)history.pushState(null,'',hash);route();}
  all('a[href^="#"]').filter(a=>a.id!=='skipLink').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();navigate(a.getAttribute('href').slice(1));}));
  $('skipLink').addEventListener('click',e=>{e.preventDefault();$('page-'+activePage).focus();});

  // Preserve the approved warm contour and the orbital carousel interaction.
  const wrap=v=>((v%universes.length)+universes.length)%universes.length;
  const shortest=d=>wrap(d+universes.length/2)-universes.length/2;
  let pos=0,target=0,current=-1,lastInteraction=performance.now(),lastAuto=lastInteraction;
  let drag=false,startX=0,startY=0,startPos=0,dragDistance=0,hovered=false,heroVisible=true,radiusX=0,radiusY=0;
  function pauseAuto(){lastInteraction=lastAuto=performance.now();}
  const backgrounds=universes.map(()=>{const d=document.createElement('div');d.className='bg';$('bgs').append(d);return d;});
  const backgroundTokens=[];
  function loadBackground(i){
    const url=sized(source(slots[i*2]),mobile.matches?1200:2400);if(backgroundTokens[i]===url)return;backgroundTokens[i]=url;
    const image=new Image();image.onload=()=>{if(backgroundTokens[i]===url)backgrounds[i].style.backgroundImage='url("'+image.src+'")';};image.src=url;
  }
  const contour='<svg class="med-contour" viewBox="0 0 240 240" aria-hidden="true" focusable="false"><ellipse cx="120" cy="120" rx="114" ry="88" transform="rotate(-28 120 120)" stroke-width="2.3"/><ellipse cx="120" cy="120" rx="111" ry="93" transform="rotate(39 120 120)" stroke-width="1.1" opacity=".65"/><circle cx="120" cy="120" r="96" stroke-width=".8" opacity=".24"/></svg>';
  const meds=universes.map((c,i)=>{
    const b=document.createElement('button');b.type='button';b.className='med';b.setAttribute('aria-label','Abrir '+c.name);
    b.innerHTML=contour+'<img alt="" width="100" height="100" draggable="false"><span class="med-label" aria-hidden="true"></span>';
    b.querySelector('img').src=sized(source(slots[i*2+1]),320);b.querySelector('.med-label').textContent=c.name;
    b.addEventListener('click',e=>{if(e.detail!==0&&dragDistance>8)return;target=Math.round(target)+shortest(i-wrap(Math.round(target)));pauseAuto();navigate(c.destination);});
    b.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse')hovered=true;});b.addEventListener('pointerleave',()=>{hovered=false;pauseAuto();});$('orbit').append(b);return b;
  });
  function step(dir){target=Math.round(target)+dir;pauseAuto();}
  $('prev').addEventListener('click',()=>step(-1));$('next').addEventListener('click',()=>step(1));
  hero.addEventListener('keydown',e=>{if(e.altKey||e.ctrlKey||e.metaKey)return;if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();step(e.key==='ArrowRight'?1:-1);}});
  hero.addEventListener('focusin',pauseAuto);hero.addEventListener('focusout',pauseAuto);
  hero.addEventListener('pointerdown',e=>{if(e.target.closest('a,button:not(.med)')||e.button!==0)return;pauseAuto();drag=true;dragDistance=0;startX=e.clientX;startY=e.clientY;startPos=target;});
  function release(){if(!drag)return;drag=false;target=Math.round(target);pauseAuto();}
  hero.addEventListener('pointermove',e=>{if(!drag)return;const dx=e.clientX-startX,dy=e.clientY-startY;if(Math.abs(dy)>Math.abs(dx)&&Math.abs(dy)>12){release();return;}if(Math.abs(dx)>8){dragDistance=Math.abs(dx);hero.setPointerCapture?.(e.pointerId);target=startPos-dx/(mobile.matches?115:230);}});
  ['pointerup','pointercancel','lostpointercapture'].forEach(e=>hero.addEventListener(e,release));addEventListener('pointerup',release);addEventListener('pointercancel',release);
  hero.addEventListener('wheel',e=>{if(Math.abs(e.deltaX)>Math.abs(e.deltaY)&&Math.abs(e.deltaX)>10){e.preventDefault();if(performance.now()-lastInteraction>220)step(Math.sign(e.deltaX));}},{passive:false});
  function measure(){const w=hero.clientWidth,h=hero.clientHeight;if(!w)return;radiusX=mobile.matches?Math.min(w*.43,280):Math.min(w*.33,510);radiusY=mobile.matches?Math.min(h*.34,330):Math.min(h*.30,320);}
  new ResizeObserver(measure).observe(hero);measure();new IntersectionObserver(entries=>{heroVisible=entries[0].isIntersecting;pauseAuto();}).observe(hero);
  document.addEventListener('visibilitychange',pauseAuto);motion.addEventListener('change',pauseAuto);
  function frame(now){
    if(!drag&&!motion.matches&&!document.querySelector('dialog[open]')&&activePage==='inicio'&&!hero.contains(document.activeElement)&&!hovered&&!document.hidden&&heroVisible&&toggle.getAttribute('aria-expanded')!=='true'&&now-lastInteraction>6000&&now-lastAuto>4800){target=Math.round(target)+1;lastAuto=now;}
    pos=motion.matches?target:pos+(target-pos)*.075;if(Math.abs(target-pos)<.001)pos=target;
    const focus=wrap(Math.round(pos));
    if(focus!==current){current=focus;const c=universes[focus];$('title').textContent=c.name;$('heroKicker').textContent=c.kicker;$('heroPhrase').textContent=c.phrase;$('exploreLabel').textContent='Ver '+c.tab;$('explore').href='#'+c.destination;meds.forEach((b,i)=>{if(i===focus)b.setAttribute('aria-current','true');else b.removeAttribute('aria-current');});backgrounds.forEach((b,i)=>b.classList.toggle('on',i===focus));loadBackground(focus);loadBackground(wrap(focus+1));loadBackground(wrap(focus-1));}
    meds.forEach((m,i)=>{const off=shortest(i-pos),a=-Math.PI/2+off*Math.PI*2/universes.length,x=Math.cos(a)*radiusX,y=Math.sin(a)*radiusY,top=Math.max(0,1-Math.abs(off)),scale=.82+.28*top;m.style.transform=`translate(-50%,-50%) translate(${x}px,${y}px) scale(${scale})`;m.style.zIndex=String(100+Math.round(top*100-y*.01));});requestAnimationFrame(frame);
  }

  // Existing browser-only image records are preserved, including inactive legacy slots.
  const databasePromise=new Promise((resolve,reject)=>{const r=indexedDB.open('visioartes-image-editor',1);r.onupgradeneeded=()=>r.result.createObjectStore('images',{keyPath:'id'});r.onsuccess=()=>{r.result.onversionchange=()=>r.result.close();resolve(r.result);};r.onerror=()=>reject(Error('Não foi possível abrir o salvamento local.'));r.onblocked=()=>reject(Error('Feche outras abas do editor e tente novamente.'));}).catch(()=>null);
  async function readRecords(){const db=await databasePromise;if(!db)return[];return new Promise((resolve,reject)=>{const tx=db.transaction('images','readonly'),r=tx.objectStore('images').getAll();r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(Error('Não foi possível ler as imagens salvas.'));});}
  async function writeRecords(operation){const db=await databasePromise;if(!db)throw Error('O salvamento local está indisponível neste navegador.');return new Promise((resolve,reject)=>{const tx=db.transaction('images','readwrite');operation(tx.objectStore('images'));tx.oncomplete=resolve;tx.onerror=tx.onabort=()=>reject(Error('Não foi possível salvar. As imagens anteriores foram preservadas.'));});}
  const dataPattern=/^data:image\/(png|jpeg|webp|avif);base64,[A-Za-z0-9+/=]+$/;
  function readData(file){return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=()=>reject(Error('Não foi possível ler o arquivo.'));r.readAsDataURL(file);});}
  function decode(url){return new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=()=>reject(Error('Imagem inválida. Use JPG, PNG, WebP ou AVIF.'));image.src=url;});}
  function message(text,error=false){$('imageEditorMessage').textContent=text;$('imageEditorMessage').dataset.error=String(error);}
  slots.forEach(slot=>{const option=new Option(slot.name,slot.id);$('editorSlot').add(option);});
  function refreshFurnitureImage(){
    const i=universes.findIndex(c=>c.destination==='pecas/moveis'),image=$('furnitureHeroImage');
    if(image&&i>=0)image.src=sized(source(slots[i*2]),1600);
    const decor=universes.findIndex(c=>c.destination==='pecas/vasos-decoracao');
    if(decor>=0){
      const portrait=$('decorHeroImage'),panorama=$('decorPanoramaImage');
      if(portrait)portrait.src=sized(source(slots[decor*2+1]),1200);
      if(panorama)panorama.src=sized(source(slots[decor*2]),2000);
    }
  }
  function refreshPanelsImages(){
    const i=universes.findIndex(c=>c.destination==='pecas/paineis-divisorias');
    if(i<0)return;
    const portrait=$('panelsHeroImage'),panorama=$('panelsPanoramaImage');
    if(portrait)portrait.src=sized(source(slots[i*2+1]),1200);
    if(panorama)panorama.src=sized(source(slots[i*2]),2000);
  }
  function refreshArtImages(){
    const i=universes.findIndex(c=>c.destination==='pecas/arte-esculturas');
    if(i<0)return;
    const portrait=$('artHeroImage'),panorama=$('artPanoramaImage');
    if(portrait)portrait.src=sized(source(slots[i*2+1]),1200);
    if(panorama)panorama.src=sized(source(slots[i*2]),2000);
  }
  function refreshGardenImages(){
    const i=universes.findIndex(c=>c.destination==='pecas/jardins-areas-externas');
    if(i<0)return;
    const portrait=$('gardenHeroImage'),panorama=$('gardenPanoramaImage');
    if(portrait)portrait.src=sized(source(slots[i*2+1]),1200);
    if(panorama)panorama.src=sized(source(slots[i*2]),2000);
  }
  function refreshFacadeImages(){
    const i=universes.findIndex(c=>c.destination==='pecas/revestimentos-fachadas');
    if(i<0)return;
    const portrait=$('facadeHeroImage'),panorama=$('facadePanoramaImage');
    if(portrait)portrait.src=sized(source(slots[i*2+1]),1200);
    if(panorama)panorama.src=sized(source(slots[i*2]),2000);
  }
  function refreshImages(){
    universes.forEach((c,i)=>{loadBackground(i);meds[i].querySelector('img').src=sized(source(slots[i*2+1]),320);});
    refreshFurnitureImage();
    refreshPanelsImages();
    refreshArtImages();
    refreshGardenImages();
    refreshFacadeImages();
    refreshEditor();
  }
  function refreshEditor(){
    const slot=slots.find(s=>s.id===$('editorSlot').value)||slots[0],url=source(slot),record=records.get(slot.id),img=$('editorPreviewImage');
    img.hidden=!url;$('editorPreview').querySelector('span').hidden=Boolean(url);if(url)img.src=sized(url,900);else img.removeAttribute('src');
    $('editorPreview').classList.toggle('circle-preview',slot.kind==='circle');
    $('editorFileInfo').textContent=record?record.name+' · '+record.width+' × '+record.height+' px · salva neste navegador':slot.source?'Imagem de ambientação / conceito':'foto a enviar';
    $('resetImage').disabled=editorBusy||!record;
    $('editorSummary').textContent=slots.filter(s=>records.has(s.id)).length+' de '+slots.length+' imagens personalizadas do Início. As escolhas antigas são preservadas na exportação.';
  }
  const initialImagesReady=readRecords().then(saved=>{saved.forEach(r=>{if(typeof r.id==='string'&&dataPattern.test(r.dataUrl||''))records.set(r.id,r);});refreshImages();}).catch(()=>message('Não foi possível ler as imagens locais. Exporte uma cópia antes de limpar os dados do navegador.',true));
  function closeEditor(){if(editorBusy)return;$('imageEditor').close();pauseAuto();if(editorReturn?.isConnected)editorReturn.focus({preventScroll:true});}
  $('editImages').addEventListener('click',async()=>{editorReturn=collapsed.matches?toggle:$('editImages');setMenu(false);await initialImagesReady;const related=universes.findIndex(c=>c.destination===activeDestination),collection=activePage==='pecas'&&related>=0?related:wrap(Math.round(pos));$('editorSlot').value=slots[collection*2].id;refreshEditor();$('imageEditor').showModal();$('closeImageEditor').focus();});
  $('closeImageEditor').addEventListener('click',closeEditor);$('imageEditor').addEventListener('cancel',e=>{e.preventDefault();closeEditor();});
  $('editorSlot').addEventListener('change',refreshEditor);
  $('viewImage').addEventListener('click',()=>{const slot=slots.find(s=>s.id===$('editorSlot').value),showCollection=activePage==='pecas'&&universes[slot.collection]?.destination===activeDestination;closeEditor();target=Math.round(target)+shortest(slot.collection-wrap(Math.round(target)));pauseAuto();navigate(showCollection?activeDestination:'inicio');});
  async function runEditor(operation){if(editorBusy)return;editorBusy=true;$('imageEditor').querySelectorAll('button,select').forEach(el=>el.disabled=true);try{await initialImagesReady;await operation();}catch(e){message(e.message||'Não foi possível concluir.',true);}finally{editorBusy=false;$('imageEditor').querySelectorAll('button,select').forEach(el=>el.disabled=false);refreshEditor();}}
  $('chooseImage').addEventListener('click',()=>{$('imageFile').value='';$('imageFile').click();});
  $('imageFile').addEventListener('change',()=>{const file=$('imageFile').files?.[0],slot=slots.find(s=>s.id===$('editorSlot').value);if(!file)return;runEditor(async()=>{if(file.size>20*1024*1024||!/^image\/(jpeg|png|webp|avif)$/.test(file.type))throw Error('Escolha JPG, PNG, WebP ou AVIF de até 20 MB.');message('Preparando e salvando a imagem…');const original=await readData(file),img=await decode(original);if(!img.naturalWidth||img.naturalWidth*img.naturalHeight>80000000)throw Error('Escolha uma versão menor desta imagem.');const max=slot.kind==='background'?2560:1600,ratio=Math.min(1,max/Math.max(img.naturalWidth,img.naturalHeight)),canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(img.naturalWidth*ratio));canvas.height=Math.max(1,Math.round(img.naturalHeight*ratio));canvas.getContext('2d').drawImage(img,0,0,canvas.width,canvas.height);const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/webp',.9));if(!blob)throw Error('Não foi possível preparar a imagem.');const record={id:slot.id,universe:Number(slot.id.split(':')[0]),kind:slot.id.split(':')[1],name:file.name.slice(0,160),width:canvas.width,height:canvas.height,dataUrl:await readData(blob)};await writeRecords(store=>store.put(record));records.set(slot.id,record);refreshImages();message('Imagem salva apenas neste navegador. Exporte para compartilhar e publicar suas escolhas.');});});
  $('resetImage').addEventListener('click',()=>{const id=$('editorSlot').value;runEditor(async()=>{await writeRecords(store=>store.delete(id));records.delete(id);refreshImages();message('Imagem restaurada neste navegador.');});});
  function download(content,type,name){const url=URL.createObjectURL(new Blob([content],{type})),a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
  $('exportImages').addEventListener('click',()=>runEditor(async()=>{const saved=await readRecords();download(JSON.stringify({format:'visioarte-images',version:2,exportedAt:new Date().toISOString(),images:saved}),'application/json','visioarte-imagens-'+new Date().toISOString().slice(0,10)+'.json');message('Imagens exportadas, incluindo os registros de abas antigas. Guarde uma cópia ou envie aqui no chat.');}));
  $('importImages').addEventListener('click',()=>{$('imageConfigFile').value='';$('imageConfigFile').click();});
  $('imageConfigFile').addEventListener('change',()=>{const file=$('imageConfigFile').files?.[0];if(!file)return;runEditor(async()=>{
    if(file.size>100*1024*1024)throw Error('Esse arquivo é muito grande. Use uma exportação do editor.');
    let config;try{config=JSON.parse(await file.text());}catch{throw Error('Arquivo JSON inválido.');}
    let incoming=[];
    if(config?.format==='visioarte-images'&&config.version===2&&Array.isArray(config.images))incoming=config.images;
    else if(config?.format==='visioartes-images'&&config.version===1&&Array.isArray(config.universes)&&config.universes.length===9){
      const universes=new Set();for(const entry of config.universes){if(!Number.isInteger(entry?.id)||entry.id<0||entry.id>8||universes.has(entry.id))throw Error('Exportação antiga inválida.');universes.add(entry.id);for(const [kind,value]of Object.entries(entry)){if(value&&typeof value==='object'&&('dataUrl'in value))incoming.push({...value,id:entry.id+':'+kind,universe:entry.id,kind});}}
    }else throw Error('Escolha um arquivo de imagens exportado pelo editor da VISIOARTE.');
    if(incoming.length>200)throw Error('Essa exportação contém imagens demais.');
    const checked=[],seen=new Set();message('Conferindo as imagens antes de importar…');
    for(const record of incoming){if(!/^(?:[0-9]|1[0-2]):(background|circle|(?:photo|product|asset)-[a-z0-9-]+)$/.test(record?.id||'')||seen.has(record.id)||typeof record.dataUrl!=='string'||record.dataUrl.length>15000000||!dataPattern.test(record.dataUrl))throw Error('Uma das imagens da exportação é inválida.');seen.add(record.id);const img=await decode(record.dataUrl);if(!img.naturalWidth||Math.max(img.naturalWidth,img.naturalHeight)>2560)throw Error('Uma das imagens ultrapassa o tamanho aceito.');checked.push({id:record.id,universe:Number(record.id.split(':')[0]),kind:record.id.split(':')[1],name:String(record.name||'Imagem personalizada').slice(0,160),width:img.naturalWidth,height:img.naturalHeight,dataUrl:record.dataUrl});}
    // Merge imports: missing slots and older collections must never erase existing choices.
    await writeRecords(store=>checked.forEach(r=>store.put(r)));checked.forEach(r=>records.set(r.id,r));refreshImages();message('Imagens importadas neste navegador. As demais escolhas foram preservadas.');
  });});

  // Set only official contact data here when supplied; no destination is inferred.
  const contactConfig={email:null,whatsapp:null};
  const projectForm=$('projectForm'),review=$('projectReview');let referenceUrl='',projectDraft=null;
  if(contactConfig.whatsapp&&/^\d{10,15}$/.test(contactConfig.whatsapp)){
    const link=document.createElement('a');link.className='btn';link.id='whatsappOfficial';link.href='https://wa.me/'+contactConfig.whatsapp;link.target='_blank';link.rel='noopener noreferrer';link.textContent='Conversar no WhatsApp ↗';$('whatsappPending').replaceWith(link);$('whatsappNote').textContent='WhatsApp oficial da VISIOARTE.';
  }
  if(contactConfig.email){$('contactNote').textContent='Revise e baixe seu pedido antes de enviá-lo para '+contactConfig.email+'. A foto deve ser anexada ao e-mail.';}
  function closeReview(){review.close();if(referenceUrl){URL.revokeObjectURL(referenceUrl);referenceUrl='';}$('contactSubmit').focus({preventScroll:true});}
  $('closeReview').addEventListener('click',closeReview);$('editProject').addEventListener('click',closeReview);review.addEventListener('cancel',e=>{e.preventDefault();closeReview();});
  projectForm.addEventListener('submit',async e=>{
    e.preventDefault();const file=$('contactReference').files?.[0];$('contactMessage').textContent='';
    if(file&&(file.size>20*1024*1024||!/^image\/(jpeg|png|webp|avif)$/.test(file.type))){$('contactMessage').textContent='Use uma foto JPG, PNG, WebP ou AVIF de até 20 MB.';return;}
    if(file){const checkUrl=URL.createObjectURL(file);try{await decode(checkUrl);}catch{$('contactMessage').textContent='Não foi possível abrir a foto. Escolha outra imagem.';return;}finally{URL.revokeObjectURL(checkUrl);}}
    projectDraft={name:$('contactName').value.trim(),email:$('contactEmail').value.trim(),needs:$('contactNeed').value.trim(),reference:file?.name||'Sem foto de referência'};
    if(!projectDraft.name||!projectDraft.needs){$('contactMessage').textContent='Preencha seu nome e o que você precisa.';return;}
    $('reviewFields').replaceChildren();for(const [label,value]of [['Nome',projectDraft.name],['E-mail',projectDraft.email],['O que você precisa',projectDraft.needs]]){const dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=label;dd.textContent=value;$('reviewFields').append(dt,dd);}
    $('referencePreview').hidden=!file;$('referenceName').textContent=projectDraft.reference;if(file){referenceUrl=URL.createObjectURL(file);$('referencePreview').src=referenceUrl;}else $('referencePreview').removeAttribute('src');
    if(contactConfig.email&&!$('officialEmail')){const a=document.createElement('a');a.id='officialEmail';a.className='btn';a.textContent='Enviar por e-mail ↗';$('downloadProject').after(a);}
    if(contactConfig.email)$('officialEmail').href='mailto:'+encodeURIComponent(contactConfig.email)+'?subject='+encodeURIComponent('Projeto sob medida — VISIOARTE')+'&body='+encodeURIComponent('Nome: '+projectDraft.name+'\nE-mail: '+projectDraft.email+'\n\n'+projectDraft.needs+'\n\nReferência: '+projectDraft.reference+' (anexar foto separadamente)');
    review.showModal();$('closeReview').focus();
  });
  $('downloadProject').addEventListener('click',()=>{if(!projectDraft)return;download('VISIOARTE — Projeto sob medida\nPedido preparado, ainda não enviado.\n\nNome: '+projectDraft.name+'\nE-mail: '+projectDraft.email+'\n\nO que preciso:\n'+projectDraft.needs+'\n\nFoto de referência: '+projectDraft.reference+'\nA foto não está incluída neste resumo. Guarde o arquivo original.','text/plain;charset=utf-8','visioarte-meu-projeto.txt');});

  addEventListener('hashchange',route);addEventListener('popstate',route);route();requestAnimationFrame(frame);
})();
