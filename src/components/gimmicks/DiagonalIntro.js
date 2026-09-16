import React, { useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { splitBunsetsu, isLatin } from '../../lib/text/splitText';
import { useWrapperInView } from '../../lib/scroll/useWrapperInView';
import { useMotionPrefs } from '../../lib/motion/MotionPrefsProvider';
import { EASE, T } from '../../lib/motion/timings';

function Block({ text, italicPrefix, startIndex, inView, align, style, reducedMotion }) {
  const parts = useMemo(() => splitBunsetsu(text), [text]);
  const latin = isLatin(text);
  let prefixLeft = italicPrefix || '';
  return (
    <p
      className={`palt ${latin ? 'font-latin' : ''}`}
      style={{
        fontSize: latin ? 'var(--fs-intro)' : 'var(--fs-intro-ja)',
        lineHeight: 1.3,
        fontWeight: 400,
        color: 'var(--bp-ink)',
        textAlign: align,
        margin: 0,
        ...style,
      }}
    >
      {parts.map((w, k) => {
        let italic = false;
        if (prefixLeft && prefixLeft.startsWith(w)) { italic = true; prefixLeft = prefixLeft.slice(w.length); }
        return (
          <motion.span
            key={k}
            className={`inline-block ${italic ? 'skew-italic' : ''}`}
            style={{ marginRight: '.4em', willChange: 'transform' }}
            initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: '.6em' }}
            animate={inView ? { opacity: 1, y: 0 } : undefined}
            transition={reducedMotion ? { duration: 0.2 } : { duration: T.bunsetsu.d, ease: EASE, delay: (startIndex + k) * T.bunsetsu.stagger }}
          >
            {w}
          </motion.span>
        );
      })}
    </p>
  );
}

/**
 * G6: 対角配置（左上 / 右下）+ 文節ステージ出現。
 * @param {{ topLeft: string, bottomRight: string, italicPrefix?: string }} props
 */
export default function DiagonalIntro({ topLeft, bottomRight, italicPrefix }) {
  const ref = useRef(null);
  const inView = useWrapperInView(ref, { amount: 0.3, once: true });
  const { reducedMotion, isMobile } = useMotionPrefs();
  const topCount = useMemo(() => splitBunsetsu(topLeft).length, [topLeft]);
  return (
    <div
      ref={ref}
      className="absolute inset-0"
      style={{
        display: 'grid',
        gridTemplateRows: '1fr 1fr',
        gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
        padding: '0 var(--bp-margin)',
      }}
    >
      <div style={{ gridArea: isMobile ? '1 / 1' : '1 / 1', paddingTop: 'calc(170 / 827 * 100vh)', maxWidth: 'min(56vw, 720px)', minWidth: isMobile ? '100%' : undefined }}>
        <Block text={topLeft} italicPrefix={italicPrefix} startIndex={0} inView={inView} align="left" reducedMotion={reducedMotion} />
      </div>
      <div style={{ gridArea: isMobile ? '2 / 1' : '2 / 2', alignSelf: 'end', justifySelf: 'end', paddingBottom: '10vh', maxWidth: 'min(56vw, 720px)', minWidth: isMobile ? '100%' : undefined }}>
        <Block text={bottomRight} startIndex={topCount} inView={inView} align="right" reducedMotion={reducedMotion} />
      </div>
    </div>
  );
}
