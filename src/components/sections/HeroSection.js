import React, { useEffect } from 'react';
import { motion, useMotionValueEvent, useTransform } from 'framer-motion';
import { useSectionBase } from './useSectionBase';
import { useWrapperInView } from '../../lib/scroll/useWrapperInView';
import { useTransition } from '../../lib/transition/TransitionProvider';
import { sceneBus } from '../../lib/bus';
import HeroMorph from '../gimmicks/HeroMorph';
import SheetNumber from '../ui/SheetNumber';

const PLAY_PHASES = new Set(['REVEAL', 'IDLE', 'CAPTURE']);

/**
 * 001 ヒーロー（400vh: 100vh 表示 + 300vh ピン留め）。G2 / G3 / G4 / G22。
 */
export default function HeroSection({ lines, left, right, italicLeft, italicRight, sheet = 1 }) {
  const { ref, p } = useSectionBase('dark');
  const { phase } = useTransition();
  const inView = useWrapperInView(ref, { margin: '100% 0px 100% 0px' });
  const play = PLAY_PHASES.has(phase);

  useMotionValueEvent(p, 'change', (v) => sceneBus.hero.set(v));
  useEffect(() => {
    sceneBus.hero.set(p.get());
    sceneBus.setVisible('heroVisible', inView);
    return () => sceneBus.setVisible('heroVisible', false);
  }, [inView, p]);

  const labelOpacity = useTransform(p, [0, 0.05], [1, 0]);

  return (
    <section ref={ref} className="bp-section" data-surface="dark" style={{ height: '400vh' }}>
      <div className="bp-sticky">
        <SheetNumber n={sheet} style={{ position: 'absolute', left: 'var(--bp-margin)', top: 'calc(155 / 827 * 100vh)' }} />
        <HeroMorph progress={p} lines={lines} play={play} left={left} right={right} italicLeft={italicLeft} italicRight={italicRight} />
        <motion.span
          className="text-num absolute uppercase"
          style={{ right: 'var(--bp-margin)', bottom: 26, fontSize: 20, letterSpacing: '.04em', color: 'var(--bp-ink)', opacity: labelOpacity, zIndex: 3 }}
          aria-hidden="true"
        >
          Scroll to explore
        </motion.span>
      </div>
    </section>
  );
}
