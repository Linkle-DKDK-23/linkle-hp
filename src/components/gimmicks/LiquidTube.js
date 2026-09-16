import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { tubeController } from './TubeController';
import { useScrollContainer } from '../../lib/scroll/ScrollContainerContext';
import { useMotionPrefs } from '../../lib/motion/MotionPrefsProvider';
import { surfaceRegistry } from '../../lib/theme/surfaceRegistry';

const SVG_W = 160;

/**
 * G13 / G18: 配管（液体チューブ）。App 直下の fixed <svg> 1 本。TubeController の状態で属性を更新する。
 * mode: none | glass | fluid | brand | capsule | ring | break
 */
export default function LiquidTube() {
  const svgRef = useRef(null);
  const { wrapperRef } = useScrollContainer();
  const { isMobile, reducedMotion } = useMotionPrefs();
  const tubeW = isMobile ? 72 : 110;
  const x0 = (SVG_W - tubeW) / 2;
  const r = tubeW / 2;
  const tickPitch = isMobile ? 32 : 40;
  const refs = useRef({});

  useEffect(() => {
    // wrapper を controller に渡す（SmoothScroll のマウント後）
    const attach = () => { if (wrapperRef.current) tubeController.attach(wrapperRef.current); };
    attach();
    const t = setTimeout(attach, 100);
    return () => clearTimeout(t);
  }, [wrapperRef]);

  useEffect(() => {
    const el = refs.current;
    const svg = svgRef.current;
    if (!svg) return undefined;
    let lastMode = null;
    const apply = (s) => {
      const vh = window.innerHeight;
      const visible = s.mode !== 'none' && s.opacity > 0.01;
      svg.style.opacity = visible ? String(s.opacity) : '0';
      if (!visible) { lastMode = s.mode; return; }
      const isBrand = s.mode === 'brand' || s.mode === 'capsule' || s.mode === 'ring' || s.mode === 'break';
      const wallFill = isBrand ? 'var(--bp-brand)' : '#000';
      const edge = isBrand ? 'rgba(255,255,255,.9)' : 'rgba(255,255,255,.55)';
      const tick = isBrand ? 'var(--bp-dim-dark)' : 'var(--bp-dim)';
      const showBody = s.mode !== 'ring';
      const showFluid = s.mode === 'fluid' || s.mode === 'break';
      const showCap = s.mode === 'capsule';
      const showRing = s.mode === 'ring' || s.mode === 'break';
      const bottom = Math.max(0, Math.min(vh, s.bottomY));
      const bodyBottom = showCap ? Math.max(0, bottom - r) : bottom;

      if (lastMode !== s.mode) {
        el.wall.setAttribute('fill', wallFill);
        el.edgeL.setAttribute('fill', edge);
        el.edgeR.setAttribute('fill', edge);
        el.ticks.setAttribute('stroke', tick);
        el.cap.setAttribute('fill', wallFill);
        el.body.style.display = showBody ? '' : 'none';
        el.fluid.style.display = showFluid ? '' : 'none';
        el.cap.style.display = showCap ? '' : 'none';
        el.ring.style.display = showRing ? '' : 'none';
        el.fluidGroup.setAttribute('filter', showFluid ? 'url(#bp-goo)' : '');
        lastMode = s.mode;
      }
      el.clip.setAttribute('height', String(bodyBottom));
      if (showCap) el.cap.setAttribute('transform', `translate(0 ${bottom - r})`);
      if (showFluid) {
        const level = Math.max(0, Math.min(1, s.fill));
        const fluidH = bodyBottom * level;
        el.fluidRect.setAttribute('transform', `translate(0 ${bodyBottom - fluidH})`);
        el.fluidRect.setAttribute('height', String(Math.max(0, fluidH)));
        // 千切れ落ちる玉（G18）
        const bt = s.breakT;
        [60, 140, 220].forEach((dy, i) => {
          const c = el.drops[i];
          const rr = 22 - 12 * bt;
          c.setAttribute('cy', String(bodyBottom - 30 + dy * bt));
          c.setAttribute('r', String(Math.max(2, rr)));
          c.setAttribute('opacity', String(bt > 0 ? 1 - Math.max(0, (bt - 0.8) / 0.2) : 0));
        });
      }
      if (showRing) el.ring.setAttribute('transform', `translate(0 ${s.topY})`);
    };
    const off = tubeController.subscribe(apply);
    const tick = () => tubeController.tick();
    gsap.ticker.add(tick);
    return () => { off(); gsap.ticker.remove(tick); };
  }, [r, reducedMotion]);

  useEffect(() => {
    const onResize = () => { tubeController.measure(); surfaceRegistry.measure(); };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const ticks = [];
  const vhMax = 2000;
  for (let y = tickPitch; y < vhMax; y += tickPitch) {
    const long = (y / tickPitch) % 2 === 0;
    ticks.push(<line key={y} x1={x0 + tubeW + 6} x2={x0 + tubeW + (long ? 18 : 12)} y1={y} y2={y} />);
  }

  return (
    <svg
      ref={svgRef}
      className="fixed top-0"
      width={SVG_W}
      height="100vh"
      style={{
        left: '50%', transform: 'translateX(-50%)', zIndex: 'var(--bp-z-tube)', pointerEvents: 'none',
        opacity: 0, willChange: 'transform, opacity', height: '100vh',
      }}
      aria-hidden="true"
    >
      <defs>
        <filter id="bp-goo" x="-20%" y="-10%" width="140%" height="130%">
          <feGaussianBlur in="SourceGraphic" stdDeviation={isMobile ? 6 : 10} result="blur" />
          <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9" result="goo" />
          <feComposite in="SourceGraphic" in2="goo" operator="atop" />
        </filter>
        <linearGradient id="bp-fluid" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--bp-fluid-0)" />
          <stop offset=".55" stopColor="var(--bp-fluid-1)" />
          <stop offset="1" stopColor="var(--bp-fluid-2)" />
        </linearGradient>
        <linearGradient id="bp-wall-hl" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="rgba(255,255,255,.14)" />
          <stop offset=".25" stopColor="rgba(255,255,255,0)" />
          <stop offset=".75" stopColor="rgba(255,255,255,0)" />
          <stop offset="1" stopColor="rgba(255,255,255,.2)" />
        </linearGradient>
        <clipPath id="bp-tube-clip">
          <rect ref={(n) => { refs.current.clip = n; }} x="0" y="0" width={SVG_W} height="0" />
        </clipPath>
      </defs>

      <g ref={(n) => { refs.current.body = n; }} clipPath="url(#bp-tube-clip)">
        <rect ref={(n) => { refs.current.wall = n; }} x={x0} y="0" width={tubeW} height="100%" fill="#000" />
        <g ref={(n) => { refs.current.fluidGroup = n; }} style={{ display: 'none' }}>
          <g ref={(n) => { refs.current.fluid = n; }}>
            <rect ref={(n) => { refs.current.fluidRect = n; }} x={x0 + 2} y="0" width={tubeW - 4} height="0" fill="url(#bp-fluid)" />
            {[0, 1, 2].map((i) => (
              <circle key={i} ref={(n) => { refs.current.drops = refs.current.drops || []; refs.current.drops[i] = n; }} cx={SVG_W / 2 + (i - 1) * 14} cy="0" r="0" fill="var(--bp-fluid-1)" opacity="0" />
            ))}
          </g>
        </g>
        <rect x={x0} y="0" width={tubeW} height="100%" fill="url(#bp-wall-hl)" />
        <rect ref={(n) => { refs.current.edgeL = n; }} x={x0} y="0" width="1.5" height="100%" fill="rgba(255,255,255,.55)" />
        <rect ref={(n) => { refs.current.edgeR = n; }} x={x0 + tubeW - 1.5} y="0" width="1.5" height="100%" fill="rgba(255,255,255,.55)" />
        <g ref={(n) => { refs.current.ticks = n; }} stroke="var(--bp-dim)" strokeWidth="1">{ticks}</g>
      </g>
      <circle ref={(n) => { refs.current.cap = n; }} cx={SVG_W / 2} cy="0" r={r} fill="#000" stroke="rgba(255,255,255,.9)" strokeWidth="1.5" style={{ display: 'none' }} />
      <circle ref={(n) => { refs.current.ring = n; }} cx={SVG_W / 2} cy={r} r={r - 4} fill="none" stroke="rgba(255,255,255,.9)" strokeWidth="8" style={{ display: 'none' }} />
    </svg>
  );
}
