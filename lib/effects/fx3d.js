/* 3D 粒子（Three.js）と見出し・数字の動き（anime.js）。 */
import * as T from 'three';
import anime from 'animejs';

export function initFx(LK) {
  if (!LK) return;

  /* ---------- hero headline: per-character motion (anime.js) ---------- */
  const h1 = document.querySelector('.hero h1, .ph h1');
  if (h1 && !LK.reduced) {
    h1.setAttribute('aria-label', h1.textContent.trim()); h1.classList.add('an');
    const chars = [];
    h1.querySelectorAll('.ln > span').forEach(line => {
      const t = line.textContent; line.textContent = '';
      [...t].forEach(c => { const s = document.createElement('span'); s.className = 'ch'; s.textContent = c; s.setAttribute('aria-hidden', 'true'); line.appendChild(s); chars.push(s); });
    });
    const play = () => anime({ targets: chars, translateY: ['115%', '0%'], rotate: [10, 0], opacity: [0, 1], delay: anime.stagger(34), duration: 1200, easing: 'easeOutExpo' });
    if (document.body.classList.contains('ready')) play();
    else { const mo = new MutationObserver(() => { if (document.body.classList.contains('ready')) { mo.disconnect(); play(); } }); mo.observe(document.body, { attributes: true, attributeFilter: ['class'] }); }
  }
  /* count-up for the fact number */
  if (!LK.reduced) {
    document.querySelectorAll('.fact b').forEach(b => {
      const node = [...b.childNodes].filter(n => n.nodeType === 3 && n.textContent.trim() === '4')[0]; if (!node) return;
      const o = { v: 0 }, io = new IntersectionObserver(es => { if (es[0].isIntersecting) { io.disconnect(); anime({ targets: o, v: 4, duration: 1600, easing: 'easeOutExpo', update: () => { node.textContent = o.v.toFixed(o.v < 3.95 ? 1 : 0); } }); } }, { threshold: .6 });
      io.observe(b);
    });
  }

  if (LK.reduced) return;
  let renderer;
  const cv = document.createElement('canvas'); cv.id = 'fx'; cv.setAttribute('aria-hidden', 'true');
  try { renderer = new T.WebGLRenderer({ canvas: cv, alpha: true, antialias: false, powerPreference: 'high-performance' }); } catch (e) { return; }
  const stage = document.getElementById('stage'); stage.parentNode.insertBefore(cv, stage.nextSibling);
  const DPR = Math.min(2, devicePixelRatio || 1); renderer.setPixelRatio(DPR); renderer.setClearColor(0, 0);

  const small = innerWidth < 900;
  const NR = small ? 700 : 1800, ND = small ? 220 : 650, NB = 260, N = NR + ND + NB;
  const pos = new Float32Array(N * 3), vel = new Float32Array(N * 3), size = new Float32Array(N), alpha = new Float32Array(N), tint = new Float32Array(N);
  const ring = new Uint8Array(NR), ang = new Float32Array(NR), rad = new Float32Array(NR), zo = new Float32Array(NR), spd = new Float32Array(NR), free = new Float32Array(NR), life = new Float32Array(NB);
  const rnd = Math.random, gauss = () => (rnd() + rnd() + rnd() + rnd() - 2) / 2;
  let W = innerWidth, H = innerHeight, camZ = 1;
  const FOV = 38, scene = new T.Scene(), cam = new T.PerspectiveCamera(FOV, W / H, 1, 6000);
  const resize = () => { W = innerWidth; H = innerHeight; renderer.setSize(W, H, false); cam.aspect = W / H; camZ = (H / 2) / Math.tan(FOV * Math.PI / 360); cam.position.set(0, 0, camZ); cam.far = camZ + 3000; cam.updateProjectionMatrix(); mat.uniforms.uScale.value = camZ * DPR; };

  for (let i = 0; i < NR; i++) {
    const u = rnd(); ring[i] = u < .5 ? 0 : u < .72 ? 1 : u < .9 ? 2 : 3;
    ang[i] = rnd() * 6.2832; rad[i] = gauss() * 1.5; zo[i] = gauss() * 150; spd[i] = (.04 + rnd() * .14) * (rnd() < .5 ? -1 : 1);
    pos[i * 3] = (rnd() - .5) * W * 3; pos[i * 3 + 1] = (rnd() - .5) * H * 3; pos[i * 3 + 2] = -600 - rnd() * 1800;
    size[i] = 1.6 + rnd() * rnd() * 5; tint[i] = rnd(); alpha[i] = 0;
  }
  for (let k = 0; k < ND; k++) {
    const i = NR + k; pos[i * 3] = (rnd() - .5) * W * 2.4; pos[i * 3 + 1] = (rnd() - .5) * H * 2.4; pos[i * 3 + 2] = -1600 + rnd() * 1900;
    size[i] = 1.2 + rnd() * 2.4; tint[i] = rnd() * .6; alpha[i] = .14 + rnd() * .24;
  }
  for (let k = 0; k < NB; k++) { const i = NR + ND + k; size[i] = 2 + rnd() * 4.5; tint[i] = rnd() * .78; alpha[i] = 0; }

  const geo = new T.BufferGeometry();
  geo.setAttribute('position', new T.BufferAttribute(pos, 3));
  geo.setAttribute('aSize', new T.BufferAttribute(size, 1));
  geo.setAttribute('aAlpha', new T.BufferAttribute(alpha, 1));
  geo.setAttribute('aTint', new T.BufferAttribute(tint, 1));
  const mat = new T.ShaderMaterial({
    transparent: true, depthTest: false, depthWrite: false,
    uniforms: { uScale: { value: 1 } },
    vertexShader: 'attribute float aSize;attribute float aAlpha;attribute float aTint;varying float vA;varying float vT;uniform float uScale;void main(){vec4 mv=modelViewMatrix*vec4(position,1.0);gl_Position=projectionMatrix*mv;float d=max(1.0,-mv.z);gl_PointSize=aSize*uScale/d;vA=aAlpha*clamp(1.6-d/(uScale*1.3),0.25,1.0);vT=aTint;}',
    fragmentShader: 'precision mediump float;varying float vA;varying float vT;void main(){float r=length(gl_PointCoord-0.5);float m=smoothstep(0.5,0.34,r);vec3 deep=vec3(0.07,0.36,0.52);vec3 mid=vec3(0.20,0.63,0.85);vec3 wht=vec3(1.0);vec3 c=vT<0.45?mix(deep,mid,vT/0.45):vT<0.8?mid:wht;gl_FragColor=vec4(c,m*vA);}',
  });
  const pts = new T.Points(geo, mat); pts.frustumCulled = false; scene.add(pts);
  resize(); addEventListener('resize', resize);

  /* pointer */
  let px = -9999, py = -9999, mx = 0, my = 0, tmx = 0, tmy = 0, bi = 0;
  const emit = (x, y, n, pow) => {
    for (let k = 0; k < n; k++) {
      const j = bi++ % NB, i = NR + ND + j, a = rnd() * 6.2832, s = (.25 + rnd()) * pow;
      pos[i * 3] = x; pos[i * 3 + 1] = y; pos[i * 3 + 2] = 0;
      vel[i * 3] = Math.cos(a) * s; vel[i * 3 + 1] = Math.abs(Math.sin(a)) * s * 1.25 + pow * .35; vel[i * 3 + 2] = (rnd() - .5) * pow;
      life[j] = 1;
    }
  };
  addEventListener('pointermove', e => { px = e.clientX - W / 2; py = H / 2 - e.clientY; tmx = e.clientX / W - .5; tmy = e.clientY / H - .5; }, { passive: true });
  addEventListener('pointerdown', e => emit(e.clientX - W / 2, H / 2 - e.clientY, 34, 560), { passive: true });
  addEventListener('pointerleave', () => { px = py = -9999; });

  /* loop */
  const G = 2100; let last = performance.now(), prev = null, cool = 0, sy = scrollY, started = false;
  const burst = (st, u, pow) => {
    for (let i = 0; i < NR; i++) {
      if (rnd() > .42) continue;
      const r = st[ring[i]], cxp = r[0] * W - W / 2, cyp = H / 2 - r[1] * H;
      let dx = pos[i * 3] - cxp, dy = pos[i * 3 + 1] - cyp; const d = Math.hypot(dx, dy) || 1; dx /= d; dy /= d;
      const s = (.35 + rnd()) * pow;
      vel[i * 3] = dx * s + (rnd() - .5) * 260; vel[i * 3 + 1] = dy * s * .6 + 300 + rnd() * 560; vel[i * 3 + 2] = (rnd() - .5) * 900;
      free[i] = .45 + rnd() * .65;
    }
  };
  const frame = now => {
    requestAnimationFrame(frame);
    const dt = Math.min(.033, (now - last) / 1000); last = now;
    const st = LK.state(); if (!st) return;
    const u = LK.unit();
    mx += (tmx - mx) * .05; my += (tmy - my) * .05;
    pts.rotation.y = mx * .2; pts.rotation.x = my * .13;

    /* how fast is the layout changing → burst */
    if (prev) {
      let ch = 0; for (let j = 0; j < 4; j++) ch += Math.abs(st[j][0] - prev[j][0]) + Math.abs(st[j][1] - prev[j][1]) + Math.abs(st[j][2] - prev[j][2]) * .6 + Math.abs(st[j][4] - prev[j][4]) * .25;
      cool -= dt;
      if (started && ch / dt > .8 && cool <= 0) { burst(st, u, 360 + Math.min(380, ch / dt * 60)); cool = 1.6; }
    }
    prev = st.map(r => r.slice()); started = true;

    for (let i = 0; i < NR; i++) {
      const r = st[ring[i]], k = i * 3, R = r[2] * u, inner = r[3] * R, mid = (R + inner) / 2, band = Math.max(6, (R - inner) / 2);
      ang[i] += spd[i] * dt;
      const rr = mid + rad[i] * band * .85, tx = r[0] * W - W / 2 + Math.cos(ang[i]) * rr, ty = H / 2 - r[1] * H + Math.sin(ang[i]) * rr, tz = zo[i];
      if (free[i] > 0) { free[i] -= dt; vel[k + 1] -= G * dt; vel[k] *= .995; }
      else {
        vel[k] += (tx - pos[k]) * 26 * dt; vel[k + 1] += (ty - pos[k + 1]) * 26 * dt; vel[k + 2] += (tz - pos[k + 2]) * 26 * dt;
        const dx = pos[k] - px, dy = pos[k + 1] - py, d2 = dx * dx + dy * dy;
        if (d2 < 16900) { const d = Math.sqrt(d2) || 1, f = (1 - d / 130) * 5200 * dt; vel[k] += dx / d * f; vel[k + 1] += dy / d * f; vel[k + 2] += f * .5; }
        const dm = Math.pow(.0009, dt); vel[k] *= dm; vel[k + 1] *= dm; vel[k + 2] *= dm;
      }
      pos[k] += vel[k] * dt; pos[k + 1] += vel[k + 1] * dt; pos[k + 2] += vel[k + 2] * dt;
      const big = R > Math.max(W, H) * .9 ? .35 : 1;
      alpha[i] += (Math.min(1, r[4] * 1.3) * .7 * big - alpha[i]) * .06;
    }
    /* dust: scroll flies the camera through it */
    const ds = scrollY - sy; sy = scrollY;
    for (let k = 0; k < ND; k++) {
      const i = (NR + k) * 3; pos[i + 2] += ds * .9 + 14 * dt; pos[i + 1] += ds * .12;
      if (pos[i + 2] > 320) pos[i + 2] -= 1900; else if (pos[i + 2] < -1600) pos[i + 2] += 1900;
      if (pos[i + 1] > H * 1.2) pos[i + 1] -= H * 2.4; else if (pos[i + 1] < -H * 1.2) pos[i + 1] += H * 2.4;
    }
    /* click bursts: ballistic */
    for (let j = 0; j < NB; j++) {
      if (life[j] <= 0) continue; const i = NR + ND + j, k = i * 3;
      life[j] -= dt / 1.7; vel[k + 1] -= G * .8 * dt;
      pos[k] += vel[k] * dt; pos[k + 1] += vel[k + 1] * dt; pos[k + 2] += vel[k + 2] * dt;
      alpha[i] = Math.max(0, life[j]) * .95;
    }
    geo.attributes.position.needsUpdate = true; geo.attributes.aAlpha.needsUpdate = true;
    renderer.render(scene, cam);
  };
  requestAnimationFrame(frame);
  LK.emit = emit;
}
