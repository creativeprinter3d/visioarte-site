(() => {
  'use strict';
  const button = document.getElementById('exploreTekna');
  if (!button) return;
  button.addEventListener('click', () => {
    const title = document.getElementById('teknaToolsTitle');
    title.focus({ preventScroll: true });
    title.scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  });
})();
document.querySelectorAll('[data-tekna-ir]').forEach(a => a.addEventListener('click', e => {
  e.preventDefault();
  const alvo = document.getElementById('teknaToolsTitle');
  if (alvo) alvo.scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
}));
