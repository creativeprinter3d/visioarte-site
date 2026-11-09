/* Ivy, assistente virtual (IA) na página inicial: tour gravado (sem conversa), só começa depois do clique.
   Parada 1: no topo da Início (assets/ivy/ivy-inicio.mp4). Parada 2: caminha pelos cartões de "Conheça nossas criações"
   (assets/ivy/ivy-criacoes.mp4). No celular: um video horizontal numa janela (assets/ivy/ivy-apresentacao-celular.mp4). Parada 4: o vídeo "Tecnologia feita por nós" abre sozinho ao fim da parada 3. Parada 3: ao lado do filme "O universo VISIOARTE" (assets/ivy/ivy-universo.mp4, 30 s, o filme toca junto). Em cada arquivo a voz vai junto com o vídeo, então ficam sempre em sincronia. */
(function(){
  'use strict';
  var hero=document.getElementById('neo-inicio');
  if(!hero||!window.matchMedia)return;
  /* ---------- celular (< 1000 px): um unico video horizontal da Ivy numa janela propria, aberta pelo botao ---------- */
  if(!matchMedia('(min-width:1000px)').matches){
    var ARQ_M='assets/ivy/ivy-apresentacao-celular.mp4', POSTER_M='assets/ivy/ivy-apresentacao-celular.jpg';
    var jan=document.createElement('div');jan.className='ivy-janela';jan.hidden=true;jan.setAttribute('role','dialog');jan.setAttribute('aria-modal','true');jan.setAttribute('aria-label','Apresentação com a Ivy, assistente virtual (IA)');
    var vm=document.createElement('video');vm.className='ivy-janela-video';vm.controls=true;vm.playsInline=true;vm.setAttribute('playsinline','');vm.preload='none';vm.poster=POSTER_M;
    var fx=document.createElement('button');fx.type='button';fx.className='ivy-janela-fechar';fx.setAttribute('aria-label','Fechar a apresentação');fx.textContent='×';
    var dica=document.createElement('div');dica.className='ivy-janela-dica';
    dica.innerHTML='<span class="ivy-giro" aria-hidden="true">⟳</span><p>Dica: <strong>gire o celular</strong> para ver a apresentação maior.</p><button type="button">Tela cheia</button>';
    jan.append(vm,fx,dica);document.body.appendChild(jan);
    dica.querySelector('button').addEventListener('click',function(){
      var rf=jan.requestFullscreen||jan.webkitRequestFullscreen;
      if(rf){var r=rf.call(jan);var ok=function(){try{screen.orientation.lock('landscape').catch(function(){})}catch(e){}};if(r&&r.then)r.then(ok).catch(function(){});else ok()}
      else if(vm.webkitEnterFullscreen){vm.webkitEnterFullscreen()}
    });
    var abre=document.createElement('button');abre.type='button';abre.className='ivy-botao ivy-fixa ivy-botao-movel';abre.textContent='▶ Tour com a Ivy';abre.setAttribute('aria-label','Assistir à apresentação da Ivy');
    document.body.appendChild(abre);
    function abrir(){if(!vm.getAttribute('src'))vm.src=ARQ_M;jan.hidden=false;document.documentElement.classList.add('ivy-janela-aberta');vm.currentTime=0;var p=vm.play();if(p&&p.catch)p.catch(function(){});try{fx.focus({preventScroll:true})}catch(e){}}
    function fechar(){vm.pause();jan.hidden=true;document.documentElement.classList.remove('ivy-janela-aberta');try{abre.focus({preventScroll:true})}catch(e){}}
    abre.addEventListener('click',abrir);fx.addEventListener('click',fechar);
    vm.addEventListener('ended',function(){fechar();var pv=document.querySelector('.vt-play');if(pv)setTimeout(function(){pv.click()},400)});   // no celular, ao acabar o video da Ivy, abre o video da tecnologia
    jan.addEventListener('click',function(e){if(e.target===jan)fechar()});
    addEventListener('keydown',function(e){if(e.key==='Escape'&&!jan.hidden)fechar()});
    return;
  }
  /* ---------- computador (>= 1000 px): tour pela pagina ---------- */

  /* ---------- parada 1: topo da página ---------- */
  var ARQ1='assets/ivy/ivy-inicio.mp4';
  var PROP=480/716;                 // largura/altura do vídeo recortado
  var CENTRO_X=.60, ALTURA=.93, TOPO=.02;   // onde a Ivy fica na seção (fração da seção)
  var FALAS1=[[0.14,'Oi, eu sou a Ivy.'],[1.95,'Bem-vindo à Visioarte.'],[3.85,'Aqui o design nasce em polímeros reciclados.'],[6.9,'E esta peça é um exemplo,'],[8.35,'feita nas nossas máquinas.']];
  var FIM_FALA1=9.9;

  /* ---------- parada 2: cartões "Conheça nossas criações" ---------- */
  var ARQ2='assets/ivy/ivy-criacoes.mp4';
  var K=.55;                         // largura do quadro original = K x largura da janela (a Ivy fica da altura dos cartões)
  var QW=1284, QH=716, CORTE_X=128, CORTE_W=800;   // quadro original e recorte do arquivo
  var CHEGADA_X=.496, PES_Y=.83;     // onde ela para (fração do quadro) e onde ficam os pés (fração da altura do quadro)
  var P1='As nossas soluções englobam diversos tipos de materiais', P2=' e tecnologias', P3=' que dão forma às nossas ideias.';
  var FIM_FALA2=8.05, SAI2=7.5;

  /* ---------- parada 3: ao lado do filme "O universo VISIOARTE" ---------- */
  var ARQ3='assets/ivy/ivy-universo.mp4';
  var FALAS3=[[0.3,'Esta é a nossa história: do polímero reciclado até a peça pronta.'],[4.6,'Tudo começa no polímero reciclado: limpo, triturado e transformado em material para imprimir.'],[11.4,'Camada por camada, a peça nasce nas nossas máquinas.'],[20.1,'Do software à fabricação, tudo é desenvolvido por nós.'],[24.6,'Peças autorais, uma a uma.'],[27.0,'Visioarte. Damos forma às suas ideias.']];
  var FIM_FALA3=30.0, SAI3=29.2;
  var PROP3=640/720, ALT3=1.135, ESQ3=.392, PES3=.93;   // janela do vídeo (largura/altura), altura = 1,135 x altura do filme, recuo à esquerda do filme, onde ficam os pés

  var camada=document.createElement('div');camada.className='ivy-camada';camada.setAttribute('aria-label','Ivy, assistente virtual');
  var v=document.createElement('video');v.className='ivy-video';v.preload='none';v.playsInline=true;v.setAttribute('playsinline','');v.setAttribute('aria-hidden','true');
  var leg=document.createElement('div');leg.className='ivy-legenda';leg.setAttribute('aria-live','polite');
  var rot=document.createElement('div');rot.className='ivy-rotulo';rot.textContent='Ivy · assistente virtual (IA)';
  var bt=document.createElement('button');bt.type='button';bt.className='ivy-botao';bt.textContent='▶ Tour com a Ivy';bt.setAttribute('aria-label','Ouvir a Ivy apresentar o site');
  var pu=document.createElement('button');pu.type='button';pu.className='ivy-pular';pu.textContent='Pular';pu.setAttribute('aria-label','Pular a apresentação da Ivy');
  camada.append(v,leg,rot,bt,pu);hero.appendChild(camada);

  /* a parada 2 usa elementos fixos na janela (a seção dos cartões fica mais abaixo na página) */
  var v2=document.createElement('video');v2.className='ivy-video ivy-video-fixo';v2.preload='none';v2.playsInline=true;v2.setAttribute('playsinline','');v2.setAttribute('aria-hidden','true');
  var leg2=document.createElement('div');leg2.className='ivy-legenda ivy-fixa';leg2.setAttribute('aria-live','polite');
  var rot2=document.createElement('div');rot2.className='ivy-rotulo ivy-fixa';rot2.textContent='Ivy · assistente virtual (IA)';
  var pu2=document.createElement('button');pu2.type='button';pu2.className='ivy-pular ivy-fixa';pu2.textContent='Pular';pu2.setAttribute('aria-label','Pular a apresentação da Ivy');
  document.body.append(v2,leg2,rot2,pu2);
  var v3=document.createElement('video');v3.className='ivy-video ivy-video-fixo';v3.preload='none';v3.playsInline=true;v3.setAttribute('playsinline','');v3.setAttribute('aria-hidden','true');
  var leg3=document.createElement('div');leg3.className='ivy-legenda ivy-fixa';leg3.setAttribute('aria-live','polite');
  var rot3=document.createElement('div');rot3.className='ivy-rotulo ivy-fixa';rot3.textContent='Ivy · assistente virtual (IA)';
  var pu3=document.createElement('button');pu3.type='button';pu3.className='ivy-pular ivy-fixa';pu3.textContent='Pular';pu3.setAttribute('aria-label','Pular a apresentação da Ivy');
  document.body.append(v3,leg3,rot3,pu3);
  var filme=document.getElementById('visioFilme');

  function posiciona(){
    var H=hero.clientHeight,W=hero.clientWidth,h=H*ALTURA,w=h*PROP;
    v.style.height=h+'px';v.style.width=w+'px';v.style.top=(H*TOPO)+'px';v.style.left=(W*CENTRO_X-w/2)+'px';
  }
  function posiciona2(){
    var cards=document.querySelectorAll('.neo-jornadas .neo-card');
    if(cards.length<2)return false;
    var meio=cards[1].getBoundingClientRect(), base=Math.max.apply(null,[].map.call(cards,function(c){return c.getBoundingClientRect().bottom}));
    var s=K*innerWidth/QW;                                   // pixels da janela por pixel do quadro original
    var w=CORTE_W*s,h=QH*s;
    var cx=meio.left+meio.width/2;                           // centro do cartão do meio
    v2.style.width=w+'px';v2.style.height=h+'px';
    v2.style.left=(cx-(CHEGADA_X*QW-CORTE_X)*s)+'px';
    v2.style.top=(base+6-PES_Y*h)+'px';
    return true;
  }
  function posiciona3(){
    if(!filme)return false;
    var r=filme.getBoundingClientRect();if(!r.width)return false;
    var h=ALT3*r.height,w=h*PROP3;
    v3.style.width=w+'px';v3.style.height=h+'px';
    v3.style.left=(r.left-ESQ3*r.width)+'px';
    v3.style.top=(r.bottom+.005*r.width-PES3*h)+'px';
    return true;
  }
  posiciona();addEventListener('resize',function(){posiciona();if(etapa===2)posiciona2();if(etapa===3)posiciona3()});

  var etapa=0, tm=[];                                          // 0 parado, 1 parada 1, 2 parada 2, 3 parada 3
  function limpaTm(){tm.forEach(clearTimeout);tm=[]}
  function texto1(t){var s='';for(var i=0;i<FALAS1.length;i++)if(t>=FALAS1[i][0])s=FALAS1[i][1];return t>FIM_FALA1?'':s}
  function texto3(t){var s='';for(var i=0;i<FALAS3.length;i++)if(t>=FALAS3[i][0])s=FALAS3[i][1];return t>FIM_FALA3?'':s}
  function texto2(t){return t<.2||t>FIM_FALA2?'':(t<4.05?P1:t<5.87?P1+P2+'…':P1+P2+P3)}

  function paraTudo(rotuloBotao){
    limpaTm();etapa=0;
    [v,v2,v3].forEach(function(x){x.pause()});
    leg.classList.remove('ivy-visivel');rot.classList.remove('ivy-visivel');pu.classList.remove('ivy-visivel');
    leg2.classList.remove('ivy-visivel');rot2.classList.remove('ivy-visivel');pu2.classList.remove('ivy-visivel');
    leg3.classList.remove('ivy-visivel');rot3.classList.remove('ivy-visivel');pu3.classList.remove('ivy-visivel');
    v.classList.remove('ivy-em-cena');v.classList.add('ivy-saindo');
    v2.classList.remove('ivy-em-cena');v2.classList.add('ivy-saindo');
    v3.classList.remove('ivy-em-cena');v3.classList.add('ivy-saindo');
    tm.push(setTimeout(function(){bt.textContent=rotuloBotao;bt.style.display='';try{bt.focus({preventScroll:true})}catch(e){}},900));
  }
  function inicia(){
    if(etapa)return;
    limpaTm();
    if(!v.getAttribute('src'))v.src=ARQ1;
    if(!v2.getAttribute('src')){v2.preload='auto';v2.src=ARQ2}     // baixa a parada 2 enquanto a 1 toca (274 KB)
    if(!v3.getAttribute('src')){v3.preload='auto';v3.src=ARQ3}     // e a parada 3 (590 KB) e o filme (3 MB)
    if(filme&&filme.preload!=='auto')filme.preload='auto';
    bt.style.display='none';etapa=1;
    v.classList.remove('ivy-saindo');v.currentTime=0;
    var p=v.play();
    if(p&&p.catch)p.catch(function(){paraTudo('▶ Tour com a Ivy')});
    requestAnimationFrame(function(){v.classList.add('ivy-em-cena')});
    rot.classList.add('ivy-visivel');leg.classList.add('ivy-visivel');pu.classList.add('ivy-visivel');
  }
  /* rola até y com animação própria (quadro a quadro, sempre com posição ABSOLUTA e instantânea) e, no fim, crava em y.
     Não usa a rolagem suave do navegador: ela pode atrasar ou dobrar quando a aba está em segundo plano. */
  function rolarAte(y,fim){
    var y0=scrollY,t0=performance.now(),D=800,feito=false;
    function passo(agora){
      if(feito)return;
      var p=Math.min(1,(agora-t0)/D),e=p<.5?2*p*p:1-Math.pow(-2*p+2,2)/2;
      scrollTo({top:Math.round(y0+(y-y0)*e),behavior:'instant'});
      if(p<1)requestAnimationFrame(passo);
    }
    requestAnimationFrame(passo);
    tm.push(setTimeout(function(){feito=true;scrollTo({top:y,behavior:'instant'});tm.push(setTimeout(fim,350))},D+200));
  }
  function paradaDois(){
    if(etapa!==1)return;
    etapa=2;limpaTm();v.pause();
    leg.classList.remove('ivy-visivel');rot.classList.remove('ivy-visivel');pu.classList.remove('ivy-visivel');
    v.classList.remove('ivy-em-cena');v.classList.add('ivy-saindo');
    var alvo=document.querySelector('.neo-jornadas .neo-cards')||document.querySelector('.neo-jornadas');
    if(!alvo){paraTudo('↻ Rever a Ivy');return}
    var r0=alvo.getBoundingClientRect();
    var DEST=Math.max(0,Math.round(scrollY+r0.top-Math.max(70,(innerHeight-r0.height)/2)));   // calculado UMA vez, com a página parada: cartões no meio da janela
    rolarAte(DEST,function(){
      if(etapa!==2)return;
      if(!posiciona2()){paraTudo('↻ Rever a Ivy');return}
      v2.classList.remove('ivy-saindo');v2.currentTime=0;
      var p=v2.play();if(p&&p.catch)p.catch(function(){paraTudo('▶ Tour com a Ivy')});
      requestAnimationFrame(function(){v2.classList.add('ivy-em-cena')});
      rot2.classList.add('ivy-visivel');leg2.classList.add('ivy-visivel');pu2.classList.add('ivy-visivel');
    });
  }
  function paradaTres(){
    if(etapa!==2)return;
    etapa=3;limpaTm();v2.pause();
    leg2.classList.remove('ivy-visivel');rot2.classList.remove('ivy-visivel');pu2.classList.remove('ivy-visivel');
    v2.classList.remove('ivy-em-cena');v2.classList.add('ivy-saindo');
    var secao=filme&&filme.closest('.visio-filme');
    if(!secao){paraTudo('↻ Rever o tour');return}
    var r0=filme.getBoundingClientRect();
    var DEST=Math.max(0,Math.round(scrollY+r0.top-Math.max(110,(innerHeight-r0.height)/2-30)));   // filme no meio da janela, com folga em cima para a cabeça da Ivy e embaixo para a legenda
    rolarAte(DEST,function(){
      if(etapa!==3)return;
      if(!posiciona3()){paraTudo('↻ Rever o tour');return}
      try{filme.currentTime=0}catch(e){}
      var pf=filme.play();if(pf&&pf.catch)pf.catch(function(){});
      v3.classList.remove('ivy-saindo');v3.currentTime=0;
      var p=v3.play();if(p&&p.catch)p.catch(function(){paraTudo('▶ Tour com a Ivy')});
      requestAnimationFrame(function(){v3.classList.add('ivy-em-cena')});
      rot3.classList.add('ivy-visivel');leg3.classList.add('ivy-visivel');pu3.classList.add('ivy-visivel');
    });
  }
  /* parada 4: quando a Ivy sai, a página desce até o destaque "Tecnologia feita por nós" e o vídeo abre e começa a tocar.
     Quando a pessoa fecha o vídeo, o tour termina (video-tecnologia.js avisa com o evento "vt:fechou"). */
  function paradaQuatro(){
    if(etapa!==3)return;
    etapa=4;limpaTm();v3.pause();
    leg3.classList.remove('ivy-visivel');rot3.classList.remove('ivy-visivel');pu3.classList.remove('ivy-visivel');
    var dest=document.querySelector('.neo-destaque'),botaoVideo=document.querySelector('.vt-play');
    if(!dest||!botaoVideo){paraTudo('↻ Rever o tour');return}
    var r0=dest.getBoundingClientRect();
    var DEST=Math.max(0,Math.round(scrollY+r0.top-Math.max(90,(innerHeight-r0.height)/2)));
    rolarAte(DEST,function(){if(etapa===4)botaoVideo.click()});
  }
  document.addEventListener('vt:fechou',function(){if(etapa===4)paraTudo('↻ Rever o tour')});
  v3.addEventListener('timeupdate',function(){
    if(etapa!==3)return;
    var t=v3.currentTime;leg3.textContent=texto3(t);
    if(filme&&!v3.seeking&&Math.abs(filme.currentTime-t)>.4){try{filme.currentTime=t}catch(e){}}   // o filme acompanha a voz
    if(filme&&filme.paused&&t<FIM_FALA3&&!filme.ended)filme.play().catch(function(){});
    if(t>=SAI3&&!v3.classList.contains('ivy-saindo')){v3.classList.remove('ivy-em-cena');v3.classList.add('ivy-saindo');leg3.classList.remove('ivy-visivel');rot3.classList.remove('ivy-visivel');pu3.classList.remove('ivy-visivel')}
  });
  v3.addEventListener('ended',function(){if(etapa===3)paradaQuatro()});
  v.addEventListener('timeupdate',function(){
    if(etapa!==1)return;
    leg.textContent=texto1(v.currentTime);
    if(v.currentTime>=FIM_FALA1+.15)paradaDois();
  });
  v.addEventListener('ended',function(){if(etapa===1)paradaDois()});
  v2.addEventListener('timeupdate',function(){
    if(etapa!==2)return;
    var t=v2.currentTime;leg2.textContent=texto2(t);
    if(t>=SAI2&&!v2.classList.contains('ivy-saindo')){v2.classList.remove('ivy-em-cena');v2.classList.add('ivy-saindo');leg2.classList.remove('ivy-visivel');rot2.classList.remove('ivy-visivel');pu2.classList.remove('ivy-visivel')}
    if(t>=FIM_FALA2+.35)paradaTres();
  });
  v2.addEventListener('ended',function(){if(etapa===2)paradaTres()});
  bt.addEventListener('click',function(){if(scrollY>8)scrollTo({top:0,behavior:'instant'});inicia()});
  pu.addEventListener('click',function(){paraTudo('▶ Tour com a Ivy')});
  pu2.addEventListener('click',function(){paraTudo('▶ Tour com a Ivy')});
  pu3.addEventListener('click',function(){paraTudo('▶ Tour com a Ivy')});
  addEventListener('scroll',function(){if(etapa===2&&v2.classList.contains('ivy-em-cena'))posiciona2();if(etapa===3&&v3.classList.contains('ivy-em-cena'))posiciona3()},{passive:true});   // se a pessoa rolar a página, a Ivy acompanha os cartões
  addEventListener('hashchange',function(){if(etapa)paraTudo('▶ Tour com a Ivy')});
})();
