/* VISIOARTE — cartões em rolagem lateral: a rolagem vertical move a faixa para o lado, cada cartão é revelado de baixo para cima. */
(function () {
  var clamp = function (v, a, b) { return Math.min(b == null ? 1 : b, Math.max(a == null ? 0 : a, v)); };
  var easeOut = function (t) { return 1 - Math.pow(1 - t, 3); };
  var reduz = matchMedia('(prefers-reduced-motion:reduce)').matches;
  var blocos = [].map.call(document.querySelectorAll('.rolag'), function (raiz) {
    var faixa = raiz.querySelector('.rolag__faixa'), fill = raiz.querySelector('.rolag__fill'), cont = raiz.querySelector('.rolag__cont');
    var b = { raiz: raiz, faixa: faixa, fill: fill, cont: cont, largura: 0, alvo: 0, pos: 0, ultimo: -1, visivel: false, itens: [] };
    b.itens = [].map.call(faixa.querySelectorAll('.area-card'), function (el) {
      var bico = document.createElement('i'); bico.className = 'rolag__bico'; el.appendChild(bico);
      return { el: el, bico: bico, x: 0, w: 0 };
    });
    return b;
  });
  if (!blocos.length) return;
  var vw = innerWidth, vh = innerHeight;

  function medir(b) {
    if (!b.raiz.offsetParent) return;
    vw = innerWidth; vh = innerHeight; b.faixa.style.transform = 'none';
    b.largura = b.faixa.scrollWidth;
    b.raiz.style.height = (Math.max(0, b.largura - vw) * 1.5 + vh) + 'px';
    b.itens.forEach(function (it) { it.x = it.el.offsetLeft; it.w = it.el.offsetWidth; });
    ler(b);
  }
  function ler(b) {
    if (!b.raiz.offsetParent) return;
    var r = b.raiz.getBoundingClientRect(), total = b.raiz.offsetHeight - vh;
    b.alvo = total > 0 ? clamp(-r.top / total) * (b.largura - vw) : 0;
  }
  function desenhar(b) {
    b.pos += (b.alvo - b.pos) * (reduz ? 1 : .1);
    b.faixa.style.transform = 'translate3d(' + (-b.pos) + 'px,0,0)';
    b.fill.style.width = ((b.largura > vw ? b.pos / (b.largura - vw) : 0) * 100) + '%';
    var vistas = 0;
    b.itens.forEach(function (it) {
      var esq = it.x - b.pos;
      var r = reduz ? 1 : easeOut(clamp((vw * .92 - esq) / (vw * .47)));
      it.el.style.clipPath = r >= .999 ? 'none' : 'inset(' + ((1 - r) * 100) + '% 0 0 0)';
      it.bico.style.top = ((1 - r) * 100) + '%';
      it.bico.style.opacity = (r > .01 && r < .995) ? 1 : 0;
      if (r >= .97) vistas++;
    });
    if (vistas !== b.ultimo) { b.ultimo = vistas; b.cont.textContent = ('0' + vistas).slice(-2) + ' / ' + ('0' + b.itens.length).slice(-2); }
  }
  function quadro() {
    blocos.forEach(function (b) { if (b.visivel && b.raiz.offsetParent) desenhar(b); });
    requestAnimationFrame(quadro);
  }
  blocos.forEach(function (b) {
    if (window.ResizeObserver) new ResizeObserver(function () { medir(b); }).observe(b.raiz);
    if (window.IntersectionObserver) new IntersectionObserver(function (e) { b.visivel = e[0].isIntersecting; if (b.visivel) medir(b); }, { rootMargin: '300px 0px' }).observe(b.raiz); else b.visivel = true;
    medir(b); b.pos = b.alvo;
  });
  addEventListener('scroll', function () { blocos.forEach(ler); }, { passive: true });
  addEventListener('resize', function () { blocos.forEach(medir); });
  addEventListener('load', function () { blocos.forEach(medir); });
  addEventListener('hashchange', function () { setTimeout(function () { blocos.forEach(medir); }, 80); });
  requestAnimationFrame(quadro);
})();
