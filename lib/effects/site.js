/* 画面全体の演出（輪・波紋・スクロール連動・ページ遷移）。DOM を直接操作するため、ページ読み込みごとに一度だけ呼ぶ。 */
export function initSite() {
  const page = (document.querySelector('main') || document.body).dataset.page, variant = 'ring';
  const reduced = matchMedia('(prefers-reduced-motion:reduce)').matches;
  const qs = new URLSearchParams(location.search);


  document.querySelectorAll('.hd nav a').forEach(a => { if (a.dataset.nav === page) a.setAttribute('aria-current', 'page'); });
  const hd = document.querySelector('.hd'), mb = document.querySelector('.mb'), mm = document.getElementById('mm');
  mb.addEventListener('click', () => { const o = mm.classList.toggle('open'); mb.setAttribute('aria-expanded', o); });
  mm.addEventListener('click', e => { if (e.target.closest('a')) { mm.classList.remove('open'); mb.setAttribute('aria-expanded', false); } });


  const V = {};
  const pinOn = matchMedia('(min-width:901px) and (prefers-reduced-motion:no-preference)').matches;
  const clamp = v => v < 0 ? 0 : v > 1 ? 1 : v;

  /* ---------- rings ---------- */
  const svg = document.getElementById('stage');
  const NS = 'http://www.w3.org/2000/svg';
  const circles = [0, 1, 2, 3].map(() => svg.appendChild(document.createElementNS(NS, 'circle')));
  let vw = 0, vh = 0, keys = [], mobile = false;
  const H1 = [.5, .5, .1, .6, 0], HIDE = [H1, H1, H1, H1];
  const I0 = [.5, .5, .034, .64, 0], INTRO = [[.5, .5, .034, .64, 1], I0, I0, I0];
  const parse = el => { try { const a = JSON.parse((mobile && el.dataset.ringsM) || el.dataset.rings); while (a.length < 4) a.push(H1); return a; } catch (e) { return HIDE; } };
  const measure = () => {
    vw = innerWidth; vh = innerHeight; mobile = vw < 900; if (V.measure) V.measure();
    svg.setAttribute('viewBox', `0 0 ${vw} ${vh}`);
    keys = [];
    document.querySelectorAll('[data-rings]').forEach(el => {
      const r = el.getBoundingClientRect(), top = r.top + scrollY;
      if (el.dataset.ringsSteps && pinOn && !mobile) {
        const st = JSON.parse(el.dataset.ringsSteps), span = r.height - vh;
        st.forEach((a, i) => { while (a.length < 4) a.push(H1); keys.push({ a: top + vh / 2 + span * i / (st.length - 1), s: a }); });
      } else keys.push({ a: top + Math.min(r.height, vh) / 2, s: parse(el) });
    });
  };
  const ease = t => t < 0 ? 0 : t > 1 ? 1 : t * t * (3 - 2 * t);
  const easeIO = t => t < .5 ? 16 * t ** 5 : 1 - (-2 * t + 2) ** 5 / 2;
  const mix = (A, B, t) => A.map((r, i) => r.map((v, j) => v + (B[i][j] - v) * t));
  const target = () => {
    if (!keys.length) return HIDE;
    const y = scrollY + vh / 2;
    if (y <= keys[0].a) return keys[0].s;
    for (let i = 0; i < keys.length - 1; i++) {
      const a = keys[i], b = keys[i + 1];
      if (y < b.a) { const win = Math.min(b.a - a.a, vh * .85); return mix(a.s, b.s, ease((y - (b.a - win)) / win)); }
    }
    return keys[keys.length - 1].s;
  };
  let cur = null, mx = 0, my = 0, tmx = 0, tmy = 0;
  const draw = st => {
    const u = mobile ? vw : vh;
    st.forEach((r, i) => {
      const [x, y, R, k, o] = r, c = circles[i], d = (i + 1) * 9;
      c.setAttribute('cx', x * vw + mx * d); c.setAttribute('cy', y * vh + my * d);
      c.setAttribute('r', Math.max(0, R * u * (1 + k) / 2)); c.setAttribute('stroke-width', Math.max(0, R * u * (1 - k)));
      c.style.opacity = o;
    });
  };
  addEventListener('pointermove', e => { if (e.pointerType === 'mouse') { tmx = e.clientX / vw - .5; tmy = e.clientY / vh - .5; } }, { passive: true });

  /* ---------- intro (top, first visit) ---------- */
  let seen = false; try { seen = !!sessionStorage.getItem('lk-seen'); } catch (e) {}
  const introOn = variant === 'ring' && page === 'top' && !reduced && !seen && !qs.has('nointro') && scrollY < 10;
  let introT0 = 0;
  const endIntro = () => { introT0 = -1; document.body.classList.remove('intro'); document.body.classList.add('ready'); circles[0].removeAttribute('stroke-dasharray'); circles[0].removeAttribute('stroke-dashoffset'); try { sessionStorage.setItem('lk-seen', '1'); } catch (e) {} };
  if (introOn) {
    document.body.classList.add('intro');
    document.body.insertAdjacentHTML('beforeend', '<div class="intro-mark" aria-hidden="true"><span>Linkle</span></div>');
    ['pointerdown', 'keydown', 'wheel', 'touchstart'].forEach(ev => addEventListener(ev, () => { if (introT0 > 0) { cur = keys[0].s; endIntro(); } }, { once: true, passive: true }));
  } else requestAnimationFrame(() => document.body.classList.add('ready'));

  /* ---------- scroll-linked bits ---------- */
  const scrubs = [...document.querySelectorAll('[data-scrub]')].map(el => {
    const text = el.textContent.trim(); el.setAttribute('aria-label', text); el.textContent = '';
    const spans = [...text].map(ch => { const s = document.createElement('span'); s.textContent = ch; s.setAttribute('aria-hidden', 'true'); el.appendChild(s); return s; });
    return { el, spans, n: -1 };
  });
  const steps = [...document.querySelectorAll('.svc-step')], idx = [...document.querySelectorAll('.svc-idx li')];
  const secs = [...document.querySelectorAll('[data-sec]')];
  const progC = document.querySelector('.prog circle+circle'), progN = document.querySelector('.prog span');
  const pins = [...document.querySelectorAll('[data-pin]')], hsTrack = document.querySelector('.hs-track'), hsNum = document.querySelector('.hs-count b');
  const flowLi = [...document.querySelectorAll('.fl .flow li')], heroW = document.querySelector('.hero > .wrap');
  const mqs = [...document.querySelectorAll('.mq div')]; mqs.forEach(m => { m.innerHTML += m.innerHTML; });
  const onScroll = () => {
    hd.classList.toggle('scrolled', scrollY > 40);
    const max = document.documentElement.scrollHeight - vh;
    progC.style.strokeDashoffset = 144.5 * (1 - (max > 0 ? scrollY / max : 0));
    let n = 1; secs.forEach((s, i) => { if (s.getBoundingClientRect().top < vh * .5) n = i + 1; });
    progN.textContent = String(n).padStart(2, '0');
    scrubs.forEach(s => {
      const r = s.el.getBoundingClientRect();
      const pw = pinOn && s.el.closest('[data-pin]');
      const p = pw ? clamp((-pw.getBoundingClientRect().top + vh * .25) / (pw.offsetHeight - vh) * 1.12) : Math.max(0, Math.min(1, (vh * .82 - r.top) / (r.height + vh * .38)));
      const k = reduced ? s.spans.length : Math.round(p * s.spans.length);
      if (k !== s.n) { s.spans.forEach((sp, i) => sp.classList.toggle('on', i < k)); s.n = k; }
    });
    if (V.scroll) V.scroll();
    let act = 0; steps.forEach((s, i) => { if (s.getBoundingClientRect().top < vh * .55) act = i; });
    pins.forEach(sec => {
      const r = sec.getBoundingClientRect(), span = r.height - vh, p = pinOn && span > vh * .1 ? clamp(-r.top / span) : 1, t = sec.dataset.pin;
      sec.style.setProperty('--q', clamp(p * (t === 'flow' ? 1.2 : 1.9)));
      if (t === 'hs' && pinOn) {
        const n = steps.length, f = p * (n - 1), i = Math.min(n - 2, Math.floor(f)), e = ease((f - i - .3) / .4);
        const step = steps[1].offsetLeft - steps[0].offsetLeft;
        hsTrack.style.transform = `translate3d(${-(i + e) * step}px,0,0)`;
        act = Math.round(i + e); if (hsNum) hsNum.textContent = String(act + 1).padStart(2, '0');
      }
      if (t === 'flow') flowLi.forEach((li, i) => li.classList.toggle('on', !pinOn || p * 4.5 > i + .25));
    });
    steps.forEach((s, i) => s.classList.toggle('on', i === act));
    idx.forEach((li, i) => li.classList.toggle('on', i === act));
    if (pinOn && heroW) { const k = clamp(scrollY / vh); heroW.style.transform = `translate3d(0,${-k * 90}px,0)`; heroW.style.opacity = 1 - k * 1.25; }
    mqs.forEach((m, i) => { const w = m.scrollWidth / 2 || 1, x = (scrollY * .45) % w; m.style.transform = `translate3d(${i % 2 ? x - w : -x}px,0,0)`; });
  };
  addEventListener('scroll', onScroll, { passive: true });

  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -12% 0px' });
  document.querySelectorAll('[data-rv]').forEach(e => io.observe(e));

  /* ---------- ripples (background) ---------- */
  const rip = document.createElement('canvas'); rip.id = 'rip'; rip.setAttribute('aria-hidden', 'true');
  document.body.insertBefore(rip, document.body.firstChild);
  const rc = rip.getContext('2d'); let rcx = .78, rcy = .5, drops = [], lastD = 0, lx = 0, ly = 0;
  const ripSize = () => { const d = Math.min(2, devicePixelRatio || 1); rip.width = innerWidth * d; rip.height = innerHeight * d; rc.setTransform(d, 0, 0, d, 0, 0); };
  ripSize(); addEventListener('resize', ripSize);
  const drawRip = now => {
    const W = innerWidth, Hh = innerHeight; rc.clearRect(0, 0, W, Hh);
    let tx, ty;
    if (variant === 'ring' && cur) { tx = cur[0][0]; ty = cur[0][1]; }
    else { let n = 0; secs.forEach((s, i) => { if (s.getBoundingClientRect().top < Hh * .5) n = i; }); tx = n % 2 ? .2 : .8; ty = .5; }
    rcx += (tx - rcx) * .04; rcy += (ty - rcy) * .04;
    const N = 30, gap = Math.max(W, Hh) * .042, maxR = N * gap, ph = reduced ? 0 : (now * .00006) % 1;
    rc.lineWidth = 1;
    for (let k = 0; k < N; k++) {
      const r = (k + ph) * gap, a = .2 * Math.pow(1 - r / maxR, 1.6);
      rc.strokeStyle = `rgba(31,111,147,${a})`; rc.beginPath(); rc.arc(rcx * W + mx * 14, rcy * Hh + my * 14, r, 0, 6.2832); rc.stroke();
    }
    drops = drops.filter(d => now - d.t < 1900);
    drops.forEach(d => { const age = (now - d.t) / 1900; for (let j = 0; j < 3; j++) { const r = age * d.s - j * 26; if (r <= 0) continue; rc.lineWidth = 1.5; rc.strokeStyle = `rgba(108,202,241,${(1 - age) * (.75 - j * .2)})`; rc.beginPath(); rc.arc(d.x, d.y, r, 0, 6.2832); rc.stroke(); } });
  };
  const cursor = document.createElement('div'); cursor.className = 'cur'; cursor.setAttribute('aria-hidden', 'true'); document.body.appendChild(cursor);
  let cx = 0, cy = 0, ctx2 = 0, cty = 0;
  addEventListener('pointermove', e => {
    if (e.pointerType !== 'mouse') return;
    ctx2 = e.clientX; cty = e.clientY; cursor.classList.add('show');
    cursor.classList.toggle('act', !!e.target.closest('a,button,summary'));
    const now = performance.now();
    if (!reduced && now - lastD > 150 && Math.hypot(e.clientX - lx, e.clientY - ly) > 46) { drops.push({ x: e.clientX, y: e.clientY, t: now, s: 150 }); lastD = now; lx = e.clientX; ly = e.clientY; }
  }, { passive: true });
  addEventListener('pointerdown', e => { if (!reduced) drops.push({ x: e.clientX, y: e.clientY, t: performance.now(), s: 420 }); }, { passive: true });

  /* ---------- loop ---------- */
  const frame = now => {
    mx += (tmx - mx) * .06; my += (tmy - my) * .06;
    cx += (ctx2 - cx) * .22; cy += (cty - cy) * .22; cursor.style.transform = `translate3d(${cx}px,${cy}px,0)`;
    drawRip(now);
    if (introOn && introT0 >= 0) {
      if (!introT0) introT0 = now;
      const t = now - introT0, R = INTRO[0][2] * (mobile ? vw : vh) * (1 + INTRO[0][3]) / 2, C = 2 * Math.PI * R;
      const hero = keys[0].s;
      if (t < 800) { cur = INTRO; draw(cur); circles[0].setAttribute('stroke-dasharray', C); circles[0].setAttribute('stroke-dashoffset', C * (1 - easeIO(t / 800))); }
      else {
        circles[0].removeAttribute('stroke-dasharray');
        const p = Math.min(1, (t - 1000) / 1300);
        if (t > 1000) document.querySelector('.intro-mark').style.opacity = 0;
        if (t > 1350) document.body.classList.add('ready');
        cur = mix(INTRO, hero, easeIO(Math.max(0, p))); draw(cur);
        if (p >= 1) endIntro();
      }
    } else if (variant !== 'ring') { if (V.frame) V.frame(now); }
    else {
      const tg = target();
      cur = cur && !reduced ? mix(cur, tg, .11) : tg;
      draw(cur);
    }
    requestAnimationFrame(frame);
  };
  window.LK = { variant, reduced, state: () => cur, unit: () => (mobile ? vw : vh) };
  const init = () => { measure(); onScroll(); };
  addEventListener('resize', init); addEventListener('load', init);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(init);
  init(); requestAnimationFrame(frame);

  /* ---------- page transition ---------- */
  const cover = document.getElementById('cover');
  requestAnimationFrame(() => requestAnimationFrame(() => { document.documentElement.classList.remove('pt'); try { sessionStorage.removeItem('lk-pt'); } catch (e) {} }));
  addEventListener('pageshow', e => { if (e.persisted) { cover.classList.remove('out'); document.documentElement.classList.remove('pt'); } });
  document.addEventListener('click', e => {
    const a = e.target.closest('a'); if (!a) return;
    const href = a.getAttribute('href');
    if (a.hasAttribute('data-guide')) { e.preventDefault(); mm.classList.remove('open'); mb.setAttribute('aria-expanded', false); window.dispatchEvent(new CustomEvent('lk:guide')); return; }
    if (href === '#') { e.preventDefault(); return; }
    if (!href || href[0] === '#' || a.target === '_blank' || e.metaKey || e.ctrlKey || e.shiftKey || reduced) return;
    const u = new URL(a.href);
    const norm = x => x.replace(/\/+$/, '');
    if (u.origin !== location.origin || (norm(u.pathname) === norm(location.pathname) && u.hash)) return;
    e.preventDefault();
    cover.style.setProperty('--cx', e.clientX + 'px'); cover.style.setProperty('--cy', e.clientY + 'px');
    cover.style.clipPath = `circle(0 at ${e.clientX}px ${e.clientY}px)`; cover.style.transition = 'none';
    requestAnimationFrame(() => requestAnimationFrame(() => { cover.style.clipPath = ''; cover.style.transition = ''; cover.classList.add('out'); }));
    try { sessionStorage.setItem('lk-pt', '1'); } catch (e2) {}
    setTimeout(() => { location.href = a.href; }, 520);
  });
  return window.LK;
}
