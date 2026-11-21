/* VISIOARTE — motion graphics (teste 21/11/2026). Vanilla, sem biblioteca.
   Seguro por desenho: se algo falhar, o site aparece completo (tudo é revelado por um fusível de 4 s).
   ?motion=off desliga. prefers-reduced-motion desliga. */
(() => {
  'use strict';
  const q = new URLSearchParams(location.search);
  if (q.get('motion') === 'off') return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const root = document.documentElement;
  root.classList.add('mx');
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));

  // fusível 1: sem IntersectionObserver (navegador muito antigo), revela tudo já
  const HAS_IO = 'IntersectionObserver' in window;
  if (!HAS_IO) $$('.mx-up,.mx-wi,.mx-line,.neo-hero,.neo-destaque,.neo-etapas').forEach(e => e.classList.add('mx-go'));
  // fusível 2: o hero (que anima no carregamento) nunca fica escondido além de 6 s
  setTimeout(() => $$('.neo-hero, .neo-hero .mx-up, .neo-hero .mx-wi, .neo-hero .mx-line').forEach(e => e.classList.add('mx-go')), 6000);

  // quebra um título em palavras mascaradas, preservando <em> e <br>
  function splitWords(el, startIndex = 0) {
    let i = startIndex;
    const walk = node => {
      Array.from(node.childNodes).forEach(n => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(part => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.append(' '); return; }
            const w = document.createElement('span'); w.className = 'mx-w';
            const inner = document.createElement('span'); inner.className = 'mx-wi';
            inner.style.setProperty('--i', i++); inner.textContent = part;
            w.append(inner); frag.append(w);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1 && n.tagName !== 'BR') walk(n);
      });
    };
    walk(el);
    return i;
  }
  const line = () => { const s = document.createElement('span'); s.className = 'mx-line'; s.setAttribute('aria-hidden', 'true'); return s; };
  const up = (els, base = 0) => els.filter(Boolean).forEach((e, k) => { e.classList.add('mx-up'); e.style.setProperty('--i', k); e.style.setProperty('--d', base + 'ms'); });

  // leitores de tela continuam lendo o título inteiro: cópia oculta + versão animada sem leitura
  function prepTitle(h) {
    if (!h || h.dataset.mx) return 0;
    h.dataset.mx = '1';
    const label = h.textContent.replace(/\s+/g, ' ').trim();
    h.setAttribute('aria-label', label);
    const n = splitWords(h);
    $$('.mx-w', h).forEach(w => w.setAttribute('aria-hidden', 'true'));
    return n;
  }

  /* ---------- 1. HERO ---------- */
  const hero = $('.neo-hero');
  if (hero) {
    const h1 = $('#neoTitulo', hero), n = prepTitle(h1);
    if (h1) h1.after(line());
    up([$('.neo-lead', hero), $('.neo-pag-acoes', hero), ...$$('.neo-pilares li', hero)], 140 + n * 75 * .5);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      hero.classList.add('mx-go');
      $$('.mx-line', hero).forEach(e => e.classList.add('mx-go'));
    }));
    // a abertura da Ive cobre o hero: quando ela fecha, a animação do hero toca de novo, agora à vista
    const replay = () => {
      root.classList.add('mx-reset');
      hero.classList.remove('mx-go'); $$('.mx-line', hero).forEach(e => e.classList.remove('mx-go'));
      void hero.offsetWidth;
      root.classList.remove('mx-reset');
      requestAnimationFrame(() => requestAnimationFrame(() => {
        hero.classList.add('mx-go'); $$('.mx-line', hero).forEach(e => e.classList.add('mx-go'));
      }));
    };
    let tries = 0;
    const hunt = setInterval(() => {
      const ab = $('.ivc-ab');
      if (ab) {
        clearInterval(hunt);
        let wasOpen = !ab.hidden;
        new MutationObserver(() => { const open = !ab.hidden; if (wasOpen && !open && scrollY < innerHeight) replay(); wasOpen = open; })
          .observe(ab, { attributes: true, attributeFilter: ['hidden'] });
      } else if (++tries > 50) clearInterval(hunt);
    }, 300);
    // paralaxe suave da foto
    const photo = $('.neo-hero-foto', hero); let ticking = false;
    const par = () => {
      ticking = false;
      const r = hero.getBoundingClientRect();
      if (r.bottom < 0 || r.top > innerHeight) return;
      root.style.setProperty('--mx-par', (clamp(-r.top / innerHeight, -0.2, 1) * 46).toFixed(1) + 'px');
    };
    if (photo) addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(par); } }, { passive: true });
  }

  /* ---------- observador comum: dispara quando entra na tela ---------- */
  const io = new IntersectionObserver(entries => entries.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('mx-go'); $$('.mx-line', e.target).forEach(l => l.classList.add('mx-go'));
    io.unobserve(e.target);
  }), { threshold: 0.28 });

  /* ---------- 2. TECNOLOGIA FEITA POR NÓS ---------- */
  const dest = $('.neo-destaque');
  if (dest) {
    const h2 = $('#neoDestaque', dest), n = prepTitle(h2);
    if (h2) h2.after(line());
    up([$('.neo-destaque-txt p', dest), $('.vt-acoes', dest)], 380 + n * 40);
    io.observe(dest);
  }

  /* ---------- 3. COMO FUNCIONA ---------- */
  const page = $('#page-como-fazemos');
  if (page) {
    const etapas = $('.neo-etapas', page);
    if (etapas) { $$('li', etapas).forEach((li, k) => li.style.setProperty('--i', k)); io.observe(etapas); }

    const ol = $('.process-steps', page);
    if (ol) {
      const items = $$('li', ol);
      const rail = document.createElement('div'); rail.className = 'mx-rail'; rail.setAttribute('aria-hidden', 'true');
      const fill = document.createElement('i'); rail.append(fill); ol.prepend(rail);
      const size = () => { // do centro do primeiro círculo ao centro do último
        if (!items.length || !ol.offsetParent) return;
        const last = items[items.length - 1], c = $('.process-number', last);
        rail.style.height = Math.max(0, last.offsetTop + c.offsetTop + c.offsetHeight / 2 - 24) + 'px';
      };
      let tick = false;
      const update = () => {
        tick = false;
        if (!ol.offsetParent) return;
        const r = ol.getBoundingClientRect(), line = innerHeight * 0.62, rh = parseFloat(rail.style.height) || r.height;
        const p = clamp((line - (r.top + 24)) / rh);
        rail.style.setProperty('--p', p.toFixed(4));
        rail.style.setProperty('--head', p > 0.005 && p < 0.995 ? 1 : 0);
        items.forEach(li => {
          const n = $('.process-number', li).getBoundingClientRect();
          li.classList.toggle('mx-on', n.top + n.height / 2 < line);
        });
      };
      const kick = () => { if (!tick) { tick = true; requestAnimationFrame(update); } };
      addEventListener('scroll', kick, { passive: true });
      addEventListener('resize', () => { size(); kick(); });
      // a página começa escondida (SPA): mede quando ela aparecer
      new MutationObserver(() => { size(); kick(); }).observe(page, { attributes: true, attributeFilter: ['hidden'] });
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { size(); kick(); });
      size(); kick();
    }
  }
})();
