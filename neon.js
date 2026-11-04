/* As âncoras internas são resolvidas pelo roteador em site.js, inclusive entre páginas. */
(() => {
  'use strict';
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
