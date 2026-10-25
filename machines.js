(() => {
  'use strict';
  const page = document.getElementById('page-maquinas');
  if (!page) return;
  page.querySelectorAll('[data-machine-jump]').forEach(button => {
    button.addEventListener('click', () => {
      const section = document.getElementById(button.dataset.machineJump);
      const title = section?.querySelector('h2');
      if (!section || !title) return;
      title.focus({ preventScroll: true });
      section.scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
    });
  });
})();
