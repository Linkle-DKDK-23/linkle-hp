import React, { useCallback, useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { useTransition } from '../../lib/transition/TransitionProvider';
import { useMotionPrefs } from '../../lib/motion/MotionPrefsProvider';
import { T } from '../../lib/motion/timings';
import LWindow from './LWindow';
import PixelLoading from './PixelLoading';

/**
 * G21: CAPTURE（L 窓が旧ページを閉じ込め縮小回転、窓内は白へ退色）→ LOADING（黒 + 方眼 .35 + ピクセル LOADING）。
 */
export default function PageTransition() {
  const { phase, done } = useTransition();
  const { reducedMotion } = useMotionPrefs();
  const windowRef = useRef(null);
  const blackRef = useRef(null);
  const [vp, setVp] = useState(() => ({ vw: window.innerWidth, vh: window.innerHeight }));
  const visible = phase === 'CAPTURE' || phase === 'LOADING' || phase === 'RESET';

  useEffect(() => {
    if (phase === 'CAPTURE') setVp({ vw: window.innerWidth, vh: window.innerHeight });
  }, [phase]);

  // CAPTURE
  useEffect(() => {
    if (phase !== 'CAPTURE') return undefined;
    let cancelled = false;
    let tl = null;
    const raf = requestAnimationFrame(() => {
      const win = windowRef.current;
      const black = blackRef.current;
      if (!win || !black) return;
      gsap.set(black, { opacity: 0 });
      const g = win.geometry;
      if (reducedMotion) {
        win.setTransform({ scale: g.coverScale, rotation: 0 });
        gsap.to(black, { opacity: 1, duration: 0.2, onComplete: () => { if (!cancelled) done('CAPTURE'); } });
        return;
      }
      tl = gsap.timeline({ onComplete: () => { if (!cancelled) done('CAPTURE'); } });
      tl.add(win.tween({ scale: g.coverScale, rotation: 0 }, { scale: 1, rotation: -8 }, { duration: T.capture, ease: 'power3.inOut' }), 0);
      tl.to(win.paneG(), { opacity: 0.85, duration: T.capture * 0.8, ease: 'power2.out' }, 0);
      tl.to(win.paneB(), { attr: { fill: '#efefef' }, duration: 0.15 }, T.capture - 0.15);
    });
    return () => { cancelled = true; cancelAnimationFrame(raf); if (tl) tl.kill(); };
  }, [phase, done, reducedMotion]);

  // LOADING: 窓を 120ms で消して黒に
  useEffect(() => {
    if (phase !== 'LOADING') return undefined;
    const black = blackRef.current;
    if (black) gsap.to(black, { opacity: 1, duration: 0.12 });
    return undefined;
  }, [phase]);

  const onLoadingDone = useCallback(() => done('LOADING'), [done]);

  if (!visible) return null;
  return (
    <div className="fixed inset-0" style={{ zIndex: 'var(--bp-z-transition)', pointerEvents: 'auto' }} aria-hidden="true">
      {phase === 'CAPTURE' && (
        <LWindow ref={windowRef} mode="capture" vw={vp.vw} vh={vp.vh} gridOpacity={0.35} id="lw-cap" />
      )}
      <div
        ref={blackRef}
        className="absolute inset-0 bp-grid-inline"
        style={{ background: 'var(--bp-black)', opacity: phase === 'CAPTURE' ? 0 : 1 }}
      >
        {phase === 'LOADING' && <PixelLoading onDone={onLoadingDone} />}
      </div>
    </div>
  );
}
