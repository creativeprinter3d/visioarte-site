/* Reprodução sempre iniciada pelo visitante, inclusive com movimento reduzido. */
(() => {
  'use strict';
  const video = document.getElementById('visioFilme');
  const home = document.getElementById('page-inicio');
  if (!video || !home) return;
  const pause = () => video.pause();
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) pause();
  });
  new MutationObserver(() => {
    if (home.hidden) pause();
  }).observe(home, {attributes:true, attributeFilter:['hidden']});
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      if (!entries[0].isIntersecting) pause();
    }, {threshold:0}).observe(video);
  }
})();
