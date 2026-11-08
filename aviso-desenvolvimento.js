/* Aviso "Site em desenvolvimento": aparece em cada visita e some ao clicar em fechar (lembra só até fechar a aba). */
(function(){
  'use strict';
  try{if(sessionStorage.getItem('avisoDevFechado')==='1')return}catch(e){}
  var a=document.createElement('div');a.className='aviso-dev';a.setAttribute('role','note');
  a.innerHTML='<strong>Site em desenvolvimento</strong><span>Algumas informações e imagens ainda são provisórias.</span><button type="button" aria-label="Fechar aviso">×</button>';
  a.querySelector('button').addEventListener('click',function(){a.hidden=true;try{sessionStorage.setItem('avisoDevFechado','1')}catch(e){}});
  document.body.appendChild(a);
})();
