import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { useTransition } from '../../lib/transition/TransitionProvider';
import { useMotionPrefs } from '../../lib/motion/MotionPrefsProvider';
import { T } from '../../lib/motion/timings';
import LWindow, { lGeometry } from './LWindow';

const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

function useViewport() {
  const [vp, setVp] = useState(() => ({ vw: window.innerWidth, vh: window.innerHeight }));
  useEffect(() => {
    const on = () => setVp({ vw: window.innerWidth, vh: window.innerHeight });
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, []);
  return vp;
}

/**
 * G1 プリローダー: 溝 212×45 + 目盛り + 白バー + 3 桁カウンター（桁ロール）
 * → SPLIT: バーが 2 矩形（縦 148×448 / 横 305×153）へ → REVEAL: L 窓が拡大回転してワイプ。
 */
export default function Preloader() {
  const { phase, variant, seq, done, readiness } = useTransition();
  const { reducedMotion } = useMotionPrefs();
  const { vw, vh } = useViewport();
  const rootRef = useRef(null);
  const barRef = useRef(null);
  const troughRef = useRef(null);
  const counterRef = useRef(null);
  const colRefs = useRef([]);
  const rectA = useRef(null);
  const rectB = useRef(null);
  const windowRef = useRef(null);
  const [visible, setVisible] = useState(true);
  const [showWindow, setShowWindow] = useState(false);

  const active = phase === 'PRELOAD' || phase === 'SPLIT' || phase === 'REVEAL' || phase === 'BOOT' || phase === 'RESET';

  useLayoutEffect(() => {
    if (active) setVisible(true);
  }, [active]);

  // PRELOAD: バー + カウンター
  useEffect(() => {
    if (phase !== 'PRELOAD') return undefined;
    const root = rootRef.current;
    const bar = barRef.current;
    if (!root || !bar) return undefined;
    setShowWindow(false);
    gsap.set([troughRef.current, counterRef.current], { opacity: 1 });
    gsap.set([rectA.current, rectB.current], { opacity: 0 });
    gsap.set(bar, { scaleX: 0 });
    colRefs.current.forEach((c) => c && gsap.set(c, { y: 0 }));
    const D = variant === 'full' ? T.preloadFull.counter : T.preloadShort.counter;
    const minMs = (variant === 'full' ? T.preloadFull.min : T.preloadShort.min) * 1000;
    const counter = { v: 0 };
    let cancelled = false;
    const tl = gsap.timeline();
    tl.to(bar, { scaleX: 1, duration: D, ease: 'power2.inOut' }, 0);
    tl.to(counter, {
      v: 100,
      duration: D,
      ease: 'power2.inOut',
      onUpdate: () => {
        const digits = String(Math.round(counter.v)).padStart(3, '0');
        colRefs.current.forEach((col, i) => {
          if (col) gsap.set(col, { y: `${-Number(digits[i])}em` });
        });
      },
    }, 0);
    const tlDone = new Promise((r) => tl.eventCallback('onComplete', r));
    const ready = Promise.all([
      tlDone,
      readiness.fonts().catch(() => null),
      readiness.webgl(),
      new Promise((r) => setTimeout(r, minMs)),
    ]);
    ready.then(() => { if (!cancelled) done('PRELOAD'); });
    return () => {
      cancelled = true;
      tl.kill();
    };
  }, [phase, variant, seq, done, readiness]);

  // SPLIT: バーの位置・寸法から 2 矩形へ（transform のみ）
  useEffect(() => {
    if (phase !== 'SPLIT') return undefined;
    const g = lGeometry(vw, vh);
    const A = rectA.current;
    const B = rectB.current;
    const cx = vw / 2;
    const cy = vh / 2;
    const barW = 212;
    const barH = 45;
    const Ac = { x: g.A.x + g.A.w / 2, y: g.A.y + g.A.h / 2 };
    const Bc = { x: g.B.x + g.B.w / 2, y: g.B.y + g.B.h / 2 };
    gsap.set([troughRef.current], { opacity: 0 });
    gsap.set([A, B], { opacity: 1 });
    let cancelled = false;
    if (reducedMotion) {
      gsap.set([A, B], { x: 0, y: 0, scaleX: 1, scaleY: 1, opacity: 0 });
      gsap.to([A, B], { opacity: 1, duration: 0.2, onComplete: () => { if (!cancelled) done('SPLIT'); } });
      return () => { cancelled = true; };
    }
    const tl = gsap.timeline({ onComplete: () => { if (!cancelled) done('SPLIT'); } });
    tl.fromTo(A, { x: cx - Ac.x, y: cy - Ac.y, scaleX: barW / g.A.w, scaleY: barH / g.A.h },
      { x: 0, y: 0, scaleX: 1, scaleY: 1, duration: T.split, ease: 'power3.inOut' }, 0);
    tl.fromTo(B, { x: cx - Bc.x, y: cy - Bc.y, scaleX: barW / g.B.w, scaleY: barH / g.B.h },
      { x: 0, y: 0, scaleX: 1, scaleY: 1, duration: T.split, ease: 'power3.inOut' }, 0);
    return () => { cancelled = true; tl.kill(); };
  }, [phase, vw, vh, done, reducedMotion]);

  // REVEAL: L 窓が拡大回転してワイプ
  useEffect(() => {
    if (phase !== 'REVEAL') return undefined;
    setShowWindow(true);
    let cancelled = false;
    let tl = null;
    const raf = requestAnimationFrame(() => {
      const win = windowRef.current;
      if (!win) return;
      gsap.set([rectA.current, rectB.current], { opacity: 0 });
      gsap.set(counterRef.current, { opacity: 0 });
      const g = win.geometry;
      if (reducedMotion) {
        win.setTransform({ scale: 1, rotation: -8 });
        gsap.to(rootRef.current, {
          opacity: 0, duration: 0.2, onComplete: () => { if (!cancelled) { setVisible(false); done('REVEAL'); } },
        });
        return;
      }
      tl = gsap.timeline({
        onComplete: () => { if (!cancelled) { setVisible(false); done('REVEAL'); } },
      });
      tl.add(win.tween({ scale: 1, rotation: -8 }, { scale: g.coverScale, rotation: -35 }, { duration: T.reveal, ease: 'power3.inOut' }), 0);
      tl.to(win.paneG(), { opacity: 0, duration: T.reveal * 0.4, ease: 'power2.in' }, T.reveal * 0.6);
    });
    return () => { cancelled = true; cancelAnimationFrame(raf); if (tl) tl.kill(); };
  }, [phase, done, reducedMotion]);

  if (!visible && !active) return null;
  const g = lGeometry(vw, vh);

  return (
    <div
      ref={rootRef}
      className="fixed inset-0"
      style={{
        zIndex: 'var(--bp-z-preloader)',
        background: showWindow ? 'transparent' : 'var(--bp-black)',
        pointerEvents: active ? 'auto' : 'none',
      }}
      aria-hidden="true"
    >
      {showWindow && <LWindow ref={windowRef} mode="reveal" vw={vw} vh={vh} id="lw-pre" />}

      {/* 溝 + 目盛り + バー */}
      <div
        ref={troughRef}
        className="absolute"
        style={{
          left: '50%', top: '50%', width: 'var(--bp-preloader-bar-w)', height: 'var(--bp-preloader-bar-h)',
          transform: 'translate(-50%, -50%)', background: 'var(--bp-trough)',
        }}
      >
        {Array.from({ length: 9 }).map((_, i) => (
          <i
            key={i}
            className="absolute top-0 bottom-0 block"
            style={{ left: `${(i + 1) * 10}%`, width: 1, background: 'rgba(255,255,255,.18)' }}
          />
        ))}
        <div ref={barRef} className="absolute inset-0" style={{ background: '#fff', transformOrigin: 'left center', transform: 'scaleX(0)' }} />
      </div>

      {/* SPLIT 用の 2 矩形（最終位置に置き transform で出発） */}
      <div ref={rectA} className="absolute" style={{ left: g.A.x, top: g.A.y, width: g.A.w, height: g.A.h, background: '#fff', opacity: 0, willChange: 'transform' }} />
      <div ref={rectB} className="absolute" style={{ left: g.B.x, top: g.B.y, width: g.B.w, height: g.B.h, background: '#efefef', opacity: 0, willChange: 'transform' }} />

      {/* 3 桁カウンター（下端に食い込む） */}
      <div
        ref={counterRef}
        className="absolute text-num flex overflow-hidden"
        style={{
          left: 'var(--bp-margin)', bottom: '-0.12em', fontSize: 'var(--fs-counter)', lineHeight: 1, color: '#fff',
          fontWeight: 400, height: '1em',
        }}
      >
        {[0, 1, 2].map((i) => (
          <span key={i} className="block" style={{ height: '1em' }}>
            <span ref={(el) => { colRefs.current[i] = el; }} className="block" style={{ willChange: 'transform' }}>
              {DIGITS.map((d) => <span key={d} className="block" style={{ height: '1em' }}>{d}</span>)}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
