/* Ivy, assistente virtual (IA): apresentação na abertura e chat de dúvidas sobre a Visioarte.
   - Perguntas prontas: respostas fixas, sem IA e sem custo.
   - Pergunta livre: só funciona se o endereço do servidor estiver configurado (meta "ivy-chat-url" ou window.IVY_CHAT_URL).
   - Nenhuma conversa é guardada; o navegador só lembra que a apresentação já foi vista nesta visita. */
(function(){
  'use strict';
  if(!document.getElementById('neo-inicio'))return;
  var meta=document.querySelector('meta[name="ivy-chat-url"]');
  var URL_CHAT=(window.IVY_CHAT_URL||(meta&&meta.content)||'').trim();
  var LIMITE_DIA=15, MAX_CHARS=300, MAX_HIST=6;

  var PRONTAS=[
    {p:'O que é a Visioarte?',r:'A Visioarte cria peças de design e desenvolve as próprias máquinas e o próprio software. Design, tecnologia e fabricação ficam na mesma fábrica: damos forma às suas ideias.'},
    {p:'O que vocês fazem?',r:'Peças autorais em impressão 3D: luminárias, vasos, esculturas, móveis, painéis, divisórias, jardins e projetos sob medida. Tudo feito a partir da sua ideia e do seu ambiente.'},
    {p:'Que materiais vocês usam?',r:'Trabalhamos com impressão 3D em pellet e plástico reciclado, além de argila, misturas cimentícias e madeira em alguns projetos. O material é escolhido para o uso de cada peça.'},
    {p:'Como começa um projeto?',r:'Você conta a ideia e envia uma foto, um desenho ou uma referência, com as medidas e o local de uso. A partir disso desenvolvemos uma proposta com você.',acao:{t:'Começar meu projeto',h:'#projetos'}},
    {p:'Vocês têm máquinas e software próprios?',r:'Sim. Desenvolvemos as máquinas de impressão 3D de grande escala, o Visio Slicer (fatiador no navegador), o Visio_Tekna (modelagem e preparação para fabricação) e o firmware das máquinas.',acao:{t:'Ver a tecnologia',h:'#areas/tecnologia'}},
    {p:'Quanto custa e qual o prazo?',r:'Valor e prazo são combinados caso a caso, conforme a peça e o desenvolvimento necessário. Ainda não temos tabela publicada. O primeiro passo é contar a sua ideia.',acao:{t:'Começar meu projeto',h:'#projetos'}}
  ];
  var BOAS_VINDAS='Oi! Eu sou a Ivy, a inteligência artificial da Visioarte. Posso mostrar o site num tour rápido ou tirar dúvidas sobre como a Visioarte trabalha.';

  function el(tag,cls,txt){var e=document.createElement(tag);if(cls)e.className=cls;if(txt!=null)e.textContent=txt;return e}
  function guarda(k,v){try{sessionStorage.setItem(k,v)}catch(e){}}
  function le(k){try{return sessionStorage.getItem(k)}catch(e){return null}}
  function hoje(){return new Date().toISOString().slice(0,10)}
  function usadas(){try{var j=JSON.parse(localStorage.getItem('ivyChatUso')||'{}');return j.d===hoje()?j.n:0}catch(e){return 0}}
  function somaUso(){try{localStorage.setItem('ivyChatUso',JSON.stringify({d:hoje(),n:usadas()+1}))}catch(e){}}

  /* ---------- botão flutuante + cartão de apresentação ---------- */
  var lanc=el('button','ivc-lancador');lanc.type='button';lanc.setAttribute('aria-haspopup','dialog');lanc.setAttribute('aria-label','Conversar com a Ivy, assistente virtual (IA)');
  var avL=el('span','ivc-av');avL.setAttribute('aria-hidden','true');lanc.append(avL,el('span','ivc-lancador-txt','Pergunte à Ivy'));

  var cartao=el('div','ivc-cartao');cartao.setAttribute('role','region');cartao.setAttribute('aria-label','Apresentação da Ivy');cartao.hidden=true;
  var avC=el('span','ivc-av ivc-av-grande');avC.setAttribute('aria-hidden','true');
  var corpoC=el('div','ivc-cartao-corpo');
  corpoC.append(el('strong','ivc-cartao-nome','Ivy · assistente virtual (IA)'),el('p','ivc-cartao-txt',BOAS_VINDAS));
  var acoesC=el('div','ivc-cartao-acoes');
  var bTour=el('button','ivc-btn ivc-btn-cheio','▶ Fazer o tour');bTour.type='button';
  var bDuvida=el('button','ivc-btn','Tirar dúvidas');bDuvida.type='button';
  acoesC.append(bTour,bDuvida);corpoC.append(acoesC);
  var fechaC=el('button','ivc-x','×');fechaC.type='button';fechaC.setAttribute('aria-label','Fechar a apresentação da Ivy');
  cartao.append(avC,corpoC,fechaC);

  /* ---------- janela do chat ---------- */
  var jan=el('section','ivc-janela');jan.setAttribute('role','dialog');jan.setAttribute('aria-label','Conversa com a Ivy, assistente virtual (IA)');jan.hidden=true;
  var cab=el('header','ivc-cab');var avJ=el('span','ivc-av');avJ.setAttribute('aria-hidden','true');
  var tit=el('div','ivc-cab-tit');tit.append(el('strong',null,'Ivy'),el('span',null,'Assistente virtual (IA) da Visioarte'));
  var fechaJ=el('button','ivc-x','×');fechaJ.type='button';fechaJ.setAttribute('aria-label','Fechar a conversa');
  cab.append(avJ,tit,fechaJ);
  var aviso=el('p','ivc-aviso','Respostas geradas por inteligência artificial; podem conter erros. Não digite dados pessoais. A conversa não é guardada.');
  var lista=el('div','ivc-msgs');lista.setAttribute('aria-live','polite');lista.setAttribute('role','log');
  var chips=el('div','ivc-chips');
  var form=el('form','ivc-form');form.autocomplete='off';
  var campo=el('input','ivc-campo');campo.type='text';campo.maxLength=MAX_CHARS;campo.setAttribute('aria-label','Escreva sua pergunta');
  var env=el('button','ivc-enviar','Enviar');env.type='submit';
  form.append(campo,env);
  jan.append(cab,aviso,lista,chips,form);
  document.body.append(lanc,cartao,jan);

  var historico=[], ocupada=false, iniciou=false;
  if(!URL_CHAT){campo.disabled=true;env.disabled=true;campo.placeholder='Escolha uma pergunta acima';}
  else campo.placeholder='Escreva sua pergunta…';

  function rola(){lista.scrollTop=lista.scrollHeight}
  function bolha(quem,txt,acao){
    var b=el('div','ivc-msg ivc-'+quem);b.appendChild(el('p',null,txt));
    if(acao){var a=el('a','ivc-link',acao.t+' →');a.href=acao.h;a.addEventListener('click',function(){fechaJanela()});b.appendChild(a)}
    lista.appendChild(b);rola();return b;
  }
  function digitando(){var b=el('div','ivc-msg ivc-ivy ivc-pensa');b.setAttribute('aria-label','A Ivy está escrevendo');b.append(el('span'),el('span'),el('span'));lista.appendChild(b);rola();return b}

  function responderPronta(it){
    if(ocupada)return;ocupada=true;
    bolha('voce',it.p);var d=digitando();
    setTimeout(function(){d.remove();bolha('ivy',it.r,it.acao);ocupada=false},550);
  }
  PRONTAS.forEach(function(it){
    var c=el('button','ivc-chip',it.p);c.type='button';c.addEventListener('click',function(){responderPronta(it)});chips.appendChild(c);
  });

  var ERROS={limite:'Você chegou ao limite de perguntas de hoje. Volte amanhã ou comece contando a sua ideia na área Projetos.',
    pausa:'A Ivy está descansando por hoje. Volte em breve ou comece pela área Projetos.',
    verificacao:'Não consegui confirmar que você é uma pessoa. Recarregue a página e tente de novo.'};
  function perguntar(texto){
    if(ocupada)return;
    if(usadas()>=LIMITE_DIA){bolha('voce',texto);bolha('ivy',ERROS.limite);return}
    ocupada=true;env.disabled=true;bolha('voce',texto);historico.push({role:'user',content:texto});historico=historico.slice(-MAX_HIST);
    var d=digitando();somaUso();
    var ctl=window.AbortController?new AbortController():null,to=setTimeout(function(){if(ctl)ctl.abort()},25000);
    fetch(URL_CHAT,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({mensagens:historico}),signal:ctl?ctl.signal:undefined})
      .then(function(r){return r.json().catch(function(){return{}}).then(function(j){return{ok:r.ok,j:j}})})
      .then(function(x){
        d.remove();
        if(x.ok&&x.j.resposta){historico.push({role:'assistant',content:x.j.resposta});historico=historico.slice(-MAX_HIST);bolha('ivy',x.j.resposta)}
        else{historico.pop();bolha('ivy',ERROS[x.j.erro]||'Não consegui responder agora. Tente de novo em instantes ou escolha uma das perguntas prontas.')}
      })
      .catch(function(){d.remove();historico.pop();bolha('ivy','Não consegui responder agora. Tente de novo em instantes ou escolha uma das perguntas prontas.')})
      .then(function(){clearTimeout(to);ocupada=false;env.disabled=!URL_CHAT;try{campo.focus({preventScroll:true})}catch(e){}});
  }
  form.addEventListener('submit',function(e){e.preventDefault();var t=campo.value.trim();if(!t||!URL_CHAT)return;campo.value='';perguntar(t)});

  /* ---------- abrir / fechar ---------- */
  function escondeCartao(){cartao.hidden=true;guarda('ivyIntroVista','1')}
  function abreJanela(){
    escondeCartao();lanc.hidden=true;jan.hidden=false;document.documentElement.classList.add('ivc-aberto');
    if(!iniciou){iniciou=true;bolha('ivy','Oi! Eu sou a Ivy, a inteligência artificial da Visioarte. Pode escolher uma pergunta abaixo'+(URL_CHAT?' ou escrever a sua.':'.'))}
    try{(URL_CHAT?campo:fechaJ).focus({preventScroll:true})}catch(e){}
  }
  function fechaJanela(){jan.hidden=true;lanc.hidden=false;document.documentElement.classList.remove('ivc-aberto');try{lanc.focus({preventScroll:true})}catch(e){}}
  function iniciaTour(){
    escondeCartao();
    var b=document.querySelector('.ivy-botao');
    if(b)b.click();
    else{cartao.hidden=false;}
  }
  lanc.addEventListener('click',abreJanela);bDuvida.addEventListener('click',abreJanela);
  bTour.addEventListener('click',iniciaTour);fechaC.addEventListener('click',escondeCartao);fechaJ.addEventListener('click',fechaJanela);
  addEventListener('keydown',function(e){if(e.key==='Escape'){if(!jan.hidden)fechaJanela();else if(!cartao.hidden)escondeCartao()}});

  /* a apresentação aparece uma vez por visita, pouco depois de a página abrir */
  if(!le('ivyIntroVista')){
    setTimeout(function(){if(jan.hidden&&!document.documentElement.classList.contains('ivy-janela-aberta'))cartao.hidden=false},1400);
  }
})();
