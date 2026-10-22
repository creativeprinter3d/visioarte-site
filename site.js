(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const all = selector => [...document.querySelectorAll(selector)];
  const pages = ['inicio','pecas','como-fazemos','material-reciclagem','maquinas','software','projetos'];
  const titles = ['Início','Peças','Como fazemos','Material e reciclagem','Máquinas','Software','Projetos sob medida + contato'];
  const universes = [
    {name:'Móveis',destination:'pecas/moveis',background:'https://images.pexels.com/photos/6585744/pexels-photo-6585744.jpeg?auto=compress&cs=tinysrgb&w=2400'},
    {name:'Luminárias',destination:'luminarias',background:'assets/luminarias/hero.webp',circle:'assets/luminarias/espiral.webp'},
    {name:'Objetos decorativos',destination:'pecas/objetos',background:'https://images.pexels.com/photos/14205545/pexels-photo-14205545.jpeg?auto=compress&cs=tinysrgb&w=2400'},
    {name:'Formas da natureza',destination:'pecas/natureza',background:'https://images.pexels.com/photos/4011947/pexels-photo-4011947.jpeg?auto=compress&cs=tinysrgb&w=2400'},
    {name:'Materiais',destination:'material-reciclagem',background:'https://images.pexels.com/photos/35999876/pexels-photo-35999876.jpeg?auto=compress&cs=tinysrgb&w=2400'},
    {name:'Reciclagem',destination:'material-reciclagem',background:'assets/reciclagem/hero.webp',circle:'assets/reciclagem/coleta.webp'},
    {name:'Tecnologia',destination:'tecnologia',background:'assets/tecnologia/fundo-v2.webp',circle:'assets/tecnologia/circulo-v2.webp'},
    {name:'Projetos personalizados',destination:'projetos',background:'https://images.pexels.com/photos/38850583/pexels-photo-38850583.jpeg?auto=compress&cs=tinysrgb&w=2400'},
    {name:'VISIOARTE',destination:'inicio/sobre',background:'https://images.pexels.com/photos/36793072/pexels-photo-36793072.jpeg?auto=compress&cs=tinysrgb&w=2400'}
  ];
  // Keep legacy record IDs so locally selected home images survive the reorganization.
  const slots = universes.flatMap((c,i) => [
    {id:i+':background',name:'Início / '+c.name+' / fundo',page:'inicio',source:c.background,kind:'background',collection:i},
    {id:i+':circle',name:'Início / '+c.name+' / círculo',page:'inicio',source:c.circle||c.background,kind:'circle',collection:i}
  ]);
  const photoNames = {
    'home-machine':['Início / Máquina própria','inicio'],
    'piece-petalas':['Peças / Luminária de pétalas','pecas'],
    'piece-folha':['Peças / Luminária de folha enrolada e torcida','pecas'],
    'piece-mesa-s':['Peças / Mesa lateral em S','pecas'],
    'piece-vasos':['Peças / Vasos com textura','pecas'],
    'process-desenho':['Como fazemos / Desenho','como-fazemos'],
    'process-fatiamento':['Como fazemos / Fatiamento','como-fazemos'],
    'process-impressao':['Como fazemos / Impressão','como-fazemos'],
    'process-acabamento':['Como fazemos / Acabamento e entrega','como-fazemos'],
    'material-pellets':['Material e reciclagem / Pellets e PS cristal','material-reciclagem'],
    'material-refugo':['Material e reciclagem / Refugo','material-reciclagem'],
    'machine-scara':['Máquinas / Braço SCARA','maquinas'],
    'machine-orbital':['Máquinas / Visio Orbital','maquinas'],
    'software-slicer':['Software / Visio Slicer','software'],
    'software-tekna':['Software / Visio Tekna','software']
  };
  for (const [photo,[name,page]] of Object.entries(photoNames)) slots.push({id:'8:photo-'+photo,photo,name,page,kind:'photo'});
  for (const product of window.lightingCatalog.products) slots.push({id:'1:product-'+product.id,product:product.id,name:'Luminárias / Modelo '+product.name,page:'luminarias',source:'assets/luminarias/'+product.id+'.webp',kind:'photo'});
  const records = new Map();
  const source = slot => records.get(slot.id)?.dataUrl || slot.source || '';
  const sized = (url,size) => /^(data:|blob:)/.test(url) ? url : url.replace('w=2400','w='+size);
  let activePage='inicio', editorBusy=false, editorReturn=null, pendingPhoto=null;
  const motion=matchMedia('(prefers-reduced-motion: reduce)'), mobile=matchMedia('(max-width:700px)'), collapsed=matchMedia('(max-width:1250px)');
  const menu=$('mainNav'), toggle=$('menuToggle'), hero=$('inicio');
  function setMenu(open) {
    menu.classList.toggle('open',open); $('header').classList.toggle('menu-open',open);
    toggle.setAttribute('aria-expanded',String(open)); $('menuLabel').textContent=open?'Fechar':'Menu'; pauseAuto();
  }
  toggle.addEventListener('click',()=>setMenu(toggle.getAttribute('aria-expanded')!=='true'));
  menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>setMenu(false)));
  collapsed.addEventListener('change',()=>setMenu(false));
  document.addEventListener('click',e=>{if(!e.target.closest('#header'))setMenu(false);});
  document.addEventListener('keydown',e=>{if(e.key==='Escape' && toggle.getAttribute('aria-expanded')==='true'){setMenu(false);toggle.focus();}});
  addEventListener('scroll',()=>document.body.classList.toggle('page-scrolled',scrollY>24),{passive:true});

  let filter='todos';
  function setFilter(value) {
    filter=all('[data-filter]').some(b=>b.dataset.filter===value)?value:'todos';
    all('[data-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.filter===filter)));
    let count=0;
    all('.piece-card').forEach(card=>{card.hidden=filter!=='todos'&&!card.dataset.categories.split(' ').includes(filter);if(!card.hidden)count++;});
    $('galleryCount').textContent=count+' '+(count===1?'peça':'peças');
  }
  all('[data-filter]').forEach(b=>b.addEventListener('click',()=>{setFilter(b.dataset.filter);history.replaceState(null,'','#pecas'+(filter==='todos'?'':'/'+filter));}));
  const aliases={colecoes:'pecas',contato:'projetos',reciclagem:'material-reciclagem','processo-reciclagem':'material-reciclagem',materiais:'material-reciclagem'};
  const technologyHashes=['tecnologia','areas-tecnologia','conexoes-tecnologia'];
  const lightingHashes=['luminarias','modelos-luminarias'];
  function route() {
    const raw=location.hash.slice(1)||'inicio';
    const mapped=technologyHashes.includes(raw)?'tecnologia':lightingHashes.includes(raw)?'luminarias':aliases[raw]||raw;
    let [page,category]=mapped.split('/');
    if(!pages.includes(page)&&!['tecnologia','luminarias'].includes(page))page='inicio';
    if(!technologyHashes.includes(raw)&&!lightingHashes.includes(raw)&&(mapped!==raw||!pages.includes(mapped.split('/')[0])))history.replaceState(null,'','#'+page+(category?'/'+category:''));
    const changed=activePage!==page; activePage=page;
    all('[data-page]').forEach(el=>el.hidden=el.dataset.page!==page);
    menu.querySelectorAll('a').forEach(a=>{if(a.hash==='#'+page)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
    document.title=(page==='tecnologia'?'Tecnologia':page==='luminarias'?'Luminárias':titles[pages.indexOf(page)])+' — VISIOARTE';
    document.body.classList.toggle('technology-mode',page==='tecnologia');
    if(page==='tecnologia')window.technologyPage.refresh(source(slots[12]),source(slots[13]));
    else window.technologyPage.close();
    document.body.classList.toggle('lighting-mode',page==='luminarias');
    if(page==='luminarias')window.lightingCatalog.refreshHero(source(slots[2]));
    else window.lightingCatalog.close();
    $('skipLink').href='#page-'+page; setMenu(false);
    if(page==='pecas')setFilter(category||'todos');
    requestAnimationFrame(()=>{if(page==='inicio')measure();scrollTo({top:0,behavior:'instant'});if(changed)$('page-'+page).focus({preventScroll:true});if(page==='inicio'&&category==='sobre')$('quem-somos').scrollIntoView({block:'start',behavior:'instant'});if(page==='tecnologia'&&raw!=='tecnologia'||page==='luminarias'&&raw==='modelos-luminarias')$(raw).scrollIntoView({block:'start',behavior:'instant'});if(pendingPhoto){all('[data-photo]').find(el=>el.dataset.photo===pendingPhoto)?.scrollIntoView({block:'center',behavior:'instant'});pendingPhoto=null;}});
    pauseAuto();
  }
  all('[data-project]').forEach(a=>a.addEventListener('click',()=>{if(!$('contactNeed').value.trim())$('contactNeed').value='Tenho interesse em: '+a.dataset.project+'.';}));
  $('skipLink').addEventListener('click',e=>{e.preventDefault();$('page-'+activePage).focus();});

  // The approved warm crossed-orbit contour and carousel movement are retained.
  const wrap=v=>((v%universes.length)+universes.length)%universes.length;
  const shortest=d=>wrap(d+universes.length/2)-universes.length/2;
  let pos=0,target=0,current=-1,lastInteraction=performance.now(),lastAuto=lastInteraction;
  let drag=false,startX=0,startY=0,startPos=0,hovered=false,heroVisible=true,radiusX=0,radiusY=0;
  function pauseAuto(){lastInteraction=lastAuto=performance.now();}
  const backgrounds=universes.map(()=>{const d=document.createElement('div');d.className='bg';$('bgs').append(d);return d;});
  const backgroundTokens=[];
  function loadBackground(i) {
    const url=sized(source(slots[i*2]),mobile.matches?1200:2400);
    if(backgroundTokens[i]===url)return;
    backgroundTokens[i]=url;
    const image=new Image();image.onload=()=>{if(backgroundTokens[i]===url)backgrounds[i].style.backgroundImage='url("'+image.src+'")';};image.src=url;
  }
  const contour='<svg class="med-contour" viewBox="0 0 240 240" aria-hidden="true" focusable="false"><ellipse cx="120" cy="120" rx="114" ry="88" transform="rotate(-28 120 120)" stroke-width="2.3"/><ellipse cx="120" cy="120" rx="111" ry="93" transform="rotate(39 120 120)" stroke-width="1.1" opacity=".65"/><circle cx="120" cy="120" r="96" stroke-width=".8" opacity=".24"/></svg>';
  const meds=universes.map((c,i)=>{
    const b=document.createElement('button'); b.type='button';b.className='med';b.setAttribute('aria-label','Abrir '+c.name);
    b.innerHTML=contour+'<img alt="" width="100" height="100" draggable="false"><span class="med-label" aria-hidden="true"></span>';
    b.querySelector('img').src=sized(source(slots[i*2+1]),320);b.querySelector('.med-label').textContent=c.name;
    b.addEventListener('click',()=>{target=Math.round(target)+shortest(i-wrap(Math.round(target)));pauseAuto();if(location.hash==='#'+c.destination)route();else location.hash=c.destination;});
    b.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse')hovered=true;});b.addEventListener('pointerleave',()=>{hovered=false;pauseAuto();});
    $('orbit').append(b);return b;
  });
  function step(dir){target=Math.round(target)+dir;pauseAuto();}
  $('prev').addEventListener('click',()=>step(-1));$('next').addEventListener('click',()=>step(1));
  // Each original universe links to its corresponding section or collection filter.
  hero.addEventListener('keydown',e=>{if(e.altKey||e.ctrlKey||e.metaKey)return;if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();step(e.key==='ArrowRight'?1:-1);}});
  hero.addEventListener('focusin',pauseAuto);hero.addEventListener('focusout',pauseAuto);
  hero.addEventListener('pointerdown',e=>{if(e.target.closest('a,button')||e.button!==0)return;pauseAuto();drag=true;startX=e.clientX;startY=e.clientY;startPos=target;});
  function release(){if(!drag)return;drag=false;target=Math.round(target);pauseAuto();}
  hero.addEventListener('pointermove',e=>{if(!drag)return;const dx=e.clientX-startX,dy=e.clientY-startY;if(Math.abs(dy)>Math.abs(dx)&&Math.abs(dy)>12){release();return;}if(Math.abs(dx)>8){hero.setPointerCapture?.(e.pointerId);target=startPos-dx/(mobile.matches?115:230);}});
  ['pointerup','pointercancel','lostpointercapture'].forEach(e=>hero.addEventListener(e,release));
  addEventListener('pointerup',release);addEventListener('pointercancel',release);
  hero.addEventListener('wheel',e=>{if(Math.abs(e.deltaX)>Math.abs(e.deltaY)&&Math.abs(e.deltaX)>10){e.preventDefault();if(performance.now()-lastInteraction>220)step(Math.sign(e.deltaX));}},{passive:false});
  function measure(){const w=hero.clientWidth,h=hero.clientHeight;if(!w)return;radiusX=mobile.matches?Math.min(w*.43,280):Math.min(w*.33,510);radiusY=mobile.matches?Math.min(h*.28,260):Math.min(h*.30,320);}
  new ResizeObserver(measure).observe(hero);measure();
  new IntersectionObserver(entries=>{heroVisible=entries[0].isIntersecting;pauseAuto();}).observe(hero);
  document.addEventListener('visibilitychange',pauseAuto);motion.addEventListener('change',pauseAuto);
  function frame(now){
    if(!drag&&!motion.matches&&!document.querySelector('dialog[open]')&&activePage==='inicio'&&!hero.contains(document.activeElement)&&!hovered&&!document.hidden&&heroVisible&&toggle.getAttribute('aria-expanded')!=='true'&&now-lastInteraction>6000&&now-lastAuto>4800){target=Math.round(target)+1;lastAuto=now;}
    pos=motion.matches?target:pos+(target-pos)*.075;if(Math.abs(target-pos)<.001)pos=target;
    const focus=wrap(Math.round(pos));
    if(focus!==current){current=focus;$('title').textContent=universes[focus].name;meds.forEach((b,i)=>{if(i===focus)b.setAttribute('aria-current','true');else b.removeAttribute('aria-current');});backgrounds.forEach((b,i)=>b.classList.toggle('on',i===focus));loadBackground(focus);loadBackground(wrap(focus+1));loadBackground(wrap(focus-1));}
    meds.forEach((m,i)=>{const off=shortest(i-pos),a=-Math.PI/2+off*Math.PI*2/universes.length,x=Math.cos(a)*radiusX,y=Math.sin(a)*radiusY,top=Math.max(0,1-Math.abs(off)),scale=.82+.28*top;m.style.transform=`translate(-50%,-50%) translate(${x}px,${y}px) scale(${scale})`;m.style.zIndex=String(100+Math.round(top*100-y*.01));});
    requestAnimationFrame(frame);
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
  function refreshImages(){
    all('[data-photo]').forEach(el=>{const slot=slots.find(s=>s.photo===el.dataset.photo),url=source(slot),img=el.querySelector('img');el.classList.toggle('has-photo',Boolean(url));img.hidden=!url;el.querySelector('.photo-pending').hidden=Boolean(url);if(url)img.src=url;else img.removeAttribute('src');});
    universes.forEach((c,i)=>{loadBackground(i);meds[i].querySelector('img').src=sized(source(slots[i*2+1]),320);});
    window.technologyPage.refresh(source(slots[12]),source(slots[13]));
    window.lightingCatalog.refreshHero(source(slots[2]));
    window.lightingCatalog.products.forEach(product=>{window.lightingCatalog.custom[product.id]=records.get('1:product-'+product.id)||null;});
    window.lightingCatalog.render();
    refreshEditor();
  }
  function refreshEditor(){
    const slot=slots.find(s=>s.id===$('editorSlot').value)||slots[0],url=source(slot),record=records.get(slot.id),img=$('editorPreviewImage');
    img.hidden=!url;$('editorPreview').querySelector('span').hidden=Boolean(url);if(url)img.src=sized(url,900);else img.removeAttribute('src');
    $('editorPreview').classList.toggle('circle-preview',slot.kind==='circle');
    $('editorFileInfo').textContent=record?record.name+' · '+record.width+' × '+record.height+' px · salva neste navegador':slot.source?'Imagem de ambientação / conceito':'foto a enviar';
    $('resetImage').disabled=editorBusy||!record;
    $('editorSummary').textContent=slots.filter(s=>records.has(s.id)).length+' de '+slots.length+' imagens personalizadas. As imagens de abas antigas também são preservadas na exportação.';
  }
  const initialImagesReady=readRecords().then(saved=>{saved.forEach(r=>{if(typeof r.id==='string'&&dataPattern.test(r.dataUrl||''))records.set(r.id,r);});refreshImages();}).catch(()=>message('Não foi possível ler as imagens locais. Exporte uma cópia antes de limpar os dados do navegador.',true));
  function closeEditor(){if(editorBusy)return;$('imageEditor').close();pauseAuto();if(editorReturn?.isConnected)editorReturn.focus({preventScroll:true});}
  $('editImages').addEventListener('click',async()=>{editorReturn=collapsed.matches?toggle:$('editImages');setMenu(false);await initialImagesReady;const first=activePage==='tecnologia'?slots[12]:activePage==='luminarias'?slots[2]:slots.find(s=>s.page===activePage);if(first)$('editorSlot').value=first.id;refreshEditor();$('imageEditor').showModal();$('closeImageEditor').focus();});
  $('closeImageEditor').addEventListener('click',closeEditor);$('imageEditor').addEventListener('cancel',e=>{e.preventDefault();closeEditor();});
  $('editorSlot').addEventListener('change',refreshEditor);
  $('viewImage').addEventListener('click',()=>{const slot=slots.find(s=>s.id===$('editorSlot').value);closeEditor();if(slot.collection!==undefined){target=Math.round(target)+shortest(slot.collection-wrap(Math.round(target)));pauseAuto();}pendingPhoto=slot.photo||null;if(location.hash==='#'+slot.page)route();else location.hash=slot.page;});
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
    for(const record of incoming){if(!/^[0-8]:(background|circle|(?:photo|product|asset)-[a-z0-9-]+)$/.test(record?.id||'')||seen.has(record.id)||typeof record.dataUrl!=='string'||record.dataUrl.length>15000000||!dataPattern.test(record.dataUrl))throw Error('Uma das imagens da exportação é inválida.');seen.add(record.id);const img=await decode(record.dataUrl);if(!img.naturalWidth||Math.max(img.naturalWidth,img.naturalHeight)>2560)throw Error('Uma das imagens ultrapassa o tamanho aceito.');checked.push({id:record.id,universe:Number(record.id.split(':')[0]),kind:record.id.split(':')[1],name:String(record.name||'Imagem personalizada').slice(0,160),width:img.naturalWidth,height:img.naturalHeight,dataUrl:record.dataUrl});}
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

  addEventListener('hashchange',route);route();requestAnimationFrame(frame);
})();
