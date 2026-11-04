/* VISIOARTE — animações leves nas páginas (04/11/2026)
   Para comparar sem efeitos: ?animacoes=off
   Tema original e piloto antigo mantidos separados.
   A navegação, os formulários e as imagens permanecem independentes do GSAP. */
(() => {
  'use strict';

  const params = new URLSearchParams(window.location.search);
  if (params.get('animacoes') === 'off' ||
      params.get('tema') === 'original' ||
      params.get('experimento') === 'gsap') return;

  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const base = 'https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/';
  let loading = null;
  let context = null;
  let activeKey = '';
  let token = 0;
  let scheduled = false;
  const $all = selector => Array.from(document.querySelectorAll(selector));

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.onload = resolve;
      script.onerror = () => reject(new Error('Falha no carregamento: ' + src));
      document.head.appendChild(script);
    });
  }

  function engine() {
    if (loading) return loading;
    loading = (async () => {
      try {
        if (!window.gsap) await loadScript(base + 'gsap.min.js');
        if (!window.ScrollTrigger) await loadScript(base + 'ScrollTrigger.min.js');
        if (!window.gsap || !window.ScrollTrigger) throw new Error('GSAP indisponível');
        window.gsap.registerPlugin(window.ScrollTrigger);
        return true;
      } catch (err) {
        console.warn('[VISIOARTE] Animações opcionais não carregadas:', err.message);
        // O site permanece visível, sem dependência dos arquivos externos.
        return false;
      }
    })();
    return loading;
  }

  function isRenderable(el) {
    if (!el || el.closest('[hidden]')) return false;
    const css = window.getComputedStyle(el);
    return css.display !== 'none' && css.visibility !== 'hidden' && el.getClientRects().length > 0;
  }

  function first(root, selector) {
    return Array.from(root.querySelectorAll(selector)).find(isRenderable) || null;
  }

  function pageState() {
    const main = $all('main[data-page]').find(el => !el.hidden);
    if (!main) return null;
    const area = main.dataset.page === 'areas'
      ? Array.from(main.querySelectorAll('[data-area]')).find(el => !el.hidden)
      : null;
    const destination = window.location.hash || '#inicio';
    const identity = (area || main).id || main.dataset.page;
    return {root: area || main, key: identity + '|' + destination};
  }

  function dispose() {
    if (context) {
      context.revert();
      context = null;
    }
  }

  function motionProfile(root) {
    const name = root.getAttribute('data-area') || root.closest('main[data-page]')?.dataset.page || root.dataset.page;
    if (name === 'casa-decoracao' || name === 'pecas') return {y:18, x:0, duration:.68, stagger:.065};
    if (name === 'arquitetura') return {y:10, x:15, duration:.82, stagger:.07};
    if (name === 'tecnologia' || name === 'maquinas' || name === 'a-maquina' ||
        name === 'firmware' || name === 'visio-tekna' || name === 'software') {
      return {y:13, x:0, duration:.58, stagger:.055};
    }
    return {y:15, x:0, duration:.7, stagger:.065};
  }

  function playHero(root, profile) {
    const gsap = window.gsap;
    const hero = first(root,
      '.neo-hero, .neo-pag-hero, .slicer-product-hero, .furniture-hero, ' +
      '.lighting-hero, .fw-hero, .page-heading, .process-hero, .recycled-hero');
    if (!hero) return null;

    const heading = first(hero, 'h1');
    const eyebrow = first(hero, '.neo-crumb, .eyebrow, .status');
    const lead = first(hero,
      '.neo-lead, .slicer-product-lead, .slicer-product-description, ' +
      '.furniture-lead, .fw-hero-copy > p:not(.eyebrow), .neo-pag-copy > p:not(.neo-crumb), ' +
      '.neo-hero-copy > p:not(.neo-crumb), .page-heading > p:not(.eyebrow)');
    const actions = first(hero,
      '.neo-pag-acoes, .fw-actions, .slicer-product-actions, .furniture-actions, .neo-hero-copy > .neo-btn');
    const pillars = first(hero, '.neo-pilares');
    const items = [eyebrow, heading, lead, actions, pillars].filter((el, i, a) => el && a.indexOf(el) === i);
    if (items.length) {
      gsap.fromTo(items,
        {opacity:0, x:profile.x * -.5, y:profile.y},
        {opacity:1, x:0, y:0, duration:profile.duration + .1, stagger:.10,
         ease:'power2.out', clearProps:'opacity,transform'});
    }

    // Apenas opacidade: as imagens já possuem animação CSS de câmera,
    // e não devemos disputar o mesmo transform com GSAP.
    const photo = first(hero,
      '.neo-hero-foto, .neo-pag-foto:not(.neo-imagem-breve), ' +
      '.slicer-product-visual, .fw-visual, .furniture-figure, .lighting-hero img');
    if (photo) {
      gsap.from(photo, {
        opacity:0, duration:1.15, delay:.12, ease:'power1.out',
        clearProps:'opacity'
      });
    }
    return hero;
  }

  function revealSections(root, profile, hero) {
    const gsap = window.gsap;
    const selector = [
      '.neo-jornadas .neo-titulo-linha', '.neo-jornadas .neo-card',
      '.neo-destaque', '.story-grid',
      '.neo-abas', '.neo-forma', '.neo-titulo-linha',
      '.neo-colecoes .area-card', '.area-grid:not(.neo-colecoes) .area-card',
      '.neo-passos', '.neo-etapas', '.neo-difs', '.neo-cta',
      '.machines-nav', '.machines-equipment', '.machines-technology',
      '.machines-faq', '.machines-final',
      '.fw-intro', '.fw-flow', '.fw-systems', '.fw-progress', '.fw-faq', '.fw-final',
      '.neo-maq-corpo', '.neo-proc-fotos', '.neo-ficha',
      '.process-principles', '.process-journey-intro', '.process-steps',
      '.process-tools', '.process-tool-grid', '.process-materials',
      '.process-feedback', '.process-final',
      '.neo-mats', '.recycled-section', '.recycled-cards',
      '.recycled-steps', '.recycled-applications', '.recycled-final',
      '.tekna-panorama', '.tekna-interface', '.tekna-tools',
      '.tekna-tool-grid', '.tekna-stages', '.tekna-faq', '.tekna-final',
      '.slicer-section-heading', '.slicer-benefit', '.slicer-workflow',
      '.slicer-steps', '.slicer-final',
      '.furniture-section-header', '.furniture-direction',
      '.furniture-materials', '.furniture-section',
      '.furniture-facts', '.furniture-process', '.furniture-faq-grid', '.furniture-final',
      '.lighting-reference', '.lighting-gallery',
      '.lighting-section', '.lighting-collection', '.lighting-faq',
      '.project-steps', '.contact-layout', '.neo-contatos', '.area-other',
      '.page-heading + .area-grid'
    ].join(', ');

    const seen = new Set();
    const elements = [];
    for (const el of root.querySelectorAll(selector)) {
      if (seen.has(el) || !isRenderable(el) || (hero && hero.contains(el))) continue;
      // Evitar animar uma seção inteira e, ao mesmo tempo, todos os filhos.
      if (elements.some(parent => parent.contains(el))) continue;
      seen.add(el);
      elements.push(el);
      if (elements.length >= 80) break;
    }

    elements.forEach((element, index) => {
      const card = element.matches('.neo-card, .area-card, .furniture-direction, .slicer-benefit');
      const fromX = card ? profile.x : 0;
      const travel = card ? profile.y * .75 : profile.y;
      gsap.fromTo(element,
        {opacity:0, x:fromX, y:travel},
        {opacity:1, x:0, y:0, duration:profile.duration,
         delay:card ? (index % 3) * profile.stagger : 0,
         ease:'power2.out', clearProps:'opacity,transform',
         scrollTrigger:{
           trigger:element,
           start:'top 91%',
           once:true,
           invalidateOnRefresh:true
         }});
    });
  }

  function apply(state) {
    if (motion.matches || !state || !window.gsap || !window.ScrollTrigger) return;
    const profile = motionProfile(state.root);
    context = window.gsap.context(() => {
      const hero = playHero(state.root, profile);
      revealSections(state.root, profile, hero);
    }, state.root);
    window.requestAnimationFrame(() => window.ScrollTrigger.refresh());
  }

  function sync() {
    if (motion.matches) {
      token++;
      dispose();
      activeKey = '';
      return;
    }
    const state = pageState();
    if (!state) return;
    if (state.key === activeKey) return;

    activeKey = state.key;
    const currentToken = ++token;
    dispose();
    engine().then(ok => {
      if (!ok || motion.matches || currentToken !== token) return;
      const current = pageState();
      if (!current || current.key !== state.key) return;
      apply(current);
    });
  }

  function schedule() {
    if (scheduled) return;
    scheduled = true;
    // Site com roteamento por hash e pushState: aguarda o roteador e o scroll para o topo.
    window.requestAnimationFrame(() => window.requestAnimationFrame(() => {
      scheduled = false;
      sync();
    }));
  }

  function boot() {
    // CSS exclusivo de microinterações, sem mudar o layout.
    document.documentElement.classList.add('animacoes-gsap');
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'site-animacoes.css?v=20261104-1';
    document.head.appendChild(link);

    const observer = new MutationObserver(mutations => {
      if (mutations.some(m => m.attributeName === 'hidden')) schedule();
    });
    $all('main[data-page]').forEach(main => {
      observer.observe(main, {attributes:true, attributeFilter:['hidden'], subtree:true});
    });
    window.addEventListener('hashchange', schedule);
    window.addEventListener('popstate', schedule);
    motion.addEventListener('change', schedule);
    // Também cobre rotas executadas por pushState sem evento hashchange.
    document.addEventListener('click', e => {
      if (e.target.closest('a[href^="#"]')) schedule();
    });
    schedule();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, {once:true});
  } else boot();
})();
