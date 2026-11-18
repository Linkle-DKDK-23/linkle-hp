/* Linkle — renewal mock D : shared behaviour (no dependencies) */
(() => {
  const GUIDE = 'https://guide.linkle.group/read.html';
  const page = document.body.dataset.page, variant = document.body.dataset.variant || 'ring';
  const reduced = matchMedia('(prefers-reduced-motion:reduce)').matches;
  const qs = new URLSearchParams(location.search);
  const AR = '<svg class="ar" viewBox="0 0 14 10" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M0 5h12.5M8.5 1l4 4-4 4"/></svg>';
  const RING = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9.2" fill="none" stroke="#6ccaf1" stroke-width="3.4"/></svg>';
  document.querySelectorAll('[data-ar]').forEach(e => e.insertAdjacentHTML('beforeend', AR));


  /* ---------- header / footer ---------- */
  const NAV = [['service.html', '事業内容', 'service'], ['construction.html', '建設業向け', 'construction'], ['#', '開発事例'], ['#', '会社概要'], ['#', '採用']];
  const navHtml = NAV.map(([h, t, k]) => `<a href="${h}"${k === page ? ' aria-current="page"' : ''}>${t}</a>`).join('');
  document.body.insertAdjacentHTML('afterbegin', `
<header class="hd">
  <a class="logo" href="index.html" aria-label="Linkle トップへ">${RING}<span>Linkle</span></a>
  <nav aria-label="メイン">${navHtml}</nav>
  <div class="hd-cta"><a class="tl plain" href="${GUIDE}" target="_blank" rel="noopener">資料を見る</a><a class="btn sm" href="contact.html">相談する</a></div>
  <button class="mb" aria-label="メニュー" aria-expanded="false"><i></i></button>
</header>
<div class="mm" id="mm">${navHtml}<a href="${GUIDE}" target="_blank" rel="noopener">資料を見る</a><a class="btn" href="contact.html">相談する</a></div>
<div class="prog" aria-hidden="true"><svg viewBox="0 0 52 52"><circle cx="26" cy="26" r="23"/><circle cx="26" cy="26" r="23"/></svg><span class="num">01</span></div>`);
  document.body.insertAdjacentHTML('beforeend', `
<footer class="ft"><div class="wrap">
  <div class="ft-top">
    <div><a class="logo" href="index.html">${RING}<span>Linkle</span></a>
      <address>Linkle株式会社<br>〒171-0021 東京都豊島区西池袋2-36-1<br>ソフトタウン池袋913号</address></div>
    <div><h4>SERVICE</h4><ul><li><a href="service.html#system">業務システム開発</a></li><li><a href="service.html#fde">FDE</a></li><li><a href="service.html#dx">DX支援・業務効率化</a></li><li><a href="service.html#web">Web制作</a></li><li><a href="construction.html">建設業向けシステム開発</a></li></ul></div>
    <div><h4>COMPANY</h4><ul><li><a href="#">会社概要</a></li><li><a href="#">開発事例</a></li><li><a href="#">ニュース</a></li><li><a href="#">採用</a></li></ul></div>
    <div><h4>CONTACT</h4><ul><li><a href="contact.html">相談する</a></li><li><a href="${GUIDE}" target="_blank" rel="noopener">資料を見る</a></li></ul></div>
  </div>
  <div class="ft-btm"><span>© 2026 Linkle Inc.</span><span>Tokyo, Japan</span></div>
</div></footer>`);

  const hd = document.querySelector('.hd'), mb = document.querySelector('.mb'), mm = document.getElementById('mm');
  mb.addEventListener('click', () => { const o = mm.classList.toggle('open'); mb.setAttribute('aria-expanded', o); });
  mm.addEventListener('click', e => { if (e.target.closest('a')) { mm.classList.remove('open'); mb.setAttribute('aria-expanded', false); } });


  /* ---------- variants ---------- */
  const V = {};
  const pinOn = matchMedia('(min-width:901px) and (prefers-reduced-motion:no-preference)').matches;
  const clamp = v => v < 0 ? 0 : v > 1 ? 1 : v;
  if (variant === 'line') {
    const NSV = 'http://www.w3.org/2000/svg';
    const ls = document.createElementNS(NSV, 'svg'); ls.id = 'line'; ls.setAttribute('aria-hidden', 'true');
    const lp = ls.appendChild(document.createElementNS(NSV, 'path'));
    document.body.insertBefore(ls, document.body.firstChild);
    let L = 0, tab = [], lcur = 0, STEP = 8;
    V.measure = () => {
      const W = document.documentElement.clientWidth, H = document.documentElement.scrollHeight, m = W < 900, h = innerHeight;
      ls.setAttribute('viewBox', `0 0 ${W} ${H}`); ls.style.height = H + 'px';
      const secs = [...document.querySelectorAll('[data-sec]')];
      let d = '', px = 0, py = 0, left = false;
      const G = m ? 90 : 170;
      secs.forEach((el, i) => {
        const r = el.getBoundingClientRect(), top = r.top + scrollY, last = i === secs.length - 1, big = !!el.querySelector('.focus') && !m;
        if (i === 0) {
          const R = m ? W * .27 : Math.min(h * .29, W * .2), x = m ? W * .5 : W * .6, y = top + Math.min(r.height, h) * (m ? .26 : .52);
          d += `M${W + 40},${y - R} L${x + R},${y - R} a${R},${R} 0 0 0 ${-R},${R} a${R},${R} 0 1 0 ${2 * R},0 a${R},${R} 0 1 0 ${-2 * R},0`;
          px = x; py = y;
          if (m) { const e = W * .975; d += ` C${x},${y + R * 1.4} ${e},${y + R * .6} ${e},${y + R * 2}`; px = e; py = y + R * 2; left = false; }
          return;
        }
        if (!big && !last) left = !left;
        const R = last ? Math.min(W * (m ? .44 : .3), h * .42) : big ? h * .25 : (m ? W * .1 : h * .07);
        const x = last ? W / 2 - R : (left && !big) ? W * .025 : W * (big ? .93 : .975);
        const y = top + Math.min(r.height, h) * .5, T = Math.max(py + 20, top - (last ? G : 0));
        d += ` L${px},${T - G} C${px},${T} ${x},${T} ${x},${T + G} L${x},${y}`;
        d += (left && !big) || last ? ` a${R},${R} 0 1 0 ${2 * R},0 a${R},${R} 0 1 0 ${-2 * R},0` : ` a${R},${R} 0 1 1 ${-2 * R},0 a${R},${R} 0 1 1 ${2 * R},0`;
        px = x; py = y;
      });
      lp.setAttribute('d', d); L = lp.getTotalLength();
      lp.style.strokeDasharray = L; tab = []; let mxy = -1e9;
      for (let l = 0; l <= L; l += STEP) { mxy = Math.max(mxy, lp.getPointAtLength(l).y); tab.push(mxy); }
    };
    V.frame = () => {
      const max = document.documentElement.scrollHeight - innerHeight, Y = scrollY + innerHeight * .92;
      let lo = 0, hi = tab.length - 1;
      while (lo < hi) { const mid = (lo + hi + 1) >> 1; if (tab[mid] <= Y) lo = mid; else hi = mid - 1; }
      const tg = scrollY >= max - 2 ? L : lo * STEP;
      lcur = reduced ? tg : lcur + (tg - lcur) * .07;
      lp.style.strokeDashoffset = Math.max(0, L - lcur);
    };
  }
  if (variant === 'tile') {
    const PAL = ['#6ccaf1', '#bfe6f8', '#e2f3fb', '#10181f'];
    const PATS = [
      'q2:1 _ s:2 q3:1  s:2 q0:0 q1:0 _  _ q3:0 q2:0 c:3  q1:1 s:2 _ q0:1',
      'q0:0 q1:1 q0:0 q1:1  q3:1 q2:0 q3:1 q2:0  c:3 _ s:2 _  q0:1 q1:0 q0:1 q1:0',
      's:2 q0:0 q1:0 _  q0:1 s:0 s:0 q1:1  q3:1 s:0 s:0 q2:1  c:3 q3:0 q2:0 s:2',
      'q0:0 q1:0 _ c:3  q3:0 q2:0 q0:1 q1:1  s:2 _ q3:1 q2:1  q2:0 q3:0 s:2 _',
    ].map(p => p.trim().split(/\s+/));
    const mk = (n, cls) => { const g = document.createElement('div'); g.className = cls; g.setAttribute('aria-hidden', 'true'); for (let i = 0; i < n; i++) { const t = document.createElement('i'); t.style.setProperty('--i', i); t._r = 0; g.appendChild(t); } return g; };
    const setT = (t, code) => {
      const [a, c] = code.split(':'), ty = a[0], want = +(a[1] || 0);
      t._r += ((want - t._r) % 4 + 4) % 4;
      t.style.borderRadius = ty === 'q' ? '100% 0 0 0' : ty === 'c' ? '50%' : '0';
      t.style.background = ty === '_' ? 'transparent' : PAL[+c || 0];
      t.style.transform = `rotate(${t._r * 90}deg) scale(${ty === '_' ? 0 : ty === 'c' ? .82 : 1})`;
    };
    const head = document.querySelector('.hero .wrap, .ph .wrap');
    const txt = document.createElement('div'); txt.className = 'hero-txt'; while (head.firstChild) txt.appendChild(head.firstChild);
    const mos = mk(16, 'mosaic'); head.append(txt, mos); head.classList.add('split');
    const all = [mos]; const fo = document.querySelector('.focus'); if (fo) { const m2 = mk(16, 'mosaic sm'); fo.appendChild(m2); all.push(m2); }
    let pi = page === 'top' ? 0 : page === 'service' ? 1 : 2;
    const apply = () => all.forEach((g, k) => [...g.children].forEach((t, i) => setT(t, PATS[(pi + k * 2) % PATS.length][i])));
    apply(); requestAnimationFrame(() => all.forEach(g => g.classList.add('in')));
    if (!reduced && !qs.has('still')) setInterval(() => { pi++; apply(); }, 3600);
    const strips = [...document.querySelectorAll('main > section.sec, main > section.iris, main > section.fl, main > section.cta')].map(sec => { const s = mk(innerWidth < 900 ? 8 : 16, 'strip'); sec.parentNode.insertBefore(s, sec); return s; });
    V.scroll = () => strips.forEach(s => {
      const r = s.getBoundingClientRect(); if (r.top > innerHeight || r.bottom < 0) return;
      const p = 1 - (r.top + r.height) / (innerHeight + r.height);
      [...s.children].forEach((t, i) => { const n = Math.floor(p * 7 + i * .45); if (n !== t._n) { t._n = n; t.style.transform = `rotate(${n * 90}deg)`; t.style.background = PAL[(i + (n >> 1)) % 3]; } });
    });
  }
  if (variant !== 'ring') document.getElementById('stage').style.display = 'none';

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

  /* ---------- guide request (name + email → open the guide) ---------- */
  document.body.insertAdjacentHTML('beforeend', `
<dialog class="gd" id="gd" aria-labelledby="gd-t">
  <button class="gd-x" type="button" aria-label="閉じる"></button>
  <div class="gd-form">
    <p class="label"><span class="num">GUIDE</span>サービス資料</p>
    <h2 id="gd-t">資料をご覧いただけます</h2>
    <p class="gd-lead">代表者名とメールアドレスをご入力ください。送信後、すぐに資料が開きます。</p>
    <form novalidate>
      <label>代表者名<input name="name" type="text" autocomplete="name" placeholder="山田 太郎" required></label>
      <p class="gd-err" data-for="name" role="alert"></p>
      <label>メールアドレス<input name="email" type="email" autocomplete="email" inputmode="email" placeholder="example@example.co.jp" required></label>
      <p class="gd-err" data-for="email" role="alert"></p>
      <button class="btn" type="submit">資料を見る${AR}</button>
      <p class="gd-note">ご入力いただいた情報は、資料のご案内とお問い合わせへの対応にのみ使用します。</p>
    </form>
  </div>
  <div class="gd-done" hidden>
    <h2>ありがとうございます</h2>
    <p class="gd-lead">資料を別のタブで開きました。開かない場合は、下のボタンからご覧ください。</p>
    <a class="btn" href="${GUIDE}" target="_blank" rel="noopener" data-direct>資料を開く${AR}</a>
  </div>
</dialog>`);
  const gd = document.getElementById('gd'), gf = gd.querySelector('form');
  const openGuide = () => {
    let ok = false; try { ok = !!sessionStorage.getItem('lk-guide'); } catch (e) {}
    if (ok) { window.open(GUIDE, '_blank', 'noopener'); return; }
    mm.classList.remove('open'); mb.setAttribute('aria-expanded', false);
    gd.showModal(); gf.elements.name.focus();
  };
  gd.querySelector('.gd-x').addEventListener('click', () => gd.close());
  gd.addEventListener('click', e => { if (e.target === gd) gd.close(); });
  gd.querySelector('[data-direct]').addEventListener('click', e => { e.stopPropagation(); gd.close(); });
  gf.addEventListener('submit', e => {
    e.preventDefault();
    const name = gf.elements.name.value.trim(), email = gf.elements.email.value.trim();
    const err = { name: name ? '' : '代表者名を入力してください', email: !email ? 'メールアドレスを入力してください' : /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) ? '' : '正しいメールアドレスを入力してください' };
    let bad = null;
    ['name', 'email'].forEach(k => { gd.querySelector(`[data-for=${k}]`).textContent = err[k]; gf.elements[k].setAttribute('aria-invalid', !!err[k]); if (err[k] && !bad) bad = k; });
    if (bad) { gf.elements[bad].focus(); return; }
    /* 本実装ではここで代表者名・メール・閲覧元ページを送信して記録する（モックでは送信しない） */
    try { sessionStorage.setItem('lk-guide', '1'); } catch (e2) {}
    window.open(GUIDE, '_blank', 'noopener');
    gd.querySelector('.gd-form').hidden = true; gd.querySelector('.gd-done').hidden = false;
  });

  /* ---------- contact form (mock: validates, does not send) ---------- */
  const cf = document.getElementById('cf');
  if (cf) {
    const k0 = qs.get('kind'); if (k0) { const r = cf.querySelector(`input[name=kind][value="${k0}"]`); if (r) r.checked = true; }
    cf.addEventListener('submit', e => {
      e.preventDefault();
      const v = n => (cf.elements[n].value || '').trim();
      const err = {
        kind: v('kind') ? '' : 'お問い合わせ種別を選択してください', name: v('name') ? '' : 'お名前を入力してください',
        email: !v('email') ? 'メールアドレスを入力してください' : /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v('email')) ? '' : '正しいメールアドレスを入力してください',
        message: v('message') ? '' : 'お問い合わせ内容を入力してください',
      };
      let bad = null;
      Object.keys(err).forEach(k => { cf.querySelector(`[data-for=${k}]`).textContent = err[k]; const el = cf.elements[k]; if (el && el.setAttribute) el.setAttribute('aria-invalid', !!err[k]); if (err[k] && !bad) bad = k; });
      if (bad) { const el = cf.elements[bad]; (el.focus ? el : el[0]).focus(); return; }
      cf.hidden = true; const d = document.getElementById('cf-done'); d.hidden = false; d.focus(); d.scrollIntoView({ block: 'center' });
    });
  }

  /* ---------- page transition ---------- */
  const cover = document.getElementById('cover');
  requestAnimationFrame(() => requestAnimationFrame(() => { document.documentElement.classList.remove('pt'); try { sessionStorage.removeItem('lk-pt'); } catch (e) {} }));
  addEventListener('pageshow', e => { if (e.persisted) { cover.classList.remove('out'); document.documentElement.classList.remove('pt'); } });
  document.addEventListener('click', e => {
    const a = e.target.closest('a'); if (!a) return;
    const href = a.getAttribute('href');
    if (href === GUIDE) { e.preventDefault(); openGuide(); return; }
    if (href === '#') { e.preventDefault(); return; }
    if (href === '#contact') { const c = document.getElementById('contact'); if (c) { e.preventDefault(); c.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' }); } return; }
    if (!href || href[0] === '#' || a.target === '_blank' || e.metaKey || e.ctrlKey || e.shiftKey || reduced) return;
    const u = new URL(a.href);
    if (u.origin !== location.origin || (u.pathname === location.pathname && u.hash)) return;
    e.preventDefault();
    cover.style.setProperty('--cx', e.clientX + 'px'); cover.style.setProperty('--cy', e.clientY + 'px');
    cover.style.clipPath = `circle(0 at ${e.clientX}px ${e.clientY}px)`; cover.style.transition = 'none';
    requestAnimationFrame(() => requestAnimationFrame(() => { cover.style.clipPath = ''; cover.style.transition = ''; cover.classList.add('out'); }));
    try { sessionStorage.setItem('lk-pt', '1'); } catch (e2) {}
    setTimeout(() => { location.href = a.href; }, 520);
  });
})();
