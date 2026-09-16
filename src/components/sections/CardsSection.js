import React, { useLayoutEffect, useRef, useState } from 'react';
import { motion, useTransform } from 'framer-motion';
import { useSectionBase } from './useSectionBase';
import { useTube } from '../gimmicks/TubeController';
import ExpertiseCards from '../gimmicks/ExpertiseCards';
import SheetNumber from '../ui/SheetNumber';
import { TLink } from '../../lib/transition/useTransitionNavigate';
import { isLatin, fitGhostFontSize } from '../../lib/text/splitText';
import { fontsReady } from '../../lib/text/measure';
import { useMotionPrefs } from '../../lib/motion/MotionPrefsProvider';

/**
 * 007 AREA OF EXPERTISE 相当（ブランド面）。巨大白文字が面の上端に重なり、白カード群。G13 brand / G14 / G22 ロゴ黒。
 * variant='flow' は sticky を使わず通常フロー（Contact のフォーム用）。
 * @param {{ giant?: string, label?: string, labelTo?: string, labelLinkText?: string, paragraph?: string, cards: any[], layout?: string, sheet: number, height?: string, variant?: 'sticky'|'flow', children?: any, extra?: any }} props
 */
export default function CardsSection({
  giant, label, labelTo, labelLinkText, paragraph, cards, layout = 'row4', sheet, height = '300vh', variant = 'sticky', children, extra,
}) {
  const { ref, p } = useSectionBase('brand');
  const stickyRef = useRef(null);
  const cardsRef = useRef(null);
  const { isMobile } = useMotionPrefs();
  const [giantFs, setGiantFs] = useState(200);

  useLayoutEffect(() => {
    if (!giant) return undefined;
    const compute = () => {
      const vw = window.innerWidth;
      // 幅にフィット（画面幅の 100%）、上限 22vw
      const fs = Math.min(0.22 * vw, fitGhostFontSize(giant, vw, 0.1, false) / 1.15);
      setGiantFs(fs);
    };
    compute();
    fontsReady().then(compute);
    let t = 0;
    const onResize = () => { clearTimeout(t); t = setTimeout(compute, 150); };
    window.addEventListener('resize', onResize);
    return () => { clearTimeout(t); window.removeEventListener('resize', onResize); };
  }, [giant]);

  const cardsTop = () => {
    const c = cardsRef.current;
    const s = stickyRef.current;
    if (!c || !s) return window.innerHeight * 0.3;
    return c.getBoundingClientRect().top - s.getBoundingClientRect().top - 24;
  };
  useTube(ref, [
    { at: 0, mode: 'brand', topY: 0, bottomY: () => cardsTop(), opacity: 1 },
    { at: 1, mode: 'brand', bottomY: () => cardsTop(), opacity: 1 },
  ]);

  const giantY = useTransform(p, [0, 1], ['-0.45em', '-0.9em']);
  const isFlow = variant === 'flow';
  const latinGiant = giant ? isLatin(giant) : true;

  return (
    <section
      ref={ref}
      className="bp-section"
      data-surface="brand"
      style={{ height: isFlow ? 'auto' : height, minHeight: isFlow ? '100dvh' : undefined, background: 'var(--bp-brand)', color: 'var(--bp-ink-dark)' }}
    >
      <div ref={stickyRef} className={isFlow ? 'relative' : 'bp-sticky'} style={isFlow ? { padding: '12vh 0', minHeight: '100dvh', overflow: 'hidden' } : undefined}>
        {giant && (
          <motion.div
            className={`absolute left-0 whitespace-nowrap font-medium ${latinGiant ? 'font-latin uppercase' : 'palt'}`}
            style={{ top: 0, y: giantY, fontSize: giantFs, lineHeight: 0.85, color: '#fff', zIndex: 0, pointerEvents: 'none', paddingLeft: 'var(--bp-margin)' }}
            aria-hidden="true"
          >
            {giant}
          </motion.div>
        )}
        <SheetNumber n={sheet} style={{ position: 'absolute', left: 'var(--bp-margin)', top: 'calc(100 / 827 * 100vh)', zIndex: 2, color: 'var(--bp-dim-dark)' }} />

        <div
          className={isFlow ? 'relative' : 'absolute inset-0 flex flex-col justify-center'}
          style={{ padding: isFlow ? '0 var(--bp-margin)' : 'calc(120 / 827 * 100vh) var(--bp-margin) 40px', zIndex: 1 }}
        >
          {(label || paragraph) && (
            <div className="flex items-end justify-between" style={{ marginBottom: isMobile ? 24 : 40, gap: 24, flexWrap: 'wrap' }}>
              <div>
                {label && <h2 className="m-0 font-medium palt" style={{ fontSize: isLatin(label) ? 'var(--fs-card-title)' : 'var(--fs-card-title-ja)', lineHeight: 1.2 }}>{label}</h2>}
                {paragraph && <p className="m-0" style={{ marginTop: 10, fontSize: 'var(--fs-body)', lineHeight: 1.7, color: 'var(--bp-ink-dark-muted)', maxWidth: 560 }}>{paragraph}</p>}
              </div>
              {labelTo && (
                <TLink to={labelTo} className="inline-flex items-center font-medium" style={{ fontSize: 14, gap: 10, color: 'var(--bp-ink-dark)', borderBottom: '1px solid currentColor', paddingBottom: 2 }}>
                  {labelLinkText}
                  <span aria-hidden="true">→</span>
                </TLink>
              )}
            </div>
          )}
          <div ref={cardsRef}>
            <ExpertiseCards cards={cards} layout={layout} progress={p} />
          </div>
          {extra}
        </div>
        {children}
      </div>
    </section>
  );
}
