import React, { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { useMotionPrefs } from '../../lib/motion/MotionPrefsProvider';

/**
 * G15: `+ × ○` 噴水（Canvas2D）。頂点 47vh、底辺 550px（1512 基準）、最大 500 粒。
 * rate: MotionValue（0〜1）。ref.burst() で 160 粒を一度に噴く。
 */
const GlyphFountain = forwardRef(function GlyphFountain({ rate, active = true }, ref) {
  const canvasRef = useRef(null);
  const parts = useRef([]);
  const { isMobile, reducedMotion } = useMotionPrefs();
  const spawnRef = useRef(() => {});

  useImperativeHandle(ref, () => ({ burst: () => spawnRef.current(160) }), []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas && canvas.getContext('2d');
    if (!ctx) return undefined;
    const MAX = isMobile ? 220 : 500;
    const DPR = Math.min(1.5, window.devicePixelRatio || 1);
    let W = 0;
    let H = 0;
    const resize = () => {
      W = canvas.clientWidth; H = canvas.clientHeight;
      canvas.width = W * DPR; canvas.height = H * DPR;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    };
    resize();
    const spawn = (n) => {
      const apex = { x: W / 2, y: 0.47 * H };
      const spreadHalf = isMobile ? W * 0.3 : 275 * (W / 1512);
      for (let i = 0; i < n && parts.current.length < MAX; i += 1) {
        const r = Math.random();
        const glyph = r < 0.125 ? '○' : (Math.random() < 0.5 ? '+' : '×');
        parts.current.push({
          x: apex.x, y: apex.y,
          vx: ((Math.random() - 0.5) * 2 * spreadHalf) / 1.6,
          vy: -(220 + Math.random() * 120),
          life: 1.8, glyph,
        });
      }
    };
    spawnRef.current = spawn;
    let raf = 0;
    let last = performance.now();
    const frame = (now) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!active && parts.current.length === 0) return;
      if (active && !reducedMotion) spawn(Math.round(rate.get() * 18 * dt * 60));
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = '#fff';
      ctx.strokeStyle = '#fff';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const next = [];
      for (const p of parts.current) {
        if (!reducedMotion) {
          p.vy += 380 * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt;
        }
        if (p.life <= 0) continue;
        ctx.globalAlpha = Math.max(0, Math.min(1, p.life));
        if (p.glyph === '○') {
          ctx.beginPath(); ctx.arc(p.x, p.y, 1.6, 0, Math.PI * 2); ctx.stroke();
        } else {
          ctx.fillText(p.glyph, p.x, p.y);
        }
        next.push(p);
      }
      ctx.globalAlpha = 1;
      parts.current = next;
    };
    if (reducedMotion) {
      // 静止配置 120 個
      spawn(120);
      parts.current.forEach((p) => { p.x += p.vx * 0.6; p.y += p.vy * 0.5 + 60; });
    }
    raf = requestAnimationFrame(frame);
    window.addEventListener('resize', resize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, [rate, active, isMobile, reducedMotion]);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ zIndex: 3, pointerEvents: 'none' }} aria-hidden="true" />;
});

export default GlyphFountain;
