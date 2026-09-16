/**
 * 地形関数（JS 版）。GLSL 版（glsl.js）と同じ Ashima 2D simplex noise + fbm。
 * G2（粒子雲→メッシュ）/ G9（等高線）/ Canvas2D フォールバックで共有する。
 */
function mod289(x) {
  return x - Math.floor(x * (1 / 289)) * 289;
}
function permute(x) {
  return mod289((x * 34 + 1) * x);
}

/** Ashima Arts の snoise(vec2) の JS 移植。−1..1 */
export function snoise2(x, y) {
  const C0 = 0.211324865405187; // (3-sqrt(3))/6
  const C1 = 0.366025403784439; // .5*(sqrt(3)-1)
  const C2 = -0.577350269189626; // -1 + 2*C0
  const C3 = 0.024390243902439; // 1/41

  const s = (x + y) * C1;
  const ix = Math.floor(x + s);
  const iy = Math.floor(y + s);
  const t = (ix + iy) * C0;
  const x0 = x - ix + t;
  const y0 = y - iy + t;

  const i1x = x0 > y0 ? 1 : 0;
  const i1y = x0 > y0 ? 0 : 1;

  const x1 = x0 + C0 - i1x;
  const y1 = y0 + C0 - i1y;
  const x2 = x0 + C2;
  const y2 = y0 + C2;

  const mix = mod289(ix);
  const miy = mod289(iy);
  const p0 = permute(permute(miy) + mix);
  const p1 = permute(permute(miy + i1y) + mix + i1x);
  const p2 = permute(permute(miy + 1) + mix + 1);

  let m0 = Math.max(0.5 - (x0 * x0 + y0 * y0), 0);
  let m1 = Math.max(0.5 - (x1 * x1 + y1 * y1), 0);
  let m2 = Math.max(0.5 - (x2 * x2 + y2 * y2), 0);
  m0 *= m0; m0 *= m0;
  m1 *= m1; m1 *= m1;
  m2 *= m2; m2 *= m2;

  const grad = (p) => {
    const xx = 2 * (p * C3 - Math.floor(p * C3)) - 1;
    const h = Math.abs(xx) - 0.5;
    const ox = Math.floor(xx + 0.5);
    const a0 = xx - ox;
    return [a0, h];
  };
  const g0 = grad(p0);
  const g1 = grad(p1);
  const g2 = grad(p2);
  const norm = (g) => 1.79284291400159 - 0.85373472095314 * (g[0] * g[0] + g[1] * g[1]);
  m0 *= norm(g0);
  m1 *= norm(g1);
  m2 *= norm(g2);

  const v0 = g0[0] * x0 + g0[1] * y0;
  const v1 = g1[0] * x1 + g1[1] * y1;
  const v2 = g2[0] * x2 + g2[1] * y2;
  return 130 * (m0 * v0 + m1 * v1 + m2 * v2);
}

/** fbm 4 オクターブ。−1..1 付近 */
export function fbm(x, y) {
  let v = 0;
  let a = 0.5;
  let fx = x;
  let fy = y;
  for (let i = 0; i < 4; i += 1) {
    v += a * snoise2(fx, fy);
    fx = fx * 2.02 + 1.7;
    fy = fy * 2.02 + 9.2;
    a *= 0.5;
  }
  return v;
}

/** 地形の高さ。GLSL の terrain(x, z) と同係数 */
export function terrain(x, z) {
  return fbm(x * 1.35 + 3.1, z * 1.35 + 1.7);
}
