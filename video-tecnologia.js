/* Vídeo "Tecnologia feita por nós" (apresentação do Slicer, Tekna, Firmware e Sala dos Agentes, com a Ivy no final).
   Abre numa janela por cima da página; o arquivo só é baixado quando a pessoa clica em assistir. */
(function(){
  'use strict';
  var botoes=document.querySelectorAll('.vt-play');
  if(!botoes.length)return;
  var SRC='assets/videos/tecnologia-feita-por-nos.mp4', POSTER='assets/videos/tecnologia-feita-por-nos.jpg';
  var m=document.createElement('div');m.className='vt-modal';m.hidden=true;m.setAttribute('role','dialog');m.setAttribute('aria-modal','true');m.setAttribute('aria-label','Vídeo: Tecnologia feita por nós');
  var v=document.createElement('video');v.className='vt-video';v.controls=true;v.playsInline=true;v.setAttribute('playsinline','');v.preload='none';v.poster=POSTER;
  var x=document.createElement('button');x.type='button';x.className='vt-fechar';x.setAttribute('aria-label','Fechar o vídeo');x.textContent='×';
  m.append(v,x);document.body.appendChild(m);
  var gatilho=null;
  function abrir(e){
    gatilho=e&&e.currentTarget||null;
    if(!v.getAttribute('src'))v.src=SRC;
    m.hidden=false;document.documentElement.classList.add('vt-aberto');
    var p=v.play();if(p&&p.catch)p.catch(function(){});   // se o navegador bloquear o som, a pessoa usa o botão de play do próprio vídeo
    try{x.focus({preventScroll:true})}catch(err){}
  }
  function fechar(){
    v.pause();m.hidden=true;document.documentElement.classList.remove('vt-aberto');
    try{if(gatilho)gatilho.focus({preventScroll:true})}catch(err){}
  }
  [].forEach.call(botoes,function(b){b.addEventListener('click',abrir)});
  x.addEventListener('click',fechar);
  m.addEventListener('click',function(e){if(e.target===m)fechar()});
  addEventListener('keydown',function(e){if(e.key==='Escape'&&!m.hidden)fechar()});
})();
