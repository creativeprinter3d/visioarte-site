/* VISIOARTE — demonstrações animadas do Visio Slicer (21/11/2026).
   Três demos em canvas, sem biblioteca: (1) planar × não planar, (2) folga do cabeçote, (3) gerador de ondas interativo.
   Só desenha quando a demo está visível; com movimento reduzido mostra um quadro parado (o gerador de ondas continua interativo).
   Fórmulas do gerador conferidas com os números das gravações do próprio software. */
(() => {
  'use strict';
  const root = document.querySelector('[data-sd]');
  if (!root) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, r = root) => r.querySelector(s);
  const $$ = (s, r = root) => Array.from(r.querySelectorAll(s));
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const lerp = (a, b, k) => a + (b - a) * k;
  const fmt = (n, d = 2) => n.toFixed(d).replace('.', ',');
  const BLUE = '#5b9bde', BLUE_D = '#2f5f9a', ORG = '#f58a1f', ORG_D = '#7a3b05', GRAY = '#8a95a5', INK = '#e8edf3', GREEN = '#58d68d', RED = '#ff6b81';
  const SANS = 'Inter, "Segoe UI", Arial, sans-serif', MONO = 'Consolas, "Courier New", monospace';

  /* ---------- infraestrutura: tamanho, tabs, laço de desenho ---------- */
  const demos = [];
  function register(canvas, height, draw) {
    const d = { canvas, ctx: canvas.getContext('2d'), draw, height, w: 0, h: 0, vis: false, t0: performance.now() };
    const size = () => {
      const w = Math.max(280, canvas.clientWidth || canvas.parentElement.clientWidth || 600);
      const h = Math.round(height(w));
      const dpr = Math.min(2, devicePixelRatio || 1);
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      canvas.style.height = h + 'px';
      d.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      d.w = w; d.h = h; d.dirty = true;
    };
    d.size = size;
    new ResizeObserver(size).observe(canvas.parentElement);
    new IntersectionObserver(es => { d.vis = es[0].isIntersecting; if (d.vis) kick(); }, { threshold: 0.12 }).observe(canvas);
    size(); demos.push(d); return d;
  }
  let raf = 0;
  function frame(now) {
    raf = 0; let any = false;
    for (const d of demos) {
      if (!d.vis || !d.canvas.offsetParent || document.hidden) continue;
      any = true;
      if (reduced && !d.dirty) continue;
      d.ctx.clearRect(0, 0, d.w, d.h);
      d.draw(d.ctx, d.w, d.h, reduced ? d.still : (now - d.t0) / 1000);
      d.dirty = false;
    }
    if (any && !reduced) raf = requestAnimationFrame(frame);
    else if (any) raf = requestAnimationFrame(frame); // reduzido: só redesenha quando "dirty"; laço barato
  }
  function kick() { if (!raf) raf = requestAnimationFrame(frame); }
  document.addEventListener('visibilitychange', kick);

  // abas
  const tabs = $$('[role="tab"]'), panels = $$('[role="tabpanel"]');
  function select(i, focus) {
    tabs.forEach((t, k) => { t.setAttribute('aria-selected', k === i); t.tabIndex = k === i ? 0 : -1; });
    panels.forEach((p, k) => { p.hidden = k !== i; });
    if (focus) tabs[i].focus();
    demos.forEach(d => { d.size(); d.t0 = performance.now(); });
    kick();
  }
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => select(i));
    t.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight') { e.preventDefault(); select((i + 1) % tabs.length, true); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); select((i + tabs.length - 1) % tabs.length, true); }
    });
  });

  /* ---------- desenho comum ---------- */
  function card(c, x, y, w, h) {
    c.save(); c.beginPath(); c.roundRect(x, y, w, h, 12); c.fillStyle = 'rgba(14,19,26,.92)'; c.fill();
    c.strokeStyle = 'rgba(255,255,255,.09)'; c.lineWidth = 1; c.stroke(); c.restore();
  }
  function nozzle(c, x, y, s, glow = ORG) {
    c.save(); c.translate(x, y);
    const g = c.createRadialGradient(0, 3 * s, 0, 0, 3 * s, 16 * s);
    g.addColorStop(0, glow + 'cc'); g.addColorStop(1, glow + '00');
    c.fillStyle = g; c.fillRect(-18 * s, -4 * s, 36 * s, 30 * s);
    const body = c.createLinearGradient(-7 * s, 0, 7 * s, 0);
    body.addColorStop(0, '#6f7a89'); body.addColorStop(.5, '#d6dde6'); body.addColorStop(1, '#5d6776');
    c.fillStyle = body;
    c.beginPath(); c.roundRect(-7 * s, -26 * s, 14 * s, 14 * s, 2 * s); c.fill();           // bloco
    c.fillRect(-4.5 * s, -12 * s, 9 * s, 4 * s);                                            // pescoço
    c.beginPath(); c.moveTo(-4.5 * s, -8 * s); c.lineTo(4.5 * s, -8 * s); c.lineTo(0, 0); c.closePath(); c.fill(); // bico
    c.restore();
  }
  const bell = u => 0.14 + 0.86 * Math.exp(-Math.pow((u - 0.5) / 0.19, 2));       // perfil da peça (0..1)

  /* =====================================================
     1) PLANAR × NÃO PLANAR
     ===================================================== */
  const N = 22, CYCLE = 17, BUILD = 11.5;
  function camadasPanel(c, x0, y0, pw, ph, mode, t) {
    const planar = mode === 'planar', col = planar ? BLUE : ORG;
    card(c, x0, y0, pw, ph);
    const tt = t % CYCLE, p = clamp(tt / BUILD), L = p * N;
    const alpha = tt > CYCLE - 1.4 ? 1 - (tt - (CYCLE - 1.4)) / 1.4 : tt < 0.5 ? tt / 0.5 : 1;
    c.save(); c.globalAlpha = alpha;
    // título
    c.font = `600 ${Math.max(12, pw * 0.021)}px ${SANS}`; c.textBaseline = 'top'; c.fillStyle = col; c.textAlign = 'left';
    c.fillText(planar ? 'Tradicional · planar' : 'Não planar', x0 + 14, y0 + 12);
    // área do desenho
    const ax = x0 + 16, aw = pw - 32, ay = y0 + 44, ah = ph * 0.43, base = ay + ah, hh = ah * 0.9;
    const X = u => ax + u * aw;
    // contorno-alvo
    c.save(); c.setLineDash([3, 4]); c.strokeStyle = 'rgba(255,255,255,.35)'; c.lineWidth = 1; c.beginPath();
    for (let i = 0; i <= 80; i++) { const u = i / 80, y = base - bell(u) * hh; i ? c.lineTo(X(u), y) : c.moveTo(X(u), y); }
    c.stroke(); c.restore();
    // camadas
    const k0 = Math.min(N, Math.floor(L) + 1), f = L - Math.floor(L), dir = (k0 % 2 === 1) ? f : 1 - f;
    let nu = 0.5, ny = base, zmm = 0;
    if (planar) {
      const half = k => { const zc = (k - 0.5) / N, b = 0.14; if (zc <= b) return 0.5; return Math.min(0.5, 0.19 * Math.sqrt(-Math.log((zc - b) / (1 - b)))); };
      const th = (hh / N) * 0.84;
      for (let k = 1; k <= Math.min(N, k0); k++) {
        const hw = Math.max(0.012, half(k)), u0 = 0.5 - hw, u1 = 0.5 + hw, top = base - (k / N) * hh;
        const done = k < k0 || p >= 1;
        const a = done ? u0 : (k0 % 2 === 1 ? u0 : lerp(u0, u1, dir)), b = done ? u1 : (k0 % 2 === 1 ? lerp(u0, u1, dir) : u1);
        c.fillStyle = BLUE; c.fillRect(X(a), top, Math.max(0, X(b) - X(a)), th);
        c.fillStyle = 'rgba(255,255,255,.28)'; c.fillRect(X(a), top, Math.max(0, X(b) - X(a)), 1.2);
        if (!done) { nu = lerp(u0, u1, dir); ny = top; zmm = (k / N) * 28; }
      }
      if (p >= 1) { nu = 0.5; ny = base - hh; zmm = 28; }
    } else {
      const Y = (k, u) => base - (k / N) * bell(u) * hh;
      const steps = 90;
      for (let k = 1; k <= Math.min(N, k0); k++) {
        const done = k < k0 || p >= 1;
        const lim = done ? 1 : f;                           // até onde o bico já passou (na ilustração, sempre da esquerda para a direita)
        c.beginPath();
        for (let i = 0; i <= steps; i++) { const u = (i / steps) * lim; i ? c.lineTo(X(u), Y(k, u)) : c.moveTo(X(u), Y(k, u)); }
        for (let i = steps; i >= 0; i--) { const u = (i / steps) * lim; c.lineTo(X(u), Y(k - 1, u)); }
        c.closePath(); c.fillStyle = k % 2 ? '#f59a2f' : '#e9801a'; c.fill();
        c.beginPath();
        for (let i = 0; i <= steps; i++) { const u = (i / steps) * lim; i ? c.lineTo(X(u), Y(k, u)) : c.moveTo(X(u), Y(k, u)); }
        c.strokeStyle = ORG_D; c.lineWidth = 1; c.stroke();
        if (!done) { nu = lim; ny = Y(k, lim); zmm = ((base - ny) / hh) * 28; }
      }
      if (p >= 1) { nu = 0.5; ny = base - hh; zmm = 28; }
    }
    // chão
    c.fillStyle = '#6b4a14'; c.fillRect(ax - 4, base + 0.5, aw + 8, 2);
    // bico
    const sz = Math.max(0.55, pw / 720);
    nozzle(c, X(nu), ny, sz * 1.1, planar ? '#ffb347' : '#ffb347');
    // leitura de Z
    c.font = `500 ${Math.max(11, pw * 0.017)}px ${SANS}`; c.fillStyle = GRAY; c.textAlign = 'right';
    c.fillText(`Z ${fmt(zmm)} mm · ${planar ? 'fixo na camada' : 'muda em cada ponto'}`, x0 + pw - 14, y0 + 14);
    // legenda
    c.textAlign = 'left'; c.fillStyle = '#c4ccd8'; c.font = `400 ${Math.max(12, pw * 0.0185)}px ${SANS}`;
    const cap = planar ? 'Cada camada é um plano. As curvas são aproximadas com degraus.' : 'As camadas se inclinam do piso até a borda: o bico sobe e desce enquanto avança e a superfície copia a forma.';
    wrap(c, cap, x0 + 16, base + 16, pw - 32, Math.max(15, pw * 0.0235));
    // código G
    const gy = base + 16 + Math.max(15, pw * 0.0235) * 2 + 14, gh = y0 + ph - gy - 12;
    if (gh > 30) {
      c.fillStyle = 'rgba(0,0,0,.28)'; c.beginPath(); c.roundRect(x0 + 14, gy, pw - 28, gh, 8); c.fill();
      c.strokeStyle = 'rgba(255,255,255,.06)'; c.stroke();
      const fs = Math.max(10, pw * 0.0155), lh = fs * 1.5, rows = Math.max(1, Math.floor((gh - 12) / lh)), st = Math.floor(tt * 7);
      c.font = `400 ${fs}px ${MONO}`; c.textBaseline = 'top';
      for (let r = 0; r < rows; r++) {
        const i = st - (rows - 1) + r; if (i < 0) continue;
        const gx = 60 + 90 * Math.abs(Math.sin(i * 0.37)), e = 12 + i * 0.83;
        const z = planar ? (Math.floor(L) + 1) * 28 / N : 28 * (0.5 + 0.5 * Math.sin(i * 0.21)) * Math.min(1, p + .15);
        let xx = x0 + 24; const a = `G1 X${gx.toFixed(2)} Y60.00 `, bz = planar ? '' : `Z${z.toFixed(2)}`, tail = ` E${e.toFixed(4)}`;
        const fade = 0.35 + 0.65 * (r + 1) / rows;
        c.globalAlpha = alpha * fade; c.fillStyle = '#9fb0c4'; c.fillText(a, xx, gy + 7 + r * lh); xx += c.measureText(a).width;
        if (bz) { c.fillStyle = ORG; c.fillText(bz, xx, gy + 7 + r * lh); xx += c.measureText(bz).width; }
        c.fillStyle = '#9fb0c4'; c.fillText(tail, xx, gy + 7 + r * lh);
      }
      c.globalAlpha = alpha;
    }
    c.restore();
  }
  function wrap(c, text, x, y, maxW, lh) {
    const words = text.split(' '); let line = '', yy = y;
    for (const w of words) { const t = line ? line + ' ' + w : w; if (c.measureText(t).width > maxW && line) { c.fillText(line, x, yy); line = w; yy += lh; } else line = t; }
    c.fillText(line, x, yy);
  }
  register($('[data-demo="camadas"]'), w => w >= 720 ? Math.min(470, w * 0.47) : Math.min(900, w * 1.9), (c, w, h, t) => {
    if (w >= 720) { const pw = (w - 16) / 2; camadasPanel(c, 0, 0, pw, h, 'planar', t); camadasPanel(c, pw + 16, 0, pw, h, 'nao', t); }
    else { const ph = (h - 14) / 2; camadasPanel(c, 0, 0, w, ph, 'planar', t); camadasPanel(c, 0, ph + 14, w, ph, 'nao', t); }
  }).still = 12.5;

  /* =====================================================
     2) FOLGA DO CABEÇOTE
     ===================================================== */
  const SURF_A = 1.05, SURF_L = 18, LIMITE = 4.0, CONE_H = 4.76, RAIO = 30, ANG = 34;
  register($('[data-demo="folga"]'), w => Math.min(430, Math.max(250, w * 0.42)), (c, w, h, t) => {
    const mm = w / 118, ground = h * 0.9, yS0 = h * 0.7;
    const hs = x => SURF_A * Math.sin(2 * Math.PI * x / SURF_L);               // altura da superfície em mm
    const sy = x => yS0 - hs(x) * mm * 1.5;                                     // eixo vertical exagerado 1,5× para ler melhor
    const k = mm * 1.5, X = x => x * mm;
    // superfície e camadas
    const grad = c.createLinearGradient(0, yS0 - 14, 0, ground); grad.addColorStop(0, '#c4640b'); grad.addColorStop(1, '#3c1d05');
    c.beginPath(); for (let i = 0; i <= 160; i++) { const x = i / 160 * 118; i ? c.lineTo(X(x), sy(x)) : c.moveTo(X(x), sy(x)); }
    c.lineTo(w, ground); c.lineTo(0, ground); c.closePath(); c.fillStyle = grad; c.fill();
    for (let j = 1; j <= 9; j++) {
      c.beginPath(); for (let i = 0; i <= 160; i++) { const x = i / 160 * 118; const y = sy(x) + j * 7.5; i ? c.lineTo(X(x), y) : c.moveTo(X(x), y); }
      c.strokeStyle = `rgba(255,170,70,${0.30 - j * 0.026})`; c.lineWidth = 1; c.stroke();
    }
    c.beginPath(); for (let i = 0; i <= 160; i++) { const x = i / 160 * 118; i ? c.lineTo(X(x), sy(x)) : c.moveTo(X(x), sy(x)); }
    c.strokeStyle = '#ffb347'; c.lineWidth = 2.2; c.shadowColor = '#ff9a2e'; c.shadowBlur = 8; c.stroke(); c.shadowBlur = 0;
    c.fillStyle = '#5b3a10'; c.fillRect(0, ground, w, 3);
    // bico + cabeçote
    const x0 = 59 + 23 * Math.sin(t * 0.55), tipY = sy(x0), tipX = X(x0);
    const boxW = RAIO * 2 * mm, boxH = 8 * k, boxY = tipY - CONE_H * k - boxH, limY = tipY - LIMITE * k;
    // folga medida
    let rise = 0, ax = x0;
    for (let x = x0 - RAIO; x <= x0 + RAIO; x += 0.5) { if (x < 0 || x > 118) continue; const r = hs(x) - hs(x0); if (r > rise) { rise = r; ax = x; } }
    const ok = rise <= LIMITE;
    c.beginPath(); c.roundRect(tipX - boxW / 2, boxY, boxW, boxH, 8); c.fillStyle = 'rgba(33,41,54,.96)'; c.fill(); c.strokeStyle = 'rgba(255,255,255,.14)'; c.stroke();
    c.fillStyle = '#9aa7b8'; c.font = `500 ${Math.max(11, w * 0.012)}px ${SANS}`; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillText('cabeçote · ventoinhas e dutos', tipX, boxY + boxH / 2);
    // cone
    c.beginPath(); c.moveTo(tipX - Math.tan(ANG * Math.PI / 180) * CONE_H * k * 0.7, tipY - CONE_H * k); c.lineTo(tipX + Math.tan(ANG * Math.PI / 180) * CONE_H * k * 0.7, tipY - CONE_H * k); c.lineTo(tipX, tipY); c.closePath();
    const cg = c.createLinearGradient(tipX - 12, 0, tipX + 12, 0); cg.addColorStop(0, '#9c8a52'); cg.addColorStop(.5, '#f2dc8a'); cg.addColorStop(1, '#8e7c46'); c.fillStyle = cg; c.fill();
    // limite
    c.save(); c.setLineDash([5, 4]); c.strokeStyle = GREEN; c.lineWidth = 1.2; c.beginPath(); c.moveTo(tipX - boxW / 2, limY); c.lineTo(tipX + boxW / 2, limY); c.stroke(); c.restore();
    c.fillStyle = GREEN; c.font = `500 ${Math.max(10, w * 0.011)}px ${SANS}`; c.textAlign = 'right'; c.textBaseline = 'bottom'; c.fillText('limite 4,0 mm', tipX + boxW / 2 - 4, limY - 2);
    // ângulo 34°
    c.strokeStyle = 'rgba(255,120,120,.85)'; c.lineWidth = 1;
    for (const sgn of [-1, 1]) { c.beginPath(); c.moveTo(tipX, tipY); c.lineTo(tipX + sgn * Math.sin(ANG * Math.PI / 180) * 9 * k, tipY - Math.cos(ANG * Math.PI / 180) * 9 * k); c.stroke(); }
    c.fillStyle = 'rgba(255,140,140,.95)'; c.font = `500 ${Math.max(10, w * 0.011)}px ${SANS}`; c.textBaseline = 'top';
    c.textAlign = 'right'; c.fillText(`${ANG}°`, tipX - 6, tipY + 3); c.textAlign = 'left'; c.fillText(`${ANG}°`, tipX + 6, tipY + 3);
    c.fillStyle = '#c4ccd8'; c.fillText(`${fmt(CONE_H)} mm`, tipX + Math.tan(ANG * Math.PI / 180) * CONE_H * k * 0.7 + 8, tipY - CONE_H * k * 0.7);
    // ponto mais alto sob o cabeçote
    if (rise > 0.05) { c.beginPath(); c.arc(X(ax), sy(ax), 5, 0, 7); c.strokeStyle = '#fff'; c.lineWidth = 1.5; c.stroke(); }
    // raio
    c.strokeStyle = 'rgba(255,255,255,.35)'; c.lineWidth = 1; c.beginPath(); c.moveTo(tipX - boxW / 2, boxY - 12); c.lineTo(tipX, boxY - 12); c.stroke();
    c.fillStyle = '#9aa7b8'; c.textAlign = 'center'; c.textBaseline = 'bottom'; c.fillText(`raio ${RAIO} mm`, tipX - boxW / 4, boxY - 14);
    // leituras
    const fs = Math.max(12, w * 0.0135); c.font = `500 ${fs}px ${SANS}`; c.textAlign = 'left'; c.textBaseline = 'top';
    c.fillStyle = ok ? GREEN : RED; c.fillText(`máx. sob o cabeçote: ${fmt(rise, 1)} mm ${ok ? '✓' : '✕'}`, 16, 14);
    c.fillStyle = 'rgba(255,128,128,.95)'; c.fillText(`ângulo comprovado: ${ANG}°`, 16, 14 + fs * 1.5);
  }).still = 3.2;

  /* =====================================================
     3) GERADOR DE ONDAS (interativo)
     ===================================================== */
  const ctl = { shape: 'seno', A: 0.75, L: 11, lh: 0.58 };
  const LIM_ANG = 34, LIM_DES = 4.0;
  const K = { seno: 2 * Math.PI, tri: 4, trap: 8 };
  const shapeFn = {
    seno: ph => Math.sin(2 * Math.PI * ph),
    tri: ph => (2 / Math.PI) * Math.asin(Math.sin(2 * Math.PI * ph)),
    trap: ph => { ph = ((ph % 1) + 1) % 1; return ph < .25 ? -1 + 8 * ph : ph < .5 ? 1 : ph < .75 ? 1 - 8 * (ph - .5) : -1; }
  };
  function waveStats() {
    const ang = Math.atan(ctl.A * K[ctl.shape] / ctl.L) * 180 / Math.PI, des = 2 * ctl.A;
    return { ang, des, ondas: Math.round(Math.PI * 60 / ctl.L), voltas: Math.round(30 / ctl.lh), bad: ang > LIM_ANG || des > LIM_DES };
  }
  const out = { ang: $('[data-o="ang"]'), des: $('[data-o="des"]'), ond: $('[data-o="ond"]'), vol: $('[data-o="vol"]'), st: $('[data-o="status"]') };
  function updateReadouts() {
    const s = waveStats();
    out.ang.textContent = `${fmt(s.ang, 1)}° / ${LIM_ANG}°`; out.ang.classList.toggle('sd-bad', s.ang > LIM_ANG);
    out.des.textContent = `${fmt(s.des)} / ${fmt(LIM_DES)} mm`; out.des.classList.toggle('sd-bad', s.des > LIM_DES);
    out.ond.textContent = s.ondas; out.vol.textContent = s.voltas;
    out.st.className = 'sd-status ' + (s.bad ? 'sd-st-bad' : 'sd-st-ok');
    out.st.textContent = s.ang > LIM_ANG ? '✕ Inclinação acima de 34°: diminua a amplitude ou alongue a onda'
      : s.des > LIM_DES ? '✕ Desnível acima de 4,0 mm: diminua a amplitude' : '✓ Pronta para exportar';
    $$('[data-v]').forEach(o => { const key = o.dataset.v; o.textContent = key === 'A' ? fmt(ctl.A) + ' mm' : key === 'L' ? fmt(ctl.L, 1) + ' mm' : fmt(ctl.lh) + ' mm'; });
    const wave = $('[data-demo="ondas"]'); if (wave) { const d = demos.find(x => x.canvas === wave); if (d) d.dirty = true; }
  }
  $$('[name="sd-forma"]').forEach(r => r.addEventListener('change', () => { ctl.shape = r.value; updateReadouts(); }));
  [['sd-amp', 'A'], ['sd-onda', 'L'], ['sd-camada', 'lh']].forEach(([id, k]) => {
    const el = document.getElementById(id); if (!el) return;
    el.addEventListener('input', () => { ctl[k] = parseFloat(el.value); updateReadouts(); });
  });
  register($('[data-demo="ondas"]'), w => Math.min(430, Math.max(280, w * 0.9)), (c, w, h, t) => {
    const s = waveStats(), bad = s.bad;
    const lines = 30, pxMm = Math.min(w, 560) / 62 * 0.62, left = w * 0.1, ww = w * 0.8, top = h * 0.2, hgt = h * 0.7;
    c.font = `400 ${Math.max(10, w * 0.02)}px ${SANS}`; c.fillStyle = 'rgba(160,172,188,.7)'; c.textAlign = 'left'; c.textBaseline = 'top';
    c.fillText('parede desenrolada · 60 × 30 mm', 10, 8);
    const f = shapeFn[ctl.shape], period = ctl.L / 60;       // fração da largura por onda
    let tipX = 0, tipY = 0;
    for (let k = 0; k < lines; k++) {
      const frac = k / (lines - 1), baseY = top + hgt - frac * hgt * 0.86, skew = (1 - frac) * 14;
      const a = lerp(0.18, 1, Math.pow(frac, 1.2));
      c.beginPath();
      for (let i = 0; i <= 220; i++) {
        const u = i / 220, y = baseY - f(u / period) * ctl.A * pxMm * 1.7;
        const x = left + u * ww + skew - frac * 8;
        i ? c.lineTo(x, y) : c.moveTo(x, y);
      }
      const col = bad ? `rgba(255,${Math.round(lerp(70, 120, 1 - frac))},${Math.round(lerp(110, 160, 1 - frac))},${a})` : `rgba(255,${Math.round(lerp(120, 154, frac))},${Math.round(lerp(30, 46, frac))},${a})`;
      c.strokeStyle = col; c.lineWidth = k === lines - 1 ? 2.2 : 1.1; c.stroke();
      if (k === lines - 1) {
        const u = reduced ? 0.42 : ((t * 0.11) % 1), y = baseY - f(u / period) * ctl.A * pxMm * 1.7;
        tipX = left + u * ww + skew - frac * 8; tipY = y;
      }
    }
    nozzle(c, tipX, tipY, Math.max(0.55, w / 760), bad ? '#ff5d8f' : '#ffb347');
  }).still = 0;
  updateReadouts();
  select(0);
})();
