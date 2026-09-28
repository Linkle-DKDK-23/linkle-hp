import React, { useEffect, useState } from 'react';
import { motion, useMotionValueEvent, useTransform } from 'framer-motion';
import { useSectionBase, nextSectionOf } from './useSectionBase';
import { useWrapperInView } from '../../lib/scroll/useWrapperInView';
import { sceneBus, uiBus, crosshairBus } from '../../lib/bus';
import MeterLabels from '../gimmicks/MeterLabels';
import { isLatin } from '../../lib/text/splitText';
import { useMotionPrefs } from '../../lib/motion/MotionPrefsProvider';

const smoothstep = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/**
 * 003 TEAM 相当（300vh）。G7 計測器ラベル / G8 青円ボタン / G9 等高線 / クロスヘア 22vh。
 * @param {{ label?: string, heading: string, headingLines?: string[], paragraph?: string, sheet: number, coords: {x:string,y:string}, arrow?: 'lr'|'down', prevTail?: string, height?: string }} props
 */
export default function TeamSection({
  label, heading, headingLines, paragraph, sheet, coords, arrow = 'lr', prevTail, height = '300vh',
}) {
  const { ref, p } = useSectionBase('dark');
  const inView = useWrapperInView(ref, { margin: '100% 0px 100% 0px' });
  const { reducedMotion, isMobile } = useMotionPrefs();
  const [labels, setLabels] = useState(sceneBus.contourLabels);
  const [active, setActive] = useState(false);

  useMotionValueEvent(p, 'change', (v) => {
    sceneBus.team.set(v);
    const rot = arrow === 'down' ? 90 + 90 * v : 180 * v;
    uiBus.blueRotate.set(reducedMotion ? (v < 0.5 ? (arrow === 'down' ? 90 : 0) : 180) : rot);
    const op = v < 0.08 ? v / 0.08 : v > 0.85 ? 1 - (v - 0.85) / 0.15 : 1;
    uiBus.blueOpacity.set(Math.max(0, Math.min(1, op)));
    const target = v >= 0.3 && v <= 0.7 ? 22 : 49;
    if (crosshairBus.y.get() !== target && crosshairBus.y.get() !== 93) crosshairBus.y.set(target);
    if (v > 0.02 && !active) setActive(true);
  });

  useEffect(() => {
    sceneBus.setVisible('teamVisible', inView);
    if (inView) uiBus.blueTarget.current = nextSectionOf(ref.current);
    return () => {
      sceneBus.setVisible('teamVisible', false);
      uiBus.blueOpacity.set(0);
    };
  }, [inView, ref]);

  useEffect(() => sceneBus.subscribe((b) => setLabels(b.contourLabels)), []);

  const textOpacity = useTransform(p, (v) => 1 - smoothstep(0.62, 0.85, v));
  const tailOpacity = useTransform(p, (v) => (prevTail ? 0.4 * (1 - smoothstep(0.1, 0.25, v)) : 0));
  const labelOpacity = useTransform(p, (v) => 0.9 * smoothstep(0.05, 0.3, v) * (1 - smoothstep(0.9, 1, v)));
  const lines = headingLines || [heading];
  const latin = isLatin(heading);

  return (
    <section ref={ref} className="bp-section" data-surface="dark" style={{ height }}>
      <div className="bp-sticky">
        <MeterLabels sheet={sheet} coords={coords} active={active} />

        {/* 右上見出し（字間 .5em） */}
        <motion.div className="absolute text-right" style={{ right: 'var(--bp-margin)', top: 'calc(140 / 827 * 100vh)', opacity: textOpacity, zIndex: 2 }}>
          {label && <span className="text-label block" style={{ color: 'var(--bp-ink-muted)', marginBottom: 14, textTransform: 'none', letterSpacing: '.08em' }}>{label}</span>}
          <h2
            className={`m-0 font-medium ${latin ? 'font-latin uppercase' : 'palt'}`}
            style={{ fontSize: latin ? 'var(--fs-section)' : 'var(--fs-section-ja)', letterSpacing: '.5em', marginRight: '-.5em', lineHeight: 1.1, color: 'var(--bp-ink)' }}
          >
            {lines.map((l, i) => <span key={i} className="block">{l}</span>)}
          </h2>
        </motion.div>

        {/* 右下段落 */}
        {paragraph && (
          <motion.p
            className="absolute m-0 text-right"
            style={{ right: 'var(--bp-margin)', bottom: isMobile ? 120 : 60, width: isMobile ? '70vw' : 312, fontSize: 'var(--fs-body)', lineHeight: 1.7, color: 'var(--bp-ink)', opacity: textOpacity, zIndex: 2 }}
          >
            {paragraph}
          </motion.p>
        )}

        {/* 前セクション末尾（灰） */}
        {prevTail && (
          <motion.span
            className="absolute palt"
            style={{ left: 'var(--bp-margin)', bottom: 120, fontSize: 'var(--fs-intro-ja)', color: 'var(--bp-ink-muted)', opacity: tailOpacity, lineHeight: 1.3 }}
            aria-hidden="true"
          >
            {prevTail}
          </motion.span>
        )}

        {/* 標高ラベル（等高線に沿った数字。DOM で置く） */}
        {!isMobile && labels.map((l, i) => (
          <motion.span
            key={i}
            className="text-label absolute"
            style={{ left: `${l.x * 100}%`, top: `${l.y * 100}%`, opacity: labelOpacity, color: 'var(--cur-dim)' }}
            aria-hidden="true"
          >
            {String(Math.round(l.value * 100)).padStart(4, '0')}
          </motion.span>
        ))}
      </div>
    </section>
  );
}
