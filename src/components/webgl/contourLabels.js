import { terrain } from '../../lib/webgl/terrain';

/**
 * 標高ラベル用: h ∈ {−.4, −.2, 0, .2, .4} の等値点を各 1 か所サンプリング（画面座標比 0..1、y は上から）。
 * 等高線と同じ写像（q = (u*aspect, v)*3, t=0）。three に依存しないので 2D 版とも共有する。
 */
export function sampleContourLabels(aspect) {
  const targets = [-0.4, -0.2, 0, 0.2, 0.4];
  const out = [];
  targets.forEach((h, i) => {
    let best = null;
    for (let k = 0; k < 400; k += 1) {
      const u = 0.08 + ((k * 0.618033) % 1) * 0.84;
      const v = 0.05 + ((k * 0.381966 + i * 0.13) % 1) * 0.45;
      const val = terrain(u * aspect * 3, v * 3);
      const err = Math.abs(val - h);
      if (!best || err < best.err) best = { u, v, err };
    }
    if (best) out.push({ x: best.u, y: 1 - best.v, value: h });
  });
  return out;
}
