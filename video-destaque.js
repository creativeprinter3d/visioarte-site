/* Reprodução sempre iniciada pelo visitante, inclusive com movimento reduzido. */
(() => {
  'use strict';
  const videos = [...document.querySelectorAll('#visioFilme, [data-site-film]')];
  if (!videos.length) return;
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) videos.forEach(video => video.pause());
  });
  videos.forEach(video => {
    const observer = new MutationObserver(() => {
      if (video.closest('[hidden]')) video.pause();
    });
    for (let parent = video.parentElement; parent; parent = parent.parentElement) {
      observer.observe(parent, {attributes:true, attributeFilter:['hidden']});
    }
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(entries => {
        if (!entries[0].isIntersecting) video.pause();
      }, {threshold:0}).observe(video);
    }
  });
})();
