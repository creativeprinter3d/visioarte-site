(() => {
  'use strict';
  const page = document.getElementById('lightingPage');
  if (!page) return;
  const filters = [...page.querySelectorAll('[data-light-filter]')];
  const cards = [...page.querySelectorAll('[data-light-kind]')];
  filters.forEach(button => button.addEventListener('click', () => {
    const kind = button.dataset.lightFilter;
    filters.forEach(filter => filter.setAttribute('aria-pressed', String(filter === button)));
    cards.forEach(card => { card.hidden = kind !== 'todos' && card.dataset.lightKind !== kind; });
    const count = cards.filter(card => !card.hidden).length;
    document.getElementById('lightCount').textContent = count + (count === 1 ? ' referência' : ' referências');
  }));
  document.getElementById('exploreLighting').addEventListener('click', () => {
    const title = document.getElementById('lightCollectionTitle');
    title.focus({ preventScroll: true });
    title.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
  });
  page.querySelectorAll('[data-light-request]').forEach(link => link.addEventListener('click', () => {
    const field = document.getElementById('contactNeed');
    if (!field) return;
    const reference = link.dataset.lightRequest;
    const message = reference === 'sob medida' ? 'Quero desenvolver uma luminária sob medida.' : 'Referência para meu projeto: luminária ' + reference + '.';
    if (!field.value.trim()) field.value = message + '\nAmbiente e medidas: ';
    else if (!field.value.includes(message)) {
      const next = field.value + '\n' + message;
      if (next.length <= field.maxLength) field.value = next;
    }
    field.dispatchEvent(new Event('input', { bubbles: true }));
  }));
})();
