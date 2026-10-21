/* Reciclagem — source layout supplied by VISIOARTES. Icons: Tabler (MIT). */
(() => {
  const $ = id => document.getElementById(id);
  const steps = [
    {id:'coleta',name:'Coleta e separação',description:'Resíduos plásticos são coletados, limpos e separados por tipo de material.'},
    {id:'trituracao',name:'Trituração',description:'O plástico é triturado em flocos uniformes, prontos para extrusão.'},
    {id:'limpeza',name:'Limpeza e secagem',description:'Os flocos são lavados e secos para garantir a qualidade do material.'},
    {id:'extrusao',name:'Extrusão',description:'O material é fundido e extrudado em filamentos, que são cortados em pellets.'},
    {id:'pellets',name:'Pellets reciclados',description:'Granulados prontos para uso em impressoras 3D com extrusora de pellets.'},
    {id:'impressao',name:'Nova impressão',description:'Os pellets reciclados se tornam novos produtos, fechando o ciclo de produção.'}
  ];
  const materials = ['PET','PP','PEAD','ABS','PS','PLA'].map(name => ({id:name.toLowerCase(),name,description:`${name} faz parte dos materiais apresentados neste ciclo. A coleta e a separação por tipo de plástico são o início do processo.`}));
  const equipment = [
    {id:'triturador',name:'Triturador',description:steps[1].description},
    {id:'lavadora',name:'Lavadora',description:'Os flocos são lavados para garantir a qualidade do material.'},
    {id:'secador',name:'Secador',description:'Os flocos são secos antes de seguir para a próxima etapa do processo.'},
    {id:'extrusora',name:'Extrusora',description:steps[3].description},
    {id:'cortador',name:'Cortador de pellets',description:'O material extrudado é cortado em pellets, prontos para uma nova impressão.'}
  ];
  const assets = [...steps.map(s=>({...s,name:'Etapa: '+s.name})),...materials.map(s=>({...s,name:'Material: '+s.name})),...equipment.map(s=>({...s,name:'Equipamento: '+s.name}))];
  const custom = {}, source = id => custom[id]?.dataUrl || `assets/reciclagem/${id}.webp`;
  const dialog = $('recyclingDetail'), video = $('recyclingVideo');
  let active = -1, detailStep = -1, returnFocus = null, videoReturnFocus = null;
  const stepButtons = [];
  function selectStep(index,focus=true) {
    active = (index + steps.length) % steps.length;
    stepButtons.forEach((button,i)=>button.dataset.active=String(i===active));
    const button = stepButtons[active];
    if (focus) button.focus({preventScroll:true});
    const row = $('recyclingSteps');
    const left = button.offsetLeft - row.clientWidth/2 + button.clientWidth/2;
    row.scrollTo({left,behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth'});
    $('recyclingStepStatus').textContent=`Etapa ${active+1} de 6: ${steps[active].name}`;
  }
  function fillDetail(item,type,index=-1) {
    detailStep=index; dialog.dataset.asset=item.id;
    $('recyclingDetailImage').src=source(item.id); $('recyclingDetailImage').alt=item.name;
    $('recyclingDetailImage').classList.toggle('equipment',type==='Equipamento');
    $('recyclingDetailKicker').textContent=index>=0?`Etapa ${String(index+1).padStart(2,'0')} de 06`:type;
    $('recyclingDetailTitle').textContent=item.name; $('recyclingDetailText').textContent=item.description;
    $('recyclingDetailControls').hidden=index<0;
  }
  function openDetail(item,type,index,trigger) {
    returnFocus=trigger;fillDetail(item,type,index);
    dialog.showModal();document.body.style.overflow='hidden';$('recyclingDetailClose').focus({preventScroll:true});
  }
  function closeDetail(restore=true) {
    dialog.close();document.body.style.overflow='';
    if(restore&&returnFocus?.isConnected)returnFocus.focus({preventScroll:true});
  }
  steps.forEach((item,index)=>{
    const card=document.createElement('article');card.className='recycling-step';
    card.innerHTML=`<button type="button" class="recycling-step-button" aria-label="Etapa ${index+1}: ${item.name}" aria-haspopup="dialog"><img class="recycling-step-image" data-recycling-asset="${item.id}" src="${source(item.id)}" alt="" width="400" height="206"><span class="recycling-step-number" aria-hidden="true">${String(index+1).padStart(2,'0')}</span><h2>${item.name}</h2><p>${item.description}</p></button>`;
    const button=card.querySelector('button');stepButtons.push(button);
    button.addEventListener('click',e=>openDetail(item,'Processo',index,e.currentTarget));
    button.addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();selectStep(index+(e.key==='ArrowRight'?1:-1));}});
    $('recyclingSteps').append(card);
  });
  function renderSmall(items,container,type) {
    items.forEach(item=>{
      const button=document.createElement('button');button.type='button';button.className='recycling-small-button';
      button.setAttribute('aria-label',type+': '+item.name);button.setAttribute('aria-haspopup','dialog');
      button.innerHTML=`<img data-recycling-asset="${item.id}" src="${source(item.id)}" alt="" width="156" height="156"><span>${item.name}</span>`;
      button.addEventListener('click',e=>openDetail(item,type,-1,e.currentTarget));$(container).append(button);
    });
  }
  renderSmall(materials,'recyclingMaterials','Material');renderSmall(equipment,'recyclingEquipment','Equipamento');
  $('recyclingPrevious').addEventListener('click',()=>selectStep(active<0?steps.length-1:active-1));
  $('recyclingNext').addEventListener('click',()=>selectStep(active+1));
  $('recyclingDetailClose').addEventListener('click',()=>closeDetail());
  dialog.addEventListener('cancel',e=>{e.preventDefault();closeDetail();});
  for(const [id,delta] of [['recyclingDetailPrevious',-1],['recyclingDetailNext',1]])$(id).addEventListener('click',()=>{
    const index=(detailStep+delta+steps.length)%steps.length;fillDetail(steps[index],'Processo',index);returnFocus=stepButtons[index];selectStep(index,false);
  });
  function closeVideo(restore=true){video.close();document.body.style.overflow='';if(restore&&videoReturnFocus?.isConnected)videoReturnFocus.focus({preventScroll:true});}
  $('recyclingWatchVideo').addEventListener('click',e=>{videoReturnFocus=e.currentTarget;video.showModal();document.body.style.overflow='hidden';$('recyclingVideoClose').focus();});
  $('recyclingVideoClose').addEventListener('click',()=>closeVideo());
  video.addEventListener('cancel',e=>{e.preventDefault();closeVideo();});
  $('recyclingVideoProcess').addEventListener('click',()=>{closeVideo(false);location.hash='processo-reciclagem';$('processo-reciclagem').scrollIntoView();selectStep(0);});
  window.recyclingPage={assets,custom,source,refresh(background,images){
    $('recyclingHeroImage').style.backgroundImage=`url("${background}")`;
    assets.forEach(item=>custom[item.id]=images['asset-'+item.id]||null);
    document.querySelectorAll('[data-recycling-asset]').forEach(img=>img.src=source(img.dataset.recyclingAsset));
    if(dialog.dataset.asset)$('recyclingDetailImage').src=source(dialog.dataset.asset);
  },close(){if(dialog.open)closeDetail(false);if(video.open)closeVideo(false);}};
})();
