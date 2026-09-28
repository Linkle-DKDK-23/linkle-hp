import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { TLink } from '../../lib/transition/useTransitionNavigate';
import { useTransition } from '../../lib/transition/TransitionProvider';
import { scrollStore } from '../../lib/scroll/scrollStore';
import { useMotionPrefs } from '../../lib/motion/MotionPrefsProvider';
import { menuStore, useMenuOpen } from '../../lib/menuStore';
import { T } from '../../lib/motion/timings';
import Pill from '../ui/Pill';
import CircleButton from '../ui/CircleButton';

const HIDE_V = 6;
const SHOW_V = 1;

/**
 * G22: ヘッダー。ロゴ（面で反転）+ 円ボタン + 2 ピル。
 * ピル群は overflow:hidden の窓（高さ 45px）に入れ、REVEAL + 1.2s で下から現れ、
 * 速度連動で ±30px ずれ、|velocity| > 6 の間は上へ隠れる（150ms 静止で復帰）。
 */
export default function Header() {
  const { phase } = useTransition();
  const { reducedMotion, isMobile } = useMotionPrefs();
  const menuOpen = useMenuOpen();
  const groupRef = useRef(null); // 出現 / 隠れ
  const innerRef = useRef(null); // 速度ずれ
  const shownRef = useRef(false);
  const hiddenRef = useRef(false);

  // 初回・遷移後の遅延出現
  useEffect(() => {
    const group = groupRef.current;
    if (!group) return undefined;
    if (phase === 'IDLE') {
      const t = setTimeout(() => {
        shownRef.current = true;
        gsap.to(group, { yPercent: 0, opacity: 1, duration: reducedMotion ? 0.3 : T.pillIn, ease: 'power3.out' });
      }, T.pillDelay * 1000);
      return () => clearTimeout(t);
    }
    if (phase === 'CAPTURE' || phase === 'RESET') {
      shownRef.current = false;
      hiddenRef.current = false;
      gsap.set(group, { yPercent: 100, opacity: reducedMotion ? 0 : 1 });
    }
    return undefined;
  }, [phase, reducedMotion]);

  // 速度ずれ + 速度ベースの隠れ
  useEffect(() => {
    const inner = innerRef.current;
    const group = groupRef.current;
    if (!inner || !group) return undefined;
    const toY = gsap.quickTo(inner, 'y', { duration: 0.25, ease: 'power2.out' });
    let idleSince = null;
    const off = scrollStore.subscribe(({ velocity }) => {
      if (!shownRef.current) return;
      const v = reducedMotion ? 0 : velocity;
      toY(Math.max(-30, Math.min(30, v * 0.3)));
      const abs = Math.abs(velocity);
      if (abs > HIDE_V) {
        idleSince = null;
        if (!hiddenRef.current && scrollStore.scroll > 40) {
          hiddenRef.current = true;
          gsap.to(group, { yPercent: -100, duration: T.pillHide, ease: 'power2.out', overwrite: 'auto' });
        }
      } else if (abs < SHOW_V) {
        if (idleSince === null) idleSince = performance.now();
        if (performance.now() - idleSince >= 150 && hiddenRef.current) {
          hiddenRef.current = false;
          gsap.to(group, { yPercent: 0, duration: T.pillHide, ease: 'power2.out', overwrite: 'auto' });
        }
      }
    });
    return off;
  }, [reducedMotion]);

  return (
    <header
      className="fixed inset-x-0 top-0 flex items-center justify-between"
      style={{
        zIndex: 'var(--bp-z-header)',
        height: 'calc(var(--bp-header-y) * 2)',
        padding: '0 var(--bp-margin)',
        pointerEvents: 'none',
      }}
    >
      <TLink
        to="/"
        className="font-latin uppercase font-medium"
        style={{
          fontSize: 22,
          letterSpacing: '.08em',
          color: 'var(--cur-logo)',
          transition: 'color 240ms var(--bp-ease)',
          pointerEvents: 'auto',
          lineHeight: 1,
        }}
        aria-label="Linkle"
      >
        Linkle
      </TLink>

      <div
        className="overflow-hidden"
        style={{ height: 'var(--bp-pill-h)', pointerEvents: 'auto' }}
        aria-hidden={menuOpen ? 'true' : undefined}
      >
        <div ref={groupRef} style={{ transform: 'translateY(100%)', willChange: 'transform' }}>
          <div ref={innerRef} className="flex items-center" style={{ gap: 'var(--bp-pill-gap)', willChange: 'transform' }}>
            {/* SP はロゴとピル群が重なるので丸ボタンを省く（lusion も SP では 2 ピルのみ） */}
            {!isMobile && <div style={{ marginRight: 2 }}><CircleButton to="/" /></div>}
            <Pill variant="dark" dots={1} to="/contact">LET'S TALK</Pill>
            <Pill
              variant="light"
              dots={2}
              onClick={() => menuStore.toggle()}
              aria-expanded={menuOpen}
              aria-controls="bp-menu"
            >
              MENU
            </Pill>
          </div>
        </div>
      </div>
    </header>
  );
}
