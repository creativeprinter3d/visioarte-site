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
    const resumeFilm = () => {
      if (!inView || document.hidden || video.closest('[hidden]') || video.ended || !video.paused) return;
      video.play().catch(() => {});
    };
    if (automatic) document.addEventListener('visibilitychange', resumeFilm);
    if (lighting) {
      const nextImage = document.querySelector('button[aria-controls="luminariaFilme"]');
      nextImage.addEventListener('click', () => {
        // Cada uma das três cenas ocupa 2,5 segundos.
        const sceneDuration = 2.5;
        const lastScene = 2;
        const scene = Math.min(Math.floor(video.currentTime / sceneDuration), lastScene);
        video.currentTime = scene === lastScene ? 0 : (scene + 1) * sceneDuration;
        video.play().catch(() => {});
      });
    }
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
        inView = entry.isIntersecting && entry.intersectionRatio >= 0.35;
        if (!entry.isIntersecting || (lighting && !inView)) video.pause();
        if (automatic) resumeFilm();
      }, {threshold:[0, 0.35]}).observe(video);
    }
  });
})();
