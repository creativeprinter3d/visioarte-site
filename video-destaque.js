/* O filme de apresentação inicia sem som ao entrar na tela. */
(() => {
  'use strict';
  const videos = [...document.querySelectorAll('#visioFilme, [data-site-film]')];
  if (!videos.length) return;
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) videos.forEach(video => video.pause());
  });
  videos.forEach(video => {
    const lighting = video.id === 'luminariaFilme';
    const automatic = video.id === 'visioFilme' || lighting;
    let inView = false;
    const playLighting = () => {
      if (!inView || document.hidden || video.closest('[hidden]') || video.ended || !video.paused) return;
      video.play().catch(() => {});
    };
    if (lighting) document.addEventListener('visibilitychange', playLighting);
    let attempted = false;
    if (automatic) {
      video.defaultMuted = true;
      video.muted = true;
      video.playsInline = true;
      video.setAttribute('muted', '');
      video.setAttribute('playsinline', '');
    }
    const observer = new MutationObserver(() => {
      if (video.closest('[hidden]')) video.pause();
    });
    for (let parent = video.parentElement; parent; parent = parent.parentElement) {
      observer.observe(parent, {attributes:true, attributeFilter:['hidden']});
    }
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(entries => {
        const entry = entries[0];
        if (lighting) {
          inView = entry.isIntersecting && entry.intersectionRatio >= 0.35;
          if (inView) playLighting();
          else video.pause();
          return;
        }
        if (!entry.isIntersecting) {
          video.pause();
          return;
        }
        if (automatic && !attempted && entry.intersectionRatio >= 0.35 &&
            !document.hidden && !video.closest('[hidden]')) {
          attempted = true;
          // Uma única tentativa preserva a pausa manual e o fim do filme.
          // Se o navegador bloquear, os controles continuam disponíveis.
          if (video.currentTime === 0 && video.paused) {
            const playback = video.play();
            if (playback && typeof playback.catch === 'function') playback.catch(() => {});
          }
        }
      }, {threshold:[0, 0.35]}).observe(video);
    }
  });
})();
