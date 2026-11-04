/* VISIOARTE | Piloto GSAP da página Casa e Decoração (04/11/2026).
   Opt-in por ?experimento=gsap. Zero efeito no site principal.
   Mantém animações opcionais e respeita movimento reduzido. */
(() => {
  'use strict';
  const params = new URLSearchParams(window.location.search);
  if (params.get('experimento') !== 'gsap') return;

  const root = document.documentElement;
  root.classList.add('experimento-gsap');
  const style = document.createElement('link');
  style.rel = 'stylesheet';
  style.href = 'piloto-gsap.css?v=20261104-1';
  document.head.append(style);

  const CDN = 'https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/';
  let loadPromise = null;
  let context = null;
  let queued = false;
  let area = null;
  let wrapper = null;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  const loadScript = src => new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = resolve;
    script.onerror = () => reject(new Error('Não foi possível carregar: ' + src));
    document.head.append(script);
  });

  function loadGSAP() {
    if (!loadPromise) {
      loadPromise = loadScript(CDN + 'gsap.min.js')
        .then(() => loadScript(CDN + 'ScrollTrigger.min.js'))
        .then(() => {
          if (!window.gsap || !window.ScrollTrigger) {
            throw new Error('GSAP e ScrollTrigger não ficaram disponíveis.');
          }
          window.gsap.registerPlugin(window.ScrollTrigger);
          return window.gsap;
        })
        .catch(error => {
          // Se a CDN estiver indisponível, o site continua visível e navegável.
          console.warn('[VISIOARTE / piloto GSAP]', error.message);
          return null;
        });
    }
    return loadPromise;
  }

  function isCasaVisible() {
    return Boolean(wrapper && area && !wrapper.hidden && !area.hidden);
  }

  function clearAnimations() {
    if (!context) return;
    context.revert();
    context = null;
  }

  function buildAnimations() {
    if (!isCasaVisible() || reducedMotion.matches || context || !window.gsap || !window.ScrollTrigger) return;
    const gsap = window.gsap;
    const ScrollTrigger = window.ScrollTrigger;

    context = gsap.context(() => {
      const hero = area.querySelector('.neo-pag-hero');
      const copy = area.querySelector('.neo-pag-copy');
      const photo = area.querySelector('.neo-pag-foto');
      const intro = copy ? [
        copy.querySelector('.neo-crumb'),
        copy.querySelector('h1'),
        copy.querySelector('p:not(.neo-crumb)'),
        copy.querySelector('.neo-pag-acoes')
      ].filter(Boolean) : [];

      if (intro.length) {
        gsap.fromTo(intro, {autoAlpha:0, y:17}, {
          autoAlpha:1, y:0, duration:0.72, stagger:0.11,
          ease:'power2.out', clearProps:'opacity,visibility,transform'
        });
      }
      if (photo && hero) {
        gsap.fromTo(photo, {autoAlpha:0.72, scale:1.045}, {
          autoAlpha:1, scale:1, duration:1.05,
          ease:'power2.out', clearProps:'opacity,visibility,transform'
        });
      }

      const blocks = [
        area.querySelector('.neo-abas'),
        area.querySelector('.neo-forma'),
        area.querySelector('#colecoes-casa'),
        area.querySelector('.neo-colecoes'),
        area.querySelector('.neo-passos'),
        area.querySelector('.neo-cta')
      ].filter(Boolean);

      blocks.forEach(block => {
        gsap.fromTo(block, {autoAlpha:0, y:20}, {
          autoAlpha:1, y:0, duration:0.75, ease:'power2.out',
          clearProps:'opacity,visibility,transform',
          scrollTrigger:{
            trigger:block,
            start:'top 90%',
            once:true,
            invalidateOnRefresh:true
          }
        });
      });
    }, area);

    requestAnimationFrame(() => ScrollTrigger.refresh());
  }

  function sync() {
    if (!isCasaVisible() || reducedMotion.matches) {
      clearAnimations();
      return;
    }
    if (context) return;
    loadGSAP().then(gsap => {
      if (gsap && isCasaVisible() && !reducedMotion.matches) buildAnimations();
    });
  }

  function scheduleSync() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      sync();
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    wrapper = document.getElementById('page-areas');
    area = document.getElementById('area-casa-decoracao');
    if (!wrapper || !area) return;

    const observer = new MutationObserver(scheduleSync);
    for (const element of [wrapper, area]) {
      observer.observe(element, {attributes:true, attributeFilter:['hidden']});
    }

    window.addEventListener('hashchange', scheduleSync);
    window.addEventListener('popstate', scheduleSync);
    reducedMotion.addEventListener('change', scheduleSync);

    // O roteador também navega por pushState, sem disparar hashchange.
    document.addEventListener('click', event => {
      if (event.target.closest('a[href^="#"]')) scheduleSync();
    });

    scheduleSync();
  });
})();
