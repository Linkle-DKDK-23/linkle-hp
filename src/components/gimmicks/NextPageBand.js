import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { scrollStore } from '../../lib/scroll/scrollStore';
import { useTransition } from '../../lib/transition/TransitionProvider';
import { useScrollContainer } from '../../lib/scroll/ScrollContainerContext';
import { useWrapperInView } from '../../lib/scroll/useWrapperInView';
import { crosshairBus } from '../../lib/bus';
import { prefetchPage } from '../../pages/loaders';
import { isLatin } from '../../lib/text/splitText';
import { useMotionPrefs } from '../../lib/motion/MotionPrefsProvider';
import SheetNumber from '../ui/SheetNumber';

/**
 * G20: 次ページ帯（39vh）。末尾でのオーバースクロール累積 → プログレス線 → go(next) を 1 回だけ。
 * ホイールは lenis の virtual-scroll、タッチは wrapper の touchmove 累積。
 */
export default function NextPageBand({ nextLabel, nextPath, sheet }) {
  const { go, getLenis, phase } = useTransition();
  const { wrapperRef } = useScrollContainer();
  const { isMobile } = useMotionPrefs();
  const ref = useRef(null);
  const lineRef = useRef(null);
  const inView = useWrapperInView(ref, { amount: 0.2 });
  const phaseRef = useRef(phase);
  phaseRef.current = phase;

  useEffect(() => {
    if (inView) {
      prefetchPage(nextPath);
      crosshairBus.y.set(93);
    } else if (crosshairBus.y.get() === 93) {
      crosshairBus.y.set(49);
    }
  }, [inView, nextPath]);

  useEffect(() => {
    const lenis = getLenis();
    const wrapper = wrapperRef.current;
    if (!lenis || !wrapper) return undefined;
    let progress = 0;
    let lastInput = 0;
    let lock = false;
    const divisor = isMobile ? 1200 : 1500;
    const atEnd = () => scrollStore.scroll >= scrollStore.limit - 1;
    const push = (deltaY) => {
      if (phaseRef.current !== 'IDLE') return;
      if (atEnd() && deltaY > 0) {
        progress = Math.min(1, progress + deltaY / divisor);
        lastInput = performance.now();
      }
    };
    const offVS = lenis.on('virtual-scroll', ({ deltaY }) => push(deltaY));
    let lastTouchY = null;
    const onTouchStart = (e) => { lastTouchY = e.touches[0].clientY; };
    const onTouchMove = (e) => {
      if (lastTouchY === null) return;
      const y = e.touches[0].clientY;
      push(lastTouchY - y);
      lastTouchY = y;
    };
    const onTouchEnd = () => { lastTouchY = null; };
    wrapper.addEventListener('touchstart', onTouchStart, { passive: true });
    wrapper.addEventListener('touchmove', onTouchMove, { passive: true });
    wrapper.addEventListener('touchend', onTouchEnd, { passive: true });
    const tick = () => {
      if (performance.now() - lastInput > 120 && progress < 1) progress = Math.max(0, progress - 0.02);
      if (lineRef.current) lineRef.current.style.transform = `scaleX(${progress})`;
      if (progress >= 1 && !lock) { lock = true; go(nextPath); }
    };
    gsap.ticker.add(tick);
    return () => {
      if (typeof offVS === 'function') offVS();
      wrapper.removeEventListener('touchstart', onTouchStart);
      wrapper.removeEventListener('touchmove', onTouchMove);
      wrapper.removeEventListener('touchend', onTouchEnd);
      gsap.ticker.remove(tick);
    };
  }, [getLenis, wrapperRef, go, nextPath, isMobile]);

  return (
    <div
      ref={ref}
      data-surface="band"
      className="relative"
      style={{ height: '39vh', background: 'var(--bp-band)', color: 'var(--bp-ink)', padding: '40px var(--bp-margin) 0' }}
    >
      <div className="flex items-start justify-between">
        <p className="text-num m-0" style={{ fontSize: 14, lineHeight: 1.3, letterSpacing: '.04em', textTransform: 'uppercase' }}>
          Keep scrolling<br />to learn more
        </p>
      </div>
      <div className="flex items-end justify-between" style={{ marginTop: isMobile ? 24 : 36 }}>
        <p className={`m-0 font-medium ${isLatin(nextLabel) ? 'font-latin' : 'palt'}`} style={{ fontSize: isMobile ? 32 : 50, lineHeight: 1 }}>{nextLabel}</p>
        <button
          type="button"
          className="flex items-center"
          onClick={() => go(nextPath)}
          style={{ gap: 14, background: 'none', border: 0, color: 'inherit', padding: 4 }}
          aria-label={`NEXT PAGE ${nextLabel}`}
        >
          <span className="text-num" style={{ fontSize: 13, letterSpacing: '.08em', textTransform: 'uppercase' }}>Next page</span>
          <span className="relative block" style={{ width: 'var(--bp-next-line-w)', height: 'var(--bp-next-line-h)', background: 'var(--bp-trough)' }} aria-hidden="true">
            <span ref={lineRef} className="absolute inset-0 block" style={{ background: 'var(--bp-accent-on-black)', transformOrigin: 'left center', transform: 'scaleX(0)' }} />
          </span>
          <span aria-hidden="true" style={{ fontSize: 16 }}>→</span>
        </button>
      </div>
      <SheetNumber n={sheet} style={{ position: 'absolute', left: 'var(--bp-margin)', bottom: 24 }} />
    </div>
  );
}
