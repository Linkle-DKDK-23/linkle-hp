import React, { useEffect, useRef } from 'react';
import { sceneBus } from '../../lib/bus';
import { terrain, snoise2 } from '../../lib/webgl/terrain';
import { useMotionPrefs } from '../../lib/motion/MotionPrefsProvider';

const smoothstep = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/** noGL: Canvas2D の点 800 + 格子隣接 20% の線。30fps */
export default function ParticleField2D() {
  const ref = useRef(null);
  const { reducedMotion } = useMotionPrefs();

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas && canvas.getContext('2d');
    if (!ctx) return undefined;
    const GX = 40;
    const GZ = 20;
    const N = GX * GZ;
    const pts = [];
    for (let iz = 0; iz < GZ; iz += 1) {
      for (let ix = 0; ix < GX; ix += 1) {
        const r = Math.cbrt(Math.random());
        const th = Math.random() * Math.PI * 2;
        const ph = Math.acos(2 * Math.random() - 1);
        pts.push({
          cx: r * Math.sin(ph) * Math.cos(th) * 1.15,
          cy: r * Math.cos(ph) * 0.8 + 0.32,
          gx: (ix / (GX - 1)) * 2 - 1,
          gz: (iz / (GZ - 1)) * 2 - 1,
          s: Math.random() < 0.97 ? 1 + Math.random() * 1.5 : 3,
        });
      }
    }
    const links = [];
    for (let i = 0; i < N; i += 1) {
      const ix = i % GX;
      if (ix < GX - 1 && Math.random() < 0.2) links.push([i, i + 1]);
      if (i + GX < N && Math.random() < 0.2) links.push([i, i + GX]);
    }
    const iso = (x, y, z) => {
      const cx = 0.8165; const sx = 0.5774;
      const y1 = y * cx - z * sx; const z1 = y * sx + z * cx;
      const x2 = x * 0.7071 + z1 * 0.7071;
      return [x2, y1];
    };
    let raf = 0;
    let last = 0;
    const draw = (now) => {
      raf = requestAnimationFrame(draw);
      if (now - last < 33) return;
      last = now;
      if (!sceneBus.heroVisible) return;
      const W = canvas.clientWidth;
      const H = canvas.clientHeight;
      if (canvas.width !== W || canvas.height !== H) { canvas.width = W; canvas.height = H; }
      const p = sceneBus.hero.get();
      const morph = smoothstep(0.1, 0.7, p);
      const pull = 1 - 0.3 * smoothstep(0.6, 1, p);
      const t = reducedMotion ? 5 : now / 1000;
      const scale = H * 0.36 * pull;
      ctx.clearRect(0, 0, W, H);
      const proj = (pt) => {
        const bx = pt.cx + 0.06 * snoise2(pt.cx * 1.3 + t * 0.15, pt.cy * 1.3);
        const by = pt.cy + 0.06 * snoise2(pt.cy * 1.3 + 7 + t * 0.15, pt.cx * 1.3);
        const [mx, my] = iso(pt.gx * 1.6, terrain(pt.gx, pt.gz) * 0.25, pt.gz);
        const x = bx + (mx - bx) * morph;
        const y = by + (my - 0.05 - by) * morph;
        return [W / 2 + x * scale, H / 2 - y * scale];
      };
      const screen = pts.map(proj);
      ctx.strokeStyle = 'rgba(255,255,255,.1)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      links.forEach(([a, b]) => {
        if (morph < 0.05 && Math.random() > 0.1) return;
        ctx.moveTo(screen[a][0], screen[a][1]);
        ctx.lineTo(screen[b][0], screen[b][1]);
      });
      ctx.stroke();
      ctx.fillStyle = '#fff';
      screen.forEach(([x, y], i) => {
        ctx.beginPath();
        ctx.arc(x, y, pts[i].s * (1 - 0.4 * morph), 0, Math.PI * 2);
        ctx.fill();
      });
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [reducedMotion]);

  return <canvas ref={ref} className="absolute inset-0 w-full h-full" aria-hidden="true" />;
}
