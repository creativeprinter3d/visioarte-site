/* VISIOARTE — capas animadas dos cartões Software (Visio Slicer) e Visio_Tekna (21/11/2026).
   Canvas puro. A imagem original continua no HTML (fallback sem JS e com movimento reduzido mostra um quadro parado).
   Só desenha quando o cartão está visível. */
(() => {
  'use strict';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const lerp = (a, b, k) => a + (b - a) * k;
  const smooth = (a, b, x) => { const k = clamp((x - a) / (b - a)); return k * k * (3 - 2 * k); };
  const MONO = 'Consolas, "Courier New", monospace';

  const FORCE = new URLSearchParams(location.search).get('ct_t');   // só para revisão: fixa o instante da animação
  const jobs = [];
  let raf = 0;
  function loop(now) {
    raf = 0; let any = false;
    for (const j of jobs) {
      if (!j.vis || !j.cv.offsetParent || document.hidden) continue;
      any = true;
      if (reduced && j.drawn) continue;
      j.ctx.clearRect(0, 0, j.w, j.h);
      j.draw(j, FORCE !== null ? +FORCE : reduced ? 9 : (now - j.t0) / 1000);
      j.drawn = true;
    }
    if (any) raf = requestAnimationFrame(loop);
  }
  const kick = () => { if (!raf) raf = requestAnimationFrame(loop); };
  document.addEventListener('visibilitychange', kick);

  function mount(card, draw, logoSrc) {
    if (!card || card.dataset.ct) return;
    const media = card.querySelector('.area-card-media'); if (!media) return;
    card.dataset.ct = '1';
    const cv = document.createElement('canvas'); cv.className = 'ct-canvas'; cv.setAttribute('aria-hidden', 'true');
    media.append(cv); media.classList.add('ct-on');
    const j = { cv, ctx: cv.getContext('2d'), draw, w: 0, h: 0, vis: false, t0: performance.now(), logo: null, drawn: false };
    if (logoSrc) { const im = new Image(); im.onload = () => { j.logo = im; j.drawn = false; kick(); }; im.src = logoSrc; }
    const size = () => {
      const w = Math.max(120, media.clientWidth), h = Math.max(120, media.clientHeight), dpr = Math.min(2, devicePixelRatio || 1);
      cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); j.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      j.w = w; j.h = h; j.drawn = false;
    };
    new ResizeObserver(size).observe(media); size();
    new IntersectionObserver(es => { j.vis = es[0].isIntersecting; if (j.vis) { j.t0 = performance.now() - 800; kick(); } }, { threshold: 0.05 }).observe(cv);
    jobs.push(j);
  }

  /* ---------- Visio Slicer: camadas em onda + logo com reflexo ---------- */
  const shine = document.createElement('canvas');
  function drawSlicer(j, t) {
    const { ctx: c, w, h } = j;
    // fundo azul-marinho com brilho central
    const bg = c.createRadialGradient(w * 0.5, h * 0.3, 8, w * 0.5, h * 0.42, Math.max(w, h) * 0.85);
    bg.addColorStop(0, '#0d3f86'); bg.addColorStop(0.4, '#071f4a'); bg.addColorStop(1, '#030914');
    c.fillStyle = bg; c.fillRect(0, 0, w, h);
    // grade técnica na parte de cima
    c.strokeStyle = 'rgba(90,170,255,.11)'; c.lineWidth = 1;
    for (let x = 0; x < w; x += 28) { c.beginPath(); c.moveTo(x + 0.5, 0); c.lineTo(x + 0.5, h * 0.52); c.stroke(); }
    for (let y = 0; y < h * 0.52; y += 28) { c.beginPath(); c.moveTo(0, y + 0.5); c.lineTo(w, y + 0.5); c.stroke(); }
    // halo circular atrás do logo
    const hx = w / 2, hy = h * 0.3, hr = Math.min(w * 0.46, h * 0.28);
    const halo = c.createRadialGradient(hx, hy, hr * 0.2, hx, hy, hr * 1.25);
    halo.addColorStop(0, 'rgba(60,160,255,.30)'); halo.addColorStop(1, 'rgba(60,160,255,0)');
    c.fillStyle = halo; c.fillRect(0, 0, w, h * 0.6);
    c.strokeStyle = 'rgba(100,190,255,.18)'; c.lineWidth = 1; c.beginPath(); c.arc(hx, hy, hr, 0, 6.2832); c.stroke();
    // camadas não planares luminosas (de trás para frente)
    const L = 15, top = h * 0.5, bot = h * 0.9, pulse = 0.5 + 0.5 * Math.sin(t * 1.4);
    const Y = (i, u) => { const f = i / (L - 1), y0 = lerp(top, bot, f), amp = lerp(h * 0.03, h * 0.085, f), ph = t * (0.45 + f * 0.5) + i * 0.6; return y0 + Math.sin(u * 5 + ph) * amp + Math.sin(u * 10.5 - ph * 1.25) * amp * 0.25; };
    for (let i = 0; i < L; i++) {
      const f = i / (L - 1);
      c.beginPath();
      for (let x = 0; x <= w + 6; x += 6) { const y = Y(i, x / w); x ? c.lineTo(x, y) : c.moveTo(x, y); }
      c.lineTo(w, h); c.lineTo(0, h); c.closePath();
      const y0 = lerp(top, bot, f), amp = lerp(h * 0.03, h * 0.085, f);
      const g = c.createLinearGradient(0, y0 - amp, 0, y0 + amp * 3.2);
      g.addColorStop(0, `rgba(${Math.round(lerp(25, 40, f))},${Math.round(lerp(95, 170, f))},${Math.round(lerp(190, 255, f))},${lerp(0.5, 0.95, f)})`);
      g.addColorStop(1, '#040c1c');
      c.fillStyle = g; c.fill();
      c.beginPath();
      for (let x = 0; x <= w + 6; x += 6) { const y = Y(i, x / w); x ? c.lineTo(x, y) : c.moveTo(x, y); }
      c.save(); c.strokeStyle = `rgba(${Math.round(lerp(110, 200, f))},${Math.round(lerp(190, 240, f))},255,${lerp(0.35, 0.95, f)})`; c.lineWidth = lerp(0.9, 1.7, f);
      if (i % 3 === 2) { c.shadowColor = 'rgba(80,190,255,.9)'; c.shadowBlur = 10; }
      c.stroke(); c.restore();
    }
    // bico de luz traçando a camada da frente
    const u = (t * 0.13) % 1, x = u * w, y = Y(L - 1, u);
    const gl = c.createRadialGradient(x, y, 0, x, y, 26); gl.addColorStop(0, 'rgba(225,248,255,1)'); gl.addColorStop(0.35, 'rgba(90,200,255,.55)'); gl.addColorStop(1, 'rgba(60,160,255,0)');
    c.fillStyle = gl; c.fillRect(x - 28, y - 28, 56, 56);
    // logo oficial (cores originais) com brilho azul e reflexo
    let lbottom = h * 0.3;
    if (j.logo) {
      const lw = Math.min(w * 0.6, h * 0.46 * (j.logo.width / j.logo.height)), lh = lw * j.logo.height / j.logo.width;
      const cx = w / 2, cy = h * 0.3 + Math.sin(t * 0.9) * 3, a = smooth(0, 0.9, t);
      const sw = Math.ceil(lw), sh = Math.ceil(lh); lbottom = cy + sh / 2;
      if (shine.width !== sw || shine.height !== sh) { shine.width = sw; shine.height = sh; }
      const s = shine.getContext('2d'); s.clearRect(0, 0, sw, sh); s.globalCompositeOperation = 'source-over'; s.drawImage(j.logo, 0, 0, sw, sh);
      const p = ((t * 0.22) % 1.6) - 0.3, gx = lerp(-sw * 0.3, sw * 1.3, p / 1.0);
      s.globalCompositeOperation = 'source-atop';
      const sg = s.createLinearGradient(gx - sw * 0.16, 0, gx + sw * 0.16, sh * 0.4);
      sg.addColorStop(0, 'rgba(255,255,255,0)'); sg.addColorStop(0.5, 'rgba(255,255,255,.9)'); sg.addColorStop(1, 'rgba(255,255,255,0)');
      s.fillStyle = sg; s.fillRect(0, 0, sw, sh);
      c.save(); c.globalAlpha = a; c.shadowColor = 'rgba(70,170,255,.75)'; c.shadowBlur = 30; c.drawImage(shine, cx - sw / 2, cy - sh / 2); c.drawImage(shine, cx - sw / 2, cy - sh / 2); c.restore();
    }
    // linha de luz sob o logo
    const ly = Math.min(h * 0.5, lbottom + h * 0.035), lg = c.createLinearGradient(w * 0.12, 0, w * 0.88, 0);
    lg.addColorStop(0, 'rgba(70,170,255,0)'); lg.addColorStop(0.5, `rgba(140,215,255,${0.55 + 0.4 * pulse})`); lg.addColorStop(1, 'rgba(70,170,255,0)');
    c.save(); c.fillStyle = lg; c.shadowColor = 'rgba(70,170,255,.9)'; c.shadowBlur = 12; c.fillRect(w * 0.12, ly, w * 0.76, 1.6); c.restore();
  }

  /* ---------- Visio_Tekna: janela do aplicativo alternando entre as ferramentas ---------- */
  // sólido de revolução em malha: perfil r(v), altura relativa hf, centro yc
  function lathe(c, o) {
    const { cx, cy, S, Hs, r, hf = 1, yc = 0, rows = 22, cols = 48, tex = 0, twist = 0, spin = 0, tilt = 0.34, rgb = [80, 215, 230], alpha = 1, af = null, mer = 0, v0 = 0, v1 = 1, rowList = null } = o;
    const P = (v, th) => {
      const rr = r(v) * (1 + tex * Math.sin(th * 12 + v * 9 + twist)), a = th + spin, y = yc + (v - 0.5) * hf;
      return [cx + rr * Math.cos(a) * S, cy - y * Hs * Math.cos(tilt) + rr * Math.sin(a) * S * Math.sin(tilt) * 0.55, Math.sin(a)];
    };
    c.lineCap = 'round'; c.lineJoin = 'round';
    const list = rowList || Array.from({ length: rows + 1 }, (_, i) => lerp(v0, v1, i / rows));
    for (const v of list) {
      let prev = P(v, 0); const base = af ? af(v) : 1;
      for (let k = 1; k <= cols; k++) {
        const cur = P(v, (k / cols) * 2 * Math.PI), front = (prev[2] + cur[2]) * 0.5;
        c.strokeStyle = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${clamp((0.07 + 0.5 * (front + 1) / 2) * base * alpha)})`; c.lineWidth = base > 1.4 ? 1.6 : 1;
        c.beginPath(); c.moveTo(prev[0], prev[1]); c.lineTo(cur[0], cur[1]); c.stroke(); prev = cur;
      }
    }
    for (let m = 0; m < mer; m++) {
      const th = (m / mer) * 2 * Math.PI; let prev = P(v0, th);
      for (let i = 1; i <= 30; i++) {
        const cur = P(lerp(v0, v1, i / 30), th), front = (prev[2] + cur[2]) * 0.5;
        c.strokeStyle = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${clamp((0.04 + 0.32 * (front + 1) / 2) * alpha)})`; c.lineWidth = 0.8;
        c.beginPath(); c.moveTo(prev[0], prev[1]); c.lineTo(cur[0], cur[1]); c.stroke(); prev = cur;
      }
    }
    return P;
  }
  const vaseR = (v, t = 0, morph = 0) => {
    let r = 0.2 + 0.17 * Math.pow(Math.sin(Math.PI * clamp(v * 0.96 + 0.02)), 0.85);
    r += morph * Math.sin(2 * Math.PI * v * 1.4 + t * 0.55);
    return r * (1 - 0.42 * smooth(0.72, 1, v));
  };
  const TOOLS = ['Modelador', 'Montagem', 'Texturas', 'Fatiador', 'Render'];
  function icon(c, k, x, y, s, col) {
    c.save(); c.strokeStyle = col; c.fillStyle = col; c.lineWidth = 1.3; c.lineCap = 'round'; c.translate(x, y);
    if (k === 0) { c.beginPath(); c.moveTo(-s, s * 0.7); c.bezierCurveTo(-s * 0.2, s * 0.7, -s * 0.8, -s * 0.5, s, -s * 0.7); c.stroke(); c.fillRect(-s - 1.5, s * 0.7 - 1.5, 3, 3); c.fillRect(s - 1.5, -s * 0.7 - 1.5, 3, 3); }
    else if (k === 1) { c.strokeRect(-s, -s * 0.2, s * 1.1, s * 1.1); c.strokeRect(-s * 0.1, -s, s * 1.1, s * 1.1); }
    else if (k === 2) { c.beginPath(); for (let i = -s; i <= s; i += 1) { const yy = Math.sin(i / s * 5) * s * 0.45; i === -s ? c.moveTo(i, yy) : c.lineTo(i, yy); } c.stroke(); }
    else if (k === 3) { for (let i = -1; i <= 1; i++) { c.beginPath(); c.moveTo(-s, i * s * 0.55); c.lineTo(s, i * s * 0.55); c.stroke(); } }
    else { c.beginPath(); c.arc(0, 0, s * 0.9, 0, 6.2832); c.stroke(); c.beginPath(); c.arc(-s * 0.3, -s * 0.3, s * 0.35, 0, 6.2832); c.fill(); }
    c.restore();
  }
  function drawTekna(j, t) {
    const { ctx: c, w, h } = j;
    const bg = c.createRadialGradient(w * 0.5, h * 0.4, 10, w * 0.5, h * 0.5, Math.max(w, h) * 0.75);
    bg.addColorStop(0, '#12353a'); bg.addColorStop(0.6, '#0b1f20'); bg.addColorStop(1, '#09140f');
    c.fillStyle = bg; c.fillRect(0, 0, w, h);
    c.strokeStyle = 'rgba(120,230,240,.04)'; c.lineWidth = 1;
    for (let x = 0; x < w; x += 28) { c.beginPath(); c.moveTo(x + 0.5, 0); c.lineTo(x + 0.5, h); c.stroke(); }
    for (let y = 0; y < h; y += 28) { c.beginPath(); c.moveTo(0, y + 0.5); c.lineTo(w, y + 0.5); c.stroke(); }
    // logo (o fundo do SVG é quase igual ao meu fundo: "lighten" some com ele)
    let ly1 = h * 0.15;
    if (j.logo) {
      const lw = Math.min(w * 0.72, h * 0.12 * (j.logo.width / j.logo.height)), lh = lw * j.logo.height / j.logo.width;
      c.save(); c.globalAlpha = smooth(0, 0.9, t); c.globalCompositeOperation = 'lighten'; c.drawImage(j.logo, (w - lw) / 2, h * 0.03, lw, lh); c.restore(); ly1 = h * 0.03 + lh;
    }
    // janela do aplicativo
    const wx = w * 0.055, wy = Math.max(ly1 + h * 0.025, h * 0.17), ww = w * 0.89, wh = h * 0.63 - wy;
    c.save(); c.beginPath(); c.roundRect(wx, wy, ww, wh, 10); c.fillStyle = 'rgba(3,13,15,.84)'; c.fill();
    c.strokeStyle = 'rgba(110,225,235,.3)'; c.lineWidth = 1; c.stroke(); c.restore();
    const SEG = 4.4, idx = Math.floor(t / SEG) % TOOLS.length, lt = t % SEG;
    const tb = Math.max(22, ww * 0.1), top = wy + 16;
    // barra de título
    c.font = `600 ${Math.max(8.5, w * 0.034)}px ${MONO}`; c.textAlign = 'left'; c.textBaseline = 'middle';
    c.fillStyle = 'rgba(190,245,250,.85)'; c.fillText(TOOLS[idx].toUpperCase(), wx + tb + 8, wy + 9);
    c.fillStyle = 'rgba(150,215,222,.45)'; c.textAlign = 'right'; c.fillText('VISIO_TEKNA', wx + ww - 8, wy + 9);
    // barra de ferramentas
    const tbH = wh - 18 - 6;
    for (let k = 0; k < TOOLS.length; k++) {
      const iy = top + 4 + (tbH - 8) * (k + 0.5) / TOOLS.length, on = k === idx;
      if (on) { c.fillStyle = 'rgba(80,215,230,.16)'; c.strokeStyle = 'rgba(120,235,245,.65)'; c.beginPath(); c.roundRect(wx + 4, iy - tb * 0.42, tb - 6, tb * 0.84, 6); c.fill(); c.stroke(); }
      icon(c, k, wx + tb / 2 - 1, iy, Math.max(5, tb * 0.2), on ? '#c8fbff' : 'rgba(130,200,208,.5)');
    }
    // viewport
    const vx = wx + tb + 2, vy = top, vw = ww - tb - 8, vh = wh - 18 - 14;
    c.save(); c.beginPath(); c.roundRect(vx, vy, vw, vh, 6); c.clip();
    const vg = c.createRadialGradient(vx + vw / 2, vy + vh * 0.5, 4, vx + vw / 2, vy + vh * 0.5, vw * 0.7); vg.addColorStop(0, 'rgba(24,70,76,.55)'); vg.addColorStop(1, 'rgba(3,12,14,.2)');
    c.fillStyle = vg; c.fillRect(vx, vy, vw, vh);
    c.strokeStyle = 'rgba(100,220,232,.1)'; c.lineWidth = 1;
    for (let i = -4; i <= 4; i++) { c.beginPath(); c.moveTo(vx + vw / 2 + i * vw * 0.04, vy + vh * 0.78); c.lineTo(vx + vw / 2 + i * vw * 0.16, vy + vh); c.stroke(); }
    for (let i = 0; i < 4; i++) { const yy = vy + vh * (0.78 + 0.055 * i * i * 0.45 + 0.02 * i); c.beginPath(); c.moveTo(vx, yy); c.lineTo(vx + vw, yy); c.stroke(); }
    const fade = smooth(0, 0.45, lt) * (1 - smooth(SEG - 0.45, SEG, lt));
    c.globalAlpha = fade;
    const cx = vx + vw / 2, cy = vy + vh * 0.5, S = Math.min(vw * 0.95, vh * 1.25), Hs = vh * 0.82, spin = t * 0.4;
    let status = '';
    if (idx === 0) {                                   // MODELADOR: perfil + pontos de controle
      const R = v => vaseR(v, t, 0.045);
      lathe(c, { cx: cx - vw * 0.05, cy, S, Hs, r: R, spin, rows: 24, cols: 52, mer: 22, af: v => 1 + 2.2 * Math.exp(-Math.pow((v - ((t * 0.25) % 1.3)) / 0.05, 2)) });
      const pts = [0.02, 0.22, 0.42, 0.62, 0.8, 0.98], act = Math.floor(t * 0.7) % pts.length, px = cx - vw * 0.05 + S * 0.46;
      c.strokeStyle = 'rgba(170,250,255,.35)'; c.setLineDash([3, 4]); c.beginPath();
      pts.forEach((v, i) => { const y = cy - (v - 0.5) * Hs * 0.94, x = px + (R(v) - 0.3) * S * 0.5; i ? c.lineTo(x, y) : c.moveTo(x, y); }); c.stroke(); c.setLineDash([]);
      pts.forEach((v, i) => {
        const y = cy - (v - 0.5) * Hs * 0.94, x = px + (R(v) - 0.3) * S * 0.5, on = i === act, pu = on ? 0.5 + 0.5 * Math.sin(t * 6) : 0;
        c.fillStyle = on ? '#e9ffff' : '#7fe7f2'; c.fillRect(x - 2.5, y - 2.5, 5, 5);
        if (on) { c.strokeStyle = `rgba(200,255,255,${0.3 + 0.5 * pu})`; c.strokeRect(x - 6 - pu * 2, y - 6 - pu * 2, 12 + pu * 4, 12 + pu * 4); }
      });
      status = `perfil de revolução · ponto ${act + 1}/6`;
    } else if (idx === 1) {                            // MONTAGEM: três partes se encaixam
      const e = 1 - smooth(0.7, 2.3, lt), glow = Math.exp(-Math.pow((lt - 2.5) / 0.35, 2)), d = 0.3 * e;
      const parts = [
        { r: () => 0.26, hf: 0.09, yc: -0.42 - d, rgb: [90, 225, 200] },
        { r: v => 0.2 + 0.17 * Math.pow(Math.sin(Math.PI * clamp(v * 0.96 + 0.02)), 0.85), hf: 0.62, yc: -0.04, rgb: [80, 215, 235] },
        { r: v => 0.1 + 0.025 * Math.sin(v * 6.28), hf: 0.24, yc: 0.4 + d, rgb: [150, 235, 255] }];
      parts.forEach(p => lathe(c, { cx, cy, S: S * 0.95, Hs, r: p.r, hf: p.hf, yc: p.yc, rows: 8, cols: 40, spin, rgb: p.rgb, alpha: 1.1, mer: 14, af: () => 1 + glow * 1.6 }));
      status = lt < 2.3 ? 'montagem · posicionando 3 partes' : 'montagem · conjunto encaixado';
    } else if (idx === 2) {                            // TEXTURAS: relevo cresce na superfície
      const amp = 0.095 * smooth(0.3, 2.6, lt);
      lathe(c, { cx, cy, S, Hs, r: v => vaseR(v, 0, 0), spin, rows: 34, cols: 64, tex: amp, twist: lt * 1.6, rgb: [120, 240, 215], alpha: 1.15 });
      status = 'textura · relevo ' + Math.round(smooth(0.3, 2.6, lt) * 100) + '%';
    } else if (idx === 3) {                            // FATIADOR: camadas e percurso
      const N = 36, cur = Math.min(N, Math.floor((lt / (SEG - 0.5)) * N)), rowsDone = Array.from({ length: cur + 1 }, (_, i) => i / N);
      lathe(c, { cx, cy, S, Hs, r: v => vaseR(v, 0, 0), spin: 0.4, rows: 10, cols: 40, rgb: [80, 215, 230], alpha: 0.35 });
      lathe(c, { cx, cy, S, Hs, r: v => vaseR(v, 0, 0), spin: 0.4, cols: 72, rowList: rowsDone, rgb: [130, 245, 255], alpha: 1.5, af: v => (v >= (cur - 0.5) / N ? 2.2 : 1) });
      const a = lt * 9 + 0.4, v = cur / N, rr = vaseR(v), pp = [cx + rr * Math.cos(a) * S, cy - (v - 0.5) * Hs * Math.cos(0.34) + rr * Math.sin(a) * S * Math.sin(0.34) * 0.55];
      const gl = c.createRadialGradient(pp[0], pp[1], 0, pp[0], pp[1], 14); gl.addColorStop(0, 'rgba(235,255,255,1)'); gl.addColorStop(1, 'rgba(80,220,240,0)'); c.fillStyle = gl; c.fillRect(pp[0] - 15, pp[1] - 15, 30, 30);
      status = `fatiador · camada ${cur}/${N}`;
    } else {                                           // RENDER: sólido sombreado
      const rows = 26, cols = 60, quads = [], R = v => vaseR(v, 0, 0), tilt = 0.3, lightA = -0.9;
      for (let i = 0; i < rows; i++) for (let k = 0; k < cols; k++) {
        const v0 = i / rows, v1 = (i + 1) / rows, a0 = (k / cols) * 6.2832 + spin, a1 = ((k + 1) / cols) * 6.2832 + spin, am = (a0 + a1) / 2;
        const z = Math.sin(am); if (z < -0.05) continue;
        const pt = (v, a) => [cx + R(v) * Math.cos(a) * S, cy - (v - 0.5) * Hs * Math.cos(tilt) + R(v) * Math.sin(a) * S * Math.sin(tilt) * 0.55];
        const slope = (R(v1) - R(v0)) * 3, lam = Math.max(0, Math.cos(am - lightA) * 0.75 + 0.25 - slope * 0.35), spec = Math.pow(Math.max(0, Math.cos(am - lightA - 0.35)), 18) * 0.7;
        quads.push({ z, pts: [pt(v0, a0), pt(v0, a1), pt(v1, a1), pt(v1, a0)], col: `rgb(${Math.round(24 + 90 * lam + 150 * spec)},${Math.round(70 + 150 * lam + 130 * spec)},${Math.round(80 + 140 * lam + 130 * spec)})` });
      }
      quads.sort((q1, q2) => q1.z - q2.z);
      c.fillStyle = 'rgba(0,0,0,.35)'; c.beginPath(); c.ellipse(cx, cy + Hs * 0.45, S * 0.34, S * 0.07, 0, 0, 6.2832); c.fill();
      for (const q of quads) { c.beginPath(); c.moveTo(q.pts[0][0], q.pts[0][1]); for (let n = 1; n < 4; n++) c.lineTo(q.pts[n][0], q.pts[n][1]); c.closePath(); c.fillStyle = q.col; c.fill(); c.strokeStyle = q.col; c.lineWidth = 0.6; c.stroke(); }
      status = 'render · luz suave';
    }
    c.restore();
    // eixos no canto + status
    c.save(); c.globalAlpha = 0.8; const gx = vx + 12, gy = vy + vh - 10;
    c.lineWidth = 1.2; [['#ff7a7a', 10, 0], ['#7aff9e', 0, -10], ['#7ab8ff', -6, 6]].forEach(([col, dx, dy]) => { c.strokeStyle = col; c.beginPath(); c.moveTo(gx, gy); c.lineTo(gx + dx, gy + dy); c.stroke(); });
    c.restore();
    c.font = `500 ${Math.max(8, w * 0.031)}px ${MONO}`; c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillStyle = 'rgba(160,225,232,.7)';
    c.globalAlpha = fade; c.fillText(status, wx + tb + 8, wy + wh - 9); c.globalAlpha = 1;
    // pontos de progresso (uma bolinha por ferramenta)
    TOOLS.forEach((_, k) => { c.fillStyle = k === idx ? 'rgba(200,252,255,.95)' : 'rgba(130,200,208,.3)'; c.beginPath(); c.arc(wx + ww - 10 - (TOOLS.length - 1 - k) * 8, wy + wh - 9, k === idx ? 2.6 : 1.8, 0, 6.2832); c.fill(); });
  }

  /* ---------- Visio_Tekna (versão "fábrica"): cena da tela Fábrica do aplicativo + logo, câmera lenta ---------- */
  function drawTeknaFabrica(j, t) {
    const { ctx: c, w, h } = j;
    if (!j.bg) { j.bg = new Image(); j.bg.onload = () => { j.drawn = false; kick(); }; j.bg.src = 'assets/software/visio-tekna-fabrica-hd.webp'; }
    c.fillStyle = '#07120f'; c.fillRect(0, 0, w, h);
    if (j.bg.complete && j.bg.naturalWidth) {
      // recorte do miolo da cena (sem os painéis de interface das bordas), com pan e zoom lentos
      const IW = j.bg.naturalWidth, IH = j.bg.naturalHeight, k = IW / 1600;
      const zoom = 1 + 0.06 * Math.sin(t * 0.18), srcH = 640 * k / zoom, scale = h / srcH, srcW = w / scale;
      const cxs = (720 + 170 * Math.sin(t * 0.12)) * k, cys = 340 * k;
      const sx = clamp(cxs - srcW / 2, 0, IW - srcW), sy = clamp(cys - srcH / 2, 0, IH - srcH);
      c.globalAlpha = smooth(0, 1.2, t); c.filter = 'saturate(1.3) brightness(1.12) contrast(1.05)'; c.drawImage(j.bg, sx, sy, srcW, srcH, 0, 0, w, h); c.filter = 'none'; c.globalAlpha = 1;
    }
    // véu verde-azulado para casar com a marca e dar leitura ao logo e ao texto
    const veil = c.createLinearGradient(0, 0, 0, h);
    veil.addColorStop(0, 'rgba(3,14,20,.30)'); veil.addColorStop(0.25, 'rgba(3,14,20,.06)'); veil.addColorStop(0.6, 'rgba(3,14,20,.10)'); veil.addColorStop(1, 'rgba(3,12,16,.55)');
    c.fillStyle = veil; c.fillRect(0, 0, w, h);
    // varredura de luz diagonal lenta
    const sp = ((t * 0.12) % 1.6) - 0.3, gx = lerp(-w * 0.4, w * 1.4, sp);
    const sg = c.createLinearGradient(gx - w * 0.18, 0, gx + w * 0.18, h * 0.6);
    sg.addColorStop(0, 'rgba(120,240,255,0)'); sg.addColorStop(0.5, 'rgba(120,240,255,.10)'); sg.addColorStop(1, 'rgba(120,240,255,0)');
    c.fillStyle = sg; c.fillRect(0, 0, w, h);
    // partículas de luz subindo
    c.save(); c.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 26; i++) {
      const sd = i * 12.9898, fx = (Math.sin(sd) * 43758.5453) % 1, fy = (Math.sin(sd * 1.7) * 24634.6345) % 1;
      const x = ((Math.abs(fx) * w + t * (6 + (i % 5) * 3)) % w), y = h - ((Math.abs(fy) * h + t * (10 + (i % 4) * 6)) % h);
      const a = 0.12 + 0.18 * (0.5 + 0.5 * Math.sin(t * 1.6 + i));
      c.fillStyle = `rgba(150,245,255,${a})`; c.beginPath(); c.arc(x, y, 0.8 + (i % 3) * 0.5, 0, 6.2832); c.fill();
    }
    c.restore();
    // logo grande no meio: tira o fundo opaco do SVG uma vez (chave por cor) e desenha por cima de um halo escuro
    if (j.logo && !j.keyed) {
      const kw = 900, kh = Math.round(900 * j.logo.height / j.logo.width), kc = document.createElement('canvas'); kc.width = kw; kc.height = kh;
      const kx = kc.getContext('2d'); kx.drawImage(j.logo, 0, 0, kw, kh);
      try {
        const id = kx.getImageData(0, 0, kw, kh), d = id.data, br = d[0], bgc = d[1], bb = d[2];
        for (let i = 0; i < d.length; i += 4) {
          const df = Math.max(Math.abs(d[i] - br), Math.abs(d[i + 1] - bgc), Math.abs(d[i + 2] - bb)), al = clamp((df - 5) / 40);
          if (al < 1) { const a = Math.max(al, 0.02); d[i] = clamp((d[i] - br * (1 - al)) / a, 0, 255); d[i + 1] = clamp((d[i + 1] - bgc * (1 - al)) / a, 0, 255); d[i + 2] = clamp((d[i + 2] - bb * (1 - al)) / a, 0, 255); }
          d[i + 3] = al * 255;
        }
        kx.putImageData(id, 0, 0); j.keyed = kc;
      } catch (e) { j.keyed = j.logo; }
    }
    if (j.keyed) {
      const lw = Math.min(w * 0.97, h * 0.34 * (j.keyed.width / j.keyed.height)), lh = lw * j.keyed.height / j.keyed.width, lx = (w - lw) / 2, ly = h * 0.46 - lh / 2;
      const halo = c.createRadialGradient(w / 2, ly + lh / 2, 4, w / 2, ly + lh / 2, lw * 0.8); halo.addColorStop(0, 'rgba(2,10,14,.42)'); halo.addColorStop(0.6, 'rgba(2,10,14,.2)'); halo.addColorStop(1, 'rgba(2,10,11,0)');
      c.fillStyle = halo; c.fillRect(0, ly - lh * 1.2, w, lh * 3.4);
      c.save(); c.globalAlpha = smooth(0.2, 1.1, t); c.drawImage(j.keyed, lx, ly, lw, lh);
      c.globalCompositeOperation = 'lighter'; c.globalAlpha *= 0.3; c.drawImage(j.keyed, lx, ly, lw, lh); c.restore();   // reforço: o véu escuro do cartão (CSS) apagava o logo
    }
  }

  const slicer = () => document.querySelectorAll('a.area-card[href="#software"]').forEach(a => mount(a, drawSlicer, 'assets/software/visio-slicer-logo-transp.png'));
  const tekna = () => document.querySelectorAll('a.tekna-area-card').forEach(a => mount(a, (new URLSearchParams(location.search).get('ct_app') ? drawTekna : drawTeknaFabrica), 'assets/software/visio-tekna-horizontal.svg'));
  slicer(); tekna();
})();
