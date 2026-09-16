import React, { forwardRef, useImperativeHandle, useMemo, useRef } from 'react';
import { gsap } from 'gsap';

/**
 * L 字（縦 148×448 + 横 305×153）を SVG <mask> で切る全画面レイヤ。
 * 窓の外は黒（capture 時は方眼 .35 付き）、窓の中はパネル（半透明）。
 * Preloader（reveal）と PageTransition（capture）で共用。
 * 変形の原点は矩形 A の中心（回転・拡大で L の縦棒が画面を掃くようにするため。設計の「7 倍」は
 * 画面対角 / 148 × 1.1 で動的に算出する: 判断ログ参照）。
 */
export const lGeometry = (vw, vh) => {
  const k = vw < 768 ? 0.6 : 1;
  const W = 453 * k;
  const H = 601 * k;
  const GX = vw / 2 - W / 2;
  const GY = vh / 2 - H / 2;
  return {
    k,
    A: { x: GX, y: GY, w: 148 * k, h: 448 * k },
    B: { x: GX + 148 * k, y: GY + 448 * k, w: 305 * k, h: 153 * k },
    origin: { x: GX + 74 * k, y: GY + 224 * k },
    center: { x: vw / 2, y: vh / 2 },
    coverScale: (Math.hypot(vw, vh) / (148 * k)) * 1.1,
  };
};

const LWindow = forwardRef(function LWindow({ mode = 'reveal', vw, vh, gridOpacity = 0, style, id = 'lw' }, ref) {
  const maskG = useRef(null);
  const paneG = useRef(null);
  const paneA = useRef(null);
  const paneB = useRef(null);
  const g = useMemo(() => lGeometry(vw, vh), [vw, vh]);

  useImperativeHandle(ref, () => ({
    geometry: g,
    /** 変形（scale / rotation）。両グループに同時適用 */
    setTransform(props) {
      gsap.set([maskG.current, paneG.current], { svgOrigin: `${g.origin.x} ${g.origin.y}`, ...props });
    },
    tween(from, to, vars) {
      const targets = [maskG.current, paneG.current];
      gsap.set(targets, { svgOrigin: `${g.origin.x} ${g.origin.y}` });
      return gsap.fromTo(targets, from, { ...to, ...vars });
    },
    paneA: () => paneA.current,
    paneB: () => paneB.current,
    paneG: () => paneG.current,
  }), [g]);

  const paneFill = mode === 'reveal' ? '#e5e5e5' : '#ffffff';
  const paneOpacity = mode === 'reveal' ? 0.85 : 0;
  const pitch = 43 * g.k;

  return (
    <svg
      width="100%"
      height="100%"
      viewBox={`0 0 ${vw} ${vh}`}
      preserveAspectRatio="none"
      style={{ position: 'absolute', inset: 0, display: 'block', ...style }}
      aria-hidden="true"
    >
      <defs>
        <pattern id={`${id}-grid`} width={pitch} height={pitch} patternUnits="userSpaceOnUse">
          <path d={`M${pitch} 0H0V${pitch}`} fill="none" stroke="rgba(255,255,255,.10)" strokeWidth="1" />
        </pattern>
        <pattern id={`${id}-pane-grid`} width={pitch / 2} height={pitch / 2} patternUnits="userSpaceOnUse">
          <path d={`M${pitch / 2} 0H0V${pitch / 2}`} fill="none" stroke="rgba(0,0,0,.08)" strokeWidth="1" />
        </pattern>
        <mask id={`${id}-mask`}>
          <rect width={vw} height={vh} fill="#fff" />
          <g ref={maskG}>
            <rect x={g.A.x} y={g.A.y} width={g.A.w} height={g.A.h} fill="#000" />
            <rect x={g.B.x} y={g.B.y} width={g.B.w} height={g.B.h} fill="#000" />
          </g>
        </mask>
      </defs>
      <rect width={vw} height={vh} fill="#000" mask={`url(#${id}-mask)`} />
      {gridOpacity > 0 && (
        <rect width={vw} height={vh} fill={`url(#${id}-grid)`} opacity={gridOpacity} mask={`url(#${id}-mask)`} />
      )}
      <g ref={paneG} opacity={paneOpacity}>
        <rect ref={paneA} x={g.A.x} y={g.A.y} width={g.A.w} height={g.A.h} fill={paneFill} />
        <rect ref={paneB} x={g.B.x} y={g.B.y} width={g.B.w} height={g.B.h} fill={paneFill} />
        <rect x={g.A.x} y={g.A.y} width={g.A.w} height={g.A.h} fill={`url(#${id}-pane-grid)`} />
        <rect x={g.B.x} y={g.B.y} width={g.B.w} height={g.B.h} fill={`url(#${id}-pane-grid)`} />
      </g>
    </svg>
  );
});

export default LWindow;
