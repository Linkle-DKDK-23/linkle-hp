import React, { useEffect, useRef } from 'react';
import { useMotionValueEvent, useTransform } from 'framer-motion';
import { useSectionBase, nextSectionOf } from './useSectionBase';
import { useTube } from '../gimmicks/TubeController';
import { uiBus } from '../../lib/bus';
import GlyphFountain from '../gimmicks/GlyphFountain';
import SplitFlipText from '../ui/SplitFlipText';
import Pill from '../ui/Pill';
import SheetNumber from '../ui/SheetNumber';
import { useMotionPrefs } from '../../lib/motion/MotionPrefsProvider';
import { isLatin } from '../../lib/text/splitText';

/**
 * 008 ブルー・リキッド相当（ブランド面）。配管 U 字→円環（G13）、噴水（G15）、CONTINUE ピル（G16）、文字二重分割（G17）。
 * @param {{ headingLines?: string[], paragraph?: string, pills?: {label:string,to:string,variant?:string}[], fountain?: boolean, sheet: number, height?: string, fountainRef?: any }} props
 */
export default function LiquidSection({ headingLines, paragraph, pills = [], fountain = false, sheet, height = '200vh', fountainRef }) {
  const { ref, p } = useSectionBase('brand');
  const { isMobile } = useMotionPrefs();
  const localFountain = useRef(null);
  const fRef = fountainRef || localFountain;

  useTube(ref, [
    { at: 0, mode: 'capsule', topY: 0, bottomY: (vh) => vh * 0.39, opacity: 1 },
    { at: 0.2, mode: 'capsule', bottomY: (vh) => vh * 0.39 },
    { at: 0.5, mode: 'ring', topY: -55, bottomY: 0 },
    { at: 1, mode: 'ring', topY: -55, bottomY: 0 },
  ]);

  const rate = useTransform(p, [0, 0.15, 0.7, 1], fountain ? [0, 1, 1, 0] : [0, 0, 0, 0]);
  useMotionValueEvent(p, 'change', (v) => {
    const vis = v < 0.1 ? v / 0.1 : v > 0.8 ? 1 - (v - 0.8) / 0.1 : 1;
    uiBus.continueVisible.set(Math.max(0, Math.min(1, vis)));
  });
  useEffect(() => {
    uiBus.continueTarget.current = nextSectionOf(ref.current);
    return () => uiBus.continueVisible.set(0);
  }, [ref]);

  return (
    <section ref={ref} className="bp-section" data-surface="brand" style={{ height, background: 'var(--bp-brand)', color: 'var(--bp-ink-dark)' }}>
      <div className="bp-sticky">
        <SheetNumber n={sheet} style={{ position: 'absolute', left: 'var(--bp-margin)', top: 'calc(100 / 827 * 100vh)', color: 'var(--bp-dim-dark)' }} />
        {(fountain || fountainRef) && <GlyphFountain ref={fRef} rate={rate} active />}
        {headingLines && (
          <div className="absolute" style={{ left: 'var(--bp-margin)', bottom: isMobile ? 130 : '20vh', maxWidth: isMobile ? '80vw' : 560, zIndex: 2 }}>
            <h2 className="m-0 font-medium" style={{ fontSize: isLatin(headingLines[0]) ? 'var(--fs-section)' : 'var(--fs-section-ja)', lineHeight: 1.15 }}>
              {headingLines.map((l, i) => (
                <SplitFlipText key={i} text={l} colorTop="var(--bp-ink-dark)" colorBottom="var(--bp-white)" trigger="both" as="span" className="block palt" />
              ))}
            </h2>
            {paragraph && <p className="m-0" style={{ marginTop: 20, fontSize: 'var(--fs-body)', lineHeight: 1.7, color: 'var(--bp-ink-dark-muted)' }}>{paragraph}</p>}
            {pills.length > 0 && (
              <div className="flex flex-wrap" style={{ gap: 12, marginTop: 28 }}>
                {pills.map((pl) => (
                  <Pill key={pl.label} variant={pl.variant || 'dark'} to={pl.to}>{pl.label}</Pill>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
