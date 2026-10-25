(() => {
  'use strict';
  const page = document.getElementById('page-como-fazemos');
  if (!page) return;
  document.getElementById('exploreProcess').addEventListener('click', () => {
    const title = document.getElementById('processJourneyTitle');
    title.focus({ preventScroll: true });
    title.scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  });
  const controls = [...page.querySelectorAll('[data-process-material]')];
  const panels = [...page.querySelectorAll('[data-process-panel]')];
  controls.forEach(button => button.addEventListener('click', () => {
    controls.forEach(control => control.setAttribute('aria-pressed', String(control === button)));
    panels.forEach(panel => { panel.hidden = panel.dataset.processPanel !== button.dataset.processMaterial; });
  }));
})();