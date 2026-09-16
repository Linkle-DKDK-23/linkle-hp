import React, { useLayoutEffect, useMemo, useRef } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollContainerContext } from '../../lib/scroll/ScrollContainerContext';
import { scrollStore } from '../../lib/scroll/scrollStore';
import { surfaceRegistry } from '../../lib/theme/surfaceRegistry';
import { useTransition } from '../../lib/transition/TransitionProvider';
import { useMotionPrefs } from '../../lib/motion/MotionPrefsProvider';

/**
 * G5 仮想スクロール。#scroll-wrapper（fixed / overflow-y:auto）を lenis が scrollTop 経由で動かす。
 */
export default function SmoothScroll({ children }) {
  const wrapperRef = useRef(null);
  const contentRef = useRef(null);
  const lenisRef = useRef(null);
  const { attachLenis } = useTransition();
  const { reducedMotion } = useMotionPrefs();

  useLayoutEffect(() => {
    const wrapper = wrapperRef.current;
    const content = contentRef.current;
    if (!wrapper || !content) return undefined;
    const lenis = new Lenis({
      wrapper,
      content,
      lerp: reducedMotion ? 1 : 0.08,
      wheelMultiplier: 1,
      smoothWheel: true,
      syncTouch: false,
      autoRaf: false,
    });
    lenisRef.current = lenis;
    const tick = (t) => lenis.raf(t * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    lenis.on('scroll', (e) => {
      scrollStore.set({
        scroll: e.scroll, limit: e.limit, velocity: e.velocity, direction: e.direction, progress: e.progress,
      });
    });
    surfaceRegistry.attach(wrapper);
    attachLenis(lenis, wrapper);

    let ro = null;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(() => {
        lenis.resize();
        surfaceRegistry.measure();
      });
      ro.observe(content);
    }
    return () => {
      if (ro) ro.disconnect();
      gsap.ticker.remove(tick);
      lenis.destroy();
      lenisRef.current = null;
      attachLenis(null, null);
    };
  }, [attachLenis, reducedMotion]);

  const ctx = useMemo(() => ({
    wrapperRef,
    contentRef,
    getLenis: () => lenisRef.current,
  }), []);

  return (
    <ScrollContainerContext.Provider value={ctx}>
      <div id="scroll-wrapper" ref={wrapperRef}>
        <main id="scroll-content" ref={contentRef}>
          {children}
        </main>
      </div>
    </ScrollContainerContext.Provider>
  );
}
