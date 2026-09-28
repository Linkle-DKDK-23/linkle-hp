import React, { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { useMotionPrefs } from '../../lib/motion/MotionPrefsProvider';
import { useWrapperInView } from '../../lib/scroll/useWrapperInView';

/**
 * G15': 粒子の液体（Canvas2D）。参照: lusion 録画 2026-09-28 23.44.54（"Let's work together!" 面）。
 *
 * 白いグリフ粒（○ ■ ▲ + ×）が画面下部（高さの depth 割）に砂のように溜まっている。
 * カーソルが通ると、その速度方向 + 上向きに粒が跳ね上がって流れ（カーソルの軌跡に沿った帯になる）、
 * 重力で落ちて再び平らに落ち着く。持ち上がった塊の下には濃い青の影が滲む。
 *
 * 実装: Verlet 積分 + 空間ハッシュの粒子間分離拘束（粒同士が重ならない = 砂・液体の質感）。
 * - 初期状態は六方格子で「すでに落ち着いた」形にしておき、セクションに入った瞬間に左→右へ一度だけ波を通す。
 * - ref.burst(): 中央から全体が噴き上がる（送信完了などの演出用）。
 * - active=false: 自動の波・カーソル反応はせず、burst() のみ。
 * - reduced motion: 落ち着いた状態を 1 フレーム描いて停止。
 */
const TYPES = ['circle', 'square', 'tri', 'plus', 'cross'];
const ROTS = 8;
const rand = (a, b) => a + Math.random() * (b - a);

function makeSprites(size, dpr) {
  const box = Math.ceil(size * 1.9);
  const out = TYPES.map((type) => Array.from({ length: ROTS }, (_, ri) => {
    const c = document.createElement('canvas');
    c.width = box * dpr; c.height = box * dpr;
    const g = c.getContext('2d');
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.translate(box / 2, box / 2);
    const sym = type === 'square' || type === 'plus' || type === 'cross' ? Math.PI / 2 : type === 'tri' ? (Math.PI * 2) / 3 : Math.PI * 2;
    g.rotate((ri / ROTS) * sym + (type === 'cross' ? Math.PI / 4 : 0));
    g.fillStyle = '#fff';
    if (type === 'circle') {
      g.beginPath(); g.arc(0, 0, size * 0.5, 0, Math.PI * 2); g.fill();
    } else if (type === 'square') {
      g.fillRect(-size * 0.46, -size * 0.46, size * 0.92, size * 0.92);
    } else if (type === 'tri') {
      const R = size * 0.62;
      g.beginPath();
      for (let i = 0; i < 3; i += 1) {
        const a = -Math.PI / 2 + (i * Math.PI * 2) / 3;
        g[i ? 'lineTo' : 'moveTo'](Math.cos(a) * R, Math.sin(a) * R);
      }
      g.closePath(); g.fill();
    } else {
      const L = size * 1.1; const w = size * 0.26;
      g.fillRect(-L / 2, -w / 2, L, w);
      g.fillRect(-w / 2, -L / 2, w, L);
    }
    return c;
  }));
  return { sprites: out, box };
}

const DotLiquid = forwardRef(function DotLiquid({ active = true, depth: depthProp }, ref) {
  const canvasRef = useRef(null);
  const { isMobile, reducedMotion } = useMotionPrefs();
  const inView = useWrapperInView(canvasRef, { amount: 0.15 });
  const burstRef = useRef(() => {});
  const sweepRef = useRef({ armed: true, t0: 0 });

  useImperativeHandle(ref, () => ({ burst: () => burstRef.current() }), []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas && canvas.getContext('2d');
    if (!ctx) return undefined;
    const DPR = Math.min(1.5, window.devicePixelRatio || 1);
    const spacing = isMobile ? 15 : 17;      // 粒の間隔（= 最小距離）
    const glyph = isMobile ? 7.5 : 8.5;      // グリフの大きさ
    const depth = depthProp ?? (isMobile ? 0.3 : 0.38);
    const MAX = isMobile ? 1100 : 2600;
    const { sprites, box } = makeSprites(glyph, DPR);

    let W = 0; let H = 0; let bedH = 0;
    let parts = [];
    let cols = 0; let rows = 0;
    let head = new Int32Array(0);
    let next = new Int32Array(0);
    const wake = []; // 濃い青の影（カーソルの軌跡）

    const init = () => {
      W = canvas.clientWidth; H = canvas.clientHeight;
      canvas.width = W * DPR; canvas.height = H * DPR;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      bedH = H * depth;
      const nRows = Math.max(3, Math.round(bedH / (spacing * 0.87)));
      const nCols = Math.floor(W / spacing) + 2;
      parts = [];
      for (let r = 0; r < nRows && parts.length < MAX; r += 1) {
        for (let c = 0; c < nCols && parts.length < MAX; c += 1) {
          const x = c * spacing + (r % 2 ? spacing / 2 : 0) + rand(-1.5, 1.5) - spacing / 2;
          const y = H - spacing * 0.5 - r * spacing * 0.87 + rand(-1.5, 1.5);
          parts.push({ x, y, ox: x, oy: y, t: Math.floor(Math.random() * TYPES.length), r: Math.floor(Math.random() * ROTS) });
        }
      }
      cols = Math.ceil(W / spacing) + 2;
      rows = Math.ceil(H / spacing) + 2;
      head = new Int32Array(cols * rows);
      next = new Int32Array(parts.length);
    };
    init();

    // カーソル（canvas 座標）。速度は px/s（平滑化）
    const cur = { x: 0, y: 0, vx: 0, vy: 0, inside: false, at: 0 };
    const onMove = (e) => {
      const b = canvas.getBoundingClientRect();
      const x = e.clientX - b.left; const y = e.clientY - b.top;
      const now = performance.now();
      const dtm = Math.max(8, now - cur.at) / 1000;
      if (cur.inside && cur.at) {
        const vx = (x - cur.x) / dtm; const vy = (y - cur.y) / dtm;
        cur.vx += (vx - cur.vx) * 0.5; cur.vy += (vy - cur.vy) * 0.5;
      }
      cur.x = x; cur.y = y; cur.at = now;
      cur.inside = x >= 0 && x <= W && y >= 0 && y <= H;
    };
    const onLeave = () => { cur.inside = false; cur.vx = 0; cur.vy = 0; };
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerleave', onLeave);
    document.addEventListener('pointercancel', onLeave);

    /** カーソル（または仮想カーソル）の周りの粒に力を加える */
    const stir = (cx, cy, vx, vy, h, power) => {
      const R = Math.max(90, H * 0.14);
      const R2 = R * R;
      const sp = Math.hypot(vx, vy);
      const k = Math.min(1, sp / 1800); // 速いほど強く
      const cvx = sp > 2600 ? (vx / sp) * 2600 : vx;
      const cvy = sp > 2600 ? (vy / sp) * 2600 : vy;
      for (let i = 0; i < parts.length; i += 1) {
        const p = parts[i];
        const dx = p.x - cx; const dy = p.y - cy;
        const d2 = dx * dx + dy * dy;
        if (d2 >= R2) continue;
        const d = Math.sqrt(d2) || 1;
        const f = (1 - d / R) ** 1.5 * power;
        // カーソル速度に引きずられる（軌跡に沿った帯になる）+ 上へ噴き上がる + 放射状に押し出す
        const ax = (cvx * 30 + (dx / d) * (1200 + 3000 * k)) * f;
        const ay = (cvy * 30 - 4200 * k - 600 + (dy / d) * (1200 + 3000 * k)) * f;
        p.x += ax * h * h; p.y += ay * h * h;
      }
      if (k > 0.05 && cy > H - bedH - R * 0.5) wake.push({ x: cx, y: cy, t: performance.now(), s: k });
    };

    burstRef.current = () => {
      for (let i = 0; i < parts.length; i += 1) {
        const p = parts[i];
        const cxn = (p.x - W / 2) / (W / 2);
        const up = rand(10, 30) * (1 - Math.abs(cxn) * 0.55);
        p.oy = p.y + up; p.ox = p.x - cxn * rand(2, 9);
      }
      wake.push({ x: W / 2, y: H - bedH * 0.5, t: performance.now(), s: 1.4 });
    };

    const step = (h) => {
      const g = H * 2.6;
      const damp = 0.985;
      const floor = H - glyph * 0.5;
      // 積分
      for (let i = 0; i < parts.length; i += 1) {
        const p = parts[i];
        const vx = (p.x - p.ox) * damp; const vy = (p.y - p.oy) * damp;
        p.ox = p.x; p.oy = p.y;
        p.x += vx; p.y += vy + g * h * h;
      }
      // 空間ハッシュ
      head.fill(-1);
      for (let i = 0; i < parts.length; i += 1) {
        const p = parts[i];
        const cx = Math.min(cols - 1, Math.max(0, Math.floor(p.x / spacing) + 1));
        const cy = Math.min(rows - 1, Math.max(0, Math.floor(p.y / spacing) + 1));
        const key = cy * cols + cx;
        next[i] = head[key]; head[key] = i;
      }
      // 分離拘束（最小距離 = spacing）
      const min = spacing; const min2 = min * min;
      for (let i = 0; i < parts.length; i += 1) {
        const p = parts[i];
        const cx = Math.min(cols - 1, Math.max(0, Math.floor(p.x / spacing) + 1));
        const cy = Math.min(rows - 1, Math.max(0, Math.floor(p.y / spacing) + 1));
        for (let oy = -1; oy <= 1; oy += 1) {
          const yy = cy + oy; if (yy < 0 || yy >= rows) continue;
          for (let ox = -1; ox <= 1; ox += 1) {
            const xx = cx + ox; if (xx < 0 || xx >= cols) continue;
            for (let j = head[yy * cols + xx]; j !== -1; j = next[j]) {
              if (j <= i) continue;
              const q = parts[j];
              const dx = q.x - p.x; const dy = q.y - p.y;
              const d2 = dx * dx + dy * dy;
              if (d2 >= min2 || d2 === 0) continue;
              const d = Math.sqrt(d2);
              const push = ((min - d) / d) * 0.5 * 0.7;
              const mx = dx * push; const my = dy * push;
              p.x -= mx; p.y -= my; q.x += mx; q.y += my;
            }
          }
        }
      }
      // 床・壁（床では横方向に摩擦）
      for (let i = 0; i < parts.length; i += 1) {
        const p = parts[i];
        if (p.y > floor) { p.y = floor; p.ox = p.x - (p.x - p.ox) * 0.6; p.oy = p.y + (p.y - p.oy) * 0.15; }
        if (p.x < glyph * 0.5) { p.x = glyph * 0.5; p.ox = p.x + (p.x - p.ox) * 0.3; }
        if (p.x > W - glyph * 0.5) { p.x = W - glyph * 0.5; p.ox = p.x + (p.x - p.ox) * 0.3; }
        if (p.y < -H) p.y = -H;
      }
    };

    const draw = (now) => {
      ctx.clearRect(0, 0, W, H);
      // 影: 持ち上がった塊の下に濃い青が滲む
      for (let i = wake.length - 1; i >= 0; i -= 1) {
        const w = wake[i];
        const age = (now - w.t) / 1300;
        if (age >= 1) { wake.splice(i, 1); continue; }
        // SP は画面に対して影が大きく重くなるので半径・濃さを抑える
        const R = Math.max(70, H * (isMobile ? 0.085 : 0.13)) * (0.8 + 0.6 * age) * Math.min(1.4, 0.7 + w.s);
        const a = (isMobile ? 0.2 : 0.28) * (1 - age) * Math.min(1, w.s + 0.3);
        const gr = ctx.createRadialGradient(w.x, w.y + R * 0.25, 0, w.x, w.y + R * 0.25, R);
        gr.addColorStop(0, `rgba(8,60,110,${a})`);
        gr.addColorStop(1, 'rgba(8,60,110,0)');
        ctx.fillStyle = gr;
        ctx.fillRect(w.x - R, w.y - R, R * 2, R * 2.2);
      }
      const half = box / 2;
      for (let i = 0; i < parts.length; i += 1) {
        const p = parts[i];
        if (p.y < -half) continue;
        ctx.drawImage(sprites[p.t][p.r], p.x - half, p.y - half, box, box);
      }
    };

    if (reducedMotion) {
      draw(performance.now());
      return () => {
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerleave', onLeave);
        document.removeEventListener('pointercancel', onLeave);
      };
    }

    let raf = 0;
    let last = performance.now();
    let acc = 0;
    const FIXED = 1 / 120;
    const frame = (now) => {
      raf = requestAnimationFrame(frame);
      acc += Math.min(0.05, (now - last) / 1000);
      last = now;
      // 減衰した速度は捨てる（カーソルが止まったら押さない）
      if (now - cur.at > 120) { cur.vx *= 0.7; cur.vy *= 0.7; }
      let n = 0;
      while (acc >= FIXED && n < 4) {
        acc -= FIXED; n += 1;
        if (active) {
          if (cur.inside) stir(cur.x, cur.y, cur.vx, cur.vy, FIXED, 1);
          const sw = sweepRef.current;
          if (sw.t0) {
            const t = (now - sw.t0) / 1000;
            if (t > 1.1) sw.t0 = 0;
            else stir(W * (t / 1.1) * 1.1 - W * 0.05, H - bedH * 0.6 + Math.sin(t * 9) * bedH * 0.15, W / 1.1, -300, FIXED, 0.8);
          }
        }
        step(FIXED);
      }
      draw(now);
    };

    let ro = 0;
    const onResize = () => { clearTimeout(ro); ro = setTimeout(init, 150); };
    window.addEventListener('resize', onResize);

    const start = () => { if (!raf) { last = performance.now(); acc = 0; raf = requestAnimationFrame(frame); } };
    const stop = () => { if (raf) cancelAnimationFrame(raf); raf = 0; };
    canvas.__dotLiquid = { start, stop };
    draw(performance.now());

    return () => {
      stop();
      clearTimeout(ro);
      delete canvas.__dotLiquid;
      window.removeEventListener('resize', onResize);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerleave', onLeave);
      document.removeEventListener('pointercancel', onLeave);
    };
  }, [isMobile, reducedMotion, active, depthProp]);

  // 可視の間だけ回す。初めて見えた瞬間に左→右の波を一度通す
  useEffect(() => {
    const ctl = canvasRef.current && canvasRef.current.__dotLiquid;
    if (!ctl) return;
    if (inView) {
      if (active && sweepRef.current.armed) { sweepRef.current.armed = false; sweepRef.current.t0 = performance.now(); }
      ctl.start();
    } else {
      ctl.stop();
    }
  }, [inView, active, isMobile, reducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ pointerEvents: 'none', zIndex: 1 }}
      aria-hidden="true"
    />
  );
});

export default DotLiquid;
