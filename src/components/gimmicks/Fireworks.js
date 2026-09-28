import React, { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { useMotionPrefs } from '../../lib/motion/MotionPrefsProvider';
import { useWrapperInView } from '../../lib/scroll/useWrapperInView';

/**
 * G15: 花火（Canvas2D）。ブランド面の下端から打ち上がり、画面上部 20〜45% で弾けて
 * カラフルな火花（`+ × ○ ・`）を散らす。旧「+ × ○ 噴水」の置き換え。
 *
 * - セクションに入った瞬間（Canvas の 50% が見えたら）に 1 発目を即打ち上げる。以降は rate に従う。
 * - rate: MotionValue（0〜1）。1 で約 1.4 秒に 1 発、0 で打ち上げ停止（飛んでいる火花は消えるまで描く）。
 * - active: false のとき自動打ち上げをしない（Contact のフォーム用）。
 * - ref.burst(): 3 発を続けて打ち上げる（送信完了時など）。
 * - reduced motion: 弾けた瞬間の火花を静止画として 3 発分描く。
 */
const PALETTE = ['#ffffff', '#fff23a', '#ff4fa3', '#ff7a1a', '#c6ff4a', '#7b5cff', '#0b3a56'];
const GLYPHS = ['+', '×', '○', '・'];

const rand = (a, b) => a + Math.random() * (b - a);
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

const Fireworks = forwardRef(function Fireworks({ rate, active = true }, ref) {
  const canvasRef = useRef(null);
  const rockets = useRef([]);
  const sparks = useRef([]);
  const flashes = useRef([]);
  const launchRef = useRef(() => {});
  const accRef = useRef(0); // 打ち上げ頻度の積算（1 で 1 発）
  const { isMobile, reducedMotion } = useMotionPrefs();
  const inView = useWrapperInView(canvasRef, { amount: 0.5 });

  useImperativeHandle(ref, () => ({
    burst: () => {
      launchRef.current();
      setTimeout(() => launchRef.current(), 220);
      setTimeout(() => launchRef.current(), 480);
    },
  }), []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas && canvas.getContext('2d');
    if (!ctx) return undefined;
    const MAX_SPARKS = isMobile ? 360 : 720;
    const DPR = Math.min(1.5, window.devicePixelRatio || 1);
    let W = 0;
    let H = 0;
    const resize = () => {
      W = canvas.clientWidth; H = canvas.clientHeight;
      canvas.width = W * DPR; canvas.height = H * DPR;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    };
    resize();

    /** 1 発分の色（2〜3 色）を選ぶ。白は必ず混ぜて明るさを担保する */
    const pickColors = () => {
      const n = 2 + Math.floor(Math.random() * 2);
      const cs = ['#ffffff'];
      while (cs.length < n) {
        const c = pick(PALETTE);
        if (!cs.includes(c)) cs.push(c);
      }
      return cs;
    };

    /** 火花を放射状に撒く */
    const explode = (x, y, colors) => {
      const count = isMobile ? 70 : 110;
      const base = Math.min(W, H) * (isMobile ? 0.42 : 0.34);
      const ring = Math.random() < 0.35; // 3 割強は環状（速度を揃える）
      for (let i = 0; i < count && sparks.current.length < MAX_SPARKS; i += 1) {
        const a = (i / count) * Math.PI * 2 + rand(-0.08, 0.08);
        const sp = base * (ring ? rand(0.85, 1) : rand(0.25, 1));
        const maxLife = rand(1.1, 1.9);
        sparks.current.push({
          x, y,
          vx: Math.cos(a) * sp,
          vy: Math.sin(a) * sp,
          life: maxLife, maxLife,
          color: pick(colors),
          glyph: pick(GLYPHS),
          size: rand(9, 14),
          seed: Math.random() * 10,
        });
      }
      flashes.current.push({ x, y, life: 0.18, r: base * 0.22, color: colors[colors.length - 1] });
    };

    /** 打ち上げ（下端から上へ。頂点は画面高さの 20〜45%） */
    const launch = () => {
      const x = W * (isMobile ? rand(0.2, 0.8) : rand(0.25, 0.75));
      const targetY = H * rand(0.2, 0.45);
      const speed = H * rand(0.85, 1.05);
      rockets.current.push({
        x, y: H + 8, vx: rand(-18, 18), vy: -speed, targetY, colors: pickColors(), trail: [],
      });
    };
    launchRef.current = launch;

    let raf = 0;
    let last = performance.now();
    const drawSpark = (p, alpha) => {
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      ctx.strokeStyle = p.color;
      if (p.glyph === '○') {
        ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size * 0.18, 0, Math.PI * 2); ctx.stroke();
      } else if (p.glyph === '・') {
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size * 0.12, 0, Math.PI * 2); ctx.fill();
      } else {
        ctx.font = `${p.size}px "DotGothic16", monospace`;
        ctx.fillText(p.glyph, p.x, p.y);
      }
    };

    const frame = (now) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const idle = rockets.current.length === 0 && sparks.current.length === 0 && flashes.current.length === 0;
      if (!active && idle) return;
      if (reducedMotion) return; // 静止画は初期化時に 1 回描く

      // 打ち上げ頻度: rate 1 で約 1.4 秒に 1 発（1 発目は inView 時に即発射）
      if (active) {
        accRef.current += rate.get() * dt * 0.7;
        while (accRef.current >= 1) { accRef.current -= 1; launch(); }
      }

      ctx.clearRect(0, 0, W, H);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // ロケット（尾を引きながら上昇）
      const nextRockets = [];
      for (const r of rockets.current) {
        r.trail.unshift({ x: r.x, y: r.y });
        if (r.trail.length > 10) r.trail.pop();
        r.x += r.vx * dt;
        r.y += r.vy * dt;
        r.vy *= 1 - 0.9 * dt; // 頂点に向けて減速
        if (r.y <= r.targetY || r.vy > -H * 0.12) {
          explode(r.x, r.y, r.colors);
          continue;
        }
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = '#ffffff';
        r.trail.forEach((t, i) => {
          ctx.globalAlpha = (1 - i / r.trail.length) * 0.8;
          ctx.beginPath(); ctx.moveTo(t.x, t.y); ctx.lineTo(t.x, t.y + 4); ctx.stroke();
        });
        ctx.globalAlpha = 1;
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px "DotGothic16", monospace';
        ctx.fillText('+', r.x, r.y);
        nextRockets.push(r);
      }
      rockets.current = nextRockets;

      // 閃光
      const nextFlashes = [];
      for (const f of flashes.current) {
        f.life -= dt;
        if (f.life <= 0) continue;
        ctx.globalAlpha = (f.life / 0.18) * 0.55;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath(); ctx.arc(f.x, f.y, f.r * (1 - f.life / 0.18 + 0.3), 0, Math.PI * 2); ctx.fill();
        nextFlashes.push(f);
      }
      flashes.current = nextFlashes;

      // 火花（重力 + 空気抵抗 + 明滅）
      const nextSparks = [];
      const t = now / 1000;
      for (const p of sparks.current) {
        p.vy += 170 * dt;
        p.vx *= 1 - 1.4 * dt;
        p.vy *= 1 - 1.0 * dt;
        p.x += p.vx * dt; p.y += p.vy * dt;
        p.life -= dt;
        if (p.life <= 0 || p.y > H + 20) continue;
        const k = p.life / p.maxLife;
        const twinkle = k < 0.5 ? 0.55 + 0.45 * Math.sin(t * 28 + p.seed) : 1;
        drawSpark(p, Math.max(0, Math.min(1, k * 1.4)) * twinkle);
        nextSparks.push(p);
      }
      sparks.current = nextSparks;
      ctx.globalAlpha = 1;
    };

    if (reducedMotion) {
      // 静止画: 弾けた直後の火花を 3 発分、少し広げた状態で描く
      ctx.clearRect(0, 0, W, H);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      [[0.3, 0.32], [0.55, 0.22], [0.72, 0.4]].forEach(([fx, fy]) => {
        explode(W * fx, H * fy, pickColors());
      });
      flashes.current = [];
      sparks.current.forEach((p) => {
        p.x += p.vx * 0.45; p.y += p.vy * 0.45 + 12;
        drawSpark(p, 0.9);
      });
      sparks.current = [];
      ctx.globalAlpha = 1;
    }

    raf = requestAnimationFrame(frame);
    window.addEventListener('resize', resize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, [rate, active, isMobile, reducedMotion]);

  // セクションに入った瞬間に 1 発目を即打ち上げる（rate の立ち上がりを待たない）。次弾は約 0.9 秒後
  useEffect(() => {
    if (!inView || !active || reducedMotion) return;
    launchRef.current();
    accRef.current = 0.35;
  }, [inView, active, reducedMotion]);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ zIndex: 3, pointerEvents: 'none' }} aria-hidden="true" />;
});

export default Fireworks;
