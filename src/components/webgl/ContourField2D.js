import React, { useEffect, useRef } from 'react';
import { sceneBus } from '../../lib/bus';
import { terrain } from '../../lib/webgl/terrain';
import { useMotionPrefs } from '../../lib/motion/MotionPrefsProvider';
import { sampleContourLabels } from './contourLabels';

const smoothstep = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/** noGL: 64×36 グリッドの marching squares で 14 本の等値線 + shadowBlur。20fps */
export default function ContourField2D() {
  const ref = useRef(null);
  const { reducedMotion } = useMotionPrefs();

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas && canvas.getContext('2d');
    if (!ctx) return undefined;
    const NX = 64;
    const NY = 36;
    const vals = new Float32Array((NX + 1) * (NY + 1));
    let raf = 0;
    let last = 0;
    sceneBus.contourLabels = sampleContourLabels(window.innerWidth / window.innerHeight);
    sceneBus.notify();
    const draw = (now) => {
      raf = requestAnimationFrame(draw);
      if (now - last < 50) return;
      last = now;
      if (!sceneBus.teamVisible) return;
      const W = canvas.clientWidth;
      const H = canvas.clientHeight;
      if (canvas.width !== W || canvas.height !== H) { canvas.width = W; canvas.height = H; }
      const p = sceneBus.team.get();
      let reveal = smoothstep(0.05, 0.3, p);
      if (p > 0.9) reveal *= 1 - smoothstep(0.9, 1, p);
      ctx.clearRect(0, 0, W, H);
      if (reveal <= 0) return;
      const t = reducedMotion ? 3.7 : now / 1000;
      const aspect = W / H;
      for (let j = 0; j <= NY; j += 1) {
        for (let i = 0; i <= NX; i += 1) {
          const u = i / NX;
          const v = 1 - j / NY;
          vals[j * (NX + 1) + i] = terrain(u * aspect * 3, v * 3 + t * 0.04);
        }
      }
      ctx.strokeStyle = `rgba(255,255,255,${0.8 * reveal})`;
      ctx.lineWidth = 1;
      ctx.shadowBlur = 8;
      ctx.shadowColor = '#fff';
      const cw = W / NX;
      const ch = H / NY;
      const lerp = (a, b, c) => (Math.abs(b - a) < 1e-6 ? 0.5 : (c - a) / (b - a));
      ctx.beginPath();
      for (let L = 0; L < 14; L += 1) {
        const c = -0.7 + (L / 13) * 1.4;
        for (let j = 0; j < NY; j += 1) {
          const y0 = j * ch;
          if (y0 < H * 0.42) continue; // 下半分のみ
          for (let i = 0; i < NX; i += 1) {
            const a = vals[j * (NX + 1) + i];
            const b = vals[j * (NX + 1) + i + 1];
            const d = vals[(j + 1) * (NX + 1) + i];
            const e = vals[(j + 1) * (NX + 1) + i + 1];
            const idx = (a > c ? 8 : 0) | (b > c ? 4 : 0) | (e > c ? 2 : 0) | (d > c ? 1 : 0);
            if (idx === 0 || idx === 15) continue;
            const x0 = i * cw;
            const top = [x0 + cw * lerp(a, b, c), y0];
            const right = [x0 + cw, y0 + ch * lerp(b, e, c)];
            const bottom = [x0 + cw * lerp(d, e, c), y0 + ch];
            const left = [x0, y0 + ch * lerp(a, d, c)];
            const seg = (P, Q) => { ctx.moveTo(P[0], P[1]); ctx.lineTo(Q[0], Q[1]); };
            switch (idx) {
              case 1: case 14: seg(left, bottom); break;
              case 2: case 13: seg(bottom, right); break;
              case 3: case 12: seg(left, right); break;
              case 4: case 11: seg(top, right); break;
              case 5: seg(top, left); seg(bottom, right); break;
              case 6: case 9: seg(top, bottom); break;
              case 7: case 8: seg(top, left); break;
              case 10: seg(top, right); seg(left, bottom); break;
              default: break;
            }
          }
        }
      }
      ctx.stroke();
      ctx.shadowBlur = 0;
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [reducedMotion]);

  return <canvas ref={ref} className="absolute inset-0 w-full h-full" aria-hidden="true" />;
}
