/* Ivy, assistente virtual (IA) na página inicial: vídeo gravado (sem conversa), só toca depois do clique.
   Vídeo e voz vêm no mesmo arquivo (assets/ivy/ivy-inicio.mp4), então ficam sempre em sincronia. */
(function(){
  'use strict';
  var hero=document.getElementById('neo-inicio');
  if(!hero||!window.matchMedia||!matchMedia('(min-width:1000px)').matches)return;

  var ARQ='assets/ivy/ivy-inicio.mp4';
  var PROP=480/716;                 // largura/altura do vídeo recortado
  var CENTRO_X=.60, ALTURA=.93, TOPO=.02;   // onde a Ivy fica na seção (fração da seção)
  var FALAS=[[0.14,'Oi, eu sou a Ivy.'],[1.95,'Bem-vindo à Visioarte.'],[3.85,'Aqui o design nasce em polímeros reciclados.'],[6.9,'E esta peça é um exemplo,'],[8.35,'feita nas nossas máquinas.']];
  var FIM_FALA=9.9;

  var camada=document.createElement('div');camada.className='ivy-camada';camada.setAttribute('aria-label','Ivy, assistente virtual');
  var v=document.createElement('video');v.className='ivy-video';v.preload='none';v.playsInline=true;v.setAttribute('playsinline','');v.setAttribute('aria-hidden','true');
  var leg=document.createElement('div');leg.className='ivy-legenda';leg.setAttribute('aria-live','polite');
  var rot=document.createElement('div');rot.className='ivy-rotulo';rot.textContent='Ivy · assistente virtual (IA)';
  var bt=document.createElement('button');bt.type='button';bt.className='ivy-botao';bt.textContent='▶ Tour com a Ivy';bt.setAttribute('aria-label','Ouvir a Ivy apresentar o site');
  var pu=document.createElement('button');pu.type='button';pu.className='ivy-pular';pu.textContent='Pular';pu.setAttribute('aria-label','Pular a apresentação da Ivy');
  camada.append(v,leg,rot,bt,pu);hero.appendChild(camada);

  function posiciona(){
    var H=hero.clientHeight,W=hero.clientWidth,h=H*ALTURA,w=h*PROP;
    v.style.height=h+'px';v.style.width=w+'px';v.style.top=(H*TOPO)+'px';v.style.left=(W*CENTRO_X-w/2)+'px';
  }
  posiciona();addEventListener('resize',posiciona);

  var tocando=false;
  function texto(t){var s='';for(var i=0;i<FALAS.length;i++)if(t>=FALAS[i][0])s=FALAS[i][1];return t>FIM_FALA?'':s}
  function fim(rotuloBotao){
    tocando=false;
    leg.classList.remove('ivy-visivel');rot.classList.remove('ivy-visivel');pu.classList.remove('ivy-visivel');
    v.classList.remove('ivy-em-cena');v.classList.add('ivy-saindo');
    setTimeout(function(){bt.textContent=rotuloBotao;bt.style.display='';bt.focus({preventScroll:true})},900);
  }
  function inicia(){
    if(tocando)return;
    if(!v.getAttribute('src'))v.src=ARQ;
    bt.style.display='none';tocando=true;
    v.classList.remove('ivy-saindo');v.currentTime=0;
    var p=v.play();
    if(p&&p.catch)p.catch(function(){fim('▶ Tour com a Ivy')});
    requestAnimationFrame(function(){v.classList.add('ivy-em-cena')});
    rot.classList.add('ivy-visivel');leg.classList.add('ivy-visivel');pu.classList.add('ivy-visivel');
  }
  v.addEventListener('timeupdate',function(){leg.textContent=texto(v.currentTime);if(v.currentTime>=FIM_FALA+.15&&tocando)fim('↻ Rever a Ivy')});
  v.addEventListener('ended',function(){if(tocando)fim('↻ Rever a Ivy')});
  bt.addEventListener('click',inicia);
  pu.addEventListener('click',function(){v.pause();fim('▶ Tour com a Ivy')});
})();
