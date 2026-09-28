import React, { useCallback, useRef } from 'react';
import { useSurface } from '../../lib/theme/surfaceRegistry';
import { useSectionProgress } from '../../lib/scroll/useSectionProgress';

/**
 * G18: 外側 200vh。sticky ブランド面（100dvh）の後ろに白面（100dvh）を通常フローで置き、
 * 白面が下端から上がって直線境界で覆う。registry には brand / light / band を計算値で登録。
 *
 * overlap=true（lusion 録画 2026-09-29 0.07.08）: 直前の LiquidSection（高さ hold+200vh、sticky は hold+100vh まで固定）に
 * 200vh 食い込ませ（margin-top: -200vh）、自分のブランド面は透明にする。これで CTA の見出し・粒が固定されたまま、
 * その上を白面が下から直線で覆う（CTA が先にスクロールで流れて空の青が続く、という間延びを無くす）。
 * @param {{ brand: React.ReactNode, light: React.ReactNode, overlap?: boolean }} props
 */
export default function SurfaceWipe({ brand, light, overlap = false }) {
  const ref = useRef(null);
  const p = useSectionProgress(ref);
  const compute = useCallback((top, height, vh) => ([
    { surface: 'brand', top, bottom: top + vh },
    { surface: 'light', top: top + vh, bottom: top + vh * 1.61 },
    { surface: 'band', top: top + vh * 1.61, bottom: top + vh * 2 },
  ]), []);
  useSurface('brand', ref, compute);

  return (
    <section
      ref={ref}
      className="bp-section"
      data-surface="brand"
      style={{ height: '200vh', marginTop: overlap ? '-200vh' : undefined, zIndex: overlap ? 3 : undefined }}
    >
      <div className="bp-sticky" style={{ background: overlap ? 'transparent' : 'var(--bp-brand)', zIndex: 0, pointerEvents: overlap ? 'none' : undefined }}>
        {typeof brand === 'function' ? brand(p) : brand}
      </div>
      <div className="relative" style={{ height: '100dvh', background: '#fff', zIndex: 1 }}>
        {light}
      </div>
    </section>
  );
}
