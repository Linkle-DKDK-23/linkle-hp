import React, { useCallback, useRef } from 'react';
import { useSurface } from '../../lib/theme/surfaceRegistry';
import { useSectionProgress } from '../../lib/scroll/useSectionProgress';
import { useTube } from './TubeController';

/**
 * G18: 外側 200vh。sticky ブランド面（100dvh）の後ろに白面（100dvh）を通常フローで置き、
 * 白面が下端から上がって直線境界で覆う。registry には brand / light / band を計算値で登録。
 * 液（配管）は breakT = p_wipe（前半 100vh）で千切れる。
 * @param {{ brand: React.ReactNode, light: React.ReactNode }} props
 */
export default function SurfaceWipe({ brand, light }) {
  const ref = useRef(null);
  const p = useSectionProgress(ref);
  const compute = useCallback((top, height, vh) => ([
    { surface: 'brand', top, bottom: top + vh },
    { surface: 'light', top: top + vh, bottom: top + vh * 1.61 },
    { surface: 'band', top: top + vh * 1.61, bottom: top + vh * 2 },
  ]), []);
  useSurface('brand', ref, compute);
  // p 0→.5 がワイプ区間（先頭 100vh）
  useTube(ref, [
    { at: 0, mode: 'break', topY: -55, bottomY: (vh) => vh, breakT: 0, opacity: 1, fill: 1 },
    { at: 0.5, mode: 'break', topY: -55, bottomY: 0, breakT: 1, opacity: 0, fill: 1 },
    { at: 1, mode: 'none', opacity: 0 },
  ]);

  return (
    <section ref={ref} className="bp-section" data-surface="brand" style={{ height: '200vh' }}>
      <div className="bp-sticky" style={{ background: 'var(--bp-brand)', zIndex: 0 }}>
        {typeof brand === 'function' ? brand(p) : brand}
      </div>
      <div className="relative" style={{ height: '100dvh', background: '#fff', zIndex: 1 }}>
        {light}
      </div>
    </section>
  );
}
