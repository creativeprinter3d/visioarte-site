/* VISIOARTE — galeria lateral de peças (Casa e Decoração). Rolagem vertical move a faixa para o lado. */
(function () {
  var raiz = document.getElementById('galeria-pecas'); if (!raiz) return;
  var trilho = raiz, faixa = raiz.querySelector('.galeria__faixa'), fecha = raiz.querySelector('.galeria__fecha');
  var fill = raiz.querySelector('.galeria__fill'), cont = raiz.querySelector('.galeria__cont');
  var clamp = function (v, a, b) { return Math.min(b == null ? 1 : b, Math.max(a == null ? 0 : a, v)); };
  var easeOut = function (t) { return 1 - Math.pow(1 - t, 3); };
  var reduz = matchMedia('(prefers-reduced-motion:reduce)').matches;
  var itens = [], largura = 0, alvo = 0, pos = 0, vw = innerWidth, vh = innerHeight, ultimo = -1, visivel = false;
  var CH = 'visioarte-galeria-extra-v1';

  function montar() {
    itens = [].map.call(faixa.querySelectorAll('.galeria__peca'), function (el) {
      return { el: el, q: el.querySelector('.galeria__quadro'), img: el.querySelector('img'), bico: el.querySelector('.galeria__bico'), x: 0, w: 0 };
    });
  }
  function medir() {
    if (!raiz.offsetParent) return;
    vw = innerWidth; vh = innerHeight; faixa.style.transform = 'none';
    largura = faixa.scrollWidth;
    trilho.style.height = (Math.max(0, largura - vw) + vh) + 'px';
    itens.forEach(function (it) { it.x = it.el.offsetLeft; it.w = it.el.offsetWidth; });
    ler();
  }
  function ler() {
    if (!raiz.offsetParent) return;
    var r = trilho.getBoundingClientRect(), total = trilho.offsetHeight - vh;
    alvo = total > 0 ? clamp(-r.top / total) * (largura - vw) : 0;
  }
  function quadro() {
    if (visivel && raiz.offsetParent) {
      pos += (alvo - pos) * (reduz ? 1 : .1);
      faixa.style.transform = 'translate3d(' + (-pos) + 'px,0,0)';
      var prog = largura > vw ? pos / (largura - vw) : 0; fill.style.width = (prog * 100) + '%';
      var vistas = 0;
      itens.forEach(function (it) {
        var esq = it.x - pos, centro = esq + it.w / 2;
        var r = reduz ? 1 : easeOut(clamp((vw * .92 - esq) / (vw * .47)));
        it.q.style.clipPath = r >= .999 ? 'none' : 'inset(' + ((1 - r) * 100) + '% 0 0 0)';
        it.bico.style.top = ((1 - r) * 100) + '%';
        it.bico.style.opacity = (r > .01 && r < .995) ? 1 : 0;
        var p = (centro - vw / 2) / vw;
        it.img.style.transform = 'translate3d(' + (-p * 7) + '%,0,0) scale(' + (1.04 + .04 * (1 - r)) + ')';
        if (r >= .97) { it.el.classList.add('pronta'); vistas++; } else it.el.classList.remove('pronta');
      });
      if (vistas !== ultimo) { ultimo = vistas; cont.textContent = ('0' + vistas).slice(-2) + ' / ' + ('0' + itens.length).slice(-2); }
    }
    requestAnimationFrame(quadro);
  }

  /* ---- fotos do dono ---- */
  function nova(src, nome) {
    var f = document.createElement('figure');
    var n = faixa.querySelectorAll('.galeria__peca').length;
    f.className = 'galeria__peca ' + (n % 3 === 1 ? 'largo' : 'alto ' + (n % 2 ? 'baixo' : 'cima'));
    f.dataset.extra = '1';
    f.innerHTML = '<div class="galeria__quadro"><img alt=""><i class="galeria__bico"></i></div><figcaption class="galeria__leg"><b></b><span></span></figcaption>';
    f.querySelector('img').src = src; f.querySelector('img').alt = nome; f.querySelector('b').textContent = nome;
    faixa.insertBefore(f, fecha); return f;
  }
  function reduzir(arquivo) {
    return new Promise(function (ok, erro) {
      var u = URL.createObjectURL(arquivo), im = new Image();
      im.onload = function () {
        var m = 1100, k = Math.min(1, m / Math.max(im.width, im.height)), c = document.createElement('canvas');
        c.width = Math.round(im.width * k); c.height = Math.round(im.height * k);
        c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); URL.revokeObjectURL(u);
        ok(c.toDataURL('image/webp', .82));
      };
      im.onerror = erro; im.src = u;
    });
  }
  function guardar() {
    try {
      var l = [].map.call(faixa.querySelectorAll('[data-extra]'), function (f) { return { s: f.querySelector('img').src, n: f.querySelector('b').textContent }; });
      localStorage.setItem(CH, JSON.stringify(l)); return true;
    } catch (e) { return false; }
  }
  function carregar() {
    try { (JSON.parse(localStorage.getItem(CH) || '[]')).forEach(function (o) { nova(o.s, o.n); }); } catch (e) {}
  }
  function dono() {
    if (!/[?&]editar\b/.test(location.search)) return;
    raiz.classList.add('galeria--dono');
    var inp = raiz.querySelector('.galeria__arquivo'), add = raiz.querySelector('[data-gal-add]'), lim = raiz.querySelector('[data-gal-limpar]'), msg = raiz.querySelector('.galeria__dono span');
    add.addEventListener('click', function () { inp.click(); });
    lim.addEventListener('click', function () {
      faixa.querySelectorAll('[data-extra]').forEach(function (f) { f.remove(); });
      try { localStorage.removeItem(CH); } catch (e) {}
      montar(); medir(); msg.textContent = 'Fotos adicionadas removidas.';
    });
    inp.addEventListener('change', function () {
      var arqs = [].slice.call(inp.files); if (!arqs.length) return;
      Promise.all(arqs.map(function (a) {
        return reduzir(a).then(function (src) { nova(src, a.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ')); });
      })).then(function () {
        montar(); medir(); var ok = guardar();
        msg.textContent = arqs.length + ' foto(s) adicionada(s). ' + (ok ? 'Ficam só neste navegador.' : 'Não coube na memória do navegador: some ao recarregar.');
        inp.value = '';
      });
    });
  }

  carregar(); montar(); dono();
  addEventListener('scroll', ler, { passive: true });
  addEventListener('resize', medir); addEventListener('load', medir);
  /* a página de Casa e Decoração começa escondida: mede quando a seção ficar visível */
  if (window.ResizeObserver) { new ResizeObserver(function () { medir(); }).observe(raiz); }
  if (window.IntersectionObserver) { new IntersectionObserver(function (e) { visivel = e[0].isIntersecting; if (visivel) medir(); }, { rootMargin: '300px 0px' }).observe(raiz); } else visivel = true;
  addEventListener('hashchange', function () { setTimeout(medir, 80); });
  medir(); pos = alvo; requestAnimationFrame(quadro);
})();
