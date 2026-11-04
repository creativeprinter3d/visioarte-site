/* Âncoras internas das páginas neon. O roteador do site trata qualquer #hash como página, então esses links rolam até o trecho sem mudar o endereço. */
(() => {
  'use strict';
  const trechos = ['teknaToolsTitle', 'colecoes-casa', 'aplicacoes-arq', 'solucoes-tec', 'projectForm', 'areas-colecoes', 'ficha-maquina'];
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.hasAttribute('data-tekna-ir') ? 'teknaToolsTitle' : a.getAttribute('href').slice(1);
    if (!trechos.includes(id)) return;
    const alvo = document.getElementById(id);
    if (!alvo) return;
    e.preventDefault();
    e.stopPropagation();
    alvo.scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  }, true);

  /* vídeo do firmware: só baixa e toca quando a página dele está na tela */
  const fw = document.getElementById('firmwareVideo');
  if (fw && 'IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        if (!fw.poster && fw.dataset.poster) fw.poster = fw.dataset.poster;
        if (!matchMedia('(prefers-reduced-motion: reduce)').matches) fw.play().catch(() => {});
      } else fw.pause();
    }).observe(fw);
  }
})();
