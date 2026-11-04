/* VISIOARTE — Laboratório de experiências interativas | 2026-11-04
   Ativado exclusivamente com ?experiencias=on, para comparar sem alterar
   a experiência aprovada. Não altera modelos, produtos ou especificações.
   Todos os controles continuam acessíveis sem bibliotecas externas. */
(() => {
  'use strict';
  const params = new URLSearchParams(location.search);
  if (params.get('experiencias') !== 'on' || params.get('tema') === 'original') return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const imageRoot = 'assets/reciclagem/';
  const stages = [
    {name:'Coleta',image:'coleta.webp',detail:'O primeiro passo é identificar a origem e as condições do material que pode ser reaproveitado.'},
    {name:'Limpeza e seleção',image:'limpeza.webp',detail:'O material é separado e preparado conforme sua composição e as exigências de processamento.'},
    {name:'Trituração',image:'trituracao.webp',detail:'Quando aplicável, o plástico é fragmentado para facilitar a preparação da matéria-prima.'},
    {name:'Preparação dos pellets',image:'pellets.webp',detail:'Os grânulos podem alimentar a extrusão. A preparação depende do polímero e do processo escolhido.'},
    {name:'Impressão 3D',image:'impressao.webp',detail:'A matéria é depositada em camadas, transformando o projeto digital em uma peça física.'}
  ];
  const machine = [
    {name:'Matéria-prima',image:'pellets.webp',detail:'Seleção e preparação do material conforme os requisitos do projeto.'},
    {name:'Preparação',image:'extrusora.webp',detail:'Alimentação e preparação da extrusão antes da construção da peça.'},
    {name:'Fabricação',image:'impressao.webp',detail:'Deposição de material em camadas, seguindo o percurso definido.'},
    {name:'Peça final',image:'../luminarias/hero.webp',detail:'O resultado reúne geometria, textura e as escolhas feitas durante o projeto.'}
  ];

  function addStyles() {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'experiencias-visioarte.css?v=20261104-1';
    document.head.appendChild(link);
    document.documentElement.classList.add('exp-visio-ativo');
  }

  function lamp() {
    const intro = document.querySelector('#lightingPage .light-intro');
    if (!intro || document.getElementById('exp-luz')) return;
    const section = document.createElement('section');
    section.className = 'exp-luz';
    section.id = 'exp-luz';
    section.setAttribute('aria-labelledby','exp-luz-title');
    section.innerHTML =
      '<div class="exp-luz__text">' +
       '<p class="eyebrow">EXPERIÊNCIA VISUAL</p>' +
       '<h2 id="exp-luz-title">Veja o efeito da luz.</h2>' +
       '<p>Experimente diferentes níveis de iluminação sobre uma imagem da coleção. A demonstração é ilustrativa: não representa a potência ou o comportamento elétrico de uma luminária real.</p>' +
       '<div class="exp-luz__control">' +
        '<label for="exp-luz-range">Intensidade simulada</label>' +
        '<input id="exp-luz-range" type="range" min="0" max="100" step="5" value="70" aria-describedby="exp-luz-note">' +
        '<div class="exp-luz__actions"><button type="button" id="exp-luz-toggle" aria-pressed="true">Apagar luz</button>' +
         '<output id="exp-luz-output" for="exp-luz-range" role="status" aria-live="polite">70%</output></div>' +
       '</div><small id="exp-luz-note">Visualização conceitual criada com ajustes de luz e cor na imagem existente.</small>' +
      '</div>' +
      '<figure class="exp-luz__media" style="--exp-brightness:.82;--exp-sat:1.08;--exp-glow:.70">' +
       '<img src="assets/luminarias/onda.webp" alt="Luminária de mesa Onda utilizada para simular a variação visual da luz" width="720" height="900" loading="lazy" decoding="async">' +
       '<figcaption>ONDA · SIMULAÇÃO VISUAL</figcaption>' +
      '</figure>';
    intro.after(section);
    const slider = section.querySelector('#exp-luz-range');
    const button = section.querySelector('#exp-luz-toggle');
    const output = section.querySelector('#exp-luz-output');
    const visual = section.querySelector('.exp-luz__media');
    let lastLit = 70;
    function update(v) {
      const value = Math.max(0, Math.min(100, Number(v) || 0));
      slider.value = String(value);
      if (value > 0) lastLit = value;
      const power = value / 100;
      visual.style.setProperty('--exp-brightness', (0.22 + power * .85).toFixed(2));
      visual.style.setProperty('--exp-sat', (.72 + power * .48).toFixed(2));
      visual.style.setProperty('--exp-glow', (power * .88).toFixed(2));
      button.textContent = value ? 'Apagar luz' : 'Acender luz';
      button.setAttribute('aria-pressed', String(value > 0));
      output.textContent = value ? value + '%' : 'Apagada';
    }
    slider.addEventListener('input', () => update(slider.value));
    button.addEventListener('click', () => update(Number(slider.value) ? 0 : (lastLit || 70)));
    update(70);
  }

  function stageGallery(options) {
    const {id, title, eyebrow, note, entries, anchor, after} = options;
    if (!anchor || document.getElementById(id)) return;
    const section = document.createElement('section');
    section.className = 'exp-etapas';
    section.id = id;
    section.setAttribute('aria-labelledby', id + '-title');
    section.innerHTML =
      '<div class="exp-etapas__head"><p class="eyebrow">' + eyebrow + '</p><h2 id="' + id + '-title">' + title + '</h2><p>' + note + '</p></div>' +
      '<div class="exp-etapas__layout">' +
       '<figure class="exp-etapas__visual">' +
        '<img src="' + imageRoot + entries[0].image + '" width="960" height="720" loading="lazy" decoding="async" alt="Referência visual: ' + entries[0].name + '">' +
        '<figcaption><span class="exp-etapas__index">01 / 0' + entries.length + '</span><strong class="exp-etapas__caption">' + entries[0].name + '</strong></figcaption>' +
       '</figure>' +
       '<div class="exp-etapas__list" role="group" aria-label="Etapas da experiência">' +
       entries.map((x,i) =>
        '<div class="exp-etapas__item">' +
        '<button type="button" class="exp-etapas__button" data-exp-stage="' + i + '" aria-pressed="' + (i===0) + '">' +
        '<span class="exp-etapas__number">0' + (i+1) + '</span><span><strong>' + x.name + '</strong><small>' + x.detail + '</small></span>' +
        '</button></div>'
       ).join('') +
       '</div>' +
      '</div>';
    if (after) anchor.after(section);
    else anchor.before(section);
    const img = section.querySelector('.exp-etapas__visual img');
    const caption = section.querySelector('.exp-etapas__caption');
    const index = section.querySelector('.exp-etapas__index');
    const buttons = [...section.querySelectorAll('[data-exp-stage]')];
    let active = 0;
    let currentRequest = 0;
    // Pré-carregamento discreto; garante que o primeiro quadro nunca fique oculto.
    entries.forEach(x => { const im = new Image(); im.src = imageRoot + x.image; });
    function select(i) {
      if (i === active) return;
      active = i;
      const entry = entries[i];
      const url = imageRoot + entry.image;
      const request = ++currentRequest;
      const image = new Image();
      image.onload = () => {
        if (request !== currentRequest) return;
        img.src = url;
        img.alt = 'Referência visual: ' + entry.name;
      };
      image.onerror = () => {
        if (request !== currentRequest) return;
        // Caso uma imagem falhe, manter a anterior.
      };
      image.src = url;
      caption.textContent = entry.name;
      index.textContent = String(i+1).padStart(2,'0') + ' / ' + String(entries.length).padStart(2,'0');
      buttons.forEach((b,j) => b.setAttribute('aria-pressed', String(j===i)));
    }
    buttons.forEach((button,i) => button.addEventListener('click', () => select(i)));

    // A etapa acompanha a rolagem, além de continuar selecionável por clique/teclado.
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(records => {
        if (!section.getClientRects().length || section.closest('[hidden]')) return;
        const valid = records.filter(r => r.isIntersecting);
        if (valid.length) {
          valid.sort((a,b) => b.intersectionRatio - a.intersectionRatio);
          const n = buttons.indexOf(valid[0].target.querySelector('button'));
          if (n >= 0) select(n);
        }
      }, {rootMargin:'-24% 0px -42% 0px',threshold:[0,.25,.5]});
      section.querySelectorAll('.exp-etapas__item').forEach(item => observer.observe(item));
    }
  }

  function recycled() {
    const anchor = document.querySelector('#page-material-reciclagem .neo-processo');
    stageGallery({
      id:'exp-reciclagem',
      eyebrow:'A TRANSFORMAÇÃO DA MATÉRIA',
      title:'Da origem à nova forma.',
      note:'Acompanhe o processo com imagens ilustrativas. Nem todo material passa pelas mesmas etapas; a preparação depende da origem, do polímero e do produto.',
      entries:stages,
      anchor,after:true
    });
  }

  function machineTour() {
    const anchor = document.querySelector('#page-a-maquina .neo-maq-corpo');
    stageGallery({
      id:'exp-maquina-tour',
      eyebrow:'CONHEÇA O FLUXO DE FABRICAÇÃO',
      title:'Da matéria à peça impressa.',
      note:'Explore as etapas com imagens de referência do processo. O visualizador 3D completo da máquina será implementado quando tivermos um modelo digital fiel ao equipamento.',
      entries:machine,
      anchor,after:true
    });
  }

  function boot() {
    addStyles();
    lamp();
    recycled();
    machineTour();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();
