/* VISIOARTE — simulação 3D da impressão (22/11/2026).
   Uma peça em 3D (three.js, arquivo local) que passa por: traço → modelo → camadas → impressão → peça pronta, guiada pela rolagem.
   Só carrega a biblioteca quando a seção está perto da tela e só desenha quando ela está visível. Sem WebGL, a seção some. */
(() => {
  'use strict';
  const root = document.getElementById('sim3d');
  if (!root) return;
  const reduz = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const sm = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
  const lerp = (a, b, k) => a + (b - a) * k;

  function temWebGL() { try { const c = document.createElement('canvas'); return !!(c.getContext('webgl') || c.getContext('experimental-webgl')); } catch (e) { return false; } }
  if (!temWebGL()) { root.hidden = true; return; }

  let iniciado = false;
  function carregar() {
    if (iniciado) return; iniciado = true;
    if (window.THREE) return iniciar();
    const s = document.createElement('script');
    s.src = 'assets/vendor/three.min.js?v=r128';
    s.onload = iniciar;
    s.onerror = () => { root.hidden = true; };
    document.head.appendChild(s);
  }
  new IntersectionObserver((es, o) => { if (es.some(e => e.isIntersecting)) { o.disconnect(); carregar(); } }, { rootMargin: '900px 0px' }).observe(root);

  function iniciar() {
    const THREE = window.THREE;
    const palco = root.querySelector('.sim3d__palco'), canvas = root.querySelector('canvas');
    const cel = () => innerWidth <= 820;
    let renderer;
    try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' }); }
    catch (e) { root.hidden = true; return; }
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    renderer.localClippingEnabled = true;
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = .78;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, 1, .1, 60);

    /* ---- peça: vaso torcido (fórmula, sem imagem) ---- */
    const H = 3.2, LAYERS = 120, RIDGE = .07;
    const prof = y => .22 + .09 * Math.sin(Math.PI * (y * 1.3 + .1));
    const rad = (y, th, bead) => { let r = prof(y) * H * (1 + RIDGE * Math.cos(5 * th + y * 5)); if (bead) { const ph = y * LAYERS; r += .011 * (Math.pow(Math.abs(Math.sin(Math.PI * ph)), .55) - .7); } return r; };
    function malha(rows, cols, bead) {
      const pos = [], idx = [];
      for (let j = 0; j <= rows; j++) { const y = j / rows; for (let k = 0; k <= cols; k++) { const th = k / cols * Math.PI * 2, r = rad(y, th, bead); pos.push(r * Math.cos(th), y * H, r * Math.sin(th)); } }
      for (let j = 0; j < rows; j++) for (let k = 0; k < cols; k++) { const a = j * (cols + 1) + k, b = a + cols + 1; idx.push(a, b, a + 1, b, b + 1, a + 1); }
      const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals(); return g;
    }
    const leve = cel();
    const gSuave = malha(leve ? 140 : 240, leve ? 100 : 160, false);
    const gCamada = malha(LAYERS * (leve ? 4 : 6), leve ? 140 : 200, true);

    const mkPlane = c => new THREE.Plane(new THREE.Vector3(0, -1, 0), c);
    const pCima = mkPlane(H), pCimaPre = mkPlane(H), pCimaArg = mkPlane(0), pCimaWire = mkPlane(0);
    const pBaixoWire = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const matArgila = new THREE.MeshStandardMaterial({ color: 0x6f8497, roughness: .7, metalness: .05, side: THREE.DoubleSide, transparent: true, clippingPlanes: [pCimaArg] });
    const matPre = new THREE.MeshStandardMaterial({ color: 0x19d8ee, emissive: 0x0b7f8e, emissiveIntensity: .9, roughness: .4, metalness: .1, side: THREE.DoubleSide, transparent: true, clippingPlanes: [pCimaPre] });
    const matPeca = new THREE.MeshStandardMaterial({ color: 0xb08f62, roughness: .55, metalness: .04, emissive: 0xff9a3c, emissiveIntensity: 0, side: THREE.DoubleSide, clippingPlanes: [pCima] });
    const argila = new THREE.Mesh(gSuave, matArgila), pre = new THREE.Mesh(gCamada, matPre), peca = new THREE.Mesh(gCamada, matPeca);
    pre.scale.set(1.004, 1, 1.004);
    const vaso = new THREE.Group(); vaso.add(argila, pre, peca); scene.add(vaso);

    const matWire = new THREE.LineBasicMaterial({ color: 0x19d8ee, transparent: true, opacity: .7, clippingPlanes: [pCimaWire, pBaixoWire] });
    const wpts = [], AN = 48, AC = 28;
    for (let j = 0; j <= AN; j++) { const y = j / AN; for (let k = 0; k < 64; k++) { const a = k / 64 * Math.PI * 2, b = (k + 1) / 64 * Math.PI * 2, r1 = rad(y, a, false), r2 = rad(y, b, false); wpts.push(r1 * Math.cos(a), y * H, r1 * Math.sin(a), r2 * Math.cos(b), y * H, r2 * Math.sin(b)); } }
    for (let m = 0; m < AC; m++) { const th = m / AC * Math.PI * 2; for (let j = 0; j < AN * 2; j++) { const y1 = j / (AN * 2), y2 = (j + 1) / (AN * 2), r1 = rad(y1, th, false), r2 = rad(y2, th, false); wpts.push(r1 * Math.cos(th), y1 * H, r1 * Math.sin(th), r2 * Math.cos(th), y2 * H, r2 * Math.sin(th)); } }
    const wg = new THREE.BufferGeometry(); wg.setAttribute('position', new THREE.Float32BufferAttribute(wpts, 3));
    vaso.add(new THREE.LineSegments(wg, matWire));

    /* chão, halo, plano de corte, bico */
    const texRadial = (c0, c1) => { const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d'), g = x.createRadialGradient(128, 128, 0, 128, 128, 128); g.addColorStop(0, c0); g.addColorStop(1, c1); x.fillStyle = g; x.fillRect(0, 0, 256, 256); return new THREE.CanvasTexture(c); };
    const sombra = new THREE.Mesh(new THREE.CircleGeometry(2.2, 64), new THREE.MeshBasicMaterial({ map: texRadial('rgba(0,0,0,.75)', 'rgba(0,0,0,0)'), transparent: true, depthWrite: false }));
    sombra.rotation.x = -Math.PI / 2; sombra.position.y = -.01; scene.add(sombra);
    const grade = new THREE.GridHelper(12, 30, 0x19d8ee, 0x19d8ee); grade.material.transparent = true; grade.material.opacity = .14; grade.position.y = -.02; scene.add(grade);
    const halo = new THREE.Mesh(new THREE.CircleGeometry(3.4, 64), new THREE.MeshBasicMaterial({ map: texRadial('rgba(255,170,90,.55)', 'rgba(255,170,90,0)'), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
    halo.rotation.x = -Math.PI / 2; halo.position.y = .005; halo.material.opacity = 0; scene.add(halo);
    const corte = new THREE.Group();
    const disco = new THREE.Mesh(new THREE.CircleGeometry(1, 96), new THREE.MeshBasicMaterial({ color: 0x19d8ee, transparent: true, opacity: .1, side: THREE.DoubleSide, depthWrite: false })); disco.rotation.x = -Math.PI / 2;
    const borda = new THREE.Mesh(new THREE.RingGeometry(.985, 1, 96), new THREE.MeshBasicMaterial({ color: 0xbff6ff, transparent: true, opacity: .9, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending })); borda.rotation.x = -Math.PI / 2;
    corte.add(disco, borda); scene.add(corte);
    const NP = 200, cArr = new Float32Array((NP + 1) * 3), cGeo = new THREE.BufferGeometry(); cGeo.setAttribute('position', new THREE.BufferAttribute(cArr, 3));
    const contorno = new THREE.Line(cGeo, new THREE.LineBasicMaterial({ color: 0xcaf9ff, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })); contorno.frustumCulled = false; scene.add(contorno);
    const brilho = new THREE.Sprite(new THREE.SpriteMaterial({ map: texRadial('rgba(255,255,255,1)', 'rgba(25,216,238,0)'), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, color: 0x7fefff })); brilho.scale.set(.55, .55, 1); scene.add(brilho);
    const bico = new THREE.Group();
    const cone = new THREE.Mesh(new THREE.CylinderGeometry(.11, .025, .3, 24), new THREE.MeshStandardMaterial({ color: 0xbfc7cf, metalness: .9, roughness: .28 })); cone.position.y = .17;
    const hast = new THREE.Mesh(new THREE.CylinderGeometry(.11, .11, .55, 24), new THREE.MeshStandardMaterial({ color: 0x2a3946, metalness: .6, roughness: .5 })); hast.position.y = .6;
    bico.add(cone, hast); scene.add(bico);

    const hemi = new THREE.HemisphereLight(0x9bbcd0, 0x0a1520, .55); scene.add(hemi);
    const key = new THREE.DirectionalLight(0xfff1dc, 1.15); key.position.set(4, 6, 3); scene.add(key);
    const rim = new THREE.DirectionalLight(0x19d8ee, 1.2); rim.position.set(-5, 3, -4); scene.add(rim);
    const quente = new THREE.PointLight(0xffa24d, 0, 9, 1.6); quente.position.set(0, 1.5, 0); scene.add(quente);

    /* ---- tamanho, rolagem e laço de desenho ---- */
    const etapas = [...root.querySelectorAll('.sim3d__etapa')], passos = [...root.querySelectorAll('.sim3d__passos span')];
    const fill = root.querySelector('.sim3d__fill'), hud = root.querySelector('.sim3d__hud'), hudT = root.querySelector('.sim3d__hud span'), hudN = root.querySelector('.sim3d__hud b');
    let alvo = 0, s = 0, ativa = -1, visivel = false, vw = 0, vh = 0;
    function medir() {
      vw = palco.clientWidth; vh = palco.clientHeight; if (!vw || !vh) return;
      renderer.setSize(vw, vh, false); camera.aspect = vw / vh;
      const c = cel(); camera.setViewOffset(vw, vh, c ? 0 : -vw * (vw < 1200 ? .27 : .2), c ? -vh * .2 : 0, vw, vh);
      camera.updateProjectionMatrix(); ler();
    }
    function ler() { const r = root.getBoundingClientRect(), tot = root.offsetHeight - innerHeight; alvo = clamp(-r.top / tot); }
    addEventListener('scroll', ler, { passive: true });
    addEventListener('resize', medir);
    new IntersectionObserver(es => { visivel = es.some(e => e.isIntersecting); if (visivel) { medir(); quadro(performance.now()); } }, { rootMargin: '100px 0px' }).observe(root);
    const t0 = performance.now();
    let pendente = false;

    function quadro(now) {
      pendente = false;
      if (!visivel) return;
      const t = (now - t0) / 1000;
      s += (alvo - s) * (reduz ? 1 : .09);
      const yWire = H * sm(0, .16, s) + .0001, yArg = H * sm(.14, .3, s), ySlice = H * sm(.4, .6, s), yPrint = H * sm(.62, .84, s);
      const wireA = s < .4 ? (1 - sm(.28, .4, s) * .78) : (.22 * (1 - sm(.82, .9, s)));
      matWire.opacity = wireA * .8; pCimaWire.constant = s < .4 ? yWire : H; pBaixoWire.constant = s < .4 ? 0 : -(s < .62 ? ySlice : yPrint);
      pCimaArg.constant = yArg; matArgila.opacity = 1 - sm(.4, .47, s);
      pCimaPre.constant = ySlice; matPre.opacity = sm(.4, .43, s) * (1 - sm(.64, .7, s));
      pCima.constant = s < .62 ? 0 : (s >= .84 ? H : yPrint);
      const yc = Math.max(ySlice, .001); corte.position.y = yc; const rc = prof(yc / H) * H * 1.5; corte.scale.set(rc, rc, rc);
      const cA = sm(.4, .43, s) * (1 - sm(.58, .62, s)); disco.material.opacity = .12 * cA; borda.material.opacity = .9 * cA; corte.visible = cA > .01;
      const pA = sm(.62, .64, s) * (1 - sm(.84, .88, s)), yp = Math.max(yPrint, .02), fase = t * 2.6;
      for (let k = 0; k <= NP; k++) { const th = k / NP * Math.PI * 2, r = rad(yp / H, th, true) + .004; cArr[k * 3] = r * Math.cos(th); cArr[k * 3 + 1] = yp + .012; cArr[k * 3 + 2] = r * Math.sin(th); }
      cGeo.attributes.position.needsUpdate = true;
      const rb = rad(yp / H, fase, true) + .004, bx = rb * Math.cos(fase), by = yp + .012, bz = rb * Math.sin(fase);
      contorno.visible = pA > .01; contorno.material.opacity = pA; bico.visible = pA > .01; bico.position.set(bx, by, bz);
      brilho.visible = pA > .01; brilho.position.set(bx, by + .02, bz); brilho.material.opacity = pA;
      const q = sm(.84, .95, s);
      grade.material.opacity = .16 * (1 - sm(.5, .7, s)); halo.material.opacity = q; quente.intensity = q * 3.2; matPeca.emissiveIntensity = q * .3;
      hemi.intensity = lerp(.55, .32, q); key.intensity = lerp(1.15, .7, q);
      const az = .55 + s * Math.PI * 1.7 + (reduz ? 0 : t * .04), el = lerp(.28, .42, sm(.3, .6, s)) - .1 * sm(.84, 1, s);
      const dist = lerp(9.6, 8.2, sm(.55, .8, s)) + .6 * sm(.9, 1, s), ty = lerp(1.35, 1.55, sm(.55, .85, s));
      camera.position.set(Math.cos(az) * Math.cos(el) * dist, ty + Math.sin(el) * dist, Math.sin(az) * Math.cos(el) * dist); camera.lookAt(0, ty, 0);
      vaso.rotation.y = reduz ? 0 : q * t * .35;

      const idx = s < .2 ? 0 : s < .4 ? 1 : s < .6 ? 2 : s < .84 ? 3 : 4;
      if (idx !== ativa) { ativa = idx; etapas.forEach((e, i) => e.classList.toggle('on', i === idx)); passos.forEach((p, i) => p.classList.toggle('on', i === idx)); }
      fill.style.width = (s * 100) + '%';
      if (idx === 2) { hud.classList.add('on'); hudT.textContent = 'camada'; hudN.textContent = Math.round(sm(.4, .6, s) * LAYERS) + ' / ' + LAYERS; }
      else if (idx === 3) { hud.classList.add('on'); hudT.textContent = 'impresso'; hudN.textContent = Math.round(sm(.62, .84, s) * 100) + '%'; }
      else hud.classList.remove('on');
      renderer.render(scene, camera);
      if (!pendente) { pendente = true; requestAnimationFrame(quadro); }
    }
    medir();
  }
})();
